let board;

let boardWidth = 1200;
let boardHeight = 700;

let context;

let chartCanvas;
let chartContext;
let chart;
let postionDataX = [];
let postionDataY = [];

let timestampLastData;
let dataAddInterval = 250;

const perfectFrameTime = 1000 / 60;
let deltaTime = 0;
let lastTimestamp = 0;
let gameOver = false;
let win = false;
let player;
let levelManager;
let enemies = new Set();


let mousePos = {x:0,y:0}

window.onload = function() {

    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");
    


    levelManager = new LevelManager();
    document.addEventListener("keyup", checkInputs);

    setUpCharts();

    requestAnimationFrame(startLevel);

}




function startLevel(timestamp){
    player = new Player();
    enemies.clear();
    levelManager.loadLevelList1();
    levelManager.startLevel();
    lastTimestamp = timestamp;
    gameOver = false;
    win = false;
    requestAnimationFrame(gameLoop);
}


function gameLoop(timestamp){
    if(!gameOver){
        requestAnimationFrame(gameLoop);
        deltaTime = (timestamp - lastTimestamp) / perfectFrameTime;
        lastTimestamp = timestamp;

        update();
        draw();
    } else {
        onGameOver();
        cleanUpPostGame();
    }
    
}


function update(){
    checkAddDataValueInterval();
    levelManager.update();
    player.update();
    for(let e of enemies.values()){
        e.update();
    }
}

function draw(){
    context.clearRect(0, 0, board.width, board.height);
    player.draw();
    for(let e of enemies.values()){
        e.draw();
    }
}

function onGameOver(){
    if(win){
        context.fillStyle = "gold";
        context.font = "38px sans-serif";
        context.fillText("You Win!", boardWidth/2-80, boardHeight/2);
        context.font = "20px sans-serif";
        context.fillText("Press Space To Continue", boardWidth/2-110, boardHeight/2 + 40);
    } else {
        context.fillStyle = "black";
        context.font = "38px sans-serif";
        context.fillText("Game Over", boardWidth/2-80, boardHeight/2);
        context.font = "20px sans-serif";
        context.fillText("Press Space To Continue", boardWidth/2-100, boardHeight/2 + 40);
    }
    

}

function cleanUpPostGame(){
    enemies.clear();
}


// Source - https://stackoverflow.com/a/17130415
// Posted by user1693593, modified by community. See post 'Timeline' for change history
// Retrieved 2026-04-27, License - CC BY-SA 4.0

function updateMousePosition(evt) {
  var rect = board.getBoundingClientRect();
  
    mousePos.x = evt.clientX - rect.left;
    mousePos.y = evt.clientY - rect.top;
  
}

function checkInputs(e){
    if(e.code == "Space" && gameOver){
        requestAnimationFrame(startLevel);
    }
}

function collision(a, b){
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}



class Player{
    constructor(){
        this.x = boardWidth/2;
        this.y = boardHeight/2;

        this.width = 20;
        this.height = 30;

        this.speed = 8;

        this.lifes = 3;
    }


    draw(){
        context.fillStyle = "yellow";
        context.fillRect(this.x, this.y, this.width, this.height);
    }


    update(){
        for(let e of enemies.values()){
            if(e.deadly && collision(this, e)){
                gameOver = true;
            }
        }
        
       
        let dX = mousePos.x - this.x-(this.width/2);
        let dY = mousePos.y - this.y-(this.height/2);

        if(Math.abs(dX)+Math.abs(dY) < 10) {return;}
        
        let direction = normalizeVector(dX, dY);
    
        this.x += direction.x * this.speed * deltaTime;
        this.y += direction.y * this.speed * deltaTime;

    }

}


class Enemy{
    constructor(x, y, width, height){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.deadly = true;
    }

    draw(){

    }

    update(){

    }
    
}

class BounceEnemy extends Enemy{

    constructor(x, y, dirX, dirY){
        super(x, y, 20, 20);

        this.speed = 8;
        this.bounces = 0;
        this.maxBounce = 12;
        if(dirX == 0 && dirY == 0){
            dirX = Math.random() - 0.5;
            dirY = Math.random() - 0.5;
        }

        this.direction = normalizeVector(dirX, dirY);
    }

    draw(){
        context.fillStyle = "blue";
        context.fillRect(this.x, this.y, this.width, this.height);
    }

