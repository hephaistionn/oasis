const ee = require('../../kernel/tools/eventemitter');
const Stats = require('../../kernel/model/stats');

const topD = -10; // 10*1  haut
const bottomD = 10; //10*-1 bas
const rightD = 1;  //1 droite
const leftD = -1;  //-1 gauche
const WallBlock = 'WallBlock';

module.exports = class Wall {

    constructor(config, ground, store) {
        this._id = 'wall';
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
        let xi, zi;
        for (let i = 0; i < l; i++) {
            if (this.draftWall.valid[i] > 0) {
                xi = this.draftWall.tiles[i * 2];
                zi = this.draftWall.tiles[i * 2 + 1];
                this.todo.push(xi);
                this.todo.push(zi);
                this.ground.setWall(xi, zi, 1);
                this.updateWallShape(xi, zi);
                if (xi > 0) this.updateWallShape(xi - 1, zi);
                if (xi < this.nbTileX - 2) this.updateWallShape(xi + 1, zi);
                if (zi > 0) this.updateWallShape(xi, zi - 1);
                if (zi < this.nbTileZ - 2) this.updateWallShape(xi, zi + 1);
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
        const xi = tile[0];
        const zi = tile[1];
        const wallShape = this.ground.getWall(xi, zi);
        const shape = this.ground.wallShape[wallShape * 2];
        const angle = this.ground.wallShape[wallShape * 2 + 1] * Math.PI / 2;

        ee.emit('addEntity', {
            x: (xi + 0.5) * this.tileSize,
            y: this.ground.getHeightTile(xi, zi),
            z: (zi + 0.5) * this.tileSize,
            rot: angle,
            shape: shape,
            level: 1,
            type: WallBlock
        });

        if (!this.todo.length) { // terminé
            this.started = false;
        }
        this.updated = true;
    }

    updateWallShape(xi, zi) {
        if (!this.ground.getWall(xi, zi)) return;
        const top = this.ground.getWall(xi, zi - 1);
        const bottom = this.ground.getWall(xi, zi + 1);
        const right = this.ground.getWall(xi + 1, zi);
        const left = this.ground.getWall(xi - 1, zi);

        if (top && bottom && left && right) this.ground.setWall(xi, zi, 2);
        else if (top && bottom && left) this.ground.setWall(xi, zi, 3);
        else if (top && bottom && right) this.ground.setWall(xi, zi, 4);
        else if (right && left && bottom) this.ground.setWall(xi, zi, 5);
        else if (right && left && top) this.ground.setWall(xi, zi, 6);
        else if (top && left) this.ground.setWall(xi, zi, 7);
        else if (top && right) this.ground.setWall(xi, zi, 8);
        else if (bottom && left) this.ground.setWall(xi, zi, 9);
        else if (bottom && right) this.ground.setWall(xi, zi, 10);
        else if (bottom || top) this.ground.setWall(xi, zi, 11);
        else if (left || right) this.ground.setWall(xi, zi, 12);
        else this.ground.setWall(xi, zi, 2);
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
            this.updateDraftShape();

            this.updated = true;
        }
    }

    updateDraftShape() {
        const tiles = this.draftWall.tiles;
        const length = this.draftWall.length;
        const shape = this.draftWall.shape;
        const wallShape = this.ground.wallShape;

        let x, z, k;
        for (let i = 0; i < length; i++) {
            const currentX = tiles[i * 2];
            const currentZ = tiles[i * 2 + 1];
            this.draftGrid.set(topD, 0);// haut
            this.draftGrid.set(bottomD, 0); // bas
            this.draftGrid.set(rightD, 0);// droite
            this.draftGrid.set(leftD, 0);// gauche
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

            const top = this.ground.getWall(currentX, currentZ - 1) || this.draftGrid.get(topD);
            const bottom = this.ground.getWall(currentX, currentZ + 1) || this.draftGrid.get(bottomD);
            const right = this.ground.getWall(currentX + 1, currentZ) || this.draftGrid.get(rightD);
            const left = this.ground.getWall(currentX - 1, currentZ) || this.draftGrid.get(leftD);

            if (top && bottom && left && right) k = 2;
            else if (top && bottom && left) k = 3;
            else if (top && bottom && right) k = 4;
            else if (right && left && bottom) k = 5;
            else if (right && left && top) k = 6;
            else if (top && left) k = 7;
            else if (top && right) k = 8;
            else if (bottom && left) k = 9;
            else if (bottom && right) k = 10;
            else if (bottom || top) k = 11;
            else if (left || right) k = 12;
            else k = 2;
            shape[i * 2] = wallShape[k * 2];
            shape[i * 2 + 1] = wallShape[k * 2 + 1];
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
            this.updateDraftShape();
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
