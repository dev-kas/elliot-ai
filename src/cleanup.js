const fs = require('fs');
const path = require('path');

module.exports.cleanup = async function () {
    const dirs = [
        path.join(__dirname, '..', 'downloads'),
        path.join(__dirname, '..', 'processor'),
        path.join(__dirname, '..', 'output'),
    ];

    const files = [
        path.join(__dirname, '..', 'concat_list.txt'),
    ];
    
    const dirsList = dirs.flatMap(dir => fs.existsSync(dir) ? fs.readdirSync(dir).map(file => path.join(dir, file)) : [] );
    const allFiles = [...dirsList, ...files];
    
    for (const file of allFiles) {
        if (fs.statSync(file).isDirectory()) {
            console.log('Skipping directory:', file);
            continue;
        }
        fs.unlinkSync(file);
        console.log('Deleted:', file);
    }
}
