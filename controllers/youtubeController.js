// controllers/youtubeController.js
const YoutubeService = require('../services/youtubeService');

class YoutubeController {
    constructor() {
        this.youtubeService = new YoutubeService();
    }

    async download(req, res) {
        try {
            const { url } = req.query;
            if (!url) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing URL parameter'
                });
            }
            if (!url.includes('youtu')) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid YouTube URL'
                });
            }

            console.log(`Processing YouTube URL: ${url}`);
            const result = await this.youtubeService.extractVideoUrl(url);

            if (result.success) {
                return res.status(200).json({
                    success: true,
                    data: result.data
                });
            } else {
                return res.status(500).json({
                    success: false,
                    error: result.error || 'Failed to extract video URL'
                });
            }

        } catch (error) {
            console.error('YouTube controller error:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
}

module.exports = YoutubeController;
