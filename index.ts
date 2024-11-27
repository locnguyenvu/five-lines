const TILE_SIZE = 30;
const FPS = 30;
const SLEEP = 1000 / FPS;

enum RawTile {
  AIR,
  FLUX,
  UNBREAKABLE,
  PLAYER,
  STONE, FALLING_STONE,
  BOX, FALLING_BOX,
  KEY1, LOCK1,
  KEY2, LOCK2,
}


interface FallingState {
  isFalling(): boolean;
  isResting(): boolean;
  moveHorizontal(tile: Tile, dx: number): void;
}

class Falling implements FallingState {
  isFalling(): boolean {
    return true;
  }
  isResting(): boolean {
    return false;
  }
  moveHorizontal(tile: Tile, dx: number) { return }
  
  
}
class Resting implements FallingState {
  isFalling(): boolean {
    return false;
  }
  isResting(): boolean {
    return true;
  }
  moveHorizontal(tile: Tile, dx: number) {
    if (map[playery][playerx + dx + dx].isAir() &&
        !map[playery + 1][playerx + dx].isAir()
      ) {
        map[playery][playerx + dx + dx] = tile;
        moveToTile(playerx + dx, playery);
      }
  }
}

const FALLING = new Falling();
const RESTING = new Resting();

class FallStrategy {
  constructor(
    private falling: FallingState
  ) {
    this.falling = falling;
  }
  update(tile: Tile, x: number, y: number) {
    this.falling = map[y + 1][x].isAir() ? FALLING : RESTING;
    this.drop(tile, x, y);
  }
  private drop(tile: Tile, x: number, y: number) {
    if (this.falling.isFalling()) {
      map[y + 1][x] = tile;
      map[y][x] = new Air();
    }
  }
  moveHorizontal(tile: Tile, dx: number) {
    this.falling.moveHorizontal(tile, dx);
  }
  isFalling() {
    return this.falling.isFalling();
  }
}

interface LockType {
  check(tile: Tile): boolean;
  isLock1(): boolean;
  isLock2(): boolean;
  color(): string;
  key_color(): string;
}

class LockType1 implements LockType {
  check(tile: Tile) {
    return tile.isLock1()
  }
  isLock1(): boolean {
    return true;
  }
  isLock2(): boolean {
    return false;
  }
  color(): string {
    return "#ffcc00";
  }
  key_color(): string {
    return "#ffcc00";
  }
}

class LockType2 implements LockType {
  check(tile: Tile) {
    return tile.isLock2()
  }
  isLock1(): boolean {
    return false;
  }
  isLock2(): boolean {
    return true;
  }
  color(): string {
    return "#00ccff";
  }
  key_color(): string {
    return "#00ccff";
  }
}

const LOCKTYPE1 = new LockType1();
const LOCKTYPE2 = new LockType2();

class RemoveStrategy {
  constructor(
    private lockType: LockType
  ) {
    this.lockType = lockType;
  }
  remove() {
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        if (this.lockType.check(map[y][x])) {
          map[y][x] = new Air();
        }
      }
    }
  }
  getLockType(): LockType {
    return this.lockType;
  }
}

interface Tile {
  isAir() : boolean;
  isLock1(): boolean;
  isLock2(): boolean;
  draw(g: CanvasRenderingContext2D, x: number, y: number): void;
  isPushable(): boolean;
  isEdible(): boolean;
  isStony(): boolean;
  isBoxy(): boolean;
  moveHorizontal(dx: number): void;
  moveVerticle(dy: number): void; 
  rest(): void;
  drop(): void;
  isFalling(): boolean;
  canFall(): boolean;
  update(x: number, y: number): void;
}

class Air implements Tile {
  isAir() { return true; }
  isLock1() { return false; }
  isLock2() { return false; }
  isStony() { return false; }
  isBoxy() { return false; }
  draw(g: CanvasRenderingContext2D, x: number, y: number) { return; }
  isPushable(): boolean {
    return false;
  }
  isEdible(): boolean {
    return true;
  }
  moveHorizontal(dx: number) {
    moveToTile(playerx + dx, playery);
  }
  moveVerticle(dy: number) {
    moveToTile(playerx, playery + dy);
  }
  rest() {}
  drop() {}
  isFalling(): boolean {
    return false;
  }
  canFall(): boolean { return false; }
  update(x: number, y: number) {}
}

class Flux implements Tile {
  isAir() { return false; }
  isLock1() { return false; }
  isLock2() { return false; }
  isStony() { return false; }
  isBoxy() { return false; }
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#ccffcc";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  isPushable(): boolean {
    return false;
  }
  isEdible(): boolean {
    return true;
  }
  moveHorizontal(dx: number) {
    moveToTile(playerx + dx, playery);
  }
  moveVerticle(dy: number) {
    moveToTile(playerx, playery + dy);
  }
  rest() {}
  drop() {}
  isFalling(): boolean {
    return false;
  }
  canFall(): boolean { return false; }
  update(x: number, y: number) {}
}

