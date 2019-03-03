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

        this.buttonRestart = this.makeNode('menu__restart', 'Recommencer');
        this.nodePanel.appendChild(this.buttonRestart);

        this.buttonWorld = this.makeNode('menu__world', 'Retour');
        this.nodePanel.appendChild(this.buttonWorld);

        const nodeTitle = this.makeNode('menu__title', 'tableau de bord');
        this.nodePanel.appendChild(nodeTitle);

        this.containers = [];

        this.containers.push(this.makeNode('menu__container'));
        this.nodePanel.appendChild(this.containers[0]);

        this.containers.push(this.makeNode('menu__container'));
        this.nodePanel.appendChild(this.containers[1]);

        this.nodetabs = [];

        this.nodetabs.push(this.makeNode('menu__tab tab_0', 'Stats'));
        this.nodePanel.appendChild(this.nodetabs[0]);
        this.nodetabs[0].onclick = model.displayTab.bind(model, 0);

        this.nodetabs.push(this.makeNode('menu__tab tab_1', 'Ressources'));
        this.nodePanel.appendChild(this.nodetabs[1]);
        this.nodetabs[1].onclick = model.displayTab.bind(model, 1);

        this.statValue = {};
        this.statItem = {};
        this.scoreProsperity = null;
        this.scorePower = null;
        this.scorePrestige = null;
        this.goalsValue = [];
        this.goalsProgress = [];
        this.labelCity = null;
        this.picutreCity = null;
        this.cityLevel = -1;
        this.currentTab = -1;

        this.createStatsBlock(model, this.containers[1]);
        this.createInfoBlack(model, this.containers[0]);
        this.createScoreBlock(model, this.nodeInfo);
        this.createGoalsBlock(model, this.containers[0]);

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

            if(this.currentTab !== model.currentTab) {
                this.containers[0].style.display = none;
                this.containers[1].style.display = none;
                this.nodetabs[0].className = 'menu__tab tab_0';
                this.nodetabs[1].className = 'menu__tab tab_1';
                this.containers[model.currentTab].style.display = empty;
                this.nodetabs[model.currentTab].className += ' focus';
                this.currentTab = model.currentTab;
            }

            if(model.currentTab === 0 ) {
                this.updateInfos(model);
                this.updateScrore(model);
                this.updateGoals(model);
            } else {
                this.updateStats(model);
            };
            this.cityLevel = model.store.level;
        } else {
            this.buttonOpen.style.display = empty;
            this.nodePanel.style.display = none;
        }
    }

    createInfoBlack(model, container) {
        this.nodeInfo = this.makeNode('menu__info');
        const picutreCity = this.makeNode('menu__info__picture icon__city' + model.store.level);
        const nameCity = this.makeNode('menu__info__name', model.store.cityName);
        const labelCity = this.makeNode('menu__info__level', model.store.cityLabel[model.store.level]);
        this.nodeInfo.appendChild(picutreCity);
        this.nodeInfo.appendChild(nameCity);
        this.nodeInfo.appendChild(labelCity);
        this.labelCity = labelCity;
        this.picutreCity = picutreCity;
        container.appendChild(this.nodeInfo);
    }

    createStatsBlock(model, container) {
        this.nodeStats = this.makeNode('menu__stats');
        const stats = model.store.stats;
        let value, type;;

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

        const prosperityItem = this.makeNode('menu__score__item prosperity');
        const powerItem = this.makeNode('menu__score__item power');
        const prestigeItem = this.makeNode('menu__score__item prestige');

        const prosperityLabel = this.makeNode('menu__score__item__label', model.store.labels.prosperity);
        const powerlabel = this.makeNode('menu__score__item__label', model.store.labels.power);;
        const prestigelabel = this.makeNode('menu__score__item__label', model.store.labels.prestige);

        this.scoreProsperity = this.makeNode('menu__score__item__value', model.store.prosperity);
        this.scorePower = this.makeNode('menu__score__item__value', model.store.power);
        this.scorePrestige = this.makeNode('menu__score__item__value', model.store.prestige);

        prosperityItem.appendChild(prosperityLabel);
        prosperityItem.appendChild(this.scoreProsperity);

        powerItem.appendChild(powerlabel);
        powerItem.appendChild(this.scorePower);

        prestigeItem.appendChild(prestigelabel);
        prestigeItem.appendChild(this.scorePrestige);

        this.nodeScore.appendChild(prosperityItem);
        this.nodeScore.appendChild(powerItem);
        this.nodeScore.appendChild(prestigeItem);
        container.appendChild(this.nodeScore);
    }

    createGoalsBlock(model, container) {
        this.nodeGolas = this.makeNode('menu__goals');
        const nodeLabel = this.makeNode('menu__goals__label', 'Objectifs');
        this.nodeGolas.appendChild(nodeLabel);
        const goals = model.store.goals;
        let goal;
        for (let i = 0; i < goals.length; i++) {
            goal = goals[i];
            const nodeGoal = this.createItemGoal(model.store, goal);
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

    updateInfos(model) {
        if (this.cityLevel !== model.store.level) {
            this.labelCity.textContent = model.store.cityLabel[model.store.level];
            this.picutreCity.className = 'menu__info__picture icon_city_' + model.store.level;
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
            this.goalsValue[i].textContent = goals[i].value;
            this.goalsProgress[i].style.with = goals[i].progress + '%';
        }
    }

    createItemGoal(store, goal) {
        const nodeGolal = this.makeNode(`menu__goals__item`);
        let icon;
        let label;
        let instruction;
        if (goal.group === 'stats') {
            icon = this.makeNode(`menu__goals__item__icon  icon_${goal.type}`);
            label = this.makeNode(`menu__goals__item__label`, 'Ressources');
            instruction = this.makeNode(`menu__goals__item__instruction`, `Obtenir ${goal.target} ${Stats.labels[goal.type]}`);
        } else if (goal.group === 'score') {
            icon = this.makeNode(`menu__goals__item__icon  icon_${goal.type}`);
            label = this.makeNode(`menu__goals__item__label`, 'Score');
            instruction = this.makeNode(`menu__goals__item__instruction`, `Atteindre ${goal.target} en ${store.labels[goal.type]}`);
        } else if (goal.group === 'building') {
            icon = this.makeNode(`menu__goals__item__icon  icon_building`);
            label = this.makeNode(`menu__goals__item__label`, 'Construction');
            instruction = this.makeNode(`menu__goals__item__instruction`, `Posseder ${goal.target} ${store.ENTITIES[goal.type].label}`);
        }

        const progress = this.makeNode(`menu__goals__item__progress`);
        const progressbar = this.makeNode(`menu__goals__item__progressbar`);
        const progressValue = this.makeNode(`menu__goals__item__value`, goal.value);
        progress.appendChild(progressbar);
        progress.appendChild(progressValue);
        this.goalsProgress.push(progressbar);
        this.goalsValue.push(progressValue);

        nodeGolal.appendChild(icon);
        nodeGolal.appendChild(label);
        nodeGolal.appendChild(instruction);
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