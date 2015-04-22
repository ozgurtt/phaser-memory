'use strict';

var PIECE_TYPES = ['i', 'o', 't', 's', 'z', 'j', 'l'];
var Piece = require('./piece');

function Bag(game) {
  this.game = game;
  this.pieces = [];

  this.createPieces(true);
}

Bag.prototype = {
  getPiece: function() {
    if (this.pieces.length === 1) {
      this.createPieces();
    }
    var piece = this.pieces.pop();
    piece.visible = true;
    return piece;
  },
  nextPiece: function() {
    var piece = _.last(this.pieces);
    piece.visible = true;
    return piece;
  },
  createPieces: function(first) {
    var that = this;

    var types = _.shuffle(PIECE_TYPES);
    while (first && _.contains(['s', 'z'], _.last(types))) {
      types.pop();
    }
    var pieces = _.map(types, function(type) {
      var piece = new Piece(that.game, type);
      piece.visible = false;
      return piece;
    });
    // Add the new pieces on the bottom
    that.pieces = pieces.concat(that.pieces);
  }
};

module.exports = Bag;