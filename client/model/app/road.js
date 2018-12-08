const pathfinding = require('../../kernel/tools/pathfinding');
const ee = require('../../kernel/tools/eventemitter');

module.exports = class Road {

    constructor(config, ground) {
        this._id = config._id ? parseInt(config._id, 10) : Math.floor((1 + Math.random()) * 0x10000000000);
        this.ground = ground;
        this.tileSize = ground.tileSize;
        this.drafted = false;
        this.maxTile = 30;
        this.roadType;

        this.draftRoad = {
            tiles: new Uint16Array(2 * this.maxTile),
            walkable: new Uint8Array(this.maxTile),
            length: 0
        };


        ee.on('mouseDown', this.draftStart.bind(this));
        ee.on('mouseMovePress', this.draftStaggering.bind(this));
        ee.on('mouseMove', this.draftMove.bind(this));
    }

    draft(roadType) {
        this.drafted = true;
        this.roadType = roadType;
    }

    startConstruct() {
        this.drafted = false;
    }

    cancelConstruct() {
        this.drafted = false;
    }


    draftStart(x, z) {
        if (this.drafted) {

        }
    }

    draftStaggering(dx, dz) {
        if (this.drafted) {

        }
    }

    draftMove(x, y, z) {
        if (this.drafted) {
            const xi = Math.floor(x / this.tileSize);
            const zi = Math.floor(z / this.tileSize);
            this.draftRoad.tiles[0] = xi;
            this.draftRoad.tiles[1] = zi;
            if (!this.ground.grid.isWalkableAt(xi, zi)) {
                this.draftRoad.walkable[0] = 0;
            } else {
                this.draftRoad.walkable[0] = this.roadType;
            }
            this.draftRoad.length = 1;
            this.updated = true;
        }
    }

    onDismount() {
        ee.off('mouseDown', this.draftStart.bind(this));
        ee.off('mouseMovePress', this.draftStaggering.bind(this));
        ee.off('mouseMove', this.draftMove.bind(this));
    }
}
