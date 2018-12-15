const ee = require('../../kernel/tools/eventemitter');

module.exports = class Remover {

    constructor(config, ground) {
        this._id = config._id ? parseInt(config._id, 10) : Math.floor((1 + Math.random()) * 0x10000000000);
        this.ground = ground;
        this.tileSize = ground.tileSize;
        this.enable = false;
        this.maxTile = 24;
        this.heightMax = 6;
        this.startXi;
        this.startZi;

        this.area = {
            tiles: new Uint16Array(2 * this.maxTile),
            remove: new Uint8Array(this.maxTile),
            length: 0
        };

        this._areaStart = this.areaStart.bind(this);
        this._areaStaggering = this.areaStaggering.bind(this);
        this._areaMove = this.areaMove.bind(this);
        this._active = this.active.bind(this);
        this._startRemove = this.startRemove.bind(this);
        this._cancelRemove = this.cancelRemove.bind(this);

        ee.on('mouseDown', this._areaStart);
        ee.on('mouseMovePress', this._areaStaggering);
        ee.on('mouseMove', this._areaMove);
        ee.on('remover', this._active);
        ee.on('mouseUp', this._startRemove);
        ee.on('mouseClick', this._startRemove);
        ee.on('mouseDownRight', this._cancelRemove);
    }

    active() {
        this.enable = true; 
    }

    startRemove() {
        if(!this.enable) return;
        const l = this.area.length * 2;
        this.enable = false;
        this.area.length = 0;
        this.updated = true;
    }

    cancelRemove() {
        this.enable = false;
        this.area.length = 0;
        this.updated = true;
    }


    areaStart(xR, zR, x, z) {
        if (this.enable) {
            this.startXi = Math.floor(x / this.tileSize);
            this.startZi = Math.floor(z / this.tileSize);
        }
    }

    areaStaggering(dxR, dzR, x, z) {
        if (this.enable) {
            x = Math.floor(x / this.tileSize);
            z = Math.floor(z / this.tileSize);

            let x1, x2, z1, z2, ctn = 0;

            x1 = x > this.startXi ? this.startXi : x;
            x2 = x > this.startXi ? x : this.startXi;
            z1 = z > this.startZi ? this.startZi : z;
            z2 = z > this.startZi ? z : this.startZi;
            x2++;
            z2++;

            const tiles = this.area.tiles;

            for(let xi=x1; xi<x2; xi++) {
                for(let zi=z1; zi<z2; zi++) {
                    tiles[ctn++] = xi;
                    tiles[ctn++] = zi;
                }
            }

            const length = Math.min(ctn / 2, tiles.length / 2);

            for (let i = 0; i < length; i++) {
                this.area.remove[i] = 1;
            }

            this.area.length = length;
            this.updated = true;
        }
    }

    areaMove(x, y, z) {
        if (this.enable) {
            const xi = Math.floor(x / this.tileSize);
            const zi = Math.floor(z / this.tileSize);
            this.area.tiles[0] = xi;
            this.area.tiles[1] = zi;
            const height = this.ground.getHeightTile(xi, zi);
            this.area.remove[0] = 1;
            this.area.length = 1;
            this.updated = true;
        }
    }

    onDismount() {
        ee.off('mouseDown', this._areaStart);
        ee.off('mouseMovePress', this._areaStaggering);
        ee.off('mouseMove', this._areaMove);
        ee.off('areaRoad', this._draft);
        ee.off('mouseUp', this._startRemove);
        ee.off('mouseClick', this._startRemove);
        ee.off('mouseDownRight', this._cancelRemove);
    }
}
