const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN
});

const youtube = google.youtube({
    version: 'v3',
    auth: oauth2Client
});

module.exports.upload = async (title, description, tags, file) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = new Date().toLocaleDateString('en-GB', options).replace(/\b(\d{1,2})\b/, (d) => {
        const suffixes = ['th', 'st', 'nd', 'rd'];
        const relevant = (d > 3 && d < 21) ? 'th' : suffixes[d % 10] || 'th';
        return `${d}${relevant}`;
    });

    const res = await youtube.videos.insert({
        part: 'snippet,status',
        requestBody: {
            snippet: {
                title: title || `Your Daily Dose of Memes for ${formattedDate}`,
                description: description || `😂 *Daily Dose of Memes for ${formattedDate}!* 😂  

A fresh compilation of memes from across the internet. If you enjoy the content, hit *Subscribe* and turn on notifications for your daily meme fix!  

📌 *Sources:* Reddit, Memedroid, 9Gag.com  

🤖 *AI Moderation:* This video uses AI to filter and moderate content. If any meme was misclassified, please contact us for corrections.  

⚠️ *Disclaimer:* This video is for entertainment purposes only. Memes are used under fair use. If you own any content and want it removed, please contact us.`,
                tags: tags || ['funny', 'memes'],
                categoryId: '23'
            },
            status: {
                privacyStatus: 'public'
            }
        },
        media: {
            body: fs.createReadStream(path.join(__dirname, '..', 'output', file || 'output.mp4'))
        }
    });
    return res?.data?.id ? `https://www.youtube.com/watch?v=${res.data.id}` : null;
}
