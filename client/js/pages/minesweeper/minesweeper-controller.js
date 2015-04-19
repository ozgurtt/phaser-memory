'use strict';

var BOARD_WIDTH = 16;
var BOARD_HEIGHT = 16;
var MINE_COUNT = 80;
var MINE_COUNT_STYLE = {
  font: '18px Arial', align: 'center'
};
var HEADER_STYLE = {
  font: '40px Arial', fill: '#000000', align: 'center'
};
var MINE_COUNT_COLORS = [
  '#0200ae',
  '#0057c6',
  '#009dc0',
  '#4dffaa',
  '#8b7200',
  '#c48f16',
  '#d00000',
  '#7e0001'
];

module.exports = function () {
  var vm = this;
  var game = new Phaser.Game(970, 480, Phaser.AUTO, 'game');

  function Tile() {
    Phaser.Sprite.call(this, game, 0, 0, 'tile');

    this.mine = false; // is this tile a mine?
    this.mineCount = 0; // number of mines surrounding this tile
    this.clear = false;
    this.flagged = false;
    this.nodes = []; // eight connected nodes, clockwise from up.

    this.inputEnabled = true;
    this.input.useHandCursor = true;
  }
  Tile.prototype = Object.create(Phaser.Sprite.prototype);
  Tile.prototype.constructor = Tile;

  Tile.prototype.flag = function() {
    this.flagged = true;
    this.frame = 2;
  };

  Tile.prototype.unflag = function() {
    this.flagged = false;
    this.frame = 0;
  };

  Tile.prototype.showLose = function(clicked) {
    if (this.losingMine) return;
    if (clicked) {
      this.frame = 4;
      this.losingMine = true;
      return;
    }
    if (this.mine && !this.flagged) {
      this.frame = 3;
    } else if (!this.mine && this.flagged) {
      this.frame = 5;
    }
  };

  // clear this tile and all surrounding ones
  Tile.prototype.clearFill = function(checked) {
    var clearCount = 0;

    if (!checked) {
      if (this.clear) return clearCount;

      this.clear = true;
      this.frame = 1;
      clearCount++;

      if (this.mineCount > 0) {
        // clear this node, but don't check the others
        var text = this.game.add.text(
          Math.floor(this.x + this.width / 2),
          Math.floor(this.y + this.height / 2) + 3,
          this.mineCount
        );

        text.setStyle(_.merge({fill: MINE_COUNT_COLORS[this.mineCount - 1]}, MINE_COUNT_STYLE));
        text.anchor.set(0.5);
        return clearCount;
      }
    }

    this.nodes.forEach(function(node) {
      if (node && !node.flagged && !node.mine && !node.clear) {
        clearCount += node.clearFill();
      }
    });

    return clearCount;
  };

  Tile.prototype.makeMine = function() {
    this.mine = true;
    this.nodes.forEach(function(node) {
      if (node) node.mineCount += 1;
    });
  };

  Tile.prototype.toggleFlag = function() {
    if (this.flagged) {
      this.flagged = false;
      this.frame = 0;
    } else {
      this.flagged = true;
      this.frame = 2;
    }
  };

  Tile.prototype.checkFill = function() {
    if (!this.clear || this.mine || !this.mineCount) return 0;

    var flaggedCount = 0;
    var wrongNode = null;
    _.forEach(this.nodes, function(node) {
      if (node && node.flagged) {
        flaggedCount++;
      } else if (node && node.mine) {
        wrongNode = node;
      }
    });

    if (this.mineCount !== flaggedCount) return 0;
    if (wrongNode) {
      wrongNode.showLose(true);
      return false;
    }

    return this.clearFill(true);
  };

  function MainState() {}

  MainState.prototype = {
    preload: function () {
      this.load.spritesheet('tile', 'img/minesweeper-tiles.png', 24, 24);
    },

    create: function () {
      this.game.stage.backgroundColor = '#DDDDDD';

      this.createTiles();
      this.clearedTiles = 0;
      this.toWin = (BOARD_WIDTH * BOARD_HEIGHT) - MINE_COUNT;
      this.flagKey = game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
      this.checkKey = game.input.keyboard.addKey(Phaser.Keyboard.CONTROL);
      this.started = false; // Place mines on first click to avoid death on first move!
    },

    clickTile: function(tile) {
      if (this.lost || this.won) return;
      if (!this.started) {
        this.started = true;
        this.placeMines(tile);
      }

      if (this.checkKey.isDown) {
        var cleared = tile.checkFill();
        if (cleared === false) {
          // if false, someone screwed up the flags and lost!
          this.showLose();
        } else {
          this.clearedTiles += cleared;
        }
        return;
      }

      if (tile.clear) return;
      if (this.flagKey.isDown) {
        tile.toggleFlag();
        return;
      }

      if (tile.flagged) return;
      if (tile.mine) {
        tile.showLose(true);
        this.showLose();
        return;
      }

      this.clearedTiles += tile.clearFill();
    },

    update: function() {
      if (this.won) return;

      if (this.clearedTiles === this.toWin) {
        this.won = true;
        this.showWin();
      }
    },

    createTiles: function() {
      var that = this;

      this.tiles = _.map(_.range(0, BOARD_WIDTH), function(x) {
        return _.map(_.range(0, BOARD_HEIGHT ), function(y) {
          var tile = new Tile();
          tile.x = x * 24;
          tile.y = y * 24;
          tile.events.onInputDown.add(that.clickTile, that);

          game.add.existing(tile);
          return tile;
        });
      });

      _.forEach(this.tiles, function(row, y) {
        _.forEach(row, function(tile, x) {
          tile.nodes = [
            that.tiles[y] ? that.tiles[y][x - 1] : null,
            that.tiles[y + 1] ? that.tiles[y + 1][x - 1] : null,
            that.tiles[y + 1] ? that.tiles[y + 1][x] : null,
            that.tiles[y + 1] ? that.tiles[y + 1][x + 1] : null,
            that.tiles[y] ? that.tiles[y][x + 1] : null,
            that.tiles[y - 1] ? that.tiles[y - 1][x + 1] : null,
            that.tiles[y - 1] ? that.tiles[y - 1][x] : null,
            that.tiles[y - 1] ? that.tiles[y - 1][x - 1] : null
          ]
        });
      });
    },

    placeMines: function(ignoreTile) {
      var that = this;

      _.times(MINE_COUNT, function() {
        do {
          var randomX = _.random(0, BOARD_WIDTH - 1);
          var randomY = _.random(0, BOARD_HEIGHT - 1);
          var tile = that.tiles[randomX][randomY];
        } while (tile === ignoreTile || tile.mine);
        tile.makeMine();
      });
    },

    showLose: function() {
      var that = this;
      _.forEach(this.tiles, function(row) {
        _.forEach(row, function(tile) {
          tile.showLose();
        });
      });
      this.lost = true;
    },

    showWin: function() {
      var text = game.add.text(game.world.centerX, game.world.centerY, 'YOUR WINNER', HEADER_STYLE);
      text.anchor.set(0.5);
    }
  };

  game.state.add('MainState', MainState);
  game.state.start('MainState');
};
