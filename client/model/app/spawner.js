const pathfinding = require('../../kernel/tools/pathfinding');
const ee = require('../../kernel/tools/eventemitter');

module.exports = class Spawner {

    constructor(config, ground) {
        this.ground = ground;
        this.cycleDuration = 8000;
        this.cycleProgress = 0;
        this.count = 0;
        this.quantity = 4;
        this.working = false;
        window.spawn  = this;
    }

    update(dt) {
        if(this.working === false) return;
        this.cycleProgress += dt
        if (this.cycleProgress > this.cycleDuration) {
            this.cycleProgress = 0;
            this.spawn();
            if (this.count > this.quantity) {
                this.working = false;
            }
        }
    }

    spawn() {
        const tile = this.ground.getFreeRandomBorder();
        ee.emit('addEntity', { x: tile[0], y: tile[1], z: tile[2], type: 'Militiaman', enemy: true });
        ee.emit('alert');
        this.count++;
    }

    dismount() {

    }
}
