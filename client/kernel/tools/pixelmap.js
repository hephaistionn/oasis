class PixelMap {

    constructor() {
        this.tileSize = 0;
        this.heightMax = 4;
    }

    async compute(url, ENTITIES) {
        const image = await this.loadImage(url);
        let canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        let context = canvas.getContext('2d');
        context.width = image.width;
        context.height = image.height;
        context.drawImage(image, 0, 0);
        const dataMap = this.getDataMap(context);
        dataMap.canvas = canvas;
        dataMap.codeToEntities = this.syncCodeEntity(ENTITIES);
        return dataMap;
    }

    loadImage(url, cb) {
        return new Promise((resolve) => {
            let image = new Image();
            image.onload = function () {
                resolve(this)
            };
            image.src = url;
        })
    }

    getDataMap(context) {
        const image = context.getImageData(0, 0, context.width, context.height);
        const imageData = image.data;
        const size = context.height * context.width;
        const data = {};
        data.nbPointZ = context.height;
        data.nbPointX = context.width;
        data.nbTileZ = context.height - 1;
        data.nbTileX = context.width - 1;
        const dataHeights = new Uint8Array(size);
        const dataResources = new Uint8Array(size);
        let index = 0;
        for (let i = 0; i < size; i++) {
            index = i * 4;
            dataHeights[i] = Math.max(imageData[index + 3] - 200, 0); //min 0 max
            dataResources[i] = imageData[index] > 240 ? imageData[index] : 0;
        }
        this.extrapolation(imageData, data.nbPointX, data.nbPointZ);
        //this.addGrid(imageData, data.nbPointX, data.nbPointZ);

        data.nbTiles = data.nbTileX * data.nbTileZ;
        data.pointsHeights = dataHeights;
        data.tilesResource = this.pixelByTile(dataResources, data.nbTileX, data.nbTileZ, data.nbPointX);
        data.tilesColor = imageData;
        data.pointsNormal = this.computeNormals(dataHeights, data.nbPointX, data.nbPointZ);
        data.tilesHeight = this.averageByTile(dataHeights, data.nbTileX, data.nbTileZ, data.nbPointX);
        data.tilesTilt = this.rangeByTile(dataHeights, data.nbTileX, data.nbTileZ, data.nbPointX);
        data.spawns = this.getSpawns(dataResources, data.nbTileX, data.nbTileZ);
        context.putImageData(image, 0, 0);
        data.tileSize = 4;
        data.tileHeight = 0.36;
        return data;
    }

    addGrid(dataColor, sizeX, sizeZ) {
        for (let x = 0; x < sizeX; x++) {
            for (let z = 0; z < sizeZ; z++) {
                const i = (z * sizeX + x) * 4;
                if (x % 2 === 1 && z % 2 === 0 || x % 2 === 0 && z % 2 === 1) {
                    dataColor[i] = dataColor[i] * 0.85;
                    dataColor[i + 1] = dataColor[i + 1] * 0.85;
                    dataColor[i + 2] = dataColor[i + 2] * 0.85;
                }
            }
        }
    }

    extrapolation(dataColor, sizeX, sizeZ) {
        function average(x, z, data) {
            let cnt = 0;
            let RSum = 0;
            let GSum = 0;
            let BSum = 0;
            for (let dx = -1; dx < 2; dx++) {
                for (let dz = -1; dz < 2; dz++) {
                    const xt = x + dx;
                    const zt = z + dz;
                    if (xt > -1 && xt < sizeX && zt > -1 && zt < sizeZ && (dx != 0 || dz != 0)) {
                        const i = (zt * sizeX + xt) * 4;
                        const red = data[i];
                        if (red <= 240) {
                            cnt++;
                            const green = data[i + 1];
                            const blue = data[i + 2];
                            RSum += red;
                            GSum += green;
                            BSum += blue;
                        }
                    }
                }
            }
            const i = (z * sizeX + x) * 4;
            data[i] = cnt === 0 ? 0 : RSum / cnt;
            data[i + 1] = cnt === 0 ? 163 : GSum / cnt;
            data[i + 2] = cnt === 0 ? 70 : BSum / cnt;
        }

        for (let x = 0; x < sizeX; x++) {
            for (let z = 0; z < sizeZ; z++) {
                const i = (z * sizeX + x) * 4;
                if (dataColor[i] > 240) {
                    average(x, z, dataColor);
                }
                dataColor[i + 3] = 255;
            }
        }
    }

    rangeByTile(points, nbTileX, nbTileZ, nbPointX) {

        const tilts = new Uint8Array(nbTileX * nbTileZ);
        for (let x = 0; x < nbTileX; x++) {
            for (let z = 0; z < nbTileZ; z++) {
                let index1 = z * nbPointX + x;
                let index2 = z * nbPointX + (x + 1);
                let index3 = (z + 1) * nbPointX + x;
                let index4 = (z + 1) * nbPointX + (x + 1);

                let indexTile = z * nbTileX + x;

                let v1 = points[index1];
                let v2 = points[index2];
                let v3 = points[index3];
                let v4 = points[index4];

                tilts[indexTile] = Math.max(v1, v2, v3, v4) - Math.min(v1, v2, v3, v4);
            }
        }

        return tilts;
    }

    averageByTile(points, nbTileX, nbTileZ, nbPointX) {

        const tiles = new Uint8Array(nbTileX * nbTileZ);

        for (let x = 0; x < nbTileX; x++) {
            for (let z = 0; z < nbTileZ; z++) {
                let index1 = z * nbPointX + x;
                let index2 = z * nbPointX + (x + 1);
                let index3 = (z + 1) * nbPointX + x;
                let index4 = (z + 1) * nbPointX + (x + 1);

                let indexTile = z * nbTileX + x;

                let v1 = points[index1];
                let v2 = points[index2];
                let v3 = points[index3];
                let v4 = points[index4];

                tiles[indexTile] = (v1 + v2 + v3 + v4) / 4;
            }
        }

        return tiles;
    }

    pixelByTile(points, nbTileX, nbTileZ, nbPointX) {
        const tiles = new Uint8Array(nbTileX * nbTileZ);
        for (let x = 0; x < nbTileX; x++) {
            for (let z = 0; z < nbTileZ; z++) {
                let index = (z * nbPointX + x);
                let indexTile = z * nbTileX + x;
                tiles[indexTile] = points[index];
            }
        }
        return tiles;
    }

    getSpawns(redColor, nbTileX, nbTileZ) {
        const spwans = [];
        for (let x = 0; x < nbTileX; x++) {
            for (let z = 0; z < nbTileZ; z++) {
                let indexTile = z * nbTileX + x;
                if (redColor[indexTile] === 242 || redColor[indexTile] === 241) {
                    spwans.push([x, z]);
                }
            }
        }
        return spwans;
    }

    syncCodeEntity(ENTITIES) { //pixel rgb in PNG depend of alpha. value is not exact
        const codeToEntities = new Map();
        for (let id in ENTITIES) {
            if (ENTITIES[id].code) {
                codeToEntities.set(ENTITIES[id].code, id);
                codeToEntities.set(ENTITIES[id].code - 1, id);
            }
        }
        return codeToEntities;
    }

    computeNormals(dataHeights, nbPointX, nbPointZ) {
        const points = new Int8Array(nbPointX * nbPointZ * 3);
        let i = 0, length;


        const Ax = 0, Az = 0, Bx = 0, Bz = -4, Cx = -4, Cz = 0, Dx = 0, Dz = 4, Ex = 4, Ez = 0; 
        let Ay, By, Cy, Dy, Ey;
        let v1x, v1y, v1z, v2x, v2y, v2z, v3x, v3y, v3z, v4x, v4y, v4z;
        let nor1x, nor1y, nor1z, nor2x, nor2y, nor2z; 
        let dx, dy, dz;

        const ajust = 0.36;
        //const ajust = 0.28;

        for(let z = 0; z < nbPointZ; z++) {
            for(let x = 0; x < nbPointX; x++) {
                 Ay = dataHeights[z * nbPointX + x] * ajust;
                 By = z - 1 < 0 ? Ay : dataHeights[(z - 1) * nbPointX + x] * ajust ;
                 Cy = x - 1 < 0 ? Ay : dataHeights[z * nbPointX + (x - 1)] * ajust;
                 Dy = z + 1 > nbPointZ - 1 ? Ay : dataHeights[(z + 1) * nbPointX + x] * ajust;
                 Ey = x + 1 > nbPointX - 1 ? Ay : dataHeights[z * nbPointX + (x + 1)] * ajust;

                 v1x = Bx - Ax;
                 v1y = By - Ay;
                 v1z = Bz - Az;
                 v2x = Cx - Ax;
                 v2y = Cy - Ay;
                 v2z = Cz - Az;
                 v3x = Dx - Ax;
                 v3y = Dy - Ay;
                 v3z = Dz - Az;
                 v4x = Ex - Ax;
                 v4y = Ey - Ay;
                 v4z = Ez - Az;
                 nor1x = v1y * v2z - v1z * v2y;
                 nor1y = v1z * v2x - v1x * v2z;
                 nor1z = v1x * v2y - v1y * v2x;
                 nor2x = v3y * v4z - v3z * v4y;
                 nor2y = v3z * v4x - v3x * v4z;
                 nor2z = v3x * v4y - v3y * v4x;
                dx = nor1x + nor2x;
                dy = nor1y + nor2y;
                dz = nor1z + nor2z;
                length = Math.sqrt(dx * dx + dz * dz + dy * dy);
                points[i++] = Math.floor(127 * dx / length);
                points[i++] = Math.floor(127 * dy / length);
                points[i++] = Math.floor(127 * dz / length);
            }
        }
        return points;
    }
};


module.exports = new PixelMap();
