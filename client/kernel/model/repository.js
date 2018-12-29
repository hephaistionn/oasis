const ee = require('../tools/eventemitter');
const Stats = require('./stats');

class Repository  {

    constructor() {
      this.stats = new Stats();
    }

    init(config) {
        this.stats.set(Stats.WOOD, config.repository.wood);
        return this;
    }
};

module.exports = new Repository();



