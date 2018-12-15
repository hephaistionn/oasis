const THREE = require('three');
const materialDraft = require('./material/materialRoadSelected');

module.exports = class Remover {

    constructor(model, parent) {
        this.tileSize = model.tileSize;
        this.nbPointX = model.ground.nbPointX;
        this.nbPointZ = model.ground.nbPointZ;
        this.tileHeight = model.ground.tileHeight;
        this.pointsHeights = model.ground.pointsHeights;
        this.pointsNormal = model.ground.pointsNormal;
        this.VERTEX_BY_TILE = 6;
        this.meshArea = null;
        this.initAreaMesh(model);

        this.add(parent);
    }

    initAreaMesh(model) {
        this.MAX_TILES = model.maxTile;
        this.MAX_VERTEX_DRAFT = this.VERTEX_BY_TILE * this.MAX_TILES;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.MAX_VERTEX_DRAFT * 3);
        const remove = new Float32Array(this.MAX_VERTEX_DRAFT * 1);
        geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.addAttribute('walkable', new THREE.BufferAttribute(remove, 1));
        geometry.setDrawRange(0, 3);
        this.meshArea = new THREE.Mesh(geometry, materialDraft);
        this.meshArea.matrixAutoUpdate = false;
        this.meshArea.frustumCulled = false;
        this.meshArea.matrixWorldNeedsUpdate = false;
        this.meshArea.receiveShadow = false;
        this.meshArea.drawMode = THREE.TrianglesDrawMode;
    }

    updateAera(model) {
        const tiles = model.area.tiles;
        const remove = model.area.remove;
        const l = model.area.length;
        const geometry = this.meshArea.geometry;
        const positions = geometry.attributes.position.array;
        const walkables = geometry.attributes.walkable.array;

        let x, z, i, vx, vz = 0;
        let ctn = 0;
        let ctnColor = 0, color;
        let absoluteIndex;

        geometry.drawRange.count = 1; //avoid WARNING: Render count or primcount is 0.

        for (i = 0; i < l; i++) {
            x = tiles[i * 2];
            z = tiles[i * 2 + 1];
            color = remove[i];

            vx = x;
            vz = z + 1;
            absoluteIndex = vz * this.nbPointX + vx;
            walkables[ctnColor++] = color;
            positions[ctn++] = vx * this.tileSize;
            positions[ctn++] = this.pointsHeights[absoluteIndex] * this.tileHeight + 0.05;
            positions[ctn++] = vz * this.tileSize;

            vx = x + 1;
            vz = z;
            absoluteIndex = vz * this.nbPointX + vx;
            walkables[ctnColor++] = color;
            positions[ctn++] = vx * this.tileSize;
            positions[ctn++] = this.pointsHeights[absoluteIndex] * this.tileHeight + 0.05;
            positions[ctn++] = vz * this.tileSize;

            vx = x;
            vz = z;
            absoluteIndex = vz * this.nbPointX + vx;
            walkables[ctnColor++] = color;
            positions[ctn++] = vx * this.tileSize;
            positions[ctn++] = this.pointsHeights[absoluteIndex] * this.tileHeight + 0.05;
            positions[ctn++] = vz * this.tileSize;


            vx = x + 1;
            vz = z + 1;
            absoluteIndex = vz * this.nbPointX + vx;
            walkables[ctnColor++] = color;
            positions[ctn++] = vx * this.tileSize;
            positions[ctn++] = this.pointsHeights[absoluteIndex] * this.tileHeight + 0.05;
            positions[ctn++] = vz * this.tileSize;

            vx = x + 1;
            vz = z;
            absoluteIndex = vz * this.nbPointX + vx;
            walkables[ctnColor++] = color;
            positions[ctn++] = vx * this.tileSize;
            positions[ctn++] = this.pointsHeights[absoluteIndex] * this.tileHeight + 0.05;
            positions[ctn++] = vz * this.tileSize;

            vx = x;
            vz = z + 1;
            absoluteIndex = vz * this.nbPointX + vx;
            walkables[ctnColor++] = color;
            positions[ctn++] = vx * this.tileSize;
            positions[ctn++] = this.pointsHeights[absoluteIndex] * this.tileHeight + 0.05;
            positions[ctn++] = vz * this.tileSize;

            geometry.drawRange.count = ctn / 3;
        }
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.walkable.needsUpdate = true;
    }

    update(dt, model) {
        if (model.area.tiles.length) {
            this.updateAera(model);
        }
    }

    remove(parent) {
        parent.render.scene.remove(this.meshArea);
    }

    add(parent) {
        parent.render.scene.add(this.meshArea);
    }
};
