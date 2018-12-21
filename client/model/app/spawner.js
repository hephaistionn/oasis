const pathfinding = require('../../kernel/tools/pathfinding');
const ee = require('../../kernel/tools/eventemitter');
const REPOSITORY = 'Repository';

module.exports = class Spawner {

    constructor(config, ground) {
        this.ground = ground;
        this.cycleDuration = 8000;
        this.cycleProgress = 0;
        this.count = 0;
        this.quantity = 4;
        this.working = true;
        window.spawn  = this;
    }

    update(dt) {
        this.cycleProgress += dt
        if (this.cycleProgress > this.cycleDuration) {
            this.cycleProgress = 0;
            const repository = this.ground.ENTITIES[REPOSITORY].instances;
            if(repository.length && this.count <= this.quantity) {
                this.spawn();
                this.count++;
            }
        }
    }

    spawn() {
        console.log('SPAWN')
        const tile = this.ground.getFreeRandomBorder();
        ee.emit('addEntity', { x: tile[0], y: tile[1], z: tile[2], type: 'Militiaman', enemy: true });
        ee.emit('alert');
        
    }

    dismount() {

    }
}
