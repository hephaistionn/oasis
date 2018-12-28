const THREE = require('three');

module.exports = class Path {

    constructor(path, sizeX, sizeY, originId, targetId, fullPath) {
        this.points = [];
        this.segmentsLength = [];
        this.angles = [];
        this.length = 0;
        this.originId = originId;
        this.targetId = targetId;
        if (fullPath) {
            this.computeFullPath(path, sizeX, sizeY);
        } else {
            this.compute(path, sizeX, sizeY);
        }
    }

    compute(path, sizeX, sizeY) {
        let l = path.length;
        const lm = l - 3;
        let i = 0;
        let length = 0;
        let point;
        for (i = 0; i < l; i += 3) {
            switch (i) {
                case 0:
                    point = new THREE.Vector3(
                        ((path[i] + path[i + 3]) / 2 + 0.5) * sizeX,
                        path[i + 1] * sizeY,
                        ((path[i + 2] + path[i + 5]) / 2 + 0.5) * sizeX
                    );
                    break;
                case lm:
                    point = new THREE.Vector3(
                        ((path[i - 3] * 0.25 + path[i] * 0.75) + 0.5) * sizeX,
                        path[i + 1] * sizeY,
                        ((path[i - 1] * 0.25 + path[i + 2] * 0.75) + 0.5) * sizeX
                    );
                    break;
                default:
                    point = new THREE.Vector3(
                        (path[i] + 0.5) * sizeX,
                        path[i + 1] * sizeY,
                        (path[i + 2] + 0.5) * sizeX
                    );
            }
            this.points.push(point);
            if (this.points[i / 3 - 1]) {
                length += this.points[i / 3 - 1].distanceTo(point);
                this.segmentsLength.push(length);
            }
        }

        l /= 3;
        l -= 1;
        for (i = 0; i < l; i++) {
            const pointA = this.points[i];
            const pointB = this.points[i + 1];
            const angle = Math.atan2(pointB.z - pointA.z, pointB.x - pointA.x);
            this.angles.push(angle);
        }
        this.length = length;
    }

    computeFullPath(path, sizeX, sizeY) {
        let l = path.length;
        const lm = l - 3;
        let i = 0;
        let length = 0;
        let point;
        for (i = 0; i < l; i += 3) {
            switch (i) {
                case 0:
                    point = new THREE.Vector3(
                        ((path[i] + path[i + 3]) / 2 + 0.5) * sizeX,
                        path[i + 1] * sizeY,
                        ((path[i + 2] + path[i + 5]) / 2 + 0.5) * sizeX
                    );
                    break;
                default:
                    point = new THREE.Vector3(
                        (path[i] + 0.5) * sizeX,
                        path[i + 1] * sizeY,
                        (path[i + 2] + 0.5) * sizeX
                    );
            }
            this.points.push(point);
            if (this.points[i / 3 - 1]) {
                length += this.points[i / 3 - 1].distanceTo(point);
                this.segmentsLength.push(length);
            }
        }
        l /= 3;
        l -= 1;
        for (i = 0; i < l; i++) {
            const pointA = this.points[i];
            const pointB = this.points[i + 1];
            const angle = Math.atan2(pointB.z - pointA.z, pointB.x - pointA.x);
            this.angles.push(angle);
        }
        this.length = length;
    }

    getPoint(distance) {
        let index = this.segmentsLength.findIndex(ele => {
            return ele >= distance;
        });

        if (index === -1) {
            index === this.points.length - 1;
            if (index === -1) {
                return null;
            }
        }

        const pointA = this.points[index];
        const pointB = this.points[index + 1];
        const angle = this.angles[index];

        const distanceB = this.segmentsLength[index];
        const distanceA = index === 0 ? 0 : this.segmentsLength[index - 1];
        const a = (distance - distanceA) / (distanceB - distanceA);
        const b = 1 - a;

        const x = pointB.x * a + pointA.x * b;
        const y = pointB.y * a + pointA.y * b;
        const z = pointB.z * a + pointA.z * b;

        return [x, y, z, angle];
    }

    getReversed() {
        const clone = new Path(this.points.slice().reverse());
        return clone;
    }

};