import {
  createRandomGrid,
  evaluateSpin
} from "./slotEngine.js";
import {
  clearWinningHighlights,
  applyGameConfig,
  createReels,
  highlightWinningCombinations,
  populateGameSelector,
  renderHistory,
  renderStatistics,
  showInitialMessage,
  showResult,
  showStorageMessage,
  showSpinningMessage,
  stopReels,
  updateCredits
} from "./ui.js";
import {
  clearSavedGame,
  createInitialGameState,
  loadSelectedGameId,
  loadGameState,
  recordCompletedSpin,
  saveSelectedGameId,
  saveGameState
} from "./statistics.js";
import {
  GAME_CATALOG,
  GAME_CONFIGS,
  INVALID_GAME_CONFIGS
} from "./registry.js";

const gameSelector = document.querySelector("#game-selector");
let isSpinning = false;
const spinButton = document.querySelector("#spin-button");
const resetButton = document.querySelector("#reset-button");
const defaultGame = GAME_CONFIGS.classic ?? Object.values(GAME_CONFIGS)[0];
let activeGame = defaultGame;
let gameState;
const startupWarnings = INVALID_GAME_CONFIGS.length > 0
  ? [`Se omitieron configuraciones no válidas: ${INVALID_GAME_CONFIGS.join("; ")}`]
  : [];

try {
  const selectedGameId = loadSelectedGameId(Object.keys(GAME_CONFIGS), defaultGame.id);
  activeGame = GAME_CONFIGS[selectedGameId];
} catch (error) {
  const details = error instanceof Error ? error.message : "Error desconocido.";
  startupWarnings.push(`No se pudo recuperar el juego seleccionado. Se usará ${defaultGame.name}. ${details}`);
}

try {
  gameState = loadGameState(activeGame.id, activeGame.initialCredits);
} catch (error) {
  gameState = createInitialGameState(activeGame.initialCredits);
  const details = error instanceof Error ? error.message : "Error desconocido.";
  startupWarnings.push(`No se pudieron cargar los datos de ${activeGame.name}. Se iniciará una partida nueva. ${details}`);
}

function refreshGameState() {
  updateCredits(gameState.credits, !isSpinning && gameState.credits >= activeGame.spinCost);
  renderStatistics(gameState.statistics, gameState.credits);
  renderHistory(gameState.history);
  resetButton.disabled = isSpinning;
  gameSelector.disabled = isSpinning;
}

// Cobra la tirada, coordina el giro y aplica los premios al saldo ficticio.
async function executeSpin() {
  if (isSpinning || gameState.credits < activeGame.spinCost) {
    return;
  }

  isSpinning = true;
  gameState.credits -= activeGame.spinCost;
  refreshGameState();
  showSpinningMessage();
  clearWinningHighlights();

  const finalGrid = createRandomGrid(activeGame);
  await stopReels(finalGrid, activeGame);

  const spinResult = evaluateSpin(finalGrid, activeGame);
  highlightWinningCombinations(spinResult.combinations);
  gameState = recordCompletedSpin(
    gameState,
    spinResult.combinations,
    activeGame.spinCost,
    spinResult.prize
  );
  showResult(spinResult.combinations, spinResult.prize);

  isSpinning = false;
  refreshGameState();

  try {
    saveGameState(activeGame.id, gameState);
    showStorageMessage(startupWarnings.join(" "));
  } catch (error) {
    const details = error instanceof Error ? error.message : "Error desconocido.";
    showStorageMessage(`No se pudieron guardar los datos de la partida. ${details}`);
  }
}

function resetGame() {
  if (isSpinning || !window.confirm("¿Reiniciar la partida y borrar el saldo, las estadísticas y el historial guardados?")) {
    return;
  }

  try {
    clearSavedGame(activeGame.id);
  } catch (error) {
    const details = error instanceof Error ? error.message : "Error desconocido.";
    showStorageMessage(`No se pudieron borrar los datos guardados. ${details}`);
    return;
  }

  gameState = createInitialGameState(activeGame.initialCredits);
  clearWinningHighlights();
  showInitialMessage();
  showStorageMessage(startupWarnings.join(" "));
  refreshGameState();
}

function changeGame() {
  const nextGame = GAME_CONFIGS[gameSelector.value];
  if (!nextGame || nextGame.id === activeGame.id) {
    gameSelector.value = activeGame.id;
    return;
  }

  let nextState;
  let loadWarning = "";
  try {
    nextState = loadGameState(nextGame.id, nextGame.initialCredits);
  } catch (error) {
    nextState = createInitialGameState(nextGame.initialCredits);
    const details = error instanceof Error ? error.message : "Error desconocido.";
    loadWarning = `No se pudieron cargar los datos de ${nextGame.name}. Se iniciará una partida nueva. ${details}`;
  }

  try {
    saveSelectedGameId(nextGame.id);
  } catch (error) {
    gameSelector.value = activeGame.id;
    const details = error instanceof Error ? error.message : "Error desconocido.";
    showStorageMessage(`No se pudo guardar el juego seleccionado. ${details}`);
    return;
  }

  activeGame = nextGame;
  gameState = nextState;
  applyGameConfig(activeGame);
  clearWinningHighlights();
  showInitialMessage();
  showStorageMessage([startupWarnings.join(" "), loadWarning].filter(Boolean).join(" "));
  refreshGameState();
}

populateGameSelector(GAME_CATALOG);
gameSelector.value = activeGame.id;
createReels(activeGame);
applyGameConfig(activeGame);
refreshGameState();
showStorageMessage(startupWarnings.join(" "));
spinButton.addEventListener("click", executeSpin);
resetButton.addEventListener("click", resetGame);
gameSelector.addEventListener("change", changeGame);
