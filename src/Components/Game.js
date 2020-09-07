import React, { Component } from 'react';
import wallImg from '../Assets/wall.png'
import pathImg from '../Assets/path.jpeg'
import playerImg from '../Assets/player.png'
import mirrorPlayerImg from '../Assets/mirrorPlayer.png'
import chestImg from '../Assets/chest.png'

class Game extends Component {
    playerWidth = 50
    playerHeight = 50
    intervalId = 0
    onKeyDown = this.onKeyDown.bind(this)
    state = {
      playerX: 100,
      playerY: 100,
      lastX: 0,
      lastY: 0,
      windowWidth: 1200,
      windowHeight: 1200,
      dimensions: 15,
      maxTunnels: 20,
      maxLength: 9,
      tileSize: 80,
      boxSize: 45,
      speed: 1,
      level: 1,
      score: 0
    };
    seconds = 0;
    minutes = 0;
    gameState = 1;
    grid;
    boxes = []
    boxNumber = 0
    fontName = 'Press Start 2P'
    startDate = new Date()
    wallObj = new Image()
    pathObj = new Image()
    friendObj = new Image()
    playerObj = new Image()
    chestObj = new Image()
    friends = this.props.topAnimals
    playerDirection = 1
    keysPressed = {
        65: false,
        87: false,
        68: false,
        83: false
    }
    detectAnyCollision() { 
      let rect1 = {
        x: this.state.playerX,
        y: this.state.playerY, 
        width: this.playerWidth,
        height: this.playerHeight
      }
      if (this.detectOutScreen(rect1)) {
          return true;
      }
      if (this.detectWall()) {
        return true;
      }
      if (this.detectBoxes()) {
        return true;
      }
      return false
    }

    update = () => {
      if (this.gameState === 1){
        this.startMenu()
      } else if(this.gameState === 2) {
        if(this.boxNumber <= 0) {
          this.createNewLevel()
        }
        this.draw()
        if(!this.detectAnyCollision()){
          var isPressed = false
          for(var key in this.keysPressed) {
            if(this.keysPressed[key] === true){
              isPressed = true
              if(this.state.speed >= 0 && this.state.speed < 2){
                this.playerSpeed(this.state.speed + 0.3)
              }
              switch(key) {
                  case '65': // Left
                      this.playerObj.src = mirrorPlayerImg
                      this.playerMoveX(-3);
                      break;
                  case '87': // Up
                      this.playerMoveY(-3);
                      break;
                  case '68': // Right
                      this.playerObj.src = playerImg
                      this.playerMoveX(3);
                      break;
                  case '83': // Down
                      this.playerMoveY(3);
                      break;
                  default:
                      break;
              }
            }
          } 
          if(!isPressed){
            if(this.state.speed >= -2){
              this.playerSpeed(0.2)
            }
          }
        }
      } else if(this.gameState === 3){
        this.gameOver()
      }
    }
    playerMoveX(x) {
      this.setState({
          lastX: this.state.playerX,
          playerX: this.state.playerX + (x * this.state.speed)
      });        
    }

    playerMoveY(y) {
      this.setState({
          lastY: this.state.playerY,
          playerY: this.state.playerY + (y * this.state.speed)
      });        
    }

    playerSpeed(x){
      this.setState({
        speed: x
      })
    }

    onKeyDown(e) {
        if(e.which in this.keysPressed){
            this.keysPressed[e.which] = true
        }
    }

    onKeyUp(e) {
        if(this.gameState === 1 && e.which === 13){
          this.startGame()
        }
        else if(e.which in this.keysPressed){
            this.keysPressed[e.which] = false
        }
    }
    detectOutScreen(rect1) {
      if (rect1.x < 0){
        this.playerMoveX(1)
        return true;
      } else if(rect1.x + rect1.width > this.state.windowWidth) {
        this.playerMoveX(-1)
        return true;
      } else if (rect1.y < 0) {
        this.playerMoveY(1)
        return true;
      } else if(rect1.y + rect1.height > this.state.windowHeight) {
        this.playerMoveY(-1)
          return true;
      }
      return false;
    }

    detectWall() {
      for(var col=0; col < this.grid.length; col++){
        for(var row=0; row < this.grid[col].length; row++){
          if(this.grid[row][col] === 1){
            var tileX = row*this.state.tileSize;
            var tileY = col*this.state.tileSize;
            if(
                this.state.playerX + this.playerWidth >= tileX &&
                this.state.playerX <= tileX + this.state.tileSize &&
                this.state.playerY + this.playerHeight >= tileY && 
                this.state.playerY <= tileY + this.state.tileSize
              ){
                this.setState({
                  playerY: this.state.lastY,
                  playerX: this.state.lastX,
                  lastY: this.state.lastY,
                  lastX: this.state.lastX
              });
            }
          }
        }
      }
      return false
    }

