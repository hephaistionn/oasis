const Character = require('../../../kernel/model/character');
const ee = require('../../../kernel/tools/eventemitter');
const Stats = require('../../../kernel/model/stats');
const Tree = 'Tree';
const ForestHut = 'ForestHut';
const Repository = 'Repository';

class Lumberjack extends Character {
    constructor(params, ground) {
        super(params, ground);
        this.capacity = 5;
        this.workingDuration = 4000; 
        this.targets.push({ entity: Tree, resource: Stats.WOOD });
        this.targets.push({ entity: Repository});
        this.targets.push({ id: this.origin });
    }

    onEndPath(entity) {
        if (entity.constructor.name === Repository) {
            const value = this.stats.pull(Stats.WOOD, this.capacity);
            entity.stats.push(Stats.WOOD, value);
        } else if (entity.constructor.name === Tree) {
            this.working = true;
            const place = entity.getWorkerSlot();
            this.move(place.x, place.y, place.z, place.rotY);
        } else if (entity.constructor.name === ForestHut){
            entity.working()
        }
    }

    onStartPath(entity) {
        if (entity.constructor.name === Tree) {
            const value = entity.stats.pull(Stats.WOOD, this.capacity);
            this.stats.push(Stats.WOOD, value);
        }
    }
}

module.exports = Lumberjack;