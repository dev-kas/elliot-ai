const puppeteer = require('puppeteer');
const axios = require('axios');
// const fs = require('fs');
// const path = require('path');
const { wait } = require('../util/wait');
const { randChoice } = require('../util/random');

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
            const { title, url } = post.data;
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
        // eslint-disable-next-line no-undef
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
        // eslint-disable-next-line no-undef
        await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        await wait(3000)

        let newImages = await page.evaluate(() => 
            // eslint-disable-next-line no-undef
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

module.exports.randomJoke = async () => {
    const apis = [
        {
            name: 'icanhazdadjoke',
            activate: async () => {
                const response = await axios.get('https://icanhazdadjoke.com/', {
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                return response.data.joke;
            }
        },
        {
            name: 'Chuck Norris',
            activate: async () => {
                const response = await axios.get('https://api.chucknorris.io/jokes/random');
                return response.data.value;
            }
        },
        {
            name: 'Joke API',
            activate: async () => {
                const response = await axios.get('https://v2.jokeapi.dev/joke/Any');
                if (response.data.type === 'twopart') {
                    return `${response.data.setup} - ${response.data.delivery}`;
                } else {
                    return response.data.joke;
                }
            }
        },
        {
            name: 'Official Joke API',
            activate: async () => {
                const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
                return response.data.setup + ' - ' + response.data.punchline;
            }
        },
        {
            name: 'Geek Jokes',
            activate: async () => {
                const response = await axios.get('https://geek-jokes.sameerkumar.website/api?format=json');
                return response.data.joke;
            }
        }
    ]
    const api = randChoice(apis);

    console.log(`Selected joke source: ${api.name}`);
    const joke = await api.activate();
    console.log(`Joke from ${api.name}: ${joke}`);

    return {
        src: api.name,
        joke
    };
};
