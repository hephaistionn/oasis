const Stats = require('./stats');

class Resource {

    constructor(config) {
        this.ax = 0;
        this.ay = 0;
        this.az = 0;
        this.aroty = 0;
        this.soldout = false;
        this.selected = false;
        this._id = config._id ? parseInt(config._id, 10) : Math.floor((1 + Math.random()) * 0x10000000000);
        this.move(config.x || 0, config.y || 0, config.z || 0, config.a || Math.floor(Math.random() * 3.99) * Math.PI);
        this.constructor.instances.push(this);
        this.stats = new Stats(config, false);
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
        const tileSize = 4;
        return [this.ax / tileSize - 0.5, this.az / tileSize - 0.5];
    }

    onDismount() {
        const index = this.constructor.instances.indexOf(this);
        this.constructor.instances.splice(index, 1);
        this._child.forEach((children) => {
            this.remove(children);
        });
    }

}


Resource.entity = true;

module.exports = Resource; 