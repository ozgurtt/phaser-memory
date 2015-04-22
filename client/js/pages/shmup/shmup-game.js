'use strict';

var Player = require('./player');
var Weapon = require('./weapon');
var EnemyGenerator = require('./enemy-generator')

function Game() {}

Game.prototype = {
  preload: function () {
    this.load.image('background', 'img/shmup-background.png');
    this.load.image('pressStart', 'img/press-start.png');
    this.load.spritesheet('ships', 'img/shmup-ships.png', 32, 32);
    this.load.spritesheet('projectiles', 'img/shmup-projectiles.png', 12, 14);
  },

  create: function () {
    this.padding = 36;

    this.background = this.game.add.tileSprite(0, 0, 400, 600, 'background');
    //this.background.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;
    this.background.autoScroll(0, 30);
    this.background.scale.set(2, 2);

    this.cursors = this.game.input.keyboard.createCursorKeys();

    this.enemies = new EnemyGenerator(this.game);

    this.createPlayer();

    this.weapon = new Weapon(this.game);
    this.game.add.existing(this.weapon);

    this.fireButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    this.shields = 100;
    this.shieldsText = this.game.add.retroFont('pressStart', 20, 20, (Phaser.RetroFont.TEXT_SET3));
    this.shieldsText.text = this.shields.toString();
    this.game.add.image(20, 20, this.shieldsText);
  },

  createPlayer: function () {
    this.player = new Player(this.game, 200, this.world.height - this.padding, 'ships');
    this.game.add.existing(this.player);
  },

  update: function() {
    if (this.won || this.lost) return;

    this.enemies.spawn();
    this.player.stop();
    if (this.player.x < this.padding) {
      this.player.x = this.padding;
    } else if (this.player.x > this.world.width - this.padding) {
      this.player.x = this.world.width - this.padding;
    }

    if (this.cursors.left.isDown) {
      this.player.moveLeft();
    } else if (this.cursors.right.isDown) {
      this.player.moveRight();
    }

    if (this.fireButton.isDown) {
      this.weapon.fire(this.player);
    }

    this.game.physics.arcade.overlap(this.player, this.enemies, this.enemyCollide, null, this);
    this.game.physics.arcade.overlap(this.weapon, this.enemies, this.enemyHit, null, this);
  },

  enemyCollide: function(player, enemy) {
    enemy.kill();
  },

  enemyHit: function(bullet, enemy) {
    enemy.damage(bullet.damage);
    bullet.kill();
  },

  showLose: function() {
    this.lost = true;

    var font = this.game.add.retroFont('pressStart', 20, 20, (Phaser.RetroFont.TEXT_SET3));
    font.text = 'YOUR LOSER';
    this.game.add.image(100, 300, font);
  },

  showWin: function() {
    this.won = true;

    var font = this.game.add.retroFont('pressStart', 20, 20, (Phaser.RetroFont.TEXT_SET3));
    font.text = 'YOUR WINNER';
    this.game.add.image(100, 300, font);
  }
};

module.exports = Game;