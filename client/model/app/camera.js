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

        this._draggStart = this.draggStart.bind(this);
        this._dragg = this.dragg.bind(this);
        this._scale = this.scale.bind(this);
        this._disable = this.disable.bind(this);
        this._enable = this.enable.bind(this);
        ee.on('mouseDown', this._draggStart);
        ee.on('mouseMovePress', this._dragg);
        ee.on('mouseWheel', this._scale);
        ee.on('draftRoad', this._disable);
        ee.on('draftCanal', this._disable);
        ee.on('mouseClick', this._enable);
        ee.on('mouseDownRight', this._enable);
        ee.on('mouseUp', this._enable);
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
        ee.off('mouseDown', this._draggStart);
        ee.off('mouseMovePress', this._dragg);
        ee.off('mouseWheel', this._scale);
        ee.off('draftRoad', this._disable);
        ee.off('draftCanal', this._disable);
        ee.off('mouseClick', this._enable);
        ee.off('mouseDownRight', this._enable);
        ee.off('mouseUp', this._enable);
    }
}
