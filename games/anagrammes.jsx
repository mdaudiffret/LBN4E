;(function() {
// games/anagrammes.jsx — Anagrammes
const { useState, useEffect, useRef } = React;

const ANAGRAM_WORDS = {
  1: [
    "EPEE", "DUEL", "CAPE", "GANT", "ARME", "PAGE", "FIEF", "FORT", "BRAS", "LAME",
    "LANCE", "GARDE", "LIEGE", "BARON", "HERSE", "ECLAT", "FORGE", "METAL", "COTTE", "SABRE"
  ],
  2: [
    "BLASON", "DONJON", "ARMURE", "MANOIR", "ECUYER", "COMBAT", "DRAGON", "SOLDAT",
    "CARTEL", "HAUBERT", "TOURNOI", "ESCRIME", "PARAPET", "DESTRIER"
  ],
  3: [
    "MOUSQUET", "NOBLESSE", "CROISADE", "SEIGNEUR", "CONQUETE", "DESTRIER",
    "ARBALETE", "CHEVALIER", "CUIRASSE", "FLAMBEAU", "ETENDARD", "FORTERESSE"
  ]
};

function shuffle(s) {
  for (let i = 0; i < 5; i++) {
    const arr = s.split("");
    for (let k = arr.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      [arr[k], arr[j]] = [arr[j], arr[k]];
    }
    const r = arr.join("");
    if (r !== s) return r;
  }
  return s.split("").reverse().join("");
}
function pickWord(level) {
  const pool = ANAGRAM_WORDS[level];
  return pool[Math.floor(Math.random() * pool.length)];
}

const ANAGRAM_TOTAL = 5;
const ANAGRAM_TIMER = 60;

function AnagrammesGame({ level, onHud, onFinish }) {
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [word, setWord] = useState(() => pickWord(level));
  const [letters, setLetters] = useState(() => shuffle(pickWord(level)));
  const [picked, setPicked] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(ANAGRAM_TIMER);
  const doneRef = useRef(false);
  const scoreRef = useRef(0);

  // keep scoreRef in sync for the timer callback
  useEffect(() => { scoreRef.current = score; }, [score]);

  useEffect(() => {
    const w = pickWord(level);
    setWord(w);
    setLetters(shuffle(w));
    setPicked([]);
    setFeedback(null);
  }, [round, level]);

  useEffect(() => { onHud({ score, total: ANAGRAM_TOTAL }); }, [score]);

  // global countdown — starts on mount, never resets between rounds
  useEffect(() => {
    if (doneRef.current) return;
    if (timeLeft <= 0) {
      if (!doneRef.current) {
        doneRef.current = true;
        onFinish(scoreRef.current);
      }
      return;
    }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  const timerColor = timeLeft <= 15 ? "var(--danger)" : undefined;
  const timerDisplay = `⏱ 0:${String(timeLeft).padStart(2, "0")}`;

  const tap = (i) => {
    if (feedback) return;
    if (picked.includes(i)) {
      setPicked(picked.filter(x => x !== i));
    } else {
      const next = [...picked, i];
      setPicked(next);
      if (next.length === word.length) {
        const guess = next.map(idx => letters[idx]).join("");
        const ok = guess === word;
        const newScore = ok ? score + 1 : score;
        if (ok) { setScore(newScore); setFeedback("ok"); }
        else setFeedback("ko");
        setTimeout(() => {
          if (doneRef.current) return;
          if (round >= ANAGRAM_TOTAL) {
            doneRef.current = true;
            onFinish(newScore);
          } else {
            setRound(r => r + 1);
          }
        }, 1100);
      }
    }
  };

  const reset = () => setPicked([]);

  return (
    React.createElement("div", { className: "col", style: { flex: 1, alignItems: "center", justifyContent: "center", gap: 24 } },
      React.createElement("div", { className: "prompt" },
        React.createElement("div", {
          className: "prompt__instruction",
          style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }
        },
          React.createElement("span", null, `Manche ${round} / ${ANAGRAM_TOTAL} — Reforme le mot`),
          React.createElement("span", { style: { color: timerColor, fontVariantNumeric: "tabular-nums" } }, timerDisplay)
        ),
        React.createElement("div", { className: "prompt__main", style: { fontSize: 28, color: "var(--gold-soft)" } },
          `${word.length} lettres`
        )
      ),

      React.createElement("div", { style: { display: "flex", gap: 8, minHeight: 64, alignItems: "center" } },
        Array.from({ length: word.length }).map((_, i) =>
          React.createElement("div", {
            key: i,
            style: {
              width: 48, height: 56, borderRadius: 10,
              background: picked[i] != null ? "var(--gold)" : "transparent",
              color: picked[i] != null ? "var(--ink)" : "var(--gold-soft)",
              border: "2px solid " + (feedback === "ok" ? "var(--success)" : feedback === "ko" ? "var(--danger)" : "rgba(201,162,74,0.4)"),
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 28, letterSpacing: "-0.02em",
              transition: "background .15s, border-color .15s"
            }
          }, picked[i] != null ? letters[picked[i]] : "")
        )
      ),

      React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", maxWidth: 480 } },
        letters.split("").map((ch, i) =>
          React.createElement("button", {
            key: i,
            onClick: () => tap(i),
            disabled: feedback === "ok" || feedback === "ko",
            style: {
              width: 48, height: 56, borderRadius: 10,
              background: picked.includes(i) ? "rgba(201,162,74,0.1)" : "var(--ink-3)",
              color: picked.includes(i) ? "rgba(245,239,226,0.4)" : "var(--parchment)",
              border: "1px solid rgba(201,162,74,0.4)",
              fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 24,
              cursor: "pointer",
              opacity: picked.includes(i) ? 0.5 : 1,
              transition: "all .15s"
            }
          }, ch)
        )
      ),

      React.createElement("button", {
        className: "k-btn k-btn--sm k-btn--ghost",
        onClick: reset,
        disabled: picked.length === 0 || !!feedback
      }, "Effacer"),

      feedback === "ok" && React.createElement("div", { className: "feedback ok" }, `Bravo, c'était bien ${word} !`),
      feedback === "ko" && React.createElement("div", { className: "feedback ko" }, `Le mot était ${word}`)
    )
  );
}

window.__GAMES__ = window.__GAMES__ || {};
window.__GAMES__.anagrammes = AnagrammesGame;
})();
