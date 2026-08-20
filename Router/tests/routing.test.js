const assert = require("assert");

const routing = require("../Services/routingservice");
const aStar = require("../Algorithms/astar");
const dijkstra = require("../Algorithms/dijkstras");

const {
    getRiskLevel,
    getRoadCost
} = require("../Risk/roadRisk");


console.log("\n=================================");
console.log("   FLOODGUARD AI ROUTING TESTS");
console.log("=================================\n");


// --------------------------------------------------
// TEST 1: Risk Classification
// --------------------------------------------------

console.log("Test 1: Risk classification");

assert.strictEqual(
    getRiskLevel(0.20),
    "LOW"
);

assert.strictEqual(
    getRiskLevel(0.45),
    "MODERATE"
);

assert.strictEqual(
    getRiskLevel(0.70),
    "HIGH"
);

assert.strictEqual(
    getRiskLevel(0.90),
    "CRITICAL"
);

console.log("✓ Risk classification passed\n");


// --------------------------------------------------
// TEST 2: Risk-Based Road Cost
// --------------------------------------------------

console.log("Test 2: Risk-based road cost");

assert.strictEqual(
    getRoadCost(2, 0.20),
    2
);

assert.strictEqual(
    getRoadCost(2, 0.45),
    4
);

assert.strictEqual(
    getRoadCost(2, 0.70),
    10
);

assert.strictEqual(
    getRoadCost(2, 0.90),
    Infinity
);

console.log("✓ Risk-based cost passed\n");


// --------------------------------------------------
// TEST 3: A* Finds Safe Route
// --------------------------------------------------

console.log("Test 3: A* safe routing");

const astarRoute = aStar("n1", "n4");

console.log("A* route:", astarRoute);

assert.ok(
    astarRoute !== null,
    "A* should find a route"
);

assert.deepStrictEqual(
    astarRoute,
    ["n1", "n5", "n6", "n4"]
);

console.log("✓ A* selected the safe route\n");


// --------------------------------------------------
// TEST 4: Dijkstra Finds Safe Route
// --------------------------------------------------

console.log("Test 4: Dijkstra safe routing");

const dijkstraRoute = dijkstra("n1", "n4");

console.log("Dijkstra route:", dijkstraRoute);

assert.ok(
    dijkstraRoute !== null,
    "Dijkstra should find a route"
);

assert.deepStrictEqual(
    dijkstraRoute,
    ["n1", "n5", "n6", "n4"]
);

console.log("✓ Dijkstra selected the safe route\n");


// --------------------------------------------------
// TEST 5: Complete Routing Service
// --------------------------------------------------

console.log("Test 5: Complete routing service");

const result = routing.calculateRoute(
    {
        lat: 12.9700,
        lng: 79.1500
    },
    {
        lat: 12.9800,
        lng: 79.1700
    }
);

console.log("Routing result:");
console.log(result);

assert.strictEqual(
    result.success,
    true
);

assert.deepStrictEqual(
    result.node_path,
    ["n1", "n5", "n6", "n4"]
);

assert.strictEqual(
    result.risk_level,
    "LOW"
);

assert.ok(
    result.distance_km > 0
);

console.log("✓ Complete routing service passed\n");


// --------------------------------------------------
// TEST 6: Safe Shelter Selection
// --------------------------------------------------

console.log("Test 6: Safe shelter selection");

const shelterResult =
    routing.findNearestSafeShelter({
        lat: 12.9700,
        lng: 79.1500
    });

console.log("Selected shelter:");

console.log(
    shelterResult.shelter
);

assert.ok(
    shelterResult !== null,
    "A safe shelter should be available"
);

assert.strictEqual(
    shelterResult.shelter.status,
    "OPEN"
);

assert.ok(
    shelterResult.shelter.available_capacity > 0
);

console.log("✓ Safe shelter selection passed\n");


// --------------------------------------------------
// FINAL RESULT
// --------------------------------------------------

console.log("=================================");
console.log("       ALL TESTS PASSED ✓");
console.log("=================================\n");