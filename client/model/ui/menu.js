const ee = require('../../kernel/tools/eventemitter');

class Menu {

    constructor(config, store) {
        this.store = store;
        this.displayed = false;
        this.updated = false;
        this._id = 6;
    }

    open() {
        this.displayed = true;
        this.updated = true;
    }



    close() {
        this.displayed = false;
        this.updated = true;
    }

}

Menu.ui = true;
module.exports = Menu;
