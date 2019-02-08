const THREE = require('three');
const Matrix4 = THREE.Matrix4;
const Sphere = THREE.Sphere;
const Ray = THREE.Ray;
const Vector3 = THREE.Vector3;
const Vector2 = THREE.Vector2;

THREE.Mesh.prototype.updateMorphTargets = function() {

    if(this.geometry.morphAttributes && this.geometry.morphAttributes.position && this.geometry.morphAttributes.position.length > 0) {
        this.morphTargetInfluences = new Float32Array(this.geometry.morphAttributes.position.length);
        this.morphTargetInfluences[0] = 1;
        this.animProgress = 0;
        if(this.currentAnimation === undefined)
            this.currentAnimation = null;
    }

};

THREE.Mesh.prototype.raycast = ( function () {

    var inverseMatrix = new Matrix4();
    var ray = new Ray();
    var sphere = new Sphere();

    var intersectionPoint = new Vector3();

    return function raycast( raycaster, intersects ) {

        var geometry = this.geometry;
        var material = this.material;
        var matrixWorld = this.matrixWorld;

        if ( material === undefined ) return;

        // Checking boundingSphere distance to ray

        if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

        sphere.copy( geometry.boundingSphere );
        sphere.applyMatrix4( matrixWorld );

        if ( raycaster.ray.intersectsSphere( sphere ) === false ) return;

        inverseMatrix.getInverse( matrixWorld );
        ray.copy( raycaster.ray ).applyMatrix4( inverseMatrix );

        // Check boundingBox before continuing

        if ( geometry.boundingBox !== null ) {
            const point = ray.intersectBox( geometry.boundingBox, intersectionPoint );
            if(point) {
                intersects.push( {
                    point: point,
                    object: this
                });
            }
           
        }
    };

}() );