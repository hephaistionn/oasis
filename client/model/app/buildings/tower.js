const Building = require('../../../kernel/model/building');
const ee = require('../../../kernel/tools/eventemitter');
const Stats = require('../../../kernel/model/stats');
const MILITIAMAN = "Militiaman";

class Tower extends Building {

    constructor(config, ground) {
        super(config, ground);
        this.cycleDuration = 0; // delay entre chaque tir
        this.shootDuration = 300; // delay avant impact
        this.scope = 12;
        this.degat = 10;

        this.weaponDirectionY = 0;
        this.weaponHeight = this.ay + 4;
        this.shooting = false; // true si vient de tirer
        this.cycleProgress = 0;
        this.shootProgress = 0;
        this.targetId;
        this.targetDx;
        this.targetDz;
        this.targetDy;
        this.mustStop = false;

        if (!this.drafted) {
            this._wakeup = this.wakeup.bind(this);
            ee.on('alert-on', this._wakeup);
            this._sleep = this.sleep.bind(this);
            ee.on('alert-off', this._sleep);
        }
    }

    wakeup() {
        this.started = true;
        this.cycleDuration = 350;

    }

    sleep() {
        this.mustStop = true;
    }

    update(dt) {
        if (this.level > 0) {  // doit être construit pour fonctionner
            this.cycleProgress += dt;
            if (this.cycleProgress >= this.cycleDuration) {
                this.cycleProgress = 0;
                this.working();
            }

            const target = this.ground.getEntity(this.targetId);

            if (this.shooting) {
                this.shootProgress += dt;
                if (this.shootProgress >= this.shootDuration) {
                    if (target) target.hit(this.degat);
                    this.reload();
                }
            }

            if (target) {
                this.targetDx = target.ax - this.ax;
                this.targetDz = target.az - this.az;
                this.targetDy = target.ay - this.weaponHeight;
                this.weaponDirectionY = this.targetY(this.targetDx, this.targetDz);
            }
        }
    }

    reload() {
        this.shooting = false;
        this.shootProgress = 0;
        this.targetId = null;
    }

    working() {
        const target = this.foundTarget();
        if (target) {
            this.targetId = target._id;
            this.shooting = true;
        } else {
            this.reload();
            if (this.mustStop && !this.ground.ENTITIES[MILITIAMAN].instances.length) {
                this.started = false;
                this.mustStop = false;
            }
        }
    };

    foundTarget() {
        return this.ground.ENTITIES[MILITIAMAN].instances.filter(sol => sol.enemy === true)
            .filter(sol => Math.abs(sol.ax - this.ax) < this.scope && Math.abs(sol.az - this.az) < this.scope)
            .sort((solA, solB) => (Math.abs(solA.ax - this.ax) + Math.abs(solA.az - this.az)) - (Math.abs(solB.ax - this.ax) + Math.abs(solB.az - this.az)))[0];
    }

    targetY(dx, dz) {
        return Math.atan2(dz, dx);
    }

    onDismount() {
        super.onDismount();
        if (!this.drafted) {
            ee.off('alert-on', this._wakeup);
            ee.off('alert-off', this._sleep);
        }
    }
}

Tower.removable = true;
Tower.levelMax = 2;
Tower.description = 'This building increase the enable places for your population';
Tower.tileX = 1;
Tower.tileZ = 1;
Tower.walkable = 0;
Tower.cost = { [Stats.WOOD]: 5 };
Tower.upgrade = [{},{[Stats.WOOD]: 5}];
Tower.require = { inactive: 2 };
Tower.enabled = { population: 4 };
Tower.waterLevelNeeded = 0;
Tower.constuctDuration = 1000;
Tower.instances = [];

module.exports = Tower;
