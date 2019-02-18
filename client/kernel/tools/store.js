const ee = require('./eventemitter');
const Stats = require('../model/stats');
const repository = require('../model/repository');

module.exports = class Store {

    constructor(config) {

        this.stats = new Stats();
        this.instancesGroup = [];
        this.displayed = {};
        for (let i = 0; i < Stats.allType.length; i++) {
            this.displayed[i] = false;
        }
        this.displayed[Stats.POP] = true;
        this.displayed[Stats.WOOD] = true;
        this.displayed[Stats.MEAT] = true;

        ee.on('onUpdateStats', this.refreshStats.bind(this));
    }

    watch(instances) {
        this.instancesGroup.push(instances);
    }

    updateDisplayed(type) {
        this.displayed[type] = !this.displayed[type];
        ee.emit('onUpdateStats');
    }

    refreshStats() {
        this.stats.set(Stats.WOOD, 0);
        this.stats.set(Stats.STONE, 0);
        this.stats.set(Stats.MEAT, 0);
        this.stats.set(Stats.POP, 0);
        let instances;
        let instance;
        let i, k;
        this.stats[Stats.WOOD] += repository.stats[Stats.WOOD];
        this.stats[Stats.STONE] += repository.stats[Stats.STONE];
        this.stats[Stats.MEAT] += repository.stats[Stats.MEAT];

        for (i = 0; i < this.instancesGroup.length; i++) {
            instances = this.instancesGroup[i];
            for (k = 0; k < instances.length; k++) {
                instance = instances[k];
                this.stats[Stats.WOOD] += instance.stats[Stats.WOOD];
                this.stats[Stats.STONE] += instance.stats[Stats.STONE];
                this.stats[Stats.MEAT] += instance.stats[Stats.MEAT];
                this.stats[Stats.POP] += instance.stats[Stats.POP];
            }
        }
    }

    dismount() {
        ee.off('onUpdateStats', this.refreshStats.bind(this));
    }
};