const ee = require('./kernel/tools/eventemitter');
const Screen = require('./kernel/model/screen');
const Camera = require('./model/app/camera');
const Light = require('./model/app/light');
const Ground = require('./model/app/ground');
const pixelMap = require('./kernel/tools/pixelmap');
const Catalog = require('./model/ui/catalog');
const ENTITIES = {
    Berry: require('./model/app/resources/berry'),
    Game: require('./model/app/resources/game'),
    Stone: require('./model/app/resources/stone'),
    Tree: require('./model/app/resources/tree'),
    Attic: require('./model/app/buildings/attic'),
    Barrack: require('./model/app/buildings/barrack'),
    House: require('./model/app/buildings/house'),
    HunterHut: require('./model/app/buildings/hunterHut'),
    LeaderHut: require('./model/app/buildings/leaderHut'),
    Market: require('./model/app/buildings/market'),
    Repository: require('./model/app/buildings/repository'),
    StoneMine: require('./model/app/buildings/stoneMine'),
    WoodcutterHut: require('./model/app/buildings/woodcutterHut'),
    Builder: require('./model/app/characters/builder')
};


module.exports = class ScreenMap extends Screen {

    async initComponents(model) {

        const mapConfig = await pixelMap.compute('map/map00.png', ENTITIES);

        const centerX = mapConfig.nbTileX * mapConfig.tileSize / 2;
        const centerZ = mapConfig.nbTileZ * mapConfig.tileSize / 2;

        this.camera = new Camera({ x: centerX + 40, y: 60, z: centerZ + 40, targetX: centerX, targetZ: centerZ, rangeX: centerX, rangeZ: centerZ });
        this.light = new Light({ x: 20, y: 100, z: -20 });
        this.ground = new Ground(mapConfig, ENTITIES);
        this.catalog = new Catalog(mapConfig);
        this.selected = null;
        this.focused = null;

        this.add(this.camera);
        this.add(this.light);
        this.add(this.ground);
        this.add(this.catalog);

        this.populate(model, mapConfig);

    }

    update(dt) {

    }

    populate(model, config) {
        let x, y, z, a, type, value, size = config.tileSize, tile;

        for (let i = 0; i < config.nbTiles; i++) {
            value = config.tilesResource[i];
            if (value === 0) continue;
            type = config.codeToEntities.get(value);
            z = Math.floor(i / this.ground.nbTileX);
            x = (i % this.ground.nbTileX);
            if (type && this.ground.isWalkable(x, z) === true) {
                tile = this.ground.getTile(x * size, z * size);
                this.addEntity({ x: tile.x, y: tile.y, z: tile.z, type: type });
            }
        }
    }

    addEntity(config) {
        const entity = new ENTITIES[config.type](config);
        this.add(entity);
        if (entity.constructor.walkable !== undefined) {
            this.ground.setWalkable(entity);
        }
        if (entity.targets) {
            entity.buildPaths(this.ground);
        }
    }

    removeEntity(entityId) {
        const entity = this.get(entityId);
        if(!entity) return;
        ground.setWalkable(entity, 1);
        this.remove(entity);
    }

    onDraftEntity(config) {
        this.selected = new ENTITIES[config.type](config);
        this.add(this.selected);
    }

    onUndraftEntity(config) {
        this.remove(this.selected);
    }

    onSelect(id) {
        console.log(id)
        const entity = this.get(id);
        if(entity) {
            if(this.focused) {
                this.focused.select(false);
            }
            this.focused = entity;
            this.focused.select(true);
        }

    }

    onMouseClick()  {
        if(this.focused) {
            this.focused.select(false);
        }
    }

    onUnselect() {
        this.remove(this.selected);
        this.selected = null;
    }

    onMouseUp(x, y) {
        if (this.selected) {
            const tiles = this.selected.getTiles();
            if (this.ground.isWalkable(tiles)) {
                this.addEntity({
                    type: this.selected.constructor.name,
                    x: this.selected.ax,
                    y: this.selected.ay,
                    z: this.selected.az,
                    builded: true
                });
                this.onUnselect()
            }
        }
    }

    onMouseMove(x, y, z) {
        if (this.selected) {
            const tile = this.ground.getTile(x, z);
            this.selected.move(tile.x, tile.y, tile.z);
            const tiles = this.selected.getTiles();
            const dropable = this.ground.isWalkable(tiles);
            this.selected.setDropable(dropable);
        }

    }

    onMouseDown(x, y) {
        this.camera.draggStart();
    }

    onMouseMovePress(dx, dy) {
        this.camera.dragg(dx, dy);
    }

    onMouseWheel(delta) {
        this.camera.scale(delta);
    }

};
