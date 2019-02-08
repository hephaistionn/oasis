const Stats = require('./stats');

class Resource {

    constructor(config, ground) {
        this.ax = 0;
        this.ay = 0;
        this.az = 0;
        this.aroty = 0;
        this.soldout = false;
        this.selected = false;
        this._id = config._id ? parseInt(config._id, 10) : Math.floor((1 + Math.random()) * 0x10000000000);
        this.move(config.x || 0, config.y || 0, config.z || 0, config.a || 0);
        this.constructor.instances.push(this);
        this.stats = new Stats(null, false);
        this.ground = ground;
    }

    move(x, y, z, a) {
        if (a !== undefined) {
            this.aroty = a;
        }
        this.ax = x;
        this.az = z;
        this.ay = y;
    }

    select(selected) {
        this.selected = selected;
        this.updated = true;
    }

    getTiles() {
        let xNbTile = this.constructor.tileX;
        let zNbTile = this.constructor.tileZ;

        const tileSize = this.ground.tileSize;
        const xFirstTile = Math.floor(this.ax / tileSize);
        const zFirstTile = Math.floor(this.az / tileSize);
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

    getDirection(ax, az) {
        return Math.atan2(this.az - az, this.ax - ax);
    }

    getWorkerSlot() {
        const a = Math.random() * Math.PI * 2;
        const x = this.ax + Math.cos(a) * 1;
        const z = this.az + Math.sin(a) * 1;
        return { x: x, y: this.ay, z: z, rotY: a + Math.PI }
    }

    onMount(parent) {
        if (this.constructor.walkable !== undefined) {
            this.ground.setWalkable(this);
        }
        this._parent = parent;
    }

    onDismount() {
        this.ground.setWalkable(this, 1);
        const index = this.constructor.instances.indexOf(this);
        this.constructor.instances.splice(index, 1);
        this._child.forEach((children) => {
            this.remove(children);
        });
    }

}


Resource.entity = true;

module.exports = Resource; 