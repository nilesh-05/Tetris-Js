const cvs = document.getElementById("tetris");
const ctx = cvs.getContext("2d");
const scoreElement = document.getElementById("score");

const row = 20;
const col = column = 10;
const sq = squareSize = 20;
const vacantBoxColor = "WHITE"; 

// draw a square
function drawSquare(x, y, color) {
	ctx.fillStyle = color;
	ctx.fillRect(x * sq, y * sq, sq, sq);

	ctx.strokeStyle = "BLACK";
	ctx.strokeRect(x * sq, y * sq, sq, sq);
}

// create the board

let board = [];
for (r = 0; r < row; r++) {
	board[r] = [];
	for (c = 0; c < col; c++) {
		board[r][c] = vacantBoxColor;
	}
}

// draw the board
function drawBoard() {
	for (r = 0; r < row; r++) {
		for (c = 0; c < col; c++) {
			drawSquare(c, r, board[r][c]);
		}
	}
}

drawBoard();

// the pieces and their colors

const PIECES = [
	[Z, "red"],
	[S, "green"],
	[T, "yellow"],
	[O, "blue"],
	[L, "purple"],
	[I, "cyan"],
	[J, "orange"]
];

// generate random pieces
function randomPiece() {
	let r = randomN = Math.floor(Math.random() * PIECES.length) // 0 -> 6
	return new Piece(PIECES[r][0], PIECES[r][1]);
}

let ran = randomPiece();
// The Object Piece
function Piece(tetromino, color) {
	this.tetromino = tetromino;
	this.color = color;

	this.tetrominoN = 0; 
	this.activeTetromino = this.tetromino[this.tetrominoN];
	this.x = 3;
	this.y = -2;
}

// fill function
Piece.prototype.fill = function (color) {
	for (r = 0; r < this.activeTetromino.length; r++) {
		for (c = 0; c < this.activeTetromino.length; c++) {
			if (this.activeTetromino[r][c]) {
				drawSquare(this.x + c, this.y + r, color);
			}
		}
	}
}

// draw a piece to the board
Piece.prototype.draw = function () {
	this.fill(this.color);
}

// undraw a piece
Piece.prototype.unDraw = function () {
	this.fill(vacantBoxColor);
}

// move Down the piece
Piece.prototype.moveDown = function () {
	if (!this.collision(0, 1, this.activeTetromino)) {
		this.unDraw();
		this.y++;
		this.draw();
	} else {
		this.lock();
		ran = randomPiece();
	}

}

// move Right the piece
Piece.prototype.moveRight = function () {
	if (!this.collision(1, 0, this.activeTetromino)) {
		this.unDraw();
		this.x++;
		this.draw();
	}
}

// move Left the piece
Piece.prototype.moveLeft = function () {
	if (!this.collision(-1, 0, this.activeTetromino)) {
		this.unDraw();
		this.x--;
		this.draw();
	}
}

// rotate the piece
Piece.prototype.rotate = function () {
	let nextPattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
	let kick = 0;

	if (this.collision(0, 0, nextPattern)) {
		if (this.x > col / 2) {
			// right wall touched
			kick = -1; 
		} else {
			//  left wall touched
			kick = 1; 
		}
	}

	if (!this.collision(kick, 0, nextPattern)) {
		this.unDraw();
		this.x += kick;
		this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length; 
		this.activeTetromino = this.tetromino[this.tetrominoN];
		this.draw();
	}
}

let score = 0;

Piece.prototype.lock = function () {
	for (r = 0; r < this.activeTetromino.length; r++) {
		for (c = 0; c < this.activeTetromino.length; c++) {
			//skip the empty squares
			if (!this.activeTetromino[r][c]) {
				continue;
			}
			// pieces to lock on top = game over
			if (this.y + r < 0) {
				alert("Game Over. Thank You 😄");
				// stop request animation frame
				gameOver = true;
				break;
			}
			// we lock the piece
			board[this.y + r][this.x + c] = this.color;
		}
	}
	// remove full rows
	for (r = 0; r < row; r++) {
		let isRowFull = true;
		for (c = 0; c < col; c++) {
			isRowFull = isRowFull && (board[r][c] != vacantBoxColor);
		}
		if (isRowFull) {
			// if the row is full
			// we move down all the rows above it
			for (y = r; y > 1; y--) {
				for (c = 0; c < col; c++) {
					board[y][c] = board[y - 1][c];
				}
			}
			// the top row board[0][..] has no row above it
			for (c = 0; c < col; c++) {
				board[0][c] = vacantBoxColor;
			}
			score += 10;
		}
	}
	// update the board
	drawBoard();

	// update the score
	scoreElement.innerHTML = score;
}

// collision fucntion
//the part where I personally took a lot of time 
Piece.prototype.collision = function (x, y, piece) {
	for (r = 0; r < piece.length; r++) {
		for (c = 0; c < piece.length; c++) {
			// if the square is empty, we skip it
			if (!piece[r][c]) {
				continue;
			}
			// coordinates of the piece after movement
			let newX = this.x + c + x;
			let newY = this.y + r + y;

			// conditions
			if (newX < 0 || newX >= col || newY >= row) {
				return true;
			}
			// skip newY < 0; board[-1] will crush our game
			if (newY < 0) {
				continue;
			}
			// check if there is a locked piece alrady in place
			if (board[newY][newX] != vacantBoxColor) {
				return true;
			}
		}
	}
	return false;
}

// CONTROL the piece

document.addEventListener("keydown", CONTROL);

function CONTROL(event) {
	if (event.keyCode == 37) {
		ran.moveLeft();
		dropStart = Date.now();
	} else if (event.keyCode == 38) {
		ran.rotate();
		dropStart = Date.now();
	} else if (event.keyCode == 39) {
		ran.moveRight();
		dropStart = Date.now();
	} else if (event.keyCode == 40) {
		ran.moveDown();
	}
}

// drop the piece every 1sec

let dropStart = Date.now();
let gameOver = false;
function drop() {
	let now = Date.now();
	let delta = now - dropStart;
	if (delta > 1000) {
		ran.moveDown();
		dropStart = Date.now();
	}
	if (!gameOver) {
		requestAnimationFrame(drop);
	}
}

drop();



















