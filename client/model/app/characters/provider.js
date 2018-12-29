const Character = require('../../../kernel/model/character');
const ee = require('../../../kernel/tools/eventemitter');
const Stats = require('../../../kernel/model/stats');

class Provider extends Character {
    constructor(params, ground) {
        super(params, ground);
        const tile = this.ground.getFreeRandomBorder();
        this.ax = tile[0];
        this.ay = tile[1];
        this.az = tile[2];

        const entity = this.ground.getEntity(this.origin);
        for(let key in entity.constructor.cost) {
            const need = entity.constructor.cost[key] - entity.materials[key];
            if(need > 0) {
                this.stats.set(key, Math.min(5, need) );
                break;
            }
        }
        this.targets.push({ id: params.origin });
        this.origin = null;
    }

    onEndPath(entity) {
        for(let key in this.stats) {
            if(this.stats[key] > 0) {
                const value = this.stats.pull(key, this.stats[key]);
                entity.constructing(key, value);
                break;
            }
        }
        this.autoRemove();
    }

    onStartPath(entity) {

    }
}

module.exports = Provider;