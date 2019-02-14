const disabled = ' disabled';
const none = 'none';
const empty = '';

module.exports = class Menu {

    constructor(model, parent) {

        this.node = this.makeNode('menu');

        this.nodePanel = this.makeNode('menu__panel');
        this.node.appendChild(this.nodePanel);

        this.buttonOpen = this.makeNode('menu__opener');
        this.buttonOpen.onclick = model.open.bind(model);
        this.node.appendChild(this.buttonOpen);

        this.buttonClose = this.makeNode('menu__closer');
        this.buttonClose.onclick = model.close.bind(model);
        this.node.appendChild(this.buttonClose);

        this.add(parent);

        this.update(0, model);
    }

    update(dt, model) {

        if (model.displayed) {
            if(this.buttonOpen.style.display !== none) {
                this.buttonOpen.style.display = none;
                this.buttonClose.style.display = empty;
            }
            if(this.nodePanel.style.display !== empty) {
                this.nodePanel.style.display = empty;
            }
        } else {
            this.buttonOpen.style.display = empty;
            this.buttonClose.style.display = none;
            this.nodePanel.style.display = none;
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
