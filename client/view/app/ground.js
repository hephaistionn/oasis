const THREE = require('three');
const materialGround = require('./material/materialMap');
//const materialGround = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe : true});
//const materialGround = new THREE.MeshPhongMaterial( { color: 0xffffff,  });

const materialWater = require('./material/materialWater');
const materialBorder = require('./material/materialBorder');
const materialA = require('./material/materialA');

class Ground {

    constructor(model, parent) {

        this.element = new THREE.Object3D();
        this.element.matrixAutoUpdate = false;
        this.element.frustumCulled = false;
        this.element.userData.id = model.id;
        this.element.name = 'map';

        this.tileSize = model.tileSize;
        this.tileHeight = model.tileHeight;
        this.nbPointX = model.nbPointX;
        this.nbPointZ = model.nbPointZ;
        this.tilesColor = model.tilesColor;

        this.initGridIndex = null;

        this.createGround(model);
        this.add(parent);
    }

    createGround(model) {
        this.materialGround = materialGround;
        this.materialBorder = materialBorder;
        this.materialWater = materialWater;
        this.chunkMesh = this.drawGroundMesh(model.nbTileX, model.nbTileZ, model);
        this.waterMesh = this.drawWaterMesh(model);
        this.borderMesh = this.drawBorderMesh(model);

        this.chunkMesh.receiveShadow = true;

        this.element.add(this.chunkMesh);
        this.element.add(this.waterMesh);
        this.element.add(this.borderMesh);

        this.clickableArea = this.drawClickableArea(model);

        this.initGridIndex = this.chunkMesh.geometry.index.array.slice(0);

    }

    drawClickableArea(model)  {
        const xSize = this.tileSize * (model.nbTileX+100);
        const zSize = this.tileSize * (model.nbTileZ+100);
        const geometry = new THREE.PlaneBufferGeometry(xSize, zSize);
        const mesh = new THREE.Mesh(geometry);
        geometry.translate(-40,6,-40);
        geometry.computeBoundingBox();
        mesh.matrixAutoUpdate = false;
        mesh.matrixWorldNeedsUpdate = false;
        mesh.receiveShadow = true;
        mesh.name = 'clickableArea';
        return [mesh];
    }

    drawWaterMesh(model) {
        const heightWater = 4;
        if (this.chunkMesh.geometry.boundingBox.min.y <= heightWater) {

            const sizeX = this.tileSize * model.nbTileX - 0.05;
            const sizeZ = this.tileSize * model.nbTileZ - 0.05;
            const sizeY = 6;

            const waterGeometry = new THREE.BufferGeometry();
            const vertices = new Float32Array([
                0, 0, 0, 0, 0, sizeZ, sizeX, 0, sizeZ,
                sizeX, 0, sizeZ, sizeX, 0, 0, 0, 0, 0,
                0, 0, sizeZ, 0, -sizeY, sizeZ, sizeX, -sizeY, sizeZ,
                sizeX, -sizeY, sizeZ, sizeX, 0, sizeZ, 0, 0, sizeZ,
                sizeX, 0, 0, sizeX, 0, sizeZ, sizeX, -sizeY, sizeZ,
                sizeX, -sizeY, sizeZ, sizeX, -sizeY, 0, sizeX, 0, 0
            ]);
            const lighting = new Float32Array([
                1, 1, 1, 1, 1, 1, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6
            ]);
            waterGeometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
            waterGeometry.addAttribute('lighting', new THREE.BufferAttribute(lighting, 1));

            const waterMesh = new THREE.Mesh(waterGeometry, this.materialWater);
            waterMesh.position.set(0, heightWater, 0);
            waterMesh.updateMatrix();
            waterMesh.updateMatrixWorld();
            waterMesh.matrixAutoUpdate = false;
            waterMesh.matrixWorldNeedsUpdate = false;
            waterMesh.name = 'water';
            return waterMesh;
        } else {
            const waterMesh = new THREE.Object3D();
            waterMesh.matrixAutoUpdate = false;
            waterMesh.name = 'water.';
            return waterMesh;
        }
    }

