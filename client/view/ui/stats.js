module.exports = class State {

    constructor(model, parent) {
        this.node = document.createElement('div');
        this.node.className = 'stats';

        this.statValue = {};
        let stat;
        for (let key in model.stats) {
            stat = model.stats[key];

            const nodeItem = document.createElement('div');
            nodeItem.className = 'stats__item';

            const nodelabel = document.createElement('div');
            nodelabel.className = `stats__item__icon icon_${stat.code}`;
            nodeItem.appendChild(nodelabel);

            const nodeValue = document.createElement('span');
            nodeValue.className = 'stats__item__value';
            nodeValue.textContent = stat.value;
            nodeItem.appendChild(nodeValue);
            this.statValue[key] = nodeValue;

            this.node.appendChild(nodeItem);
        }

        this.add(parent);
        this.update(0, model);
    }

    update(dt, model) {
        for (let key in this.statValue) {
            this.statValue[key].textContent = model.stats[key].value;
        }
    }

    add(parent) {
        parent.dom.appendChild(this.node);
    }

    remove(parent) {
        parent.dom.removeChild(this.node);
    }
};
