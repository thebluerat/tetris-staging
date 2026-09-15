const levelImgSets = [
    ['img_ekubo_0', 'img_ekubo_1', 'img_ekubo_2', 'img_ekubo_3', 'img_ekubo_4', 'img_ekubo_5', 'img_ekubo_6', 'img_ekubo_7', 'img_ekubo_8'],
    // ['img_mob_0', 'img_mob_1', 'img_mob_2', 'img_mob_3', 'img_mob_4', 'img_mob_5', 'img_mob_6', 'img_mob_7']
];
const gameImgs = [];
const gameImgsLoaded = [];

for(const [level, names] of levelImgSets.entries()) {
    gameImgs[level] = [];
    gameImgsLoaded[level] = [];

    for(const [index, name] of names.entries()) {
        const img = new Image();
        img.src = `./img/${name}.png`;

        gameImgsLoaded[level][index] = img.complete;
        img.onload = () => {
            gameImgsLoaded[level][index] = true;
        };

        gameImgs[level].push(img);
    }
}

const canvas = document.getElementById('board_canvas');
const cellSize = 20;
const imgSize = 30;
const renderer = new Renderer(canvas, cellSize);

// 블록 미리보기 렌더러
const previewCanvas = document.getElementById('next_preview');
const previewCellSize = 10;
const previewRenderer = new Renderer(previewCanvas, previewCellSize);

const subPreviewCanvas = document.getElementById('sub_next_preview');
const subPreviewCellSize = 5;
const subPreviewRenderer = new Renderer(subPreviewCanvas, subPreviewCellSize);

let isSoftDropping = false;

const levelDisplay = document.getElementById('level');
const timeDisplay = document.getElementById('time');
const scoreDisplay = document.getElementById('score');
const endingLevelDisplay = document.getElementById('ending_level');
const finalScoreDisplay = document.getElementById('final_score');

let elapsedTime = 0;
let gameoverEnteredTime = 0;
let totalPlayTime = 0;
let score = 0;
let level = 0;
let finalScore = 0;
let endingLevel = 0;

// 레벨 0~29 낙하 프레임 수 (NTSC 기준, 60fps)
const dropFramesByLevel = [
    48, 43, 38, 33, 28, 23, 18, 13, 8, 6, // 0~9
    5, 5, 5,                              // 10~12
    4, 4, 4,                              // 13~15
    3, 3, 3,                              // 16~18
    2, 2, 2, 2, 2, 2, 2, 2, 2, 2,         // 19~28
    1                                     // 29
];

let clearedRowsCounter = 0;

const rotationLength = rotationOrder.length;

// 자동 낙하에 필요한 변수
let timePreviousFrame = 0;
let dropTimeCounter = 0;
let dropInterval = 1000;

let aniFrame;

// 줄 삭제 애니메이션에 필요한 정보 초깃값
let lineClearAnimation = null;
let gridBeforeCleared = [];

showScreen(SCREEN_STATE.START);

// 줄 삭제할 때 점수 계산
function calScoreLineClear(cleared) {
    if(cleared == 1) {
        calScore(40 * (level + 1));
    } else if(cleared == 2) {
        calScore(100 * (level + 1));
    } else if(cleared == 3) {
        calScore(300 * (level + 1));
    } else if(cleared == 4) {
        calScore(1200 * (level + 1));
    }
}
function calScore(expression) {
    score += expression;
    scoreDisplay.textContent = score;
}

function MStoMMSS(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    const formattedTime = `${minutes}:${seconds}`
    return formattedTime;
}
function playingTime(elapsedTime) { 
    elapsedTime = MStoMMSS(elapsedTime);
    timeDisplay.textContent = elapsedTime;
};

