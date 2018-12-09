const THREE = require('three');
const uvPath = require('../../kernel/tools/threejs/uvPath');
const materialDraft = require('./material/materialRoadSelected');
const materialRoad = require('./material/materialRoad');

module.exports = class Road {

    constructor(model, parent) {
        this.tileSize = model.tileSize;
        this.nbPointX = model.ground.nbPointX;
        this.nbPointZ = model.ground.nbPointZ;
        this.tileHeight = model.ground.tileHeight;
        this.pointsHeights = model.ground.pointsHeights;
        this.pointsNormal = model.ground.pointsNormal;
        this.VERTEX_BY_TILE = 6;
        this.meshDraft = null;
        this.meshRoad = null;
        this.initDraftMesh(model);
        this.initroadMesh(model)

        this.add(parent);
    }

    initroadMesh(model) {
        this.MAX_TILES_ROAD = model.maxTileRoad;
        this.MAX_VERTEX_DRAFT = this.VERTEX_BY_TILE * this.MAX_TILES_ROAD;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.MAX_VERTEX_DRAFT * 3);
        const uv = new Float32Array(this.MAX_VERTEX_DRAFT * 2);
        const type = new Float32Array(this.MAX_VERTEX_DRAFT * 1);
        const normal = new Float32Array(this.MAX_VERTEX_DRAFT * 3);
        geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.addAttribute('uv', new THREE.BufferAttribute(uv, 2));
        geometry.addAttribute('type', new THREE.BufferAttribute(type, 1));
        geometry.addAttribute('normal', new THREE.BufferAttribute(normal, 3));
        geometry.setDrawRange(0, 3);
        this.meshRoad = new THREE.Mesh(geometry, materialRoad);
        this.meshRoad.matrixAutoUpdate = false;
        this.meshRoad.frustumCulled = false;
        this.meshRoad.matrixWorldNeedsUpdate = false;
        this.meshRoad.receiveShadow = false;
        this.meshRoad.drawMode = THREE.TrianglesDrawMode;
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

    updateRoad(model) {
        const grid = model.ground.grid;
        const nodes = grid.nodes;
        const sizeNode = grid.sizeNode;
        const l = nodes.length
        const indexWalkable = grid.indexWalkable;
        const indexX = grid.indexX;
        const indexY = grid.indexY;
        const geometry = this.meshRoad.geometry;
        const positions = geometry.attributes.position.array;
        const normals = geometry.attributes.normal.array;
        const uvs = geometry.attributes.uv.array;
        const types = geometry.attributes.type.array;

        let roadType, x, z, a, b, c, d, e, f, g, h, uvref, vx, vz, i, k;
        let ctnP = 0, ctnN = 0, ctnU = 0, ctnT = 0;

        for (i = 0; i < l; i += sizeNode) {
            roadType = nodes[i + indexWalkable];
            if (roadType > 1) {
                x = nodes[i + indexX];
                z = nodes[i + indexY];
                a = grid.isWalkableAt(x - 1, z - 1) > 1 ? 1 : 0;
                b = grid.isWalkableAt(x, z - 1) > 1 ? 1 : 0;
                c = grid.isWalkableAt(x + 1, z - 1) > 1 ? 1 : 0;
                d = grid.isWalkableAt(x + 1, z) > 1 ? 1 : 0;
                e = grid.isWalkableAt(x + 1, z + 1) > 1 ? 1 : 0;
                f = grid.isWalkableAt(x, z + 1) > 1 ? 1 : 0;
                g = grid.isWalkableAt(x - 1, z + 1) > 1 ? 1 : 0;
                h = grid.isWalkableAt(x - 1, z) > 1 ? 1 : 0;
                uvref = uvPath[a * 128 + b * 64 + c * 32 + d * 16 + e * 8 + f * 4 + g * 2 + h];

                vx = x;
                vz = z + 1;
                k = vz * this.nbPointX + vx;
                normals[ctnN++] = this.pointsNormal[k * 3] / 127;
                normals[ctnN++] = this.pointsNormal[k * 3 + 1] / 127;
                normals[ctnN++] = this.pointsNormal[k * 3 + 2] / 127;
                positions[ctnP++] = vx * this.tileSize;
                positions[ctnP++] = this.pointsHeights[k] * this.tileHeight + 0.1;
                positions[ctnP++] = vz * this.tileSize;
                uvs[ctnU++] = uvref[6];
                uvs[ctnU++] = uvref[7];
                types[ctnT++] = roadType;

                vx = x + 1;
                vz = z;
                k = vz * this.nbPointX + vx;
                normals[ctnN++] = this.pointsNormal[k * 3] / 127;
                normals[ctnN++] = this.pointsNormal[k * 3 + 1] / 127;
                normals[ctnN++] = this.pointsNormal[k * 3 + 2] / 127;
                positions[ctnP++] = vx * this.tileSize;
                positions[ctnP++] = this.pointsHeights[k] * this.tileHeight + 0.1;
                positions[ctnP++] = vz * this.tileSize;
                uvs[ctnU++] = uvref[2];
                uvs[ctnU++] = uvref[3];
                types[ctnT++] = roadType;

                vx = x;
                vz = z;
                k = vz * this.nbPointX + vx;
                normals[ctnN++] = this.pointsNormal[k * 3] / 127;
                normals[ctnN++] = this.pointsNormal[k * 3 + 1] / 127;
                normals[ctnN++] = this.pointsNormal[k * 3 + 2] / 127;
                positions[ctnP++] = vx * this.tileSize;
                positions[ctnP++] = this.pointsHeights[k] * this.tileHeight + 0.1;
                positions[ctnP++] = vz * this.tileSize;
                uvs[ctnU++] = uvref[0];
                uvs[ctnU++] = uvref[1];
                types[ctnT++] = roadType;

                vx = x + 1;
                vz = z + 1;
                k = vz * this.nbPointX + vx;
                normals[ctnN++] = this.pointsNormal[k * 3] / 127;
                normals[ctnN++] = this.pointsNormal[k * 3 + 1] / 127;
                normals[ctnN++] = this.pointsNormal[k * 3 + 2] / 127;
                positions[ctnP++] = vx * this.tileSize;
                positions[ctnP++] = this.pointsHeights[k] * this.tileHeight + 0.1;
                positions[ctnP++] = vz * this.tileSize;
                uvs[ctnU++] = uvref[4];
                uvs[ctnU++] = uvref[5];
                types[ctnT++] = roadType;

                vx = x + 1;
                vz = z;
                k = vz * this.nbPointX + vx;
                normals[ctnN++] = this.pointsNormal[k * 3] / 127;
                normals[ctnN++] = this.pointsNormal[k * 3 + 1] / 127;
                normals[ctnN++] = this.pointsNormal[k * 3 + 2] / 127;
                positions[ctnP++] = vx * this.tileSize;
                positions[ctnP++] = this.pointsHeights[k] * this.tileHeight + 0.1;
                positions[ctnP++] = vz * this.tileSize;
                uvs[ctnU++] = uvref[2];
                uvs[ctnU++] = uvref[3];
                types[ctnT++] = roadType;

                vx = x;
                vz = z + 1;
                k = vz * this.nbPointX + vx;
                normals[ctnN++] = this.pointsNormal[k * 3] / 127;
                normals[ctnN++] = this.pointsNormal[k * 3 + 1] / 127;
                normals[ctnN++] = this.pointsNormal[k * 3 + 2] / 127;
                positions[ctnP++] = vx * this.tileSize;
                positions[ctnP++] = this.pointsHeights[k] * this.tileHeight + 0.1;
                positions[ctnP++] = vz * this.tileSize;
                uvs[ctnU++] = uvref[6];
                uvs[ctnU++] = uvref[7];
                types[ctnT++] = roadType;
            }
        }

        geometry.drawRange.count = ctnT;
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.uv.needsUpdate = true;
        geometry.attributes.type.needsUpdate = true;
        geometry.attributes.normal.needsUpdate = true;

    }

    updateDraft(model) {
        const tiles = model.draftRoad.tiles;
        const walkable = model.draftRoad.walkable;
        const l = model.draftRoad.length;
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
            color = walkable[i];

            vx = x;
            vz = z + 1;
            absoluteIndex = vz * this.nbPointX + vx;
            walkables[ctnColor++] = color;
            positions[ctn++] = vx * this.tileSize;
            positions[ctn++] = this.pointsHeights[absoluteIndex] * this.tileHeight + 0.1;
            positions[ctn++] = vz * this.tileSize;

            vx = x + 1;
            vz = z;
            absoluteIndex = vz * this.nbPointX + vx;
            walkables[ctnColor++] = color;
            positions[ctn++] = vx * this.tileSize;
            positions[ctn++] = this.pointsHeights[absoluteIndex] * this.tileHeight + 0.1;
            positions[ctn++] = vz * this.tileSize;

            vx = x;
            vz = z;
            absoluteIndex = vz * this.nbPointX + vx;
            walkables[ctnColor++] = color;
            positions[ctn++] = vx * this.tileSize;
            positions[ctn++] = this.pointsHeights[absoluteIndex] * this.tileHeight + 0.1;
            positions[ctn++] = vz * this.tileSize;


            vx = x + 1;
            vz = z + 1;
            absoluteIndex = vz * this.nbPointX + vx;
            walkables[ctnColor++] = color;
            positions[ctn++] = vx * this.tileSize;
            positions[ctn++] = this.pointsHeights[absoluteIndex] * this.tileHeight + 0.1;
            positions[ctn++] = vz * this.tileSize;

            vx = x + 1;
            vz = z;
            absoluteIndex = vz * this.nbPointX + vx;
            walkables[ctnColor++] = color;
            positions[ctn++] = vx * this.tileSize;
            positions[ctn++] = this.pointsHeights[absoluteIndex] * this.tileHeight + 0.1;
            positions[ctn++] = vz * this.tileSize;

            vx = x;
            vz = z + 1;
            absoluteIndex = vz * this.nbPointX + vx;
            walkables[ctnColor++] = color;
            positions[ctn++] = vx * this.tileSize;
            positions[ctn++] = this.pointsHeights[absoluteIndex] * this.tileHeight + 0.1;
            positions[ctn++] = vz * this.tileSize;

            geometry.drawRange.count = ctn / 3;
        }
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.walkable.needsUpdate = true;
    }

    update(dt, model) {
        if (!model.drafted) {
            this.updateRoad(model);
        }
        this.updateDraft(model);
    }

    remove(parent) {
        parent.render.scene.remove(this.meshRoad);
        parent.render.scene.remove(this.meshDraft);
    }

    add(parent) {
        parent.render.scene.add(this.meshRoad);
        parent.render.scene.add(this.meshDraft);
    }
};
