const Building = require('../../../kernel/model/building');
const Stats = require('../../../kernel/model/stats');
const ee = require('../../../kernel/tools/eventemitter');

class WallBlock extends Building {

    constructor(config, ground) {
        super(config, ground);
        this.shape = config.shape;
    }

    updateShape(value) {
        const shape = this.ground.wallShape[value * 2];
        const angle = this.ground.wallShape[value * 2 + 1] * Math.PI/2;
        this.shape = shape;
        this.aroty = angle;
        this.updated = true;
    }

}

WallBlock.selectable = true;
WallBlock.removable = true;
WallBlock.levelMax = 2;
WallBlock.description = 'This building increase the enable places for your population';
WallBlock.label = 'Mur';
WallBlock.picture = '/pic/house.png';
WallBlock.tileX = 1;
WallBlock.tileZ = 1;
WallBlock.walkable = 0;
WallBlock.constuctDuration = 1000;
WallBlock.instances = [];
WallBlock.wall = true;
WallBlock.upgrade = [{},{[Stats.WOOD]: 5}];

//optimization mémoire : evite d'ajouter n fonction en écoute de l'event onWallTileUpdated. les instances WallBlock peuvent être très nombreuses
ee.on('onWallTileUpdated', function(ax, az, value) { 
    const instance = WallBlock.instances.find(ins => ins.ax === ax && ins.az === az);
    if(instance) {
        instance.updateShape(value);
    }
});

module.exports = WallBlock;