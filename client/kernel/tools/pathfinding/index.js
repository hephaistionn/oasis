const Grid = require('./core/Grid');
const Util = require('./core/Util');
const AStarFinder = require('./finders/AStarFinder');
let ENTITIES;
let currentGround;

const finder = new AStarFinder({
    allowDiagonal: true,
    dontCrossCorners: true
});

function init(ground, entities) {
    ENTITIES = entities;
    currentGround = ground;
}

function nearestEntities(ENTITIES, entity, resource, x, z) {
    const max = 80;
    let instances = resource ? ENTITIES[entity].instances.filter(instance => instance.stats[resource]) : ENTITIES[entity].instances;
    instances = instances.filter(instance => Math.abs(instance.ax - x) < max && Math.abs(instance.az - z) < max);
    instances.sort((a, b) => Math.abs(a.ax - x) + Math.abs(a.az - z) - Math.abs(b.ax - x) + Math.abs(b.az - z));
    return instances.splice(0, 3);
}

function computePath(ground, originTile, targetTiles, remote) {
    const grid = ground.grid;
    let targetTile, i;
    tileType = 1;
    const solutions = [];
    for (i = 0; i < targetTiles.length; i++) {
        targetTile = targetTiles[i];
        solutions.push(finder.findPathBetweenArea(originTile, targetTile, grid, tileType));
    }

    let solutionIndex = 0;
    let solution = solutions[0];
    for (i = 1; i < solutions.length; i++) {
        if (solution.length > solutions[i].length) {
            solution = solutions[i];
            solutionIndex = i;
        }
    }

    if (!solution) return;

    let length = solution.length, tx, tz;
    for (i = 0; i < length; i += 3) {
        tx = solution[i];
        tz = solution[i + 2];
        solution[i + 1] = ground.tilesHeight[ground.nbTileX * tz + tx];
    }
    if (remote) {
        return { path: solution.slice(0, solution.length - 3), index: solutionIndex };
    } else {
        return { path: solution, index: solutionIndex };
    }


}

function getPathLength(path) {
    let distance = 0;
    const l = path.length;
    for (let i = 0; i < l - 3; i += 3) {
        let dX1 = path[i + 3] - path[i];
        let dZ1 = path[i + 4] - path[i + 1];
        distance += Math.sqrt(dX1 * dX1 + dZ1 * dZ1);
    }
    return distance;
}

function revert(path) {
    const l = path.length;
    const newPath = [];
    for (let i = l - 1; i > -1; i -= 3) {
        newPath.push(path[i - 2]);
        newPath.push(path[i - 1]);
        newPath.push(path[i]);
    }
    return newPath;
}


const pathfinding = {
    Grid: Grid,
    init: init,
    nearestEntities: nearestEntities,
    computePath: computePath,
    getPathLength: getPathLength,
    revert: revert
};

module.exports = pathfinding;
