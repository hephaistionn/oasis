const Building = require('../../../kernel/model/building');
const ee = require('../../../kernel/tools/eventemitter');
const Stats = require('../../../kernel/model/stats');

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
            ee.on('alert-on', this._spawnStart);
            this._spawnStop = this.spawnStop.bind(this);
            ee.on('alert-off', this._spawnStop);
        }
    }

    spawnStart() {
        this.working = true;
    }

    spawnStop() {
        this.working = false;
    }

    update(dt) {
        if (this.working === false) return;
        this.cycleProgress += dt
        if (this.cycleProgress > this.cycleDuration) {
            this.cycleProgress = 0;
            this.spawn();
            if (this.count >= this.quantity) {
                this.spawnStop();
            }
        }
    }

    spawn() {
        this.spawnCharacter('Militiaman');
        this.count++
    }

    onDismount() {
        super.onDismount();
        if (!this.drafted) {
            ee.off('alert-on', this._spawnStart);
            ee.off('alert-off', this._spawnStop);
        }    
    }
}

Barrack.selectable = true;
Barrack.removable = true;
Barrack.levelMax = 1;
Barrack.description = 'Increase the enable places for your population';
Barrack.label = 'Caserne';
Barrack.picture = '/pic/house.png';
Barrack.display = [];
Barrack.tileX = 1;
Barrack.tileZ = 1;
Barrack.walkable = 0;
Barrack.cost = {[Stats.WOOD]: 5};
Barrack.require = { inactive: 2 };
Barrack.enabled = { population: 6 };
Barrack.constuctDuration = 1000;
Barrack.waterLevelNeeded = 0;
Barrack.instances = [];

module.exports = Barrack;