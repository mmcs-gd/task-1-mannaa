const canvas = document.getElementById("cnvs");

const direction = {
    left : 0,
    right : 1,
    up : 2,
    down : 3,
    none : -1
}
const gameState = {};

function onMouseMove(e) {
    gameState.pointer.x = e.pageX;
    gameState.pointer.y = e.pageY
}

function queueUpdates(numTicks) {
    for (let i = 0; i < numTicks; i++) {
        gameState.lastTick = gameState.lastTick + gameState.tickLength;
        update(gameState.lastTick);
    }
}

function draw(tFrame) {
    const context = canvas.getContext('2d');

    // clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    drawPlatform(context)
    drawBall(context)
    drawBonus(context)
    drawScores(context)
    drawFailScreen(context)
}
/*
The first lines are moving the platform behind the mouse. Divided by 10 to make it smoother. 

The second is to change the coordinates of the ball - we add its speed to the current coordinates and get the coordinates for the next frame.

The third is a bonus that appears every 15 seconds. If he's invisible, and calculate its coordinates is not necessary.

The latter is checking for collisions with walls and changing the direction of movement if the ball collided with the wall.*/



function update(tick) {
    if (gameState.isFail) 
        stopGame(gameState.stopCycle)
    //The first lines are moving the platform behind the mouse. Divided by 10 to make it smoother.
    const vx = (gameState.pointer.x - gameState.player.x) / 10
    gameState.player.x += vx

    //The second is to change the coordinates of the ball - we add its speed to the current coordinates and get the coordinates for the next frame
    const ball = gameState.ball
    ball.y += ball.vy
    ball.x += ball.vx

    //The third is a bonus that appears every 15 seconds. If he's invisible, and calculate its coordinates is not necessary.
    const bonus = gameState.bonus;
    if (bonus.isVisible) {
       bonus.vy += 0.1
       bonus.y += bonus.vy
       bonus.x += bonus.vx

        //The latter is checking for collisions with walls and changing the direction of movement if the ball collided with the wall.*/
       const wall = isWallCollision(bonus)
       if (wall === direction.left && bonus.vx > 0) {
           bonus.vx = -bonus.vx
       } else if (wall === direction.right && bonus.vx < 0) {
           bonus.vx = -bonus.vx
       }
//Letting the paddle hit the ball
//Section

//The last thing to do in this lesson is to create some kind of collision detection between the ball and the paddle, so it can bounce off it and get back into the play area. The easiest thing to do is to check whether the center of the ball is between the left and right edges of the paddle. Update the last bit of code you modified again, to the following:
       const player = isPlayerCollision(bonus)
       if (player === direction.left && bonus.vx > 0) {
           bonus.vx = -bonus.vx
       } else if (player === direction.right && bonus.vx < 0) { 
           bonus.vx = -bonus.vx
       } else if (player === direction.up && bonus.vy > 0) {
           bonus.isVisible = false
           gameState.scores += 15
       }
//If the ball hits the bottom edge of the Canvas we need to check whether it hits the paddle . if yes, then it bounces off just like you'd expect; if not then the game is over as before.
        if (isRoofCollision(bonus)) bonus.vy = -bonus.vy 
        if (isBottomCollision(bonus)) bonus.isVisible = false
    }

    const wallDir = isWallCollision(ball)
    if (wallDir === direction.left && ball.vx > 0) {
        ball.vx = -ball.vx
    } else if (wallDir === direction.right && ball.vx < 0) {
        ball.vx = -ball.vx
    }

    const playerDir = isPlayerCollision(ball)
    if (playerDir === direction.left && ball.vx > 0) {
        ball.vx = -ball.vx
    } else if (playerDir === direction.right && ball.vx < 0) {
        ball.vx = -ball.vx
    } else if (playerDir === direction.up && ball.vy > 0) {
        ball.vy = - ball.vy
        ball.vx += getBounceSpeed(ball) 
    }

    if (isRoofCollision(ball)) ball.vy = -ball.vy 
    if (isBottomCollision(ball)) gameState.isFail = true    
    

    if (gameState.lastTick - gameState.lastScoreInc >= 1000) {
        const ticks = Math.round((gameState.lastTick - gameState.lastScoreInc) / 1000);
        for (let i = 0; i < ticks; i++){
            gameState.scores++  
        } 
        gameState.lastScoreInc = gameState.lastTick;
    }

    if (gameState.lastTick - gameState.lastSpeedUp >= 30000) {
        ball.vx *= 1.1
        ball.vy *= 1.1
        gameState.lastSpeedUp = gameState.lastTick;
    }

    if (!gameState.bonus.isVisible 
        && gameState.lastTick - gameState.lastBonusSpawn >= 15000) {
        gameState.lastBonusSpawn = gameState.lastTick
        spawnBonus()
    }
}


