const Building = require('../../../kernel/model/building');
const ee = require('../../../kernel/tools/eventemitter');

class WoodcutterHut extends Building {

    constructor(config) {
        super(config);
        if(!this.drafted)
            this.spawnCharacter('Builder');
    }
}

WoodcutterHut.removable = true;
WoodcutterHut.description = 'This building increase the prosperity of your city';
WoodcutterHut.tileX = 1;
WoodcutterHut.tileZ = 1;
WoodcutterHut.cost = {stone: 2};
WoodcutterHut.require = {inactive: 2};
WoodcutterHut.enabled = {stone: 2};
WoodcutterHut.displayed = ['workers', 'wood'];
WoodcutterHut.walkable = 0;
WoodcutterHut.constuctDuration = 1000;
WoodcutterHut.instances = [];
module.exports = WoodcutterHut;
