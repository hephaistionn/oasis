const Resource = require('../../../kernel/model/resource');
const ee = require('../../../kernel/tools/eventemitter');
const Stats = require('../../../kernel/model/stats');

class Game extends Resource {

    constructor(config, ground) {
        super(config, ground);
        this.stats.set(Stats.MEAT, config.meat || 10000);
        this.pos1 = [this.ax, this.az, Math.random() * Math.PI * 2];
        this.pos2 = [this.ax, this.az, Math.random() * Math.PI * 2];
        this.pos3 = [this.ax, this.az, Math.random() * Math.PI * 2];
        this.walking1 = true;
        this.walking2 = true;
        this.walking3 = true;
        //ax az n'sont pas le centre mais la premiere case
        this.xmin = this.ax + this.ground.tileSize / 2 - this.constructor.tileX * this.ground.tileSize / 2;
        this.xmax = this.ax + this.ground.tileSize / 2 + this.constructor.tileX * this.ground.tileSize / 2;
        this.zmin = this.az + this.ground.tileSize / 2 - this.constructor.tileZ * this.ground.tileSize / 2;
        this.zmax = this.az + this.ground.tileSize / 2 + this.constructor.tileZ * this.ground.tileSize / 2;
        this.timer1 = 0;
        this.timer2 = 0;
        this.timer3 = 0;
        this.speed = 0.0015;
        this.duration = 6000;
        this.started = true;
    }

    update(dt) {
        if (this.walking1) {
            this.pos1[0] += Math.cos(this.pos1[2]) * this.speed * dt;
            this.pos1[1] += Math.sin(this.pos1[2]) * this.speed * dt;
            if (this.pos1[0] > this.xmax || this.pos1[0] < this.xmin || this.pos1[1] > this.zmax || this.pos1[1] < this.zmin) {
                this.pos1[0] -= Math.cos(this.pos1[2]) * this.speed * dt * 3;
                this.pos1[1] -= Math.cos(this.pos1[2]) * this.speed * dt * 3;
                this.walking1 = false;
            }
        } else {
            this.timer1 += dt;
            if (this.timer1 > this.duration) {
                this.walking1 = true;
                this.pos1[2] += (Math.random() * 0.1 + 1) * Math.PI;
                this.pos1[2] = Math.mod2pi(this.pos1[2]);
                this.timer1 = 0;
            }
        }

        if (this.walking2) {
            this.pos2[0] += Math.cos(this.pos2[2]) * this.speed * dt;
            this.pos2[1] += Math.sin(this.pos2[2]) * this.speed * dt;
            if (this.pos2[0] > this.xmax || this.pos2[0] < this.xmin || this.pos2[1] > this.zmax || this.pos2[1] < this.zmin) {
                this.pos2[0] -= Math.cos(this.pos2[2]) * this.speed * dt * 3;
                this.pos2[1] -= Math.cos(this.pos2[2]) * this.speed * dt * 3;
                this.walking2 = false;
            }
        } else {
            this.timer2 += dt;
            if (this.timer2 > this.duration) {
                this.walking2 = true;
                this.pos2[2] += (Math.random() * 0.2 + 1) * Math.PI;
                this.pos2[2] = Math.mod2pi(this.pos2[2]);
                this.timer2 = 0;
            }
        }

        if (this.walking3) {
            this.pos3[0] += Math.cos(this.pos3[2]) * this.speed * dt;
            this.pos3[1] += Math.sin(this.pos3[2]) * this.speed * dt;
            if (this.pos3[0] > this.xmax || this.pos3[0] < this.xmin || this.pos3[1] > this.zmax || this.pos3[1] < this.zmin) {
                this.pos3[0] -= Math.cos(this.pos3[2]) * this.speed * dt * 3;
                this.pos3[1] -= Math.cos(this.pos3[2]) * this.speed * dt * 3;
                this.walking3 = false;
            }
        } else {
            this.timer3 += dt;
            if (this.timer3 > this.duration) {
                this.walking3 = true;
                this.pos3[2] += (Math.random() * 0.2 + 1) * Math.PI;
                this.pos3[2] = Math.mod2pi(this.pos3[2]);
                this.timer3 = 0;
            }
        }
    }

    getDirection(ax, az) {
        return Math.atan2(this.pos1[1] - az, this.pos1[0] - ax);
    }

}
Game.selectable = true;
Game.tileX = 2;
Game.tileZ = 2;
Game.walkable = 0;
Game.code = 251;
Game.resource = true;
Game.instances = [];
Game.description = 'This building increase the enable places for your population';
Game.label = 'Gibier';
Game.picture = '/pic/game.png';
Game.display = [Stats.MEAT];
module.exports = Game;