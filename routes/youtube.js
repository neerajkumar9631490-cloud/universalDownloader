// routes/youtube.js
const express = require('express');
const router = express.Router();
const YoutubeController = require('../controllers/youtubeController');

const youtubeController = new YoutubeController();

router.get('/download', (req, res) => {
    youtubeController.download(req, res);
});

module.exports = router;
