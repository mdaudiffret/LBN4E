;(function() {
// games/reflexes.jsx — Tap dès que vert
const { useState, useEffect, useRef } = React;

function ReflexesGame({ level, onHud, onFinish }) {
  const [phase, setPhase] = useState("ready"); // ready | wait | go | trick | result | done
  const [start, setStart] = useState(0);
  const [reaction, setReaction] = useState(null);
  const [round, setRound] = useState(1);
  const TOTAL = 5;
  const [times, setTimes] = useState([]);
  const timer = useRef(null);

  useEffect(() => onHud({ score: times.length, total: TOTAL }), [times]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const launch = () => {
    setReaction(null);
    setPhase("wait");
    let delay;
    if (level === 1) delay = 1500 + Math.random() * 800;
    else if (level === 2) delay = 800 + Math.random() * 2400;
    else delay = 600 + Math.random() * 2400;

    const willTrick = level === 3 && Math.random() < 0.35;
    timer.current = setTimeout(() => {
      if (willTrick) {
        setPhase("trick");
        timer.current = setTimeout(() => {
          setStart(performance.now());
          setPhase("go");
        }, 700 + Math.random() * 1100);
      } else {
        setStart(performance.now());
        setPhase("go");
      }
    }, delay);
  };

  const click = () => {
    if (phase === "ready" || phase === "result") {
      launch();
      return;
    }
    if (phase === "wait") {
      // anticipation -> fail
      clearTimeout(timer.current);
      setPhase("ready");
      setReaction("fail");
      return;
    }
    if (phase === "trick") {
      // clicked on red -> fail
      clearTimeout(timer.current);
      setPhase("ready");
      setReaction("fail-red");
      return;
    }
    if (phase === "go") {
      const r = Math.round(performance.now() - start);
      const next = [...times, r];
      setReaction(r);
      setTimes(next);
      if (next.length >= TOTAL) {
        setPhase("done");
        const avg = Math.round(next.reduce((a, b) => a + b, 0) / next.length);
        // score = number of valid reactions (0-5); cleaner: pass count
        setTimeout(() => onFinish(next.length), 600);
      } else {
        setPhase("result");
        setRound((r) => r + 1);
      }
    }
  };

  const bg = phase === "wait"   ? "var(--char-2)"
    : phase === "trick"  ? "var(--danger)"
    : phase === "go"     ? "var(--success)"
    : phase === "result" ? "var(--char)"
    : "var(--char)";

  const txt = phase === "ready" ? (reaction === "fail" ? "Trop tôt ! Clique pour recommencer."
                                  : reaction === "fail-red" ? "C'était rouge ! Attends le vert."
                                  : "Clique pour démarrer")
    : phase === "wait" ? "Attends le vert…"
    : phase === "trick" ? "PAS ENCORE"
    : phase === "go" ? "VITE !"
    : phase === "result" ? `${reaction} ms`
    : "Terminé";

  if (phase === "done") {
    const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
    return (
      <div className="col" style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div className="prompt">
          <div className="prompt__instruction">Terminé</div>
          <div className="prompt__main">{avg} ms en moyenne</div>
        </div>
      </div>
    );
  }

  return (
    <div className="col" style={{ flex: 1, alignItems: "center", gap: 16 }}>
      <div className="prompt" style={{ marginBottom: 0 }}>
        <div className="prompt__instruction">Manche {Math.min(round, TOTAL)} / {TOTAL}</div>
      </div>
      <button onClick={click}
        style={{
          width: "100%", maxWidth: 560, minHeight: 320,
          borderRadius: 20,
          background: bg,
          color: phase === "go" ? "var(--ink)" : "var(--pearl)",
          border: "1px solid var(--komin-lightgray)",
          fontFamily: "var(--font-brand)", fontWeight: 800,
          fontSize: phase === "go" ? 56 : phase === "result" ? 64 : 28,
          letterSpacing: "-0.03em",
          cursor: "pointer", transition: "background .1s, color .1s, font-size .15s"
        }}>
        {txt}
      </button>
      {times.length > 0 && (
        <div className="row" style={{ flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
          {times.map((t, i) => (
            <span key={i} className="k-pill k-pill--light-primary k-pill--sm">{t} ms</span>
          ))}
        </div>
      )}
    </div>
  );
}

window.__GAMES__ = window.__GAMES__ || {};
window.__GAMES__.reflexes = ReflexesGame;
})();
