;(function() {
// games/flamme.jsx — La Flamme Vacillante
const { useState, useEffect, useRef } = React;

const LEVELS = {
  1: { radius: 85, speed: 80,  totalTime: 30, target: 22 },
  2: { radius: 70, speed: 140, totalTime: 30, target: 22 },
  3: { radius: 55, speed: 200, totalTime: 30, target: 22 },
};

function FlammeGame({ level, onHud, onFinish }) {
  const cfg = LEVELS[level];

  // React render trigger only
  const [tick, setTick] = useState(0);
  const [over, setOver] = useState(false);
  const overRef = useRef(false);

  const fieldRef = useRef(null);
  const rafRef   = useRef(null);

  // All animation state in refs — no React state
  const circlePos = useRef({ x: 200, y: 150 });
  const circleVel = useRef({ vx: cfg.speed * 0.7, vy: cfg.speed * 0.7 });
  const cursorPos = useRef({ x: -9999, y: -9999 });
  const insideTime = useRef(0);
  const elapsed    = useRef(0);
  const lastStamp  = useRef(null);
  const currentRadius = useRef(cfg.radius);

  // Level 3 random direction change timer
  const nextDirChange = useRef(0);

  const isInsideCircle = () => {
    const dx = cursorPos.current.x - circlePos.current.x;
    const dy = cursorPos.current.y - circlePos.current.y;
    return Math.sqrt(dx * dx + dy * dy) <= currentRadius.current;
  };

  const handleMouseMove = (e) => {
    const rect = fieldRef.current ? fieldRef.current.getBoundingClientRect() : null;
    if (!rect) return;
    cursorPos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = fieldRef.current ? fieldRef.current.getBoundingClientRect() : null;
    if (!rect) return;
    cursorPos.current = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  };

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;

    // Init circle at center
    const rect = field.getBoundingClientRect();
    circlePos.current = { x: rect.width / 2, y: rect.height / 2 };

    // Random initial velocity direction
    const angle = Math.random() * Math.PI * 2;
    circleVel.current = {
      vx: Math.cos(angle) * cfg.speed,
      vy: Math.sin(angle) * cfg.speed,
    };

    nextDirChange.current = 1.5 + Math.random() * 2;

    const loop = (stamp) => {
      if (overRef.current) return;

      if (lastStamp.current === null) {
        lastStamp.current = stamp;
      }
      const dt = Math.min((stamp - lastStamp.current) / 1000, 0.05); // cap at 50ms
      lastStamp.current = stamp;

      const f = fieldRef.current;
      if (!f) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      const r = f.getBoundingClientRect();
      const W = r.width;
      const H = r.height;

      // Level 3: shrink radius over time
      if (level === 3) {
        const progress = Math.min(elapsed.current / cfg.totalTime, 1);
        currentRadius.current = 60 - progress * 15; // 60→45
      } else {
        currentRadius.current = cfg.radius;
      }

      // Level 3: occasional random direction change
      if (level === 3) {
        nextDirChange.current -= dt;
        if (nextDirChange.current <= 0) {
          const angle = Math.random() * Math.PI * 2;
          const speed = cfg.speed + elapsed.current * 5; // slight speed-up
          circleVel.current = {
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
          };
          nextDirChange.current = 0.8 + Math.random() * 1.5;
        }
      }

      // Move circle
      let { x, y } = circlePos.current;
      let { vx, vy } = circleVel.current;
      const rad = currentRadius.current;

      x += vx * dt;
      y += vy * dt;

      // Bounce off walls
      if (x - rad < 0) { x = rad; vx = Math.abs(vx); }
      if (x + rad > W) { x = W - rad; vx = -Math.abs(vx); }
      if (y - rad < 0) { y = rad; vy = Math.abs(vy); }
      if (y + rad > H) { y = H - rad; vy = -Math.abs(vy); }

      circlePos.current = { x, y };
      circleVel.current = { vx, vy };

      // Track time inside
      if (isInsideCircle()) {
        insideTime.current += dt;
      }

      elapsed.current += dt;
      onHud({ score: Math.floor(insideTime.current), total: cfg.totalTime });

      if (elapsed.current >= cfg.totalTime) {
        overRef.current = true;
        setOver(true);
        return;
      }

      setTick(t => t + 1);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastStamp.current = null;
    };
  }, [level]);

  useEffect(() => {
    if (over) {
      onFinish(Math.floor(insideTime.current));
    }
  }, [over]);

  if (over) {
    const passed = insideTime.current >= cfg.target;
    return (
      React.createElement("div", { className: "col", style: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 } },
        React.createElement("div", { className: "prompt" },
          React.createElement("div", { className: "prompt__instruction" }, "Terminé"),
          React.createElement("div", { className: "prompt__main" }, `${Math.floor(insideTime.current)}s dans le cercle`)
        ),
        React.createElement("div", { className: `feedback ${passed ? "ok" : "ko"}` },
          passed
            ? `Objectif atteint — ${Math.floor(insideTime.current)}s ≥ ${cfg.target}s`
            : `Insuffisant — minimum : ${cfg.target}s dans le cercle`
        )
      )
    );
  }

  const pos = circlePos.current;
  const rad = currentRadius.current;
  const insideSec = Math.floor(insideTime.current);
  const remaining = Math.max(0, Math.ceil(cfg.totalTime - elapsed.current));
  const inside = isInsideCircle();

  return (
    React.createElement("div", { className: "col", style: { flex: 1, alignItems: "stretch", gap: 12 } },
      React.createElement("div", { className: "row", style: { justifyContent: "space-between", alignItems: "baseline" } },
        React.createElement("div", { className: "prompt__instruction" }, "Déplace ta souris dans le cercle"),
        React.createElement("div", { className: "row", style: { gap: 20, alignItems: "baseline" } },
          React.createElement("div", null,
            React.createElement("div", { className: "prompt__instruction", style: { marginBottom: 2 } }, "Dans le cercle"),
            React.createElement("div", { style: { fontSize: 32, fontWeight: 800, color: inside ? "var(--success)" : "var(--pearl)", lineHeight: 1 } },
              `${insideSec}s`
            )
          ),
          React.createElement("div", null,
            React.createElement("div", { className: "prompt__instruction", style: { marginBottom: 2 } }, "Temps restant"),
            React.createElement("div", { style: { fontSize: 32, fontWeight: 800, color: "var(--gold)", lineHeight: 1 } },
              `${remaining}s`
            )
          )
        )
      ),
      React.createElement("div", {
        ref: fieldRef,
        onMouseMove: handleMouseMove,
        onTouchMove: handleTouchMove,
        style: {
          position: "relative",
          flex: 1,
          minHeight: 340,
          borderRadius: 16,
          background: "linear-gradient(180deg, rgba(120,80,20,0.12), rgba(7,7,12,0.7))",
          border: "1px solid var(--line)",
          overflow: "hidden",
          cursor: "none",
          userSelect: "none",
          touchAction: "none",
        }
      },
        // Circle
        React.createElement("div", {
          style: {
            position: "absolute",
            left: pos.x - rad,
            top:  pos.y - rad,
            width:  rad * 2,
            height: rad * 2,
            borderRadius: "50%",
            border: `3px solid ${inside ? "var(--gold-bright)" : "var(--gold)"}`,
            background: inside
              ? "rgba(212,175,55,0.18)"
              : "rgba(212,175,55,0.06)",
            boxShadow: inside
              ? "0 0 28px 8px rgba(212,175,55,0.35)"
              : "0 0 12px 2px rgba(212,175,55,0.12)",
            transition: "background 0.1s, box-shadow 0.1s, border-color 0.1s",
            pointerEvents: "none",
          }
        }),
        // Flame emoji at center of circle
        React.createElement("div", {
          style: {
            position: "absolute",
            left: pos.x - 14,
            top:  pos.y - 16,
            fontSize: 28,
            pointerEvents: "none",
            userSelect: "none",
          }
        }, "🕯️"),
        // Target hint bar
        React.createElement("div", {
          style: {
            position: "absolute",
            bottom: 12,
            left: 12,
            right: 12,
            height: 6,
            borderRadius: 4,
            background: "var(--line-dim)",
            overflow: "hidden",
          }
        },
          React.createElement("div", {
            style: {
              height: "100%",
              width: `${Math.min(100, (insideTime.current / cfg.target) * 100)}%`,
              background: insideTime.current >= cfg.target ? "var(--success)" : "var(--gold)",
              borderRadius: 4,
              transition: "width 0.1s, background 0.2s",
            }
          })
        ),
        // Target label
        React.createElement("div", {
          style: {
            position: "absolute",
            bottom: 22,
            right: 12,
            fontSize: 10,
            fontFamily: "var(--font-mono)",
            color: "var(--gold)",
            opacity: 0.7,
          }
        }, `cible : ${cfg.target}s`)
      )
    )
  );
}

window.__GAMES__ = window.__GAMES__ || {};
window.__GAMES__.flamme = FlammeGame;
})();
