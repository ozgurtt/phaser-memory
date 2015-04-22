'use strict';

var Enemy = require('./enemy');

var EnemyGenerator = function(game) {
  Phaser.Group.call(this, game);

  //this.enableBody = true;
  //this.physicsBodyType = Phaser.Physics.ARCADE;

  this.spawnRateMin = 2000;
  this.spawnRateMax = 6000;

  this.nextSpawn = this.game.time.time + 1000;
  this.classType = Enemy;
  this.createMultiple(12, 'ships');
};

EnemyGenerator.prototype = Object.create(Phaser.Group.prototype);
EnemyGenerator.prototype.constructor = EnemyGenerator;

EnemyGenerator.prototype.spawn = function() {
  if (this.game.time.time < this.nextSpawn) return;

  this.game.time.events.repeat(300, 4, this.spawnOnce, this);

  this.nextSpawn = this.game.time.time + _.random(this.spawnRateMin, this.spawnRateMax);
};

EnemyGenerator.prototype.spawnOnce = function() {
  this.getFirstExists(false).spawn(this.game.world.centerX);
};



module.exports = EnemyGenerator;