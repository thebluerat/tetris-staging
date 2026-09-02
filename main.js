const canvas = document.getElementById('board_canvas');
const cellSize = 20;
const renderer = new Renderer(canvas, cellSize);

// 블록 미리보기 렌더러
const previewCanvas = document.getElementById('next_preview');
const previewCellSize = 10;
const previewRenderer = new Renderer(previewCanvas, previewCellSize);

const subPreviewCanvas = document.getElementById('sub_next_preview');
const subPreviewCellSize = 5;
const subPreviewRenderer = new Renderer(subPreviewCanvas, subPreviewCellSize);

showScreen(SCREEN_STATE.START);

function draw() {
    if(state == 'START' || state == 'GAMEOVER') return;
    renderer.clear();
    renderer.drawGrid(grid);
    renderer.drawPiece({
        cells: cellsAbsolutePosition(currentPiece),
        color: currentPiece.color,
    });

    previewRenderer.clear();
    previewRenderer.drawPiece({
        cells: q.queue[0].cells,
        color: q.queue[0].color,
    });

    subPreviewRenderer.clear();
    subPreviewRenderer.drawPiece({
        cells: q.queue[1].cells,
        color: q.queue[1].color,
    });
}

draw();

let movingTimer = null;
const rotationLength = rotationOrder.length;

// 자동 낙하에 필요한 변수
let lastDropTime = 0;
let dropTimeCounter = 0;
let dropInterval = 1000;

function dropTimeUpdate(time = 0) {
    if(state == 'PLAYING') {
        const deltaTime = time - lastDropTime;
        lastDropTime = time;
        dropTimeCounter += deltaTime;
        
        if(dropTimeCounter > dropInterval) {
            moveDown();
            dropTimeCounter = 0;
        }
    }
    draw();
    requestAnimationFrame(dropTimeUpdate);
};

// 블록 고정 함수 (moveDown(), hardDrop() 공통)
function lockPiece(position, currentPiece) {
    position.forEach(([col, row]) => {
        grid[row][col] = currentPiece.color;
    })       
}

// 줄 삭제 함수
function clearRow(position) {
    const set = new Set(position.map(([col, row]) => row));
    const fullRows = [...set];
    console.log('fullRows', fullRows);
}

function moveDown() {
    if(state === SCREEN_STATE.PAUSED || state === SCREEN_STATE.GAMEOVER) return;
    const checkingPieceD = {
        ...currentPiece,
        top: currentPiece.top + 1
    };
    const checkingCellsD = cellsAbsolutePosition(checkingPieceD);
    if(isValidPosition(checkingCellsD) && isEmptySpace(checkingCellsD, grid)) {
        currentPiece.top = checkingPieceD.top;
    } else {
        // lock out 게임 오버
        const position = cellsAbsolutePosition(currentPiece);
        console.log('position: ', position);
        if (position.every(cell => cell[1] < 20)) {
            showScreen(SCREEN_STATE.GAMEOVER);
            console.log("lock out 께임 오버");
            return;
        }
        // 블록 고정
        lockPiece(position, currentPiece);   
        // 꽉 찬 줄 삭제
        clearRow(position);
        spawnPiece();
    }
}
function hardDrop() {
    if(state === SCREEN_STATE.PAUSED || state === SCREEN_STATE.GAMEOVER) return;
    let checkingPieceHardDrop = {
        ...currentPiece,
        top: currentPiece.top + 1
    }
    let checkingCellsHardDrop = cellsAbsolutePosition(checkingPieceHardDrop);
    while(isValidPosition(checkingCellsHardDrop) && isEmptySpace(checkingCellsHardDrop, grid)) {
        checkingPieceHardDrop.top += 1;
        checkingCellsHardDrop = cellsAbsolutePosition(checkingPieceHardDrop);
    }
    checkingPieceHardDrop.top -= 1;
    currentPiece = checkingPieceHardDrop;

    const hardDropPosition = cellsAbsolutePosition(currentPiece);
    //블록 고정
    lockPiece(hardDropPosition, currentPiece);
     // 꽉 찬 줄 삭제
    clearRow(hardDropPosition);
    spawnPiece();
}

