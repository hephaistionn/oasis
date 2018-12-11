const THREE = require('three');
const uvPath = require('../../kernel/tools/threejs/uvPath');
const materialDraft = require('./material/materialRoadSelected');
const materialRoad = require('./material/materialRoad');

module.exports = class Canal {

    constructor(model, parent) {
        this.tileSize = model.tileSize;
        this.nbPointX = model.ground.nbPointX;
        this.nbPointZ = model.ground.nbPointZ;
        this.tileHeight = model.ground.tileHeight;
        this.pointsHeights = model.ground.pointsHeights;
        this.pointsNormal = model.ground.pointsNormal;
        this.VERTEX_BY_TILE = 6;
        this.meshDraft = null;
        this.meshCanal = null;
        this.initDraftMesh(model);

        this.add(parent);
    }

    initDraftMesh(model) {
        this.MAX_TILES_DRAFT = model.maxTileDraft;
        this.MAX_VERTEX_DRAFT = this.VERTEX_BY_TILE * this.MAX_TILES_DRAFT;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.MAX_VERTEX_DRAFT * 3);
        const walkable = new Float32Array(this.MAX_VERTEX_DRAFT * 1);
        geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.addAttribute('walkable', new THREE.BufferAttribute(walkable, 1));
        geometry.setDrawRange(0, 3);
        this.meshDraft = new THREE.Mesh(geometry, materialDraft);
        this.meshDraft.matrixAutoUpdate = false;
        this.meshDraft.frustumCulled = false;
        this.meshDraft.matrixWorldNeedsUpdate = false;
        this.meshDraft.receiveShadow = false;
        this.meshDraft.drawMode = THREE.TrianglesDrawMode;
    }

    updateCanal(model) {

    }

    updateDraft(model) {
        const tiles = model.draftCanal.tiles;
        const valid = model.draftCanal.valid;
        const l = model.draftCanal.length;
        const geometry = this.meshDraft.geometry;
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
            color = valid[i];

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
        if (!model.drafted) {
            this.updateCanal(model);
        }
        this.updateDraft(model);
    }

    remove(parent) {
        //parent.render.scene.remove(this.meshCanal);
        parent.render.scene.remove(this.meshDraft);
    }

    add(parent) {
        //parent.render.scene.add(this.meshCanal);
        parent.render.scene.add(this.meshDraft);
    }
};
