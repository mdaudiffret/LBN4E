;(function() {
// games/mastermind.jsx — Code du Coffre
const { useState, useEffect } = React;

const COLORS = [
  { id: "gold",    hex: "#D4A24C" },
  { id: "cyan",    hex: "#00E5FF" },
  { id: "magenta", hex: "#FF1B8D" },
  { id: "green",   hex: "#4ADE80" },
  { id: "purple",  hex: "#A855F7" },
  { id: "orange",  hex: "#FB923C" },
];

const CONFIG = {
  1: { positions: 3, colors: 4, maxTries: 10 },
  2: { positions: 4, colors: 5, maxTries: 9 },
  3: { positions: 4, colors: 6, maxTries: 8 },
};

function makeSecret(positions, numColors) {
  const secret = [];
  for (let i = 0; i < positions; i++) {
    secret.push(Math.floor(Math.random() * numColors));
  }
  return secret;
}

function score(secret, guess) {
  let black = 0;
  let white = 0;
  const sUsed = secret.map(() => false);
  const gUsed = guess.map(() => false);
  for (let i = 0; i < secret.length; i++) {
    if (guess[i] === secret[i]) { black++; sUsed[i] = true; gUsed[i] = true; }
  }
  for (let i = 0; i < guess.length; i++) {
    if (gUsed[i]) continue;
    for (let j = 0; j < secret.length; j++) {
      if (!sUsed[j] && guess[i] === secret[j]) { white++; sUsed[j] = true; break; }
    }
  }
  return { black, white };
}

function PegDots({ black, white, total }) {
  const pegs = [];
  for (let i = 0; i < black; i++) pegs.push("black");
  for (let i = 0; i < white; i++) pegs.push("white");
  for (let i = pegs.length; i < total; i++) pegs.push("empty");
  return React.createElement("div", {
    style: { display: "flex", flexWrap: "wrap", gap: 4, width: 36, alignContent: "flex-start" }
  },
    pegs.map((p, i) =>
      React.createElement("div", {
        key: i,
        style: {
          width: 12, height: 12, borderRadius: "50%",
          background: p === "black" ? "var(--pearl)" : p === "white" ? "transparent" : "var(--line-dim)",
          border: p === "white" ? "2px solid var(--pearl)" : "none",
          boxSizing: "border-box"
        }
      })
    )
  );
}

function MastermindGame({ level, onHud, onFinish }) {
  const cfg = CONFIG[level];
  const { positions, colors: numColors, maxTries } = cfg;
  const palette = COLORS.slice(0, numColors);

  const [secret] = useState(() => makeSecret(positions, numColors));
  const [history, setHistory] = useState([]);
  const [current, setCurrent] = useState(() => Array(positions).fill(null));
  const [selected, setSelected] = useState(0); // currently selected palette color
  const [phase, setPhase] = useState("playing");

  useEffect(() => { onHud({ score: history.length, total: maxTries }); }, [history.length]);

  function placeColor(pos) {
    if (phase !== "playing") return;
    setCurrent(prev => { const n = prev.slice(); n[pos] = selected; return n; });
  }

  function clearPos(pos) {
    if (phase !== "playing") return;
    setCurrent(prev => { const n = prev.slice(); n[pos] = null; return n; });
  }

  function submit() {
    if (current.some(c => c === null)) return;
    const { black, white } = score(secret, current);
    const entry = { guess: current.slice(), black, white };
    const newHistory = [...history, entry];
    setHistory(newHistory);
    onHud({ score: newHistory.length, total: maxTries });

    if (black === positions) {
      setPhase("won");
      setTimeout(() => onFinish(1), 1200);
      return;
    }
    if (newHistory.length >= maxTries) {
      setPhase("lost");
      setTimeout(() => onFinish(0), 1600);
      return;
    }
    setCurrent(Array(positions).fill(null));
  }

  const canSubmit = phase === "playing" && current.every(c => c !== null);
  const dotSize = 44;

  return (
    React.createElement("div", { className: "col", style: { flex: 1, gap: 14, alignItems: "center" } },

      // Header
      React.createElement("div", { className: "row", style: { justifyContent: "space-between", width: "100%" } },
        React.createElement("span", { className: "prompt__instruction" },
          `Essai ${Math.min(history.length + 1, maxTries)} / ${maxTries}`
        ),
        React.createElement("span", { className: "prompt__instruction" },
          `${positions} positions · ${numColors} couleurs`
        )
      ),

      // History
      history.length > 0 && React.createElement("div", {
        style: { width: "100%", display: "flex", flexDirection: "column", gap: 6 }
      },
        history.map((entry, hi) =>
          React.createElement("div", {
            key: hi,
            style: {
              display: "flex", alignItems: "center", gap: 10,
              padding: "7px 12px",
              background: "var(--char-2)",
              borderRadius: 10,
              border: "1px solid var(--line-dim)"
            }
          },
            React.createElement("span", {
              style: { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--bone)", minWidth: 18 }
            }, `${hi + 1}.`),
            React.createElement("div", { style: { display: "flex", gap: 6 } },
              entry.guess.map((ci, pi) =>
                React.createElement("div", {
                  key: pi,
                  style: {
                    width: 26, height: 26, borderRadius: "50%",
                    background: COLORS[ci].hex,
                    boxShadow: `0 0 6px ${COLORS[ci].hex}55`
                  }
                })
              )
            ),
            React.createElement("div", { style: { marginLeft: "auto" } },
              React.createElement(PegDots, { black: entry.black, white: entry.white, total: positions })
            ),
            React.createElement("span", {
              style: { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--pearl)", minWidth: 48 }
            },
              entry.black > 0 || entry.white > 0 ? `${entry.black}⬛ ${entry.white}⬜` : "—"
            )
          )
        )
      ),

      // Palette selector
      React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8 } },
        React.createElement("span", {
          style: { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--bone)" }
        }, "1. Choisis une couleur"),
        React.createElement("div", { style: { display: "flex", gap: 10 } },
          palette.map((c, i) =>
            React.createElement("button", {
              key: i,
              onClick: () => setSelected(i),
              style: {
                width: 40, height: 40, borderRadius: "50%",
                background: c.hex,
                border: selected === i ? "3px solid var(--pearl)" : "3px solid transparent",
                boxShadow: selected === i ? `0 0 14px ${c.hex}` : `0 0 6px ${c.hex}55`,
                cursor: "pointer",
                transform: selected === i ? "scale(1.18)" : "scale(1)",
                transition: "all 0.15s"
              }
            })
          )
        )
      ),

      // Current guess row
      phase === "playing" && React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8 } },
        React.createElement("span", {
          style: { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--bone)" }
        }, "2. Place tes gemmes · clic droit pour effacer"),
        React.createElement("div", {
          style: {
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 16px",
            background: "var(--char-2)",
            borderRadius: 12,
            border: "1px solid var(--gold-soft)"
          }
        },
          React.createElement("div", { style: { display: "flex", gap: 10 } },
            current.map((ci, pi) =>
              React.createElement("button", {
                key: pi,
                onClick: () => placeColor(pi),
                onContextMenu: (e) => { e.preventDefault(); clearPos(pi); },
                style: {
                  width: dotSize, height: dotSize, borderRadius: "50%",
                  background: ci !== null ? COLORS[ci].hex : "var(--char-2)",
                  border: ci !== null ? `2px solid ${COLORS[ci].hex}` : "2px dashed var(--line)",
                  cursor: "pointer",
                  boxShadow: ci !== null ? `0 0 10px ${COLORS[ci].hex}66` : "none",
                  transition: "all 0.15s"
                }
              })
            )
          ),
          React.createElement("button", {
            className: "k-btn k-btn--brand k-btn--sm",
            onClick: submit,
            disabled: !canSubmit,
            style: { marginLeft: 8, opacity: canSubmit ? 1 : 0.4, cursor: canSubmit ? "pointer" : "default" }
          }, "Valider")
        )
      ),

      // Légende
      React.createElement("div", {
        style: { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--bone)", textAlign: "center", lineHeight: 1.6 }
      }, "⬛ bonne position · ⬜ bonne couleur, mauvaise position"),

      // Outcome
      (phase === "won" || phase === "lost") && React.createElement("div", {
        style: { marginTop: 8, padding: "12px 24px", borderRadius: 12, textAlign: "center" }
      },
        React.createElement("div", { className: `feedback ${phase === "won" ? "ok" : "ko"}` },
          phase === "won"
            ? `Code cracké en ${history.length} essai${history.length > 1 ? "s" : ""} !`
            : `Échec — le code était : ${secret.map(i => COLORS[i].id).join(" · ")}`
        )
      )
    )
  );
}

window.__GAMES__ = window.__GAMES__ || {};
window.__GAMES__.mastermind = MastermindGame;
})();
