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
        for(let row = 0; row < grid.length; row++) {
            for(let col = 0; col < grid[row].length; col++) {
                if(grid[row][col] !== null) {
                    this.drawCell(row, col, grid[row][col]);
                }
            }
        }
    }

    drawPiece(piece) {
        for(const cell of piece.cells) {
            const col = cell[0];
            const row = cell[1];
            this.drawCell(row, col, piece.color);
        }
    }

    render(grid, piece) {
        this.clear();
        this.drawGrid(grid);
        this.drawPiece(piece);
    }
}