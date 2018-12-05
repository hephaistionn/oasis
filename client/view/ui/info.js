module.exports = class Detail {

    constructor(model, parent) {

        this.node = document.createElement('div');
        this.node.className = 'detail';

        this.buttonRemove = null;
        this.buttonHire = null;
        this.buttonDischarge = null;

        this.add(parent);

        this.update(0, model);
    }

    update(dt, model) {
        if (this.buttonRemove) {
            this.node.removeChild(this.buttonRemove);
            this.buttonRemove = null;
        }

        if (model.opened) {
            this.node.style.display = '';
            if (model.mod.removable) {
                this.buttonRemove = document.createElement('div');
                this.buttonRemove.className = 'button detail__remove';
                this.buttonRemove.textContent = 'remove';
                this.buttonRemove.onclick = model.remove.bind(model);
                this.node.appendChild(this.buttonRemove);
            }
        } else {
            this.node.style.display = 'none';
        }
    }

    add(parent) {
        parent.dom.appendChild(this.node);
    }

    remove(parent) {
        parent.dom.removeChild(this.node);
    }
};
