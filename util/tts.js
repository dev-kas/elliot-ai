const axios = require("axios");
const path = require("node:path");

module.exports.saveSpeech = async (text, model = "tts_models/en/vctk/vits", speaker = "p226", output = path.resolve(__dirname, "../../output/audio.mp3")) => {
    if (text == null) return;
    text = text.replace(/[^a-zA-Z0-9,.$€£%]/g, '');

    const res = await axios.post("http://localhost:5500/tts", { text, model, speaker, output });
    if (res.status !== 200) {
        console.error("Error:", res.status, res.data.output);
        return;
    }
    console.log("Speech saved to:", res.data.output);
};
