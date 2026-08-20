function getRiskLevel(risk) {

    if (risk < 0.30) {
        return "LOW";
    }

    if (risk < 0.60) {
        return "MODERATE";
    }

    if (risk < 0.80) {
        return "HIGH";
    }

    return "CRITICAL";
}


// Get routing multiplier based on risk level
function getRiskMultiplier(risk) {

    const level = getRiskLevel(risk);

    if (level === "LOW") {
        return 1;
    }

    if (level === "MODERATE") {
        return 2;
    }

    if (level === "HIGH") {
        return 5;
    }

    // Critical roads are blocked
    return Infinity;
}


// Calculate the final cost of using a road
function getRoadCost(distance, risk) {

    const multiplier = getRiskMultiplier(risk);

    // Critical road
    if (multiplier === Infinity) {
        return Infinity;
    }

    return distance * multiplier;
}


// Export functions so other files can use them
module.exports = {
    getRiskLevel,
    getRiskMultiplier,
    getRoadCost
};