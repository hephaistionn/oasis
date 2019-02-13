const ee = require('./../tools/eventemitter');
const eventState = 'onUpdateStats';

const Stats = class Stats {

    constructor(config, watched) {
            this[this.constructor.WOOD] = 0;
            this[this.constructor.STONE] = 0;
            this[this.constructor.MEAT] = 0;
            this[this.constructor.POP] = 0;
            this.watched = watched;
    }

    pull(TYPE, value) {
        const available = this[TYPE]-Math.max(this[TYPE] - value, 0);
        this[TYPE] -= available;
        if (this.watched)
            ee.emit(eventState); 
        return available;
    }

    push(TYPE, value) {
        this[TYPE] += value;
        if (this.watched)
            ee.emit(eventState);
    }

    set(TYPE, value) {
        this[TYPE] = value;
    }

    clean() {
        this[this.constructor.WOOD] = 0;
        this[this.constructor.STONE] = 0;
        this[this.constructor.MEAT] = 0;
        this[this.constructor.POP] = 0; 
    }
};

Stats.WOOD = 1;
Stats.STONE = 2;
Stats.MEAT = 3;
Stats.POP = 4;
Stats.materialTypes = [0, Stats.WOOD, Stats.STONE, Stats.MEAT];

module.exports = Stats;
