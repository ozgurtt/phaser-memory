'use strict';

var CARD_FLIP_SPEED = 100;
var CARD_REVERT_SPEED = 800;

module.exports = ['ResourceService', function (ResourceService) {
  var vm = this;
  var game = new Phaser.Game(900, 480, Phaser.AUTO, 'game');

  function Card(frame) {
    Phaser.Sprite.call(this, game, 0, 0, 'cards');

    this.cardNumber = frame;
    this.frame = 0;
    this.inputEnabled = true;
    this.input.useHandCursor = true;
    this.anchor.setTo(0.5, 0.5);
    this.scale = {x: 1.0, y: 1.0};
  }
  Card.prototype = Object.create(Phaser.Sprite.prototype);
  Card.prototype.constructor = Card;

  Card.prototype.flip = function() {
    this.flipped = true;
    var tween = game.add.tween(this.scale).to({x: 0.0, y: 1.0}, CARD_FLIP_SPEED, Phaser.Easing.Quadratic.In, true);
    tween.onComplete.add(function() {
      this.frame = this.cardNumber;
      game.add.tween(this.scale).to({x: 1.0, y: 1.0}, CARD_FLIP_SPEED, Phaser.Easing.Quadratic.Out, true);
    }, this);
  };

  Card.prototype.unflip = function() {
    this.flipped = false;
    var tween = game.add.tween(this.scale).to({x: 0.0, y: 1.0}, CARD_FLIP_SPEED, Phaser.Easing.Quadratic.In, true);
    tween.onComplete.add(function() {
      this.frame = 0;
      game.add.tween(this.scale).to({x: 1.0, y: 1.0}, CARD_FLIP_SPEED, Phaser.Easing.Quadratic.Out, true);
    }, this);
  };

  function MainState() {}

  MainState.prototype = {
    preload: function () {
      this.load.spritesheet('cards', 'img/icons.png', 80, 80);
    },

    create: function () {
      this.game.stage.backgroundColor = '#DDDDDD';

      this.activeCards = [];
      this.score = 0;

      this.createCards();
      this.cards.forEach(function (card, i) {
        card.x = i % 10 * 90 + 45;
        card.y = 45 + Math.floor(i / 10) * 90;
        game.add.existing(card);
      });
    },

    createCards: function () {
      var that = this;
      // there are 40 different cards to choose from
      var cards = [];
      _.times(20, function () {
        var frame = _.random(10, 30);

        _.times(2, function() {
          var card = new Card(frame);
          card.events.onInputDown.add(that.flipCard, that);
          cards.push(card);
        });
      });

      this.cards = _.shuffle(cards);
    },

    flipCard: function (card) {
      var that = this;
      if (card.flipped || this.activeCards.length === 2) return;
      if (this.activeCards.length && this.activeCards[0].cardNumber === card.cardNumber) {
        card.flip();
        this.activeCards = [];
        this.score += 2;
        if (this.score === this.cards.length) {
          this.showWin();
        }
        return;
      }

      this.activeCards.push(card);
      card.flip();

      if (this.activeCards.length === 2) {
        setTimeout(function() {
          card.unflip();
          that.activeCards[0].unflip();
          that.activeCards = [];
        }, 700);
      }
    },

    showWin: function() {
      game.add.text(game.world.centerX - 40, 400, 'You win!', { 'font': '22px Helvetica', fill: '#000' });
    }
  };

  game.state.add('MainState', MainState);
  game.state.start('MainState');
}];
