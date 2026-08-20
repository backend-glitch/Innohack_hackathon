const nodes = require("../Graph/nodes");
const edges = require("../Graph/edges");
const { getRoadCost } = require("../Risk/roadRisk");


// Calculate straight-line distance between two nodes
function heuristic(nodeA, nodeB) {
    const latDifference = nodeA.lat - nodeB.lat;
    const lngDifference = nodeA.lng - nodeB.lng;

    return Math.sqrt(
        latDifference * latDifference +
        lngDifference * lngDifference
    );
}


// Find all roads leaving a particular node
function getNeighbors(nodeId) {
    return edges.filter(edge => edge.from === nodeId);
}


// A* Safe Routing Algorithm
function aStar(startId, goalId) {

    // Nodes that still need to be explored
    const openSet = new Set([startId]);

    // Stores the previous node in the best route
    const cameFrom = {};

    // Cost from start to each node
    const gScore = {};

    // Estimated total cost
    const fScore = {};


    // Initially every node has infinite cost
    Object.keys(nodes).forEach(nodeId => {
        gScore[nodeId] = Infinity;
        fScore[nodeId] = Infinity;
    });


    // Starting node has zero cost
    gScore[startId] = 0;

    fScore[startId] =
        heuristic(nodes[startId], nodes[goalId]);


    while (openSet.size > 0) {

        // Find node with the lowest fScore
        let current = null;

        for (const nodeId of openSet) {

            if (
                current === null ||
                fScore[nodeId] < fScore[current]
            ) {
                current = nodeId;
            }
        }


        // Destination reached
        if (current === goalId) {

            const path = [];

            let currentNode = current;

            while (currentNode !== undefined) {

                path.unshift(currentNode);

                currentNode = cameFrom[currentNode];
            }

            return path;
        }


        // Remove current node from unexplored set
        openSet.delete(current);


        // Get connected roads
        const neighbors = getNeighbors(current);


        for (const edge of neighbors) {

            // Calculate risk-adjusted road cost
            const roadCost = getRoadCost(
                edge.distance,
                edge.risk
            );


            // Critical roads are blocked
            if (roadCost === Infinity) {
                continue;
            }


            // Calculate new route cost
            const tentativeGScore =
                gScore[current] + roadCost;


            // If this is a better route
            if (
                tentativeGScore <
                gScore[edge.to]
            ) {

                cameFrom[edge.to] = current;

                gScore[edge.to] =
                    tentativeGScore;

                fScore[edge.to] =
                    tentativeGScore +
                    heuristic(
                        nodes[edge.to],
                        nodes[goalId]
                    );

                openSet.add(edge.to);
            }
        }
    }


    // No safe route exists
    return null;
}


module.exports = aStar;