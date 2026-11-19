import classicGame from "./games/classic.js";
import dragonGame from "./games/dragon.js";
import spaceGame from "./games/space.js";
import { isCombinationRuleRegistered } from "./combinationEvaluator.js";
import { isMechanicRegistered } from "./mechanics.js";
import { COLUMNS, ROWS } from "./config.js";

const configuredGames = [
  { id: classicGame && classicGame.id, label: "Classic", config: classicGame },
  { id: dragonGame && dragonGame.id, label: "Dragon", config: dragonGame },
  { id: spaceGame && spaceGame.id, label: "Space", config: spaceGame }
];

const requiredColors = [
  "background",
  "panel",
  "panelDark",
  "primary",
  "accent",
  "primaryDark",
  "glow",
  "buttonGlow"
];

export function getConfigurationError(entry) {
  if (!entry || typeof entry !== "object") {
    return "la entrada del catálogo no es válida";
  }

  const { id, label, config } = entry;
  if (
    typeof id !== "string" ||
    !/^[a-z0-9][a-z0-9-]*$/.test(id) ||
    typeof label !== "string" ||
    label.trim().length === 0 ||
    !config ||
    config.id !== id
  ) {
    return "identificador, etiqueta o configuración incompletos";
  }

  if (
    typeof config.name !== "string" ||
    config.name.trim().length === 0 ||
    typeof config.titleLead !== "string" ||
    config.titleLead.trim().length === 0 ||
    typeof config.titleAccent !== "string" ||
    config.titleAccent.trim().length === 0 ||
    !Array.isArray(config.symbols) ||
    config.symbols.length === 0 ||
    config.symbols.some((symbol) => typeof symbol !== "string" || symbol.length === 0)
  ) {
    return "nombre o símbolos no válidos";
  }

  if (
    !Number.isSafeInteger(config.spinCost) ||
    config.spinCost <= 0 ||
    !Number.isSafeInteger(config.initialCredits) ||
    config.initialCredits < 0
  ) {
    return "coste o saldo inicial no válidos";
  }

  if (config.paylines !== undefined) {
    if (
      !Array.isArray(config.paylines) ||
      config.paylines.length === 0 ||
      config.spinCost % config.paylines.length !== 0
    ) {
      return "las líneas de pago deben ser válidas y dividir el coste de tirada";
    }

    const uniquePaylines = new Set();
    for (const payline of config.paylines) {
      if (
        !Array.isArray(payline) ||
        payline.length !== COLUMNS ||
        payline.some((row) => !Number.isInteger(row) || row < 0 || row >= ROWS)
      ) {
        return `cada línea de pago debe definir ${COLUMNS} filas válidas`;
      }
      const key = payline.join(",");
      if (uniquePaylines.has(key)) {
        return "las líneas de pago no pueden estar duplicadas";
      }
      uniquePaylines.add(key);
    }
  }

  if (
    !config.prizes ||
    [3, 4, 5].some((count) => !Number.isSafeInteger(config.prizes[count]) || config.prizes[count] < 0)
  ) {
    return "la tabla de premios debe definir importes válidos para 3, 4 y 5 símbolos";
  }

  const rules = config.rules ?? { lineWins: true };
  if (!rules || typeof rules !== "object" || Array.isArray(rules)) {
    return "las reglas deben ser un objeto";
  }
  for (const [name, enabled] of Object.entries(rules)) {
    if (typeof enabled !== "boolean" || (enabled && !isCombinationRuleRegistered(name))) {
      return `la regla "${name}" no es válida o no está registrada`;
    }
  }

  const mechanics = config.mechanics ?? {};
  if (typeof mechanics !== "object" || Array.isArray(mechanics)) {
    return "las mecánicas deben ser un objeto";
  }
  for (const [name, settings] of Object.entries(mechanics)) {
    const validSettings = typeof settings === "boolean" ||
      (settings && typeof settings === "object" && !Array.isArray(settings) && typeof settings.enabled === "boolean");
    const enabled = settings === true || (settings && typeof settings === "object" && settings.enabled === true);
    if (!validSettings || (enabled && !isMechanicRegistered(name))) {
      return `la mecánica "${name}" no es válida o no está registrada`;
    }
  }

  if (
    !config.colors ||
    requiredColors.some((color) => typeof config.colors[color] !== "string" || config.colors[color].length === 0)
  ) {
    return "los colores están incompletos";
  }

  return null;
}

export const INVALID_GAME_CONFIGS = [];
const registeredIds = new Set();

// Las configuraciones inválidas o duplicadas se omiten para no afectar a los juegos válidos.
export const GAME_CATALOG = configuredGames.filter((entry) => {
  const error = getConfigurationError(entry);
  if (error || registeredIds.has(entry.id)) {
    INVALID_GAME_CONFIGS.push(
      `${entry.label || entry.id || "Juego"}: ${error || "el ID está duplicado"}`
    );
    return false;
  }

  registeredIds.add(entry.id);
  return true;
});

export const GAME_CONFIGS = Object.fromEntries(
  GAME_CATALOG.map(({ id, config }) => [id, config])
);
