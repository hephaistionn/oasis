module.exports = class Info {

    constructor(model, parent) {

        this.node = document.createElement('div');
        this.node.className = 'info';

        this.buttonRemove = document.createElement('div');
        this.buttonRemove.className = 'info__remove';
        this.buttonRemove.textContent = 'remove';
        this.buttonRemove.onclick = model.remove.bind(model);
        
        this.add(parent);

        this.update(0, model);
    }

    update(dt, model) {
        if(model.entity && model.entity.constructor.removable) {
            this.node.appendChild(this.buttonRemove);
        } else if(this.buttonRemove.parentNode == this.node) {
            this.node.removeChild(this.buttonRemove);
        }

        if (model.opened) {
            this.node.style.display = '';
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
