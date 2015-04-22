'use strict';

module.exports = function () {
  var vm = this;
  vm.options = {
    width: 400,
    height: 600
  };
  vm.tileSize = 20;

  vm.resetGame = function() {
    vm.game.state.restart();
  };

  var Shmup = {};

  Shmup.Boot = require('./shmup-boot');
  Shmup.Game = require('./shmup-game');

  vm.startGame = function() {
    vm.game = new Phaser.Game(
      vm.options.width,
      vm.options.height,
      Phaser.AUTO,
      'shmup',
      null,
      false
    );
    vm.game.state.add('Boot', Shmup.Boot);
    vm.game.state.add('Game', Shmup.Game);
    vm.game.state.start('Boot');
  };

  vm.startGame();
};