window.addEventListener('keydown', (event) => {
    if(state !== 'PLAYING') return; 
    switch (event.code) {
        case "ArrowLeft": 
            // currentPiece.left - 1한 값 새로 만들어보기
            const checkingPieceL = {
                ...currentPiece,
                left: currentPiece.left - 1
            };
            // currentPiece.left - 1하면 어떻게 될지 좌표 계산해보기
            const checkingCellsL = cellsAbsolutePosition(checkingPieceL);
            if(isValidPosition(checkingCellsL) && isEmptySpace(checkingCellsL, grid)){
                currentPiece.left = checkingPieceL.left;
            }
        break;
        case "ArrowRight":
            const checkingPieceR = {
                ...currentPiece,
                left: currentPiece.left + 1
            };
            const checkingCellsR = cellsAbsolutePosition(checkingPieceR);
            if(isValidPosition(checkingCellsR) && isEmptySpace(checkingCellsR, grid)){
                currentPiece.left = checkingPieceR.left;
            }
        break;
        case "ArrowDown":
            if(movingTimer !== null) return;
            movingTimer = setInterval(() => {
                moveDown()
                dropTimeCounter = 0;
                draw();
            }, 30)
        break; 
        case "KeyX":
            const nextDirection = rotationOrder[(rotationOrder.indexOf(currentPiece.direction) + 1) % rotationLength];
            const checkingPieceCW = {
                ...currentPiece,
                direction: nextDirection,
                cells: RotatedShapes[currentPiece.blockName][nextDirection],
            }
            const checkingCellsCW = cellsAbsolutePosition(checkingPieceCW);

            if(isValidPosition(checkingCellsCW) && isEmptySpace(checkingCellsCW, grid)){
                currentPiece.direction = nextDirection;
                currentPiece.cells = checkingPieceCW.cells;
            } 
            // 회전 벽에 막힐 때 벽차기
            else {
                let kickTable = WallKicks_JLSTZ;
                if(checkingPieceCW.blockName == 'I') {
                    kickTable = WallKicks_I;
                }
                for (let i = 0; i < 5; i++) {
                    const [deltaLeft, deltaTop] = kickTable[currentPiece.direction][i];
                    const kickedCells = checkingCellsCW.map(cell => [cell[0] + deltaLeft, cell[1] + deltaTop]);
                    
                    if (isValidPosition(kickedCells) && isEmptySpace(kickedCells, grid)) {
                        currentPiece.cells = checkingPieceCW.cells;
                        currentPiece.direction = nextDirection;
                        currentPiece.left = currentPiece.left + deltaLeft;
                        currentPiece.top = currentPiece.top + deltaTop;
                        break;
                    }
                }
            };
            draw();
        break;
        case "KeyZ":
            const ACWnextDirection = rotationOrder[((rotationOrder.indexOf(currentPiece.direction) - 1) % rotationLength + 4) % 4];
            let checkingPieceACW = {
                ...currentPiece,
                direction: ACWnextDirection,
                cells: RotatedShapes[currentPiece.blockName][ACWnextDirection],
            }
            const checkingCellsACW = cellsAbsolutePosition(checkingPieceACW);

            if(isValidPosition(checkingCellsACW) && isEmptySpace(checkingCellsACW, grid)){
                currentPiece.direction = ACWnextDirection;
                currentPiece.cells = checkingPieceACW.cells;
            } 
            // 회전 벽에 막힐 때 벽차기
            else {
                let kickTable = WallKicks_JLSTZ_ACW;
                if(checkingPieceACW.blockName == 'I') {
                    kickTable = WallKicks_I_ACW;
                }
                for (let i = 0; i < 5; i++) {
                    const [deltaLeft, deltaTop] = kickTable[currentPiece.direction][i];
                    const kickedCells = checkingCellsACW.map(cell => [cell[0] + deltaLeft, cell[1] + deltaTop]);
                    
                    if (isValidPosition(kickedCells) && isEmptySpace(kickedCells, grid)) {
                        currentPiece.cells = checkingPieceACW.cells;
                        currentPiece.direction = ACWnextDirection;
                        currentPiece.left = currentPiece.left + deltaLeft;
                        currentPiece.top = currentPiece.top + deltaTop;
                        break;
                    }
                }
            };
            draw();
        break;
        case "Space":
            hardDrop();
        break;
    }
    draw();
})
window.addEventListener('keyup', (event) => {
    if(event.key == "ArrowDown" || event.key == "Space") {
        clearInterval(movingTimer);
        movingTimer = null;
    }
    draw();
})