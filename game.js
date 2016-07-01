var game = new Phaser.Game(1000, 600, Phaser.AUTO, 'gameboard',       {
  preload: preload,
  create: create,
  update: update });

function preload(){
  game.load.image('sky', 'assets/sky.png');
  game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
  game.load.spritesheet('baddie', 'assets/baddie.png', 20, 32);
}

var player;
var enemy;
var platforms;

function create(){
  game.physics.startSystem(Phaser.Physics.ARCADE);

  game.add.sprite(0, 0, 'sky');

  player = game.add.sprite(32, game.world.height - 64, 'dude');

  enemy = game.add.sprite(100, game.world.height - 64, 'baddie')

  game.physics.arcade.enable(player);

  player.body.collideWorldBounds = true;

  cursors = game.input.keyboard.createCursorKeys();

}

function update() {

  game.physics.arcade.collide(player, enemy);

  player.body.velocity.x = 0;
  player.body.velocity.y = 0;

  if (cursors.left.isDown){
    player.body.velocity.x = -150;
  } else if (cursors.right.isDown){
    player.body.velocity.x = 150;
  } else if (cursors.up.isDown) {
    player.body.velocity.y = -150;
  } else if (cursors.down.isDown){
    player.body.velocity.y = 150;
  } else {
    player.animations.stop();
  }
}
