import classicGame from "./games/classic.js";
import dragonGame from "./games/dragon.js";
import spaceGame from "./games/space.js";

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

  if (
    !config.prizes ||
    [3, 4, 5].some((count) => !Number.isSafeInteger(config.prizes[count]) || config.prizes[count] < 0)
  ) {
    return "la tabla de premios debe definir importes válidos para 3, 4 y 5 símbolos";
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
