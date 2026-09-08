// 게임 판, 블록 그리기 (canvas)
class Renderer {
    constructor(canvas, cellSize) {
        this.ctx = canvas.getContext('2d');
        this.cellSize = cellSize;
        this.width = canvas.width;
        this.height = canvas.height;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    drawCell(row, col, color) {
        const x = col * this.cellSize;
        const y = row * this.cellSize;

        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, this.cellSize, this.cellSize);

    }
    
    drawGrid(grid) {
        const excludeBufferZone = 20;
        for(let row = 20; row < grid.length; row++) {
            for(let col = 0; col < grid[row].length; col++) {
                if(grid[row][col] !== null) {
                    this.drawCell(row - excludeBufferZone, col, grid[row][col]);
                }
            }
        }
    }

    drawPiece(piece) {
        for(const cell of piece.cells) {
            const col = cell[0];
            const row = cell[1];
            this.drawCell(row - piece.excludeBufferZone, col, piece.color);
        }
    }
    drawPreviewPiece(piece) {
        const previewPiece = piece;
        for(const cell of piece.cells) {
            const col = cell[0];
            const row = cell[1];
            blockRenderOffset(previewPiece);
            const offsets = blockRenderOffset(previewPiece);
            this.drawCell(row + offsets[1], col + offsets[0], piece.color);
        }
    }
}