    drawGroundMesh(nbXTiles, nbZTiles, model) {
        const xSize = nbXTiles * this.tileSize;
        const zSize = nbZTiles * this.tileSize;

        const chunkGeometry = new THREE.PlaneBufferGeometry(xSize, zSize, nbXTiles, nbZTiles);
        const posArray = chunkGeometry.attributes.position.array;
        const length = chunkGeometry.attributes.position.count;
        //const normalArray = new Float32Array(length * 3);
        //const colorArray = new Float32Array(length * 3);
        const typeArray = new Float32Array(length * 1);

        for (let i = 0; i < length; i++) {
            let tileX = posArray[i * 3] / this.tileSize;
            let tileZ = posArray[i * 3 + 2] / this.tileSize;
            let index = tileZ * this.nbPointX + tileX;
            posArray[i * 3 + 1] = model.pointsHeights[index] * this.tileHeight;
            //colorArray[i * 3] = this.tilesColor[i * 4]/255;
            //colorArray[i * 3 + 1] = this.tilesColor[i * 4 + 1]/255;
            //colorArray[i * 3 + 2] = this.tilesColor[i * 4 + 2]/255;
            typeArray[i] = this.tilesColor[i * 4 + 1] / 255;
            //normalArray[i * 3] = model.pointsNormal[index * 3 + 0]/127;
            //normalArray[i * 3 + 1] = model.pointsNormal[index * 3 + 1]/127;
            //normalArray[i * 3 + 2] = model.pointsNormal[index * 3 + 2]/127;
        }

        chunkGeometry.computeVertexNormals();
        window.chunkGeometry = chunkGeometry;
        //chunkGeometry.addAttribute('normal', new THREE.BufferAttribute(normalArray, 3));
        //chunkGeometry.addAttribute('color', new THREE.BufferAttribute(colorArray, 3));
        chunkGeometry.addAttribute('type', new THREE.BufferAttribute(typeArray, 1));
        chunkGeometry.attributes.position.needsUpdate = true;



        /*let chunkGeometry = new THREE.PlaneGeometry(xSize, zSize, nbXTiles, nbZTiles);
        chunkGeometry.rotateX(-Math.PI / 2);
        chunkGeometry.translate(xSize / 2, 0, zSize / 2)
        const vertices = chunkGeometry.vertices;
        const length = vertices.length;
        for (let i = 0; i < length; i++) {
            let pointsHeights = model.pointsHeights[i];
            vertices[i].y = pointsHeights * this.tileHeight;
        }
        const modiferSimplify = new THREE.SimplifyModifier();
        chunkGeometry = modiferSimplify.modify(chunkGeometry, Math.round(chunkGeometry.vertices.length * 0.20));
        chunkGeometry.computeVertexNormals();*/

        chunkGeometry.computeBoundingBox();
        const chunkMesh = new THREE.Mesh(chunkGeometry, this.materialGround);
        //const chunkMesh = new THREE.Mesh(chunkGeometry, materialA);
        chunkMesh.matrixAutoUpdate = false;
        chunkMesh.matrixWorldNeedsUpdate = false;
        chunkMesh.receiveShadow = true;
        chunkMesh.name = 'ground';
        return chunkMesh;
    }

