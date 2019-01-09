const ee = require('../tools/eventemitter');
const Stats = require('./stats');

class Building {

    constructor(config, ground) {
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
        this.undroppable = false;
        this.selected = false;
        this.updated = true;
        this.stats = new Stats(config, true);
        this.materials = new Stats(config);
        this.cycleDuration = 0;
        this.cycleProgress = 0;
        this.started = false;
        this.level = config.level || 0;
        this.ground = ground;
        if (this.drafted) {
            this._moveDraft = this.moveDraft.bind(this);
            this._startConstruct = this.startConstruct.bind(this);
            this._cancelConstruct = this.cancelConstruct.bind(this);
            ee.on('mouseMove', this._moveDraft);
            ee.on('mouseClick', this._startConstruct);
            ee.on('mouseDownRight', this._cancelConstruct);
        } else {
            this.constructor.instances.push(this);
        }
    }

    update(dt) {
        if (this.level > 0) {  // doit être construit pour fonctionner
            this.cycleProgress += dt;
            if (this.cycleProgress >= this.cycleDuration) {
                this.cycleProgress = 0;
                this.working();
            }
        }
    }

    start() { //start cyclical event working if cycleDuration exit
        if (!this.drafted) {
            if (this.cycleDuration) {
                this.started = true;
            }
            this.constructing();
        }
    }

    reStart() {
        if (this.cycleDuration) {
            this.started = true;
        }
    }

    onStart() { // must be overwrite

    }

    constructing(type, value) { // must called by Builder
        if (this.level === 0) {
            this.updated = true;
            let ready = true;
            if (type && value) {
                this.materials.push(type, value);
            }
            for (let key in this.constructor.cost) {
                if (this.materials[key] < this.constructor.cost[key]) {
                    ready = false;
                }
            }
            if (!ready) {
                this.spawnCharacter('Provider');
            } else {
                this.spawnCharacter('Builder')
            }
        }
    }

    delivery() { // Le batiment est terminé
        this.updated = true;
        this.level = 1;
        this.onStart();
    }

    working() { // called cyclically or manualy, must be overwrite

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
            this._child[i].move();
        }

        this.onMove();
    }

    add(child) {
        if (this._child.indexOf(child) === -1) {
            this._child.push(child);
            child.onMount(this);
            child.move();
        }
    }

    getTiles() {
        let xNbTile = this.constructor.tileX;
        let zNbTile = this.constructor.tileZ;

        if (this.aroty !== 0 && this.aroty !== Math.PI) {
            xNbTile = this.constructor.tileZ;
            zNbTile = this.constructor.tileX;
        }
        const tileSize = this.ground.tileSize;
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

    spawnCharacter(typeCharacter, option) {
        const config = { x: this.ax, y: this.ay, z: this.az, type: typeCharacter, origin: this._id };
        Object.assign(config, option);
        ee.emit('addEntity', config);
    }

    remove(child) {
        if (!child) return;
        const index = this._child.indexOf(child);
        this._child.splice(index, 1);
        child.onDismount();
        ee.emit('onRemoveEntity', child);
    }

    startConstruct() {
        if (this.drafted && !this.undroppable) {
            ee.emit('addEntity', {
                x: this.ax, y: this.ay, z: this.az, rot:this.aroty,
                type: this.constructor.name
            });
            ee.emit('removeEntity', this._id);
        }
    }

    cancelConstruct() {
        if (this.drafted) {
            ee.emit('removeEntity', this._id);
        }
    }

    isWalkable() {
        const tiles = this.getTiles();
        return this.ground.isWalkable(tiles);
    }

    onMove() {
        if (this.drafted) {
            const tiles = this.getTiles();
            const walkable = this.ground.isWalkable(tiles);
            const waterable = this.ground.isWaterable(this.constructor.waterLevelNeeded, tiles);
            this.undroppable = !walkable || !waterable;
        }
    }

    onMount(parent) {
        if (!this.drafted) {
            if (this.constructor.walkable !== undefined) {
                this.ground.setWalkable(this);
            }
        }
        this._parent = parent;
    }

    moveDraft(x, y, z) {
        if (this.drafted) {
            const tile = this.ground.getTileCenter(x, z);
            this.move(tile.x, tile.y, tile.z);
        }
    }

    onDismount() {
        if (this.drafted) {
            ee.off('mouseMove', this._moveDraft);
            ee.off('mouseClick', this._startConstruct);
            ee.off('mouseDownRight', this._cancelConstruct);
        } else {
            this.ground.setWalkable(this, !this.constructor.walkable ? 1 : 0);
            if (this.constructor.wall) {
                this.ground.setWall(Math.floor(this.ax / this.ground.tileSize), Math.floor(this.az / this.ground.tileSize), 0)
            }
            const index = this.constructor.instances.indexOf(this);
            this.constructor.instances.splice(index, 1);
        }
        this._child.forEach((children) => {
            this.remove(children);
        });
    }

    hit() {

    }

}

Building.entity = true;

module.exports = Building;
