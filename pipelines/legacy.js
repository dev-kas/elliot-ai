const { reddit, memedroid, nineGag } = require('../src/scraper');
const { download } = require('../src/downloader');
const { randChoice, randInt } = require('../util/random');
const { checkContentSafety } = require('../src/contentSafety');
const { compile } = require('../src/compile');
const { upload } = require('../src/upload');
const { cleanup } = require('../src/cleanup');

module.exports = {
    name: 'legacy',
    weight: 0.1,
    activate: async () => {
        const allMemes = [
            ...(await reddit()).map(meme => meme.url),
            ...(await memedroid()),
            ...(await nineGag())
        ];
    
        const randomMemes = Array.from({ length: randInt(4, 9) }, () => randChoice(allMemes));
        console.log('Random memes:', randomMemes);
        
        console.log('Filtering memes and removing unsafe content...');
        const safeMemes = [];
        for (const meme of randomMemes) {
            const isSafe = await checkContentSafety(meme);
            if (!isSafe) {
                console.log(`Meme ${meme} is not safe for work.`);
                continue;
            }
            console.log(`Meme ${meme} is safe for work.`);
            safeMemes.push(meme);
        }
        console.log(`Downloading ${safeMemes.length} memes...`);
        await download(safeMemes);
        console.log('Download completed.');
        console.log('Compiling memes...');
        await compile();
        console.log('Compilation completed.');
        console.log('Uploading memes to YouTube...');
        await upload().then((url) => {
            console.log('Upload completed.');
            console.log('Video URL:', url);
        }).catch(err => {
            console.error('Error uploading video:', err);
        });
        await cleanup();
        console.log('All tasks completed.');
    }
}