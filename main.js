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