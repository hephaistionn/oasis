const ee = require("../tools/eventemitter");
const pathfinding = require("../tools/pathfinding/index");
const Path = require("../tools/path");
const Stats = require("./stats");
const removeEntityEvent = "removeEntity";
const REPOSITORY = "Repository";
const BARRACK = "Barrack";
const MILITIAMAN = "Militiaman";

class Soldier {
  constructor(config, ground) {
    this._id = config._id ? parseInt(config._id, 10) : Math.floor((1 + Math.random()) * 0x10000000000);
    this._parent = null;
    this.ax = config.x;
    this.ay = config.y;
    this.az = config.z;
    this.aroty = config.roty || 0;
    this.updated = true;
    this.started = true;
    this.path = null;
    this.pathProgress = 0;
    this.selected = false;
    this.fighting = false;
    this.fightingDuration = 2000;
    this.fightingProgress = 0;
    this.mustBack = false;
    this.stats = new Stats(config, false);
    this.constructor.instances.push(this);
    this.ground = ground;
    this.originTile = [
      Math.floor(this.ax / this.ground.tileSize),
      Math.floor(this.az / this.ground.tileSize)
    ];
    this.enemy = config.enemy || false;
    this.targetId = null;
    this.halfPath = false;// target soldier
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
  }

  startFight(targetId) {
    this.fighting = true;
    this.targetId = targetId;
    const entity = this.ground.getEntity(this.targetId);
    this.path = null;
    if (entity.targetId !== undefined) {
      // si c'est un solider
      this.setFightPosition(entity);
    }
  }

  stopFight(value, targetId) {
    this.fighting = false;
    this.targetId = null;
  }

  buildPath(entities, dynamic) {
    const currentTile = [Math.floor(this.ax / this.ground.tileSize), Math.floor(this.az / this.ground.tileSize)];
    let instanceTargets, targetTiles;
    if (!entities) {
      // back
      instanceTargets = null;
      targetTiles = [this.originTile];
      this.mustBack = true;
    } else {
      instanceTargets = pathfinding.nearestInstances(entities, this.ax, this.az);
      targetTiles = instanceTargets.map(instance => instance.getTiles());
    }

    if (dynamic) {
      const solution = pathfinding.computePath(this.ground, currentTile, targetTiles, this.remote, true);
      if (!solution) {
        return ee.emit(removeEntityEvent, this._id);
      }
      const path = solution.path;
      const targetId = instanceTargets ? instanceTargets[solution.index]._id : null;
      if (instanceTargets[solution.index].halfPath) {
        this.setPath(path, targetId);
      } else {
        const paths = pathfinding.breakPath(path);
        this.setPath(paths[0], targetId, true);
        instanceTargets[solution.index].setPath(paths[1], this._id, true);
      }
    } else {
      const solution = pathfinding.computePath(this.ground, currentTile, targetTiles, this.remote);
      if (!solution) {
        return ee.emit(removeEntityEvent, this._id);
      }
      const path = solution.path;
      const targetId = instanceTargets ? instanceTargets[solution.index]._id : null;
      this.setPath(path, targetId);
    }
  }

  setPath(path, targetId, halfPath) {
    this.path = new Path(path, this.ground.tileSize, this.ground.tileHeight, null, null, true);
    this.pathProgress = 0;
    if (targetId)
      this.targetId = targetId;
    this.halfPath = halfPath || false;
  }

  update(dt) {
    this.updated = true;
    if (this.fighting) {
      this.fightingProgress += dt;
      if (this.fightingProgress > this.fightingDuration) {
        this.fightingProgress = 0;
        const entity = this.ground.getEntity(this.targetId);
        this.onEndFighting(entity);
      }
      return;
    }
    if (this.path === null) {
      this.fightingProgress += dt;
      if (this.fightingProgress > this.fightingDuration) {
        this.fightingProgress = 0;
        const entity = this.ground.getEntity(this.targetId);
        this.onEndPath(entity)
      }
      return;
    }
    this.pathProgress += dt * 0.005;
    if (this.pathProgress >= this.path.length) {
      this.pathProgress = Math.min(this.pathProgress, this.path.length);
      const pos = this.path.getPoint(this.pathProgress);
      if (pos) {
        this.move(pos[0], pos[1], pos[2], pos[3]);
      }
      const entity = this.ground.getEntity(this.targetId);
      this.onEndPath(entity);
    } else {
      const pos = this.path.getPoint(this.pathProgress);
      this.move(pos[0], pos[1], pos[2], pos[3]);
    }
  }

  await() {
    this.path = null;
    this.fightingProgress = 0;
  }

  getTiles() {
    const tileSize = this.ground.tileSize;
    return [Math.floor(this.ax / tileSize), Math.floor(this.az / tileSize)];
  }

  updatePath() {
    const soldiers = this.ground.ENTITIES[MILITIAMAN].instances.filter(
      inst => inst.enemy !== this.enemy
    );
    const repository = this.ground.ENTITIES[REPOSITORY].instances;
    this.path = null;
    if (this.mustBack) {
      this.buildPath();
    } else if (soldiers.length) {
      this.buildPath(soldiers, true);
    } else if (repository.length && this.enemy) {
      this.buildPath(repository);
    } else {
      this.buildPath();
    }
  }

  hit(degat) {
    this.hp -= degat;
    this.hp = Math.max(0, this.hp);
    if (this.hp === 0) {
      ee.emit(removeEntityEvent, this._id);
    }
  }

  onEndFighting(entity) {
    if (!entity) {
      this.stopFight();
      this.updatePath();
      return;
    } else {
      entity.hit(this.attack);
    }
    if (!entity.hp) {
      this.stopFight();
      this.updatePath();
    }
  }

  onEndPath(entity) {
    if(!entity) {
      if(this.mustBack) { // Lacycle de vie est terminé
        return ee.emit(removeEntityEvent, this._id);
      } else { // la cible n'existe plus
        this.updatePath();
      }
    } else if (entity.constructor.name === REPOSITORY) {
      this.startFight(entity._id);
      this.mustBack = true;
    } else if (entity.constructor.name === MILITIAMAN) {
      if (this.ground.isInSameTile(this, entity)) { //La cible est dans la même case;
        this.startFight(entity._id); //On commence à attaquer
      } else if (entity.path) { //La cible n'est pas dans la même case et se déplace
        this.await(entity._id); // On attend la cible
      } else {  //La cible ne bouge pas mais s'est déplacée
        this.updatePath(); //update de la destination
      }
    }
  }

  setFightPosition(entity) {
    const tileCenter = this.ground.getTileCenter(this.ax, this.az);
    let angle = 0;
    angle = Math.atan2(this.az - entity.az, this.ax - entity.ax);
    angle += ((Math.random() * 2 - 1) * Math.PI) / 5;
    const x = (Math.cos(angle) * this.ground.tileSize) / 5 + tileCenter.x;
    const y = tileCenter.y;
    const z = (Math.sin(angle) * this.ground.tileSize) / 5 + tileCenter.z;
    this.move(x, y, z, angle + Math.PI);
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
