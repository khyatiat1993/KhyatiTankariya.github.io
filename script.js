const canvas = document.querySelector("#tetris");
const ctx = canvas.getContext("2d");

const scoreEl = document.querySelector("#score");
const startBtn = document.querySelector("#startBtn");
const pauseBtn = document.querySelector("#pauseBtn");
const restartBtn = document.querySelector("#restartBtn");
const gameOverEl = document.querySelector("#gameOver");

ctx.scale(30, 30);

const ROWS = 20;
const COLS = 10;

const SHAPES = [
    [
        [0,1,0,0],
        [0,1,0,0],
        [0,1,0,0],
        [0,1,0,0]
    ],
    [
        [0,1,0],
        [0,1,0],
        [1,1,0]
    ],
    [
        [0,1,0],
        [0,1,0],
        [0,1,1]
    ],
    [
        [1,1,0],
        [0,1,1],
        [0,0,0]
    ],
    [
        [0,1,1],
        [1,1,0],
        [0,0,0]
    ],
    [
        [1,1,1],
        [0,1,0],
        [0,0,0]
    ],
    [
        [1,1],
        [1,1]
    ]
];

const COLORS = [
    "#111827",
    "#9b5fe0",
    "#16a4d8",
    "#60dbe8",
    "#8bd346",
    "#efdf48",
    "#f9a52c",
    "#d64e12"
];

const state = {
    grid: generateGrid(),
    score: 0,
    level: 1,
    gameOver: false,
    paused: true,
    currentPiece: null,
    nextPiece: null
};

let dropInterval = 500;
let dropCounter = 0;
let lastTime = 0;
let animationId = null;

function generateGrid() {

    return Array.from({ length: ROWS }, () =>
        Array(COLS).fill(0)
    );
}

function randomPieceObject() {

    const randomIndex = Math.floor(Math.random() * SHAPES.length);

    return {
        piece: SHAPES[randomIndex],
        colorIndex: randomIndex + 1,
        x: Math.floor(COLS / 2) - 1,
        y: 0
    };
}

function update(time = 0) {

    if(state.paused || state.gameOver) return;

    const deltaTime = time - lastTime;

    lastTime = time;

    dropCounter += deltaTime;

    if(dropCounter > dropInterval){

        moveDown();

        dropCounter = 0;
    }

    renderGame();

    animationId = requestAnimationFrame(update);
}

function renderGame() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid();

    drawGhostPiece();

    renderPiece(state.currentPiece);
}

function drawGrid() {

    for(let row = 0; row < ROWS; row++){

        for(let col = 0; col < COLS; col++){

            ctx.fillStyle = COLORS[state.grid[row][col]];

            ctx.fillRect(col, row, 1, 1);

            ctx.strokeStyle = "#1e293b";

            ctx.lineWidth = 0.03;

            ctx.strokeRect(col, row, 1, 1);
        }
    }
}

function renderPiece(pieceObj, ghost = false) {

    if(!pieceObj) return;

    const piece = pieceObj.piece;

    for(let row = 0; row < piece.length; row++){

        for(let col = 0; col < piece[row].length; col++){

            if(piece[row][col] === 1){

                ctx.fillStyle = ghost
                    ? "rgba(255,255,255,0.15)"
                    : COLORS[pieceObj.colorIndex];

                ctx.fillRect(
                    pieceObj.x + col,
                    pieceObj.y + row,
                    1,
                    1
                );

                ctx.strokeStyle = "#0f172a";

                ctx.strokeRect(
                    pieceObj.x + col,
                    pieceObj.y + row,
                    1,
                    1
                );
            }
        }
    }
}

function drawGhostPiece() {

    if(!state.currentPiece) return;

    const ghost = {
        ...state.currentPiece,
        y: state.currentPiece.y
    };

    while(!collision(ghost.x, ghost.y + 1, ghost.piece)){

        ghost.y++;
    }

    renderPiece(ghost, true);
}

function spawnPiece() {

    state.currentPiece = state.nextPiece || randomPieceObject();

    state.nextPiece = randomPieceObject();

    if(collision(
        state.currentPiece.x,
        state.currentPiece.y,
        state.currentPiece.piece
    )){
        gameOver();
    }
}

function moveDown() {

    if(!state.currentPiece){

        spawnPiece();

        return;
    }

    if(!collision(
        state.currentPiece.x,
        state.currentPiece.y + 1,
        state.currentPiece.piece
    )){

        state.currentPiece.y++;

    } else {

        mergePiece();

        clearLines();

        spawnPiece();
    }
}

