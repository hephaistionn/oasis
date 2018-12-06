const ee = require('./eventemitter');

module.exports = class Store  {

    constructor(config) {
      this.states = {
          wood: 0,
          stone: 0,
          berry: 0,
          pop: 0
      };
      this.instancesGroup = [];
      ee.off('onUpdateStats', this.refreshStats.bind(this));
    }

	watch(instances) {
        this.instancesGroup.push(instances);
    }
    
    refreshStats() {
        this.states.wood = 0;
        this.states.stone = 0;
        this.states.berry = 0;
        this.states.pop = 0;
        let instances;
        let instance;
        let i, k;
        for(let i=0; i<this.instancesGroup.length; i++) {
            instances = this.instancesGroup[i];
            for(let k=0; k<instances.length; k++) {
                instance = instances[k];
                this.states.wood += instance.stats.wood;
                this.states.stone += instance.stats.stone;
                this.states.berry += instance.stats.berry;
                this.stares.pop += instance.stats.pop;
            }
        }
    }

    dismount() {
        ee.off('onUpdateStats', this.refreshStats.bind(this));
    }
};
