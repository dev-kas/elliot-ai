const path = require("node:path");
const fs = require("node:fs");

const isValidFile = (file) => {
    return !file.startsWith('.') && file.includes('_');
};

module.exports.getFileTag = (filePath) => {
    const fileName = path.basename(filePath);
    const tag = fileName.split("_")[0];
    return tag;
};

module.exports.getFilesByTag = (dirPath, tag) => {
    const files = fs.readdirSync(dirPath);
    const filteredFiles = files.filter((file) => {
        const fileName = path.basename(file);
        if (!isValidFile(fileName)) return false;
        const fileTag = fileName.split("_")[0];
        return fileTag === tag;
    });
    return filteredFiles;
};

module.exports.getTagsInDir = (dirPath) => {
    const files = fs.readdirSync(dirPath);
    const tags = new Set();
    files.forEach((file) => {
        const fileName = path.basename(file);
        if (!isValidFile(fileName)) return;
        const tag = fileName.split("_")[0];
        tags.add(tag);
    });
    return Array.from(tags);
};
