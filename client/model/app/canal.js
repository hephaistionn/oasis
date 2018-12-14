const ee = require('../../kernel/tools/eventemitter');

module.exports = class Canal {

    constructor(config, ground) {
        this._id = config._id ? parseInt(config._id, 10) : Math.floor((1 + Math.random()) * 0x10000000000);
        this.ground = ground;
        this.tileSize = ground.tileSize;
        this.drafted = false;
        this.maxTileDraft = 8;
        this.heightMax = 6;
        this.startXi;
        this.startZi;
        this.roadType;

        this.draftCanal = {
            tiles: new Uint16Array(2 * this.maxTileDraft),
            valid: new Uint8Array(this.maxTileDraft),
            length: 0
        };

        this._draftStart = this.draftStart.bind(this);
        this._draftStaggering = this.draftStaggering.bind(this);
        this._draftMove = this.draftMove.bind(this);
        this._draft = this.draft.bind(this);
        this._startConstruct = this.startConstruct.bind(this);
        this._cancelConstruct = this.cancelConstruct.bind(this);

        ee.on('mouseDown', this._draftStart);
        ee.on('mouseMovePress', this._draftStaggering);
        ee.on('mouseMove', this._draftMove);
        ee.on('draftCanal', this._draft);
        ee.on('mouseUp', this._startConstruct);
        ee.on('mouseClick', this._startConstruct);
        ee.on('mouseDownRight', this._cancelConstruct);
    }

    draft() {
        this.drafted = true; 
    }

    startConstruct() {
        if(!this.drafted) return;
        const l = this.draftCanal.length * 2;
        for (let i = 0; i < l; i += 2) {
            if(this.draftCanal.valid[i/2]) {
                this.ground.grid.setWalkableAt(this.draftCanal.tiles[i], this.draftCanal.tiles[i + 1], 0);
                this.ground.addCanal(this.draftCanal.tiles[i], this.draftCanal.tiles[i + 1]);
            }
        }
        this.ground.updateCanalType()// la forme d'un block de canal dépend de ses voisins
        this.drafted = false;
        this.draftCanal.length = 0;
        this.updated = true;
    }

    cancelConstruct() {
        this.drafted = false;
        this.draftCanal.length = 0;
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
            const tiles = this.draftCanal.tiles;
            let ctn = 0, i, k;
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

            const length = Math.min(ctn / 2, tiles.length / 2);

            for (i = 0; i < length; i++) {
                this.draftCanal.valid[i] = 1;
            }

            for (i = 0; i < length; i++) {
                if (!this.ground.grid.isWalkableAt(tiles[i * 2], tiles[i * 2 + 1]) && !this.ground.isWaterable(255, tiles[i * 2], tiles[i * 2 + 1])) {
                    for (k = 0; k < length; k++) {
                        this.draftCanal.valid[k] = 0;
                    }
                    break;
                }
            }
            this.draftCanal.length = length;
            this.updated = true;
        }
    }

    draftMove(x, y, z) {
        if (this.drafted) {
            const xi = Math.floor(x / this.tileSize);
            const zi = Math.floor(z / this.tileSize);
            this.draftCanal.tiles[0] = xi;
            this.draftCanal.tiles[1] = zi;
            const walkable = this.ground.grid.isWalkableAt(xi, zi);
            const bank = this.ground.isBank(xi, zi);
            const height = this.ground.getHeightTile(xi, zi);
            if ((!walkable && !bank) || height > this.heightMax) {
                this.draftCanal.valid[0] = 0;
            } else {
                this.draftCanal.valid[0] = 1;
            }
            this.draftCanal.length = 1;
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
