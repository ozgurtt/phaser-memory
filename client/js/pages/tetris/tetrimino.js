'use strict';

var Block = require('./block');

var FORMATIONS = {
  line: [
    [[0, -1], [1, -1], [2, -1], [3, -1]],
    [[2, 0], [2, -1], [2, -2], [2, -3]],
    [[0, -2], [1, -2], [2, -2], [3, -2]],
    [[1, 0], [1, -1], [1, -2], [1, -3]]
  ]
};

var TILE_SIZE = 20;

var Tetrimino = function(game, type) {
  Phaser.Group.call(this, game);

  var that = this;
  this.type = type;
  this.rotateState = 0;
  this.classType = Block;
  this.frame = 2;
  this.row = 0;
  this.col = 0;

  var pos = FORMATIONS[type][0]; // get coordinates for first rotation
  this.blocks = _.map(_.range(0, 4), function(i) {
    var block = that.create(0, 0, 'tile', that.frame);
    block.move(pos[i][0], pos[i][1]);
    return block;
  });
  this.dropRate = 50; // drop one tile every 50ms while drop key is held
};

Tetrimino.prototype = Object.create(Phaser.Group.prototype);
Tetrimino.prototype.constructor = Tetrimino;

Tetrimino.prototype.rotateCoords = function(xOffset) {
  var newRot = this.rotateState;
  if (this.rotateState === FORMATIONS[this.type].length - 1) {
    newRot = 0;
  } else {
    newRot++;
  }
  return FORMATIONS[this.type][newRot];
};

Tetrimino.prototype.blockCoords = function(offset) {
  offset = offset || {};
  offset.col = offset.col || 0;
  offset.row = offset.row || 0;
  return _.map(FORMATIONS[this.type][this.rotateState], function(coords) {
    return [coords[0] + offset.col, coords[1] + offset.row];
  });
};

Tetrimino.prototype.move = function(col, row) {
  this.col += col;
  this.row += row;
  this.x += col * TILE_SIZE;
  this.y -= row * TILE_SIZE;
};

Tetrimino.prototype.rotate = function() {
  var that = this;

  if (this.rotateState === FORMATIONS[this.type].length - 1) {
    this.rotateState = 0;
  } else {
    this.rotateState++;
  }
  _.forEach(this.blocks, function(block, i) {
    var coordinates = FORMATIONS[that.type][that.rotateState][i];
    block.moveAbs(coordinates[0], coordinates[1]);
  })
};

Tetrimino.prototype.drop = function() {
  if (this.game.time.time < this.nextDrop) return false;

  this.move(0, -1);
  this.nextDrop = this.game.time.time + this.dropRate;
  return true;
};

module.exports = Tetrimino;