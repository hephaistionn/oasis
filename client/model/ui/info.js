
class Detail {

    constructor(conf) {
        this._id = Math.floor((1 + Math.random()) * 0x10000000000);
        this.opened = false;
        this.removeCB = null;
    }

    open(mod) {
        this.mod = mod;
        this.opened = true;
        this.refresh(mod);
    }

    refresh(mod) {
        this.updated = true;
    }

    close() {
        this.opened = false;
        this.updated = true;
    }

    remove() {
        this.removeCB(this.mod);
    }

    onRemove(cb) {
        this.removeCB = cb;
    }
}

Detail.ui = true;
module.exports = Detail;