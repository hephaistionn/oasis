const pathfinding = require('../../kernel/tools/pathfinding');
const ee = require('../../kernel/tools/eventemitter');

module.exports = class Road {

    constructor(config, ground) {
        this._id = config._id ? parseInt(config._id, 10) : Math.floor((1 + Math.random()) * 0x10000000000);
        this.ground = ground;
        this.tileSize = ground.tileSize;
        this.drafted = false;
        this.maxTileDraft = 30;
        this.maxTileRoad = 100;
        this.startXi;
        this.startZi;
        this.roadType;

        this.draftRoad = {
            tiles: new Uint16Array(2 * this.maxTileDraft),
            walkable: new Uint8Array(this.maxTileDraft),
            length: 0
        };

        ee.on('mouseDown', this.draftStart.bind(this));
        ee.on('mouseMovePress', this.draftStaggering.bind(this));
        ee.on('mouseMove', this.draftMove.bind(this));
    }

    draft(roadType) {
        this.drafted = true;
        this.roadType = roadType;
    }

    startConstruct() {
        const l = this.draftRoad.tiles.length;
        for (let i = 0; i < l; i += 2) {
            this.ground.grid.setWalkableAt(this.draftRoad.tiles[i], this.draftRoad.tiles[i + 1], this.draftRoad.walkable[i / 2]);
        }
        this.drafted = false;
        this.draftRoad.length = 0;
        this.updated = true;
    }

    cancelConstruct() {
        this.drafted = false;
        this.draftRoad.length = 0;
        this.updated = true;
    }


    draftStart(xR, zR, x, z) {
        if (this.drafted) {
            this.startXi = Math.floor(x / this.tileSize);
            this.startZi = Math.floor(z / this.tileSize);
        }
    }

    draftStaggering(dxR, dzR, x, z) {
        if (this.drafted) {
            const dxi = Math.floor(x / this.tileSize) - this.startXi;
            const dzi = Math.floor(z / this.tileSize) - this.startZi;
            const nbX = Math.abs(dxi) + 1; //tile count
            const nbZ = Math.abs(dzi) + 1; //tile count
            if (dxi === 0 && dzi === 0) return;
            const signX = Math.sign(dxi);
            const signZ = Math.sign(dzi);
            const tiles = this.draftRoad.tiles;
            let ctn = 0;
            if (nbX >= nbZ) {
                for (let i = 0; i < nbX; i++) {
                    tiles[ctn++] = this.startXi + i * signX;
                    tiles[ctn++] = this.startZi;
                }
                for (let i = 1; i < nbZ; i++) {
                    tiles[ctn++] = this.startXi + (nbX - 1) * signX;
                    tiles[ctn++] = this.startZi + i * signZ;
                }
            } else {
                for (let i = 0; i < nbZ; i++) {
                    tiles[ctn++] = this.startXi;
                    tiles[ctn++] = this.startZi + i * signZ;
                }
                for (let i = 1; i < nbX; i++) {
                    tiles[ctn++] = this.startXi + i * signX;
                    tiles[ctn++] = this.startZi + (nbZ - 1) * signZ;
                }
            }

            const length = Math.min(ctn / 2, tiles.length);
            for (let i = 0; i < length; i++) {
                if (!this.ground.grid.isWalkableAt(tiles[i * 2], tiles[i * 2 + 1])) {
                    this.draftRoad.walkable[i] = 0;
                } else {
                    this.draftRoad.walkable[i] = this.roadType;
                }
            }
            this.draftRoad.length = length;
            this.updated = true;
        }
    }

    draftMove(x, y, z) {
        if (this.drafted) {
            const xi = Math.floor(x / this.tileSize);
            const zi = Math.floor(z / this.tileSize);
            this.draftRoad.tiles[0] = xi;
            this.draftRoad.tiles[1] = zi;
            if (!this.ground.grid.isWalkableAt(xi, zi)) {
                this.draftRoad.walkable[0] = 0;
            } else {
                this.draftRoad.walkable[0] = this.roadType;
            }
            this.draftRoad.length = 1;
            this.updated = true;
        }
    }

    onDismount() {
        ee.off('mouseDown', this.draftStart.bind(this));
        ee.off('mouseMovePress', this.draftStaggering.bind(this));
        ee.off('mouseMove', this.draftMove.bind(this));
    }
}
