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
                    content: `You will be given a joke from "${src}", and your task is to transform it into a short, humorous, and engaging story. The story should be:
- Between 75-125 words (concise but entertaining).
- Funny to the average person (not just tech geeks).
- Suitable for all ages (lighthearted, no dark humor).
- Ending with a punchline (to maintain the joke’s essence).
You must ONLY return the story—no explanations, formatting, or introductions. Your writing should keep a snappy pace, feel natural, and emphasize the humor of the original joke.\n
Joke:\n"${joke}"\n
Now, craft the story.`
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


