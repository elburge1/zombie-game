var game = new Phaser.Game(800, 600, Phaser.AUTO, 'gameboard',       {
  preload: preload,
  create: create,
  update: update });

function preload(){
  game.load.image('mars', 'assets/mars.jpg');
  game.load.spritesheet('robot', 'assets/robot.png', 30, 30);
  game.load.spritesheet('zombie', 'assets/spacezombie.png', 30, 30);
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
var smallEnemyDamage = 0.07;

var zombies;
var zombie;
var aliveZombies = [];

var platforms;

var lasers;

var level = 1;
var score = 0;
var scoreText;
var introText;
var healthText;
var instructions;

var killRobot = false;

function create(){
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.add.sprite(0, 0, 'mars');

  walkUp = game.input.keyboard.addKey(Phaser.Keyboard.W);
  walkRight = game.input.keyboard.addKey(Phaser.Keyboard.D);
  walkLeft = game.input.keyboard.addKey(Phaser.Keyboard.A);
  walkDown = game.input.keyboard.addKey(Phaser.Keyboard.S);
  gameStart = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

  player = game.add.sprite(32, game.world.height - 64, 'robot');
  player.health = playerMaxHealth;
  player.anchor.set(0.5);

  game.physics.arcade.enable(player);

  zombies = game.add.group();
  zombies.enableBody = true;
  zombies.physicsBodyType = Phaser.Physics.ARCADE;

  player.body.collideWorldBounds = true;
  cursors = game.input.keyboard.createCursorKeys();

  lasers = game.add.group();
  lasers.enableBody = true;
  lasers.physicsBodyType = Phaser.Physics.ARCADE;
  lasers.damage = laserDamage;

  lasers.createMultiple(10, 'laser');
  lasers.setAll('checkWorldBounds', true);
  lasers.setAll('outOfBoundsKill', true);

  scoreText = game.add.text(32, 550, 'Score: ' + score, {font:"20px Arial", fill: "#ffffff", align: 'left'});
  levelText = game.add.text(32, 500, 'Level: ' + level, {font:"20px Arial", fill: "#ffffff", align: 'left'});
  introText = game.add.text(400, 100, 'Press Space to defend the homestead!', {font:"20px Arial", fill: "#ffffff", align: "center"});
  healthText = game.add.text(32, 50, 'Health: ' + player.health, {font:"20px Arial", fill: "#ffffff", align: "left"})
  instructions = game.add.text(200, 50, 'W, A, S, D keys to move, point and click to shoot!', {font:"20px Arial", fill: "#ffffff", align: "center"});

  introText.anchor.setTo(0.5, 0.5);

  gameStart.onDown.add(zombieChase, this);

  this.createZombies = function createZombies(){
    var x;
    var y;
    for (var i = 0; i < level + 5; i++){
      x = game.rnd.integerInRange(50, 600);
      y = game.rnd.integerInRange(50, 400);
      zombie = zombies.create(x, y, 'zombie')
      zombie.enableBody = true;
      zombie.physicsBodyType = Phaser.Physics.ARCADE;
      zombie.body.velocity.x = 0;
      zombie.body.velocity.y = 0;
      zombie.body.collideWorldBounds = true;
      zombie.health = smallEnemyMaxHealth;
      zombie.damage = smallEnemyDamage;
      aliveZombies.push(zombie);
    }
  }

  this.createZombies();

}

function update() {
  game.physics.arcade.overlap(zombies, player, damage, null, this);
  game.physics.arcade.overlap(zombies, lasers, pewPew, null, this);

  //allows player and enemy to collide
  game.physics.arcade.collide(player, zombies);
  game.physics.arcade.collide(lasers, zombies);
  game.physics.arcade.collide(zombies, zombies);
  // zombie.body.velocity.x = 0;
  // zombie.body.velocity.y = 0;
  player.body.velocity.x = 0;
  player.body.velocity.y = 0;
  if (killRobot == true){
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
  }

  if (killRobot == true){
    zombies.forEachAlive(function(zombie){
      if (zombie.health < 6){
        game.physics.arcade.moveToObject(zombie, player, 160);
      } else {
        game.physics.arcade.moveToObject(zombie, player, 110);
      }
    })
  }

  if (killRobot == true) {
    if (game.input.activePointer.isDown){
      fire();
    }
  }
}

//weapon firing function
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
function damage(target, attack){
  if (target.health < 1){
    target.kill();
    introText.text = 'YOU LOSE! Click to play again!';
    introText.visible = true;
    game.input.onTap.addOnce(restart, this);
  } else {
    if (killRobot == true){
      target.health -= attack.damage;
      healthText.text = 'Health: ' + target.health.toFixed(1);
    }
  }
}

//collision handler for player attack
function pewPew(enemy, attack){
  enemy.health -= attack.damage;
  attack.kill();
  if (enemy.health < 1){
    enemy.kill();
    score += 1;
    scoreText.text = 'Score: ' + score;
    aliveZombies.length -= 1;
    if (aliveZombies.length == 0){
      level += 1;
      if (level == 6){
        introText.text = 'YOU WIN! Click to play again!';
        introText.visible = true;
        game.input.onTap.addOnce(restart, this);
      } else {
        this.createZombies();
        killRobot = false;
        levelText.text = 'Level: ' + level;
        introText.text = 'GET READY FOR THE NEXT LEVEL! Press space to start!'
        introText.visible = true;
      }
    }
  }
}

//game-start function
function zombieChase(){
  if (introText.visible == true && killRobot == false){
    killRobot = true;
    introText.visible = false;
    instructions.visible = false;
  }
}

function restart(){
  killRobot = false;
  score = 0;
  level = 1;
  health = 100;
  zombies.forEachAlive(function(zombie){
    zombie.kill();
  });
  aliveZombies.length = 0;
  create();
}
