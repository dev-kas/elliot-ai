const { CohereClientV2 } = require("cohere-ai");

const client = new CohereClientV2({ token: process.env.COHERE_TOKEN }); 

const generateStory = async (src, joke) => {
    // Hardcoded for testing purposes. Essentially to get rid of api usage limits.
    // return `During a team-building exercise, Chuck Norris strolled into the conference room, eyeing the motivational poster that read, “There’s no ‘I’ in team.” With a smirk, he grabbed a marker and crossed out the “I.” The team leader chuckled, “Good point, Chuck, but why—” Before he could finish, Chuck whipped out a spoon and dramatically gouged out the “I” from the poster, leaving a gaping hole. The room fell silent. “There,” Chuck declared. “Now there’s no ‘I’ in team. Or the poster.” The team leader sighed, “Chuck, that was a custom print. It cost $200.” Chuck simply grinned. “Next time, use cheaper materials.”`

    try {
        const story = await client.chat({
            model: "command-a-03-2025",
            temperature: 0.7,
            messages: [
                {
                    role: "system",
                    content: "Do exactly what the user says."
                },
                {
                    role: "user",
                    content: `You will be given a joke from "${src}". Your mission:
 - Explode the joke into a fast, ridiculous, and funny micro-story. 
 - Keep it 35-70 words (short attention spans).  
 - The story must be chaotic, exaggerated, and punchy (every line should feel like a slap).  
 - It must start instantly (no build-up) and end with a savage punchline.
 - Lighthearted, meme-worthy tone — think "cartoon logic," not "boring sitcom."
 - Return ONLY the story — no explanation, no filler.\n
Joke:\n"${joke}"`
                }
            ]
        });
        return story.message.content[0].text;
    } catch (error) {
        console.error(error.message);
        return null;
    }
}

module.exports = generateStory;


