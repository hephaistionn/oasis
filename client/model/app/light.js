const Entity = require('../../kernel/model/entity');

module.exports = class Light extends Entity {

    constructor(config) {
        super(config);
        this._id = 0;
        this.directionalColor = 0xffffff;
        this.targetX = config.targetX || 0;
        this.targetY = config.targetY || 0;
        this.targetZ = config.targetZ || 0;
        this.offsetX = this.ax - this.targetX
        this.offsetY = this.ay - this.targetY
        this.offsetZ = this.az - this.targetZ
        this.zoom = 1 || config.zoom;
        this.shadow = config.shadow || false;
    }

    move(x, y, z) {
        this.ax = x;
        this.ay = y;
        this.az = z;
        this.targetX = this.offsetX + this.ax;
        this.targetZ = this.offsetZ + this.az;
        this.updated = true;
    }

    scale(value) {
        this.zoom = value;
        this.updated = true;
    }

    moveTarget(x, y, z) {
        this.targetX = x;
        this.targetY = y;
        this.targetZ = z;
        this.ax = this.targetX - this.offsetX;
        this.ay = this.targetY - this.offsetY;
        this.az = this.targetZ - this.offsetZ;
        this.updated = true;
    }

    scaleOffset(factor) {
        factor = -factor;
        let length = Math.sqrt(this.offsetX * this.offsetX + this.offsetY * this.offsetY + this.offsetZ * this.offsetZ);
        this.offsetX /= length;
        this.offsetY /= length;
        this.offsetZ /= length;
        this.offsetX *= factor;
        this.offsetY *= factor;
        this.offsetZ *= factor;
        this.updated = true;
    }

}
