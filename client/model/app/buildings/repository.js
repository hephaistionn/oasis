const Building = require('../../../kernel/model/building');
const ee = require('../../../kernel/tools/eventemitter');
const Stats = require('../../../kernel/model/stats');

class Repository extends Building {

    constructor(config, ground) {
        super(config, ground);
        this.maxByBlock = 16;
        this.maxBlock = 15;
        this.full = false;
        this.fullType = {};
        this.blocksType = new Uint8Array(this.maxBlock);
        this.blocksValue = new Uint8Array(this.maxBlock);
        this.blocksTypeForce = new Uint8Array(this.maxBlock);
    }

    updateFullStatus(type) {
        this.fullType[type] = true;
        this.full = true;
        for (let i=0; i < this.maxBlock; i++) {
            if(this.blocksType[i] === type && this.blocksValue[i]<this.maxByBlock  && (this.blocksTypeForce[i] === type || this.blocksTypeForce[i] === 0)) {
                this.fullType[type] = false;
            }else if( this.blocksType[i] === 0) {
                this.fullType[type] = false;
                this.full = false;
            }else  if(this.blocksValue[i] === 0)  {
                this.fullType[this.blocksType[i]] = false;
            }
        }
    }

    updateBlocks(type, value) {
        let restValue = value, available;
        let sum = 0;
        for (let i = 0; i < this.maxBlock; i++) {
            if (this.blocksType[i] === type || this.blocksType[i] === 0) {
                if(restValue > 0) {
                    if(this.blocksTypeForce[i] === type || this.blocksTypeForce[i] === 0) {
                        available = Math.min(this.maxByBlock-this.blocksValue[i], restValue);
                        this.blocksValue[i] += available; 
                        this.blocksType[i] = type;// type reservé
                        restValue -= available;
                    }
                } else if(restValue < 0) {
                    available = Math.min(this.blocksValue[i], -restValue);
                    this.blocksValue[i] -= available; 
                    restValue += available;
                    if(this.blocksValue[i] === 0) {
                        this.blocksType[i] = this.blocksTypeForce[i]
                    }
                }
                sum+=this.blocksValue[i];
            }
        }

        if(this.stats[type] < sum) {
            this.stats.push(type, sum-this.stats[type]);
        } else {
            return this.stats.pull(type, this.stats[type]-sum);
        }
    }

    pushResource(type, value) {
        this.updateBlocks(type, value);
        this.updateFullStatus(type);
        this.updated = true;
    }

    pullResource(type, value) {
        const gettedValue = this.updateBlocks(type, -value);
        this.updateFullStatus(type);
        this.updated = true;
        return gettedValue;
        
    }

    ajustResources(index, type) {
        const erased = {};
        let k;
        for(let i=0; i<5; i++) {
            k = i+index*5
            this.blocksTypeForce[k] = type;
            if(this.blocksType[k] === 0 || this.blocksType[k] === type || this.blocksValue[k]===0) {
                this.blocksType[k] = type;
            } else {
                erased[this.blocksType[k]] = true;
            }
        }
        this.updateFullStatus(type);
        for(let key in erased) {
            this.updateFullStatus(key);
        }
        this.updated = true;
    }
}
Repository.selectable = true;
Repository.removable = true;
Repository.levelMax = 1;
Repository.description = 'This building increase the enable places for your population';
Repository.label = 'Entrepot';
Repository.picture = '/pic/repository.png';
Repository.tileX = 2;
Repository.tileZ = 2;
Repository.walkable = 0;
Repository.cost = {[Stats.WOOD]: 5};
Repository.require = {inactive: 2};
Repository.enabled = {wood: 5};
Repository.display = [Stats.WOOD, Stats.STONE, Stats.MEAT];
Repository.constuctDuration = 1000;
Repository.waterLevelNeeded = 0;
Repository.instances = [];

module.exports = Repository;