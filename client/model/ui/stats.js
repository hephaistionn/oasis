const ee = require('../../kernel/tools/eventemitter');
const Stat = require('../../kernel/model/stats');

class Stats {

    constructor(conf, store) {
        this._id = Math.floor((1 + Math.random()) * 0x10000000000);
        this.store = store;
        this._refresh = this.refresh.bind(this)
        ee.on('onUpdateStats', this._refresh);
    }

    refresh() {
        this.updated = true;
    }

    onDismount() {
        ee.off('onUpdateStats', this._refresh);
    }

}

Stats.ui = true;
module.exports = Stats;