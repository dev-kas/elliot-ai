import { google } from "googleapis";
import readline from "readline";

import dotenv from "dotenv";
dotenv.config();

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
  "http://localhost"
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: ["https://www.googleapis.com/auth/youtube.upload"],
});

console.log("Open this URL:", authUrl);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question("Enter the code from the URL: ", async (code) => {
  const { tokens } = await oauth2Client.getToken(code);
  console.log("Refresh Token:", tokens.refresh_token);
  rl.close();
});
