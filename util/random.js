module.exports.randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

module.exports.randChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

module.exports.randChoiceWithWeight = (arr, weights) => {
    if (arr.length !== weights.length) {
        throw new Error("Array and weights must have the same length.");
    }

    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

    const random = Math.random() * totalWeight;

    let cumulativeWeight = 0;
    let selectedIndex = -1;

    for (let i = 0; i < arr.length; i++) {
        cumulativeWeight += weights[i];
        if (random < cumulativeWeight) {
            selectedIndex = i;
            break;
        }
    }

    if (selectedIndex === -1) {
        // in case of floating point stupidity
        selectedIndex = arr.length - 1;
    }

    const newWeights = weights.map((weight, idx) => {
        if (idx === selectedIndex) {
            return Math.max(1, weight * 0.5); // 1/2 the winner's chance, but dont let it die completely
        } else {
            return weight + 1; // buff others slowly
        }
    });

    return {
        choice: arr[selectedIndex],
        weights: newWeights
    };
};

module.exports.fisherYatesShuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
