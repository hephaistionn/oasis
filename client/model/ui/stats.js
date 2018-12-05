const ee = require('../../kernel/tools/eventemitter');

class Stats {

    constructor(conf) {
        this._id = Math.floor((1 + Math.random()) * 0x10000000000);
        this.stats = {
            pop: {label:'pop', value:0},
            wood: {label:'wood', value:0},
            stone: {label:'stone', value:0},
            berry: {label:'berry', value:0}
        }
    }

    refresh(entity) {
        this.updated = true;
    }

}

Stats.ui = true;
module.exports = Stats;