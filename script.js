//board 
let tileSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = tileSize * columns; // 32 * 16
let boardHeight = tileSize * rows; // 32 * 16
let context;

let screenSize = 1;

//ship

let shipWidth = tileSize*2;   // Hitbox
let shipHeight = tileSize;

let shipX = tileSize * columns/2 - tileSize;  // Position
let shipY = tileSize * rows - tileSize*2;

let ship = {
    x : shipX,
    y : shipY,
    width : shipWidth,
    height : shipHeight
}

let shipImg;
let shipVelocityX = tileSize;  //ship moving speed

//alien

let alienArray = [];
let alienWidth = tileSize*2;
let alienHeight = tileSize;
let alienX = tileSize;
let alienY = tileSize;
let alienImg;

let alienRows = 2;
let alienColums = 3;
let alienCount = 0; //number of aliens to defeat
let alienVelocityX = 1; //alien speed

//bullets

let bulletArray = [];
let bulletVelocityY = -10 //bullet moving speed

let score = 0;
let levelText = "Level";
let levelNum = 1;
let gameOver = false;

window.onload = function() {
    board = document.getElementById("canvas");
    board.width = boardWidth * screenSize;
    board.height = boardWidth * screenSize;
    context = board.getContext("2d");

    //draw initial ship
    //context.fillStyle = "green";
    //context.fillRect(shipX, shipY, shipWidth, shipHeight);

    //load images
    shipImg = new Image();
    shipImg.src = "images/cannon.png";
    shipImg.onload = function() {
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    }

    alienImg = new Image();
    alienImg.src = "images/alien.png";
    createAliens();

    requestAnimationFrame(update);
    document.addEventListener("keydown", moveShip);
    document.addEventListener("keyup", function(e) {
        // On ne déclenche le tir que si la touche "Espace" est pressée
        if (e.code === "Space") {
            shoot(e);
        }
    });
    
    document.getElementById("shoot").addEventListener("click", shoot);
   


}

function drawGameOver() {
    let gameOver = document.getElementById("gameOver");
    gameOver.style.display = "unset";
  }

function update() {
    requestAnimationFrame(update);

    if (gameOver == true){
        drawGameOver();
        return;
    }

    

   

    context.clearRect(0, 0, board.width, board.height)

    //ship
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    //aliens
    for (let i = 0; i < alienArray.length; i++){
        let alien = alienArray[i];
        if (alien.alive) {
            alien.x += alienVelocityX;

            //if alien touches the borders
            if (alien.x + alien.width >= board.width || alien.x <= 0){
                alienVelocityX *= -1;
                alien.x += alienVelocityX*2;
                for (let j = 0; j < alienArray.length; j++) {
                    alienArray[j].y += alienHeight;
                }
            }

            //move all aliens up by one row
            
            context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);
           
            if (alien.y >= ship.y) {
                gameOver = true;
            }
        }
    }

    //bullet
    for (let i = 0; i < bulletArray.length; i++){
        let bullet = bulletArray[i];
        bullet.y += bulletVelocityY;
        context.fillStyle = "white"
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height)

        //bullets collision with aliens
        for (let j = 0; j < alienArray.length; j++) {
            let alien = alienArray[j];
            if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                bullet.used = true;
                alien.alive = false;
                alienCount--;
                score += 100;
            }
        }
    }

    //clear bullets
    while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y <0)) {
        bulletArray.shift(); //removes the first element of the array
    }

    //next level
    if (alienCount == 0) {

        alienColums = Math.min(alienColums + 1, columns/2 -2); //cap at 16/2 - 2 = 6
        alienRows =  Math.min(alienRows + 1, rows-4); //cap at 16-4 = 12
        alienVelocityX += 0.2; //increase the alien movement speed
        alienArray = [];
        bulletArray = [];
        levelNum += 1;
        createAliens();
    }

    //score
    context.fillStyle="white";
    context.font="16px Space_invaders";
    context.fillText(score, 5, 20);

    //level
    context.fillStyle="white";
    context.font="16px Space_invaders";
    context.fillText(levelText, 415, 20);
    context.fillText(levelNum, 480, 20);

}

function moveShip(e) {
    if (gameOver){
        return
    }
    if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
        ship.x -= shipVelocityX; //move left one tile
    }
    else if (e.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width) {
        ship.x += shipVelocityX; //move right one tile
    }
}

function createAliens() {
    for (let c = 0; c < alienColums; c++) {
        for (let r = 0; r < alienRows; r++){
            let alien = {
                img : alienImg,
                x : alienX + c*alienWidth,
                y : alienY + r*alienHeight,
                width : alienWidth,
                height : alienHeight,
                alive : true
            }
            alienArray.push(alien);
        }
    }
    alienCount = alienArray.length;
}


function shoot(e) {
    if (gameOver){
        return
    }

    if ((e.type == "keyup" && e.code == "Space") || e.type === "click") {
        //shoot
        let bullet = {
            x : ship.x + shipWidth*15/32,
            y : ship.y,
            width : tileSize/8,
            height : tileSize/2,
            used : false  // if used == true, bullet vanish
        }
        bulletArray.push(bullet);
    }

}


function moveShipLeft() {
    if ((ship.x - shipVelocityX >= 0)   ) {
        ship.x -= shipVelocityX; //move left one tile
    }
}

function moveShipRight() {
    if (ship.x + shipVelocityX + ship.width <= board.width) {
        ship.x += shipVelocityX; //move right one tile
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&  //a's top left corner doesn't reach top right corner
           a.x + a.width > b.x && //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach bottom left  corner
           a.y + a.height > b.y;  //a's bottom left corner doesn't reach top left  corner
}