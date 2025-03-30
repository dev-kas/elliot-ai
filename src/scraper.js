const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { wait } = require('../util/wait');

module.exports.reddit = async () => {
    // return JSON.parse(fs.readFileSync(
    //     path.join(__dirname, 'reddit.json'),
    //     'utf-8'
    // ));

    const redditMemes = await axios.get('https://www.reddit.com/r/memes/top.json?limit=100');
    const dankMemes = await axios.get('https://www.reddit.com/r/dankmemes/top.json?limit=100');
    const programmingHumor = await axios.get('https://www.reddit.com/r/programminghumor/top.json?limit=100');

    const memes = [...redditMemes.data.data.children, ...dankMemes.data.data.children, ...programmingHumor.data.data.children]
        .map((post) => {
            const { title, url, is_video } = post.data;
            if (url.endsWith('.gif') || url.endsWith('.png') || url.endsWith('.jpg')) {
                return { title, url };
            }
            return null;
        })
        .filter(meme => meme !== null);

    // fs.writeFileSync(
    //     path.join(__dirname, 'reddit.json'),
    //     JSON.stringify(memes, null, 4),
    //     'utf-8'
    // );

    return memes;
};

module.exports.memedroid = async () => {
    // return JSON.parse(fs.readFileSync(
    //     path.join(__dirname, 'memedroid.json'),
    //     'utf-8'
    // ));

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto('https://memedroid.com', { waitUntil: "networkidle2" });

    const memes = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.gallery-item img.img-responsive')).map(img => img.src).filter(src => src.includes("https"));
    });

    // fs.writeFileSync(
    //     path.join(__dirname, 'memedroid.json'),
    //     JSON.stringify(memes, null, 4),
    //     'utf-8'
    // );

    await browser.close();
    return memes;
};

module.exports.nineGag = async () => {
    // return JSON.parse(fs.readFileSync(
    //     path.join(__dirname, '9gag.json'),
    //     'utf-8'
    // ));

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto('https://9gag.com/funny', { waitUntil: "networkidle2" });

    const memes = new Set();

    for (let i = 0; i < 10; i++) {
        await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        await wait(3000)

        let newImages = await page.evaluate(() => 
            Array.from(document.querySelectorAll('img'))
                .map(img => img.src)
                .filter(src => src.includes('https://img-9gag-fun.9cache.com/'))
        );

        newImages.forEach(img => memes.add(img));
    }

    const memesArray = Array.from(memes);

    // fs.writeFileSync(
    //     path.join(__dirname, '9gag.json'),
    //     JSON.stringify(memesArray, null, 4),
    //     'utf-8'
    // );

    await browser.close();
    return memesArray;
}
