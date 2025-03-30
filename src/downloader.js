const fs = require('fs');
const axios = require('axios');
const path = require('path');

async function downloadImage(url, index) {
    try {
        const res = await axios.get(url, { responseType: "stream" });
        const ext = path.extname(new URL(url).pathname) || '.jpg';
        const filename = `${index + 1}${ext}`;
        const dir = path.join(__dirname, '..', 'downloads');
        const filepath = path.join(dir, filename);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        await new Promise((resolve, reject) => {
            const stream = fs.createWriteStream(filepath);
            res.data.pipe(stream);
            stream.on('finish', resolve);
            stream.on('error', reject);
        });

        console.log(`Meme downloaded: ${filename}`);
    } catch (error) {
        console.error(`Error downloading image at index ${index}: ${url}\n`, error.message);
    }
}

module.exports = downloadImage;


module.exports.download = async (urls) => {
    for (let i = 0; i < urls.length; i++) {
        await downloadImage(urls[i], i);
    }
};
