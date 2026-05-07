;(function() {
// games/reflexes.jsx — Tap dès que vert
const { useState, useEffect, useRef } = React;

const THRESHOLDS = { 1: 500, 2: 400, 3: 300 };

function ReflexesGame({ level, onHud, onFinish }) {
  const [phase, setPhase] = useState("ready"); // ready | wait | go | trick | result | done
  const [start, setStart] = useState(0);
  const [reaction, setReaction] = useState(null);
  const [round, setRound] = useState(1);
  const TOTAL = 5;
  const [times, setTimes] = useState([]);
  const timer = useRef(null);

  const threshold = THRESHOLDS[level];

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
      clearTimeout(timer.current);
      setPhase("ready");
      setReaction("fail");
      return;
    }
    if (phase === "trick") {
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
        const finalScore = avg < threshold ? 5 : 0;
        setTimeout(() => onFinish(finalScore), 1600);
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

  const currentAvg = times.length
    ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
    : null;

  if (phase === "done") {
    const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
    const passed = avg < threshold;
    return (
      React.createElement("div", { className: "col", style: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 } },
        React.createElement("div", { className: "prompt" },
          React.createElement("div", { className: "prompt__instruction" }, "Terminé"),
          React.createElement("div", { className: "prompt__main" }, `${avg} ms en moyenne`)
        ),
        React.createElement("div", {
          className: `feedback ${passed ? "ok" : "ko"}`,
          style: { marginTop: 8 }
        },
          passed
            ? `Excellent ! Sous les ${threshold} ms — objectif atteint`
            : `Trop lent — cible : moy. < ${threshold} ms`
        )
      )
    );
  }

  return (
    React.createElement("div", { className: "col", style: { flex: 1, alignItems: "center", gap: 16 } },
      React.createElement("div", { className: "prompt", style: { marginBottom: 0 } },
        React.createElement("div", {
          className: "prompt__instruction",
          style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }
        },
          React.createElement("span", null, `Manche ${Math.min(round, TOTAL)} / ${TOTAL}`),
          React.createElement("span", { style: { color: "var(--gold-soft)", fontSize: 13 } },
            `Cible : moy. < ${threshold} ms`,
            currentAvg != null
              ? React.createElement("span", { style: { marginLeft: 8, color: "var(--pearl)" } }, `· moy. actuelle : ${currentAvg} ms`)
              : null
          )
        )
      ),
      React.createElement("button", {
        onClick: click,
        style: {
          width: "100%", maxWidth: 560, minHeight: 320,
          borderRadius: 20,
          background: bg,
          color: phase === "go" ? "var(--ink)" : "var(--pearl)",
          border: "1px solid var(--komin-lightgray)",
          fontFamily: "var(--font-brand)", fontWeight: 800,
          fontSize: phase === "go" ? 56 : phase === "result" ? 64 : 28,
          letterSpacing: "-0.03em",
          cursor: "pointer", transition: "background .1s, color .1s, font-size .15s"
        }
      }, txt),
      times.length > 0 &&
        React.createElement("div", { className: "row", style: { flexWrap: "wrap", gap: 6, justifyContent: "center" } },
          times.map((t, i) =>
            React.createElement("span", { key: i, className: "k-pill k-pill--light-primary k-pill--sm" }, `${t} ms`)
          )
        )
    )
  );
}

window.__GAMES__ = window.__GAMES__ || {};
window.__GAMES__.reflexes = ReflexesGame;
})();
