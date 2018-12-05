module.exports = class State {

    constructor(model, parent) {
        this.node = document.createElement('div');
        this.node.className = 'state';

        this.stateValue = {};
        let state;
        for (let key in model.states) {
            state = model.states[key];

            const nodeItem = document.createElement('div');
            nodeItem.className = 'state__item';

            const nodelabel = document.createElement('span');
            nodelabel.className = 'state__item__label';
            nodelabel.textContent = state.label + ' : ';
            nodeItem.appendChild(nodelabel);

            const nodeValue = document.createElement('span');
            nodeValue.className = 'state__item__value';
            nodeValue.textContent = state.value;
            nodeItem.appendChild(nodeValue);
            this.stateValue[key] = nodeValue;

            this.node.appendChild(nodeItem);
        }

        this.add(parent);
        this.update(0, model);
    }

    update(dt, model) {
        if (model.display) {
            this.node.style.display = '';
            for (let key in this.stateValue) {
                this.stateValue[key].textContent = model.states[key].value;
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
