module.exports = class Info {

    constructor(model, parent) {

        this.node = document.createElement('div');
        this.node.className = 'info';

        this.buttonRemove = document.createElement('div');
        this.buttonRemove.className = 'info__remove';
        this.buttonRemove.textContent = 'remove';
        this.buttonRemove.onclick = model.remove.bind(model);


        this.buttonUpgrade = document.createElement('div');
        this.buttonUpgrade.className = 'info__upgrade';
        this.buttonUpgrade.textContent = 'upgrade';
        this.buttonUpgrade.onclick = model.upgrade.bind(model);
        
        this.add(parent);

        this.update(0, model);
    }

    update(dt, model) {
        if(model.entity) {
            if(model.entity.constructor.removable) {
                this.node.appendChild(this.buttonRemove);
            } else if(this.buttonRemove.parentNode) {
                this.node.removeChild(this.buttonRemove);
            }
            if(model.entity.constructor.levelMax && model.entity.constructor.levelMax > model.entity.level) {
                this.node.appendChild(this.buttonUpgrade);
            } else if(this.buttonUpgrade.parentNode) {
                this.node.removeChild(this.buttonUpgrade);
            }
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
