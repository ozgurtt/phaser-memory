'use strict';

var Bullet = require('./bullet');

var Weapon = function(game) {
  Phaser.Group.call(this, game);

  this.fireRate = 80;
  this.bulletSpeed = 1600;
  this.nextFire = 0;

  this.enableBody = true;
  this.physicsBodyType = Phaser.Physics.ARCADE;
  this.classType = Bullet;
  this.createMultiple(64, 'projectiles', 69);

  this.pattern = [0, 4, 8, 12, 8, 4, 0, -4, -8, -12, -8, -4];
  this.patternIndex = 0;
};

Weapon.prototype = Object.create(Phaser.Group.prototype);
Weapon.prototype.constructor = Weapon;

Weapon.prototype.fire = function(source) {
  if (this.game.time.time < this.nextFire) return;

  if (this.patternIndex === this.pattern.length - 1) {
    this.patternIndex = 0;
  } else {
    this.patternIndex++;
  }

  this.getFirstExists(false).fire(
    source.x + this.pattern[this.patternIndex],
    source.y - 32,
    270,
    this.bulletSpeed
  );
  this.nextFire = this.game.time.time + this.fireRate;
};

module.exports = Weapon;