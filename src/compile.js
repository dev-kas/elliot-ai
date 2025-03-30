const ffmpeg = require('fluent-ffmpeg');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { wait } = require('../util/wait');

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

    await concatMP4(
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


function concatMP4(inputPaths, outputPath) {
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
