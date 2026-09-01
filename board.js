const cols = 10;
const rows = 20;
const createEmptyGrid = () => {
    const board = Array.from({length: rows}, () => Array(cols).fill(null));

    return board;
};
const grid = createEmptyGrid();

function isEmptySpace(checkingCells, grid) {
    return checkingCells.every(([col, row]) => grid[row][col] === null);
};