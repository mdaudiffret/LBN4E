;(function() {
// games/anagrammes.jsx — Anagrammes
const { useState, useEffect } = React;

const ANAGRAM_WORDS = {
  1: ["CHAT", "LUNE", "ROSE", "PAIN", "BLEU", "MAIN", "AMIE", "JEUX", "VENT", "OURS", "PLUME", "FRAISE"],
  2: ["MAISON", "JARDIN", "GATEAU", "FLEUVE", "PIRATE", "TIGRES", "ORANGE", "BANANE", "FORETS", "CHATEAU", "VIOLON"],
  3: ["MONTAGNE", "CAPITALE", "OLYMPIEN", "ASTRONOME", "ROYAUMES", "EXPLORER", "ETOILEES", "SYMPATHIE"]
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

function AnagrammesGame({ level, onHud, onFinish }) {
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [word, setWord] = useState(() => pickWord(level));
  const [letters, setLetters] = useState(() => shuffle(pickWord(level)));
  const [picked, setPicked] = useState([]);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const w = pickWord(level);
    setWord(w);
    setLetters(shuffle(w));
    setPicked([]);
    setFeedback(null);
  }, [round, level]);

  useEffect(() => { onHud({ score, total: ANAGRAM_TOTAL }); }, [score]);

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
          if (round >= ANAGRAM_TOTAL) onFinish(newScore);
          else setRound(r => r + 1);
        }, 1100);
      }
    }
  };

  const reset = () => setPicked([]);

  return (
    <div className="col" style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 24 }}>
      <div className="prompt">
        <div className="prompt__instruction">Manche {round} / {ANAGRAM_TOTAL} — Reforme le mot</div>
        <div className="prompt__main" style={{ fontSize: 28, color: "var(--gold-soft)" }}>{word.length} lettres</div>
      </div>

      <div style={{ display: "flex", gap: 8, minHeight: 64, alignItems: "center" }}>
        {Array.from({ length: word.length }).map((_, i) => (
          <div key={i} style={{
            width: 48, height: 56, borderRadius: 10,
            background: picked[i] != null ? "var(--gold)" : "transparent",
            color: picked[i] != null ? "var(--ink)" : "var(--gold-soft)",
            border: "2px solid " + (feedback === "ok" ? "var(--success)" : feedback === "ko" ? "var(--danger)" : "rgba(201,162,74,0.4)"),
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 28, letterSpacing: "-0.02em",
            transition: "background .15s, border-color .15s"
          }}>
            {picked[i] != null ? letters[picked[i]] : ""}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", maxWidth: 480 }}>
        {letters.split("").map((ch, i) => (
          <button key={i}
            onClick={() => tap(i)}
            disabled={feedback === "ok" || feedback === "ko"}
            style={{
              width: 48, height: 56, borderRadius: 10,
              background: picked.includes(i) ? "rgba(201,162,74,0.1)" : "var(--ink-3)",
              color: picked.includes(i) ? "rgba(245,239,226,0.4)" : "var(--parchment)",
              border: "1px solid rgba(201,162,74,0.4)",
              fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 24,
              cursor: "pointer",
              opacity: picked.includes(i) ? 0.5 : 1,
              transition: "all .15s"
            }}
          >
            {ch}
          </button>
        ))}
      </div>

      <button className="k-btn k-btn--sm k-btn--ghost" onClick={reset} disabled={picked.length === 0 || !!feedback}>
        Effacer
      </button>

      {feedback === "ok" && <div className="feedback ok">Bravo, c'était bien {word} !</div>}
      {feedback === "ko" && <div className="feedback ko">Le mot était {word}</div>}
    </div>
  );
}

window.__GAMES__ = window.__GAMES__ || {};
window.__GAMES__.anagrammes = AnagrammesGame;
})();
