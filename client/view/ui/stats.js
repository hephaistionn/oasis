const Stats = require('../../kernel/model/stats');

module.exports = class State {

    constructor(model, parent) {
        this.node = document.createElement('div');
        this.node.className = 'stats';

        this.statsItem = {};

        this.classDisplayed = '';

        let type;
        for (let i = 0; i < Stats.allType.length; i++) {
            type = Stats.allType[i];

            const nodeItem = document.createElement('div');
            nodeItem.className = `stats__item item_${type}`;

            const nodelabel = document.createElement('div');
            nodelabel.className = `stats__item__icon icon_${type}`;
            nodeItem.appendChild(nodelabel);

            const nodeValue = document.createElement('span');
            nodeValue.className = 'stats__item__value';
            nodeItem.appendChild(nodeValue);
            this.statsItem[type] = nodeValue;

            this.node.appendChild(nodeItem);
        }

        this.add(parent);
        this.update(0, model);
    }

    update(dt, model) {
        const displayed = model.store.displayed;
        this.classDisplayed = 'stats';
        for (let key in this.statsItem) {
            if (displayed[key]) {
                this.classDisplayed += ' v' + key;
                this.statsItem[key].textContent = model.store.stats[key];
            }
        }
        this.node.className = this.classDisplayed;
    }

    add(parent) {
        parent.appendChild(this.node);
    }

    remove() {
        this.node.parentNode.removeChild(this.node);
    }
};