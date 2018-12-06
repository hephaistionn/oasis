const ee = require('./../tools/eventemitter');
const eventState = 'onUpdateStats';

module.exports = class Stats {
    
    constructor(config, watched) {
        this.wood = config.wood || 0;
        this.store = config.store || 0;
        this.berry = config.berry || 0;
        this.pop = config.pop || 0;
    }

    setWood(wood) {
        this.wood = wood;
        if(this.watched)
            ee.emit(eventState);
    }

    setStore(store) {
        this.store = store;
        if(this.watched)
            ee.emit(eventState);
    }

    setBerry(berry) {
        this.berry = berry;
        if(this.watched)
            ee.emit(eventState);
    }

    setPop(pop) {
        this.wood = pop;
        if(this.watched)
            ee.emit(eventState);
    }
};
