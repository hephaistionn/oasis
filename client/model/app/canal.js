const ee = require('../../kernel/tools/eventemitter');
const Stats = require('../../kernel/model/stats');

const Bridge  = 'Bridge';

module.exports = class Canal {

    constructor(config, ground, store) {
        this._id = 'canal';
        this.ground = ground;
        this.tileSize = ground.tileSize;
        this.drafted = false;
        this.maxTileDraft = 8;
        this.heightMax = 6;
        this.startXi;
        this.startZi;
        this.roadType;
        this.todo = [];
        this.cost;
        this.costByTile;
        this.store = store;
        this.haveNavvy = false;
        this.started = false; 

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
        this._removeCanal = this.removeCanal.bind(this);

        ee.on('mouseDown', this._draftStart);
        ee.on('mouseMovePress', this._draftStaggering);
        ee.on('mouseMove', this._draftMove);
        ee.on('draftCanal', this._draft);
        ee.on('mouseUp', this._startConstruct);
        ee.on('mouseClick', this._startConstruct);
        ee.on('mouseDownRight', this._cancelConstruct);
        ee.on('removeCanal', this._removeCanal);
    }

    removeCanal(tiles, l) {
        let xi, zi, i, o;
        for (i = 0; i < l; i++) {
            xi = tiles[i * 2];
            zi = tiles[i * 2 + 1];
            o = zi * this.ground.nbTileX + xi;
            // si il y a un pont
            if (this.ground.gridCanal[o] !== 0) {
                if(this.ground.isWalkable(xi, zi)) {
                    const ax = (xi+0.5) * this.ground.tileSize;
                    const az = (zi+0.5) * this.ground.tileSize;
                    const bridge = this.ground.ENTITIES[Bridge].instances.find(ins => ins.ax === ax && ins.az === az);
                    if(bridge) bridge.autoRemove();
                }
                this.ground.removeCanal(xi, zi);
                this.ground.grid.setWalkableAt(xi, zi, 1);
            }    
        }
        this.ground.updateCanalType();
        this.ground.initGridWater();
        this.updated = true;
        this.canalUpdated = true; //mauvaise pratique
    }

    draft() {
        this.drafted = true;
        this.cost = {[Stats.WOOD]: 0};
        this.costByTile = {[Stats.WOOD]: 1};
        this.constuctDuration = 1000;
    }

    startConstruct() {
        if (!this.drafted) return;
        const l = this.draftCanal.length;
        for (let i = 0; i < l; i++) {
            if(this.draftCanal.valid[i]>0) {
                this.todo.push(this.draftCanal.tiles[i*2]);
                this.todo.push(this.draftCanal.tiles[i*2+1]);
            }
        }
        this.started = true; // lance l'update cyclique
        this.drafted = false;
        this.draftCanal.length = 0;
        this.updated = true;
        this.canalUpdated = true; //mauvaise pratique
    }

    // un case est construite
    constructProgress() {
        const tile = this.todo.splice(0, 2);
        this.ground.grid.setWalkableAt(tile[0], tile[1], 0);
        this.ground.addCanal(tile[0], tile[1]);
        this.ground.updateCanalType();// la forme d'un block de canal dépend de ses voisins
        this.updated = true;
        this.canalUpdated = true; //mauvaise pratique
        if (!this.todo.length) { // terminé
            this.started = false; 
        }
    }
    
    cancelConstruct() {
        this.drafted = false;
        this.draftCanal.length = 0;
        this.updated = true;
    }

    navvyReturn() {
        this.haveNavvy = false;
    }

    getFirstTodo() {
        return [this.todo[0], this.todo[1]];
    }

    update(dt) {
        if(this.todo.length && !this.haveNavvy) {
            this.haveNavvy = true;
            ee.emit('addEntity', {type: 'Navvy', origin: this._id });
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
            const tiles = this.draftCanal.tiles;

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
                this.draftCanal.valid[i] = 1;
            }
            
            const missing = this.missingResources(length);
            let walkable, bank,  height, areaCanal, xi, zi;
            
            for (i = 0; i < length; i++) {
                xi = tiles[i * 2];
                zi = tiles[i * 2 + 1];
                walkable = this.ground.grid.isWalkableAt(xi, zi);
                bank = this.ground.isBank(xi, zi);
                height = this.ground.getHeightTile(xi, zi);
                areaCanal = this.ground.isAreaCanal(xi, zi);
                if (!walkable && !bank || missing || height > this.heightMax || areaCanal) {
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
            const xi = Math.min(Math.max(Math.floor(x / this.tileSize), 0), this.ground.nbTileX - 1);
            const zi = Math.min(Math.max(Math.floor(z / this.tileSize), 0), this.ground.nbTileZ - 1);
            this.draftCanal.tiles[0] = xi;
            this.draftCanal.tiles[1] = zi;
            const walkable = this.ground.grid.isWalkableAt(xi, zi);
            const bank = this.ground.isBank(xi, zi);
            const height = this.ground.getHeightTile(xi, zi);
            const areaCanal = this.ground.isAreaCanal(xi, zi);
            const missing = this.missingResources(1);
            if ((!walkable && !bank) || height > this.heightMax || areaCanal  || missing) {
                this.draftCanal.valid[0] = 0;
            } else {
                this.draftCanal.valid[0] = 1;
            }
            this.draftCanal.length = 1;
            this.updated = true;
        }
    }

    missingResources(length) {
        for (let key in this.cost) {
            this.cost[key] = length * this.costByTile[key];
            if(this.store.stats[key] < this.cost[key]) { //si pas assez de ressources
                return true;
            }
        }
        return false;
    }

    getCost() {
        const length = this.todo.length/2;
        const cost = {};
        for (let key in this.cost) {
            if(this.costByTile[key])
                cost[key] = length * this.costByTile[key];
        }
        return cost;
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
