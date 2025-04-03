const { HfInference } = require('@huggingface/inference');

// require('dotenv').config();
const hf = new HfInference(process.env.HF_API_KEY);

module.exports.checkContentSafety = async (imagePath) => {
    try {
        const result = await hf.imageClassification({
            model: "Falconsai/nsfw_image_detection",
            image: imagePath,
        });

        const normal = result.find(item => item.label === 'normal').score;
        const nsfw = result.find(item => item.label === 'nsfw').score;

        console.log('Content safety check result:', `${(normal*100).toFixed(2)}% safe`, `${(nsfw*100).toFixed(2)}% nsfw`);

        // return normal > nsfw;
        return nsfw < 0.3;
    } catch (error) {
        console.error('Error checking content safety for ' + imagePath + ':', error.message);
        return false;
    }
};
