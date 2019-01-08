const ee = require('../../kernel/tools/eventemitter');
const Stats = require('../../kernel/model/stats');

const top = 10; // 10*1  haut
const bottom = -10; //10*-1 bas
const right = 1;  //1 droite
const left = -1;  //-1 gauche

module.exports = class Wall {

    constructor(config, ground, store) {
        this._id = config._id ? parseInt(config._id, 10) : Math.floor((1 + Math.random()) * 0x10000000000);
        this.ground = ground;
        this.tileSize = ground.tileSize;
        this.nbTileX = ground.nbTileX;
        this.nbTileZ = ground.nbTileZ;
        this.drafted = false;
        this.maxTileDraft = 8;
        this.heightMax = 6;
        this.startXi;
        this.startZi;
        this.todo = [];
        this.cost;
        this.costByTile;
        this.store = store;
        this.haveNavvy = false;
        this.started = false;
        this.draftGrid = new Map();

        this.draftWall = {
            tiles: new Uint16Array(2 * this.maxTileDraft),
            shape: new Uint8Array(2 * this.maxTileDraft),
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
        ee.on('draftWall', this._draft);
        ee.on('mouseUp', this._startConstruct);
        ee.on('mouseClick', this._startConstruct);
        ee.on('mouseDownRight', this._cancelConstruct);
    }

    draft() {
        this.drafted = true;
        this.cost = { [Stats.WOOD]: 0 };
        this.costByTile = { [Stats.WOOD]: 1 };
        this.constuctDuration = 1000;
    }

    startConstruct() {
        if (!this.drafted) return;
        const l = this.draftWall.length;
        for (let i = 0; i < l; i++) {
            if (this.draftWall.valid[i] > 0) {
                this.todo.push(this.draftWall.tiles[i * 2]);
                this.todo.push(this.draftWall.tiles[i * 2 + 1]);
            }
        }
        this.started = true; // lance l'update cyclique
        this.drafted = false;
        this.draftWall.length = 0;
        this.updated = true;
    }

    // un case est construite
    constructProgress() {
        const tile = this.todo.splice(0, 2);
        this.updated = true;
        this.ground.setWall(tile[0], tile[1], 1);
        this.updateWallShape(tile[0], tile[1]);
        if (!this.todo.length) { // terminé
            this.started = false;
        }
    }

    updateWallShape(xi, zi) {
        const gridWall = this.ground.gridWall;

        const wtop = this.ground.getWall(xi, zi-1);
        const wbottom = this.ground.getWall(xi, zi+1);
        const wright = this.ground.getWall(xi+1, zi);
        const wleft = this.ground.getWall(xi-1, zi);

        if(wtop && wbottom && wleft && wright) this.ground.setWall(xi, zi, 1)// D 0*Math.PI/2
        else if(wtop && wbottom && wleft) this.ground.setWall(xi, zi, 2); // C 0*Math.PI/2
        else if(wtop && wbottom && wright) this.ground.setWall(xi, zi, 3); // C 2*Math.PI/2
        else if(wright && wleft && wbottom) this.ground.setWall(xi, zi, 4); // C 1*Math.PI/2
        else if(wright && wleft && wtop) this.ground.setWall(xi, zi, 5); // C 3*Math.PI/2
        else if(wtop && wbottom) this.ground.setWall(xi, zi, 6); // A 0*Math.PI/2
        else if(wleft && wright) this.ground.setWall(xi, zi, 7); // A 1*Math.PI/2
        else if(wtop && wleft) this.ground.setWall(xi, zi, 8); // B 2*Math.PI/4
        else if(wtop && wright) this.ground.setWall(xi, zi, 9); // B 1*Math.PI/4
        else if(wbottom && wleft) this.ground.setWall(xi, zi, 10); // B 3*Math.PI/2
        else if(wbottom && wright) this.ground.setWall(xi, zi, 11); // B 0*Math.PI/2
        else if(wbottom || wtop) this.ground.setWall(xi, zi, 12); // A 0*Math.PI/2
        else if(wleft || wright) this.ground.setWall(xi, zi, 13); // A 1*Math.PI/2
        else this.ground.setWall(xi, zi, 14); // D 1*Math.PI/2
    }

    cancelConstruct() {
        this.drafted = false;
        this.draftWall.length = 0;
        this.updated = true;
    }

    navvyReturn() {
        this.haveNavvy = false;
    }

    getFirstTodo() {
        return [this.todo[0], this.todo[1]];
    }

    update(dt) {
        if (this.todo.length && !this.haveNavvy) {
            this.haveNavvy = true;
            ee.emit('addEntity', { type: 'Navvy', origin: this._id });
        }
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
            const tiles = this.draftWall.tiles;

            let xAbs, zAbs;
            const xMax = this.ground.nbTileX;
            const zMax = this.ground.nbTileZ;
            let ctn = 0, i, k;
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

            const length = Math.min(ctn / 2, tiles.length / 2);

            for (i = 0; i < length; i++) {
                this.draftWall.valid[i] = 1;
            }

            const missing = this.missingResources(length);

            for (i = 0; i < length; i++) {
                if (!this.ground.grid.isWalkableAt(tiles[i * 2], tiles[i * 2 + 1]) && !this.ground.isWaterable(255, tiles[i * 2], tiles[i * 2 + 1]) || missing) {
                    for (k = 0; k < length; k++) {
                        this.draftWall.valid[k] = 0;
                    }
                    break;
                }
            }
            this.draftWall.length = length;
            this.updateShape();

            this.updated = true;
        }
    }

    updateShape() {
        const tiles = this.draftWall.tiles;
        const length = this.draftWall.length;
        const shape = this.draftWall.shape;
        let x, z;
        for (let i = 0; i < length; i++) {
            const currentX = tiles[i * 2];
            const currentZ = tiles[i * 2 + 1];
            this.draftGrid.set(top, 0);// haut
            this.draftGrid.set(bottom, 0); // bas
            this.draftGrid.set(right, 0);// droite
            this.draftGrid.set(left, 0);// gauche
            if (i > 0) {
                x = tiles[(i - 1) * 2] - currentX;
                z = tiles[(i - 1) * 2 + 1] - currentZ;
                this.draftGrid.set(x + 10 * z, 1);
            }
            if (i < length - 1) {
                x = tiles[(i + 1) * 2] - currentX;
                z = tiles[(i + 1) * 2 + 1] - currentZ;
                this.draftGrid.set(x + 10 * z, 1);
            }

            if (this.draftGrid.get(top) && this.draftGrid.get(bottom)) {
                shape[i * 2] = 0; // Mesh wall numero
                shape[i * 2 + 1] = 0;  // orientation
            } else if (this.draftGrid.get(right) && this.draftGrid.get(left)) {
                shape[i * 2] = 0;
                shape[i * 2 + 1] = 1;
            } else if (this.draftGrid.get(top) && this.draftGrid.get(left)) {
                shape[i * 2] = 1;
                shape[i * 2 + 1] = 2;
            } else if (this.draftGrid.get(top) && this.draftGrid.get(right)) {
                shape[i * 2] = 1;
                shape[i * 2 + 1] = 1;
            } else if (this.draftGrid.get(bottom) && this.draftGrid.get(left)) {
                shape[i * 2] = 1;
                shape[i * 2 + 1] = 3;
            } else if (this.draftGrid.get(bottom) && this.draftGrid.get(right)) {
                shape[i * 2] = 1;
                shape[i * 2 + 1] = 0;
            } else if (this.draftGrid.get(bottom) || this.draftGrid.get(top)) {
                shape[i * 2] = 0;
                shape[i * 2 + 1] = 0;
            } else if (this.draftGrid.get(right) || this.draftGrid.get(left)) {
                shape[i * 2] = 0;
                shape[i * 2 + 1] = 1;
            } else {
                shape[i * 2] = 0;
                shape[i * 2 + 1] = 0;
            }
        }
    }

    draftMove(x, y, z) {
        if (this.drafted) {
            const xi = Math.min(Math.max(Math.floor(x / this.tileSize), 0), this.ground.nbTileX - 1);
            const zi = Math.min(Math.max(Math.floor(z / this.tileSize), 0), this.ground.nbTileZ - 1);
            this.draftWall.tiles[0] = xi;
            this.draftWall.tiles[1] = zi;
            const walkable = this.ground.grid.isWalkableAt(xi, zi);
            const bank = this.ground.isBank(xi, zi);
            const height = this.ground.getHeightTile(xi, zi);
            if ((!walkable && !bank) || height > this.heightMax) {
                this.draftWall.valid[0] = 0;
            } else {
                this.draftWall.valid[0] = 1;
            }
            this.draftWall.length = 1;
            this.updateShape();
            this.updated = true;
        }
    }

    missingResources(length) {
        for (let key in this.cost) {
            this.cost[key] = length * this.costByTile[key];
            if (this.store.stats[key] < this.cost[key]) { //si pas assez de ressources
                return true;
            }
        }
        return false;
    }

    getCost() {
        const length = this.todo.length / 2;
        const cost = {};
        for (let key in this.cost) {
            if (this.costByTile[key])
                cost[key] = length * this.costByTile[key];
        }
        return cost;
    }

    onDismount() {
        ee.off('mouseDown', this._draftStart);
        ee.off('mouseMovePress', this._draftStaggering);
        ee.off('mouseMove', this._draftMove);
        ee.off('draftWall', this._draft);
        ee.off('mouseUp', this._startConstruct);
        ee.off('mouseClick', this._startConstruct);
        ee.off('mouseDownRight', this._cancelConstruct);
    }
}
