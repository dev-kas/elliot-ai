require('dotenv').config();

const { randChoiceWithWeight } = require('./util/random');
const fs = require("node:fs");
const path = require("node:path");

const pipelines = [];

for (const file of fs.readdirSync(path.join(__dirname, 'pipelines'))) {
    const pipeline = require(path.join(__dirname, 'pipelines', file));
    pipelines.push(pipeline);
}

(async () => {
    const pipeline = randChoiceWithWeight(pipelines, pipelines.map(p => p.weight)).choice;
    console.log("Selected pipeline:", pipeline.name);
    // if (pipeline.name === "jokes") { // skip legacy while testing.
        try {
            await pipeline.activate();
        } catch (error) {
            console.error("Error running pipeline:", error.message);
            process.exit(1);
        }
    // }
})();

