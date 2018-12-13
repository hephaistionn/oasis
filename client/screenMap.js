const ee = require('./kernel/tools/eventemitter');
const Screen = require('./kernel/model/screen');
const Camera = require('./model/app/camera');
const Light = require('./model/app/light');
const Ground = require('./model/app/ground');
const pixelMap = require('./kernel/tools/pixelmap');
const Catalog = require('./model/ui/catalog');
const Info = require('./model/ui/info');
const Stats = require('./model/ui/stats');
const Store = require('./kernel/tools/store');
const Road = require('./model/app/road');
const Canal = require('./model/app/canal');

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
    ForestHut: require('./model/app/buildings/forestHut'),
    Builder: require('./model/app/characters/builder'),
    Lumberjack: require('./model/app/characters/lumberjack'),
};

module.exports = class ScreenMap extends Screen {

    async initComponents(model) {
        const mapConfig = await pixelMap.compute('map/map00.png', ENTITIES);

        const centerX = mapConfig.nbTileX * mapConfig.tileSize / 2;
        const centerZ = mapConfig.nbTileZ * mapConfig.tileSize / 2;

        this.camera = new Camera({ x: centerX + 40, y: 60, z: centerZ + 40, targetX: centerX, targetZ: centerZ, rangeX: centerX, rangeZ: centerZ });
        this.light = new Light({ x: 50, y: 180, z: -50 });
        this.ground = new Ground(mapConfig, ENTITIES, this._components);
        this.road = new Road({}, this.ground);
        this.canal = new Canal({}, this.ground);
        this.catalog = new Catalog(mapConfig);
        this.info = new Info();
        this.store = new Store();
        this.stats = new Stats({}, this.store);
        this.drafted = null;
        this.selected = this.ground; // this.selected never undefined for evoid if

        this.add(this.camera);
        this.add(this.light);
        this.add(this.ground);
        this.add(this.catalog);
        this.add(this.info);
        this.add(this.stats);
        this.add(this.road);
        this.add(this.canal);


        this.populate(model, mapConfig);

        this.store.watch(ENTITIES.Repository.instances);
        this.store.watch(ENTITIES.Attic.instances);
        this.store.watch(ENTITIES.ForestHut.instances);
    }

    populate(model, config) {
        let x, y, z, a, type, value, size = config.tileSize, tile;

        for (let i = 0; i < config.nbTiles; i++) {
            value = config.tilesResource[i];
            if (value === 0) continue;
            type = config.codeToEntities.get(value);
            z = Math.floor(i / this.ground.nbTileX);
            x = (i % this.ground.nbTileX);
            if (type/* && this.ground.isWalkable(x, z) === true*/) {
                tile = this.ground.getTileCenter(x * size, z * size);
                this.addEntity({ x: tile.x, y: tile.y, z: tile.z, type: type });
            }
        }
    }

    addEntity(config) {
        const entity = new ENTITIES[config.type](config, this.ground);
        this.add(entity);
    }

    removeEntity(entityId) {
        this.remove(this.get(entityId));
    }

    onDraftEntity(config) {
        this.drafted = new ENTITIES[config.type](config, this.ground);
        this.add(this.drafted);
    }

    onDraftRoad(config) {
        this.road.draft(2)
    }

    onDraftCanal(config) {
        this.canal.draft()
    }

    construcBuilding(cancel) {
        if (this.drafted && cancel) {
            this.drafted.cancelConstruct();
        }
        if (this.drafted && this.drafted.isWalkable()) {
            this.drafted.startConstruct()
        }
        this.drafted = null;
    }

    constructDraft(cancel) {
        if (this.road.drafted) {
            if(cancel) this.road.cancelConstruct();
            else this.road.startConstruct()
        }
        if (this.canal.drafted) {
            if(cancel) this.canal.cancelConstruct()
            else this.canal.startConstruct()
        }
    }

    onSelect(entity) {
        this.selected.select(false);
        this.selected = entity;
        this.selected.select(true);
    }

    onMouseUp() {
        this.constructDraft();
    }

    onMouseClick() {
        this.selected.select(false);
        this.construcBuilding();
    }

    onMouseDownRight() {
        this.selected.select(false);
        this.construcBuilding(true);
        this.constructDraft(true);
    }

    onDismount() {
        this.store.dismount();
    }

};