function FPStoMS(fPS) {
    let ms = (1000 / 60) * fPS;
    return ms;
} 
function framesByLevel(level) {
    if(level >= 29) {
        return dropFramesByLevel[29];
    } else {
        return dropFramesByLevel[level];
    }
}
function levelUp (cleared) {
    clearedRowsCounter += cleared;
    level = Math.floor(clearedRowsCounter / 10);
    levelDisplay.textContent = level;
}
function easeInOutCubic(t) {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function draw() {
    if(state == 'START' || state == 'GAMEOVER') return;
    renderer.clear();
    // 줄 삭제될 때
    if(lineClearAnimation) {
        const clearAnimationEndTime = lineClearAnimation.startTime + lineClearAnimation.duration;
        const elapsed = timePreviousFrame - lineClearAnimation.startTime;
        renderer.drawClearFlash(
            elapsed,
            lineClearAnimation.duration,
            lineClearAnimation.selectedImg,
            lineClearAnimation.x,
            lineClearAnimation.y,
            lineClearAnimation.endX,
            lineClearAnimation.endY,
            lineClearAnimation.drawingWidth,
            lineClearAnimation.drawingHeight
        );
        renderer.drawDroppingCellsAfterClear(
            lineClearAnimation.gridSnapshot,
            lineClearAnimation.clearedIndices,
            lineClearAnimation.dropDistances,
            elapsed,
            lineClearAnimation.cellDuration
        );
        renderer.drawDisappearingCells(
            lineClearAnimation.clearedIndices,
            lineClearAnimation.gridSnapshot,
            lineClearAnimation.patternMap,
            elapsed,
            lineClearAnimation.selectedImg,
            lineClearAnimation.interval,
            lineClearAnimation.cellDuration
        );
        if(timePreviousFrame >= clearAnimationEndTime) {
            lineClearAnimation = null;
        }
    } else {
        renderer.drawGrid(grid);
    }
    renderer.drawPiece({
        cells: cellsAbsolutePosition(currentPiece),
        color: currentPiece.color,
    });
}
function previewDraw() {
    if(state == 'START' || state == 'GAMEOVER') return;
    previewRenderer.clear();
    previewRenderer.drawPreviewPiece({
        cells: q.queue[0].cells,
        color: q.queue[0].color,
        size: previewCellSize,
        whatPreview: previewCanvas,
    });

    subPreviewRenderer.clear();
    subPreviewRenderer.drawPreviewPiece({
        cells: q.queue[1].cells,
        color: q.queue[1].color,
        size: subPreviewCellSize,
        whatPreview: subPreviewCanvas,
    });
}

draw();

function decideDropInterval() {
    if(isSoftDropping) {
        dropInterval = 30;
    } else {
        dropInterval = FPStoMS(framesByLevel(level));
    }
    return dropInterval;
}

function dropTimeUpdate(time = 0) {
    decideDropInterval()
    if(state == 'PLAYING') {
        const deltaTime = time - timePreviousFrame;
        // timePreviousFrame: 매 프레임마다 갱신되는 최근 시각
        timePreviousFrame = time;
        dropTimeCounter += deltaTime;
        elapsedTime += deltaTime;
        playingTime(elapsedTime);
        
        if(dropTimeCounter > dropInterval) {
            moveDown();
            dropTimeCounter = 0;
        }
    }
    draw();
    aniFrame = requestAnimationFrame(dropTimeUpdate);
};
function stopDropTimeUpdate() {
    cancelAnimationFrame(aniFrame);
    aniFrame = null;
};

// 블록 고정 함수 (moveDown(), hardDrop() 공통)
function lockPiece(position, currentPiece) {
    position.forEach(([col, row]) => {
        grid[row][col] = currentPiece.color;
    })       
}

// 지워지는 row마다 패턴(배열)을 짝지어주기
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
function clearPattern(clearedIndices, clearedCount) {
    const patternMap = new Map();
    const arr = Array.from({length: cols}, (_, index) => index);
    const reverseArr = [...arr].reverse();
    const shuffleRow = (arr) => {
        const shuffledRow = [];
        const tempArr = [...arr];
        while(tempArr.length) {
            const lastIdx = tempArr.length - 1;
            let shuffleKey = Math.floor(Math.random() * tempArr.length);
            let tempEl = tempArr[lastIdx];
            tempArr[lastIdx] = tempArr[shuffleKey];
            tempArr[shuffleKey] = tempEl;
            shuffledRow.push(tempArr.pop());
        }
        return shuffledRow;
    }
    // 1줄 삭제할 때는 왼쪽에서 오른쪽으로, 또는 오른쪽에서 왼쪽으로 블록이 사라지게
    // 또는 무작위로 사라지게
    if(clearedCount === 1) {
        const randomNum = getRandomInt(3);
        const clearedOneIdx = [...clearedIndices][0];
        if(randomNum === 0) {
            patternMap.set(clearedOneIdx, arr);
        } else if(randomNum === 1) {
            patternMap.set(clearedOneIdx, reverseArr);
        } else if(randomNum === 2) {
            patternMap.set(clearedOneIdx, shuffleRow(arr));
        }
        return patternMap;
    // 2줄 이상 삭제할 때는 왼쪽이나 오른쪽부터 시작해서 사라지는 걸 번갈아가면서
    } else if(clearedCount >= 2) {
        const randomNum = getRandomInt(2);
        const clearedIndicesArr = [...clearedIndices];
        const startPattern = randomNum === 0 ? arr : reverseArr;
        const otherPattern = randomNum === 0 ? reverseArr : arr;
        let i = 0;
        for(const rowIdx of clearedIndicesArr) {
            if(i % 2 === 0) {
                patternMap.set(rowIdx, startPattern);
            } else {
                patternMap.set(rowIdx, otherPattern);
            }
            i++;
        }
        return patternMap;
    }
}

// 줄 삭제 함수
function clearRow(position) {
    // set: 블록이 고정된 행
    const set = new Set(position.map(([col, row]) => row));
    // filteredGrid: 꽉 찬 행을 지운 grid
    const filteredGrid = grid.filter((row, idx) => !set.has(idx) || row.some(cell => cell == null));
    const clearedIndices = new Set(grid.map((_, idx) => idx).filter(idx => set.has(idx) && grid[idx].every(cell => cell !== null)));
    const clearedCount = grid.length - filteredGrid.length;
    if (filteredGrid.length == grid.length) {
        return {
            clearedCount: 0,
            clearedIndices: new Set(),
        };
    } else {
        const newRows = Array.from({length: clearedCount}, () => Array(cols).fill(null));
        const newGrid = [...newRows, ...filteredGrid];
        grid.length = 0;
        grid.push(...newGrid);
    }
    const randomPattern = clearPattern(clearedIndices, clearedCount);
    return {clearedCount, clearedIndices, randomPattern};
}

// 줄 삭제하면서 위에서 떨어지는 칸 개수 계산하는 함수
function calcDropDistances(clearedIndices, gridSnapshot) {
    const arrClearedIndices = [...clearedIndices];
    const rowDropDistancesMap = new Map();
    for(let i = 0; i < gridSnapshot.length; i++) {
        let dropDistances = arrClearedIndices.filter(idx => idx > i).length;
        rowDropDistancesMap.set(i, dropDistances);
    }
    return rowDropDistancesMap;
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
        if(isSoftDropping == true) {
            calScore(1);
        }
    } else {
        const position = cellsAbsolutePosition(currentPiece);
        // lock out 게임 오버
        if (position.every(cell => cell[1] < 20)) {
            endingLevel = level;
            finalScore = score;
            endingLevelDisplay.textContent = endingLevel;
            finalScoreDisplay.textContent = finalScore;
            gameoverEnteredTime = performance.now();
            showScreen(SCREEN_STATE.GAMEOVER);

            const totalPlayTimeSeconds = Math.floor(elapsedTime / 1000);
            saveScore(nickname, finalScore, totalPlayTimeSeconds).then(async () => {
                const allRows = await getRanking();
                renderRanking(allRows);
            });
            return;
        }
        // 블록 고정
        lockPiece(position, currentPiece);   
        gridBeforeCleared = structuredClone(grid);
        // 꽉 찬 줄 삭제
        const clearAnimationStartTime = timePreviousFrame;
        const {clearedCount, clearedIndices, randomPattern} = clearRow(position);
        if(clearedCount !== 0) {
            let dropDistances = calcDropDistances(clearedIndices, gridBeforeCleared);
            const imgLevel = level >= gameImgs.length ? gameImgs.length - 1 : level;
            const levelImgPool = gameImgs[imgLevel];
            const levelImgLoadedPool = gameImgsLoaded[imgLevel];
            const randomIndex = Math.floor(Math.random() * levelImgPool.length);
            if(levelImgLoadedPool[randomIndex]) {
                const selectedImg = levelImgPool[randomIndex];
                const drawingWidth = boardWidth * (2/3);
                const drawingHeight = boardWidth * (selectedImg.naturalHeight / selectedImg.naturalWidth);
                const x = Math.random() * boardWidth;
                const y = Math.random() * boardHeight;
                const endX = (boardWidth / 2) - (selectedImg.naturalWidth / 2); 
                const endY = (boardHeight / 2) - (selectedImg.naturalHeight / 2); 
                lineClearAnimation = {
                    selectedImg,
                    x,
                    y,
                    endX,
                    endY,
                    drawingWidth,
                    drawingHeight,
                    clearedIndices,
                    gridSnapshot: gridBeforeCleared,
                    patternMap: randomPattern,
                    startTime: clearAnimationStartTime,
                    duration: 800,
                    interval: 45,
                    cellDuration: 600,
                    dropDistances,
                }; 
            }
        }
        calScoreLineClear(clearedCount);
        levelUp(clearedCount);
        spawnPiece();
        previewDraw();
    }
}
function hardDrop() {
    if(state === SCREEN_STATE.PAUSED || state === SCREEN_STATE.GAMEOVER) return;
    let topBeforeHardDrop = currentPiece.top;
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
    calScore(2 * (currentPiece.top - topBeforeHardDrop));

    const hardDropPosition = cellsAbsolutePosition(currentPiece);
    //블록 고정
    lockPiece(hardDropPosition, currentPiece);
    gridBeforeCleared = structuredClone(grid);
    // 꽉 찬 줄 삭제
    const clearAnimationStartTime = timePreviousFrame;
    const {clearedCount, clearedIndices, randomPattern} = clearRow(hardDropPosition);
    if(clearedCount !== 0) {
        let dropDistances = calcDropDistances(clearedIndices, gridBeforeCleared);
        const imgLevel = level >= gameImgs.length ? gameImgs.length - 1 : level;
        const levelImgPool = gameImgs[imgLevel];
        const levelImgLoadedPool = gameImgsLoaded[imgLevel];
        const randomIndex = Math.floor(Math.random() * levelImgPool.length);
            if(levelImgLoadedPool[randomIndex]) {
                const selectedImg = levelImgPool[randomIndex];
                const drawingWidth = boardWidth * (2/3);
                const drawingHeight = boardWidth * (selectedImg.naturalHeight / selectedImg.naturalWidth);
                const x = Math.random() * boardWidth;
                const y = Math.random() * boardHeight;
                const endX = (boardWidth / 2) - (drawingWidth / 2); 
                const endY = (boardHeight / 2) - (drawingHeight / 2); 
                lineClearAnimation = {
                    selectedImg,
                    x,
                    y,
                    endX,
                    endY,
                    drawingWidth,
                    drawingHeight,
                    clearedIndices,
                    gridSnapshot: gridBeforeCleared,
                    patternMap: randomPattern,
                    startTime: clearAnimationStartTime,
                    duration: 800,
                    interval: 45,
                    cellDuration: 600,
                    dropDistances,
                }; 
            }
        }
    calScoreLineClear(clearedCount);
    levelUp(clearedCount);
    spawnPiece();
    previewDraw();
}

