const Character = require('../../../kernel/model/character');
const ee = require('../../../kernel/tools/eventemitter');

class Carrier extends Character {

    constructor(params) {
        super(params);
    }

}

module.exports = Carrier;