class Unbreakable implements Tile {
  isAir() { return false; }
  isLock1() { return false; }
  isLock2() { return false; }
  isStony() { return false; }
  isBoxy() { return false; }
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#999999";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  isPushable(): boolean {
    return false;
  }
  isEdible(): boolean {
    return false;
  }
  moveHorizontal(dx: number) { return; }
  moveVerticle(dy: number) { return; }
  rest() {}
  drop() {}
  isFalling(): boolean {
    return false;
  }
  canFall(): boolean { return false; }
  update(x: number, y: number) {}
}

class Player implements Tile {
  isAir() { return false; }
  isLock1() { return false; }
  isLock2() { return false; }
  isStony() { return false; }
  isBoxy() { return false; }
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    return;
  }
  isPushable(): boolean {
    return false;
  }
  isEdible(): boolean {
    return false;
  }
  moveHorizontal(dx: number) { return; }
  moveVerticle(dy: number) { return; }
  rest() {}
  drop() {}
  isFalling(): boolean {
    return false;
  }
  canFall(): boolean { return false; }
  update(x: number, y: number) {}
}

class Stone implements Tile {
  private fallStrategy: FallStrategy
  constructor(
    falling: FallingState
  ) {
    this.fallStrategy = new FallStrategy(falling);
  }
  isAir() { return false; }
  isLock1() { return false; }
  isLock2() { return false; }
  isStony() { return true; }
  isBoxy() { return false; }
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#0000cc";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  isPushable(): boolean {
    return false;
  }
  isEdible(): boolean {
    return false;
  }
  moveHorizontal(dx: number) {
    this.fallStrategy.moveHorizontal(this, dx);
  }
  moveVerticle(dy: number) { return; }
  rest() { 
    this.fallStrategy = new FallStrategy(RESTING);
  }
  drop() {
    this.fallStrategy = new FallStrategy(FALLING);
  }
  isFalling(): boolean {
    return this.fallStrategy.isFalling();
  }
  canFall(): boolean { return true; }
  update(x: number, y: number) {
    this.fallStrategy.update(this, x, y);
  }
}

class Box implements Tile {
  private fallingStrategy;
  constructor(
    private falling: FallingState
  ) {
    this.falling = falling;
    this.fallingStrategy = new FallStrategy(falling);
  }
  isAir() { return false; }
  isLock1() { return false; }
  isLock2() { return false; }
  isStony() { return false; }
  isBoxy() { return true; }
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#8b4513";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  isPushable(): boolean {
    return false;
  }
  isEdible(): boolean {
    return false;
  }
  moveHorizontal(dx: number) {
    this.fallingStrategy.moveHorizontal(this, dx);
  }
  moveVerticle(dy: number) { return; }
  rest() { 
    this.fallingStrategy = new FallStrategy(RESTING);
  }
  drop() { 
    this.fallingStrategy = new FallStrategy(FALLING);
  }
  isFalling(): boolean {
    return this.fallingStrategy.isFalling();
  }
  canFall(): boolean { return true; }
  update(x: number, y: number) {
    this.fallingStrategy.update(this, x, y);
  }
}


class Key_ implements Tile {
  private removeStrategy: RemoveStrategy
  constructor(private lockType: LockType) {
    this.removeStrategy = new RemoveStrategy(lockType);
  }
  isAir() { return false; }
  isLock1() { return false; }
  isLock2() { return false; }
  isStony() { return false; }
  isBoxy() { return false; }
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = this.lockType.key_color();
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    return; 
  }
  isPushable(): boolean {
    return false;
  }
  isEdible(): boolean {
    return false;
  }
  moveHorizontal(dx: number) {
    this.removeStrategy.remove();
    moveToTile(playerx + dx, playery);
  }
  moveVerticle(dy: number) {
    this.removeStrategy.remove();
    moveToTile(playerx, playery + dy);
  }
  rest() {}
  drop() {}
  isFalling(): boolean {
    return false;
  }
  canFall(): boolean { return false; }
  update(x: number, y: number) {}
}


class Lock_ implements Tile {
  constructor(
    private ltype: LockType
  ) {
    this.ltype = ltype
  }
  isAir() { return false; }
  isLock1() { return this.ltype.isLock1(); }
  isLock2() {  return this.ltype.isLock2(); }
  isStony() { return false; }
  isBoxy() { return false; }
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = this.ltype.color();
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  isPushable(): boolean {
    return false;
  }
  isEdible(): boolean {
    return false;
  }
  moveHorizontal(dx: number) { return; }
  moveVerticle(dy: number) { return; }
  rest() {}
  drop() {}
  isFalling(): boolean {
    return false;
  }
  canFall(): boolean { return false; }
  update(x: number, y: number) {}
}


