const pathfinding = require('../../kernel/tools/pathfinding');

module.exports = class Ground {

    constructor(config, ENTITIES, entities) {
        this.nbPointX = config.nbPointX;
        this.nbPointZ = config.nbPointZ;
        this.nbTileX = config.nbTileX;
        this.nbTileZ = config.nbTileZ;
        this.tiltMax = config.tiltMax || 55;
        this.pointsHeights = config.pointsHeights;
        this.tilesHeight = config.tilesHeight;
        this.tilesTilt = config.tilesTilt;
        this.tileSize = config.tileSize;
        this.tileHeight = config.tileHeight;
        this.tilesColor = config.tilesColor;
        this.canvasColor = config.canvas;
        this.spawns = config.spawns;
        this.ENTITIES = ENTITIES;
        this.entities = entities;
        this.grid = new pathfinding.Grid(this.nbTileX, this.nbTileZ, 1);
        this.updated = false;
        this._id = 2;
        this.initGridByHeight(this.tilesTilt);
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
            } else if (height < 13) {
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

    getHeightTile(x, z) {
        const index = Math.floor(z) * this.nbTileX + Math.floor(x);
        return this.tilesHeight[index] * this.tileHeight;
    }

    getTile(x, z) {
        const xi = Math.floor(x / this.tileSize);
        const zi = Math.floor(z / this.tileSize);
        const index = zi * this.nbTileX + xi;
        const y = this.tilesHeight[index] * this.tileHeight;
        return {
            x: (xi + 0.5) * this.tileSize,
            y: y,
            z: (zi + 0.5) * this.tileSize
        }
    }

    getEntity(id) {
        return this.entities.get(id);
    }

    getSpawnerTile() {
        const nbSpwans = this.spawns.length;
        const randomIndex = Math.floor(Math.random() * (nbSpwans - 0.001));
        return this.spawns[randomIndex];
    }

    update(dt) {

    }

    dismount() {

    }

}

