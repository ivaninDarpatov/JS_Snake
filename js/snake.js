var snakeBeginSize = 3;
var cellSize = 5;
var speed = 3;
var highScore = 0;
var bonusInterval;

var player;
var food;

function initializeGame(food = false) {
	bonusInterval = 5;
	game.initializeGrid();
	player = new snake((game.gWidth / 2) * cellSize, (game.gHeight / 2) * cellSize);
	game.initialize(food);
}

var game = {
    canvas : document.createElement("canvas"),
	initialize: function(food) {
		this.canvas.id = "game_area";
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
		if (food) {
			generateFood();
		}
		updateScore();
	},
    start : function() {
		if (this.interval) {
			clearInterval(this.interval);
		}
		this.interval = setInterval(updateSnake, 300 / speed);
		window.addEventListener("keypress", function (e) {
            switch (e.keyCode) {
			case 37: 
				player.direction = "l";
				break;
			case 38:
				player.direction = "u";
				break;
			case 39:
				player.direction = "r";
				break;
			case 40:
				player.direction = "d";
			}
        })
	},
	initializeGrid: function() {
		// make sure the grid has equally sized (5x5) cells (no extra white pixels out of nowhere)
		var WHRatio = this.canvas.width / this.canvas.height;
		this.gWidth = this.canvas.width / cellSize; // number of available snake-square positions
		this.gHeight = this.gWidth / WHRatio;
		
        this.context = this.canvas.getContext("2d");
		this.context.fillStyle = "white";
		this.context.fillRect(0, 0, this.gWidth * 5, this.gHeight * 5);
	},
	updateInterval: function() {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = setInterval(updateSnake, 300 / speed);
		}
		updateScore();
	}	
}

function unit(x, y, isFilled) {
	this.special = isFilled;
	this.x = x;
	this.y = y;
	game.context.fillStyle = "black";
	game.context.fillRect(x, y, 5, 5);
	
	if (!isFilled) {
		game.context.fillStyle = "white";
		game.context.fillRect(x + 1, y + 1, 3, 3);
	}
	this.clear = function() {	
		game.context.fillStyle = "white";
		game.context.fillRect(this.x, this.y, 5, 5);
	}
}

function snake(headX, headY) {
	this.size = snakeBeginSize - 1;
	this.score = 0;
	this.head = new unit(headX, headY, true);
	this.body = [];
	this.direction = "r";
	
	this.move = function() {
		var futureHeadX = this.head.x;
		var futureHeadY = this.head.y;
		switch (this.direction) {
		case "u":
			futureHeadY = (this.head.y == 0) ? (game.gHeight * 5 - 5) : (this.head.y - 5) % (game.gHeight * 5);
			break;
		case "d":
			futureHeadY = (this.head.y + 5) % (game.gHeight * 5);
			break;
		case "l":
			futureHeadX = (this.head.x == 0) ? (game.gWidth * 5 - 5) : (this.head.x - 5) % (game.gWidth * 5);
			break;
		case "r":
			futureHeadX = (this.head.x + 5) % (game.gWidth * 5);
		}
		

		if (this.isOn(futureHeadX, futureHeadY)) {
			clearInterval(game.interval);
			var newHS = false;
			
			if (this.score > highScore) {
				highScore = this.score;
				newHS = true;
			}
			gameOver(newHS);
			return;
		}
		
		if (futureHeadX != food.x || futureHeadY != food.y) {
			this.body[this.size - 1].clear();
		} else {
			this.body[this.size] = new unit(this.body[this.size - 1].x, this.body[this.size - 1].y, true);
			this.size++;
			var addToScore = speed / 2;
			if (food.special) {
				addToScore *= 2;
			}
			this.score += addToScore;
			generateFood();
		}
		for (var i = this.size - 1; i > 0; i--) {
			this.body[i].x = this.body[i - 1].x;
			this.body[i].y = this.body[i - 1].y;
		}
		this.body[0].x = this.head.x;
		this.body[0].y = this.head.y;
		
		this.head = new unit(futureHeadX, futureHeadY, true);
		updateScore();
	}
	this.isOn = function(x, y) {
		for (var i = 0; i < this.size; i++) {
			if (this.body[i].x == x && this.body[i].y == y) {
				return true;
			}
		}
		return false;
	}
	
	for (var i = 0; i <= this.size - 1; i++) {
		
		this.body[i] = new unit(this.head.x - ((i + 1) * cellSize), this.head.y, true);
	}
	
}

function generateFood() {
	var special = false;
	if (player.size % bonusInterval == 0 && player.size > 2) {
		bonusInterval += player.size + 1;
		special = true;
	}
	
	var foodX, foodY;
	do {
		foodX = (Math.floor(Math.random() * game.gWidth) * 5);
		foodY = (Math.floor(Math.random() * game.gHeight) * 5);
	} while (player.isOn(foodX, foodY));
	food = new unit(foodX, foodY, special);
}

function updateSnake() {
	player.move();
}

function updateScore() {
	document.getElementById("score_container").innerHTML = "SCORE: " + player.score +
															"<br/>SPEED: " + speed +
															"<br/>NEXT BONUS: " + (bonusInterval + 1) +
															"<br/>SIZE: " + (player.size + 1);
}

function gameOver(newHS) {
	game.context.font = "30px Impact"; 
	game.context.textAlign = "center";
	var x = game.canvas.width / 2;
	var y = game.canvas.height / 2;
	game.context.fillText("GAME OVER", x, y);
	if (newHS) {
		game.context.font = "15px Arial";
		y += game.canvas.height / 10;
		game.context.fillText("new high score: " + highScore, x, y);
		
		var hsContainer = document.getElementById("hs_container");
		if (hsContainer.style.display == "block") {
			hsContainer.innerHTML = highScore;
		}
	}
}
//-------------------------------------------------------------------------------
function toggleMenu() {
	var paragraph = document.getElementById("menu_list");
	
	if (paragraph.style.display === "block" || paragraph.style.display === "") {
		paragraph.style.display = "none";
		document.getElementById("speeds_list").style.display = "none";
	} else {
		paragraph.style.display = "block";
	}
}

function startGame() {
	initializeGame(true);
	game.start();
}

function toggleShowSpeeds() {
	var paragraph = document.getElementById("speeds_list");
	
	if (paragraph.style.display === "block" || paragraph.style.display === "") {
		paragraph.style.display = "none";
	} else {
		paragraph.style.display = "block";
	}
}

function setSpeed(newSpeed) {
	speed = newSpeed;
	game.updateInterval();
}

function toggleSeeHighScore() {
	var container = document.getElementById("hs_container");
	
	if (container.style.display === "block" || container.style.display === "") {
		container.style.display = "none";
	} else {
		container.style.display = "block";
		container.innerHTML = highScore;
	}
}

window.onclick = function(e) {
	if (e.target.id != "high_score" && e.target.id != "hs_container") {
		document.getElementById("hs_container").style.display = "none";
	} 
}