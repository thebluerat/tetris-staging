const PIECES = {
    I: {color : 'skyblue', cells: [[0,0], [1,0], [2,0], [3,0]]},
    O: {color : 'yellow', cells: [[1,0], [1,1], [2,0], [2,1]]},
    T: {color : 'purple', cells: [[1,0], [1,1], [1,2], [2,1]]},
    S: {color : 'green', cells: [[0,1], [1,1], [1,0], [2,0]]},
    Z: {color : 'red', cells: [[1,0], [2,0], [2,1], [3,1]]},
    J: {color : 'blue', cells: [[2,0], [2,1], [2,2], [1,2]]},
    L: {color : 'orange', cells: [[1,0], [1,1], [1,2], [2,2]]},
};

const piece_size = [4, 4];

// 피스 큐 currentPiece, nextQueue
class Queue {
    constructor() {
        this.queue = [];
    }
    enqueue(piece) {
        this.queue.push(piece);
    }
    dequeue() {
        return this.queue.shift();
    }
}

const q = new Queue();

function initQueue() {
    q.enqueue(createRandomPiece());
    q.enqueue(createRandomPiece());
}

initQueue();

let currentPiece = "";

function spawnPiece() {
    const newPiece = q.dequeue();
    currentPiece = {
      ...newPiece,
      top: 0,
      left: 3,
      direction: 0,  
    };
    q.enqueue(createRandomPiece());
};

// 블록 위치 좌표 계산
function cellsAbsolutePosition(piece) {
    return piece.cells.map((cell) => {
        const col = cell[0];
        const row = cell[1];
        return [col + piece.left, row + piece.top];
    });
};

function isValidPosition(checkingCells) {
    const checkColValues = checkingCells.every(x => x[0] >= 0 && x[0] < 10);
    const checkRowValues = checkingCells.every(y => y[1] >= 0 && y[1] < 20);
    return checkColValues && checkRowValues; 
}

function createRandomPiece() {
    const piecesKeys = Object.keys(PIECES);
    const randomIndex = Math.floor(Math.random() * piecesKeys.length);
    return {
        blockName: Object.keys(PIECES)[randomIndex],
        cells: PIECES[piecesKeys[randomIndex]]['cells'],
        color: PIECES[piecesKeys[randomIndex]]['color'],
    };
}

spawnPiece();