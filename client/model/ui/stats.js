const ee = require('../../kernel/tools/eventemitter');
const Stat = require('../../kernel/model/stats');

class Stats {

    constructor(conf, store) {
        this._id = Math.floor((1 + Math.random()) * 0x10000000000);
        this.stats = {
            pop: { label: 'pop', value: 0, code: Stat.POP },
            wood: { label: 'wood', value: 0, code: Stat.WOOD },
            stone: { label: 'stone', value: 0, code: Stat.STONE },
            berry: { label: 'berry', value: 0, code: Stat.BERRY }
        }
        this.store = store;
        this._refresh = this.refresh.bind(this)
        ee.on('onUpdateStats', this._refresh);
    }

    refresh() {
        this.stats.pop.value = this.store.stats[Stat.POP];
        this.stats.wood.value = this.store.stats[Stat.WOOD];
        this.stats.stone.value = this.store.stats[Stat.STONE];
        this.stats.berry.value = this.store.stats[Stat.BERRY];
        this.updated = true;
    }

    onDismount() {
        ee.off('onUpdateStats', this._refresh);
    }

}

Stats.ui = true;
module.exports = Stats;