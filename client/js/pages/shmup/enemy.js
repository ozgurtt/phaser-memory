'use strict';

var MAX_VELOCITY_X = 400;
var MAX_VELOCITY_Y = 200;
var ACCELERATION = 400;
var DRAG = 400;

var Enemy = function(game, x, y, key, frame) {
  Phaser.Sprite.call(this, game, x, y, key, frame);

  this.maxHealth = 100;

  this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;

  this.anchor.setTo(0.5, 0.5);
  this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.setSize(this.width * 0.8, this.height * 0.8);

  this.body.maxVelocity.setTo(MAX_VELOCITY_X, MAX_VELOCITY_Y);
  this.body.drag.setTo(DRAG, DRAG);

  this.scale.set(2, 2);
  this.frame = 17;
};

Enemy.prototype = Object.create(Phaser.Sprite.prototype);
Enemy.prototype.constructor = Enemy;

Enemy.prototype.spawn = function(x) {
  this.reset(x, -40, this.maxHealth);
  this.body.velocity.y = 300;
  this.body.acceleration.y = 100;

  this.game.time.events.add(1000, this.moveLeft, this);
};

// TODO remove after upgrading to Phaser 2.3.1
Enemy.prototype.damage = function(damage) {
  this.health -= damage;
  if (this.health <= 0) this.kill();
};

Enemy.prototype.moveLeft = function() {
  this.moveDirection = -1;
};

Enemy.prototype.reset = function(x, y, health) {
  Phaser.Sprite.prototype.reset.call(this, x, y, health);

  this.moveDirection = 0;
};

Enemy.prototype.update = function() {
  if (this.y > this.game.world.height + this.height) return this.kill();
  if (this.moveDirection) {
    this.body.acceleration.x = ACCELERATION * this.moveDirection;
  }

  if (this.body.velocity.x > MAX_VELOCITY_X * 0.25) {
    this.frame = 18;
  } else if (this.body.velocity.x < -MAX_VELOCITY_X * 0.25) {
    this.frame = 16;
  } else {
    this.frame = 17;
  }
};

module.exports = Enemy;