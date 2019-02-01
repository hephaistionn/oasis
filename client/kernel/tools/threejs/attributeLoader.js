const THREE = require('three');

THREE.AttributeLoader = function(manager) {
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
    this.material = null;
};

THREE.AttributeLoader.prototype = {

    constructor: THREE.AttributeLoader,

    load: function(urlOfFile, onLoad, onProgress, onError) {

        const scope = this;

        //if is not a file
        if(urlOfFile.length < 200) {
            var loader = new THREE.FileLoader(scope.manager);
            loader.setPath(this.path);
            loader.load(urlOfFile, function(text) {
                onLoad(scope.parse(text));

            }, onProgress, onError);
        } else {
            onLoad(scope.parse(urlOfFile));
        }
    },

    parse: function(text) {
        let currentGroup = null;
        const verticesGroup = [];
        const faces = [];
        const uvsGroup = [];
        const normalsGroup = [];

        let vertices;
        let uvs;

        function parseVertexIndex(value) {

            return parseInt(value) - 1;

        }

        function parseUVIndex(value) {

            return parseInt(value) - 1;

        }

        function parseNormalIndex(value) {
            return parseInt(value) - 1;
        }

        var MAX_INDEX = 1000;
        var MAX_INDEX2 = 10000000;
        const verticesGroup2 = [];
        const uvsGroup2 = [];
        const normalsGroup2 = [];
        var index = [];
        var haveUV = false;
        var haveNormal = false;
        let i;
        //const indexPair = new Uint16Array(MAX_INDEX);
        const indexPair = [];
        //fix for mobile browser
        let cnt = 0;
        let currentIndex = 0;

        function newIndex(index, vertexIndex, uvIndex, normalIndex) {
            let vertices1;
            let vertices2;
            let normals1;
            let normals2;
            let uvs1;
            let uvs2;

            for(i = 0; i < verticesGroup.length; i++) {
                if(!verticesGroup2[i]) {
                    verticesGroup2.push([]);
                }
            }
            for(i = 0; i < uvsGroup.length; i++) {
                if(!uvsGroup2[i]) {
                    uvsGroup2.push([]);
                }
            }
            for(i = 0; i < normalsGroup.length; i++) {
                if(!normalsGroup2[i]) {
                    normalsGroup2.push([]);
                }
            }

            let l = verticesGroup.length;
            for(i = 0; i < l; i++) {
                vertices1 = verticesGroup[i];
                vertices2 = verticesGroup2[i];
                vertices2[index * 3] = vertices1[vertexIndex * 3];
                vertices2[index * 3 + 1] = vertices1[vertexIndex * 3 + 1];
                vertices2[index * 3 + 2] = vertices1[vertexIndex * 3 + 2];
            }

            l = uvsGroup.length;
            for(i = 0; i < l; i++) {
                uvs1 = uvsGroup[i];
                uvs2 = uvsGroup2[i];
                uvs2[index * 2] = uvs1[uvIndex * 2];
                uvs2[index * 2 + 1] = uvs1[uvIndex * 2 + 1];
            }

            l = normalsGroup.length;
            normalIndex = normalIndex  ===  undefined ?  vertexIndex : normalIndex;
            for(i = 0; i < l; i++) {
                normals1 = normalsGroup[i];
                normals2 = normalsGroup2[i];
                normals2[index * 3] = normals1[normalIndex * 3];
                normals2[index * 3 + 1] = normals1[normalIndex * 3 + 1];
                normals2[index * 3 + 2] = normals1[normalIndex * 3 + 2];
            }

        }

        function addFace(a, b, c, d, ua, ub, uc, ud, na, nb, nc, nd) {
            var ia, ib, ic, id, ie, ig, ih, ii, ij;
            if(ua !== undefined && na !==undefined) {
                haveUV = true;
                haveNormal = true;
                ia = parseVertexIndex(a);
                ib = parseVertexIndex(b);
                ic = parseVertexIndex(c);

                id = parseUVIndex(ua);
                ie = parseUVIndex(ub);
                ig = parseUVIndex(uc);

                ih = parseNormalIndex(na);
                ii = parseNormalIndex(nb);
                ij = parseNormalIndex(nc);

                faces.push(ia);
                faces.push(id);
                faces.push(ih);
                faces.push(ib);
                faces.push(ie);
                faces.push(ii);
                faces.push(ic);
                faces.push(ig);
                faces.push(ij);
            } else if(ua !== undefined) {
                haveUV = true;
                ia = parseVertexIndex(a);
                ib = parseVertexIndex(b);
                ic = parseVertexIndex(c);

                id = parseUVIndex(ua);
                ie = parseUVIndex(ub);
                ig = parseUVIndex(uc);

                faces.push(ia);
                faces.push(id);
                faces.push(ib);
                faces.push(ie);
                faces.push(ic);
                faces.push(ig);
            } else {
                ia = parseVertexIndex(a);
                ib = parseVertexIndex(b);
                ic = parseVertexIndex(c);
                faces.push(ia);
                faces.push(ib);
                faces.push(ic);
            }
        }

        function computeIndex(indexVertex, indexUv, indexNormal) {

            let i, uniqueID;

            if(indexUv !== undefined && indexNormal !== undefined) {
                uniqueID = indexVertex * MAX_INDEX + (indexUv + 1) + indexNormal * MAX_INDEX2 ;
                i = indexPair.indexOf(uniqueID);
                if(i === -1) {
                    currentIndex = cnt;
                    indexPair[cnt++] = uniqueID;
                    newIndex(currentIndex, indexVertex, indexUv, indexNormal);
                } else {
                    currentIndex = i
                }
                index.push(currentIndex);

            }else if(indexUv !== undefined) {
                uniqueID = indexVertex * MAX_INDEX + indexUv + 1;
                i = indexPair.indexOf(uniqueID);
                if(i === -1) {
                    currentIndex = cnt;
                    indexPair[cnt++] = uniqueID;
                    newIndex(currentIndex, indexVertex, indexUv);
                } else {
                    currentIndex = i
                }
                index.push(currentIndex);

            } else {

                i = indexPair.indexOf(indexVertex);
                if(i === -1) {
                    currentIndex = cnt;
                    indexPair[cnt++] = indexVertex;
                    newIndex(currentIndex, indexVertex);
                } else {
                    currentIndex = i
                }
                index.push(currentIndex);
            }

        }

        function computeVertexNormals() {

            var positions = verticesGroup[0];
            var normals = normalsGroup[0] = new Float32Array(positions.length);

            var inc = haveUV ? 6 : 3;
            var l = faces.length;
            var k;

            var iA, iB, iC;
            var pAx, pAy, pAz, pBx, pBy, pBz, pCx, pCy, pCz;
            var vAx, vAy, vAz, vBx, vBy, vBz;
            var nAx, nAy, nAz;

            for(k = 0; k < l; k += inc) {
                iA = faces[k + 0] * 3;
                iB = faces[k + 2] * 3;
                iC = faces[k + 4] * 3;

                pAx = positions[iA];
                pAy = positions[iA + 1];
                pAz = positions[iA + 2];
                pBx = positions[iB];
                pBy = positions[iB + 1];
                pBz = positions[iB + 2];
                pCx = positions[iC];
                pCy = positions[iC + 1];
                pCz = positions[iC + 2];

                vAx = pCx - pBx;
                vAy = pCy - pBy;
                vAz = pCz - pBz;
                vBx = pAx - pBx;
                vBy = pAy - pBy;
                vBz = pAz - pBz;

                nAx = vAy * vBz - vAz * vBy;
                nAy = vAz * vBx - vAx * vBz;
                nAz = vAx * vBy - vAy * vBx;

                normals[iA] += nAx;
                normals[iA + 1] += nAy;
                normals[iA + 2] += nAz;

                normals[iB] += nAx;
                normals[iB + 1] += nAy;
                normals[iB + 2] += nAz;

                normals[iC] += nAx;
                normals[iC + 1] += nAy;
                normals[iC + 2] += nAz;

            }

            l = normals.length;
            for(k = 0; k < l; k += 3) {
                nAx = normals[k];
                nAy = normals[k + 1];
                nAz = normals[k + 2];
                const length = Math.sqrt(nAx * nAx + nAy * nAy + nAz * nAz);
                normals[k] = nAx / length;
                normals[k + 1] = nAy / length;
                normals[k + 2] = nAz / length;
            }

        }


        // v float float float
        var vertex_pattern = /^v\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/;

        // vt float float
        var uv_pattern = /^vt\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/;

        // vn float float float
		var normal_pattern = /vn( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;

        // f vertex vertex vertex ...
        var face_pattern1 = /^f\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)(?:\s+(-?\d+))?/;

        // f vertex/uv vertex/uv vertex/uv ...
        var face_pattern2 = /^f\s+((-?\d+)\/(-?\d+))\s+((-?\d+)\/(-?\d+))\s+((-?\d+)\/(-?\d+))(?:\s+((-?\d+)\/(-?\d+)))?/;

        // f vertex/uv/normal vertex/uv/normal vertex/uv/normal ...
		var face_pattern3 = /f( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))?/;

        var lines = text.split('\n');

        for(i = 0; i < lines.length; i++) {

            var line = lines[i];
            line = line.trim();

            var result;

            if(line.length === 0 || line.charAt(0) === '#') {

                currentGroup = null;
                continue;

            } else if(( result = vertex_pattern.exec(line) ) !== null) {

                if(currentGroup !== 0) {
                    vertices = verticesGroup[verticesGroup.length] = [];
                    currentGroup = 0;
                }

                vertices.push(
                    parseFloat(result[1]),
                    parseFloat(result[2]),
                    parseFloat(result[3])
                );

            } else if(( result = uv_pattern.exec(line) ) !== null) {

                if(currentGroup !== 1) {
                    uvs = uvsGroup[uvsGroup.length] = [];
                    currentGroup = 1;
                }
                uvs.push(
                    parseFloat(result[1]),
                    parseFloat(result[2])
                );
            } else if(( result = normal_pattern.exec(line) ) !== null) {
                if(currentGroup !== 2) {
                    normals = normalsGroup[normalsGroup.length] = [];
                    currentGroup = 2;
                }
                normals.push(
                    parseFloat(result[1]),
                    parseFloat(result[2]),
                    parseFloat(result[3])
                );
            } else if(( result = face_pattern1.exec(line) ) !== null) {
                addFace(
                    result[1], result[2], result[3], result[4]
                );
            } else if(( result = face_pattern2.exec(line) ) !== null) {
                addFace(
                    result[2], result[5], result[8], result[11],
                    result[3], result[6], result[9], result[12]
                );
            } else if(( result = face_pattern3.exec(line) ) !== null) {
                addFace(
                    result[2], result[6], result[10], result[14],
                    result[3], result[7], result[11], result[15],
                    result[4], result[8], result[12], result[16]
                );
            } else {

                throw new Error("Unexpected line: " + line);

            }

        }
        let l = faces.length;

        if(!haveNormal) {
            computeVertexNormals();
        }

        let k;

        if(haveUV && haveNormal) {
            for(k = 0; k < l; k += 3) {
                computeIndex(faces[k], faces[k + 1], faces[k + 2]);
            }
        } else if(haveUV) {
            for(k = 0; k < l; k += 2) {
                computeIndex(faces[k], faces[k + 1]);
            }
        } else {
            for(k = 0; k < l; k++) {
                computeIndex(faces[k]);
            }
        }
        return {
            verticesGroup: verticesGroup2.map(vertices => new THREE.BufferAttribute(new Float32Array(vertices), 3)),
            uvsGroup: uvsGroup2.map(uvs => new THREE.BufferAttribute(new Float32Array(uvs), 2)),
            normalsGroup: normalsGroup2.map(normals => new THREE.BufferAttribute(new Float32Array(normals), 3)),
            index: new THREE.BufferAttribute(new Uint32Array(index), 1)
        };
    }
};


const manager = new THREE.LoadingManager();
manager.onProgress = function(item, loaded, total) {
    // console.log(item, loaded, total);
};
const loader = new THREE.AttributeLoader(manager);

const cacheBuffer = {};

THREE.loadBuffers = function(url, cb) {
    if(!cacheBuffer[url]) {
        loader.load(url, function(buffers) {
            cacheBuffer[url] = buffers;
            cb(cacheBuffer[url]);
        });
    } else {
        cb(cacheBuffer[url]);
    }
};

