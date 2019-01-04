const Building = require('../../../kernel/model/building');
const ee = require('../../../kernel/tools/eventemitter');
const Stats = require('../../../kernel/model/stats');
const MILITIAMAN = "Militiaman";

class Tower extends Building {

    constructor(config, ground) {
        super(config, ground);
        this.scope = 40;
        this.degat = 50;
        this.weaponDirectionY = 0;
        this.weaponDirectionZ = 0;
        this.weaponHeight = this.ay + 4;
    }

    wakeup() {
        this.cycleDuration = 2000;
    }

    sleep() {
        this.cycleDuration = 0;
    }

    working() {
        const target = this.foundTarget();
        const dx = target.ax - this.ax;
        const dz = target.az - this.az;
        const dy = target.ay - this.weaponHeight;
        this.weaponDirectionY = this.targetY(dx, dz);
        this.weaponDirectionZ = this.targetZ(dx, dz, dy);
        target.hit(this.degat);
    };

    foundTarget() {
        return this.ground.ENTITIES[MILITIAMAN].instances.filter(sol => sol.enemy === true)
            .filter(sol => Math.abs(sol.ax - this.ax) < this.scope && Math.abs(sol.az - this.az) < this.scope)
            .sort((solA, solB) => (Math.abs(solA.ax - this.ax) + Math.abs(solA.az - this.az)) - (Math.abs(solB.ax - this.ax) + Math.abs(solB.az - this.az)))[0];
    }

    targetY(dx, dz) {
        return Math.atan2(dz, dx);
    }

    targetZ(dx, dz, dy) {
        const l = Math.hypot(dx, dz);
        const angleZ = Math.atan2(dy, l);
    }
}

Tower.removable = true;
Tower.description = 'This building increase the enable places for your population';
Tower.tileX = 1;
Tower.tileZ = 1;
Tower.walkable = 0;
Tower.cost = { [Stats.WOOD]: 5 };
Tower.require = { inactive: 2 };
Tower.enabled = { population: 4 };
Tower.waterLevelNeeded = 0;
Tower.constuctDuration = 1000;
Tower.instances = [];

module.exports = Tower;
