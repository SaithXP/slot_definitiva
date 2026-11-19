const LEGACY_CLASSIC_STORAGE_KEY = "golden-reels-game-v1";
const SELECTED_GAME_KEY = "golden-reels-selected-game";
const MAX_HISTORY = 20;

function storageKeyForGame(gameId) {
  if (typeof gameId !== "string" || !/^[a-z0-9][a-z0-9-]*$/.test(gameId)) {
    throw new Error("El identificador del juego no es válido.");
  }

  return `golden-reels-${gameId}-v1`;
}

export function loadSelectedGameId(gameIds, defaultGameId = "classic") {
  const selectedGameId = localStorage.getItem(SELECTED_GAME_KEY);
  return gameIds.includes(selectedGameId) ? selectedGameId : defaultGameId;
}

export function saveSelectedGameId(gameId) {
  localStorage.setItem(SELECTED_GAME_KEY, gameId);
}

export function createInitialGameState(initialCredits) {
  return {
    credits: initialCredits,
    statistics: {
      totalSpins: 0,
      totalBet: 0,
      totalWon: 0,
      winningSpins: 0,
      biggestPrize: 0
    },
    history: []
  };
}

function isNonNegativeInteger(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

function isValidGameState(state) {
  if (!state || typeof state !== "object" || !state.statistics || !Array.isArray(state.history)) {
    return false;
  }

  const { statistics } = state;
  const validStatistics = [
    statistics.totalSpins,
    statistics.totalBet,
    statistics.totalWon,
    statistics.winningSpins,
    statistics.biggestPrize
  ].every(isNonNegativeInteger);

  const validHistory = state.history.length <= MAX_HISTORY && state.history.every((record) =>
    record &&
    isNonNegativeInteger(record.number) &&
    typeof record.combination === "string" &&
    isNonNegativeInteger(record.bet) &&
    isNonNegativeInteger(record.prize) &&
    (record.result === "Ganadora" || record.result === "Perdedora")
  );

  return isNonNegativeInteger(state.credits) &&
    validStatistics &&
    statistics.winningSpins <= statistics.totalSpins &&
    state.history.length <= statistics.totalSpins &&
    validHistory;
}

export function loadGameState(gameId, initialCredits) {
  const storageKey = storageKeyForGame(gameId);
  let savedState = localStorage.getItem(storageKey);

  // Classic usaba esta clave antes de que las partidas se separaran por ID.
  if (savedState === null && gameId === "classic") {
    savedState = localStorage.getItem(LEGACY_CLASSIC_STORAGE_KEY);
  }

  if (savedState === null) {
    return createInitialGameState(initialCredits);
  }

  let state;
  try {
    state = JSON.parse(savedState);
  } catch {
    throw new Error("Los datos guardados no contienen JSON válido.");
  }

  if (!isValidGameState(state)) {
    throw new Error("Los datos guardados no tienen un formato válido.");
  }

  return state;
}

export function saveGameState(gameId, state) {
  localStorage.setItem(storageKeyForGame(gameId), JSON.stringify(state));
  if (gameId === "classic") {
    localStorage.removeItem(LEGACY_CLASSIC_STORAGE_KEY);
  }
}

export function clearSavedGame(gameId) {
  localStorage.removeItem(storageKeyForGame(gameId));
  if (gameId === "classic") {
    localStorage.removeItem(LEGACY_CLASSIC_STORAGE_KEY);
  }
}

// Actualiza las estadísticas y añade la jugada más reciente al principio del historial.
export function recordCompletedSpin(state, combinations, bet, prize) {
  const totalSpins = state.statistics.totalSpins + 1;
  const combination = combinations.length === 0
    ? "Sin combinación ganadora"
    : combinations
      .map(({ row, symbol, count, lineIndex }) =>
        `${Number.isInteger(lineIndex) ? `Línea ${lineIndex + 1}` : `Fila ${row + 1}`}: ${count} ${symbol}`)
      .join(" · ");

  const record = {
    number: totalSpins,
    combination,
    bet,
    prize,
    result: prize > 0 ? "Ganadora" : "Perdedora"
  };

  return {
    credits: state.credits + prize,
    statistics: {
      totalSpins,
      totalBet: state.statistics.totalBet + bet,
      totalWon: state.statistics.totalWon + prize,
      winningSpins: state.statistics.winningSpins + (prize > 0 ? 1 : 0),
      biggestPrize: Math.max(state.statistics.biggestPrize, prize)
    },
    history: [record, ...state.history].slice(0, MAX_HISTORY)
  };
}
