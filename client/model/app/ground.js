const pathfinding = require('../../kernel/tools/pathfinding');
const ee = require('../../kernel/tools/eventemitter');
const onWallTileUpdated = 'onWallTileUpdated';

module.exports = class Ground {

    constructor(config, ENTITIES, entities) {
        this.nbPointX = config.nbPointX;
        this.nbPointZ = config.nbPointZ;
        this.nbTileX = config.nbTileX;
        this.nbTileZ = config.nbTileZ;
        this.tiltMax = config.tiltMax || 55;
        this.waterLevel = 13;
        this.waterInfluence = 3;
        this.waterLevelMax = 255;
        this.canalMax = 50;
        this.canalSize = 0;
        this.waterLevelDecrease = Math.floor(this.waterLevelMax / (this.waterInfluence + 1));
        this.pointsHeights = config.pointsHeights;
        this.tilesHeight = config.tilesHeight;
        this.tilesTilt = config.tilesTilt;
        this.tileSize = config.tileSize;
        this.tileHeight = config.tileHeight;
        this.pointsNormal = config.pointsNormal;
        this.tilesColor = config.tilesColor;
        this.canvasColor = config.canvas;
        this.ENTITIES = ENTITIES;
        this.entities = entities;
        this.grid = new pathfinding.Grid(this.nbTileX, this.nbTileZ, 1);
        this.gridWater = new Uint16Array(this.nbTileX * this.nbTileZ);
        this.gridCanal = new Uint8Array(this.nbTileX * this.nbTileZ);
        this.gridWall = new Uint8Array(this.nbTileX * this.nbTileZ);
        this.updated = false;
        this._id = 2;
        this.initGridByHeight(this.tilesTilt);
        this.initGridWater();
        //mesh et direction
        this.wallShape = [
            0, 0,
            0, 0,
            3, 1, //2
            2, 3, //3
            2, 1, //4
            2, 2, //5
            2, 0, //6
            1, 3, //7
            1, 0, //8
            1, 2, //9
            1, 1, //10
            0, 0, //11
            0, 1, //12
            3, 0 //13
        ];
    }

    initGridWater() {
        let length = this.tilesHeight.length, i;

        for (let i = 0; i < length; i++) {
            if (this.tilesHeight[i] < this.waterLevel) {
                this.gridWater[i] = 255;
                this.setIrrigationTiles(i);
            }
        }
    }

    setIrrigationTiles(x, z) {
        let xx, zz, xi, zi, i, level, levelX, levelZ;
        if (z === undefined) {
            xx = x % this.nbTileX;
            zz = Math.floor(x / this.nbTileX);
        } else {
            xx = x;
            zz = z;
        }

        const xmin = Math.max(xx - this.waterInfluence, 0);
        const xmax = Math.min(xx + this.waterInfluence + 1, this.nbTileX);
        const zmin = Math.max(zz - this.waterInfluence);
        const zmax = Math.min(zz + this.waterInfluence + 1, this.nbTileZ);

        for (xi = xmin; xi < xmax; xi++) {
            levelX = this.waterLevelMax - Math.abs(xx - xi) * this.waterLevelDecrease;
            for (zi = zmin; zi < zmax; zi++) {
                levelZ = this.waterLevelMax - Math.abs(zz - zi) * this.waterLevelDecrease;
                i = zi * this.nbTileX + xi;
                level = Math.min(levelX, levelZ);
                if (this.gridWater[i] < level) {
                    this.gridWater[i] = level;
                }
            }
        }
    }

    initGridByHeight() {
        let length = this.tilesTilt.length;
        for (let i = 0; i < length; i++) {
            let x = i % this.nbTileX;
            let z = Math.floor(i / this.nbTileX);
            let tilt = this.tilesTilt[i];
            let height = this.tilesHeight[i];
            if (tilt > this.tiltMax) {
                this.grid.setWalkableAt(x, z, 0);
            } else if (height < this.waterLevel) {
                this.grid.setWalkableAt(x, z, 0);
            }
        }
    }

    setWalkable(entity, walkableStatus) {
        const tiles = entity.getTiles();
        for (let i = 0; i < tiles.length; i += 2) {
            if (walkableStatus === undefined) {
                this.grid.setWalkableAt(tiles[i], tiles[i + 1], entity.constructor.walkable);
            } else {
                this.grid.setWalkableAt(tiles[i], tiles[i + 1], walkableStatus);
            }
        }
        this.updated = true;
    }

    isWalkable(x, z) {
        if (x.length) {
            for (let i = 0; i < x.length; i += 2) {
                const xi = Math.floor(x[i]);
                const zi = Math.floor(x[i + 1]);
                if (!this.grid.isWalkableAt(xi, zi)) {
                    return false;
                }
            }
            return true;
        } else {
            return this.grid.isWalkableAt(x, z) ? true : false;
        }
    }

    isWaterable(levelNeeded, x, z) {
        if (x.length) {
            for (let i = 0; i < x.length; i += 2) {
                if (this.gridWater[x[i + 1] * this.nbTileX + x[i]] >= levelNeeded) {
                    return true;
                }
            }
            return false;
        } else {
            const xi = x;
            const zi = z;
            return this.gridWater[zi * this.nbTileX + xi] >= levelNeeded
        }
    }

    isBank(xi, zi) {
        if (this.gridWater[zi * this.nbTileX + xi] !== this.waterLevelMax) {
            return false;
        }
        let count = 0;
        if (this.gridWater[zi * this.nbTileX + xi + 1] === this.waterLevelMax) {
            count++;
        }
        if (this.gridWater[zi * this.nbTileX + xi - 1] === this.waterLevelMax) {
            count++;
        }
        if (this.gridWater[(zi + 1) * this.nbTileX + xi] === this.waterLevelMax) {
            count++;
        }
        if (this.gridWater[(zi - 1) * this.nbTileX + xi] === this.waterLevelMax) {
            count++;
        }
        return count === 3;
    }

    // retourne la direction du canal, si pas de canal -1
    getCanalDirection(xi, zi) {
        if (this.gridWater[zi * this.nbTileX + xi] !== this.waterLevelMax) {
            return -1;
        }
        if (this.gridWater[zi * this.nbTileX + xi + 1] !== this.waterLevelMax && this.gridWater[zi * this.nbTileX + xi - 1] !== this.waterLevelMax) {
            return 0;
        }
        if (this.gridWater[(zi + 1) * this.nbTileX + xi] !== this.waterLevelMax && this.gridWater[(zi - 1) * this.nbTileX + xi] !== this.waterLevelMax) {
            return Math.PI / 2;
        }
        return -1
    }

    isInSameTile(entityA, entityB) {
        let xiA = Math.floor(entityA.ax / this.tileSize);
        let ziA = Math.floor(entityA.az / this.tileSize);
        let xiB = Math.floor(entityB.ax / this.tileSize);
        let ziB = Math.floor(entityB.az / this.tileSize);
        return xiA === xiB && ziB === ziB;
    }

    getHeightTile(xi, zi) {
        const index = zi * this.nbTileX + xi;
        return this.tilesHeight[index] * this.tileHeight;
    }

    getTileCenter(x, z) {
        let xi = Math.floor(x / this.tileSize);
        let zi = Math.floor(z / this.tileSize);
        xi = Math.max(xi, 0);
        zi = Math.max(zi, 0);
        xi = Math.min(xi, this.nbTileX - 1);
        zi = Math.min(zi, this.nbTileZ - 1);
        const index = zi * this.nbTileX + xi;
        const y = this.tilesHeight[index] * this.tileHeight;
        return {
            x: (xi + 0.5) * this.tileSize,
            y: y,
            z: (zi + 0.5) * this.tileSize
        }
    }

    addCanal(xi, zi) {
        const i = zi * this.nbTileX + xi;
        this.gridCanal[i] = 1;
        this.gridWater[i] = 255;
        this.setIrrigationTiles(i);
    }

    removeCanal(xi, zi) {
        const i = zi * this.nbTileX + xi;
        this.gridCanal[i] = 0;
        this.gridWater[i] = 0;
    }

    updateCanalType() {
        let xi, zi, o, xo, ox, zo, oz, wallZ, wallX;
        for (xi = 0; xi < this.nbTileX; xi++) {
            for (zi = 0; zi < this.nbTileZ; zi++) {
                o = zi * this.nbTileX + xi;
                if (this.gridCanal[o] !== 0) {
                    ox = zi * this.nbTileX + xi - 1;
                    oz = (zi - 1) * this.nbTileX + xi;
                    wallZ = false;
                    wallX = false;
                    if (xi === 0 || this.gridCanal[ox] === 0) {
                        wallX = true;
                    }
                    if (zi === 0 || this.gridCanal[oz] === 0) {
                        wallZ = true;
                    }
                    if (wallZ && !wallX) {
                        this.gridCanal[o] = 1;
                    } else if (!wallZ && wallX) {
                        this.gridCanal[o] = 2;
                    } else if (!wallZ && !wallX) {
                        this.gridCanal[o] = 3;
                    } else if (wallZ && wallX) {
                        this.gridCanal[o] = 4;
                    }
                }
            }
        }
        this.updated = true;
    }

    setWall(xi, zi, value) {
        if (value > 1) {
            if (this.gridWall[zi * this.nbTileX + xi] !== value) { // pour alerter un changement de forme
                this.gridWall[zi * this.nbTileX + xi] = value;
                ee.emit('onWallTileUpdated', (xi + 0.5) * this.tileSize, (zi + 0.5) * this.tileSize, value);
            }
        } else {
            this.gridWall[zi * this.nbTileX + xi] = value;
        }
    }

    getWall(xi, zi) {
        if (zi < 0 || zi >= this.nbTileZ || xi < 0 || xi >= this.nbTileX) return 0;
        return this.gridWall[zi * this.nbTileX + xi];
    }

    removeWall(xi, zi) {
        this.gridWall[zi * this.nbTileX + xi] = 0;
    }

    getEntity(id) {
        return this.entities.get(id);
    }

    getFreeRandomBorder() {
        let xi = Math.floor(Math.random() * this.nbTileX);
        let zi = 0;
        while (this.isWalkable(xi, zi) === false) {
            xi = Math.floor(Math.random() * this.nbTileX);
            zi = 0;
        }
        const yi = this.tilesHeight[zi * this.nbTileX + xi] * this.tileHeight;
        return [(xi + 0.5) * this.tileSize, yi, (zi + 0.5) * this.tileSize];
    }

    select() {

    }

    dismount() {

    }

}

