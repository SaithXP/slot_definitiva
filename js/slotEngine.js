import { COLUMNS, ROWS } from "./config.js";
import { evaluateCombinations } from "./combinationEvaluator.js";
import { applyMechanics } from "./mechanics.js";
import { calculatePrize } from "./prizeCalculator.js";

export { calculatePrize } from "./prizeCalculator.js";

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

// Kept as a compatibility export for existing callers.
export function checkWinningCombinations(grid, rules) {
  return evaluateCombinations(grid, rules);
}

export function evaluateSpin(grid, gameConfig) {
  const combinations = evaluateCombinations(grid, gameConfig.rules, {
    paylines: gameConfig.paylines
  });
  const basePrize = calculatePrize(combinations, gameConfig.prizes);

  return applyMechanics({
    grid,
    combinations,
    basePrize,
    prize: basePrize,
    effects: []
  }, gameConfig.mechanics);
}
