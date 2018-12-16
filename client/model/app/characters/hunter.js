const Character = require('../../../kernel/model/character');
const ee = require('../../../kernel/tools/eventemitter');
const Stats = require('../../../kernel/model/stats');
const Tree = 'Tree';
const HunterHut = 'HunterHut';
const Berry = 'Berry';

class Hunter extends Character {
    constructor(params, ground) {
        super(params, ground);
        this.capacity = 5;
        this.workingDuration = 4000;
        this.targets.push({ entity: Berry, resource: Stats.BERRY, remote: 1 });
        this.targets.push({ id: this.origin });
    }

    onEndPath(entity) {
        if (entity.constructor.name === HunterHut) {
            const value = this.stats.pull(Stats.BERRY, this.capacity);
            entity.stats.push(Stats.BERRY, value);
            entity.working();
        } else if (entity.constructor.name === Berry) {
            this.working = true;
            const a = entity.getDirection(this.ax, this.az);
            this.move(this.ax, this.ay, this.az, a);
        }
    }

    onStartPath(entity) {
        if (entity.constructor.name === Berry) {
            const value = entity.stats.pull(Stats.BERRY, this.capacity);
            this.stats.push(Stats.BERRY, value);
        }
    }
}

module.exports = Hunter;