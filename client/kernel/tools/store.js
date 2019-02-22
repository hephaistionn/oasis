const ee = require('./eventemitter');
const Stats = require('../model/stats');
const repository = require('../model/repository');

module.exports = class Store {

    constructor(config, ENTITIES) {

        this.stats = new Stats();
        this.cityName = config.cityName;
        this.goals = config.goals;
        this.jobs = 0;
        this.level = 0;

        this.prosperity = 0;
        this.power = 0;
        this.demography = 0;

        this.labels = {
            prosperity : 'prosperité',
            power : 'puissance',
            demography : 'démographie',
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

        this._refreshStats = this.refreshStats.bind(this);
        this._update = this.update.bind(this);
        ee.on('onUpdateStats', this._refreshStats);
        this.timer = setInterval(this._update, 5000);
    }

    update() {
        this.updateProsperity();
        this.updatePower();
        this.updateDemography();
        this.checkGoals();
        console.log('prosperity ', this.prosperity);
        console.log('power ', this.power);
        console.log('demography ', this.demography);
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

    updateDemography() {
        this.demography = this.stats[Stats.POP];
    }

    checkGoals() {
        this.goals
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