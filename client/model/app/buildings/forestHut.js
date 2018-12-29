const Building = require('../../../kernel/model/building');
const ee = require('../../../kernel/tools/eventemitter');
const Stats = require('../../../kernel/model/stats');

class ForestHut extends Building {

    constructor(config, ground) {
        super(config, ground);
        this.cycleDuration = 0;
    }

    onStart() {
        this.spawnCharacter('Lumberjack');
    }

    working() {
        this.spawnCharacter('Lumberjack');
        if (this.stats[Stats.WOOD] > 0) {
            const repo = this.ground.ENTITIES['Repository'].instances.filter(this.repoFilter);
            if (repo.length) {
                this.spawnCharacter('Carrier', { crop: Stats.WOOD });
            }
        }
    }

    repoFilter(rep) {
        return rep.level > 0;
    }
}

ForestHut.removable = true;
ForestHut.description = 'This building increase the prosperity of your city';
ForestHut.tileX = 1;
ForestHut.tileZ = 1;
ForestHut.cost = { [Stats.WOOD]: 5 };
ForestHut.require = { inactive: 2 };
ForestHut.enabled = { stone: 2 };
ForestHut.walkable = 0;
ForestHut.constuctDuration = 1000;
ForestHut.waterLevelNeeded = 100;
ForestHut.instances = [];
module.exports = ForestHut;
