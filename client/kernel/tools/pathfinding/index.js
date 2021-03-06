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

function availableTarget(ground, entity, resource, x, z, putResource) {
    const instances = nearestEntities(ground.ENTITIES, entity, resource, x, z, putResource);
    if(instances.length === 0) return false;
    const targetTiles = instances.map(instance => instance.getTiles());
    const originTile = [Math.floor(x / ground.tileSize), Math.floor(z / ground.tileSize)];
    const grid = ground.grid;
    let i, tileType = 1, solution;
    for (i = 0; i < targetTiles.length; i++) {
        solution = finder.findPathBetweenArea(originTile, targetTiles[i], grid, tileType);
        if(solution.length>0){
            return true;
        }
    }
    return false;
}

function nearestEntities(ENTITIES, entity, resource, x, z, putResource) {
    const max = 80;
    let instances;
    if (resource)  {
        if (putResource) {
            instances = ENTITIES[entity].instances.filter(instance => instance.limitBlock[resource]===false || instance.fullBlock[resource] === false );
        } else {
            instances = ENTITIES[entity].instances.filter(instance => instance.stats[resource]);
        }
    } else {
        instances = ENTITIES[entity].instances;
    }

    instances = instances.filter(instance => Math.abs(instance.ax - x) < max && Math.abs(instance.az - z) < max);
    instances.sort((a, b) => (Math.abs(a.ax - x) + Math.abs(a.az - z)) - (Math.abs(b.ax - x) + Math.abs(b.az - z)));
    return instances.splice(0, 3);
}

function nearestInstances(instances, x, z) {
    const max = 80;
    instances = instances.filter(instance => Math.abs(instance.ax - x) < max && Math.abs(instance.az - z) < max);
    instances.sort((a, b) => (Math.abs(a.ax - x) + Math.abs(a.az - z)) - (Math.abs(b.ax - x) + Math.abs(b.az - z)));
    return instances.splice(0, 3);
}

function computePath(ground, originTile, targetTiles, remote, inner) {
    const grid = ground.grid;
    let targetTile, i;
    tileType = 1;
    const solutions = [];
    if (inner) { //Pour les unités et non les batiments
        for (i = 0; i < targetTiles.length; i++) {
            targetTile = targetTiles[i];
            solutions.push(finder.findPathBetweenAreaIn(originTile, targetTile, grid));
        }
    } else {
        for (i = 0; i < targetTiles.length; i++) {
            targetTile = targetTiles[i];
            solutions.push(finder.findPathBetweenArea(originTile, targetTile, grid, tileType));
        }
    }

    let solutionIndex = 0;
    let solution = solutions[0];
    for (i = 1; i < solutions.length; i++) {
        if (solution.length > solutions[i].length) {
            solution = solutions[i];
            solutionIndex = i;
        }
    }

    if (!solution || !solution.length) return;

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

function breakPath(path) {
    const l = path.length / 3;
    let l1 = Math.ceil(l / 2);
    let l2 = Math.ceil(l / 2);
    if (l % 2 == 0) {
        l1 += 1;
    }
    const p1 = path.slice(0, l1 * 3);
    const p2 = new Uint16Array(l2 * 3);
    const l3 = l * 3;
    const l23 = l2 * 3;
    for (let i = 0; i < l23; i += 3) {
        p2[i] = path[l3 - i - 3];
        p2[i + 1] = path[l3 - i - 2];
        p2[i + 2] = path[l3 - i - 1];
    }
    return [p1, p2];
}

const pathfinding = {
    Grid: Grid,
    init: init,
    nearestEntities: nearestEntities,
    nearestInstances: nearestInstances,
    computePath: computePath,
    getPathLength: getPathLength,
    revert: revert,
    breakPath: breakPath,
    availableTarget: availableTarget
};

module.exports = pathfinding;
