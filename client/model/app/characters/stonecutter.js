const Character = require('../../../kernel/model/character');
const ee = require('../../../kernel/tools/eventemitter');
const Stats = require('../../../kernel/model/stats');
const Stone = 'Stone';
const StoneMine = 'StoneMine';
const Repository = 'Repository';

class Stonecutter extends Character {
    constructor(params, ground) {
        super(params, ground);
        this.capacity = 5;
        this.workingDuration = 4000; 
        this.targets.push({ entity: Stone, resource: Stats.STONE });
        this.targets.push({ entity: Repository});
        this.targets.push({ id: this.origin });
    }

    onEndPath(entity) {
        if (entity.constructor.name === Repository) {
            const value = this.stats.pull(Stats.STONE, this.capacity);
            entity.pushResource(Stats.STONE, value);
        } else if (entity.constructor.name === Stone) {
            this.working = true;
            const place = entity.getWorkerSlot();
            this.move(place.x, place.y, place.z, place.rotY);
        } else if (entity.constructor.name === StoneMine){
            entity.working()
        }
    }

    onStartPath(entity) {
        if (entity.constructor.name === Stone) {
            const value = entity.stats.pull(Stats.STONE, this.capacity);
            this.stats.push(Stats.STONE, value);
        }
    }
}

Stonecutter.description = 'This building increase the enable places for your population';
Stonecutter.label = 'Mineur';
Stonecutter.selectable = true;
Stonecutter.picture = '/pic/peon.png';
module.exports = Stonecutter;