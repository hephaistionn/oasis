const ee = require('../tools/eventemitter');
const pathfinding = require('../tools/pathfinding');
const Path = require('../tools/path');
const Stats = require('./stats');
const removeEntityEvent = 'removeEntity';

class Character {

    constructor(config, ground) {
        this._id = config._id ? parseInt(config._id, 10) : Math.floor((1 + Math.random()) * 0x10000000000);
        this._parent = null;
        this._child = [];
        this.ax = config.x;
        this.ay = config.y;
        this.az = config.z;
        this.aroty = config.roty || 0;;
        this.updated = true;
        this.targets = [];
        this.paths = [];
        this.pathProgress = 0;
        this.pathStep = 0;
        this.selected = false;
        this.working = false;
        this.workingDuration = 4000;
        this.workingProgress = 0;
        this.stats = new Stats(config, false);
        this.constructor.instances.push(this);
        this.origin = config.origin;
        this.started = false;
        this.ground = ground;
        this.stop = false;
    }

    start() {
        this.started = true;
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

    setWorking(value) {
        this.working = value;
        this.setStop(false);
    }

    buildPaths() {
        const ground = this.ground;
        this.paths = [];
        let target, instanceTargets, targetTiles, originTile, originId, path, solution, targetId, origin;
        if (this.origin) { // si l'unité vient d'un batiment
            origin = this.ground.getEntity(this.origin).getTiles();
        } else {
            origin = [Math.floor(this.ax / this.ground.tileSize), Math.floor(this.az / this.ground.tileSize)]
        }

        for (let i = 0; i < this.targets.length; i++) {
            target = this.targets[i];

            if (target.id) {
                instanceTargets = [this.ground.getEntity(target.id)];
                targetTiles = [instanceTargets[0].getTiles()];
            } else if (target.entity) {
                instanceTargets = pathfinding.nearestEntities(ground.ENTITIES, target.entity, target.resource, this.ax, this.az);
                targetTiles = instanceTargets.map(instance => instance.getTiles());
            }

            if (i === 0) {
                originTile = origin;
                originId = this.origin;
            } else {
                originTile = this.ground.getEntity(targetId).getTiles();
                originId = targetId;
            }

            solution = pathfinding.computePath(ground, originTile, targetTiles, target.remote);

            if (solution) {
                path = solution.path;
                targetId = instanceTargets[solution.index]._id;
                this.paths.push(new Path(path, ground.tileSize, ground.tileHeight, originId, targetId));
            } else {
                this.autoRemove();
                break;
            }
        }
    }

    setStop(value) {
        this.stop = value;
    }

    update(dt) {
        this.updated = true;

        if (this.stop) return;

        const path = this.paths[this.pathStep];

        if (this.working) {
            this.workingProgress += dt;
            if (this.workingProgress > this.workingDuration) {
                this.working = false;
                this.workingProgress = 0;
                if (path) {
                    const entity = this.ground.getEntity(path.targetId);
                    this.onEndWorking(entity);
                } else {
                    this.onEndWorking();
                }
            }
            return;
        }

        if (!path) this.autoRemove();

        if (this.pathProgress === 0) {
            const entity = this.ground.getEntity(path.originId);
            if (entity) {
                this.onStartPath(entity);
            }
        }
        this.pathProgress += dt * 0.005;
        if (this.pathProgress >= path.length) {
            this.pathProgress = Math.min(this.pathProgress, path.length);
            const pos = path.getPoint(this.pathProgress);
            this.move(pos[0], pos[1], pos[2], pos[3]);
            const entity = this.ground.getEntity(path.targetId);
            if (!entity) {
                this.autoRemove();
            } else {
                this.onEndPath(entity);
            }
            if (this.pathStep < this.paths.length - 1) {
                this.pathStep++
                this.pathProgress = 0;
            } else {
                this.autoRemove();
            }
        } else {
            const pos = path.getPoint(this.pathProgress);
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

    autoRemove() {
        ee.emit(removeEntityEvent, this._id);
    }

    onMount(parent) {
        if (this.targets && this.targets.length) {
            this.buildPaths();
        }
        this._parent = parent;
    }

    onDismount() {
        const index = this.constructor.instances.indexOf(this);
        this.constructor.instances.splice(index, 1);
        this._child.forEach((children) => {
            this.remove(children);
        });
    }

}

Character.instances = [];
Character.entity = true;

module.exports = Character;
