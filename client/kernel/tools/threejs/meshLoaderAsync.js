const THREE = require('three');

const cacheGeo = new Map();
const requested = new Map();
const defaultGeo = new THREE.PlaneBufferGeometry(1, 1);

function computeGeo(buffers, indexUV) {

    const geometry = new THREE.BufferGeometry();
    const verticesGroup = buffers.verticesGroup;

    if(verticesGroup.length > 1) { //morph geometry
        geometry.morphAttributes.position = [];
        for(let i = 0; i < verticesGroup.length; i++) {
            geometry.morphAttributes.position.push(verticesGroup[i]);
        }
        // les elements animés sont trop petits;
        geometry.boundingSphere = new THREE.Sphere();
        geometry.boundingSphere.radius = 2;
    }
    const positionBuffer = verticesGroup[0];
    geometry.addAttribute('position', positionBuffer);
    geometry.computeBoundingBox();

    if(indexUV !== 0) {
        const uvBuffer = buffers.uvsGroup[indexUV];
        geometry.addAttribute('uv', uvBuffer);
    } else if(buffers.uvsGroup.length > 1) {
        const uvBuffer = buffers.uvsGroup[0];
        geometry.addAttribute('uv', uvBuffer);
        // pour les lightmaps et normalmaps
        const uvBuffer2 = buffers.uvsGroup[1];
        geometry.addAttribute('uv2', uvBuffer2);
    } else {
        const uvBuffer = buffers.uvsGroup[indexUV];
        geometry.addAttribute('uv', uvBuffer);
    }

    const normalBuffer = buffers.normalsGroup[0];
    geometry.addAttribute('normal', normalBuffer);

    const indexBuffer = buffers.index;
    geometry.setIndex(indexBuffer);

    return geometry;
}

THREE.getMesh = function getMesh(url, material, name, indexUV) {

    indexUV = indexUV || 0;
    const _id = url + indexUV;
    if(cacheGeo.has(_id)) {
        const mesh = new THREE.Mesh(cacheGeo.get(_id), material);
        mesh.matrixAutoUpdate = false;
        mesh.frustumCulled = false;
        mesh.castShadow = true;
        mesh.name = name;
        return mesh;
    } else {
        const mesh = new THREE.Mesh(defaultGeo, material);
        mesh.matrixAutoUpdate = false;
        mesh.frustumCulled = false;
        mesh.castShadow = true;
        mesh.name = name;
        if(!requested.has(url)){
            requested.set(url,[]);
            THREE.loadBuffers(url, buffers => {
                cacheGeo.set(_id, computeGeo(buffers, indexUV));
                const meshes = requested.get(url);
                for(let k=0, l=meshes.length; k<l; k++){
                    meshes[k].geometry = cacheGeo.get(_id);
                    meshes[k].updateMorphTargets();
                }
                requested.delete(url);
            });
        }

        requested.get(url).push(mesh);

        return mesh;
    }

};
