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
        this.scoreProsperity = null;
        this.scorePower = null;
        this.scorePrestige = null;
        this.goalsValue = [];

        this.createStatsBlock(model, container);
        this.createScoreBlock(model, container);
        this.createGoalsBlock(model, container);

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
            this.updateScrore(model);
            this.updateGoals(model);
        } else {
            this.buttonOpen.style.display = empty;
            this.nodePanel.style.display = none;
        }
    }

    createStatsBlock(model, container) {
        this.nodeStats = this.makeNode('menu__stats');
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

        container.appendChild(this.nodeStats);
    }

    createScoreBlock(model, container) {
        this.nodeScore = this.makeNode('menu__score');
        const nodeLabel = this.makeNode('menu__score__label', 'score');
        const nodeProsperity = this.makeNode('menu__score__prosperity');
        const nodePower = this.makeNode('menu__score__power');
        const nodePrestige = this.makeNode('menu__score__prestige');
        this.nodeScore.appendChild(nodeLabel);
        this.nodeScore.appendChild(nodeProsperity);
        this.nodeScore.appendChild(nodePower);
        this.nodeScore.appendChild(nodePrestige);
        this.scoreProsperity = nodeProsperity;
        this.scorePower = nodePower;
        this.scorePrestige = nodePrestige;
        container.appendChild(this.nodeScore);
    }

    createGoalsBlock(model, container) {
        this.nodeGolas = this.makeNode('menu__goals');
        const nodeLabel = this.makeNode('menu__goals__label', 'objectifs');
        this.nodeGolas.appendChild(nodeLabel);
        const goals = model.store.goals;
        let goal;
        for (let i = 0; i < goals.length; i++) {
            goal = goals[i];
            const nodeGoal = this.createItemGoal(model.store, goal.group, goal.type, goal.value);
            this.nodeGolas.appendChild(nodeGoal);
        }
        container.appendChild(this.nodeGolas);
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

    updateScrore(model) {
        const store = model.store;
        this.scoreProsperity.textContent = store.prosperity;
        this.scorePower.textContent = store.power;
        this.scorePrestige.textContent = store.prestige;
    }

    updateGoals(model) {
        const goals = model.store.goals;
        for (let i = 0; i < goals.length; i++) {
            this.goalsValue[i].textContent = goals[i].value + ' %';
        }
    }

    createItemGoal(store, group, type, value) {
        const nodeGolal = this.makeNode(`menu__goals__item`);
        let icon;
        let label;
        if (group === 'stats') {
            icon = this.makeNode(`menu__goals__item__icon  icon_${type}`);
            label = this.makeNode(`menu__goals__item__label`, Stats.labels[type]);
        } else if (group === 'score') {
            icon = this.makeNode(`menu__goals__item__icon  icon_${type}`);
            label = this.makeNode(`menu__goals__item__label`, store.labels[type]);
        } else if (group === 'building') {
            icon = this.makeNode(`menu__goals__item__icon  icon_building`);
            label = this.makeNode(`menu__goals__item__label`, store.ENTITIES[type].label);
        }

        const progress = this.makeNode(`menu__goals__item__value`, value + ' %');
        this.goalsValue.push(progress);

        nodeGolal.appendChild(icon);
        nodeGolal.appendChild(label);
        nodeGolal.appendChild(progress);
        return nodeGolal;
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