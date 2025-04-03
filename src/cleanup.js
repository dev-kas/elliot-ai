const fs = require('fs');
const path = require('path');

module.exports.cleanup = async function () {
    const dirs = [
        path.join(__dirname, '..', 'downloads'),
        path.join(__dirname, '..', 'processor'),
        path.join(__dirname, '..', 'output'),
    ].filter(fs.existsSync);

    const files = [
        path.join(__dirname, '..', 'concat_list.txt'),
    ].filter(fs.existsSync);

    const dirsList = dirs.flatMap(dir => {
        try {
            return fs.readdirSync(dir).map(file => path.join(dir, file));
        } catch (error) {
            if (!error) return [];
            console.warn(`Skipping inaccessible directory: ${dir}`);
            return [];
        }
    });

    const allFiles = [...dirsList, ...files];

    for (const file of allFiles) {
        try {
            if (!fs.existsSync(file)) {
                console.log('Skipping non-existent file:', file);
                continue;
            }

            if (fs.statSync(file).isDirectory()) {
                console.log('Skipping directory:', file);
                continue;
            }

            fs.unlinkSync(file);
            console.log('Deleted:', file);
        } catch (error) {
            console.error(`Error processing ${file}:`, error.message);
        }
    }
};