interface Input {
  handle(): void;
}

class KeyUp implements Input {
  handle() {
    map[playery - 1][playerx].moveVerticle(-1);
  }
}

class KeyDown implements Input {
  handle() {
    map[playery + 1][playerx].moveVerticle(1);
  }
}

class KeyLeft implements Input {
  handle() {
    map[playery][playerx - 1].moveHorizontal(-1);
  }
}

class KeyRight implements Input {
  handle() {
    map[playery][playerx + 1].moveHorizontal(1);
  }
}

let playerx = 1;
let playery = 1;
let rawMap: RawTile[][] = [
  [2, 2, 2, 2, 2, 2, 2, 2],
  [2, 3, 0, 1, 1, 2, 0, 2],
  [2, 4, 2, 6, 1, 2, 0, 2],
  [2, 8, 4, 1, 1, 2, 0, 2],
  [2, 4, 1, 1, 1, 9, 0, 2],
  [2, 2, 2, 2, 2, 2, 2, 2],
];
let map: Tile[][];

function assertExhausted(x: never): never {
    throw new Error("Unexpected object: " + x);
}

function transformTile(tile: RawTile) {
    switch (tile) {
        case RawTile.AIR: return new Air();
        case RawTile.PLAYER: return new Player();
        case RawTile.UNBREAKABLE: return new Unbreakable();
        case RawTile.STONE: return new Stone(RESTING);
        case RawTile.FALLING_STONE: return new Stone(FALLING);
        case RawTile.BOX: return new Box(RESTING);
        case RawTile.FALLING_BOX: return new Box(FALLING);
        case RawTile.FLUX: return new Flux();
        case RawTile.KEY1: return new Key_(LOCKTYPE1);
        case RawTile.LOCK1: return new Lock_(LOCKTYPE1);
        case RawTile.KEY2: return new Key_(LOCKTYPE2);
        case RawTile.LOCK2: return new Lock_(LOCKTYPE2);
        default: assertExhausted(tile);
    }
}

function transformMap() {
    map = new Array(rawMap.length);
    for (let y = 0; y < rawMap.length; y++) {
        map[y] = new Array(rawMap[y].length);
        for (let x = 0; x < rawMap[y].length; x++) {
            map[y][x] = transformTile(rawMap[y][x])
        }
    }
}

let inputs: Input[] = [];


function moveToTile(newx: number, newy: number) {
  map[playery][playerx] = new Air();
  map[newy][newx] = new Player();
  playerx = newx;
  playery = newy;
}


function update() {
  handleInputs()
  updateMap()
}

function handleInputs() {
  while (inputs.length > 0) {
    let current = inputs.pop();
    current.handle()
  }
}

function updateMap() {
  for (let y = map.length - 1; y >= 0; y--) {
    for (let x = 0; x < map[y].length; x++) {
      updateTile(x, y)
    }
  }
}


function updateTile(x: number, y: number) {
  map[y][x].update(x, y);
}

function draw() {
  let g = createGraphics();
  drawMap(g);
  drawPlayer(g);
}


function createGraphics() {
  let canvas = document.getElementById("GameCanvas") as HTMLCanvasElement;
  let g = canvas.getContext("2d");

  g.clearRect(0, 0, canvas.width, canvas.height);
  return g;
}

function drawMap(g: CanvasRenderingContext2D) {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      map[y][x].draw(g, x, y);
    }
  }
}

function drawPlayer(g: CanvasRenderingContext2D) {
  g.fillStyle = "#ff0000";
  g.fillRect(playerx * TILE_SIZE, playery * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

function gameLoop() {
  let before = Date.now();
  update();
  draw();
  let after = Date.now();
  let frameTime = after - before;
  let sleep = SLEEP - frameTime;
  setTimeout(() => gameLoop(), sleep);
}

window.onload = () => {
  transformMap();
  gameLoop();
};

const LEFT_KEY = "ArrowLeft";
const UP_KEY = "ArrowUp";
const RIGHT_KEY = "ArrowRight";
const DOWN_KEY = "ArrowDown";
window.addEventListener("keydown", (e) => {
  if (e.key === LEFT_KEY || e.key === "a") inputs.push(new KeyLeft());
  else if (e.key === UP_KEY || e.key === "w") inputs.push(new KeyUp());
  else if (e.key === RIGHT_KEY || e.key === "d") inputs.push(new KeyRight());
  else if (e.key === DOWN_KEY || e.key === "s") inputs.push(new KeyDown());
});
