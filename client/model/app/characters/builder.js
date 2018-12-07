const Character = require('../../../kernel/model/character');
const ee = require('../../../kernel/tools/eventemitter');

class Builder extends Character {

    constructor(params, ground) {
        super(params, ground);
        this.targets.push({entity:'Tree', resource: 'wood'});
        this.targets.push({id  : this.origin});
        this.targets.push({entity:'Stone', resource: 'stone'});
        this.targets.push({id  : this.origin});
        this.targets.push({entity:'Berry', resource: 'berry'});
        this.targets.push({id  : this.origin});
    }

    onEndPath(entity) {
        debugger;
    }

    onStartPath(entity) {
        debugger;
    }

}

module.exports = Builder;