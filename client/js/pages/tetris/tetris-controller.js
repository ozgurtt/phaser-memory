'use strict';

module.exports = function ($scope) {
  var vm = this;
  vm.options = {
    width: 10,
    height: 22
  };
  vm.tileWidth = 20;
  vm.tileHeight = 20;
  vm.canvasStyle = {
    width: (vm.options.width * vm.tileWidth) + 'px',
    height: (vm.options.height * vm.tileHeight) + 'px'
  };

  vm.resetGame = function() {
    vm.game.state.restart();
  };

  var Tetris = {};

  Tetris.Boot = require('./tetris-boot');
  Tetris.Game = require('./tetris-game');

  vm.startGame = function() {
    vm.game = new Phaser.Game(
      1,
      1,
      Phaser.AUTO,
      'tetris',
      null,
      false
    );
    vm.game.state.add('Boot', Tetris.Boot);
    vm.game.state.add('Game', Tetris.Game);
    vm.game.state.start('Boot');
  };

  vm.startGame();
};
