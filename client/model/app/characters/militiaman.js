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
        this.workingDuration = 1000;
        this.mustBack = false;

        this.remote = false;
    }

    updatePath() {
        const soldiers = this.ground.ENTITIES[MILITIAMAN].instances.filter(inst => inst.enemy !== this.enemy);
        const repository = this.ground.ENTITIES[REPOSITORY].instances;

        if (this.mustBack) {
            console.log('-----go home----');
            this.buildPath();
        } else if (soldiers.length) {
            console.log('-----go soldiers----');
            this.buildPath(soldiers);
        } else if (repository.length) {
            console.log('-----go repo----');
            this.buildPath(repository);
        } else {
            console.log('-----go home----');
            this.buildPath();
        }
    }

    hit(degat) {
        this.hp -= degat;
        this.hp = Math.max(0, this.hp);
        if (hp === 0) {
            ee.emit(removeEntityEvent, this._id);
        }
    }

    onEndWorking(entity) {
        entity.hit(this.attack);
        if (!entity.hp) {
            this.updatePath();
        }
    }

    onEndPath(entity) {
        this.forceTargetId = null;
        if (entity.constructor.name === REPOSITORY) {
            this.working = true;
            this.mustBack = true;
        } else if (entity.constructor.name === MILITIAMAN) {
            entity.setWorking(true, this._id);
        }
    }
}

module.exports = Militiaman;