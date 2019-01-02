const pathfinding = require('../../kernel/tools/pathfinding');
const ee = require('../../kernel/tools/eventemitter');
const Stats = require('../../kernel/model/stats');

module.exports = class Road {

    constructor(config, ground, store) {
        this._id = config._id ? parseInt(config._id, 10) : Math.floor((1 + Math.random()) * 0x10000000000);
        this.ground = ground;
        this.tileSize = ground.tileSize;
        this.drafted = false;
        this.maxTileDraft = 30;
        this.maxTileRoad = 100;
        this.startXi;
        this.startZi;
        this.roadType;
        this.cost;
        this.costByTile;
        this.store = store;

        this.draftRoad = {
            tiles: new Uint16Array(2 * this.maxTileDraft),
            walkable: new Uint8Array(this.maxTileDraft),
            length: 0
        };

        this._draftStart = this.draftStart.bind(this);
        this._draftStaggering = this.draftStaggering.bind(this);
        this._draftMove = this.draftMove.bind(this);
        this._draft = this.draft.bind(this);
        this._startConstruct = this.startConstruct.bind(this);
        this._cancelConstruct = this.cancelConstruct.bind(this);
        this._removeRoad = this.removeRoad.bind(this);

        ee.on('mouseDown', this._draftStart);
        ee.on('mouseMovePress', this._draftStaggering);
        ee.on('mouseMove', this._draftMove);
        ee.on('draftRoad', this._draft);
        ee.on('mouseUp', this._startConstruct);
        ee.on('mouseClick', this._startConstruct);
        ee.on('mouseDownRight', this._cancelConstruct);
        ee.on('removeRoad', this._removeRoad);
    }

    removeRoad(tiles, l) {
        let xi, zi, i
        for (i = 0; i < l; i++) {
            xi = tiles[i * 2];
            zi = tiles[i * 2 + 1];
            if (this.ground.grid.isWalkableAt(xi, zi) === 2) {
                this.ground.grid.setWalkableAt(xi, zi, 1);
            }
        }
        this.updated = true;
    }

    draft(config) {
        this.drafted = true;
        this.roadType = 2;
        this.cost = 0;
        this.costByTile = 2;
    }

    startConstruct() {
        if (!this.drafted) return;
        const l = this.draftRoad.length + 1;
        for (let i = 0; i < l; i++) {
            this.ground.grid.setWalkableAt(this.draftRoad.tiles[i * 2], this.draftRoad.tiles[i * 2 + 1], this.draftRoad.walkable[i]);
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
            const signX = Math.sign(dxi);
            const signZ = Math.sign(dzi);
            const tiles = this.draftRoad.tiles;
            let ctn = 0;

            let xAbs, zAbs;
            const xMax = this.ground.nbTileX;
            const zMax = this.ground.nbTileZ;
            if (nbX >= nbZ) {
                for (let i = 0; i < nbX; i++) {
                    xAbs = this.startXi + i * signX;
                    if (xAbs >= 0 && xAbs < xMax) {
                        tiles[ctn++] = xAbs;
                        tiles[ctn++] = this.startZi;
                    }
                }
                for (let i = 1; i < nbZ; i++) {
                    xAbs = this.startXi + (nbX - 1) * signX;
                    if (xAbs >= 0 && xAbs < xMax) {
                        tiles[ctn++] = xAbs;
                        tiles[ctn++] = this.startZi + i * signZ;
                    }
                }
            } else {
                for (let i = 0; i < nbZ; i++) {
                    zAbs = this.startZi + i * signZ;
                    if (zAbs >= 0 && zAbs < zMax) {
                        tiles[ctn++] = this.startXi;
                        tiles[ctn++] = zAbs;
                    }
                }
                for (let i = 1; i < nbX; i++) {
                    zAbs = this.startZi + (nbZ - 1) * signZ;
                    if (zAbs >= 0 && zAbs < zMax) {
                        tiles[ctn++] = this.startXi + i * signX;
                        tiles[ctn++] = zAbs;
                    }
                }
            }

            const length = Math.min(ctn / 2, tiles.length);
            this.draftRoad.length = length;
            this.cost = length * this.costByTile;

            const needResources = this.store.stats[Stats.WOOD] < this.cost;

            for (let i = 0; i < length; i++) {
                if (!this.ground.grid.isWalkableAt(tiles[i * 2], tiles[i * 2 + 1]) || needResources) {
                    this.draftRoad.walkable[i] = 0;
                } else {
                    this.draftRoad.walkable[i] = this.roadType;
                }
            }

            this.updated = true;
        }
    }

    draftMove(x, y, z) {
        if (this.drafted) {
            const xi = Math.min(Math.max(Math.floor(x / this.tileSize), 0), this.ground.nbTileX - 1);
            const zi = Math.min(Math.max(Math.floor(z / this.tileSize), 0), this.ground.nbTileZ - 1);
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
        ee.off('mouseDown', this._draftStart);
        ee.off('mouseMovePress', this._draftStaggering);
        ee.off('mouseMove', this._draftMove);
        ee.off('draftRoad', this._draft);
        ee.off('mouseUp', this._startConstruct);
        ee.off('mouseClick', this._startConstruct);
        ee.off('mouseDownRight', this._cancelConstruct);
    }
}
