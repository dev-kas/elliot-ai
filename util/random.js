module.exports.randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

module.exports.randChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

module.exports.randChoiceWithWeight = (arr, weights) => {
    if (arr.length !== weights.length) {
        throw new Error("Array and weights must have the same length.");
    }

    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  
    const random = Math.random() * totalWeight;
  
    let cumulativeWeight = 0;
    for (let i = 0; i < arr.length; i++) {
        cumulativeWeight += weights[i];
        if (random < cumulativeWeight) {
            return arr[i];
        }
    }
};

module.exports.fisherYatesShuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
