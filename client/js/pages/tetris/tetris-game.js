var Tetrimino = require('./tetrimino');
var Block = require('./block');

var TILE_SIZE = 20;

function Game() {}

Game.prototype = {
  preload: function () {
    this.load.spritesheet('tile', 'img/tetris-tiles.png', TILE_SIZE, TILE_SIZE);
  },

  create: function () {
    var that = this;

    this.boardWidth = 10;
    this.boardHeight = 22;
    this.board = _.map(_.range(0, this.boardHeight), function() {
      return [];
    });

    this.lost = false;
    this.won = false;

    this.createPiece();

    var rotateKey = this.input.keyboard.addKey(Phaser.Keyboard.UP);
    rotateKey.onDown.add(this.rotatePiece, this);

    var leftKey = this.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    leftKey.onDown.add(this.movePieceLeft, this);

    var rightKey = this.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    rightKey.onDown.add(this.movePieceRight, this);

    this.dropKey = this.input.keyboard.addKey(Phaser.Keyboard.DOWN);

    this.fallLoop = this.game.time.events.loop(300, this.fallPiece, this);
  },

  // See if rotating will cause a piece to collide. If so, try moving it left, then right.
  // http://tetris.wikia.com/wiki/Wall_kick
  rotatePiece: function() {
    if (!this.willCollide(this.piece.rotateCoords())) {
      this.piece.rotate();
    } else if (!this.willCollide(this.piece.rotateCoords(), -1)) {
      this.piece.move(-1, 0);
      this.piece.rotate();
    } else if (!this.willCollide(this.piece.rotateCoords(), 1)) {
      this.piece.move(1, 0);
      this.piece.rotate();
    }
  },

  movePieceLeft: function() {
    if (!this.willCollide(this.piece.blockCoords({col: -1}))) {
      this.piece.move(-1, 0);
    }
  },

  movePieceRight: function() {
    if (!this.willCollide(this.piece.blockCoords({col: 1}))) {
      this.piece.move(1, 0);
    }
  },

  fallPiece: function() {
    if (!this.willCollide(this.piece.blockCoords({row: -1}))) {
      this.piece.move(0, -1);
    } else {
      this.placePiece();
    }
  },

  dropPiece: function() {
    if (!this.willCollide(this.piece.blockCoords({row: -1}))) {
      if (this.piece.drop()) {
        this.game.time.events.remove(this.fallLoop);
        this.fallLoop = this.game.time.events.loop(300, this.fallPiece, this);
      }
    } else {
      this.placePiece();
    }
  },

  createPiece: function() {
    this.piece = new Tetrimino(this.game, 'line');
    this.piece.y = (this.boardHeight - 1) * TILE_SIZE;
    this.piece.move(4, 24);
  },

  // Check if the piece's blocks will intersect the boundaries or any other blocks.
  // Return true if a collision exists, false if not.
  willCollide: function(newCoords, colOffset) {
    colOffset = colOffset || 0;
    for (var i = 0; i < newCoords.length; i++) {
      var coords = newCoords[i];
      var col = this.piece.col + coords[0] + colOffset;
      var row = this.piece.row + coords[1];
      // check boundaries first!
      if (col < 0 || row < 0 || col > this.boardWidth - 1) {
        return true;
      }

      // skip anything above the top
      if (row >= this.boardHeight) continue;

      if (this.board[row][col]) {
        return true;
      }
    }
  },

  placePiece: function() {
    var that = this;
    this.game.time.events.remove(this.fallLoop);
    _.forEach(this.piece.blocks, function(block) {
      // Create blocks on the level, based on the blocks that make up the piece
      var newBlock = new Block(that.game, 0, (that.boardHeight - 1) * TILE_SIZE, 'tile', that.piece.frame);
      var col = that.piece.col + block.col;
      var row = that.piece.row + block.row;
      newBlock.move(col, row);
      that.board[row][col] = newBlock;
      that.game.add.existing(newBlock);
    });

    this.piece.destroy();
    this.piece = null;

    this.clearLines(function() {
      that.createPiece();

      that.fallLoop = that.game.time.events.loop(300, that.fallPiece, that);
    });
  },

  clearLines: function(callback) {
    var that = this;

    //debugger;
    var rows = [];
    _.forEach(this.board, function(line, i) {
      // Remove any undefineds and check length (compact creates a copy)
      if (_.compact(line).length === 10) {
        rows.push(i);
      }
    });

    console.log(rows);
    if (rows.length === 0) {
      // don't mix sync + async!
      return setTimeout(function() {
        callback();
      });
    }

    // iterate in reverse order to preserve correct index while mutating
    _.forEach(rows.reverse(), function(row) {
      // this mutates the array!
      var blocks = _.pullAt(that.board, row)[0];
      // so we have to add a new blank line on top
      that.board.push([]);

      _.forEach(blocks, function(block) {
        block.blink();
      });
    });

    this.game.time.events.add(Phaser.Timer.SECOND, function() {
      _.forEach(this.board, function(line, row) {
        _.forEach(line, function(block) {
          if (block) block.moveAbs(block.col, row);
        });
      });
      callback();
    }, this);
  },

  update: function() {
    if (this.won || this.lost) return;

    if (this.piece && this.dropKey.isDown) {
      console.log('dropping piece');
      this.dropPiece();
    }
  },

  showLose: function() {
    this.lost = true;
  },

  showWin: function() {
    this.won = true;
  }
};

module.exports = Game;