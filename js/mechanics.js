const MECHANIC_HANDLERS = new Map();

export function registerMechanic(name, handler) {
  if (typeof name !== "string" || name.trim().length === 0 || typeof handler !== "function") {
    throw new Error("La mecánica debe tener un nombre y un manejador válidos.");
  }
  if (MECHANIC_HANDLERS.has(name)) {
    throw new Error(`La mecánica "${name}" ya está registrada.`);
  }

  MECHANIC_HANDLERS.set(name, handler);
}

export function isMechanicRegistered(name) {
  return MECHANIC_HANDLERS.has(name);
}

// Mechanics can transform the common spin result without changing slotEngine.
export function applyMechanics(result, configuredMechanics = {}) {
  let currentResult = result;

  for (const [name, settings] of Object.entries(configuredMechanics ?? {})) {
    const enabled = settings === true ||
      (settings && typeof settings === "object" && settings.enabled === true);
    if (!enabled) {
      continue;
    }

    const handler = MECHANIC_HANDLERS.get(name);
    if (!handler) {
      throw new Error(`La mecánica "${name}" está activada pero no está implementada.`);
    }

    const updatedResult = handler(currentResult, settings);
    if (!updatedResult || typeof updatedResult !== "object") {
      throw new Error(`La mecánica "${name}" devolvió un resultado no válido.`);
    }

    currentResult = updatedResult;
  }

  return currentResult;
}
