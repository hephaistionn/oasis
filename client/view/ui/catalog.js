module.exports = class Catalog {

    constructor(model, parent) {

        this.node = document.createElement('div');
        this.node.className = 'catalog';

        this.nodePanel = document.createElement('div');
        this.nodePanel.className = 'catalog__panel';
        this.node.appendChild(this.nodePanel);

        model.list.forEach(entityClass => {
            const nodeItem = document.createElement('div');
            nodeItem.className = 'catalog__panel__item';
            nodeItem.textContent = entityClass;
            nodeItem.onclick = model.select.bind(model, entityClass);
            this.nodePanel.appendChild(nodeItem);
        })

        this.buttonOpen = document.createElement('div');
        this.buttonOpen.className = 'catalog__opener';
        this.buttonOpen.textContent = 'build';
        this.buttonOpen.onclick = model.open.bind(model);
        this.node.appendChild(this.buttonOpen);

        this.buttonClose = document.createElement('div');
        this.buttonClose.className = 'catalog__closer';
        this.buttonClose.textContent = 'close';
        this.buttonClose.onclick = model.open.bind(model);
        this.node.appendChild(this.buttonClose);

        this.add(parent);

        this.update(0, model);
    }

    update(dt, model) {
        if (model.displayed) {
            this.buttonOpen.style.display = 'none';
            this.buttonClose.style.display = '';
            this.nodePanel.style.display = '';
        } else {
            this.buttonOpen.style.display = '';
            this.buttonClose.style.display = 'none';
            this.nodePanel.style.display = 'none';
        }
    }

    add(parent) {
        parent.dom.appendChild(this.node);
    }

    remove(parent) {
        parent.dom.removeChild(this.node);
    }
};
