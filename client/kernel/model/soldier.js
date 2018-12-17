const ee = require('../tools/eventemitter');
const pathfinding = require('../tools/pathfinding/index');
const Path = require('../tools/path');
const Stats = require('./stats');
const removeEntityEvent = 'removeEntity';

class Soldier {

    constructor(config, ground) {
        this._id = config._id ? parseInt(config._id, 10) : Math.floor((1 + Math.random()) * 0x10000000000);
        this._parent = null;
        this.ax = config.x;
        this.ay = config.y;
        this.az = config.z;
        this.aroty = config.roty || 0;;
        this.updated = true;
        this.started = true;
        this.path = null;
        this.pathProgress = 0;
        this.selected = false;
        this.working = false;
        this.workingDuration = 4000;
        this.workingProgress = 0;
        this.stats = new Stats(config, false);
        this.constructor.instances.push(this);
        this.ground = ground;
        this.originTile = [Math.floor(this.ax / this.ground.tileSize), Math.floor(this.az / this.ground.tileSize)];
        this.enemy = config.enemy || false;
        this.forceTargetId;
    }

    start() {
        this.updatePath();
    }

    select(selected) {
        this.selected = selected;
        this.updated = true;
    }

    move(x, y, z, roty) {
        this.updated = true;
        this.ax = x;
        this.ay = y;
        this.az = z;
        if (roty !== undefined) this.aroty = roty;
        this.onMove();
    }

    setWorking(value, targetId) {
        this.working = value;
        this.forceTargetId = targetId;
        this.setStop(false);
    }

    buildPath(entities) {
        const ground = this.ground;
        this.path = null;
        const originTile = [Math.floor(this.ax / ground.tileSize), Math.floor(this.az / ground.tileSize)];
        let instanceTargets, targetTiles;
        if (!entities) {  // back
            instanceTargets = null;
            targetTiles = [this.originTile];
        } else {
            instanceTargets = pathfinding.nearestInstances(entities, this.ax, this.az);
            targetTiles = instanceTargets.map(instance => instance.getTiles());
        }
        const solution = pathfinding.computePath(ground, originTile, targetTiles, this.remote);
        if (solution) {
            const path = solution.path;
            const targetId = instanceTargets ? instanceTargets[solution.index]._id : null;
            this.path = new Path(path, ground.tileSize, ground.tileHeight, null, targetId);
            this.pathProgress = 0;
            if (targetId) {
                const targetEntity = this.ground.getEntity(targetId);
                if (targetEntity && targetEntity.stop === false) {
                    targetEntity.setStop(true);
                }
            }
        } else {
            ee.emit(removeEntityEvent, this._id);
        }
    }

    update(dt) {
        this.updated = true;
        if (this.path === null) return;

        if (this.working) {
            this.workingProgress += dt;
            if (this.workingProgress > this.workingDuration) {
                this.working = false;
                this.workingProgress = 0;
                const entity = this.ground.getEntity(this.forceTargetId || this.path.targetId);
                this.onEndWorking(entity);
            }
            return;
        }

        if (this.pathProgress === 0) {
            const entity = this.ground.getEntity(this.path.originId);
            if (entity) {
                this.onStartPath(entity);
            }
        }
        this.pathProgress += dt * 0.005;
        if (this.pathProgress >= this.path.length) {
            this.pathProgress = Math.min(this.pathProgress, this.path.length);
            const pos = this.path.getPoint(this.pathProgress);
            this.move(pos[0], pos[1], pos[2], pos[3]);
            const entity = this.ground.getEntity(this.path.targetId);
            if (!entity) {
                ee.emit(removeEntityEvent, this._id);
            } else {
                this.onEndPath(entity);
            }
        } else {
            const pos = this.path.getPoint(this.pathProgress);
            this.move(pos[0], pos[1], pos[2], pos[3]);
        }
    }

    onStartPath() {
        console.log('onStartPath');
    }

    onEndPath() {
        console.log('onEndPath');
    }

    onEndWorking() {

    }

    onMove() {

    }

    onMount(parent) {
        this._parent = parent;
    }

    onDismount() {
        const index = this.constructor.instances.indexOf(this);
        this.constructor.instances.splice(index, 1);
    }

}

Soldier.instances = [];
Soldier.entity = true;

module.exports = Soldier;
