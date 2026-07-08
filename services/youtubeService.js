// services/youtubeService.js
const axios = require('axios');
const qs = require('querystring');

class YoutubeService {
    constructor() {
        this.apiUrl = 'https://api.vidssave.com/api/contentsite_api/media/parse';
        this.headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 16; RMX5108 Build/UKQ1.231108.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/149.0.7827.159 Mobile Safari/537.36',
            'Referer': 'https://vidssave.com/index-2qa'
        };
    }

    async extractVideoUrl(youtubeUrl) {
        try {
            const requestData = {
                auth: '20250901majwlqo',
                domain: 'api-ak.vidssave.com',
                origin: 'source',
                link: youtubeUrl
            };

            const response = await axios.post(this.apiUrl, qs.stringify(requestData), {
                headers: this.headers
            });

            if (response.data.status !== 1) {
                throw new Error(`API Error: ${response.data.status_code || 'Unknown error'}`);
            }

            const videoUrls = this.extractVideoUrlsFromResponse(response.data);
            if (videoUrls.length === 0) {
                throw new Error('No video URLs found in the response');
            }

            const selectedVideo = this.selectBestQuality(videoUrls);
            if (!selectedVideo) {
                throw new Error('Could not find a suitable video URL');
            }

            return {
                success: true,
                data: {
                    downloadUrl: selectedVideo.url,
                    quality: selectedVideo.quality,
                    format: selectedVideo.format,
                    title: response.data.data?.title || 'Unknown Title',
                    thumbnail: response.data.data?.thumbnail || ''
                }
            };

        } catch (error) {
            console.error('YouTube extraction error:', error.message);
            return {
                success: false,
                error: error.message || 'Failed to extract video URL'
            };
        }
    }

    extractVideoUrlsFromResponse(responseData) {
        const videoUrls = [];

        if (responseData.data && responseData.data.media) {
            for (const media of responseData.data.media) {
                if (media.type === 'video' && media.resources) {
                    for (const resource of media.resources) {
                        if (resource.download_url && resource.download_url.includes('googlevideo.com')) {
                            videoUrls.push({
                                quality: resource.quality || '',
                                url: resource.download_url,
                                format: resource.format || 'MP4',
                                size: resource.size || 0
                            });
                        }
                    }
                }
            }
        }

        if (videoUrls.length === 0 && responseData.data && responseData.data.resources) {
            for (const resource of responseData.data.resources) {
                if (resource.type === 'video' && resource.download_url && resource.download_url.includes('googlevideo.com')) {
                    videoUrls.push({
                        quality: resource.quality || '',
                        url: resource.download_url,
                        format: resource.format || 'MP4',
                        size: resource.size || 0
                    });
                }
            }
        }

        return videoUrls;
    }

    selectBestQuality(videoUrls) {
        const priorityQualities = ['360P', '480P', '720P'];
        
        for (const targetQuality of priorityQualities) {
            const found = videoUrls.find(v => v.quality === targetQuality);
            if (found) return found;
        }

        const qualityPriority = {
            '1080P': 6, '720P': 5, '480P': 4, '360P': 3, '240P': 2, '144P': 1
        };
        const sortedVideos = videoUrls.sort((a, b) => 
            (qualityPriority[b.quality] || 0) - (qualityPriority[a.quality] || 0)
        );
        const best = sortedVideos[0];
        console.log(`Note: Preferred qualities not available. Using ${best.quality}`);
        return best;
    }
}

module.exports = YoutubeService;
