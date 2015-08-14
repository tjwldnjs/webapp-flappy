// the Game object used by the phaser.io library
var stateActions = { preload: preload, create: create, update: update };

// Phaser parameters:
// - game width
// - game height
// - renderer (go for Phaser.AUTO)
// - element where the game will be drawn ('game')
// - actions on the game state (or null for nothing)
var height = 400;
var width = 700;
var gameSpeed = 200;
var game = new Phaser.Game(790, 400, Phaser.AUTO, 'game', stateActions);

/*
 * Loads all resources for the game and gives them names.
 */
var score = -1;
var player;
var labelScore;
var pipes = [];
var pipeInterval = 1.75;
var pipeGap= 100;
var pipeEndHeight = 25;
var pipeEndExtraWidth = 10;
var balloons = [];
var heavy = [];
var gameGravity = 200;
var bonusWidth = 50;
var splashDisplay;



jQuery("#greeting-form").on("submit", function(event_details) {
    var greeting = "Hello ";
    var name = jQuery("#fullName").val();
    var greeting_message = greeting + name;
    jQuery("#greeting-form").hide();
    jQuery("#greeting").append("<p>" + greeting_message + "</p>");
   });
function preload() {
    game.load.image("backgroundImg", "../assets/bg.jpg");
    game.load.image("playerImg","../assets/dino3.png");
    game.load.image("pipe","../assets/pipe_yellow.png");
    game.load.image("pipeEnd","../assets/pipe-end2.png");
    game.load.image("balloons","../assets/cat.gif");
    game.load.image("heavy","../assets/egg.png");
    game.load.image("egg","../assets/egg3.png");

}

/*
 * Initialises the game. This function is only called once.
 */
function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);


    // set the background colour of the scene
    var bg = game.add.image(0, -280, "backgroundImg");
    //game.add.sprite(5, 100, "playerImg");
    player = game.add.sprite(250, 160, "playerImg");
    player.width = 60;
    player.height = 45;
    labelScore = game.add.text(20, 20, "0");
    game.physics.arcade.enable(player);


    game.input.keyboard.addKey(Phaser.Keyboard.UP)
        .onDown.add(moveUp);
    game.input.keyboard.addKey(Phaser.Keyboard.RIGHT)
        .onDown.add(moveRight);
    game.input.keyboard.addKey(Phaser.Keyboard.LEFT)
        .onDown.add(moveLeft);
    game.input.keyboard.addKey(Phaser.Keyboard.DOWN)
        .onDown.add(moveDown);
    splashDisplay = game.add.text(100,200, "[Press [ENTER] to start, [SPACEBAR] to jump]")
    game.input.keyboard
        .addKey(Phaser.Keyboard.ENTER)
        .onDown.add(start);

}



function start(){
    game.input.keyboard.addKey(Phaser.Keyboard.ENTER).onDown.remove(start);
    game.input.keyboard
        .addKey(Phaser.Keyboard.SPACEBAR)
        .onDown.add(playerJump);
    player.body.velocity.x = 0;
    player.body.gravity.y = 600;
    player.anchor.setTo(0.5, 0.5);

    generatePipe();
    game.time.events.loop(pipeInterval * Phaser.Timer.SECOND, generate);
    splashDisplay.destroy();
}






function generate() {

    var dice = game.rnd.integerInRange(1,7);
    if(dice==1) {
        makeBalloons();
    }else if(dice==2) {
        makeHeavy();
    } else {
        generatePipe();
    }
}

function checkUpgrade(bonusArray, bonusEffect) {
    for (var i = bonusArray.length - 1; i >= 0; i--) {
        game.physics.arcade.overlap(player, bonusArray[i], function () {
            // destroy sprite
            bonusArray[i].destroy();
            // remove element from array
            bonusArray.splice(i, 1);
            // apply the bonus effect
            changeGravity(bonusEffect);
        });
    }
}

function generatePipe() {
    var gapStart = game.rnd.integerInRange(50, height - 50 - pipeGap);
    addPipeEnd(width-(pipeEndExtraWidth/2), gapStart-pipeEndHeight);
    for(var y=gapStart -75; y >-50 ; y -= 50){
        addPipeBlock(width,y);
    }
    addPipeEnd(width-(pipeEndExtraWidth/2), gapStart+pipeGap);
    for(var y = gapStart + pipeGap + 25; y < height; y += 50) {
        addPipeBlock(width, y);
    }
    changeScore();
}

function addPipeBlock(x,y) {
        var pipeBlock = game.add.sprite(x, y, "pipe");
        pipes.push(pipeBlock);
        game.physics.arcade.enable(pipeBlock);
        pipeBlock.body.velocity.x = -200;
    }

function addPipeEnd(x,y) {
    var pipeBlock = game.add.sprite(x, y, "pipeEnd");
    pipes.push(pipeBlock);
    game.physics.arcade.enable(pipeBlock);
    pipeBlock.body.velocity.x = -200;
}



function playerJump() {
    player.body.velocity.y =-190;
}


function changeScore() {

    score++;
    labelScore.setText(score.toString());
}

function moveRight() {
    player.x = player.x + 20
}

function moveUp() {
    player.y = player.y - 20
}

function moveLeft() {
 player.x = player.x - 20

}

function moveDown() {
    player.y = player.y + 20
}






/*
 * This function updates the scene. It is called for every new frame.
 */
function update() {
    for(var index=0; index<pipes.length; index++){
        game.physics.arcade
            .overlap(player,
            pipes[index],
            gameOver);
    }

    if(player.body.y < 0 || player.body.y > 400){
        gameOver();
    }
    player.rotation = Math.atan(player.body.velocity.y /gameSpeed);

    checkUpgrade(balloons, -1000);
    checkUpgrade(heavy, 1000);


}

function gameOver() {
    game.destroy();

    $("#score").val(score.toString());
    $("#greeting").show();




}

$.get("/score", function(scores){
    for (var i = 0; i < scores.length; i++) {
        $("#scoreBoard").append(
            "<li>" +
            scores[i].name + ": " + scores[i].score +
            "</li>");
    }
});

function changeGravity(g){
    gameGravity += g;
    player.body.velocity.y = gameGravity;
}

function makeBalloons() {
    var upgrade = game.add.sprite(700, 400, "balloons");
    upgrade.width =40;
    upgrade.height = 60;
    balloons.push(upgrade);
    game.physics.arcade.enable(upgrade);
    upgrade.body.velocity.x = -250;
    upgrade.body.velocity.y = - game.rnd.integerInRange(60,100);


}

function makeHeavy() {
    var upgrade = game.add.sprite(700, 0, "heavy");
    upgrade.width = 40;
    upgrade.height = 60;
    heavy.push(upgrade);
    game.physics.arcade.enable(upgrade);
    upgrade.body.velocity.x = -300;
    upgrade.body.velocity.y = game.rnd.integerInRange(60, 100);


}



