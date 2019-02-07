const Building = require('../../../kernel/model/building');
const ee = require('../../../kernel/tools/eventemitter');
const Stats = require('../../../kernel/model/stats');

class Bridge extends Building {

    constructor(config, ground) {
        super(config, ground);
    }

    moveDraft(x, y, z) {
        if (this.drafted) {
            const tile = this.ground.getTileCenter(x, z);
            let xi = Math.floor(tile.x / this.ground.tileSize);
            let zi = Math.floor(tile.z / this.ground.tileSize);
            let roty = this.ground.getCanalDirection(xi, zi);
            if (roty === -1) roty = 0;
            this.move(tile.x, tile.y, tile.z, roty);
        }
    }

    onMove() {
        if (this.drafted) {
            let xi = Math.floor(this.ax / this.ground.tileSize);
            let zi = Math.floor(this.az / this.ground.tileSize);
            const walkable = this.ground.isWalkable(xi, zi);
            const isCanal = this.ground.getCanalDirection(xi, zi) !== -1;
            this.undroppable = !isCanal || walkable;
            if (this.undroppable) {
                this.ay += 4;
            }
        }
    }
}

Bridge.removable = true;
Bridge.levelMax = 2;
Bridge.description = 'This building increase the enable places for your population';
Bridge.name = 'Pont';
Bridge.picture = '/pic/house.png';
Bridge.tileX = 1;
Bridge.tileZ = 1;
Bridge.walkable = 1;
Bridge.cost = { [Stats.WOOD]: 5 };
Bridge.upgrade = [{},{[Stats.WOOD]: 5}];
Bridge.waterLevelNeeded = 255;
Bridge.constuctDuration = 1000;
Bridge.instances = [];

module.exports = Bridge;
