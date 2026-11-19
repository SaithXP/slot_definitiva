import { COLUMNS, REEL_STOP_DELAY, ROWS, SYMBOL_TICK } from "./config.js";
import { generateRandomSymbol } from "./slotEngine.js";

const reelsElement = document.querySelector("#reels");
const creditsElement = document.querySelector("#credits");
const spinButton = document.querySelector("#spin-button");
const resultElement = document.querySelector("#result");
const storageMessageElement = document.querySelector("#storage-message");
const spinCostElement = document.querySelector("#spin-cost");
const titleLeadElement = document.querySelector("#game-title-lead");
const titleAccentElement = document.querySelector("#game-title-accent");
const paytableElement = document.querySelector("#paytable");
const reels = [];
const cells = [];

// Construye y guarda las referencias a los rodillos y sus filas.
export function createReels(gameConfig) {
  for (let column = 0; column < COLUMNS; column += 1) {
    const reel = document.createElement("div");
    reel.className = "reel";
    reel.setAttribute("aria-label", `Rodillo ${column + 1}`);
    cells[column] = [];

    for (let row = 0; row < ROWS; row += 1) {
      const cell = document.createElement("span");
      cell.className = "symbol";
      cell.textContent = generateRandomSymbol(gameConfig);
      cell.setAttribute("aria-label", cell.textContent);
      reel.append(cell);
      cells[column][row] = cell;
    }

    reelsElement.append(reel);
    reels.push(reel);
  }
}

export function applyGameConfig(gameConfig) {
  titleLeadElement.textContent = gameConfig.titleLead;
  titleAccentElement.textContent = gameConfig.titleAccent;
  document.title = `${gameConfig.name} — Tragaperras demo`;

  const { colors } = gameConfig;
  const rootStyle = document.documentElement.style;
  rootStyle.setProperty("--background", colors.background);
  rootStyle.setProperty("--panel", colors.panel);
  rootStyle.setProperty("--panel-dark", colors.panelDark);
  rootStyle.setProperty("--gold", colors.primary);
  rootStyle.setProperty("--gold-light", colors.accent);
  rootStyle.setProperty("--gold-dark", colors.primaryDark);
  rootStyle.setProperty("--button-top", colors.accent);
  rootStyle.setProperty("--button-bottom", colors.primary);
  rootStyle.setProperty("--button-shadow", colors.primaryDark);
  rootStyle.setProperty("--button-glow", colors.buttonGlow);
  rootStyle.setProperty("--game-glow", colors.glow);
  spinCostElement.textContent = gameConfig.spinCost.toLocaleString("es-ES");

  for (let column = 0; column < COLUMNS; column += 1) {
    for (let row = 0; row < ROWS; row += 1) {
      setCellSymbol(column, row, generateRandomSymbol(gameConfig));
    }
  }

  paytableElement.replaceChildren();
  for (const [count, prize] of Object.entries(gameConfig.prizes).sort(([a], [b]) => Number(a) - Number(b))) {
    const item = document.createElement("span");
    item.append(`${count} iguales `);
    const amount = document.createElement("strong");
    amount.textContent = prize.toLocaleString("es-ES");
    item.append(amount);
    paytableElement.append(item);
  }
}

export function populateGameSelector(gameCatalog) {
  const gameSelector = document.querySelector("#game-selector");
  gameSelector.replaceChildren();

  for (const { id, label } of gameCatalog) {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = label;
    gameSelector.append(option);
  }
}

function setCellSymbol(column, row, symbol) {
  cells[column][row].textContent = symbol;
  cells[column][row].setAttribute("aria-label", symbol);
}

// Detiene cada rodillo por orden y revela su columna final.
export async function stopReels(finalGrid, gameConfig) {
  for (let column = 0; column < COLUMNS; column += 1) {
    reels[column].classList.add("spinning");
    const ticker = window.setInterval(() => {
      for (let row = 0; row < ROWS; row += 1) {
        setCellSymbol(column, row, generateRandomSymbol(gameConfig));
      }
    }, SYMBOL_TICK);

    await new Promise((resolve) => window.setTimeout(resolve, REEL_STOP_DELAY));
    window.clearInterval(ticker);
    reels[column].classList.remove("spinning");

    for (let row = 0; row < ROWS; row += 1) {
      setCellSymbol(column, row, finalGrid[column][row]);
    }
  }
}

export function clearWinningHighlights() {
  for (const column of cells) {
    for (const cell of column) {
      cell.classList.remove("winner");
    }
  }
}

export function highlightWinningCombinations(combinations) {
  for (const { row, count } of combinations) {
    for (let column = 0; column < count; column += 1) {
      cells[column][row].classList.add("winner");
    }
  }
}

export function updateCredits(credits, canSpin) {
  creditsElement.textContent = credits.toLocaleString("es-ES");
  spinButton.disabled = !canSpin;
}

export function renderStatistics(statistics, credits) {
  document.querySelector("#stat-spins").textContent = statistics.totalSpins.toLocaleString("es-ES");
  document.querySelector("#stat-bet").textContent = statistics.totalBet.toLocaleString("es-ES");
  document.querySelector("#stat-won").textContent = statistics.totalWon.toLocaleString("es-ES");
  document.querySelector("#stat-winning-spins").textContent = statistics.winningSpins.toLocaleString("es-ES");
  document.querySelector("#stat-biggest-prize").textContent = statistics.biggestPrize.toLocaleString("es-ES");
  document.querySelector("#stat-balance").textContent = credits.toLocaleString("es-ES");
}

export function renderHistory(history) {
  const historyBody = document.querySelector("#history-body");
  historyBody.replaceChildren();

  if (history.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.className = "history-empty";
    cell.colSpan = 5;
    cell.textContent = "Todavía no hay tiradas.";
    row.append(cell);
    historyBody.append(row);
    return;
  }

  for (const record of history) {
    const row = document.createElement("tr");
    const values = [
      `#${record.number}`,
      record.combination,
      record.bet.toLocaleString("es-ES"),
      record.prize.toLocaleString("es-ES"),
      record.result
    ];

    for (const value of values) {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.append(cell);
    }

    if (record.result === "Ganadora") {
      row.lastElementChild.className = "history-result is-win";
    } else {
      row.lastElementChild.className = "history-result";
    }

    historyBody.append(row);
  }
}

export function showStorageMessage(message = "") {
  storageMessageElement.textContent = message;
  storageMessageElement.hidden = message.length === 0;
}

export function showInitialMessage() {
  resultElement.classList.remove("is-win");
  resultElement.textContent = "Pulsa SPIN para empezar";
}

export function showSpinningMessage() {
  resultElement.classList.remove("is-win");
  resultElement.textContent = "Los rodillos están girando...";
}

export function showResult(combinations, prize) {
  resultElement.classList.remove("is-win");

  if (prize === 0) {
    resultElement.textContent = "Esta vez no hubo premio. ¡Prueba de nuevo!";
    return;
  }

  const details = combinations
    .map(({ symbol, count }) => `${count} ${symbol}`)
    .join(" · ");
  resultElement.textContent = `¡Has ganado ${prize} créditos! ${details}`;
  resultElement.classList.add("is-win");
}
