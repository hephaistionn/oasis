const Character = require('../../../kernel/model/character');
const ee = require('../../../kernel/tools/eventemitter');
const pathfinding = require('../../../kernel/tools/pathfinding')
const Stats = require('../../../kernel/model/stats');
const repository = require('../../../kernel/model/repository')

class Navvy extends Character {
    constructor(params, ground) {
        super(params, ground);
        this.capacity = 5;
		this.targetBuilding = params.origin;
		this.origin = null;
        this.getResource();
    }

    getResource() {
		let neededType, neededValue;
		this.targets = [];
        const entity = this.ground.getEntity(this.targetBuilding);
        if (!entity) {
            this.autoRemove();
        }
        const cost = entity.getCost();
        for (let key in cost) {
            const need = cost[key];
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
			const tile = entity.getFirstTodo();
			const tileSize = this.ground.tileSize;
            const realNearestRepos = pathfinding.nearestEntities(this.ground.ENTITIES, 'Repository', neededType, tile[0] * tileSize, tile[1] * tileSize);
            if (realNearestRepos.length) {
                const value = realNearestRepos[0].stats.pull(neededType, Math.min(neededValue, this.capacity));
                this.stats.set(neededType, value);
                this.ax = realNearestRepos[0].ax;
                this.ay = realNearestRepos[0].ay;
                this.az = realNearestRepos[0].az;
            } else { // attendre que la ressource soit dispo
                const tile = this.ground.getFreeRandomBorder();
                this.ax = tile[0];
                this.ay = tile[1];
                this.az = tile[2];
				this.working = true;
                return;
            }
        }
        this.targets.push({ id: this.targetBuilding });
    }

    onEndPath(entity) {
      this.working = true;
      this.workingDuration = entity.constuctDuration;
      for (let key in this.stats) {
          if (this.stats[key] > 0) {
              const value = this.stats.pull(key, entity.costByTile[key]);
              if(value === 0) {
                this.autoRemove();
              }
              break;
          }
      }
    }

    onEndWorking(entity) {
		if(entity) {
			entity.constructProgress();
			if(this.haveResources() && entity.todo.length) { //si on a des ressources et la construction n'est pas terminée
			  this.buildPaths();//on va vers la case suivante;
			} else {
			  entity.navvyReturn();
			  this.autoRemove();
			}
		} else { // il était en train d'attendre les ressources
			this.getResource();
			this.buildPaths();
		}
    }

    haveResources() {
      for (let key in this.stats) {
        if (this.stats[key] > 0) {
            return true;
            break;
        }
      }
      return false;
    }
}

module.exports = Navvy;