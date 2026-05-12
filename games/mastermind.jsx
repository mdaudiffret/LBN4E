;(function() {
// games/mastermind.jsx — Code du Coffre
const { useState, useEffect, useRef } = React;

const COLORS = [
  { id: "gold",    hex: "#D4A24C" },
  { id: "cyan",    hex: "#00E5FF" },
  { id: "magenta", hex: "#FF1B8D" },
  { id: "green",   hex: "#4ADE80" },
  { id: "purple",  hex: "#A855F7" },
  { id: "orange",  hex: "#FB923C" },
];

const CONFIG = {
  1: { positions: 4, colors: 5, maxTries: 8 },
  2: { positions: 4, colors: 6, maxTries: 7 },
  3: { positions: 5, colors: 6, maxTries: 6 },
};

function makeSecret(positions, numColors) {
  const secret = [];
  for (let i = 0; i < positions; i++) {
    secret.push(Math.floor(Math.random() * numColors));
  }
  return secret;
}

function score(secret, guess) {
  let black = 0; // right color, right position
  let white = 0; // right color, wrong position
  const sUsed = secret.map(() => false);
  const gUsed = guess.map(() => false);

  // First pass: exact matches
  for (let i = 0; i < secret.length; i++) {
    if (guess[i] === secret[i]) {
      black++;
      sUsed[i] = true;
      gUsed[i] = true;
    }
  }
  // Second pass: color present but wrong position
  for (let i = 0; i < guess.length; i++) {
    if (gUsed[i]) continue;
    for (let j = 0; j < secret.length; j++) {
      if (!sUsed[j] && guess[i] === secret[j]) {
        white++;
        sUsed[j] = true;
        break;
      }
    }
  }
  return { black, white };
}

function ColorDot({ colorIdx, size, onClick, dimmed }) {
  const hex = colorIdx === null ? null : COLORS[colorIdx].hex;
  return React.createElement("button", {
    onClick,
    style: {
      width: size, height: size,
      borderRadius: "50%",
      background: hex || "var(--char-2)",
      border: `2px solid ${hex ? hex : "var(--line)"}`,
      cursor: onClick ? "pointer" : "default",
      opacity: dimmed ? 0.4 : 1,
      transition: "background 0.15s, border-color 0.15s, opacity 0.15s",
      flexShrink: 0,
      boxShadow: hex ? `0 0 8px ${hex}55` : "none"
    }
  });
}

function PegDots({ black, white, total }) {
  const pegs = [];
  for (let i = 0; i < black; i++) pegs.push("black");
  for (let i = 0; i < white; i++) pegs.push("white");
  for (let i = pegs.length; i < total; i++) pegs.push("empty");

  return React.createElement("div", {
    style: {
      display: "flex", flexWrap: "wrap",
      gap: 4,
      width: total <= 4 ? 36 : 46,
      alignContent: "flex-start"
    }
  },
    pegs.map((p, i) =>
      React.createElement("div", {
        key: i,
        style: {
          width: total <= 4 ? 12 : 10,
          height: total <= 4 ? 12 : 10,
          borderRadius: "50%",
          background: p === "black" ? "var(--pearl)"
                    : p === "white" ? "transparent"
                    : "var(--line-dim)",
          border: p === "white" ? "2px solid var(--pearl)" : "none",
          boxSizing: "border-box"
        }
      })
    )
  );
}

function MastermindGame({ level, onHud, onFinish }) {
  const cfg = CONFIG[level];
  const numColors = cfg.colors;
  const positions = cfg.positions;
  const maxTries = cfg.maxTries;
  const palette = COLORS.slice(0, numColors);

  const [secret] = useState(() => makeSecret(positions, numColors));
  const [history, setHistory] = useState([]); // [{guess:[...], black, white}]
  const [current, setCurrent] = useState(() => Array(positions).fill(null));
  const [phase, setPhase] = useState("playing"); // playing | won | lost
  const attemptNum = history.length + 1;

  useEffect(() => {
    onHud({ score: history.length, total: maxTries });
  }, [history.length]);

  function cycleColor(pos) {
    if (phase !== "playing") return;
    setCurrent(prev => {
      const next = prev.slice();
      const cur = prev[pos];
      if (cur === null) next[pos] = 0;
      else if (cur + 1 >= numColors) next[pos] = null;
      else next[pos] = cur + 1;
      return next;
    });
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
  const dotSize = positions <= 4 ? 44 : 36;

  return (
    React.createElement("div", { className: "col", style: { flex: 1, gap: 12, alignItems: "center" } },

      // Header
      React.createElement("div", { className: "row", style: { justifyContent: "space-between", width: "100%" } },
        React.createElement("span", { className: "prompt__instruction" },
          `Essai ${Math.min(attemptNum, maxTries)} / ${maxTries}`
        ),
        React.createElement("span", { className: "prompt__instruction" },
          `${positions} positions · ${numColors} couleurs`
        )
      ),

      // History
      React.createElement("div", {
        style: {
          width: "100%",
          display: "flex", flexDirection: "column", gap: 6,
          minHeight: 60
        }
      },
        history.map((entry, hi) =>
          React.createElement("div", {
            key: hi,
            style: {
              display: "flex", alignItems: "center", gap: 12,
              padding: "8px 12px",
              background: "var(--char-2)",
              borderRadius: 10,
              border: "1px solid var(--line-dim)"
            }
          },
            React.createElement("span", {
              style: {
                fontFamily: "var(--font-mono)", fontSize: 11,
                color: "var(--bone)", minWidth: 20
              }
            }, `${hi + 1}.`),
            React.createElement("div", { style: { display: "flex", gap: 6 } },
              entry.guess.map((ci, pi) =>
                React.createElement(ColorDot, { key: pi, colorIdx: ci, size: 28 })
              )
            ),
            React.createElement("div", { style: { marginLeft: "auto" } },
              React.createElement(PegDots, { black: entry.black, white: entry.white, total: positions })
            ),
            React.createElement("span", {
              style: {
                fontFamily: "var(--font-mono)", fontSize: 11,
                color: "var(--pearl)", minWidth: 50
              }
            },
              entry.black > 0 || entry.white > 0
                ? `${entry.black}⬛ ${entry.white}⬜`
                : "—"
            )
          )
        )
      ),

      // Divider
      history.length > 0 && React.createElement("div", {
        style: { width: "100%", height: 1, background: "var(--line-dim)" }
      }),

      // Current guess row
      phase === "playing" && React.createElement("div", {
        style: {
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 16px",
          background: "var(--char-2)",
          borderRadius: 12,
          border: "1px solid var(--gold-soft)"
        }
      },
        React.createElement("div", { style: { display: "flex", gap: 8 } },
          current.map((ci, pi) =>
            React.createElement(ColorDot, {
              key: pi,
              colorIdx: ci,
              size: dotSize,
              onClick: () => cycleColor(pi)
            })
          )
        ),
        React.createElement("button", {
          className: "k-btn k-btn--brand k-btn--sm",
          onClick: submit,
          disabled: !canSubmit,
          style: {
            marginLeft: 12,
            opacity: canSubmit ? 1 : 0.4,
            cursor: canSubmit ? "pointer" : "default"
          }
        }, "Valider")
      ),

      // Color legend
      React.createElement("div", {
        style: {
          display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center",
          marginTop: 4
        }
      },
        palette.map((c, i) =>
          React.createElement("div", { key: i, style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3 } },
            React.createElement("div", {
              style: {
                width: 16, height: 16, borderRadius: "50%",
                background: c.hex,
                boxShadow: `0 0 6px ${c.hex}66`
              }
            }),
            React.createElement("span", {
              style: { fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--bone)" }
            }, i + 1)
          )
        )
      ),

      // Hint
      React.createElement("div", {
        style: {
          fontFamily: "var(--font-mono)", fontSize: 11,
          color: "var(--bone)", textAlign: "center", lineHeight: 1.6
        }
      }, "Cliquez sur un cercle pour changer la couleur · ⬛ bonne position · ⬜ bonne couleur"),

      // Outcome overlay
      (phase === "won" || phase === "lost") && React.createElement("div", {
        style: {
          marginTop: 8,
          padding: "12px 24px",
          borderRadius: 12,
          textAlign: "center"
        }
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
