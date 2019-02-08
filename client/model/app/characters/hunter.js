const Character = require('../../../kernel/model/character');
const ee = require('../../../kernel/tools/eventemitter');
const Stats = require('../../../kernel/model/stats');
const Tree = 'Tree';
const HunterHut = 'HunterHut';
const Game = 'Game';
const Repository = 'Repository'

class Hunter extends Character {
    constructor(params, ground) {
        super(params, ground);
        this.capacity = 5;
        this.workingDuration = 4000;
        this.targets.push({ entity: Game, resource: Stats.MEAT, remote: 0 });
        this.targets.push({ entity: Repository});
        this.targets.push({ id: this.origin });
    }

    onEndPath(entity) {
        if (entity.constructor.name === Repository) {
            const value = this.stats.pull(Stats.MEAT, this.capacity);
            entity.pushResource(Stats.MEAT, value);
        } else if (entity.constructor.name === HunterHut) {
            entity.working();
        } else if (entity.constructor.name === Game) {
            this.working = true;
            const a = entity.getDirection(this.ax, this.az);
            this.move(this.ax, this.ay, this.az, a);
        }
    }

    onStartPath(entity) {
        if (entity.constructor.name === Game) {
            const value = entity.stats.pull(Stats.MEAT, this.capacity);
            this.stats.push(Stats.MEAT, value);
        }
    }
}

Hunter.selectable = true;
Hunter.description = 'This building increase the enable places for your population';
Hunter.label = 'Chasseur';
Hunter.picture = '/pic/peon.png';
module.exports = Hunter;