export function calculatePrize(combinations, prizeTable) {
  return combinations.reduce((total, combination) => total + prizeTable[combination.count], 0);
}
