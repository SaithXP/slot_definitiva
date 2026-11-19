export default {
  id: "space",
  name: "Space Odyssey",
  titleLead: "SPACE",
  titleAccent: "ODYSSEY",
  symbols: ["🚀", "🪐", "🌙", "⭐", "👽", "🛸", "☄️"],
  prizes: { 3: 30, 4: 70, 5: 250 },
  rules: { lineWins: true },
  paylines: [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0],
    [2, 2, 2, 2, 2],
    [0, 1, 2, 1, 0],
    [2, 1, 0, 1, 2],
    [0, 0, 1, 2, 2],
    [2, 2, 1, 0, 0],
    [1, 0, 0, 0, 1],
    [1, 2, 2, 2, 1],
    [0, 1, 0, 1, 0]
  ],
  mechanics: {
    wild: false,
    scatter: false,
    multiplier: false,
    freeSpins: false
  },
  spinCost: 20,
  initialCredits: 1500,
  colors: {
    background: "#08111f",
    panel: "#122842",
    panelDark: "#0c1a2e",
    primary: "#49c9f5",
    accent: "#c7f5ff",
    primaryDark: "#16749a",
    glow: "rgba(37, 132, 189, 0.22)",
    buttonGlow: "rgba(73, 201, 245, 0.25)"
  }
};
