const THREE = require('three');
const material = require('./material/materialA');
const materialDraft = require('./material/materialSelect');

module.exports = class Wall {

    constructor(model, parent) {
        this.tileSize = model.tileSize;
        this.nbPointX = model.ground.nbPointX;
        this.nbPointZ = model.ground.nbPointZ;
        this.nbTileX = this.nbPointX - 1;
        this.nbTileZ = this.nbPointZ - 1;
        this.tileHeight = model.ground.tileHeight;
        this.initDraftMesh(model);
        this.initFoundationMesh(model);
        this.add(parent);
    }

    initDraftMesh(model) {
        this.materialDraftOk = materialDraft;
        this.materialDraftKo = materialDraft.clone();
        this.materialDraftKo.uniforms.color.value.setHex(0xff0000);
        this.meshWallDraft = [];
        this.meshWallDraft.push(THREE.getMesh('obj/buildings/wallA_00.obj', materialDraft));
        this.meshWallDraft.push(THREE.getMesh('obj/buildings/wallB_00.obj', materialDraft));
        this.meshWallDraft.push(THREE.getMesh('obj/buildings/wallC_00.obj', materialDraft));
        this.meshWallDraft.push(THREE.getMesh('obj/buildings/wallD_00.obj', materialDraft));
        this.drafts = [];
    }

    initFoundationMesh(model) {
        this.meshFoundation = THREE.getMesh('obj/buildings/foundation_00.obj', material, model._id);
        this.foundations = [];
    }

    updateDraft(model) {
        const tiles = model.draftWall.tiles;
        const length = model.draftWall.length;
        const valid = model.draftWall.valid;
        const shape = model.draftWall.shape;

        for (let i = 0, l = this.drafts.length; i < l; i++) {
            this.parent.render.scene.remove(this.drafts[i]);
        }
        this.drafts.splice(0, this.drafts.length);

        let matrixWorld;
        let angle = 0;
        for (let i = 0; i < length; i++) {
            if (!this.drafts[i]) {
                this.drafts[i] = this.meshWallDraft[shape[i * 2]].clone();
                if (!valid[i]) {
                    this.drafts[i].material = this.materialDraftKo;
                }
                this.parent.render.scene.add(this.drafts[i]);
            }
            matrixWorld = this.drafts[i].matrixWorld.elements;
            matrixWorld[12] = (tiles[i * 2] + 0.5) * model.ground.tileSize;
            matrixWorld[14] = (tiles[i * 2 + 1] + 0.5) * model.ground.tileSize;
            matrixWorld[13] = model.ground.getHeightTile(tiles[i * 2], tiles[i * 2 + 1]);
            angle = shape[i * 2 + 1] * Math.PI / 2;
            matrixWorld[0] = Math.cos(angle);
            matrixWorld[2] = Math.sin(angle);
            matrixWorld[8] = -matrixWorld[2];
            matrixWorld[10] = matrixWorld[0];
        }
    }

    updateFoudation(model) {
        let matrixWorld;
        for (let i = 0, l = model.todo.length / 2; i < l; i++) {
            if (!this.foundations[i]) {
                this.foundations[i] = this.meshFoundation.clone();
                this.parent.render.scene.add(this.foundations[i]);
            }
            matrixWorld = this.foundations[i].matrixWorld.elements;
            matrixWorld[12] = (model.todo[i * 2] + 0.5) * model.ground.tileSize;
            matrixWorld[14] = (model.todo[i * 2 + 1] + 0.5) * model.ground.tileSize;
            matrixWorld[13] = model.ground.getHeightTile(model.todo[i * 2], model.todo[i * 2 + 1]);
        }
        let toRemove = 0;
        for (let i = 0, l = this.foundations.length; i < l; i++) {
            if (model.todo[i * 2] === undefined) {
                this.parent.render.scene.remove(this.foundations[i]);
                toRemove++;
            }
        }
        if (toRemove) {
            this.foundations.splice(this.foundations.length - toRemove, this.foundations.length);
        }
    }

    update(dt, model) {
        if (!model.drafted) {
            this.updateFoudation(model);
        }
        this.updateDraft(model);
    }

    remove(parent) {
        this.parent = null;
    }

    add(parent) {
        this.parent = parent;
    }
};
