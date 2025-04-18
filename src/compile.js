const ffmpeg = require('fluent-ffmpeg');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

module.exports.compile = async () => {
    const inputDir = path.join(__dirname, "..", "downloads");
    const processorDir = path.join(__dirname, "..", "processor");
    const outputDir = path.join(__dirname, "..", "output");

    for (const file of fs.readdirSync(inputDir)) {
        const ext = path.extname(file).toLowerCase();
        const baseName = path.basename(file, ext);
        const inputPath = path.join(inputDir, file);
        const outputPath = path.join(processorDir, `${baseName}.jpg`);

        console.log(`Converting file to JPG: ${file}`);

        const metadata = await sharp(inputPath).metadata();
        const newWidth = Math.floor(metadata.width / 2) * 2;
        const newHeight = Math.floor(metadata.height / 2) * 2;
        await sharp(inputPath)
            .resize(newWidth, newHeight)
            .toFile(outputPath);
    }

    for (const file of fs.readdirSync(processorDir)) {
        const ext = path.extname(file).toLowerCase();
        const baseName = path.basename(file, ext);
        const inputPath = path.join(processorDir, file);
        const outputPath = path.join(outputDir, `${baseName}.mp4`);

        console.log(`Converting file to MP4: ${file}`);

        await processJPG(inputPath, outputPath);
    }

    console.log("Merging all MP4 files...")

    await module.exports.concatMP4(
        fs.readdirSync(outputDir).map(file => path.join(outputDir, file)),
        path.join(outputDir, 'output.mp4')
    );
};

function processJPG(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(inputPath)
            .loop(1)
            .outputOptions('-t 4')
            .save(outputPath)
            .on('end', () => {
                console.log(`Conversion complete: ${outputPath}`);
                resolve();
            })
            .on('error', err => {
                console.error('Error:', err);
                reject(err);
            });
    });
}

module.exports.concatMP4 = async (inputPaths, outputPath) => {
    return new Promise((resolve, reject) => {
        console.log('Concatenating MP4 files:', inputPaths, outputPath);
        if (inputPaths.length < 2) {
            console.error('Error: At least two input files are required.', inputPaths);
            reject(new Error('At least two input files are required.'));
            return;
        }

        const fileList = 'concat_list.txt';
        fs.writeFileSync(fileList, inputPaths.map(p => `file '${p}'`).join('\n'));

        ffmpeg()
            .input(fileList)
            .inputOptions(['-f concat', '-safe 0'])
            .outputOptions(['-c copy'])
            .on('error', err => {
                console.error('FFmpeg Error:', err.message);
                reject(err);
            })
            .on('end', () => {
                console.log(`Merging complete! Output saved to: ${outputPath}`);
                resolve();
            })
            .save(outputPath);
    });
}

module.exports.mixAudioVideo = (audioPath, videoPath, outputPath) => {
    if (!fs.existsSync(audioPath)) {
        console.error(`Error: Audio file not found at ${audioPath}`);
        return;
    }

    if (!fs.existsSync(videoPath)) {
        console.error(`Error: Video file not found at ${videoPath}`);
        return;
    }

    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(videoPath)
            .input(audioPath)
            .audioCodec('aac')
            .audioChannels(2)
            .audioBitrate('128k')
            .complexFilter(['[1:a]volume=2.0[a]'])
            .outputOptions(['-map', '0:v', '-map', '[a]'])
            .output(outputPath)
            .on('error', err => {
                console.error('AudioVideo Mix Error:', err.message);
                reject(err);
            })
            .on('end', () => {
                console.log(`AudioVideo Mix complete! Output saved to: ${outputPath}`);
                resolve();
            })
            .run();
    });
};

module.exports.reEncode = (inputPath, outputPath, mode = "crop") => {
    if (!fs.existsSync(inputPath)) {
        console.error(`Error: Input file not found at ${inputPath}`);
        return;
    }

    if (!["crop", "scale"].includes(mode)) {
        console.error(`Error: Invalid mode ${mode}`);
        return;
    }

    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .videoFilter([
                'scale=1080:1920:force_original_aspect_ratio=decrease',
                mode === "crop" && 'crop=ih*9/16:ih',
                mode === "scale" && 'pad=ih*9/16:ih'
            ].filter(Boolean))
            .videoCodec('libx264')
            .audioCodec('aac')
            .outputOptions([
                '-crf 23',
                '-b:a 128k'
            ])
            .save(outputPath)
            .on('end', () => resolve())
            .on('error', (err) => reject(err));

    });
}
