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
                // console.log('누름' + ' event.key: ' + event.key);
                draw();
            }, 30)
        break; 
        case "ArrowUp":
            const rotationLength = rotationOrder.length;
            const nextDirection = rotationOrder[(rotationOrder.indexOf(currentPiece.direction) + 1) % rotationLength];
            const checkingPieceU = {
                ...currentPiece,
                direction: nextDirection,
                cells: RotatedShapes[currentPiece.blockName][nextDirection],
            }
            const checkingCellsU = cellsAbsolutePosition(checkingPieceU);
            if(isValidPosition(checkingCellsU)){
                currentPiece.direction = nextDirection;

                // currentPiece.cells에 RotatedShapes의 currentPiece.blockName과 같은 배열의 currentPiece.direction 값을 넣어줘야 함
                currentPiece.cells = checkingPieceU.cells;
            }
            draw();
            console.log('위 방향키 누름 ' + currentPiece.direction);
        break;
    }
    draw();
})
window.addEventListener('keyup', (event) => {
    if(event.key == "ArrowDown") {
        clearInterval(movingTimer);
        movingTimer = null;
        // console.log('뗌' + ' event.key: ' + event.key);
    }
    draw();
})