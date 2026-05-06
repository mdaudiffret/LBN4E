;(function() {
// games/memoire.jsx — Mémoire flash (Simon-like)
const { useState, useEffect, useRef } = React;

const MEMOIRE_COLORS = [
  { id: 0, color: "#C84A3A" },
  { id: 1, color: "#C9A24A" },
  { id: 2, color: "#3A7A4F" },
  { id: 3, color: "#3D52D5" },
  { id: 4, color: "#7A5AE0" },
  { id: 5, color: "#D08FA1" },
];

function MemoireGame({ level, onHud, onFinish }) {
  const config = { 1: { len: 4, dur: 700 }, 2: { len: 6, dur: 500 }, 3: { len: 8, dur: 320 } }[level];
  const [seq, setSeq] = useState([]);
  const [shown, setShown] = useState(-1);
  const [phase, setPhase] = useState("preview");
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const finishedRef = useRef(false);

  useEffect(() => {
    finishedRef.current = false;
    const s = Array.from({ length: config.len }, () => Math.floor(Math.random() * 6));
    setSeq(s);
    setStep(0);
    setScore(0);
    setPhase("preview");
  }, [level]);

  useEffect(() => { onHud({ score, total: config.len }); }, [score, level]);

  // play preview
  useEffect(() => {
    if (phase !== "preview" || seq.length === 0) return;
    let i = 0;
    setShown(seq[0]);
    const tick = () => {
      setShown(-1);
      setTimeout(() => {
        i++;
        if (i >= seq.length) {
          setShown(-1);
          setPhase("input");
          return;
        }
        setShown(seq[i]);
        setTimeout(tick, config.dur);
      }, Math.max(120, config.dur * 0.4));
    };
    const t = setTimeout(tick, config.dur);
    return () => clearTimeout(t);
  }, [phase, seq]);

  // auto-finish
  useEffect(() => {
    if ((phase === "win" || phase === "lose") && !finishedRef.current) {
      finishedRef.current = true;
      const finalScore = phase === "win" ? config.len : step;
      const t = setTimeout(() => onFinish(finalScore), 1100);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const tap = (id) => {
    if (phase !== "input") return;
    if (id === seq[step]) {
      setShown(id);
      setTimeout(() => setShown(-1), 180);
      const next = step + 1;
      setStep(next);
      setScore(next);
      if (next >= seq.length) setPhase("win");
    } else {
      setPhase("lose");
    }
  };

  return (
    <div className="col" style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 24 }}>
      <div className="prompt" style={{ marginBottom: 8 }}>
        <div className="prompt__instruction">
          {phase === "preview" ? "Mémorise…" : phase === "input" ? "À ton tour" : phase === "win" ? "Bravo !" : "Raté"}
        </div>
        <div className="prompt__main">{phase === "input" ? `${step} / ${seq.length}` : `${seq.length} couleurs`}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 96px)", gap: 16 }}>
        {MEMOIRE_COLORS.map((c) => (
          <button key={c.id}
            onClick={() => tap(c.id)}
            disabled={phase !== "input"}
            style={{
              width: 96, height: 96, borderRadius: 20,
              background: c.color,
              border: "2px solid rgba(201,162,74,0.4)",
              cursor: phase === "input" ? "pointer" : "default",
              opacity: shown === -1 ? 0.5 : (shown === c.id ? 1 : 0.3),
              transform: shown === c.id ? "scale(1.05)" : "scale(1)",
              boxShadow: shown === c.id ? "0 0 0 4px rgba(201,162,74,0.5)" : "none",
              transition: "opacity .15s, transform .15s, box-shadow .15s"
            }}
          />
        ))}
      </div>

      {(phase === "win" || phase === "lose") && (
        <div className={`feedback ${phase === "win" ? "ok" : "ko"}`}>
          {phase === "win" ? `Séquence parfaite — ${seq.length}/${seq.length}` : `Erreur à la position ${step + 1}`}
        </div>
      )}
    </div>
  );
}

window.__GAMES__ = window.__GAMES__ || {};
window.__GAMES__.memoire = MemoireGame;
})();
