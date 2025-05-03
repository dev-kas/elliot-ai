const { google } = require("googleapis");
const http = require("http");

require("dotenv").config();

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: ["https://www.googleapis.com/auth/youtube.upload"],
});

http.createServer(async (req, res) => {
  if (req.url.charAt(1) == "?") {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const code = url.searchParams.get("code");
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Authorization successful! You can close this window.");
    console.log("Code received:", code);
    const { tokens } = await oauth2Client.getToken(code);
    console.log("Refresh Token:", tokens.refresh_token);
    process.exit(0);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found " + req.url);
  }
}).listen(80, () => {
  console.log(`Server is running on ${process.env.REDIRECT_URI}:80`);
  console.log("Open this URL:", authUrl);
});
