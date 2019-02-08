const THREE = require('three');
const materialDraft = require('./material/materialRoadSelected');
const materialMap = require('./material/materialMap');
const materialFoundation = require('./material/materialA');

module.exports = class Canal {

    constructor(model, parent) {
        this.tileSize = model.tileSize;
        this.nbPointX = model.ground.nbPointX;
        this.nbPointZ = model.ground.nbPointZ;
        this.nbTileX = this.nbPointX - 1;
        this.nbTileZ = this.nbPointZ - 1;
        this.tileHeight = model.ground.tileHeight;
        this.pointsHeights = model.ground.pointsHeights;
        this.pointsNormal = model.ground.pointsNormal;
        this.VERTEX_BY_TILE = 6;
        this.meshDraft = null;
        this.meshCanal = null;
        this.initDraftMesh(model);
        this.initFoundationMesh(model);
        this.inittMesh(model);
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
        this.meshDraft.name = model._id + 'Draft';
    }

    inittMesh(model) {
        this.MAX_TILES = model.ground.canalMax;
        this.MAX_VERTEX = this.MAX_TILES * 18;  //  deux des faces ne peut être visibles sinon vertex 30 vetices par faces
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.MAX_VERTEX * 3);
        const normal = new Float32Array(this.MAX_VERTEX * 3);
        const typeArray = new Float32Array(this.MAX_VERTEX * 1);
        geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.addAttribute('normal', new THREE.BufferAttribute(normal, 3));
        geometry.addAttribute('type', new THREE.BufferAttribute(typeArray, 1));
        geometry.setDrawRange(0, 3);
        this.meshCanal = new THREE.Mesh(geometry, materialMap);
        this.meshCanal.matrixAutoUpdate = false;
        this.meshCanal.frustumCulled = false;
        this.meshCanal.matrixWorldNeedsUpdate = false;
        this.meshCanal.receiveShadow = false;
        this.meshCanal.drawMode = THREE.TrianglesDrawMode;
        this.meshCanal.name = model._id;
    }

    initFoundationMesh(model) {
        this.meshFoundation = THREE.getMesh('obj/buildings/foundation_00.obj', materialFoundation, model._id);
        this.foundations = [];
    }

    updateCanal(model) {
        const gridCanal = model.ground.gridCanal;
        const l = gridCanal.length;
        let type = 0, x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4;
        let xi, zi, i;
        const geometry = this.meshCanal.geometry;
        const position = geometry.attributes.position.array;
        const normal = geometry.attributes.normal.array;
        let cntN = 0;
        let cntP = 0;
        const down = 0;
        for (xi = 0; xi < this.nbTileX; xi++) {
            for (zi = 0; zi < this.nbTileZ; zi++) {
                type = gridCanal[zi * this.nbTileX + xi];
                if (type !== 0) {
                    x1 = xi * this.tileSize;
                    z1 = zi * this.tileSize;
                    y1 = this.pointsHeights[zi * this.nbPointX + xi] * this.tileHeight;
                    x2 = xi * this.tileSize + this.tileSize;
                    z2 = zi * this.tileSize;
                    y2 = this.pointsHeights[zi * this.nbPointX + xi + 1] * this.tileHeight;
                    x3 = x2;
                    z3 = zi * this.tileSize + this.tileSize;
                    y3 = this.pointsHeights[(zi + 1) * this.nbPointX + xi + 1] * this.tileHeight;
                    x4 = x1;
                    z4 = z3;
                    y4 = this.pointsHeights[(zi + 1) * this.nbPointX + xi] * this.tileHeight;
                    switch (type) {
                        case 1:
                            bottomX0();
                            faceZ0();
                            break;
                        case 2:
                            bottomX0();
                            faceX0();
                            break;
                        case 3:
                            bottomX0();
                            break;
                        default:
                            bottomX0();
                            faceZ0();
                            faceX0();
                    }
                }
            }
        }
        geometry.setDrawRange(0, cntP / 3);
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.normal.needsUpdate = true;

        function faceZ0() {
            position[cntP++] = x1; position[cntP++] = y1; position[cntP++] = z1;
            normal[cntN++] = 0; normal[cntN++] = 1; normal[cntN++] = 1;
            position[cntP++] = x1; position[cntP++] = down; position[cntP++] = z2;
            normal[cntN++] = 0; normal[cntN++] = 1; normal[cntN++] = 1;
            position[cntP++] = x2; position[cntP++] = y2; position[cntP++] = z2;
            normal[cntN++] = 0; normal[cntN++] = 1; normal[cntN++] = 1;
            position[cntP++] = x2; position[cntP++] = y2; position[cntP++] = z2;
            normal[cntN++] = 0; normal[cntN++] = 1; normal[cntN++] = 1;
            position[cntP++] = x1; position[cntP++] = down; position[cntP++] = z1;
            normal[cntN++] = 0; normal[cntN++] = 1; normal[cntN++] = 1;
            position[cntP++] = x2; position[cntP++] = down; position[cntP++] = z2;
            normal[cntN++] = 0; normal[cntN++] = 1; normal[cntN++] = 1;
        }

        function faceX0() {
            position[cntP++] = x1; position[cntP++] = down; position[cntP++] = z1;
            normal[cntN++] = 1; normal[cntN++] = 1; normal[cntN++] = 0;
            position[cntP++] = x1; position[cntP++] = y1; position[cntP++] = z1;
            normal[cntN++] = 1; normal[cntN++] = 1; normal[cntN++] = 0;
            position[cntP++] = x4; position[cntP++] = y4; position[cntP++] = z4;
            normal[cntN++] = 1; normal[cntN++] = 1; normal[cntN++] = 0;
            position[cntP++] = x4; position[cntP++] = y4; position[cntP++] = z4;
            normal[cntN++] = 1; normal[cntN++] = 1; normal[cntN++] = 0;
            position[cntP++] = x4; position[cntP++] = down; position[cntP++] = z4;
            normal[cntN++] = 1; normal[cntN++] = 1; normal[cntN++] = 0;
            position[cntP++] = x1; position[cntP++] = down; position[cntP++] = z1;
            normal[cntN++] = 1; normal[cntN++] = 1; normal[cntN++] = 0;
        }

        function bottomX0() {
            position[cntP++] = x3; position[cntP++] = down; position[cntP++] = z3;
            normal[cntN++] = 0; normal[cntN++] = 1; normal[cntN++] = 0;
            position[cntP++] = x2; position[cntP++] = down; position[cntP++] = z2;
            normal[cntN++] = 0; normal[cntN++] = 1; normal[cntN++] = 0;
            position[cntP++] = x1; position[cntP++] = down; position[cntP++] = z1;
            normal[cntN++] = 0; normal[cntN++] = 1; normal[cntN++] = 0;
            position[cntP++] = x3; position[cntP++] = down; position[cntP++] = z3;
            normal[cntN++] = 0; normal[cntN++] = 1; normal[cntN++] = 0;
            position[cntP++] = x1; position[cntP++] = down; position[cntP++] = z1;
            normal[cntN++] = 0; normal[cntN++] = 1; normal[cntN++] = 0;
            position[cntP++] = x4; position[cntP++] = down; position[cntP++] = z4;
            normal[cntN++] = 0; normal[cntN++] = 1; normal[cntN++] = 0;
        }
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

    updateFoudation(model) {
        let matrixWorld;
        for (let i = 0, l = model.todo.length / 2; i < l; i++) {
          if (!this.foundations[i]) {
            this.foundations[i] = this.meshFoundation.clone();
            this.parent.add(this.foundations[i]);
          }
          matrixWorld = this.foundations[i].matrixWorld.elements;
          matrixWorld[12] = (model.todo[i * 2] + 0.5) * model.ground.tileSize;
          matrixWorld[14] = (model.todo[i * 2 + 1] + 0.5) * model.ground.tileSize;
          matrixWorld[13] = model.ground.getHeightTile(model.todo[i * 2], model.todo[i * 2 + 1]);
        }
        let toRemove = 0;
        for (let i = 0, l = this.foundations.length; i < l; i++) {
          if (model.todo[i * 2] === undefined) {
            this.parent.remove(this.foundations[i]);
            toRemove++;
          }
        }
        if (toRemove) {
          this.foundations.splice( this.foundations.length - toRemove, this.foundations.length);
        }
    }

    update(dt, model) {
        if (model.canalUpdated) {
            this.updateCanal(model);
            this.updateFoudation(model);
            model.canalUpdated = false;// mauvaise pratique
        }
        this.updateDraft(model);
    }

    remove(parent) {
        parent.remove(this.meshCanal);
        parent.remove(this.meshDraft);
        this.parent = null;
    }

    add(parent) {
        parent.add(this.meshCanal);
        parent.add(this.meshDraft);
        this.parent = parent;
    }
};
