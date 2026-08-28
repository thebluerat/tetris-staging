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
                currentPiece.left --;
            }
        break;
        case "ArrowRight":
            const checkingPieceR = {
                ...currentPiece,
                left: currentPiece.left + 1
            };
            const checkingCellsR = cellsAbsolutePosition(checkingPieceR);
            if(isValidPosition(checkingCellsR)){
                currentPiece.left ++;
            }
        break;
        case "ArrowUp":
            const checkingPieceU = {
                ...currentPiece,
                top: currentPiece.top - 1
            };
            const chekingCellsU = cellsAbsolutePosition(checkingPieceU);
            if(isValidPosition(chekingCellsU)) {
                currentPiece.top --;
            }
        break;
        case "ArrowDown":
            const checkingPieceD = {
                ...currentPiece,
                top: currentPiece.top + 1
            };
            const chekingCellsD = cellsAbsolutePosition(checkingPieceD);
            if(isValidPosition(chekingCellsD)) {
                currentPiece.top ++;
            }
        break;
    }
    draw();
})