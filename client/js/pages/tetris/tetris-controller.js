'use strict';

module.exports = function () {
  var vm = this;
  vm.options = {
    width: 36,
    height: 30
  };
  vm.tileSize = 20;

  vm.resetGame = function() {
    vm.game.state.restart();
  };

  var Tetris = {};

  Tetris.Boot = require('./tetris-boot');
  Tetris.Game = require('./tetris-game');

  vm.startGame = function() {
    vm.game = new Phaser.Game(
      vm.options.width * vm.tileSize,
      vm.options.height * vm.tileSize,
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
