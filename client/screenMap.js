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
const Remover = require('./model/app/remover');
const Spawner = require('./model/app/spawner');
const repository = require('./kernel/model/repository');

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
    Tower: require('./model/app/buildings/tower'),
    StoneMine: require('./model/app/buildings/stoneMine'),
    ForestHut: require('./model/app/buildings/forestHut'),
    Builder: require('./model/app/characters/builder'),
    Lumberjack: require('./model/app/characters/lumberjack'),
    Hunter: require('./model/app/characters/hunter'),
    Carrier: require('./model/app/characters/carrier'),
    Provider: require('./model/app/characters/provider'),
    Militiaman: require('./model/app/characters/militiaman'),
    Navvy: require('./model/app/characters/navvy'),
};

module.exports = class ScreenMap extends Screen {

    async initComponents(model) {
        const mapConfig = await pixelMap.compute('map/map00.png', ENTITIES);

        const centerX = mapConfig.nbTileX * mapConfig.tileSize / 2;
        const centerZ = mapConfig.nbTileZ * mapConfig.tileSize / 2;

        this.camera = new Camera({ x: centerX + 40, y: 60, z: centerZ + 40, targetX: centerX, targetZ: centerZ, rangeX: centerX, rangeZ: centerZ });
        this.light = new Light({ x: 50, y: 180, z: -50 });
        this.ground = new Ground(mapConfig, ENTITIES, this._components);
        this.store = new Store();
        this.road = new Road({}, this.ground, this.store);
        this.canal = new Canal({}, this.ground, this.store);
        this.catalog = new Catalog(mapConfig, ENTITIES, this.store);
        this.info = new Info({}, this._components);
        this.stats = new Stats({}, this.store);
        this.remover = new Remover({}, this.ground);
        //this.spawner = new Spawner({}, this.ground);
        this.repository = repository.init(model);

        this.add(this.camera);
        this.add(this.light);
        this.add(this.ground);
        this.add(this.catalog);
        this.add(this.info);
        this.add(this.stats);
        this.add(this.road);
        this.add(this.canal);
        this.add(this.remover);

        this.populate(model, mapConfig);

        this.store.watch(ENTITIES.Repository.instances);
        this.store.watch(ENTITIES.Attic.instances);

        ee.emit('onUpdateStats');
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

    update(dt) {
        if (this.spawner)
            this.spawner.update(dt);
    }

    addEntity(config) {
        const entity = new ENTITIES[config.type](config, this.ground);
        this.add(entity);
    }

    removeEntity(entityId) {
        this.remove(this.get(entityId));
    }

    onMouseUp() {

    }

    onMouseClick() {

    }

    onMouseDownRight() {

    }

    onDismount() {
        this.store.dismount();
        this.spawner.dismount();
    }

};
