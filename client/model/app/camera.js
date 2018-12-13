const Entity = require('../../kernel/model/entity');
const ee = require('../../kernel/tools/eventemitter');

module.exports = class Camera extends Entity {

    constructor(config) {
        super(config);

        this._id = 1;

        this.targetX = config.targetX || 0;
        this.targetY = config.targetY || 0;
        this.targetZ = config.targetZ || 0;
        this.zoom = config.zoom || 1.3;

        this.zoommax = 2;
        this.zoommin = 0.1;

        this._ix = 0;
        this._iy = 0;

        this.margin = 2;

        this.minX = this.ax - config.rangeX;
        this.minZ = this.az - config.rangeZ;
        this.maxX = this.ax + config.rangeX;
        this.maxZ = this.az + config.rangeZ;

        this.disabled = false;

        ee.on('mouseDown', this.draggStart.bind(this));
        ee.on('mouseMovePress', this.dragg.bind(this));
        ee.on('mouseWheel', this.scale.bind(this));
        ee.on('draftRoad', this.disable.bind(this));
        ee.on('draftCanal', this.disable.bind(this));
        ee.on('mouseClick', this.enable.bind(this));
        ee.on('mouseDownRight', this.enable.bind(this));
        ee.on('mouseUp', this.enable.bind(this));
    }

    look(x, y, z) {
        this.targetX = x;
        this.targetY = y;
        this.targetZ = z;
        this.updated = true;
    }

    move(x, y, z) {
        if (x >= this.minX && x <= this.maxX && z >= this.minZ && z <= this.maxZ) {
            const dx = x - this.ax;
            const dy = y - this.ay;
            const dz = z - this.az;
            this.ax += dx;
            this.ay += dy;
            this.az += dz;
            this.targetX = this.targetX + dx;
            this.targetY = this.targetY + dy;
            this.targetZ = this.targetZ + dz;
            this.updated = true;
        }
    }

    scale(delta) {
        this.zoom -= delta / 100;
        this.zoom = Math.min(this.zoommax, this.zoom);
        this.zoom = Math.max(this.zoommin, this.zoom);
        this.updated = true;
    }

    draggStart() {
        this._ix = this.ax;
        this._iz = this.az;
    }

    dragg(dx, dz) {
        if (!this.disabled) {
            let newx = this._ix + dx;
            let newz = this._iz + dz;
            this.move(newx, this.y, newz);
        }
    }

    enable() {
        this.disabled = false;
    }

    disable() {
        this.disabled = true;
    }

    onDismount() {
        ee.off('mouseDown', this.draggStart.bind(this));
        ee.off('mouseMovePress', this.dragg.bind(this));
        ee.off('mouseWheel', this.scale.bind(this));
        ee.off('draftRoad', this.disable.bind(this));
        ee.off('draftCanal', this.disable.bind(this));
        ee.off('mouseClick', this.enable.bind(this));
        ee.off('mouseDownRight', this.enable.bind(this));
        ee.off('mouseUp', this.enable.bind(this));
    }
}