function isPlayerCollision(obj) {
    const player = gameState.player

    const leftSide = player.x - player.width / 2
    const rightSide = player.x + player.width / 2

    if (obj.y + obj.radius < canvas.height - player.height
         || (obj.x + obj.radius < leftSide
         && obj.x - obj.radius < rightSide))
         return direction.none         

    if (obj.x + obj.radius >= leftSide && obj.x < leftSide) return direction.left 
    else if (obj.x - obj.radius <= rightSide && obj.x > rightSide) return direction.right
    else if (obj.x >= leftSide && obj.x <= rightSide) return direction.up
    else return direction.none
}

function isWallCollision(obj) {
    if (obj.x <= 0 + obj.radius) return direction.right
    else if (obj.x >= canvas.width - obj.radius) return direction.left
    else return direction.none
}

function isRoofCollision(obj) {
    return obj.y <= 0 + obj.radius;
}

function isBottomCollision(obj) {
    return obj.y + obj.radius >= canvas.height
}

function getBounceSpeed(ball) {
    return (ball.x - gameState.player.x) / 20;
}

function spawnBonus() {
    const bonus = gameState.bonus

    bonus.isVisible = true
    bonus.vy = 0
    bonus.vx = 4 - Math.random() * 8
    bonus.x = canvas.width / 5 + Math.random() * (canvas.width * 3/5)
    bonus.y = canvas.height / 5
}

function run(tFrame) {
    gameState.stopCycle = window.requestAnimationFrame(run);

    const nextTick = gameState.lastTick + gameState.tickLength;
    let numTicks = 0;

    if (tFrame > nextTick) {
        const timeSinceTick = tFrame - gameState.lastTick;
        numTicks = Math.floor(timeSinceTick / gameState.tickLength);
    }
    queueUpdates(numTicks);
    draw(tFrame);
    gameState.lastRender = tFrame;
}

function stopGame(handle) {
    window.cancelAnimationFrame(handle);
}

function drawPlatform(context) {
    const {x, y, width, height, color} = gameState.player;
    context.beginPath();
    context.rect(x - width / 2, y - height / 2, width, height);
    context.fillStyle = color;
    context.fill();
    context.closePath();
}

function drawBall(context) {
    const {x, y, radius, vx, vy, color} = gameState.ball;
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.fillStyle = color;
    context.fill();
    context.closePath();
}

function drawBonus(context) {
    if (!gameState.bonus.isVisible) return

    const {x, y, vx, vy, color} = gameState.bonus;

    context.fillStyle = color;
    context.font = "96px Calibri";
    context.textAlign = "center";
    context.fillText("+", x, y + 28)
}

function drawFailScreen(context) {
    if (gameState.isFail) {
        context.fillStyle = "#FF0000";
        context.font = "48px Calibri";
        context.textAlign = "center";
        context.fillText("GAME OVER!", canvas.width / 2, canvas.height / 2)
       
        context.font = "40px Calibri";        
        context.fillText("You scores: " + gameState.scores, canvas.width / 2, canvas.height / 2 + 56)    
    }
}

function drawScores(context) {
    if (!gameState.isFail) {
        context.fillStyle = "#000000";
        context.font = "28px Calibri";
        context.textAlign = "left";
        context.fillText("Scores: " + gameState.scores, 32, 32)
    }
}

function setup() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    canvas.addEventListener('mousemove', onMouseMove, false);

    gameState.lastTick = performance.now();
    gameState.lastRender = gameState.lastTick;
    gameState.lastScoreInc = gameState.lastTick;
    gameState.lastSpeedUp = gameState.lastTick;
    gameState.lastBonusSpawn = gameState.lastTick;
    gameState.tickLength = 15; //ms
    gameState.isFail = false;
    gameState.scores = 0;

    const platform = {
        width: 400,
        height: 50,
    };

    gameState.player = {
        color: '#FF0000',
        x: canvas.width / 2 - platform.width / 2,
        y: canvas.height - platform.height / 2,
        width: platform.width,
        height: platform.height
    };
    gameState.pointer = {
        x: canvas.width / 2,
        y: 0,
    };
    gameState.ball = {
        color: '#00FF00',
        x: canvas.width / 2,
        y: 25,
        radius: 25,
        vx: 5 - Math.round(Math.random(1) * 10),
        vy: 10
    };
    gameState.bonus = {
        color: '#ffd600',
        isVisible: false,
        x: canvas.width / 2,
        y: 25,
        radius: 25,
        vx: 0,
        vy: 0
    };


}

setup();
run();
