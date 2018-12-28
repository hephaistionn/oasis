var Heap = require('heap');
var Util = require('../core/Util');
var Heuristic = require('../core/Heuristic');
var DiagonalMovement = require('../core/DiagonalMovement');

/**
 * A* path-finder. Based upon https://github.com/bgrins/javascript-astar
 * @constructor
 * @param {Object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.
 *     Deprecated, use diagonalMovement instead.
 * @param {boolean} opt.dontCrossCorners Disallow diagonal movement touching
 *     block corners. Deprecated, use diagonalMovement instead.
 * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement.
 * @param {function} opt.heuristic Heuristic function to estimate the distance
 *     (defaults to manhattan).
 * @param {number} opt.weight Weight to apply to the heuristic to allow for
 *     suboptimal paths, in order to speed up the search.
 */
function AStarFinder(opt) {
    opt = opt || {};
    this.allowDiagonal = opt.allowDiagonal;
    this.dontCrossCorners = opt.dontCrossCorners;
    this.heuristic = opt.heuristic || Heuristic.manhattan;
    this.weight = opt.weight || 1;
    this.diagonalMovement = opt.diagonalMovement;

    this.sourceSave = new Uint16Array(30);
    this.targetSave = new Uint16Array(30);

    if (!this.diagonalMovement) {
        if (!this.allowDiagonal) {
            this.diagonalMovement = DiagonalMovement.Never;
        } else {
            if (this.dontCrossCorners) {
                this.diagonalMovement = DiagonalMovement.OnlyWhenNoObstacles;
            } else {
                this.diagonalMovement = DiagonalMovement.IfAtMostOneObstacle;
            }
        }
    }

    // When diagonal movement is allowed the manhattan heuristic is not
    //admissible. It should be octile instead
    if (this.diagonalMovement === DiagonalMovement.Never) {
        this.heuristic = opt.heuristic || Heuristic.manhattan;
    } else {
        this.heuristic = opt.heuristic || Heuristic.octile;
    }
}

/**
 * Find and return the the path.
 * @return {Array<Array<number>>} The path, including both start and
 *     end positions.
 */
AStarFinder.prototype.findPath = function (startX, startY, endX, endY, grid, nodeType) {
    nodeType = nodeType || 1;
    const indexOpended = grid.indexOpended;
    const indexClosed = grid.indexClosed;
    const indexF = grid.indexF;
    const indexG = grid.indexG;
    const indexH = grid.indexH;
    const indexParent = grid.indexParent;
    const nodes = grid.nodes;
    var index;

    let openList = new Heap(function (IndexNodeA, IndexNodeB) {
        return nodes[IndexNodeA + indexF] - nodes[IndexNodeB + indexF];
    });

    const startNodeIndex = grid.getIndexNodeAt(startX, startY);
    const endNodeIndex = grid.getIndexNodeAt(endX, endY);
    let heuristic = this.heuristic,
        diagonalMovement = this.diagonalMovement,
        weight = this.weight * 100,
        abs = Math.abs, SQRT2 = Math.floor(Math.SQRT2 * 100),
        node, neighborsIndex, neighborIndex, i, l, x, y, ng;

    // set the `g` and `f` value of the start node to be 0
    nodes[startNodeIndex + indexG] = 0;
    nodes[startNodeIndex + indexF] = 0;

    // push the start node into the open list
    openList.push(startNodeIndex);
    nodes[startNodeIndex + indexOpended] = 1;

    // while the open list is not empty
    while (!openList.empty()) {
        // pop the position of node which has the minimum `f` value.
        index = openList.pop();
        nodes[index + indexClosed] = 1;

        // if reached the end position, construct the path and return it
        if (nodes[index] === nodes[endNodeIndex] && nodes[index + 1] === nodes[endNodeIndex + 1]) {
            const path = Util.backtrace(nodes, endNodeIndex);
            grid.clear();
            return path;
        }

        // get neigbours of the current node
        neighborsIndex = grid.getNeighbors(index, diagonalMovement, nodeType);
        for (i = 0, l = neighborsIndex.length; i < l; ++i) {
            neighborIndex = neighborsIndex[i];

            if (nodes[neighborIndex + indexClosed]) {
                continue;
            }

            x = nodes[neighborIndex];
            y = nodes[neighborIndex + 1];

            // get the distance between current node and the neighbor
            // and calculate the next g score
            ng = nodes[index + indexG] + ((x - nodes[index] === 0 || y - nodes[index + 1] === 0) ? 100 : SQRT2);

            // check if the neighbor has not been inspected yet, or
            // can be reached with smaller cost from the current node
            if (!nodes[neighborIndex + indexOpended] || ng < nodes[neighborIndex + indexG]) {
                nodes[neighborIndex + indexG] = ng;
                nodes[neighborIndex + indexH] = nodes[neighborIndex + indexH] || weight * heuristic(abs(x - endX), abs(y - endY));
                nodes[neighborIndex + indexF] = nodes[neighborIndex + indexG] + nodes[neighborIndex + indexH];
                nodes[neighborIndex + indexParent] = index;

                if (!nodes[neighborIndex + indexOpended]) {
                    openList.push(neighborIndex);
                    nodes[neighborIndex + indexOpended] = 1;
                } else {
                    // the neighbor can be reached with smaller cost.
                    // Since its f value has been updated, we have to
                    // update its position in the open list
                    openList.updateItem(neighborIndex);
                }
            }
        } // end for each neighbor
    } // end while not open list empty

    // fail to find the path
    grid.clear();
    return [];
};
AStarFinder.prototype.findPathBetweenArea = function (source, target, grid, tileType) {
    if (source[0] === target[0] && source[1] === target[1]) return [source[0], 0, source[1]];

    let i, x, y = 0;
    let l = source.length;
    for (i = 0; i < l; i += 2) {
        this.sourceSave[i / 2] = grid.getWalkableAt(source[i], source[i + 1]);
        grid.setWalkableAt(source[i], source[i + 1], tileType);
    }
    l = target.length;
    for (i = 0; i < l; i += 2) {
        this.targetSave[i / 2] = grid.getWalkableAt(target[i], target[i + 1]);
        grid.setWalkableAt(target[i], target[i + 1], tileType);
    }

    let path = this.findPath(source[0], source[1], target[0], target[1], grid, tileType); //tileType authorized tile for path


    l = path.length / 2;
    const result = new Uint16Array(l * 3);
    for (i = 0; i < l; i += 1) {
        x = path[i * 2];
        y = path[i * 2 + 1];
        result[i * 3] = x;
        result[i * 3 + 1] = 0;
        result[i * 3 + 2] = y;
    }
    l = source.length;
    for (i = 0; i < l; i += 2) {
        grid.setWalkableAt(source[i], source[i + 1], this.sourceSave[i / 2]);
    }
    l = target.length;
    for (i = 0; i < l; i += 2) {
        grid.setWalkableAt(target[i], target[i + 1], this.targetSave[i / 2]);
    }

    return result;
};


AStarFinder.prototype.findPathBetweenAreaIn = function (source, target, grid) {
    if (source[0] === target[0] && source[1] === target[1]) return [source[0], 0, source[1]];

    let i, x, y = 0;
    let l = source.length;

    let path = this.findPath(source[0], source[1], target[0], target[1], grid);


    l = path.length / 2;
    const result = new Uint16Array(l * 3);
    for (i = 0; i < l; i += 1) {
        x = path[i * 2];
        y = path[i * 2 + 1];
        result[i * 3] = x;
        result[i * 3 + 1] = 0;
        result[i * 3 + 2] = y;
    }

    return result;
};

module.exports = AStarFinder;
