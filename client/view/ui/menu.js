const disabled = ' disabled';
const none = 'none';
const empty = '';
const Stats = require('../../kernel/model/stats');

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
        this.nodePanel.appendChild(this.buttonClose);

        const nodeTitle = this.makeNode('menu__title', 'tableau de bord');
        this.nodePanel.appendChild(nodeTitle);

        const container = this.makeNode('menu__container');
        this.nodePanel.appendChild(container);

        this.statValue = {};
        this.statItem = {};
        this.nodeStats = this.makeNode('menu__stats');
        this.createStatsBlock(model);
        container.appendChild(this.nodeStats);

        this.add(parent);

        this.update(0, model);
    }

    update(dt, model) {

        if (model.displayed) {
            if (this.buttonOpen.style.display !== none) {
                this.buttonOpen.style.display = none;
            }
            if (this.nodePanel.style.display !== empty) {
                this.nodePanel.style.display = empty;
            }

            this.updateStats(model);
        } else {
            this.buttonOpen.style.display = empty;
            this.nodePanel.style.display = none;
        }
    }

    createStatsBlock(model) {
        const stats = model.store.stats;
        let value, type;;
        const nodeLabel = this.makeNode('menu__stats__label', 'ressources');
        this.nodeStats.appendChild(nodeLabel);

        for (let i = 0; i < Stats.allType.length; i++) {
            type = Stats.allType[i];
            value = stats[type];

            const nodeItem = document.createElement('div');
            nodeItem.className = `menu__stats__item`;

            const nodelabel = document.createElement('div');
            nodelabel.className = `menu__stats__item__icon icon_${type}`;
            nodeItem.appendChild(nodelabel);

            const nodeValue = document.createElement('span');
            nodeValue.className = 'menu__stats__item__value';
            nodeValue.textContent = value;
            nodeItem.appendChild(nodeValue);
            this.statValue[type] = nodeValue;
            this.statItem[type] = nodeItem;
            nodeItem.onclick = model.updateDisplayed.bind(model, type);

            this.nodeStats.appendChild(nodeItem);
        }
    }

    updateStats(model) {
        const stats = model.store.stats;
        let value, type;
        for (let i = 0; i < Stats.allType.length; i++) {
            type = Stats.allType[i];
            value = stats[type];
            this.statValue[type].textContent = value;
            if (model.store.displayed[type]) {
                this.statItem[type].className = 'menu__stats__item displayed';
            } else {
                this.statItem[type].className = 'menu__stats__item';
            }
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