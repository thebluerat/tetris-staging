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
                    this.ctx.drawImage(
                        ekuboImage,
                        col * this.cellSize,
                        // 위로 올라가는 애니메이션 하려고
                        (row - excludeBufferZone) * this.cellSize - (cellClearProgress * (this.cellSize * 10)),
                        imgSize,
                        imgSize
                    )
                }
            }
        }
        this.ctx.globalAlpha = 1;
    }

    // 살아남은 칸들 아래로 떨어뜨릴 좌표 계산
    drawDroppingCellsAfterClear(gridSnapshot, clearedIndices, dropDistances, elapsed, duration) {
        for(let row = 20; row < gridSnapshot.length; row++) {
            // 지워진 행은 건너뛰기
            if(clearedIndices.has(row)) continue;

            for(let col = 0; col < cols; col++) {
                // 빈 칸 건너뛰기
                if(gridSnapshot[row][col] === null) continue;
                const cellDropProgress = Math.min(1, Math.max(0, (elapsed / duration)));
                const totalDrop = dropDistances.get(row)
                let currentDropAmount = totalDrop * cellDropProgress;

                this.drawCell(
                    (row - excludeBufferZone) + currentDropAmount,
                    col,
                    gridSnapshot[row][col]
                );
            }
        }
    }
    // 줄 삭제 시 배경에 반짝이는 플래시 이미지
    drawClearFlash(elapsed, duration, ekuboImage) {
        const fadeInEnd = duration * 0.15; // 전체 시간의 앞 15% 동안 빠르게 나타남
        let alpha;
        if (elapsed <= fadeInEnd) {
            alpha = elapsed / fadeInEnd;
        } else {
            alpha = 1 - (elapsed - fadeInEnd) / (duration - fadeInEnd);
        }
        alpha = Math.min(1, Math.max(0, alpha));

        this.ctx.globalAlpha = alpha;
        this.ctx.drawImage(ekuboImage, 0, 0, this.width, this.height);
        this.ctx.globalAlpha = 1;
    }
}