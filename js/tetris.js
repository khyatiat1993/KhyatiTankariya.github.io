
const canvas=document.getElementById('board');
const ctx=canvas.getContext('2d');
const scoreEl=document.getElementById('score');
const COLS=10, ROWS=20, SIZE=30;
let board,score,dropCounter,lastTime,piece;

const SHAPES=[
[[1,1,1,1]],
[[1,1],[1,1]],
[[0,1,0],[1,1,1]],
[[1,1,0],[0,1,1]],
[[0,1,1],[1,1,0]],
[[1,0,0],[1,1,1]],
[[0,0,1],[1,1,1]]
];

function resetGame(){
board=Array.from({length:ROWS},()=>Array(COLS).fill(0));
score=0; scoreEl.textContent=score;
piece=newPiece();
dropCounter=0; lastTime=0;
requestAnimationFrame(update);
}

function newPiece(){
const m=JSON.parse(JSON.stringify(SHAPES[Math.floor(Math.random()*SHAPES.length)]));
return {x:3,y:0,matrix:m};
}

function drawCell(x,y,c="#0ff"){
ctx.fillStyle=c;
ctx.fillRect(x*SIZE,y*SIZE,SIZE-1,SIZE-1);
}

function draw(){
ctx.clearRect(0,0,canvas.width,canvas.height);
board.forEach((row,y)=>row.forEach((v,x)=>v&&drawCell(x,y)));
piece.matrix.forEach((row,y)=>row.forEach((v,x)=>v&&drawCell(piece.x+x,piece.y+y,"#f0f")));
}

function collide(){
for(let y=0;y<piece.matrix.length;y++){
for(let x=0;x<piece.matrix[y].length;x++){
if(piece.matrix[y][x]){
let nx=piece.x+x, ny=piece.y+y;
if(nx<0||nx>=COLS||ny>=ROWS||(ny>=0&&board[ny][nx])) return true;
}}}
return false;
}

function merge(){
piece.matrix.forEach((row,y)=>row.forEach((v,x)=>{
if(v) board[piece.y+y][piece.x+x]=1;
}));
}

function clearLines(){
let lines=0;
outer: for(let y=ROWS-1;y>=0;y--){
for(let x=0;x<COLS;x++) if(!board[y][x]) continue outer;
board.splice(y,1);
board.unshift(Array(COLS).fill(0));
lines++; y++;
}
score+=lines*100;
scoreEl.textContent=score;
}

function rotate(){
const m=piece.matrix;
const r=m[0].map((_,i)=>m.map(row=>row[i]).reverse());
const old=m.slice();
piece.matrix=r;
if(collide()) piece.matrix=old;
}

function drop(){
piece.y++;
if(collide()){
piece.y--;
merge();
clearLines();
piece=newPiece();
if(collide()){
alert("Game Over! Score: "+score);
resetGame();
}
}
dropCounter=0;
}

function update(time=0){
const delta=time-lastTime; lastTime=time;
dropCounter+=delta;
if(dropCounter>700) drop();
draw();
requestAnimationFrame(update);
}

document.addEventListener('keydown',e=>{
if(!piece) return;
if(e.key==="ArrowLeft"){piece.x--; if(collide()) piece.x++;}
if(e.key==="ArrowRight"){piece.x++; if(collide()) piece.x--;}
if(e.key==="ArrowDown") drop();
if(e.key==="ArrowUp") rotate();
});

document.getElementById('start').onclick=resetGame;
