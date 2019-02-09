const Building = require('../../../kernel/model/building');
const ee = require('../../../kernel/tools/eventemitter');
const Stats = require('../../../kernel/model/stats');

class Repository extends Building {

    constructor(config, ground) {
        super(config, ground);
        this.maxByBlock = 16;
        this.maxBlock = 15;
        this.isFull = false;
        this.isFullType = {};
        this.blocksType = new Uint8Array(this.maxBlock);
    }

    updateBlocks(type, value) {
        const targetValue = this.stats[type] + value;

        let availableBlocks = 0;
        let freeBlockIndex = -1;
        let i = 0;

        for (i; i < this.maxBlock; i++) {
            if (this.blocksType[i] === type) {
                availableBlocks++;
            } else if (this.blocksType[i] === 0) {
                freeBlockIndex = i;
                break;
            }
        }

        const neededBlocks = Math.ceil(targetValue / this.maxByBlock);
        let missingBlocks = neededBlocks - availableBlocks;
        this.isFullType[type] = false;
        while (missingBlocks !== 0) {
            if (missingBlocks < 0) {
                i = this.blocksType.lastIndexOf(type);
                this.blocksType[i] = 0;
                missingBlocks++;
                availableBlocks--;
            } else if (missingBlocks > 0) {
                if (freeBlockIndex !== -1) {
                    this.blocksType[i] = type;
                    missingBlocks--;
                    availableBlocks++;
                    freeBlockIndex = this.blocksType.indexOf(0);
                } else { //aucune place disponible
                    const rest = targetValue - availableBlocks * this.maxByBlock;
                    missingBlocks = 0;
                    return value - rest;
                }
            }
        }

        return value;
    }

    pushResource(type, value) {
        const availableValue = this.updateBlocks(type, value);
        if (this.blocksType.lastIndexOf(0) === -1){// plus de block libre
            this.isFull = true;
            if(availableValue <= value) {// plus de place dans les block occupés pas ce materiaux
                this.isFullType[type] = true;
            }
        }
        this.stats.push(type, availableValue);
        this.updated = true;
    }

    pullResource(type, value) {
        const availableValue = this.stats.pull(type, value);
        this.updateBlocks(type, -availableValue);
        this.isFullType[type] = false;
        this.isFull = this.blocksType.lastIndexOf(0) === -1;
        this.updated = true;
        return availableValue;
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
Repository.cost = {
    [Stats.WOOD]: 5
};
Repository.require = {
    inactive: 2
};
Repository.enabled = {
    wood: 5
};
Repository.displayed = ['wood', 'stone'];
Repository.constuctDuration = 1000;
Repository.waterLevelNeeded = 0;
Repository.instances = [];

module.exports = Repository;