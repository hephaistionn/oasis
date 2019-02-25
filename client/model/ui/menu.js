const ee = require('../../kernel/tools/eventemitter');

class Menu {

    constructor(config, store) {
        this.store = store;
        this.displayed = false;
        this.currentTab = 0;
        this.updated = false;
        this._id = 6;
        this.store = store;
        this._close = this.close.bind(this);
        this._refresh = this.refresh.bind(this);
    }

    refresh() {
        this.updated = true;
    }

    updateDisplayed(type) {
        this.store.updateDisplayed(type);
        this.updated = true;
    }

    displayTab(num) {
        this.currentTab = num;
        this.updated = true;
    }

    open() {
        ee.emit('onOpenPanel');
        this.displayed = true;
        this.updated = true;
        ee.on('onUpdateStats', this._refresh);
        ee.on('onOpenPanel', this._close);
    }

    close() {
        ee.off('onOpenPanel', this._close);
        ee.off('onUpdateStats', this._refresh);
        this.displayed = false;
        this.updated = true;
    }

}

Menu.ui = true;
module.exports = Menu;
