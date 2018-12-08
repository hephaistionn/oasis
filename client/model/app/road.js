const pathfinding = require('../../kernel/tools/pathfinding');
const ee = require('../../kernel/tools/eventemitter');

module.exports = class Road {

    constructor(config, ground) {
        this._id = config._id ? parseInt(config._id, 10) : Math.floor((1 + Math.random()) * 0x10000000000);
        this.drafted = false;
        ee.on('mouseDown', this.draftStart.bind(this));
        ee.on('mouseMovePress', this.draftStaggering.bind(this));
        ee.on('mouseMove', this.draftMove.bind(this));
    }

    draft() {
        this.drafted = true;
    }

    startConstruct() {
        this.drafted = false;
    }

    cancelConstruct() {
        this.drafted = false;
    }


    draftStart(x, z) {
        if (this.drafted) {
            console.log('draftStart', x, z);
        }
    }

    draftStaggering(dx, dz) {
        if (this.drafted) {
            console.log('draftStaggering', dx, dz);
        }
    }

    draftMove(x, z) {
        if (this.drafted) {
            console.log('draftMove', x, z);
        }
    }

    onDismount() {
        ee.off('mouseDown', this.draftStart.bind(this));
        ee.off('mouseMovePress', this.draftStaggering.bind(this));
        ee.off('mouseMove', this.draftMove.bind(this));
    }
}