function moveLeft() {

    if(!state.currentPiece) return;

    if(!collision(
        state.currentPiece.x - 1,
        state.currentPiece.y,
        state.currentPiece.piece
    )){
        state.currentPiece.x--;
    }

    renderGame();
}

function moveRight() {

    if(!state.currentPiece) return;

    if(!collision(
        state.currentPiece.x + 1,
        state.currentPiece.y,
        state.currentPiece.piece
    )){
        state.currentPiece.x++;
    }

    renderGame();
}

function hardDrop() {

    if(!state.currentPiece) return;

    while(!collision(
        state.currentPiece.x,
        state.currentPiece.y + 1,
        state.currentPiece.piece
    )){
        state.currentPiece.y++;
    }

    moveDown();
}

function rotatePiece() {

    if(!state.currentPiece) return;

    const piece = state.currentPiece.piece;

    const rotated = [];

    for(let row = 0; row < piece.length; row++){

        rotated.push([]);

        for(let col = 0; col < piece[row].length; col++){

            rotated[row].push(0);
        }
    }

    for(let row = 0; row < piece.length; row++){

        for(let col = 0; col < piece[row].length; col++){

            rotated[row][col] = piece[col][row];
        }
    }

    for(let row = 0; row < rotated.length; row++){

        rotated[row].reverse();
    }

    if(!collision(
        state.currentPiece.x,
        state.currentPiece.y,
        rotated
    )){
        state.currentPiece.piece = rotated;
    }

    renderGame();
}

function collision(x, y, piece) {

    for(let row = 0; row < piece.length; row++){

        for(let col = 0; col < piece[row].length; col++){

            if(piece[row][col] === 1){

                const newX = x + col;
                const newY = y + row;

                if(
                    newX < 0 ||
                    newX >= COLS ||
                    newY >= ROWS
                ){
                    return true;
                }

                if(
                    newY >= 0 &&
                    state.grid[newY][newX] > 0
                ){
                    return true;
                }
            }
        }
    }

    return false;
}

function mergePiece() {

    const piece = state.currentPiece.piece;

    for(let row = 0; row < piece.length; row++){

        for(let col = 0; col < piece[row].length; col++){

            if(piece[row][col] === 1){

                state.grid[
                    state.currentPiece.y + row
                ][
                    state.currentPiece.x + col
                ] = state.currentPiece.colorIndex;
            }
        }
    }
}

function clearLines() {

    let cleared = 0;

    for(let row = ROWS - 1; row >= 0; row--){

        if(state.grid[row].every(cell => cell > 0)){

            state.grid.splice(row, 1);

            state.grid.unshift(Array(COLS).fill(0));

            cleared++;

            row++;
        }
    }

    if(cleared > 0){

        const points = [0, 10, 30, 50, 100];

        state.score += points[cleared];

        scoreEl.innerText = `Score: ${state.score}`;

        increaseDifficulty();
    }
}

function increaseDifficulty() {

    state.level = Math.floor(state.score / 100) + 1;

    dropInterval = Math.max(
        100,
        500 - ((state.level - 1) * 40)
    );
}

function gameOver() {

    state.gameOver = true;

    state.paused = true;

    cancelAnimationFrame(animationId);

    gameOverEl.classList.remove("hidden");
}

function startGame() {

    if(state.gameOver){

        restartGame();

        return;
    }

    if(!state.currentPiece){

        spawnPiece();
    }

    state.paused = false;

    lastTime = performance.now();

    update();
}

function pauseGame() {

    state.paused = !state.paused;

    if(!state.paused){

        lastTime = performance.now();

        update();
    }
}

function restartGame() {

    state.grid = generateGrid();

    state.score = 0;

    state.level = 1;

    state.gameOver = false;

    state.paused = false;

    state.currentPiece = null;

    state.nextPiece = null;

    dropInterval = 500;

    scoreEl.innerText = "Score: 0";

    gameOverEl.classList.add("hidden");

    spawnPiece();

    lastTime = performance.now();

    update();
}

document.addEventListener("keydown", e => {

    if(state.paused || state.gameOver) return;

    switch(e.key){

        case "ArrowLeft":
        case "a":
            moveLeft();
            break;

        case "ArrowRight":
        case "d":
            moveRight();
            break;

        case "ArrowDown":
        case "s":
            moveDown();
            break;

        case "ArrowUp":
        case "w":
            rotatePiece();
            break;

        case " ":
            hardDrop();
            break;

        case "Escape":
            pauseGame();
            break;
    }
});

startBtn.addEventListener("click", startGame);

pauseBtn.addEventListener("click", pauseGame);

restartBtn.addEventListener("click", restartGame);

renderGame();
