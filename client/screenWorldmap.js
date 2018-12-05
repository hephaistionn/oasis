const ee = require('./kernel/tools/eventemitter');
const Screen = require('./kernel/model/screen');
const Camera = require('./model/app/camera');
const Light = require('./model/app/light');


let camera;
let light;


let timer = 0;

module.exports = class ScreenWorldmap extends Screen {

    initComponents(model) {

        camera = new Camera({ x: 0, y: 0, z: 7 });
        light = new Light({ x: 200, y: 200, z: 200, targetX: 0, targetY: 0, targetZ: 0 });

        this.add(camera);
        this.add(light);
       
        camera.look(0, 0, 0);

    }

    update(dt) {

    }

    mouseClick(x, y) {

    }

    mouseDown(x, y) {

    }

    mouseMovePress(dx, dy) {

    }

    mouseWheel(delta) {

    }

};
