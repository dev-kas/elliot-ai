const { randomJoke } = require("../src/scraper");
const story_generator = require("../util/generateStory");
const { saveSpeech } = require("../util/tts");
const { randChoice, randInt, randChoiceWithWeight } = require("../util/random");
const { concatMP4, mixAudioVideo, reEncode } = require("../src/compile");
const ffmpeg = require("fluent-ffmpeg");
const path = require("node:path");
const fs = require("node:fs");
const { wait } = require("../util/wait");
const { upload } = require("../src/upload");
const { cleanup } = require("../src/cleanup");
const { getFileTag, getFilesByTag, getTagsInDir } = require("../util/tagSystem");

module.exports = {
    name: "jokes",
    weight: 9,
    activate: async () => {
        let url;
        console.log("Obtaining a random joke...");
        const { src, joke } = await randomJoke();

        console.log("Generating a short story on the joke...");
        const story = await story_generator(src, joke);
        console.log("Generated story:", story);

        console.log("Generating speech...");
        await saveSpeech(story);
        const duration = await new Promise((resolve, reject) => {
            ffmpeg.ffprobe(path.join(__dirname, "..", "output", "audio.mp3"), (err, data) => {
                if (err) {
                    console.error(err);
                    reject();
                }
                const duration = data.format.duration;
                resolve(duration);
            });
        })
        console.log("Speech generated. Length:", duration, "seconds");

        const clipsTags = getTagsInDir(path.join(__dirname, "..", "clips"));
        let tagWeights = {};

        try {
            let weights = fs.readFileSync(path.join(__dirname, "..", "tag-weights.json"), "utf-8");
            weights = JSON.parse(weights);

            tagWeights = weights;
        } catch (error) {
            console.error("Error loading tag weights:", error.message, "Generating default tag weights.");
            tagWeights = {};
            for (const tag of clipsTags) {
                tagWeights[tag] = 1;
            }
        }

        for (const tag of clipsTags) {
            if (!tagWeights[tag]) {
                tagWeights[tag] = 2;
            }
        }
        
        for (const tag in tagWeights) {
            if (!clipsTags.includes(tag)) {
                delete tagWeights[tag];
            }
        }        

        const { choice: tag, weights: newTagWeights } = randChoiceWithWeight(clipsTags, clipsTags.map(t => tagWeights[t]));

        for (let i = 0; i < clipsTags.length; i++) {
            tagWeights[clipsTags[i]] = newTagWeights[i];
        }

        fs.writeFileSync(path.join(__dirname, "..", "tag-weights.json"), JSON.stringify(tagWeights, null, 4), "utf-8");

        const clips = getFilesByTag(path.join(__dirname, "..", "clips"), tag);
        const clip = path.resolve(path.join(__dirname, "..", "clips", randChoice(clips)));
        console.log("Selected clip:", clip);

        if (!fs.existsSync(clip)) {
            console.error("Clip not found:", clip);
            return;
        }

        await new Promise((resolve, reject) => {
            ffmpeg(clip)
            .setStartTime(randInt(0, 10))
            .duration(duration)
            .save(path.join(__dirname, "..", "output", "video.mp4"))
            .on('end', () => {
                console.log("Clip extraction complete! Output saved to:", path.join(__dirname, "..", "output", "video.mp4"));
                resolve();
            })
            .on('error', err => {
                console.error("Clip extraction error:", err.message);
                reject(err);
            });
        });
        
        console.log("Mixing video and audio...");
        await mixAudioVideo(path.join(__dirname, "..", "output", "audio.mp3"), path.join(__dirname, "..", "output", "video.mp4"), path.join(__dirname, "..", "output", "merged.mp4"));

        console.log("Re-encoding video...");
        await reEncode(path.join(__dirname, "..", "output", "merged.mp4"), path.join(__dirname, "..", "output", "merged_re_encoded.mp4"));
        console.log("Re-encoding complete!");

        console.log("Re-encoding outro...");
        await reEncode(path.join(__dirname, "..", "assets", "outro.mp4"), path.join(__dirname, "..", "output", "outro_re_encoded.mp4"));
        console.log("Re-encoding complete!");

        console.log("Concatenating MP4 files...");
        await concatMP4([path.join(__dirname, "..", "output", "merged_re_encoded.mp4"), path.join(__dirname, "..", "output", "outro_re_encoded.mp4")], path.join(__dirname, "..", "output", "final.mp4"));
        await wait(1000);
        console.log("Re-encoding final video...");
        await reEncode(path.join(__dirname, "..", "output", "final.mp4"), path.join(__dirname, "..", "output", "final_re_encoded.mp4"), "scale");
        console.log("Re-encoding complete!");

        console.log("Uploading to YouTube...");
        url = await upload(null, null, null, "final_re_encoded.mp4");
        console.log("Upload complete! URL:", url ?? "Error obtaining URL");
        await wait(10000);
        console.log("Cleaning up...");
        await cleanup();
        console.log("Cleanup complete!");
    }
}