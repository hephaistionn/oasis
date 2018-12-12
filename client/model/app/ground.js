const pathfinding = require('../../kernel/tools/pathfinding');

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
        this.canalMax = 40;
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
        this.spawns = config.spawns;
        this.ENTITIES = ENTITIES;
        this.entities = entities;
        this.grid = new pathfinding.Grid(this.nbTileX, this.nbTileZ, 1);
        this.gridWater = new Uint16Array(this.nbTileX * this.nbTileZ);
        this.gridCanal = new Uint16Array(this.canalMax * 2);
        this.updated = false;
        this._id = 2;
        this.initGridByHeight(this.tilesTilt);
        this.initGridWater();
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
            xx = x % this.nbTileX || this.nbTileX;
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
            let x = i % this.nbTileX || this.nbTileX;
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
            this.grid.setWalkableAt(tiles[i], tiles[i + 1], walkableStatus || entity.constructor.walkable);
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
            const xi = Math.floor(x);
            const zi = Math.floor(z);
            return this.grid.isWalkableAt(xi, zi) ? true : false;
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
            const xi = Math.floor(x);
            const zi = Math.floor(z);
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

    getHeightTile(x, z) {
        const index = Math.floor(z) * this.nbTileX + Math.floor(x);
        return this.tilesHeight[index] * this.tileHeight;
    }

    getTileCenter(x, z) {
        const xi = Math.floor(x / this.tileSize);
        const zi = Math.floor(z / this.tileSize);
        const index = zi * this.nbTileX + xi;
        // console.log('i:', index, ' xi:', xi, ' zi:', zi)
        const y = this.tilesHeight[index] * this.tileHeight;
        return {
            x: (xi + 0.5) * this.tileSize,
            y: y,
            z: (zi + 0.5) * this.tileSize
        }
    }

    addCanal(xi, zi, value) {
        this.gridCanal[this.canalSize++] = xi;
        this.gridCanal[this.canalSize++] = zi;
        this.updated = true;
    }

    getEntity(id) {
        return this.entities.get(id);
    }

    getSpawnerTile() {
        const nbSpwans = this.spawns.length;
        const randomIndex = Math.floor(Math.random() * (nbSpwans - 0.001));
        return this.spawns[randomIndex];
    }

    select() {

    }

    dismount() {

    }

}

