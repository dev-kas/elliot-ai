if (require.main === module) require("dotenv").config();

const { execSync } = require("node:child_process");
const path = require("node:path");

module.exports.saveSpeech = (text, model = "tts_models/en/vctk/vits", speaker = "p226", output = path.resolve(__dirname, "../../output/audio.mp3")) => {
    if (text == null) return;
    text = text.replace(/(["\\])/g, '\\$1');

    const python = path.resolve(__dirname, '../../.venv/bin/python');
    output = path.resolve(__dirname, output);
    const file = path.resolve(__dirname, "tts.py");
    const command = `${python} ${file} "${text}" "${model}" "${speaker}" "${output}"`;
    try {
        execSync(command, { stdio: ["ignore", "ignore", "inherit"] });
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};