    update(){

        this.x += this.direction.x * this.speed * deltaTime;
        this.y += this.direction.y * this.speed * deltaTime;

        if(this.x <= 0 || this.x + this.width > boardWidth){
            this.direction.x*=-1;
            this.x += this.direction.x * this.speed * deltaTime;
            this.bounces += 1;
        }

        if(this.y <= 0 || this.y + this.height > boardHeight){
            this.direction.y*=-1;
            this.y += this.direction.y * this.speed * deltaTime;
            this.bounces += 1;
        }

        if(this.bounces > this.maxBounce){
            enemies.delete(this);
        }

    }

}

class RotatingEnemy extends Enemy {

    constructor(x, y, biasX, biasY, rotation){
        super(x, y, 20, 20);

        this.biasX = biasX;
        this.biasY = biasY;

        this.phase = 0;
        this.phaseSpeed = 5;

        this.speed = 8;
        this.rotation=rotation;


    }

    draw(){
        context.fillStyle = "green";
        context.fillRect(this.x, this.y, this.width, this.height);
    }

    update(){
        this.x += (Math.sin(this.phase/180*Math.PI + (Math.PI*this.rotation))+this.biasX) * this.speed * deltaTime ;
        this.y += (Math.cos(this.phase/180*Math.PI)+this.biasY) * this.speed * deltaTime;

        this.phase += this.phaseSpeed*deltaTime;

        
        if(this.biasX>0){
            if(this.x>boardWidth){
                enemies.delete(this);
            }
        } else {
            if(this.x<0){
                enemies.delete(this);
            }
        }
        if(this.biasY>0){
            if(this.y>boardHeight){
                enemies.delete(this);
            }
        } else if(this.biasY<0){
            if(this.y<0){
                enemies.delete(this);
            }
        }

    }

}

class MouseBoundEnemy extends Enemy{
    constructor(x, y){
        super(x, y, 20, 20);
        this.speed = 3;
    }

    draw(){
        context.fillStyle = "purple";
        context.fillRect(this.x, this.y, this.width, this.height);
    }

    update(){
       
        let dX = mousePos.x - this.x-(this.width/2);
        let dY = mousePos.y - this.y-(this.height/2);

        if(Math.abs(dX)+Math.abs(dY) < 10) {return;}
        
        let direction = normalizeVector(dX, dY);
    
        this.x += direction.x * this.speed * deltaTime;
        this.y += direction.y * this.speed * deltaTime;

    }

}



class Laser extends Enemy{
    constructor(x, y, width, height){
        super(x, y, width, height);
        this.birthTime = -1;
        this.chargeTime = 2000;
        this.activeTime = 500;
        this.alpha = 0;
        this.deadly = false;
        this.color = "red";
    }

    draw(){
        context.globalAlpha = this.alpha;
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.width, this.height);
        context.globalAlpha = 1.0;
    }

    update(){
        if(this.birthTime==-1){
            this.birthTime=Date.now();
        }
        let timeElapsed = Date.now()-this.birthTime;
        this.alpha = timeElapsed/ this.chargeTime / 2;
        if(timeElapsed > this.chargeTime){
            this.deadly=true;
            this.color = "red";
            this.alpha = 1;
        }
        if(timeElapsed> this.chargeTime + this.activeTime){
            enemies.delete(this);
        }
    }

}

class HorizontalLaser extends Laser{
    constructor(y){
        super(-10, y, boardWidth+20, 40);
    }
}

class VerticalLaser extends Laser{
    constructor(x){
        super(x, -10, 40, boardHeight+20);
    }
}




function normalizeVector(x, y){
    let length = Math.sqrt(x*x+y*y);
    if(length==0){
        return {x:1, y:0};
    }
    return {x:x/length, y:y/length};
}


class LevelManager{
    constructor(){
        this.startTime = -1;
        this.levelLength = 104;
        this.iterator;
        this.currentObject;
        this.levelList = new Set();
    }

    startLevel(){
        this.startTime = Date.now();
        this.lastListIndex=0;
        this.iterator = this.levelList.values();
        this.currentObject = this.iterator.next().value;
        
    }

    update(){
        
        if(this.startTime==-1 || this.currentObject == undefined){return;}
        let timeElapsed = (Date.now() - this.startTime)/1000;

        if(timeElapsed > this.levelLength){
            gameOver=true;
            win=true;
            return;
        }
        
        while(this.currentObject.t <= timeElapsed){
            enemies.add(this.currentObject.obj);
            this.currentObject = this.iterator.next().value;
            if(this.currentObject == undefined){
                break;
            }
        }
            
            
            
    }


