const PIECES = {
    I: {color : 'skyblue', cells: [[0,1], [1,1], [2,1], [3,1]]},
    O: {color : 'yellow', cells: [[1,1], [1,2], [2,1], [2,2]]},
    T: {color : 'purple', cells: [[0,0], [0,1], [0,2], [1,1]]},
    S: {color : 'green', cells: [[0,1], [1,1], [1,0], [2,0]]},
    Z: {color : 'red', cells: [[1,0], [2,0], [2,1], [3,1]]},
    J: {color : 'blue', cells: [[2,0], [2,1], [2,2], [1,2]]},
    L: {color : 'orange', cells: [[1,0], [1,1], [1,2], [2,2]]},
};

const piece_size = [4, 4];

let initLocation = {
    piece: "",
    direction: 0,
    top: 0,
    left: 3,
};

function spawnPiece() {
    const newPiece = createRandomPiece();
    initLocation.piece = newPiece;
    initLocation.top = 0;
    initLocation.left = 3;
    initLocation.direction = 0;
};
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