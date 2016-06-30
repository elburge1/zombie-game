var game = new Phaser.Game(1000, 600, Phaser.AUTO, 'gameboard', {preload: preload, create: create, update: update});

function preload(){
  game.load.image('sky', 'assets/sky.png');
  game.load.spritesheet('dude', 'assets/dude.png', 16, 24);
}

var player;
var platforms;

function create(){
  game.physics.startSystem(Phaser.Physics.ARCADE);

  game.add.sprite(0, 0, 'sky');

  game.add.sprite(32, game.world.height - 64, 'dude');

  player.body.collideWorldBounds = true;

}

function update() {

  if (cursors.left.isDown){
    player.body.velocity.x = -150;
  } else if (cursors.right.isDown){
    player.body.velocity.x = 150;
  } else {
    player.animations.stop();
  }
}
