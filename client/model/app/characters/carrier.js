const Character = require('../../../kernel/model/character');
const ee = require('../../../kernel/tools/eventemitter');
const Stats = require('../../../kernel/model/stats');

class Carrier extends Character {
    constructor(params, ground) {
        super(params, ground);
        this.capacity = 10;
        this.currentResource = params.crop;
        /*this.targets.push({ entity: 'Tree', resource: Stats.WOOD });
        this.targets.push({ id: this.origin });
        this.targets.push({ entity: 'Stone', resource: Stats.STONE });
        this.targets.push({ id: this.origin });
        this.targets.push({ entity: 'MEAT', resource: Stats.MEAT });
        this.targets.push({ id: this.origin });*/

        const entity = this.ground.getEntity(this.origin);
        const value = entity.stats.pull(this.currentResource, this.capacity);
        this.stats.push(this.currentResource, value);
        this.targets.push({ entity: 'Repository' });

    }

    onEndPath(entity) {
        const value = this.stats.pull(this.currentResource, this.capacity);
        entity.stats.push(this.currentResource, value);
        this.autoRemove();
    }

    onStartPath(entity) {

    }
}

Carrier.selectable = true;
Carrier.description = 'This building increase the enable places for your population';
Carrier.label = 'Porteur';
Carrier.picture = '/pic/peon.png';
Carrier.targets = [];
Carrier.targets.push({ entity: 'Repository' });

module.exports = Carrier;