    detectBoxes() {
      for(var box=0; box < this.boxes.length; box++){
        var tileX = this.boxes[box].x;
        var tileY = this.boxes[box].y;
        if(
            this.state.playerX + this.playerWidth >= tileX &&
            this.state.playerX <= tileX + this.state.boxSize &&
            this.state.playerY + this.playerHeight >= tileY && 
            this.state.playerY <= tileY + this.state.boxSize
          ){
            if(this.boxes[box].type === 'box') {
              this.boxNumber -= 1
              this.setState({
                score: this.state.score + 100
              });
            } else if(this.boxes[box].type === 'time') {
              this.startTime += 0.5*60000
            }
            this.boxes.splice(box, 1)
        }
      }
      return false
    }

    // Map creation
    createArray(num, dimensions) {
      var array = [];
      for (var i = 0; i < dimensions; i++) {
        array.push([]);
        for (var j = 0; j < dimensions; j++) {
          array[i].push(num);
        }        
      }
      return array;
    }

    createMap(){
      let dimensions = this.state.dimensions,
      maxTunnels = this.state.maxTunnels,
      maxLength = this.state.maxLength,
      map = this.createArray(1, dimensions),
      currentRow = Math.floor(Math.random() * dimensions),
      currentColumn = Math.floor(Math.random() * dimensions),
      directions = [[-1, 0], [1, 0], [0, -1], [0, 1]],
      lastDirection = [],
      randomDirection;
      while (maxTunnels && dimensions && maxLength) {
        do {
          randomDirection = directions[Math.floor(Math.random() * directions.length)];
        } while ((randomDirection[0] === -lastDirection[0] && randomDirection[1] === -lastDirection[1]) || (randomDirection[0] === lastDirection[0] && randomDirection[1] === lastDirection[1]));

        var randomLength = Math.ceil(Math.random() * maxLength),
          tunnelLength = 0;

        while (tunnelLength < randomLength) {
          if (((currentRow === 0) && (randomDirection[0] === -1)) ||
              ((currentColumn === 0) && (randomDirection[1] === -1)) ||
              ((currentRow === dimensions - 1) && (randomDirection[0] === 1)) ||
              ((currentColumn === dimensions - 1) && (randomDirection[1] === 1))) {
            break;
          } else {
            map[currentRow][currentColumn] = 0;
            currentRow += randomDirection[0];
            currentColumn += randomDirection[1];
            tunnelLength++;
          }
        }

        if (tunnelLength) {
          lastDirection = randomDirection;
          maxTunnels--;
        }
      }
      return map;
    }

    draw() {
      const ctx = this.refs.canvas.getContext("2d");
      ctx.clearRect(0, 0, this.state.windowWidth, this.state.windowHeight);
      ctx.fillStyle = "green";
      ctx.beginPath();
      ctx.fill();
      ctx.stroke();
      this.drawMap()
      this.drawPlayer()
      this.drawBoxes()
    }

    drawMap() {
      const ctx = this.refs.canvas.getContext("2d");
      const tileSize = this.state.tileSize
      ctx.fillStyle = "rgba(255,0,0,0.6)";
      const wallObj = this.wallObj
      const pathObj = this.pathObj
      this.grid.forEach(function(row,i){
        (row).forEach(function(tile,j){
          if(tile === 1){
            ctx.drawImage(wallObj, i * tileSize, j * tileSize, tileSize, tileSize);
          } else if(tile === 0) {
            ctx.drawImage(pathObj, i * tileSize, j * tileSize, tileSize, tileSize);
          }
        });
      });
    }

    drawBoxes(){
      const ctx = this.refs.canvas.getContext("2d");
      const boxSize = this.state.boxSize
      for(let i=0; i < this.boxes.length; i++) {
        if(this.boxes[i].type === 'box'){
          ctx.fillStyle = "#000000";
          ctx.drawImage(this.chestObj, this.boxes[i].x, this.boxes[i].y, boxSize, boxSize);
        } else {
          ctx.drawImage(this.friendObj, this.boxes[i].x, this.boxes[i].y, boxSize, boxSize);
        }
      }
    }

    drawPlayer(){
      const ctx = this.refs.canvas.getContext("2d");
      ctx.drawImage(this.playerObj, this.state.playerX, this.state.playerY, this.playerWidth, this.playerHeight);
    }

