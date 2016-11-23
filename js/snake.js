var snakeBeginSize = 3;
var cellSize = 5;
var player = [];
var gridWidth;
var gridHeight;
var food;

function startGame() {
	game.initializeGrid();
	gridWidth = game.gWidth;
	gridHeight = game.gHeight;
	player = new snake((game.gWidth / 2) * cellSize + 3, (game.gHeight / 2) * cellSize + 3);
    game.start();
}

var game = {
    canvas : document.createElement("canvas"),
    start : function() {
		this.canvas.style = "height: 99%; width: 100%; border: 1px solid black";
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
		generateFood();
		this.interval = setInterval(updateSnake, 150); 
		window.addEventListener('keypress', function (e) {
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
	}
}

function circle(x, y, isFilled) {
	this.x = x;
	this.y = y;
	game.context.beginPath();
	game.context.arc(x, y, 2, 0, 2 * Math.PI);
	// make it dense
	for (var i = 0; i < 5; i++) {
	if (isFilled) {
		game.context.fillStyle = "black";
		game.context.fill();
	} else {
		game.context.strokeStyle = "black";
		game.context.stroke();
	}}
	this.clear = function() {	
		game.context.fillStyle = "white";
		game.context.fillRect(this.x - 3, this.y - 3, 5, 5);
	}
}

function snake(headX, headY) {
	this.size = snakeBeginSize - 1;
	this.head = new circle(headX, headY, true);
	this.body = [];
	this.direction = "r";
	
	this.move = function() {
		var futureHeadX = this.head.x;
		var futureHeadY = this.head.y;
		switch (this.direction) {
		case "u":
			futureHeadY = (this.head.y == 3) ? (gridHeight * 5 - 2) : (this.head.y - 5) % (gridHeight * 5);
			break;
		case "d":
			futureHeadY = (this.head.y + 5) % (gridHeight * 5);
			break;
		case "l":
			futureHeadX = (this.head.x == 3) ? (gridWidth * 5 - 2) : (this.head.x - 5) % (gridWidth * 5);
			break;
		case "r":
			futureHeadX = (this.head.x + 5) % (gridWidth * 5);
		}
		
		if (this.isOn(futureHeadX, futureHeadY)) {
			clearInterval(game.interval);
			return;
		}
		
		if (futureHeadX != food.x || futureHeadY != food.y) {
			this.body[this.size - 1].clear();
		} else {
			this.body[this.size] = new circle(this.body[this.size - 1].x, this.body[this.size - 1].y, true);
			this.size++;
			generateFood();
		}
		for (var i = this.size - 1; i > 0; i--) {
			this.body[i].x = this.body[i - 1].x;
			this.body[i].y = this.body[i - 1].y;
		}
		this.body[0].x = this.head.x;
		this.body[0].y = this.head.y;
		
		this.head = new circle(futureHeadX, futureHeadY, true);
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
		
		this.body[i] = new circle(this.head.x - ((i + 1) * cellSize), this.head.y, true);
	}
	
}

function generateFood() {
	var foodX, foodY;
	do {
		foodX = (Math.floor(Math.random() * gridWidth) * 5) + 3;
		foodY = (Math.floor(Math.random() * gridHeight) * 5) + 3;
	} while (player.isOn(foodX, foodY));
	food = new circle(foodX, foodY, false);
}

function updateSnake() {
	player.move();
}

