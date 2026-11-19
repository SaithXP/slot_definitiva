export default {
  id: "dragon",
  name: "Dragon Treasure",
  titleLead: "DRAGON",
  titleAccent: "TREASURE",
  symbols: ["🐉", "🐲", "🧧", "🏮", "💰", "🌸", "🪙"],
  prizes: { 3: 25, 4: 60, 5: 200 },
  rules: { lineWins: true },
  mechanics: {
    wild: false,
    scatter: false,
    multiplier: false,
    freeSpins: false
  },
  spinCost: 15,
  initialCredits: 1200,
  colors: {
    background: "#140a10",
    panel: "#3c1722",
    panelDark: "#21131b",
    primary: "#e85d75",
    accent: "#ffd38a",
    primaryDark: "#942d43",
    glow: "rgba(180, 39, 67, 0.2)",
    buttonGlow: "rgba(232, 93, 117, 0.25)"
  }
};
