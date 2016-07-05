var game = new Phaser.Game(1000, 800, Phaser.AUTO, 'gameboard',       {
  preload: preload,
  create: create,
  update: update });

function preload(){
  game.load.image('sky', 'assets/sky.png');
  game.load.spritesheet('robot', 'assets/robot.png', 30, 30);
  game.load.spritesheet('baddie', 'assets/baddie.png', 20, 32);
  game.load.spritesheet('laser', 'assets/beams.png', 20, 30);
}

var player;
var playerMaxHealth = 100;
var fireRate = 200;
var nextFire = 0;

var laser;
var laserDamage = 4;

var smallEnemy;
var smallEnemyMaxHealth = 10;
var smallEnemyDamage = 2;

var platforms;

var lasers;

function create(){
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.add.sprite(0, 0, 'sky');

  walkUp = game.input.keyboard.addKey(Phaser.Keyboard.W);
  walkRight = game.input.keyboard.addKey(Phaser.Keyboard.D);
  walkLeft = game.input.keyboard.addKey(Phaser.Keyboard.A);
  walkDown = game.input.keyboard.addKey(Phaser.Keyboard.S);

  player = game.add.sprite(32, game.world.height - 64, 'robot');
  player.health = playerMaxHealth;
  player.anchor.set(0.5);

  smallEnemy = game.add.sprite(400, game.world.height - 64, 'baddie');
  smallEnemy.damage = smallEnemyDamage;
  smallEnemy.health = smallEnemyMaxHealth;

  game.physics.arcade.enable(player);
  game.physics.arcade.enable(smallEnemy);
  player.body.collideWorldBounds = true;
  smallEnemy.body.collideWorldBounds = true;
  player.body.allowRotation = false;
  cursors = game.input.keyboard.createCursorKeys();

  lasers = game.add.group();
  lasers.enableBody = true;
  lasers.physicsBodyType = Phaser.Physics.ARCADE;
  lasers.damage = laserDamage;

  lasers.createMultiple(10, 'laser');
  lasers.setAll('checkWorldBounds', true);
  lasers.setAll('outOfBoundsKill', true);

}

function update() {
  game.physics.arcade.overlap(smallEnemy, player, damage, null, this);
  game.physics.arcade.overlap(smallEnemy, lasers, pewPew, null, this);

  //allows player and enemy to collide
  game.physics.arcade.collide(player, smallEnemy);
  game.physics.arcade.collide(lasers, smallEnemy);
  smallEnemy.body.velocity.x = 0;
  smallEnemy.body.velocity.y = 0;
  player.body.velocity.x = 0;
  player.body.velocity.y = 0;
  if (walkLeft.isDown){
    player.body.velocity.x = -150;
  } else if (walkRight.isDown){
    player.body.velocity.x = 150;
  } else if (walkUp.isDown) {
    player.body.velocity.y = -150;
  } else if (walkDown.isDown){
    player.body.velocity.y = 150;
  } else {
    player.animations.stop();
  }

  player.rotation = game.physics.arcade.angleToPointer(player);

  if (game.input.activePointer.isDown){
    fire();
  }

  //causes enemy to chase player;
  game.physics.arcade.moveToObject(smallEnemy, player, 100);
}

function fire(){
  if (game.time.now > nextFire && lasers.countDead() > 0){
    nextFire = game.time.now + fireRate;

    var laser = lasers.getFirstDead();
    laser.damage = laserDamage;

    laser.reset(player.x - 8, player.y - 8);

    game.physics.arcade.moveToPointer(laser, 300);
  }
}

//collision handler for loss of health
function damage(attack, target){
  if (target.health < 1){
    target.kill();
  } else {
    target.health -= attack.damage;
  }
}

function pewPew(enemy, attack){
  enemy.health -= attack.damage;
  attack.kill();
  if (enemy.health < 1){
    enemy.kill();
  }
}
