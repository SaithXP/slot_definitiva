import { COLUMNS, ROWS } from "./config.js";

// Devuelve un símbolo aleatorio de la colección disponible.
export function generateRandomSymbol(gameConfig) {
  const symbols = gameConfig.symbols;
  return symbols[Math.floor(Math.random() * symbols.length)];
}

export function createRandomGrid(gameConfig) {
  return Array.from({ length: COLUMNS }, () =>
    Array.from({ length: ROWS }, () => generateRandomSymbol(gameConfig))
  );
}

// Cuenta las coincidencias consecutivas desde el primer rodillo de cada fila.
export function checkWinningCombinations(grid) {
  const combinations = [];

  for (let row = 0; row < ROWS; row += 1) {
    const symbol = grid[0][row];
    let count = 1;

    while (count < COLUMNS && grid[count][row] === symbol) {
      count += 1;
    }

    if (count >= 3) {
      combinations.push({ row, symbol, count });
    }
  }

  return combinations;
}

export function calculatePrize(combinations, prizeTable) {
  return combinations.reduce((total, combination) => total + prizeTable[combination.count], 0);
}
