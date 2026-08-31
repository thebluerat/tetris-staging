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

function draw() {
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

window.addEventListener('keydown', (event) => {
    switch (event.code) {
        case "ArrowLeft": 
            // currentPiece.left - 1한 값 새로 만들어보기
            const checkingPieceL = {
                ...currentPiece,
                left: currentPiece.left - 1
            };
            // currentPiece.left - 1하면 어떻게 될지 좌표 계산해보기
            const checkingCellsL = cellsAbsolutePosition(checkingPieceL);
            if(isValidPosition(checkingCellsL)){
                currentPiece.left = checkingPieceL.left;
            }
        break;
        case "ArrowRight":
            const checkingPieceR = {
                ...currentPiece,
                left: currentPiece.left + 1
            };
            const checkingCellsR = cellsAbsolutePosition(checkingPieceR);
            if(isValidPosition(checkingCellsR)){
                currentPiece.left = checkingPieceR.left;
            }
        break;
        case "ArrowDown":
            if(movingTimer !== null) return;
            movingTimer = setInterval(() => {
                const checkingPieceD = {
                    ...currentPiece,
                    top: currentPiece.top + 1
                };
                const chekingCellsD = cellsAbsolutePosition(checkingPieceD);
                if(isValidPosition(chekingCellsD)) {
                    currentPiece.top = checkingPieceD.top;
                }
                draw();
            }, 30)
        break; 
        case "KeyX":
            console.log('KeyX 회전 시도 직전 direction: ', currentPiece.direction);
            const nextDirection = rotationOrder[(rotationOrder.indexOf(currentPiece.direction) + 1) % rotationLength];
            const checkingPieceCW = {
                ...currentPiece,
                direction: nextDirection,
                cells: RotatedShapes[currentPiece.blockName][nextDirection],
            }
            const checkingCellsCW = cellsAbsolutePosition(checkingPieceCW);

            if(isValidPosition(checkingCellsCW)){
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
                    
                    if (isValidPosition(kickedCells)) {
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
            console.log('KeyZ 회전 시도 직전 direction: ', currentPiece.direction);
            console.log('현재 left/top: ', currentPiece.left, currentPiece.top);
            const ACWnextDirection = rotationOrder[((rotationOrder.indexOf(currentPiece.direction) - 1) % rotationLength + 4) % 4];
            let checkingPieceACW = {
                ...currentPiece,
                direction: ACWnextDirection,
                cells: RotatedShapes[currentPiece.blockName][ACWnextDirection],
            }
            checkingCellsACW = cellsAbsolutePosition(checkingPieceACW);
            console.log('기본 회전 시도 좌표: ', checkingCellsACW); 

            if(isValidPosition(checkingCellsACW)){
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
                    console.log(`킥 시도 ${i}:`, kickedCells); 
                    
                    if (isValidPosition(kickedCells)) {
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
    }
    draw();
})
window.addEventListener('keyup', (event) => {
    if(event.key == "ArrowDown") {
        clearInterval(movingTimer);
        movingTimer = null;
    }
    draw();
})