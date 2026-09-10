const PIECES = {
    I: {color : '#00F0FF', cells: [[0,1], [1,1], [2,1], [3,1]]},
    O: {color : '#FFFF33', cells: [[0,0], [1,0], [0,1], [1,1]]},
    T: {color : '#9400D3', cells: [[0,1], [1,1], [2,1], [1,2]]},
    S: {color : '#39FF14', cells: [[1,1], [2,1], [0,2], [1,2]]},
    Z: {color : '#FF1493', cells: [[0,1], [1,1], [1,2], [2,2]]},
    J: {color : '#1F51FF', cells: [[1,0], [1,1], [0,2], [1,2]]},
    L: {color : '#FF6700', cells: [[1,0], [1,1], [1,2], [2,2]]},
};

function blockRenderOffset(piece) {
        const colMax = Math.max(...piece.cells.map(x => x[0]));
        const rowMax = Math.max(...piece.cells.map(x => x[1]));
        const colMin = Math.min(...piece.cells.map(x => x[0]));
        const rowMin = Math.min(...piece.cells.map(x => x[1]));
        const colSize = (colMax - colMin  + 1) * piece.size;
        const rowSize = (rowMax - rowMin  + 1) * piece.size;
        const boxWidth = piece.whatPreview.offsetWidth;
        const boxHeight = piece.whatPreview.offsetHeight;
        const remainingCol = (boxWidth - colSize) / piece.size;
        const remainingRow = (boxHeight - rowSize) / piece.size;
        const colOffset = remainingCol / 2 - colMin;
        const rowOffset = remainingRow / 2 - rowMin;
        return [colOffset, rowOffset];
};

// 회전할 때 예쁜 모양을 보여주기 위해 블록이 회전한 모양을 일일이 그려주기로 결심했다
const RotatedShapes = {
    I: {
        north: [[0,1], [1,1], [2,1], [3,1]],
        east:  [[2,0], [2,1], [2,2], [2,3]],
        south: [[0,2], [1,2], [2,2], [3,2]],
        west:  [[1,0], [1,1], [1,2], [1,3]],
    },
    O: {
        north: [[0,0], [1,0], [0,1], [1,1]],
        east:  [[0,0], [1,0], [0,1], [1,1]],
        south: [[0,0], [1,0], [0,1], [1,1]],
        west:  [[0,0], [1,0], [0,1], [1,1]],
    },
    T: {
        north: [[0,1], [1,1], [2,1], [1,2]],
        east:  [[1,0], [0,1], [1,1], [1,2]],
        south: [[1,0], [0,1], [1,1], [2,1]],
        west:  [[1,0], [1,1], [2,1], [1,2]],
    },
    S: {
        north: [[1,1], [2,1], [0,2], [1,2]],
        east:  [[0,0], [0,1], [1,1], [1,2]],
        south: [[1,0], [2,0], [0,1], [1,1]],
        west:  [[1,0], [1,1], [2,1], [2,2]],
    },
    Z: {
        north: [[0,1], [1,1], [1,2], [2,2]],
        east:  [[1,0], [0,1], [1,1], [0,2]],
        south: [[0,0], [1,0], [1,1], [2,1]],
        west:  [[2,0], [1,1], [2,1], [1,2]],
    },
    J: {
        north: [[1,0], [1,1], [0,2], [1,2]],
        east:  [[0,0], [0,1], [1,1], [2,1]],
        south: [[1,0], [2,0], [1,1], [1,2]],
        west:  [[0,1], [1,1], [2,1], [2,2]],
    },
    L: {
        north: [[1,0], [1,1], [1,2], [2,2]],
        east:  [[0,1], [1,1], [2,1], [0,2]],
        south: [[0,0], [1,0], [1,1], [1,2]],
        west:  [[2,0], [0,1], [1,1], [2,1]],
    },
};
const rotationOrder = ['north', 'east', 'south', 'west'];

// 벽차기: 어느 방향으로 얼마나 밀지 (공식 SRS 킥 테이블 참고)
const WallKicks_JLSTZ = {
    north: [[0,0], [-1,0], [-1,-1], [0,2], [-1,2]],   // north → east
    east:  [[0,0], [1,0],  [1,1],   [0,-2], [1,-2]],  // east → south
    south: [[0,0], [1,0],  [1,-1],  [0,2], [1,2]],    // south → west
    west:  [[0,0], [-1,0], [-1,1],  [0,-2], [-1,-2]], // west → north
};
const WallKicks_I = {
    north: [[0,0], [-2,0], [1,0], [-2,1], [1,-2]],
    east:  [[0,0], [-1,0], [2,0], [-1,-2], [2,1]],
    south: [[0,0], [2,0],  [-1,0], [2,-1], [-1,2]],
    west:  [[0,0], [1,0],  [-2,0], [1,2], [-2,-1]],
};
const WallKicks_JLSTZ_ACW = {
    north: [[0,0], [1,0],  [1,-1],  [0,2],  [1,2]],   // north → west
    east:  [[0,0], [1,0],  [1,1],   [0,-2], [1,-2]],  // east → north
    south: [[0,0], [-1,0], [-1,-1], [0,2],  [-1,2]],  // south → east
    west:  [[0,0], [-1,0], [-1,1],  [0,-2], [-1,-2]], // west → south
};
const WallKicks_I_ACW = {
    north: [[0,0], [-1,0], [2,0],  [-1,-2], [2,1]],   // north → west
    east:  [[0,0], [2,0],  [-1,0], [2,-1],  [-1,2]],  // east → north
    south: [[0,0], [1,0],  [-2,0], [1,2],   [-2,-1]], // south → east
    west:  [[0,0], [-2,0], [1,0],  [-2,1],  [1,-2]],  // west → south
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

let currentPiece = "";

function spawnPiece() {
    const newPiece = q.dequeue();
    currentPiece = {
        ...newPiece,
        top: 18,
        left: 3,
        direction: 'north',  
    };
    const checkingCellsSpawn = cellsAbsolutePosition(currentPiece);
    if(isEmptySpace(checkingCellsSpawn, grid)) {
        q.enqueue(createRandomPiece());
    } else {
        endingLevel = level;
        finalScore = score;
        endingLevelDisplay.textContent = endingLevel;
        finalScoreDisplay.textContent = finalScore;
        const allRows = saveScore(nickname, finalScore, true);
        renderRanking(allRows);
        showScreen(SCREEN_STATE.GAMEOVER);
        gameoverEnteredTime = performance.now();
        return;
    }
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
    const checkRowValues = checkingCells.every(y => y[1] >= 0 && y[1] < 40);
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