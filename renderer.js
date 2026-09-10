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
            this.drawCell(row - excludeBufferZone, col, piece.color);
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
    // 삭제할 블록을 패턴 순서에 따라 이미지로 바꾸고 fadeOut
    drawDisappearingCells(clearedIndices, gridSnapshot, patternMap, elapsed, ekuboImage, interval, cellDuration) {
        for(const row of clearedIndices) {
            for(let col = 0; col < cols; col ++) {
                // 삭제할 행의
                const patternRow = patternMap.get(row); 
                // 각 블록의 삭제 순번
                const patternOrder = patternRow.indexOf(col);
                // 각 칸의 삭제 진행도(0~1)
                const cellClearDelayTime = patternOrder * interval;
                const cellClearElapsedTime = elapsed - cellClearDelayTime;
                const cellClearProgress = Math.min(1, Math.max(0, (cellClearElapsedTime / cellDuration)));
                // 삭제할 블록 투명하게 만들기
                if(cellClearProgress <= 0) {
                    this.drawCell(row - excludeBufferZone, col, gridSnapshot[row][col]);
                } else if(cellClearProgress > 0) {
                    this.ctx.globalAlpha = 1 - cellClearProgress;
                    this.ctx.drawImage(ekuboImage, col * this.cellSize, (row - excludeBufferZone) * this.cellSize, imgSize, imgSize)
                }
            }
        }
        this.ctx.globalAlpha = 1;
    }
}