    loadLevelList1(){
        this.levelList.clear();


        
        this.levelList.add({t:1, obj:new BounceEnemy(100, 100, 0, 0)});
        this.levelList.add({t:1, obj:new BounceEnemy(boardWidth-100, 100, 0, 0)});
        this.levelList.add({t:1, obj:new BounceEnemy(100, boardHeight-100, 0, 0)});
        this.levelList.add({t:1, obj:new BounceEnemy(boardWidth-100, boardHeight-100, 0, 0)});

        this.levelList.add({t:5, obj:new HorizontalLaser(100)});
        this.levelList.add({t:5.5, obj:new HorizontalLaser(250)});
        this.levelList.add({t:6, obj:new HorizontalLaser(400)});
        this.levelList.add({t:6.5, obj:new HorizontalLaser(550)});

        this.levelList.add({t:9, obj:new VerticalLaser(200)});
        this.levelList.add({t:9.5, obj:new VerticalLaser(400)});
        this.levelList.add({t:10, obj:new VerticalLaser(600)});
        this.levelList.add({t:10.5, obj:new VerticalLaser(800)});
        this.levelList.add({t:11, obj:new VerticalLaser(1000)});

        this.levelList.add({t:16, obj:new RotatingEnemy(-100, 50, 0.25, 0.07, 0)});
        this.levelList.add({t:16, obj:new RotatingEnemy(boardWidth+100, boardHeight-100, -0.25, -0.07, 1)});

        this.levelList.add({t:30, obj:new MouseBoundEnemy(boardWidth-50, 50)});

        this.levelList.add({t:40, obj:new BounceEnemy(100, 100, 0, 0)});
        this.levelList.add({t:40, obj:new BounceEnemy(boardWidth-100, boardHeight-100, 0, 0)});

        this.levelList.add({t:44, obj:new RotatingEnemy(-100, 50, 0.25, 0.07, 0)});
        this.levelList.add({t:44, obj:new RotatingEnemy(boardWidth+100, boardHeight-100, -0.25, -0.07, 1)});

        this.levelList.add({t:48, obj:new HorizontalLaser(100)});
        this.levelList.add({t:48, obj:new HorizontalLaser(boardHeight-100)});
        this.levelList.add({t:48, obj:new VerticalLaser(100)});
        this.levelList.add({t:48, obj:new VerticalLaser(boardWidth-100)});

        this.levelList.add({t:52, obj:new BounceEnemy(boardWidth-100, 100, 0, 0)});
        this.levelList.add({t:52, obj:new BounceEnemy(100, boardHeight-100, 0, 0)});

        this.levelList.add({t:54, obj:new BounceEnemy(boardWidth/2, 100, 0, 0)});
        this.levelList.add({t:54, obj:new BounceEnemy(100, boardHeight/2, 0, 0)});

        this.levelList.add({t:56, obj:new BounceEnemy(100, 100, 0, 0)});
        this.levelList.add({t:56, obj:new BounceEnemy(boardWidth-100, boardHeight-100, 0, 0)});

        this.levelList.add({t:72, obj:new HorizontalLaser(100)});
        this.levelList.add({t:72, obj:new HorizontalLaser(250)});
        this.levelList.add({t:72, obj:new HorizontalLaser(400)});
        this.levelList.add({t:72, obj:new HorizontalLaser(550)});

        this.levelList.add({t:74, obj:new HorizontalLaser(25)});
        this.levelList.add({t:74, obj:new HorizontalLaser(175)});
        this.levelList.add({t:74, obj:new HorizontalLaser(325)});
        this.levelList.add({t:74, obj:new HorizontalLaser(475)});
        this.levelList.add({t:74, obj:new HorizontalLaser(625)});

        this.levelList.add({t:77, obj:new VerticalLaser(200)});
        this.levelList.add({t:77.5, obj:new VerticalLaser(400)});
        this.levelList.add({t:78, obj:new VerticalLaser(600)});
        this.levelList.add({t:78.5, obj:new VerticalLaser(800)});
        this.levelList.add({t:79, obj:new VerticalLaser(1000)});

        this.levelList.add({t:82, obj:new HorizontalLaser(25)});
        this.levelList.add({t:82, obj:new HorizontalLaser(90)});
        this.levelList.add({t:82, obj:new HorizontalLaser(155)});
        
        this.levelList.add({t:82, obj:new HorizontalLaser(495)});
        this.levelList.add({t:82, obj:new HorizontalLaser(560)});
        this.levelList.add({t:82, obj:new HorizontalLaser(625)});

        this.levelList.add({t:83.5, obj:new HorizontalLaser(250)});
        this.levelList.add({t:83.5, obj:new HorizontalLaser(312)});
        this.levelList.add({t:83.5, obj:new HorizontalLaser(375)});

        this.levelList.add({t:85, obj:new VerticalLaser(100)});
        this.levelList.add({t:85, obj:new HorizontalLaser(boardHeight-120)});

        this.levelList.add({t:86, obj:new VerticalLaser(500)});
        this.levelList.add({t:86, obj:new HorizontalLaser(300)});

        this.levelList.add({t:87, obj:new VerticalLaser(800)});
        this.levelList.add({t:87, obj:new HorizontalLaser(500)});

        this.levelList.add({t:88, obj:new VerticalLaser(1000)});
        this.levelList.add({t:88, obj:new HorizontalLaser(150)});

        this.levelList.add({t:89, obj:new VerticalLaser(300)});
        this.levelList.add({t:89, obj:new HorizontalLaser(300)});

        this.levelList.add({t:90, obj:new VerticalLaser(600)});
        this.levelList.add({t:90, obj:new HorizontalLaser(550)});

        this.levelList.add({t:91, obj:new VerticalLaser(800)});
        this.levelList.add({t:91, obj:new HorizontalLaser(320)});

        this.levelList.add({t:92, obj:new VerticalLaser(150)});
        this.levelList.add({t:92, obj:new HorizontalLaser(600)});

        this.levelList.add({t:93, obj:new VerticalLaser(900)});
        this.levelList.add({t:93, obj:new HorizontalLaser(270)});

        this.levelList.add({t:94, obj:new VerticalLaser(480)});
        this.levelList.add({t:94, obj:new HorizontalLaser(150)});

        this.levelList.add({t:96, obj:new VerticalLaser(Math.random()*(boardWidth-40))});
        this.levelList.add({t:96, obj:new HorizontalLaser(Math.random()*(boardHeight-40))});
        this.levelList.add({t:97, obj:new VerticalLaser(Math.random()*(boardWidth-40))});
        this.levelList.add({t:97, obj:new HorizontalLaser(Math.random()*(boardHeight-40))});
        this.levelList.add({t:98, obj:new VerticalLaser(Math.random()*(boardWidth-40))});
        this.levelList.add({t:98, obj:new HorizontalLaser(Math.random()*(boardHeight-40))});
        this.levelList.add({t:99, obj:new VerticalLaser(Math.random()*(boardWidth-40))});
        this.levelList.add({t:99, obj:new HorizontalLaser(Math.random()*(boardHeight-40))});
        this.levelList.add({t:100, obj:new VerticalLaser(Math.random()*(boardWidth-40))});
        this.levelList.add({t:100, obj:new HorizontalLaser(Math.random()*(boardHeight-40))});
        this.levelList.add({t:101, obj:new VerticalLaser(Math.random()*(boardWidth-40))});
        this.levelList.add({t:101, obj:new HorizontalLaser(Math.random()*(boardHeight-40))});
        
        
        
       
        
        
    }

}


