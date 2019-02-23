const ee = require('./eventemitter');
const Stats = require('../model/stats');
const repository = require('../model/repository');

module.exports = class Store {

    constructor(config, ENTITIES) {

        this.stats = new Stats();
        this.cityName = config.cityName;
        this.jobs = 0;
        this.level = 0;
        this.victory = false;

        this.prosperity = 0;
        this.power = 0;
        this.prestige = 0;

        this.labels = {
            prosperity: 'prosperité',
            power: 'puissance',
            prestige: 'prestige',
        }

        this.houseType = {};
        this.towerType = {};

        this.instancesGroup = [];
        this.displayed = {};
        this.ENTITIES = ENTITIES;
        for (let i = 0; i < Stats.allType.length; i++) {
            this.displayed[i] = false;
        }
        this.displayed[Stats.POP] = true;
        this.displayed[Stats.WOOD] = true;
        this.displayed[Stats.MEAT] = true;

        this.goals = this.prepareGoals(config.goals);
        this._refreshStats = this.refreshStats.bind(this);
        this._update = this.update.bind(this);
        ee.on('onUpdateStats', this._refreshStats);
        this.timer = setInterval(this._update, 5000);
    }

    update() {
        this.updateProsperity();
        this.updatePower();
        this.updatePrestige();
        this.checkGoals();
        ee.emit('onUpdateStats');
    }

    updateProsperity() {
        const houses = this.ENTITIES.House.instances;
        this.houseType = {};
        const l = houses.length;
        let point = 0;
        let i;
        for (i = 0; i < l; i++) {
            if (this.houseType[houses[i].level]) {
                this.houseType[houses[i].level]++;
            } else {
                this.houseType[houses[i].level] = 1;
            }
            point += houses[i].level;
        }

        this.prosperity = l ? point / l : 0;
    }

    updatePower() {
        const barracks = this.ENTITIES.Barrack.instances;
        const towers = this.ENTITIES.Tower.instances;
        const wallBlocks = this.ENTITIES.WallBlock.instances;
        const bl = barracks.length;
        const tl = towers.length;
        const wl = wallBlocks.length;
        let i = 0;

        let pointB = 0;
        for (i = 0; i < bl; i++) {
            pointB += barracks[i].level;
        }
        let pointW = 0;
        for (i = 0; i < wl; i++) {
            pointW += wallBlocks[i].level;
        }
        let pointT = 0;
        this.towerType = {};
        for (i = 0; i < tl; i++) {
            if (this.towerType[towers[i].level]) {
                this.towerType[towers[i].level]++;
            } else {
                this.towerType[towers[i].level] = 1;
            }
            pointT += towers[i].level;
        }
        this.power = 0;
        this.power += bl ? pointB / bl : 0;
        this.power += wl ? pointW / wl : 0;
        this.power += tl ? pointT / tl : 0;
    }

    updatePrestige() {
        this.prestige = this.stats[Stats.POP];
    }

    prepareGoals(confGoals) {
        const goals = [];
        for (let goalsType in confGoals) {
            for (let goal in confGoals[goalsType]) {
                const item = {
                    group: goalsType,
                    type: goal,
                    target: confGoals[goalsType][goal],
                    value: 0
                };
                goals.push(item);
            }
        }
        return goals;
    }

    checkGoals() {
        let goal;
        let success = 0;
        for (let i = 0; i < this.goals.length; i++) {
            goal = this.goals[i];
            switch (goal.group) {
                case 'score':
                    goal.value = Math.floor(Math.min(this[goal.type] / goal.target, 1) * 100);
                    break;
                case 'stats':
                    goal.value = Math.floor(Math.min(this.stats[goal.type] / goal.target, 1) * 100);
                    break;
                case 'building':
                    const level = goal.target[0];
                    const numberExpect = goal.target[1];
                    const number = this.ENTITIES[goal.type].instances.filter(a => a.level >= level).length;
                    goal.value = Math.floor(Math.min(number / numberExpect, 1) * 100);
                    break;
            }

            if (goal.value === 100) {
                success++;
            }
        }

        if (success === this.goals.length) {
            this.victory = true;
        }
    }

    watch(instances) {
        this.instancesGroup.push(instances);
    }

    updateDisplayed(type) {
        this.displayed[type] = !this.displayed[type];
        ee.emit('onUpdateStats');
    }

    refreshStats() {
        this.stats.set(Stats.WOOD, 0);
        this.stats.set(Stats.STONE, 0);
        this.stats.set(Stats.MEAT, 0);
        this.stats.set(Stats.POP, 0);
        let instances;
        let instance;
        let i, k;
        this.stats[Stats.WOOD] += repository.stats[Stats.WOOD];
        this.stats[Stats.STONE] += repository.stats[Stats.STONE];
        this.stats[Stats.MEAT] += repository.stats[Stats.MEAT];

        for (i = 0; i < this.instancesGroup.length; i++) {
            instances = this.instancesGroup[i];
            for (k = 0; k < instances.length; k++) {
                instance = instances[k];
                this.stats[Stats.WOOD] += instance.stats[Stats.WOOD];
                this.stats[Stats.STONE] += instance.stats[Stats.STONE];
                this.stats[Stats.MEAT] += instance.stats[Stats.MEAT];
                this.stats[Stats.POP] += instance.stats[Stats.POP];
            }
        }
    }

    dismount() {
        ee.off('onUpdateStats', this._refreshStats);
        clearInterval(this.timer);
    }
};