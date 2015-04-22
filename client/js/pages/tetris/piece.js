'use strict';

var Block = require('./block');

var FRAMES = {
  z: 0,
  j: 1,
  i: 2,
  t: 3,
  l: 4,
  s: 5,
  o: 6
};

var FORMATIONS = {
  i: [
    [[-2, 0], [-1, 0], [0, 0], [1, 0]],
    [[0, 2], [0, 1], [0, 0], [0, -1]],
    [[-2, -1], [-1, -1], [0, -1], [1, -1]],
    [[-1, 2], [-1, 1], [-1, 0], [-1, -1]]
  ],
  o: [
    [[-1, 0], [0, 0], [-1, -1], [0, -1]]
  ],
  t: [
    [[-1, 0], [0, 0], [1, 0], [0, 1]],
    [[0, 1], [0, 0], [0, -1], [1, 0]],
    [[-1, 0], [0, 0], [1, 0], [0, -1]],
    [[0, 1], [0, 0], [0, -1], [-1, 0]]
  ],
  s: [
    [[-1, 0], [0, 0], [0, 1], [1, 1]],
    [[0, 1], [0, 0], [1, 0], [1, -1]],
    [[-1, -1], [0, -1], [0, 0], [1, 0]],
    [[-1, 1], [-1, 0], [0, 0], [0, -1]]
  ],
  z: [
    [[-1, 1], [0, 1], [0, 0], [1, 0]],
    [[0, -1], [0, 0], [1, 0], [1, 1]],
    [[-1, 0], [0, 0], [0, -1], [1, -1]],
    [[-1, -1], [-1, 0], [0, 0], [0, 1]]
  ],
  j: [
    [[-1, 1], [-1, 0], [0, 0], [1, 0]],
    [[0, -1], [0, 0], [0, 1], [1, 1]],
    [[-1, 0], [0, 0], [1, 0], [1, -1]],
    [[-1, -1], [0, -1], [0, 0], [0, 1]]
  ],
  l: [
    [[-1, 0], [0, 0], [1, 0], [1, 1]],
    [[0, 1], [0, 0], [0, -1], [1, -1]],
    [[-1, -1], [-1, 0], [0, 0], [1, 0]],
    [[-1, 1], [0, 1], [0, 0], [0, -1]]
  ]
};

var TILE_SIZE = 20;

var Piece = function(game, type) {
  Phaser.Group.call(this, game);

  var that = this;
  this.type = type;
  this.rotateState = 0;
  this.classType = Block;
  this.frame = FRAMES[type];
  this.row = 0;
  this.col = 0;

  var pos = FORMATIONS[type][0]; // get coordinates for first rotation
  this.blocks = _.map(_.range(0, 4), function(i) {
    var block = that.create(0, 0, 'tiles', that.frame);
    block.move(pos[i][0], pos[i][1]);
    return block;
  });
  this.dropRate = 50; // fall once every 50ms while drop key is held
};

Piece.prototype = Object.create(Phaser.Group.prototype);
Piece.prototype.constructor = Piece;

Piece.prototype.rotateCoords = function(xOffset) {
  var newRot = this.rotateState;
  if (this.rotateState === FORMATIONS[this.type].length - 1) {
    newRot = 0;
  } else {
    newRot++;
  }
  return FORMATIONS[this.type][newRot];
};

Piece.prototype.blockCoords = function(offset) {
  offset = offset || {};
  offset.col = offset.col || 0;
  offset.row = offset.row || 0;
  return _.map(FORMATIONS[this.type][this.rotateState], function(coords) {
    return [coords[0] + offset.col, coords[1] + offset.row];
  });
};

// Move relative to current position
Piece.prototype.move = function(col, row) {
  this.col += col;
  this.row += row;
  this.x += col * TILE_SIZE;
  this.y -= row * TILE_SIZE;
};

// Move to absolute position
Piece.prototype.moveAbs = function(col, row) {
  this.x += (col - this.col) * TILE_SIZE;
  this.y -= (row - this.row) * TILE_SIZE;
  this.col = col;
  this.row = row;
};

Piece.prototype.rotate = function() {
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

Piece.prototype.drop = function() {
  if (this.game.time.time < this.nextDrop) return false;

  this.move(0, -1);
  this.nextDrop = this.game.time.time + this.dropRate;
  return true;
};

module.exports = Piece;