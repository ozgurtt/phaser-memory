function Boot() {}

Boot.prototype = {
  init: function() {
    this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
  },

  create: function() {
    this.game.state.start('Game');
  }
};

module.exports = Boot;