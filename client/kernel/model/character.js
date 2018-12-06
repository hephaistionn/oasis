const ee = require('../tools/eventemitter');
const pathfinding = require('../tools/pathfinding/index');
const Path = require('../tools/path');
const Stats = require('./stats');

class Character {
    
    constructor(config) {
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
        this.stats = new Stats(config, false);
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
        if (roty !== undefined) this.roty = roty;
        this.onMove();
    }

    buildPaths(ground) {
        this.paths = [];
        let target, instanceTargets, targetTiles, originTile, path;
        const origin = [Math.floor(this.ax / ground.tileSize), Math.floor(this.az / ground.tileSize)];
        for (let i = 0; i < this.targets.length; i++) {
            target = this.targets[i];
            if (target.entity) {
                instanceTargets = pathfinding.nearestEntities(ground.ENTITIES, target.entity, target.resource, this.ax, this.az);
                targetTiles = instanceTargets.map(instance => instance.getTiles());
            } else {
                targetTiles = [origin];
            }
            if (i === 0) {
                originTile = origin;
            } else {
                originTile = [path[path.length - 3], path[path.length - 1]];
            }
            path = pathfinding.computePath(ground, originTile, targetTiles);
            if (path) {
                this.paths.push(new Path(path, ground.tileSize, ground.tileHeight));
            } else {
                ee.emit('removeEntity', this._id);
                break;
            }
        }
    }

    update(dt) {
        const path = this.paths[this.pathStep];
        this.pathProgress += dt * 0.005;
        this.updated = true;
        if (this.pathProgress >= path.length) {
            this.pathProgress = Math.min(this.pathProgress, path.length);
            const pos = path.getPoint(this.pathProgress);
            this.move(pos[0], pos[1], pos[2], pos[3]);
            this.pathStep = this.pathStep < this.paths.length - 1 ? this.pathStep + 1 : 0;
            this.pathProgress = 0
        } else {
            const pos = path.getPoint(this.pathProgress);
            this.move(pos[0], pos[1], pos[2], pos[3]);
        }
    }

    onMove() {

    }

    onMount(parent) {
        this._parent = parent;
    }

    onDismount() {
        this._child.forEach((children) => {
            this.remove(children);
        });
    }

}

Character.entity = true;

module.exports = Character;
