const Building = require('../../../kernel/model/building');
const ee = require('../../../kernel/tools/eventemitter');

class Barrack extends Building {

    constructor(config, ground) {
        super(config, ground);
        this.quantity = 5;
        this.cycleDuration = 5000;
        this.cycleProgress = 0;
        this.count = 0;
        this.working = false;
        if (!this.drafted) {
            this._spawnStart = this.spawnStart.bind(this);
            ee.on('alert', this._spawnStart);
        }
    }

    spawnStart() {
        this.working = true;
    }

    update(dt) {
        if (this.working === false) return;
        this.cycleProgress += dt
        if (this.cycleProgress > this.cycleDuration) {
            this.cycleProgress = 0;
            this.spawn();
            if (this.count >= this.quantity) {
                this.working = false;
            }
        }
    }

    spawn() {
        ee.emit('addEntity', { x: this.ax, y: this.ay, z: this.az, type: 'Militiaman' });
        this.count++
    }

    onDismount() {
        super.onDismount();
        if (!this.drafted)
            ee.off('alert', this._spawnStart);
    }
}

Barrack.removable = true;
Barrack.description = 'This building increase the enable places for your population';
Barrack.tileX = 1;
Barrack.tileZ = 1;
Barrack.walkable = 0;
Barrack.cost = { wood: 5, stone: 2 };
Barrack.require = { inactive: 2 };
Barrack.enabled = { population: 6 };
Barrack.constuctDuration = 1000;
Barrack.waterLevelNeeded = 0;
Barrack.instances = [];

module.exports = Barrack;