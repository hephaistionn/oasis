const Building = require('../../../kernel/model/building');
const ee = require('../../../kernel/tools/eventemitter');
const Stats = require('../../../kernel/model/stats');

class Repository extends Building {

    constructor(config, ground) {
        super(config, ground);
        this.maxByBlock = 16;
        this.maxBlock = 15;

        this.limitBlock = {};
        this.fullBlock = {};
        this.removableBlock = {};
        this.maxType = {};
        
        this.blocksType = new Uint8Array(this.maxBlock);
        this.blocksValue = new Uint8Array(this.maxBlock);

        if(!this.drafted)  {
            this.currentType = [0,0,0]; //si pas construit, tout est bloqué
            this.ajustResources();
        }

    }

    onStart(){
        this.currentType = [1,2,3];
        this.ajustResources();
    }

    updateFullStatus(type) {
        let countBlock = 0;
        let partialBlock = 0;
        for (let i=0; i < this.maxBlock; i++) {
            if(this.blocksType[i] === type) {
                countBlock++;
                if(this.blocksValue[i]<this.maxByBlock) {
                    partialBlock++;
                }
            }
        }

        if(countBlock > this.maxType[type]) {
            this.limitBlock[type] = true;
            this.fullBlock[type] = true;
            this.removableBlock[type]  = true;
        } else if (countBlock === this.maxType[type]) {
            this.limitBlock[type] = true;
            this.fullBlock[type] = partialBlock === 0;
            this.removableBlock[type] = false;
        } else  {
            this.limitBlock[type] = false;
            this.fullBlock[type] = false;
            this.removableBlock[type] = false;
        }

    }

    updateBlocks(type, value) {
        let restValue = value, available, i;

        if(value > 0) {
            for (i = 0; i < this.maxBlock; i++) {
                if(restValue > 0) {
                        if (this.blocksType[i] === type && this.blocksValue[i] < this.maxByBlock && this.fullBlock[type] === false) {
                            available = Math.min(this.maxByBlock-this.blocksValue[i], restValue);
                            this.blocksValue[i] += available; 
                            restValue -= available;
                        } else if (this.limitBlock[type] === false) {
                            if(this.blocksType[i] === 0 ) {
                                available = Math.min(this.maxByBlock, restValue);
                                this.blocksValue[i] += available;
                                this.blocksType[i] = type;
                                restValue -= available;
                            } else if(this.removableBlock[this.blocksType[i]])  {
                                available = Math.min(this.maxByBlock, restValue);
                                this.blocksValue[i] = available;
                                this.blocksType[i] = type;
                                restValue -= available;
                            }
                        }
                } else {
                    break;
                }
            }
            this.stats.push(type, value-restValue);
        } else {
            for (i = 0; i < this.maxBlock; i++) {
                if(restValue < 0) {
                    if (this.blocksType[i] === type ) {
                        available = Math.min(this.blocksValue[i], -restValue);
                        this.blocksValue[i] -= available; 
                        restValue += available;
                        if(this.blocksValue[i] === 0) {
                            this.blocksType[i] = 0;
                        }
                    } 
                } else {
                    break;
                }
            
            }
            return this.stats.pull(type, -(value-restValue));
        }
    }

    pushResource(type, value) {
        this.updateBlocks(type, value);
        this.updateFullStatus(type);
        for(let i=0; i<3; i++) { //si un type de block et écrasé, il peut revenir à une quantité authorisé
            if(this.currentType[i] !== type && this.removableBlock[this.currentType[i]])  {
                this.updateFullStatus(this.currentType[i]);
            }
        }
        this.updated = true;
    }

    pullResource(type, value) {
        const gettedValue = this.updateBlocks(type, -value);
        this.updateFullStatus(type);
        this.updated = true;
        return gettedValue;   
    }

    ajustResources(index, type) {
        if(index !== undefined && type !== undefined )  {
            this.currentType[index] = type;
        }
        
        const types = Stats.materialTypes;
        for(let i=0, l=types.length; i<l;i++) {
            this.maxType[types[i]] = 0;
            this.limitBlock[types[i]] = true;
            this.fullBlock[types[i]] = true;
            this.removableBlock[types[i]]  = true;
        }

        if(this.currentType[0] !==0) {
            this.maxType[this.currentType[0]] += 5;
            this.updateFullStatus(this.currentType[0]);
        }
            
        if(this.currentType[1] !==0) {
            this.maxType[this.currentType[1]] += 5;
            this.updateFullStatus(this.currentType[1]);
        }
            
        if(this.currentType[2] !==0) {
            this.maxType[this.currentType[2]] += 5;
            this.updateFullStatus(this.currentType[2]);
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