    drawBorderMesh(model) {
        if (!this.borderMesh) { //can be redrawn
            this.borderMesh = this.createBorderMesh(model);
        }

        const borderMesh = this.borderMesh;
        const nbX = model.nbPointX;
        const nbZ = model.nbPointZ;
        const nbXm = nbX - 1;
        const nbZm = nbZ - 1;
        const topLeft = new Float32Array(nbX * 3);
        const topRight = new Float32Array(nbZ * 3);
        const heightFactor = this.tileHeight;
        let i;

        //compute border left
        let offset = nbX * (nbZ - 1);
        for (i = 0; i < nbX; i++) {
            topLeft[i * 3] = i * this.tileSize;      //x
            topLeft[i * 3 + 1] = model.pointsHeights[offset + i] * heightFactor;  //y
            topLeft[i * 3 + 2] = nbZm * this.tileSize;  //z
        }
        //compute border right
        for (i = 0; i < nbZ; i++) {
            topRight[i * 3] = nbXm * this.tileSize;     //x
            topRight[i * 3 + 1] = model.pointsHeights[((nbZ - i) * nbX - 1)] * heightFactor;  //y
            topRight[i * 3 + 2] = (nbZm - i) * this.tileSize;  //z
        }

        let x, y, z;
        let pos = borderMesh.geometry.attributes.position.array;
        let col = borderMesh.geometry.attributes.color.array;
        let indice = borderMesh.geometry.index.array;

        //compute vertices
        for (i = 0; i < nbX; i++) {
            x = topLeft[i * 3];
            y = topLeft[i * 3 + 1];
            z = topLeft[i * 3 + 2];

            //compute column
            pos[i * 3] = x;
            pos[i * 3 + 1] = y;
            pos[i * 3 + 2] = z;
            col[i] = 0;

            pos[i * 3 + nbX * 3] = x;
            pos[i * 3 + nbX * 3 + 1] = y - 2;
            pos[i * 3 + nbX * 3 + 2] = z;
            col[i + nbX] = 1;


            pos[i * 3 + nbX * 6] = x;
            pos[i * 3 + nbX * 6 + 1] = -10;
            pos[i * 3 + nbX * 6 + 2] = z;
            col[i + nbX * 2] = 1;

        }

        const offsetX = 3 * (nbX) * 3;
        const offsetX1 = 3 * (nbX);

        for (i = 0; i < nbZ; i++) {
            x = topRight[i * 3];
            y = topRight[i * 3 + 1];
            z = topRight[i * 3 + 2];

            //compute column
            pos[offsetX + i * 3] = x;
            pos[offsetX + i * 3 + 1] = y;
            pos[offsetX + i * 3 + 2] = z;
            col[offsetX1 + i] = 0;


            pos[offsetX + i * 3 + nbX * 3] = x;
            pos[offsetX + i * 3 + nbX * 3 + 1] = y - 2;
            pos[offsetX + i * 3 + nbX * 3 + 2] = z;
            col[offsetX1 + i + nbX] = -1;


            pos[offsetX + i * 3 + nbX * 6] = x;
            pos[offsetX + i * 3 + nbX * 6 + 1] = -10;
            pos[offsetX + i * 3 + nbX * 6 + 2] = z;
            col[offsetX1 + i + nbX * 2] = -1;

        }

        //compute indice
        let ctn = 0;
        for (i = 0; i < nbX - 1; i++) {
            for (let j = 0; j < 2; j++) {
                indice[ctn++] = i + nbX * j;
                indice[ctn++] = i + nbX + nbX * j;
                indice[ctn++] = i + 1 + nbX * j;
                indice[ctn++] = i + nbX + nbX * j;
                indice[ctn++] = i + 1 + nbX + nbX * j;
                indice[ctn++] = i + 1 + nbX * j;
            }
        }

        const offsetIndex = (nbX) * 3;
        for (i = 0; i < nbZ - 1; i++) {
            for (let j = 0; j < 2; j++) {
                indice[ctn++] = offsetIndex + i + nbX * j;
                indice[ctn++] = offsetIndex + i + nbX + nbX * j;
                indice[ctn++] = offsetIndex + i + 1 + nbX * j;
                indice[ctn++] = offsetIndex + i + nbX + nbX * j;
                indice[ctn++] = offsetIndex + i + 1 + nbX + nbX * j;
                indice[ctn++] = offsetIndex + i + 1 + nbX * j;
            }
        }

        borderMesh.geometry.setDrawRange(0, ctn);
        borderMesh.geometry.attributes.position.needsUpdate = true;
        borderMesh.geometry.attributes.color.needsUpdate = true;
        borderMesh.geometry.index.needsUpdate = true;
        return borderMesh;
    }

    createBorderMesh(model) {
        const nbX = model.nbPointX;
        const nbZ = model.nbPointZ;
        const size = (nbX + nbZ) * 3; //3 level of vertices;

        const geometry = new THREE.BufferGeometry();

        geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(size * 3), 3));
        geometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(size), 1));
        geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(size * 4), 1));

        const mesh = new THREE.Mesh(geometry, this.materialBorder);

        mesh.matrixAutoUpdate = false;
        mesh.frustumCulled = false;
        mesh.matrixWorldNeedsUpdate = false;
        mesh.name = 'border';

        return mesh;
    }

    update(dt, model) {
        this.updateCanal(model);
    }

    updateCanal(model) {
        const geometry = this.chunkMesh.geometry;
        let updated = false;
        for (let i = 0, l = model.gridCanal.length; i < l; i++) {
            if (model.gridCanal[i] !== 0) {
                geometry.index.array[i * 6] = 0;
                geometry.index.array[i * 6 + 1] = 0;
                geometry.index.array[i * 6 + 2] = 0;
                geometry.index.array[i * 6 + 3] = 0;
                geometry.index.array[i * 6 + 4] = 0;
                geometry.index.array[i * 6 + 5] = 0;
                updated = true;
            } else {
                geometry.index.array[i * 6] = this.initGridIndex[i * 6];
                geometry.index.array[i * 6 + 1] = this.initGridIndex[i * 6 + 1];
                geometry.index.array[i * 6 + 2] = this.initGridIndex[i * 6 + 2];
                geometry.index.array[i * 6 + 3] = this.initGridIndex[i * 6 + 3];
                geometry.index.array[i * 6 + 4] = this.initGridIndex[i * 6 + 4];
                geometry.index.array[i * 6 + 5] = this.initGridIndex[i * 6 + 5];
            }
        }
        if (updated) {
            geometry.index.needsUpdate = true;
        }

    }

    remove() {
        this.element.parent.remove(this.element);
    }

    add(parent) {
        parent.add(this.element);
    }
}

module.exports = Ground;
