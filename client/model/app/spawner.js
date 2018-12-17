const pathfinding = require('../../kernel/tools/pathfinding');
const ee = require('../../kernel/tools/eventemitter');

module.exports = class Spawner {

    constructor(config, ground) {
        this.ground = ground;
        this.cycleDuration = 5000;
        this.cycleProgress = 0;
        this.count = 0;
    }

    update(dt) {
        if (this.cycleDuration === 0) return;
        this.cycleProgress += dt
        if (this.cycleProgress > this.cycleDuration) {
            this.cycleProgress = 0;
            this.spawn();
            if (this.count > 2) {
                this.stop();
                ee.emit('alert');
            }
        }
    }

    spawn() {
        const tile = this.ground.getFreeRandomBorder();
        ee.emit('addEntity', { x: tile[0], y: tile[1], z: tile[2], type: 'Militiaman', enemy: true });
        this.count++;

        ee
        console.log('----pop----');
    }

    start() {
        this.cycleDuration = 4000;
    }

    stop() {
        this.cycleDuration = 0;
    }

    dismount() {

    }
}
