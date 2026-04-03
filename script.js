const gridElement = document.getElementById("grid");
const statusText = document.getElementById("statusText");
const resetBtn = document.getElementById("resetBtn");
const solveBtn = document.getElementById("solveBtn");
const algorithmSelect = document.getElementById("algorithm");

const rows = 10;
const cols = 10;

const startCell = { row: 0, col: 0 };
const goalCell = { row: 9, col: 9 };

let grid = [];

function createGridData() {
  grid = [];

  for (let row = 0; row < rows; row++) {
    const currentRow = [];

    for (let col = 0; col < cols; col++) {
      currentRow.push({
        row,
        col,
        isStart: row === startCell.row && col === startCell.col,
        isGoal: row === goalCell.row && col === goalCell.col,
        isWall: false,
        isVisited: false,
        isPath: false
      });
    }

    grid.push(currentRow);
  }
}

function clearSearchState() {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      grid[row][col].isVisited = false;
      grid[row][col].isPath = false;
    }
  }
}

function drawGrid() {
  gridElement.innerHTML = "";

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cellData = grid[row][col];
      const cell = document.createElement("div");

      cell.classList.add("cell");
      cell.dataset.row = row;
      cell.dataset.col = col;

      if (cellData.isWall) {
        cell.classList.add("wall");
      } else if (cellData.isPath) {
        cell.classList.add("path");
      } else if (cellData.isVisited) {
        cell.classList.add("visited");
      }

      if (cellData.isStart) {
        cell.classList.add("start");
      }

      if (cellData.isGoal) {
        cell.classList.add("goal");
      }

      cell.addEventListener("click", () => handleCellClick(row, col));

      gridElement.appendChild(cell);
    }
  }
}

function handleCellClick(row, col) {
  const cell = grid[row][col];

  if (cell.isStart || cell.isGoal) return;

  cell.isWall = !cell.isWall;
  clearSearchState();
  drawGrid();
  statusText.textContent = "Obstacle updated. Ready to solve.";
}

function resetGrid() {
  createGridData();
  drawGrid();
  statusText.textContent = "Grid reset. Build a new maze.";
}

function getNeighbors(row, col) {
  const directions = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 }
  ];

  const neighbors = [];

  for (const direction of directions) {
    const newRow = row + direction.row;
    const newCol = col + direction.col;

    const isInsideGrid =
      newRow >= 0 &&
      newRow < rows &&
      newCol >= 0 &&
      newCol < cols;

    if (isInsideGrid) {
      neighbors.push({ row: newRow, col: newCol });
    }
  }

  return neighbors;
}

function reconstructPath(parentMap, goalKey) {
  let currentKey = goalKey;

  while (parentMap.has(currentKey)) {
    const [row, col] = currentKey.split("-").map(Number);
    const cell = grid[row][col];

    if (!cell.isStart && !cell.isGoal) {
      cell.isVisited = false;
      cell.isPath = true;
    }

    currentKey = parentMap.get(currentKey);
  }
}

function bfs() {
  clearSearchState();

  const queue = [];
  const visited = new Set();
  const parentMap = new Map();

  const startKey = `${startCell.row}-${startCell.col}`;
  const goalKey = `${goalCell.row}-${goalCell.col}`;

  queue.push(startCell);
  visited.add(startKey);

  while (queue.length > 0) {
    const current = queue.shift();
    const currentKey = `${current.row}-${current.col}`;

    if (!grid[current.row][current.col].isStart && !grid[current.row][current.col].isGoal) {
      grid[current.row][current.col].isVisited = true;
    }

    if (currentKey === goalKey) {
      reconstructPath(parentMap, goalKey);
      statusText.textContent = "Path found using BFS.";
      drawGrid();
      return;
    }

    const neighbors = getNeighbors(current.row, current.col);

    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.row}-${neighbor.col}`;
      const neighborCell = grid[neighbor.row][neighbor.col];

      if (!visited.has(neighborKey) && !neighborCell.isWall) {
        queue.push(neighbor);
        visited.add(neighborKey);
        parentMap.set(neighborKey, currentKey);
      }
    }
  }

  statusText.textContent = "No path found with BFS.";
  drawGrid();
}

function dfs() {
  clearSearchState();

  const stack = [];
  const visited = new Set();
  const parentMap = new Map();

  const startKey = `${startCell.row}-${startCell.col}`;
  const goalKey = `${goalCell.row}-${goalCell.col}`;

  stack.push(startCell);
  visited.add(startKey);

  while (stack.length > 0) {
    const current = stack.pop();
    const currentKey = `${current.row}-${current.col}`;

    if (!grid[current.row][current.col].isStart && !grid[current.row][current.col].isGoal) {
      grid[current.row][current.col].isVisited = true;
    }

    if (currentKey === goalKey) {
      reconstructPath(parentMap, goalKey);
      statusText.textContent = "Path found using DFS.";
      drawGrid();
      return;
    }

    const neighbors = getNeighbors(current.row, current.col);

    for (let i = neighbors.length - 1; i >= 0; i--) {
      const neighbor = neighbors[i];
      const neighborKey = `${neighbor.row}-${neighbor.col}`;
      const neighborCell = grid[neighbor.row][neighbor.col];

      if (!visited.has(neighborKey) && !neighborCell.isWall) {
        stack.push(neighbor);
        visited.add(neighborKey);
        parentMap.set(neighborKey, currentKey);
      }
    }
  }

  statusText.textContent = "No path found with DFS.";
  drawGrid();
}

function solveMaze() {
  const selectedAlgorithm = algorithmSelect.value;

  if (selectedAlgorithm === "bfs") {
    bfs();
  } else if (selectedAlgorithm === "dfs") {
    dfs();
  }
}

resetBtn.addEventListener("click", resetGrid);
solveBtn.addEventListener("click", solveMaze);

function init() {
  createGridData();
  drawGrid();
  statusText.textContent = "Click cells to create obstacles, then solve with BFS or DFS.";
}

init();