const ee = require('../tools/eventemitter');
const Stats = require('./stats');

class Building {
    
    constructor(config) {
        this._id = config._id ? parseInt(config._id, 10) : Math.floor((1 + Math.random()) * 0x10000000000);
        this._parent = null;
        this._child = [];
        this.x = config.x || 0;
        this.z = config.z || 0;
        this.y = config.y || 0;
        this.roty = config.rot || 0;
        this.ax = this.x;
        this.ay = this.y;
        this.az = this.z;
        this.aroty = this.roty;
        this.drafted = config.drafted || false;
        this.builded = config.builded || false;
        this.undroppable = false;
        this.selected = false;
        this.updated = true;
        this.stats = new Stats(config, true);
        this.constructor.instances.push(this);
    }

    move(x, y, z, roty) {
        this.updated = true;
        if (x !== undefined) this.x = x;
        if (y !== undefined) this.y = y;
        if (z !== undefined) this.z = z;
        if (roty !== undefined) this.roty = roty;

        this.ax = this._parent.ax + this.x * Math.cos(this._parent.aroty) - this.z * Math.sin(this._parent.aroty);
        this.ay = this._parent.ay + this.y;
        this.az = this._parent.az + this.x * Math.sin(this._parent.aroty) + this.z * Math.cos(this._parent.aroty);
        this.aroty = (this.roty + this._parent.aroty) % (Math.PI * 2);

        for (let i = 0; i < this._child.length; i++) {
            this._child[i].move()
        }

        this.onMove();
    }

    add(child) {
        if (this._child.indexOf(child) === -1) {
            this._child.push(child);
            child.onMount(this);
            child.move();
        }
        ee.emit('addEntity', child);
    }

    getTiles() {
        let xNbTile = this.constructor.tileX;
        let zNbTile = this.constructor.tileZ;

        if (this.aroty !== 0 && this.aroty !== Math.PI) {
            xNbTile = this.constructor.tileZ;
            zNbTile = this.constructor.tileX;
        }
        const tileSize = 4;
        const xFirstTile = this.ax / tileSize - xNbTile / 2;
        const zFirstTile = this.az / tileSize - zNbTile / 2;
        const xLastTile = xFirstTile + xNbTile;
        const zLastTile = zFirstTile + zNbTile;

        const tiles = [];
        for (let xi = xFirstTile; xi < xLastTile; xi++) {
            for (let zi = zFirstTile; zi < zLastTile; zi++) {
                tiles.push(xi);
                tiles.push(zi);
            }
        }
        return tiles;
    }

    select(selected) {
        this.selected = selected;
        this.updated = true;
    }

    spawnCharacter(typeCharacter) {
        ee.emit('addEntity', { x: this.ax, y: this.ay, z: this.az, type: typeCharacter });
    }

    remove(child) {
        if (!child) return;
        const index = this._child.indexOf(child);
        this._child.splice(index, 1);
        child.onDismount();
        ee.emit('onRemoveEntity', child);
    }

    setDropable(dropable) {
        this.undroppable = !dropable;
    }

    onMove() {

    }

    onMount(parent) {
        this._parent = parent;
    }

    onDismount() {
        const index = this.constructor.instances.indexOf(this);
        this.constructor.instances.splice(index, 1);
        this._child.forEach((children) => {
            this.remove(children);
        });
    }

}

Building.entity = true;

module.exports = Building;
