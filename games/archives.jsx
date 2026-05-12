;(function() {
// games/archives.jsx — Les Archives (Memory)
const { useState, useEffect, useRef, useCallback } = React;

const LEVELS = {
  1: { lv: 1, hint: "8 paires · 2:00",  maxTime: 120, target: 8,  total: 8,  cols: 4, rows: 4 },
  2: { lv: 2, hint: "10 paires · 1:30", maxTime: 90,  target: 10, total: 10, cols: 4, rows: 5 },
  3: { lv: 3, hint: "12 paires · 1:00", maxTime: 60,  target: 12, total: 12, cols: 4, rows: 6 },
};

const SYMBOLS = ["⚜", "⚔", "♔", "✠", "⚖", "☽", "⚗", "♜", "⛵", "⚠", "⚡", "✦"];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(total) {
  const syms = SYMBOLS.slice(0, total);
  return shuffle([...syms, ...syms].map((sym, i) => ({ id: i, sym, revealed: false, matched: false })));
}

function ArchivesGame({ level, onHud, onFinish }) {
  const cfg = LEVELS[level] || LEVELS[1];
  const [cards, setCards] = useState(() => buildDeck(cfg.total));
  const [flipped, setFlipped] = useState([]);   // indices of currently face-up (unmatched) cards
  const [locked, setLocked] = useState(false);
  const [found, setFound] = useState(0);
  const [time, setTime] = useState(cfg.maxTime);
  const [over, setOver] = useState(false);
  const foundRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => { foundRef.current = found; }, [found]);

  useEffect(() => {
    onHud({ score: found, total: cfg.total });
  }, [found]);

  // Timer
  useEffect(() => {
    if (over) return;
    if (time <= 0) { setOver(true); return; }
    timerRef.current = setTimeout(() => setTime(v => v - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [time, over]);

  useEffect(() => {
    if (over) onFinish(foundRef.current);
  }, [over]);

  const clickCard = useCallback((idx) => {
    if (locked || over) return;
    const card = cards[idx];
    if (card.revealed || card.matched) return;
    if (flipped.includes(idx)) return;

    const newFlipped = [...flipped, idx];
    setCards(prev => prev.map((c, i) => i === idx ? { ...c, revealed: true } : c));
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setLocked(true);
      const [a, b] = newFlipped;
      const cardA = cards[a], cardB = cards[b];
      if (cardA.sym === cardB.sym) {
        // Match!
        setTimeout(() => {
          setCards(prev => prev.map((c, i) =>
            i === a || i === b ? { ...c, matched: true, revealed: true } : c
          ));
          const newFound = foundRef.current + 1;
          setFound(newFound);
          setFlipped([]);
          setLocked(false);
          if (newFound >= cfg.total) {
            setTimeout(() => setOver(true), 400);
          }
        }, 400);
      } else {
        // No match — flip back
        setTimeout(() => {
          setCards(prev => prev.map((c, i) =>
            i === a || i === b ? { ...c, revealed: false } : c
          ));
          setFlipped([]);
          setLocked(false);
        }, 1200);
      }
    }
  }, [locked, over, flipped, cards, cfg.total]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  if (over) {
    const passed = foundRef.current >= cfg.target;
    return (
      React.createElement("div", { className: "col", style: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 } },
        React.createElement("div", { className: "prompt" },
          React.createElement("div", { className: "prompt__instruction" }, "Archives fouillées"),
          React.createElement("div", { className: "prompt__main" }, `${foundRef.current} paire${foundRef.current > 1 ? "s" : ""} retrouvées`)
        ),
        React.createElement("div", { className: `feedback ${passed ? "ok" : "ko"}` },
          passed
            ? `Objectif atteint — ${foundRef.current} ≥ ${cfg.target}`
            : `Insuffisant — minimum : ${cfg.target} paire${cfg.target > 1 ? "s" : ""}`
        )
      )
    );
  }

  const timerPct = (time / cfg.maxTime) * 100;
  const timerColor = time <= 10 ? "var(--danger)" : time <= 30 ? "var(--gold)" : "var(--success)";

  return (
    React.createElement("div", { className: "col", style: { flex: 1, gap: 12, alignItems: "stretch" } },
      // HUD
      React.createElement("div", { className: "row", style: { justifyContent: "space-between", alignItems: "center" } },
        React.createElement("div", { style: { fontFamily: "var(--font-serif)", color: "var(--bone)", fontSize: 13 } },
          `Paires : ${found} / ${cfg.total}`
        ),
        React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: timerColor } },
          formatTime(time)
        )
      ),
      // Timer bar
      React.createElement("div", { style: { height: 3, background: "var(--line-dim)", borderRadius: 2, overflow: "hidden" } },
        React.createElement("div", { style: { height: "100%", width: `${timerPct}%`, background: timerColor, transition: "width 1s linear, background 0.3s" } })
      ),
      // Card grid
      React.createElement("div", {
        style: {
          display: "grid",
          gridTemplateColumns: `repeat(${cfg.cols}, 1fr)`,
          gap: 6,
          flex: 1,
          alignContent: "start"
        }
      },
        cards.map((card, idx) =>
          React.createElement("button", {
            key: card.id,
            onClick: () => clickCard(idx),
            disabled: card.matched || locked,
            style: {
              height: 64,
              borderRadius: 6,
              border: card.matched
                ? "2px solid var(--gold-bright)"
                : card.revealed
                ? "2px solid var(--line)"
                : "2px solid var(--line-dim)",
              background: card.matched
                ? "linear-gradient(135deg, rgba(200,160,60,0.18), rgba(255,215,120,0.08))"
                : card.revealed
                ? "var(--char-2)"
                : "var(--char)",
              color: card.matched
                ? "var(--gold-bright)"
                : card.revealed
                ? "var(--gold)"
                : "var(--line)",
              fontSize: card.revealed || card.matched ? 26 : 18,
              cursor: card.matched || card.revealed ? "default" : "pointer",
              transition: "background 0.2s, border-color 0.2s, color 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-serif)",
              padding: 0,
              boxShadow: card.matched ? "0 0 8px rgba(200,160,60,0.2)" : "none"
            }
          },
            card.revealed || card.matched ? card.sym : "?"
          )
        )
      )
    )
  );
}

window.__GAMES__ = window.__GAMES__ || {};
window.__GAMES__.archives = ArchivesGame;
})();
