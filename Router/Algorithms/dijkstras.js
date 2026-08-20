const nodes = require("../Graph/nodes");
const edges = require("../Graph/edges");
const { getRoadCost } = require("../Risk/roadRisk");


// Find all roads leaving a node
function getNeighbors(nodeId) {
    return edges.filter(edge => edge.from === nodeId);
}


// Dijkstra's shortest safe path algorithm
function dijkstra(startId, goalId) {

    const distances = {};
    const previous = {};
    const unvisited = new Set(Object.keys(nodes));


    // Initially all distances are infinite
    Object.keys(nodes).forEach(nodeId => {
        distances[nodeId] = Infinity;
    });


    // Starting point
    distances[startId] = 0;


    while (unvisited.size > 0) {

        // Find unvisited node with smallest distance
        let current = null;

        for (const nodeId of unvisited) {

            if (
                current === null ||
                distances[nodeId] <
                distances[current]
            ) {
                current = nodeId;
            }
        }


        // No reachable nodes remain
        if (
            current === null ||
            distances[current] === Infinity
        ) {
            break;
        }


        // Destination reached
        if (current === goalId) {

            const path = [];

            let currentNode = current;

            while (currentNode !== undefined) {

                path.unshift(currentNode);

                currentNode = previous[currentNode];
            }

            return path;
        }


        // Mark current node as visited
        unvisited.delete(current);


        // Check connected roads
        const neighbors = getNeighbors(current);


        for (const edge of neighbors) {

            const roadCost = getRoadCost(
                edge.distance,
                edge.risk
            );


            // Skip critical/blocked roads
            if (roadCost === Infinity) {
                continue;
            }


            const newDistance =
                distances[current] + roadCost;


            // Found a better route
            if (
                newDistance <
                distances[edge.to]
            ) {

                distances[edge.to] =
                    newDistance;

                previous[edge.to] =
                    current;
            }
        }
    }


    // No safe route
    return null;
}


module.exports = dijkstra;