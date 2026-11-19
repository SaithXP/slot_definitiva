import assert from "node:assert/strict";
import test from "node:test";
import {
  calculatePrize,
  checkWinningCombinations,
  evaluateSpin
} from "../js/slotEngine.js";
import { getConfigurationError, GAME_CATALOG } from "../js/registry.js";
import classic from "../js/games/classic.js";
import dragon from "../js/games/dragon.js";
import space from "../js/games/space.js";
import {
  createInitialGameState,
  recordCompletedSpin
} from "../js/statistics.js";

function createGridWithWins(wins = []) {
  const grid = Array.from({ length: 5 }, (_, column) =>
    Array.from({ length: 3 }, (_, row) => `cell-${column}-${row}`)
  );

  for (const { lineIndex, count, symbol } of wins) {
    const payline = space.paylines[lineIndex];
    for (let column = 0; column < count; column += 1) {
      grid[column][payline[column]] = symbol;
    }
  }

  return grid;
}

test("Space configures ten unique paylines and charges 2 credits per line", () => {
  assert.equal(space.paylines.length, 10);
  assert.equal(new Set(space.paylines.map((line) => line.join(","))).size, 10);
  assert.ok(space.paylines.every((line) => line.length === 5 && line.every((row) => row >= 0 && row < 3)));
  assert.equal(space.spinCost / space.paylines.length, 2);
  assert.deepEqual(space.prizes, { 3: 30, 4: 70, 5: 250 });
  assert.ok(Object.values(space.mechanics).every((enabled) => enabled === false));
  assert.equal(getConfigurationError(GAME_CATALOG.find(({ id }) => id === "space")), null);
});

for (let lineIndex = 0; lineIndex < 10; lineIndex += 1) {
  test(`evaluates configured payline ${lineIndex + 1}`, () => {
    const combinations = evaluateSpin(
      createGridWithWins([{ lineIndex, count: 3, symbol: "WIN" }]),
      space
    ).combinations;

    assert.deepEqual(combinations.map(({ lineIndex: resultLine, count }) => ({
      lineIndex: resultLine,
      count
    })), [{ lineIndex, count: 3 }]);
  });
}

for (const count of [3, 4, 5]) {
  test(`pays only the longest ${count}-symbol combination on a line`, () => {
    const result = evaluateSpin(
      createGridWithWins([{ lineIndex: 0, count, symbol: "WIN" }]),
      space
    );

    assert.equal(result.combinations.length, 1);
    assert.equal(result.combinations[0].count, count);
    assert.deepEqual(
      result.combinations[0].positions,
      Array.from({ length: count }, (_, column) => ({
        column,
        row: space.paylines[0][column]
      }))
    );
    assert.equal(result.prize, space.prizes[count]);
  });
}

test("sums prizes from multiple winning paylines", () => {
  const result = evaluateSpin(createGridWithWins([
    { lineIndex: 0, count: 4, symbol: "FIRST" },
    { lineIndex: 1, count: 3, symbol: "SECOND" }
  ]), space);

  assert.deepEqual(
    result.combinations.map(({ lineIndex, count }) => ({ lineIndex, count })),
    [{ lineIndex: 0, count: 4 }, { lineIndex: 1, count: 3 }]
  );
  assert.equal(calculatePrize(result.combinations, space.prizes), 100);
  assert.equal(result.prize, 100);
});

test("returns no combinations or prize when no payline has three matches", () => {
  const result = evaluateSpin(createGridWithWins(), space);
  assert.deepEqual(result.combinations, []);
  assert.equal(result.prize, 0);
});

test("keeps Classic and Dragon's original three horizontal lines and payouts", () => {
  for (const [game, prizes] of [
    [classic, { 3: 20, 4: 50, 5: 150 }],
    [dragon, { 3: 25, 4: 60, 5: 200 }]
  ]) {
    assert.deepEqual(game.prizes, prizes);
    const grid = Array.from({ length: 5 }, (_, column) => [
      column < 5 ? "TOP" : `top-${column}`,
      column < 4 ? "MIDDLE" : `middle-${column}`,
      `bottom-${column}`
    ]);
    grid[0][2] = "BOTTOM";
    grid[1][2] = "BOTTOM";

    const expected = [
      { row: 0, symbol: "TOP", count: 5 },
      { row: 1, symbol: "MIDDLE", count: 4 }
    ];
    assert.deepEqual(checkWinningCombinations(grid), expected);

    const result = evaluateSpin(grid, game);
    assert.deepEqual(result.combinations, expected);
    assert.equal(result.prize, game.prizes[5] + game.prizes[4]);
  }
});

test("records one 20-credit wager and the combined prize in the existing game state", () => {
  const winningResult = evaluateSpin(createGridWithWins([
    { lineIndex: 0, count: 4, symbol: "FIRST" },
    { lineIndex: 1, count: 3, symbol: "SECOND" }
  ]), space);
  const stateAfterWager = createInitialGameState(space.initialCredits);
  stateAfterWager.credits -= space.spinCost;

  const updatedState = recordCompletedSpin(
    stateAfterWager,
    winningResult.combinations,
    space.spinCost,
    winningResult.prize
  );

  assert.equal(updatedState.credits, space.initialCredits - 20 + 100);
  assert.equal(updatedState.statistics.totalBet, 20);
  assert.equal(updatedState.statistics.totalWon, 100);
  assert.match(updatedState.history[0].combination, /Línea 1: 4 FIRST/);
  assert.match(updatedState.history[0].combination, /Línea 2: 3 SECOND/);
});