    randomFloorPosition(){
      let positionFound = false
      while(positionFound === false){
        let randomXValue = Math.floor(Math.random() * this.grid.length)
        let randomYValue = Math.floor(Math.random() * this.grid[randomXValue].length)
        if(this.grid[randomXValue][randomYValue] === 0){
          return {
            x: randomXValue * this.state.tileSize,
            y: randomYValue * this.state.tileSize
          }
        }
      }
    }

    createNewLevel() {
      this.setState({
        level: this.state.level+1
      });
      this.grid = this.createMap()      
      let position = this.randomFloorPosition()
      this.setState({
          playerX: position.x,
          playerY: position.y,
          lastX: position.x,
          lastY: position.y,
      });
      let positionsX = []
      let positionsY = []
      this.boxNumber = 5+this.state.level
      for(let i=0; i < this.boxNumber; i++) {
        let foundPosition = false
        while(!foundPosition){
          let position = this.randomFloorPosition()
          if(!positionsX.includes(position.x) && !positionsY.includes(position.y)) {
            this.boxes[i] = {
              x: position.x,
              y: position.y,
              type: 'box'
            }
            foundPosition = true
            positionsX.push(position.x)
            positionsY.push(position.y)
          } else {
            foundPosition = false
          }
        }
      }
      let foundPosition = false
      while(!foundPosition){
        let position = this.randomFloorPosition()
        if(!positionsX.includes(position.x) && !positionsY.includes(position.y)) {
          this.boxes.push({
            x: position.x,
            y: position.y,
            type: 'time'
          })
          foundPosition = true
          positionsX.push(position.x)
          positionsY.push(position.y)
        } else {
          foundPosition = false
        }
        const rand = Math.floor(Math.random() * Math.floor(29))
        this.friendObj.src = this.friends[rand].artwork.url
      }
    }
    
    timer() {
      var now = new Date().getTime()
      var distance = this.startTime - now
      this.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      this.seconds = Math.floor((distance % (1000 * 60)) / 1000);
      this.seconds = this.seconds > 9 ? "" + this.seconds: "0" + this.seconds;
      if(this.seconds <= 0 && this.minutes <= 0){
        this.gameState = 3;
      }
    }

    startMenu(){
      var ctx = this.refs.canvas.getContext("2d");
      ctx.clearRect(0, 0, this.state.windowWidth, this.state.windowHeight);
      ctx.drawImage(this.wallObj, 0, 0, this.state.windowWidth, this.state.windowHeight );
      ctx.font = `90px "${this.fontName}"`;
      ctx.fillText("Mine Rescue", 150, 500);
      ctx.font = `30px "${this.fontName}"`
      ctx.fillText("Press Enter to begin", 310, 600);
    }

    startGame(){
      this.grid = this.createMap()      
      this.intervalId = window.setInterval(this.update.bind(this), 33);
      this.intervalId = window.setInterval(this.timer.bind(this), 500);
      this.startTime = new Date().getTime() + 2*60000
      this.createNewLevel()
      this.gameState = 2;
      this.wallObj.src = wallImg
      this.pathObj.src = pathImg
      this.playerObj.src = playerImg
      this.chestObj.src = chestImg
    }

    gameOver(){
      var ctx = this.refs.canvas.getContext("2d");
      ctx.clearRect(0, 0, this.state.windowWidth, this.state.windowHeight);
      ctx.font = `90px "${this.fontName}"`;
      ctx.fillText("Game Over", 230, 500);
      ctx.font = `70px "${this.fontName}"`
      ctx.fillText("Score:" + this.state.score, 310, 600);
    }

    componentDidMount(){
      document.addEventListener("keydown", this.onKeyDown, false);
      document.addEventListener("keyup", this.onKeyUp.bind(this), false);
      this.wallObj.src = wallImg
      this.wallObj.onload = this.startMenu();
    }
  
    componentWillUnmount(){
      document.removeEventListener("keydown", this.onKeyDown);
      window.removeEventListener('resize', this.updateWindowDimensions);
      clearInterval(this.intervalId);
    }  
    render() { 
      return (
        <div data-tabindex="0">
            <p>Time : {this.minutes} : {this.seconds}</p>
            <p>Score : {this.state.score}</p>
            <canvas ref="canvas" style={{outline: "black 3px solid"}} width={this.state.windowWidth} height={this.state.windowHeight} />      
            <p>Controls : WASD</p>
        </div>
      )
  }
}
export default Game;