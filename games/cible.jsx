;(function() {
// games/cible.jsx — Cibles mobiles
const { useState, useEffect, useRef } = React;

const SCORE_TARGET = { 1: 15, 2: 30, 3: 45 };
const DECOY_SIZE = { 1: 0, 2: 0, 3: 40 };

function CibleGame({ level, onHud, onFinish }) {
  const cfg = {
    1: { duration: 30, size: 64, ttl: 2200, gap: 700 },
    2: { duration: 30, size: 48, ttl: 1500, gap: 500 },
    3: { duration: 30, size: 36, ttl: 950,  gap: 350 }
  }[level];
  const scoreTarget = SCORE_TARGET[level];
  const decoySize = DECOY_SIZE[level];

  const [time, setTime] = useState(cfg.duration);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [over, setOver] = useState(false);
  const [target, setTarget] = useState(null); // {x, y, id, born}
  const [decoy, setDecoy] = useState(null);   // {x, y, id} — level 3 only
  const fieldRef = useRef(null);
  const idRef = useRef(0);
  const scoreRef = useRef(0);

  // keep scoreRef in sync for closures
  useEffect(() => { scoreRef.current = score; }, [score]);

  useEffect(() => onHud({ time, score }), [time, score]);

  useEffect(() => {
    if (over) return;
    if (time <= 0) { setOver(true); return; }
    const t = setTimeout(() => setTime((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [time, over]);

  useEffect(() => {
    if (over) onFinish(scoreRef.current);
  }, [over]);

  const randomPos = (pad) => {
    const f = fieldRef.current;
    if (!f) return { x: 100, y: 100 };
    const r = f.getBoundingClientRect();
    return {
      x: pad + Math.random() * (r.width - pad * 2),
      y: pad + Math.random() * (r.height - pad * 2),
    };
  };

  const spawnDecoy = (targetPos) => {
    if (level !== 3) return;
    const dPad = decoySize / 2 + 8;
    let pos;
    // try to avoid overlapping the target
    for (let attempt = 0; attempt < 6; attempt++) {
      pos = randomPos(dPad);
      const dx = pos.x - targetPos.x, dy = pos.y - targetPos.y;
      if (Math.sqrt(dx * dx + dy * dy) > cfg.size + decoySize) break;
    }
    const id = ++idRef.current;
    setDecoy({ ...pos, id });
    setTimeout(() => {
      setDecoy((cur) => (cur && cur.id === id ? null : cur));
    }, cfg.ttl * 0.7);
  };

  // spawn loop
  useEffect(() => {
    if (over) return;
    let cancel = false;
    const spawn = () => {
      if (cancel || over) return;
      const pad = cfg.size / 2 + 8;
      const pos = randomPos(pad);
      const id = ++idRef.current;
      setTarget({ ...pos, id, born: performance.now() });
      spawnDecoy(pos);
      setTimeout(() => {
        setTarget((cur) => {
          if (cur && cur.id === id) {
            setMisses((m) => m + 1);
            setTimeout(spawn, cfg.gap);
            return null;
          }
          return cur;
        });
      }, cfg.ttl);
    };
    spawn();
    return () => { cancel = true; };
  }, [over]);

  const hit = () => {
    if (!target || over) return;
    setScore((s) => s + 1);
    setTarget(null);
    setDecoy(null);
    setTimeout(() => {
      if (over) return;
      const pad = cfg.size / 2 + 8;
      const pos = randomPos(pad);
      const id = ++idRef.current;
      setTarget({ ...pos, id, born: performance.now() });
      spawnDecoy(pos);
      setTimeout(() => {
        setTarget((cur) => {
          if (cur && cur.id === id) {
            setMisses((m) => m + 1);
            return null;
          }
          return cur;
        });
      }, cfg.ttl);
    }, cfg.gap * 0.4);
  };

  const hitDecoy = (e) => {
    e.stopPropagation();
    if (over) return;
    setDecoy(null);
    setScore((s) => Math.max(0, s - 1));
  };

  if (over) {
    const passed = scoreRef.current >= scoreTarget;
    return (
      React.createElement("div", { className: "col", style: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 } },
        React.createElement("div", { className: "prompt" },
          React.createElement("div", { className: "prompt__instruction" }, "Terminé"),
          React.createElement("div", { className: "prompt__main" }, `${scoreRef.current} cibles`)
        ),
        React.createElement("div", { className: `feedback ${passed ? "ok" : "ko"}` },
          passed
            ? `Objectif atteint — ${scoreRef.current} ≥ ${scoreTarget}`
            : `Insuffisant — minimum : ${scoreTarget} cibles`
        )
      )
    );
  }

  return (
    React.createElement("div", { className: "col", style: { flex: 1, alignItems: "stretch", gap: 16 } },
      React.createElement("div", { className: "row", style: { justifyContent: "space-between", alignItems: "baseline" } },
        React.createElement("div", null,
          React.createElement("div", { className: "prompt__instruction", style: { marginBottom: 0 } },
            level === 3 ? "Bleue = +1 · Rouge = −1" : "Touche la cible bleue"
          ),
          React.createElement("div", { style: { fontSize: 12, color: "var(--gold-soft)", marginTop: 2 } },
            `Minimum : ${scoreTarget} cibles`
          )
        ),
        React.createElement("div", { className: "row", style: { gap: 16, alignItems: "baseline" } },
          React.createElement("div", { style: { fontSize: 40, fontWeight: 800, fontFamily: "var(--font-brand)", color: "var(--gold-bright)", lineHeight: 1 } },
            score
          ),
          React.createElement("div", { className: "row", style: { gap: 6, fontSize: 13, fontWeight: 600 } },
            React.createElement("span", { className: "muted" }, "Ratés"),
            React.createElement("span", { className: "tnum" }, misses)
          )
        )
      ),
      React.createElement("div", {
        ref: fieldRef,
        style: {
          position: "relative",
          flex: 1,
          minHeight: 360,
          borderRadius: 16,
          background: "linear-gradient(180deg, rgba(61,82,213,0.15), rgba(7,7,12,0.6))",
          border: "1px solid var(--komin-lightgray)",
          overflow: "hidden",
          cursor: "crosshair"
        }
      },
        target && React.createElement("button", {
          onClick: hit,
          style: {
            position: "absolute",
            left: target.x - cfg.size / 2,
            top: target.y - cfg.size / 2,
            width: cfg.size, height: cfg.size,
            borderRadius: "50%",
            background: "var(--komin-blue)",
            border: "4px solid #fff",
            boxShadow: "var(--shadow-md), 0 0 0 4px rgba(61,82,213,0.18)",
            cursor: "pointer",
            padding: 0,
            animation: "pop .15s ease-out"
          }
        }),
        decoy && React.createElement("button", {
          onClick: hitDecoy,
          style: {
            position: "absolute",
            left: decoy.x - decoySize / 2,
            top: decoy.y - decoySize / 2,
            width: decoySize, height: decoySize,
            borderRadius: "50%",
            background: "var(--danger)",
            border: "4px solid #fff",
            boxShadow: "var(--shadow-md), 0 0 0 4px rgba(200,74,58,0.25)",
            cursor: "pointer",
            padding: 0,
            animation: "pop .15s ease-out"
          }
        })
      ),
      React.createElement("style", null,
        `@keyframes pop { from { transform: scale(.4); opacity: 0; } to { transform: scale(1); opacity: 1; } }`
      )
    )
  );
}

window.__GAMES__ = window.__GAMES__ || {};
window.__GAMES__.cible = CibleGame;
})();
