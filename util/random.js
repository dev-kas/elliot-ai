module.exports.randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
module.exports.randChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];