const edges = [
    {
        from: "n1",
        to: "n2",
        distance: 0.8,
        risk: 0.2
    },

    {
        from: "n2",
        to: "n4",
        distance: 1.5,
        risk: 0.9
    },

    {
        from: "n1",
        to: "n5",
        distance: 0.7,
        risk: 0.1
    },

    {
        from: "n5",
        to: "n6",
        distance: 0.8,
        risk: 0.2
    },

    {
        from: "n6",
        to: "n4",
        distance: 0.9,
        risk: 0.1
    }
];

module.exports = edges;