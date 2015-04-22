'use strict';

var TILE_SIZE = 20;

var Block = function(game, x, y, key, frame) {
  Phaser.Sprite.call(this, game, x, y, key, frame);

  this.row = 0;
  this.col = 0;
  this.frame = frame;
};

Block.prototype = Object.create(Phaser.Sprite.prototype);
Block.prototype.constructor = Block;

Block.prototype.move = function(col, row) {
  this.col += col;
  this.row += row;
  this.x += col * TILE_SIZE;
  this.y -= row * TILE_SIZE;
};

Block.prototype.moveAbs = function(col, row) {
  this.x += (col - this.col) * TILE_SIZE;
  this.y -= (row - this.row) * TILE_SIZE;
  this.col = col;
  this.row = row;
};

Block.prototype.blink = function() {
  var anim = this.animations.add('blink', [15, this.frame, 15, this.frame, 15, this.frame, 15]);
  anim.play(8, false, true);
};

module.exports = Block;