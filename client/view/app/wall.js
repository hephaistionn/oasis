const THREE = require('three');
const materialFoundation = require('./material/materialA');
const materialDraft = require('./material/materialSelect');

module.exports = class Wall {

    constructor(model, parent) {
        this.tileSize = model.tileSize;
        this.nbPointX = model.ground.nbPointX;
        this.nbPointZ = model.ground.nbPointZ;
        this.nbTileX = this.nbPointX - 1;
        this.nbTileZ = this.nbPointZ - 1;
        this.initDraftMesh(model);
        this.initFoundationMesh(model);
        this.add(parent);
    }

    initDraftMesh(model) {
        this.materialDraftOk = materialDraft;
        this.materialDraftKo = materialDraft.clone();
        this.materialDraftKo.color.setHex(0xff0000);

        this.meshWallA = THREE.getMesh('obj/buildings/wallA_00.obj', materialDraft);
        this.meshWallB = THREE.getMesh('obj/buildings/wallB_00.obj', materialDraft);
        this.meshWallC = THREE.getMesh('obj/buildings/wallC_00.obj', materialDraft);
        this.meshWallD = THREE.getMesh('obj/buildings/wallD_00.obj', materialDraft);
        this.drafts = [];
    }

    initFoundationMesh(model) {
        this.meshFoundation = THREE.getMesh('obj/buildings/repository_00.obj', materialFoundation, model._id);
        this.foundations = [];
    }

    updateDraft(model) {
        const tiles = model.draftWall.tiles;
        const length = model.draftWall.length;
        const valid = model.draftWall.valid;

        let matrixWorld;
        for (let i = 0, l = length; i < l; i++) {
            if (!this.drafts[i]) {
                this.drafts[i] = this.meshWallA.clone();
                if (!valid[i]) {
                    this.drafts[i].material = this.materialDraftKo;
                }
                this.parent.render.scene.add(this.drafts[i]);
            }
            matrixWorld = this.drafts[i].matrixWorld.elements;
            matrixWorld[12] = (tiles[i * 2] + 0.5) * model.ground.tileSize;
            matrixWorld[14] = (tiles[i * 2 + 1] + 0.5) * model.ground.tileSize;
            matrixWorld[13] = model.ground.getHeightTile(tiles[i * 2], tiles[i * 2 + 1]);
        }
        let toRemove = 0;
        for (let i = length, l = this.drafts.length; i < l; i++) {
            this.parent.render.scene.remove(this.drafts[i]);
            toRemove++;
        }
        if (toRemove) {
            this.drafts.splice(this.drafts.length - toRemove, this.drafts.length);
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
