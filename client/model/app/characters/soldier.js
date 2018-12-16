const Character = require('../../../kernel/model/character');
const ee = require('../../../kernel/tools/eventemitter');
const Stats = require('../../../kernel/model/stats');

const SOLDIER = 'Soldier';
const REPOSITORY = 'Repository';
const BARRACK = 'Barrack';
const SPAWNER = 'Spawner';
const removeEntityEvent = 'removeEntity';


class Soldier extends Character {
    constructor(params, ground) {
        super(params, ground);
        this.hp = 100;
        this.attack = 10;
        this.workingDuration = 1000;
        this.targets.push({ entity: Berry, resource: Stats.BERRY, remote: 1 });
        this.targets.push({ id: this.origin });
        this.enemy = config.enemy || false;
        this.remote = false;
    }

    updatePath() {
        if (this.ground.ENTITIES[SOLDIER].instances.length) {
            this.buildPaths(SOLDIER);
        } else if (this.ground.ENTITIES[REPOSITORY].instances.length) {
            this.buildPaths(REPOSITORY);
        } else if (this.enemy) {
            this.buildPaths(SPAWNER);
        } else {
            this.buildPaths(BARRACK);
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
        if (entity.hp === 0) {
            this.updatePath();
        }
    }

    onEndPath(entity) {
        this.forceTargetId = null;
        if (entity.constructor.name === SPAWNER || entity.constructor.name === BARRACK) {
            ee.emit(removeEntityEvent, this._id);
        } else {
            entity.setWorking(true, this._id);
            this.working = true;
        }
    }

    buildPaths(entity) {
        const ground = this.ground;
        this.paths = [];
        const originTile = [Math.floor(this.ax / ground.tileSize), Math.floor(this.az / ground.tileSize)];
        const instanceTargets = pathfinding.nearestEntities(ground.ENTITIES, entity, null, this.ax, this.az);
        const targetTiles = instanceTargets.map(instance => instance.getTiles());
        const solution = pathfinding.computePath(ground, originTile, targetTiles, this.remote);
        if (solution) {
            const path = solution.path;
            const targetId = instanceTargets[solution.index]._id;
            this.paths.push(new Path(path, ground.tileSize, ground.tileHeight, null, targetId));
            const targetEntity = this.ground.getEntity(targetId);
            if (targetEntity.stop === false) {
                targetEntity.setStop(true);
            }
        } else {
            ee.emit(removeEntityEvent, this._id);
        }
    }
}

module.exports = Soldier;