//TP enemy
/*
this.levelList.add({t:1, obj:});

*/



function setUpCharts(){

    labels = [];
    for(let i=-10; i<=0; i+=0.25){
        labels.push(i.toString() + "s");
        postionDataX.push(0);
        postionDataY.push(0);
    }

    chartCanvas = document.getElementById("chartX");
    chartContext = chartCanvas.getContext("2d");
    chart = new Chart(chartContext,{
        type:"line",
        data: {
            labels: labels,
            datasets:[
                {
                    label: "X-Position",
                    data: postionDataX,
                },
                {
                    label: "Y-Position",
                    data: postionDataY,
                },
            ]
        },
        options:{
            animation: true,
            responisve: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    suggestedMin: 0,
                    suggestedMax: 1200
                }
            }
        }
    });

    timestampLastData = Date.now();
}


function addDataValue(){
    postionDataX.shift();
    postionDataY.shift();
    postionDataX.push(mousePos.x);
    postionDataY.push(mousePos.y);

    chart.data.datasets[0].data = postionDataX;
    chart.data.datasets[1].data = postionDataY;
    chart.update();
}

function checkAddDataValueInterval(){
    if(Date.now()-timestampLastData >= dataAddInterval){
        timestampLastData = Date.now();
        addDataValue();
    }

}