function resetGame() {
    currentRunRecordId = null;
    stopDropTimeUpdate();
    score = 0;
    level = 0;
    clearedRowsCounter = 0;
    finalScore = 0;
    endingLevel = 0;
    levelUp(0);
    calScore(0);
    elapsedTime = 0;
    gameoverEnteredTime = 0;
    totalPlayTime = 0;
    timePreviousFrame = 0;
    dropInterval = 1000;
    dropTimeCounter = 0;
    isSoftDropping = false;
    const resetGrid = Array.from({length: rows}, () => Array(cols).fill(null));
    grid.length = 0;
    grid.push(...resetGrid);
    q.queue.length = 0;
    currentPiece = "";
    nickname = undefined;
    nicknameInput.value = "";
    startingMsg.textContent = "";
    rankingExpanded = false;
    rankingList.classList.remove('expanded');
}


function moveLeft() {
    const checkingPieceL = { ...currentPiece, left: currentPiece.left - 1 };
    const checkingCellsL = cellsAbsolutePosition(checkingPieceL);
    if(isValidPosition(checkingCellsL) && isEmptySpace(checkingCellsL, grid)){
        currentPiece.left = checkingPieceL.left;
    }
    draw();
}
function moveRight() {
    const checkingPieceR = { ...currentPiece, left: currentPiece.left + 1 };
    const checkingCellsR = cellsAbsolutePosition(checkingPieceR);
    if(isValidPosition(checkingCellsR) && isEmptySpace(checkingCellsR, grid)){
        currentPiece.left = checkingPieceR.left;
    }
    draw();
}
function rotateCW() {
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
    } else {
        let kickTable = WallKicks_JLSTZ;
        if(checkingPieceCW.blockName == 'I') kickTable = WallKicks_I;
        for (let i = 0; i < 5; i++) {
            const [deltaLeft, deltaTop] = kickTable[currentPiece.direction][i];
            const kickedCells = checkingCellsCW.map(cell => [cell[0] + deltaLeft, cell[1] + deltaTop]);
            if (isValidPosition(kickedCells) && isEmptySpace(kickedCells, grid)) {
                currentPiece.cells = checkingPieceCW.cells;
                currentPiece.direction = nextDirection;
                currentPiece.left += deltaLeft;
                currentPiece.top += deltaTop;
                break;
            }
        }
    }
    draw();
}
function rotateCCW() {
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
    } else {
        let kickTable = WallKicks_JLSTZ_ACW;
        if(checkingPieceACW.blockName == 'I') kickTable = WallKicks_I_ACW;
        for (let i = 0; i < 5; i++) {
            const [deltaLeft, deltaTop] = kickTable[currentPiece.direction][i];
            const kickedCells = checkingCellsACW.map(cell => [cell[0] + deltaLeft, cell[1] + deltaTop]);
            if (isValidPosition(kickedCells) && isEmptySpace(kickedCells, grid)) {
                currentPiece.cells = checkingPieceACW.cells;
                currentPiece.direction = ACWnextDirection;
                currentPiece.left += deltaLeft;
                currentPiece.top += deltaTop;
                break;
            }
        }
    }
    draw();
}
function startSoftDrop() {
    if(state !== 'PLAYING') return;
    isSoftDropping = true;
    dropTimeCounter = 0;
    draw();
}
function stopSoftDrop() {
    isSoftDropping = false;
    draw();
}

window.addEventListener('keydown', (event) => {
    if(state !== 'PLAYING') return; 
    switch (event.code) {
        case "ArrowLeft": moveLeft(); break;
        case "ArrowRight": moveRight(); break;
        case "ArrowDown": startSoftDrop(); break;
        case "KeyX": rotateCW(); break;
        case "KeyZ": rotateCCW(); break;
        case "Space": hardDrop(); break;
    }
    draw();
})
window.addEventListener('keyup', (event) => {
    if(event.key == "ArrowDown" || event.key == "Space") {
        stopSoftDrop();
    }
    draw();
})