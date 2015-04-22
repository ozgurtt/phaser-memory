'use strict';

var Bullet = function(game, x, y, key, frame) {
  Phaser.Sprite.call(this, game, x, y, key, frame);

  this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;

  this.damage = 25;
  this.scale.set(2, 2);
  this.anchor.setTo(0.5, 0.5);
  this.outOfBoundsKill = true;
  this.checkWorldBounds = true;
};

Bullet.prototype = Object.create(Phaser.Sprite.prototype);
Bullet.prototype.constructor = Bullet;

Bullet.prototype.fire = function(x, y, angle, speed) {
  this.reset(x, y);
  this.game.physics.arcade.velocityFromAngle(angle, speed, this.body.velocity);
};

module.exports = Bullet;