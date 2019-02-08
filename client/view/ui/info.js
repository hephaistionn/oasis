module.exports = class Info {

    constructor(model, parent) {

        this.node = document.createElement('div');
        this.node.className = 'info';

        this.buttonRemove = this.makeNode('info__remove');
        this.buttonRemove.onclick = model.remove.bind(model);


        this.buttonUpgrade = this.makeNode('info__upgrade');
        this.buttonUpgrade.onclick = model.upgrade.bind(model);

        this.nodeTitle = this.makeNode('info__title');
        this.node.appendChild(this.nodeTitle);

        this.nodeDescription = this.makeNode('info__description');
        this.node.appendChild(this.nodeDescription);

        this.nodePicture = document.createElement('IMG');
        this.nodePicture.className = 'info__picture';
        this.node.appendChild(this.nodePicture);

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

            this.nodeTitle.textContent = model.entity.constructor.label;
            this.nodeDescription.textContent = model.entity.constructor.description;
            this.nodePicture.src = model.entity.constructor.picture;

        }

        if (model.opened) {
            this.node.style.display = '';
        } else {
            this.node.style.display = 'none';
        }
    }

    makeNode(classname, text) {
        const node = document.createElement('div');
        node.className = classname;
        if (text)
            node.textContent = text;
        return node;
    }

    add(parent) {
        parent.appendChild(this.node);
    }

    remove() {
        this.node.parentNode.removeChild(this.node);
    }
};
