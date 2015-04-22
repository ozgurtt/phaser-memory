function Boot() {}

Boot.prototype = {
  init: function() {
    this.game.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
  },

  create: function() {
    this.game.state.start('Game');
  }
};

module.exports = Boot;