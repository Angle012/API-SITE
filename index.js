const express = require('express');
const ytSearch = require('yt-search');
const { exec } = require('child_process');
const app = express();

const PORT = process.env.PORT || 3000;

// Search function
async function searchYT(query) {
    const r = await ytSearch(query);
    return r.videos[0];
}

app.get('/', (req, res) => res.send("API is Running...🚀"));

// MP3 Download
app.get('/api/ytmp3', async (req, res) => {
    const text = req.query.text;
    if (!text) return res.status(400).send("Text parameter is required");

    try {
        const video = await searchYT(text);
        res.header('Content-Disposition', `attachment; filename="${video.title}.mp3"`);
        
        // yt-dlp භාවිතයෙන් audio stream කිරීම
        const cmd = `yt-dlp -f bestaudio -o - "${video.url}"`;
        exec(cmd).stdout.pipe(res);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

// MP4 1080p Download
app.get('/api/ytmp4', async (req, res) => {
    const text = req.query.text;
    if (!text) return res.status(400).send("Text parameter is required");

    try {
        const video = await searchYT(text);
        res.header('Content-Disposition', `attachment; filename="${video.title}.mp4"`);

        // 1080p සඳහා command එක
        const cmd = `yt-dlp -f "bestvideo[height<=1080]+bestaudio/best[height<=1080]" --merge-output-format mp4 -o - "${video.url}"`;
        exec(cmd).stdout.pipe(res);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
