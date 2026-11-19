import { COLUMNS, ROWS } from "./config.js";

function evaluateLineWins(grid, { paylines } = {}) {
  const combinations = [];
  const configuredLines = paylines ?? Array.from(
    { length: ROWS },
    (_, row) => Array(COLUMNS).fill(row)
  );

  configuredLines.forEach((payline, lineIndex) => {
    const symbol = grid[0][payline[0]];
    let count = 1;

    while (count < COLUMNS && grid[count][payline[count]] === symbol) {
      count += 1;
    }

    if (count >= 3) {
      const combination = { row: payline[0], symbol, count };
      if (paylines) {
        combination.lineIndex = lineIndex;
        combination.positions = Array.from({ length: count }, (_, column) => ({
          column,
          row: payline[column]
        }));
      }
      combinations.push(combination);
    }
  });

  return combinations;
}

const COMBINATION_RULES = new Map([["lineWins", evaluateLineWins]]);

export function registerCombinationRule(name, evaluator) {
  if (typeof name !== "string" || name.trim().length === 0 || typeof evaluator !== "function") {
    throw new Error("La regla debe tener un nombre y un evaluador válidos.");
  }
  if (COMBINATION_RULES.has(name)) {
    throw new Error(`La regla de combinación "${name}" ya está registrada.`);
  }

  COMBINATION_RULES.set(name, evaluator);
}

export function isCombinationRuleRegistered(name) {
  return COMBINATION_RULES.has(name);
}

// Configurations predating the rules field keep the original line-win behavior.
export function evaluateCombinations(grid, rules, context = {}) {
  const activeRules = rules ?? { lineWins: true };
  const combinations = [];

  for (const [ruleName, enabled] of Object.entries(activeRules)) {
    if (!enabled) {
      continue;
    }

    const evaluateRule = COMBINATION_RULES.get(ruleName);
    if (!evaluateRule) {
      throw new Error(`La regla de combinación "${ruleName}" no está registrada.`);
    }

    combinations.push(...evaluateRule(grid, context));
  }

  return combinations;
}
