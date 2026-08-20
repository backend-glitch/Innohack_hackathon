const nodes = require("../Graph/nodes");
const edges = require("../Graph/edges");
const aStar = require("../Algorithms/astar");
const shelters = require("../Shelters/shelters.json");

const {
    getRiskLevel,
    getRoadCost
} = require("../Risk/roadRisk");


// --------------------------------------------------
// Find the road node closest to a latitude/longitude
// --------------------------------------------------

function findNearestNode(lat, lng) {

    let nearestNode = null;
    let smallestDistance = Infinity;

    for (const node of Object.values(nodes)) {

        const latDifference = node.lat - lat;
        const lngDifference = node.lng - lng;

        const distance = Math.sqrt(
            latDifference * latDifference +
            lngDifference * lngDifference
        );

        if (distance < smallestDistance) {

            smallestDistance = distance;
            nearestNode = node;
        }
    }

    return nearestNode;
}


// --------------------------------------------------
// Calculate total physical distance of a route
// --------------------------------------------------

function calculateRouteDistance(path) {

    let totalDistance = 0;

    for (let i = 0; i < path.length - 1; i++) {

        const edge = edges.find(edge =>
            edge.from === path[i] &&
            edge.to === path[i + 1]
        );

        if (edge) {
            totalDistance += edge.distance;
        }
    }

    return Number(totalDistance.toFixed(2));
}


// --------------------------------------------------
// Calculate risk-adjusted cost of a route
// --------------------------------------------------

function calculateRouteCost(path) {

    let totalCost = 0;

    for (let i = 0; i < path.length - 1; i++) {

        const edge = edges.find(edge =>
            edge.from === path[i] &&
            edge.to === path[i + 1]
        );

        if (!edge) {
            continue;
        }

        const cost = getRoadCost(
            edge.distance,
            edge.risk
        );

        // Critical road
        if (cost === Infinity) {
            return Infinity;
        }

        totalCost += cost;
    }

    return Number(totalCost.toFixed(2));
}


// --------------------------------------------------
// Find highest risk level on the route
// --------------------------------------------------

function getRouteRisk(path) {

    let highestRisk = 0;

    for (let i = 0; i < path.length - 1; i++) {

        const edge = edges.find(edge =>
            edge.from === path[i] &&
            edge.to === path[i + 1]
        );

        if (edge) {

            highestRisk = Math.max(
                highestRisk,
                edge.risk
            );
        }
    }

    return getRiskLevel(highestRisk);
}


// --------------------------------------------------
// Convert node IDs into map coordinates
// --------------------------------------------------

function convertPathToCoordinates(path) {

    return path.map(nodeId => ({
        lat: nodes[nodeId].lat,
        lng: nodes[nodeId].lng
    }));
}


// --------------------------------------------------
// Find safe route between origin and destination
// --------------------------------------------------

function calculateRoute(origin, destination) {

    const startNode = findNearestNode(
        origin.lat,
        origin.lng
    );

    const destinationNode = findNearestNode(
        destination.lat,
        destination.lng
    );


    if (!startNode || !destinationNode) {

        return {
            success: false,
            message: "Could not find nearby road nodes"
        };
    }


    const path = aStar(
        startNode.id,
        destinationNode.id
    );


    if (!path) {

        return {
            success: false,
            message: "No safe route available"
        };
    }


    const distance = calculateRouteDistance(path);

    const cost = calculateRouteCost(path);

    const riskLevel = getRouteRisk(path);


    const coordinates =
        convertPathToCoordinates(path);


    return {

        success: true,

        route: coordinates,

        node_path: path,

        distance_km: distance,

        estimated_minutes:
            Math.max(1, Math.round(distance * 4)),

        routing_cost: cost,

        risk_level: riskLevel,

        avoided_flood_zones:
            edges.filter(edge => edge.risk >= 0.6).length
    };
}


// --------------------------------------------------
// Find the nearest SAFE shelter
// --------------------------------------------------

function findNearestSafeShelter(origin) {

    // Remove closed and full shelters
    const availableShelters =
        shelters.filter(shelter =>
            shelter.status === "OPEN" &&
            shelter.available_capacity > 0
        );


    if (availableShelters.length === 0) {

        return null;
    }


    let bestShelter = null;
    let bestRoute = null;
    let bestCost = Infinity;
    let bestDistance = Infinity;


    for (const shelter of availableShelters) {

        const startNode = findNearestNode(
            origin.lat,
            origin.lng
        );

        const shelterNode = findNearestNode(
            shelter.latitude,
            shelter.longitude
        );


        if (!startNode || !shelterNode) {
            continue;
        }


        const path = aStar(
            startNode.id,
            shelterNode.id
        );


        // No safe route to this shelter
        if (!path) {
            continue;
        }


        const routeCost =
            calculateRouteCost(path);

        const routeDistance =
            calculateRouteDistance(path);


        // Select safest practical route.
        // If costs are equal, choose shorter route.
        if (
            routeCost < bestCost ||
            (
                routeCost === bestCost &&
                routeDistance < bestDistance
            )
        ) {

            bestShelter = shelter;

            bestRoute = path;

            bestCost = routeCost;

            bestDistance = routeDistance;
        }
    }


    if (!bestShelter) {

        return null;
    }


    return {

        shelter: bestShelter,

        route: convertPathToCoordinates(
            bestRoute
        ),

        distance_km: bestDistance,

        estimated_minutes:
            Math.max(
                1,
                Math.round(bestDistance * 4)
            ),

        risk_level:
            getRouteRisk(bestRoute),

        routing_cost: bestCost
    };
}


// --------------------------------------------------
// Export functions
// --------------------------------------------------

module.exports = {

    calculateRoute,

    findNearestSafeShelter,

    findNearestNode,

    calculateRouteDistance,

    calculateRouteCost,

    getRouteRisk
};