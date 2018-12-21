const Soldier = require('../../../kernel/model/soldier');
const ee = require('../../../kernel/tools/eventemitter');
const Stats = require('../../../kernel/model/stats');
const pathfinding = require('../../../kernel/tools/pathfinding');
const Path = require('../../../kernel/tools/path');

const SOLDIER = 'Soldier';
const REPOSITORY = 'Repository';
const BARRACK = 'Barrack';
const MILITIAMAN = 'Militiaman';
const removeEntityEvent = 'removeEntity';


class Militiaman extends Soldier {
    constructor(config, ground) {
        super(config, ground);
        this.hp = 100;
        this.attack = 10;
        this.fightingDuration = 1500;
        this.remote = false;
    }
}

module.exports = Militiaman;