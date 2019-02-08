const Character = require('../../../kernel/model/character');
const ee = require('../../../kernel/tools/eventemitter');
const pathfinding = require('../../../kernel/tools/pathfinding')
const Stats = require('../../../kernel/model/stats');
const repository = require('../../../kernel/model/repository')

class Craftsman extends Character {
    constructor(params, ground) {
        super(params, ground);
        this.capacity = 5;
        this.workingDuration = 10000; //await if no available resources
        this.targetBuilding = params.origin;
        this.getResource();
    }

    getResource() {
        let neededType, neededValue;
        const entity = this.ground.getEntity(this.origin);
        if (!entity) {
            this.autoRemove();
        }

        for (let key in entity.constructor.upgrade[entity.level]) {
            const need = entity.constructor.upgrade[entity.level][key] - entity.materials[key];
            if (need > 0) {
                neededType = key;
                neededValue = need;
                break;
            }
        }

        if (repository.stats[neededType] > 0) { //si la ressource est encore disponible dans le repo de demarrage
            const value = repository.stats.pull(neededType, Math.min(neededValue, this.capacity));
            this.stats.set(neededType, value);
            const tile = this.ground.getFreeRandomBorder();
            this.ax = tile[0];
            this.ay = tile[1];
            this.az = tile[2];
        } else { // sinon la ressource est prise dans les repo du jeu.
            const realNearestRepos = pathfinding.nearestEntities(this.ground.ENTITIES, 'Repository', neededType, entity.ax, entity.az);
            if (realNearestRepos.length) {
                const value = realNearestRepos[0].stats.pull(neededType, Math.min(neededValue, this.capacity));
                this.stats.set(neededType, value);
                this.ax = realNearestRepos[0].ax;
                this.ay = realNearestRepos[0].ay;
                this.az = realNearestRepos[0].az;
            } else {
                const tile = this.ground.getFreeRandomBorder();
                this.ax = tile[0];
                this.ay = tile[1];
                this.az = tile[2];
                this.working = true;
                return;
            }
        }

        this.targets.push({ id: this.targetBuilding });
        this.origin = null;
    }

    onEndPath(entity) {
        for (let key in this.stats) {
            if (this.stats[key] > 0) {
                const value = this.stats.pull(key, this.stats[key]);
                entity.upgrade(key, value);
                break;
            }
        }
        this.autoRemove();
    }

    onEndWorking() {
        this.getResource();
        this.buildPaths();
    }
}

Craftsman.selectable = true;
Craftsman.description = 'This building increase the enable places for your population';
Craftsman.label = 'Constructeur';
Craftsman.picture = '/pic/peon.png';
module.exports = Craftsman;