const THREE = require('three');

THREE.Mesh.prototype.updateMorphTargets = function() {

    if(this.geometry.morphAttributes && this.geometry.morphAttributes.position && this.geometry.morphAttributes.position.length > 0) {
        this.morphTargetInfluences = new Float32Array(this.geometry.morphAttributes.position.length);
        this.morphTargetInfluences[0] = 1;
        this.animProgress = 0;
        if(this.currentAnimation === undefined)
            this.currentAnimation = null;
    }

};