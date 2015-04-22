'use strict';
var Block = require('./block');
var Bag = require('./bag');

var TILE_SIZE = 20;

var HEADER_STYLE = {
  font: '26px Arial', fill: '#FFFFFF', align: 'center'
};

function Game() {}

Game.prototype = {
  preload: function () {
    this.load.tilemap('map', 'assets/tetris-bg.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('background', 'img/tetris-bg.png', TILE_SIZE, TILE_SIZE);
    this.load.spritesheet('tiles', 'img/tetris-tiles.png', TILE_SIZE, TILE_SIZE);
    this.load.image('pressStart', 'img/press-start.png');
  },

  create: function () {
    this.boardWidth = 10;
    this.boardHeight = 22;
    // Extra head space for calculating top out (game over)
    this.board = _.map(_.range(0, this.boardHeight + 4), function() {
      return [];
    });

    this.game.stage.backgroundColor = '#000000';
    this.map = this.game.add.tilemap('map');
    this.map.addTilesetImage('background');

    var layer = this.map.createLayer('Tile Layer 1');
    layer.resizeWorld();

    var font = this.game.add.retroFont('pressStart', 20, 20, (Phaser.RetroFont.TEXT_SET3));
    font.text = 'LINES - ';
    this.game.add.image(100, 40, font);

    this.lines = 0;
    this.linesText = this.game.add.retroFont('pressStart', 20, 20, (Phaser.RetroFont.TEXT_SET3));
    this.linesText.text = _.padLeft(this.lines.toString(), 3, '0');
    this.game.add.image(220, 40, this.linesText);

    font = this.game.add.retroFont('pressStart', 20, 20, (Phaser.RetroFont.TEXT_SET3 + '-'));
    font.text = 'SCORE';
    this.game.add.image(380, 160, font);

    this.score = 0;
    this.scoreText = this.game.add.retroFont('pressStart', 20, 20, (Phaser.RetroFont.TEXT_SET3));
    this.scoreText.text = _.padLeft(this.score, 6, '0');
    this.game.add.image(380, 180, this.scoreText);

    font = this.game.add.retroFont('pressStart', 20, 20, (Phaser.RetroFont.TEXT_SET3 + '-'));
    font.text = 'NEXT';
    this.game.add.image(380, 260, font);

    // Set up the translation from [0, 0] on the board to the canvas
    this.origin = {
      x: 5 * TILE_SIZE,
      y: (this.boardHeight + 5) * TILE_SIZE
    };

    this.lost = false;
    this.won = false;

    this.fallSpeed = 300;

    this.bag = new Bag(this.game);

    var rotateKey = this.input.keyboard.addKey(Phaser.Keyboard.UP);
    rotateKey.onDown.add(this.rotatePiece, this);

    var leftKey = this.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    leftKey.onDown.add(this.movePieceLeft, this);

    var rightKey = this.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    rightKey.onDown.add(this.movePieceRight, this);

    this.dropKey = this.input.keyboard.addKey(Phaser.Keyboard.DOWN);

    this.createPiece();
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
        this.fallLoop = this.game.time.events.loop(this.fallSpeed, this.fallPiece, this);
      }
    } else {
      this.placePiece();
    }
  },

  createPiece: function() {
    if (this.nextPiece) {
      this.piece = this.nextPiece;
    } else {
      this.piece = this.bag.getPiece();
      this.piece.x = this.origin.x;
      this.piece.y = this.origin.y;
    }
    this.nextPiece = this.bag.getPiece();
    this.nextPiece.x = this.origin.x;
    this.nextPiece.y = this.origin.y;
    this.nextPiece.move(16, 11);

    this.piece.moveAbs(4, 23);
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

      if (this.board[row][col]) {
        return true;
      }
    }
  },

  placePiece: function() {
    var that = this;
    // number of blocks in the vanish zone
    var blocksOut = 0;
    this.game.time.events.remove(this.fallLoop);
    _.forEach(this.piece.blocks, function(block) {
      // Create blocks on the level, based on the blocks that make up the piece
      var newBlock = new Block(that.game, that.origin.x, that.origin.y, 'tiles', that.piece.frame);
      var col = that.piece.col + block.col;
      var row = that.piece.row + block.row;
      newBlock.move(col, row);
      that.board[row][col] = newBlock;
      that.game.add.existing(newBlock);

      if (row > that.boardHeight) blocksOut++;
    });

    if (blocksOut === 4) {
      this.showLose();
      return;
    }
    this.piece.destroy();
    this.piece = null;

    this.clearLines(function() {
      that.createPiece();

      that.fallLoop = that.game.time.events.loop(300, that.fallPiece, that);
    });
  },

  clearLines: function(callback) {
    var that = this;

    var rows = [];
    _.forEach(this.board, function(line, i) {
      // Remove any undefineds and check length (compact creates a copy)
      if (_.compact(line).length === 10) {
        rows.push(i);
      }
    });

    if (rows.length === 0) {
      // don't mix sync + async!
      return setTimeout(function() {
        callback();
      });
    }

    this.addScore(rows.length);

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

    this.game.time.events.add(800, function() {
      _.forEach(this.board, function(line, row) {
        _.forEach(line, function(block) {
          if (block) block.moveAbs(block.col, row);
        });
      });
      callback();
    }, this);
  },

  addScore: function(lines) {
    this.lines += lines;
    this.linesText.text = _.padLeft(this.lines, 3, '0');
    switch (lines) {
      case 1:
        this.score += 100;
        break;
      case 2:
        this.score += 200;
        break;
      case 3:
        this.score += 400;
        break;
      case 4:
        this.score += 800;
        break;
    }
    this.scoreText.text = _.padLeft(this.score, 6, '0');
  },

  update: function() {
    if (this.won || this.lost) return;

    if (this.piece && this.dropKey.isDown) {
      this.dropPiece();
    }
  },

  showLose: function() {
    this.lost = true;

    var graphics = this.game.add.graphics(80, 280);
    graphics.beginFill('#000000');
    graphics.drawRect(0, 0, 240, 60);
    graphics.endFill();

    var font = this.game.add.retroFont('pressStart', 20, 20, (Phaser.RetroFont.TEXT_SET3));
    font.text = 'YOUR LOSER';
    this.game.add.image(100, 300, font);
  },

  showWin: function() {
    this.won = true;
  }
};

module.exports = Game;