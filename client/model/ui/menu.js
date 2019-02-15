const ee = require('../../kernel/tools/eventemitter');

class Menu {

    constructor(config, store) {
        this.store = store;
        this.displayed = false;
        this.updated = false;
        this._id = 6;
        this._close = this.close.bind(this);
    }

    open() {
        ee.emit('onOpenPanel');
        this.displayed = true;
        this.updated = true;
        ee.on('onOpenPanel', this._close);
    }



    close() {
        ee.off('onOpenPanel', this._close);
        this.displayed = false;
        this.updated = true;
    }

}

Menu.ui = true;
module.exports = Menu;
