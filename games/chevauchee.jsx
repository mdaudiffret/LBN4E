;(function() {
// games/chevauchee.jsx — La Chevauchée
const { useState, useEffect, useRef } = React;

const LEVELS = {
  1: { speed: 260, accel: 0,   gapMin: 2.2, gapMax: 3.5, target: 25, total: 30, doubleJump: false, doubleObs: false },
  2: { speed: 340, accel: 0.1, gapMin: 1.6, gapMax: 2.8, target: 35, total: 40, doubleJump: false, doubleObs: false },
  3: { speed: 400, accel: 0.1, gapMin: 1.2, gapMax: 2.2, target: 45, total: 50, doubleJump: true,  doubleObs: true  },
};

const FIELD_W_PCT = 1; // 100% of container
const FIELD_H     = 280;
const GROUND_Y    = 200; // from top of field
const HORSE_X     = 90;
const HORSE_W     = 44;
const HORSE_H     = 44;
const GRAVITY     = 1400; // px/s²
const JUMP_VY     = -520; // px/s

function ChevaucheeGame({ level, onHud, onFinish }) {
  const cfg = LEVELS[level];

  const [phase, setPhase] = useState("start"); // "start" | "playing" | "over"
  const [tick, setTick]   = useState(0);
  const phaseRef = useRef("start");

  const rafRef   = useRef(null);
  const fieldRef = useRef(null);

  // All game state in one ref object
  const gs = useRef(null);

  const initGS = () => ({
    elapsed:    0,
    horseY:     0,         // vertical offset from ground (positive = up)
    horseVY:    0,         // px/s (negative = moving up)
    jumpsLeft:  cfg.doubleJump ? 2 : 1,
    onGround:   true,
    obstacles:  [],        // [{id, x, w, h}]
    nextObsIn:  cfg.gapMin + Math.random() * (cfg.gapMax - cfg.gapMin),
    obsIdCount: 0,
    currentSpeed: cfg.speed,
    dead:       false,
    lastStamp:  null,
    fieldW:     600,
  });

  const doJump = () => {
    if (!gs.current) return;
    const g = gs.current;
    if (g.dead) return;
    if (g.jumpsLeft > 0) {
      g.horseVY    = JUMP_VY;
      g.onGround   = false;
      g.jumpsLeft -= 1;
    }
  };

  const handleKeyDown = (e) => {
    if (e.code === "Space" || e.code === "ArrowUp") {
      e.preventDefault();
      if (phaseRef.current === "start") {
        startGame();
      } else {
        doJump();
      }
    }
  };

  const handleFieldClick = () => {
    if (phaseRef.current === "start") {
      startGame();
    } else if (phaseRef.current === "playing") {
      doJump();
    }
  };

  const startGame = () => {
    if (phaseRef.current !== "start") return;
    phaseRef.current = "playing";
    gs.current = initGS();
    setPhase("playing");
  };

  const endGame = (survived) => {
    if (!gs.current || gs.current.dead) return;
    gs.current.dead = true;
    phaseRef.current = "over";
    const elapsed = gs.current.elapsed;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setPhase("over");
    onFinish(Math.floor(elapsed));
  };

  // Main RAF loop
  useEffect(() => {
    if (phase !== "playing") return;

    const loop = (stamp) => {
      const g = gs.current;
      if (!g || g.dead) return;

      if (g.lastStamp === null) g.lastStamp = stamp;
      const dt = Math.min((stamp - g.lastStamp) / 1000, 0.05);
      g.lastStamp = stamp;

      // Update elapsed
      g.elapsed += dt;

      // Speed update (level 2 & 3 acceleration)
      if (cfg.accel > 0) {
        g.currentSpeed = cfg.speed + cfg.accel * g.elapsed * 60; // rough scale
      }

      // Horse vertical physics
      // horseY = px above ground (0 = standing), positive = higher up
      // horseVY is in screen-space: negative = moving up visually
      // JUMP_VY = -520 → horse rises → horseY increases → subtract horseVY*dt
      if (!g.onGround) {
        g.horseY  -= g.horseVY * dt; // negative vY means rising, so subtract → horseY grows
        g.horseVY += GRAVITY * dt;   // gravity → vY becomes positive → horse falls
      }

      // Landing
      if (g.horseY <= 0) {
        g.horseY    = 0;
        g.horseVY   = 0;
        g.onGround  = true;
        g.jumpsLeft = cfg.doubleJump ? 2 : 1;
      }

      // Update field width
      const f = fieldRef.current;
      if (f) g.fieldW = f.getBoundingClientRect().width;

      // Spawn obstacles
      g.nextObsIn -= dt;
      if (g.nextObsIn <= 0) {
        const h1 = 35 + Math.floor(Math.random() * 20);
        const id = ++g.obsIdCount;
        g.obstacles.push({ id, x: g.fieldW + 30, w: 24, h: h1 });

        // Level 3: occasional double obstacle
        if (cfg.doubleObs && Math.random() < 0.35) {
          const h2 = 35 + Math.floor(Math.random() * 20);
          g.obstacles.push({ id: ++g.obsIdCount, x: g.fieldW + 30 + 60, w: 24, h: h2 });
        }

        g.nextObsIn = cfg.gapMin + Math.random() * (cfg.gapMax - cfg.gapMin);
      }

      // Move obstacles
      g.obstacles = g.obstacles
        .map(o => ({ ...o, x: o.x - g.currentSpeed * dt }))
        .filter(o => o.x + o.w > -10);

      // Collision detection
      // Horse screen rect: left=HORSE_X, right=HORSE_X+HORSE_W
      //   top = GROUND_Y - HORSE_H - horseY, bottom = GROUND_Y - horseY
      const horseLeft   = HORSE_X + 4;          // slight inset for forgiveness
      const horseRight  = HORSE_X + HORSE_W - 4;
      const horseBottom = GROUND_Y - g.horseY;
      const horseTop    = horseBottom - HORSE_H + 4;

      for (const obs of g.obstacles) {
        const obsLeft   = obs.x + 2;
        const obsRight  = obs.x + obs.w - 2;
        const obsTop    = GROUND_Y - obs.h;
        const obsBottom = GROUND_Y;

        const overlapX = horseRight > obsLeft && horseLeft < obsRight;
        const overlapY = horseBottom > obsTop && horseTop < obsBottom;

        if (overlapX && overlapY) {
          endGame(false);
          return;
        }
      }

      // Win condition
      if (g.elapsed >= cfg.target) {
        endGame(true);
        return;
      }

      onHud({ score: Math.floor(g.elapsed), total: cfg.target });
      setTick(t => t + 1);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [phase]);

  // Keyboard listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Render helpers
  const renderField = () => {
    const g = gs.current;
    const horseScreenY = g ? GROUND_Y - HORSE_H - g.horseY : GROUND_Y - HORSE_H;
    const obstacles = g ? g.obstacles : [];
    const elapsed   = g ? g.elapsed : 0;
    const speed     = g ? g.currentSpeed : cfg.speed;

    return React.createElement("div", {
      ref: fieldRef,
      onClick: handleFieldClick,
      style: {
        position: "relative",
        width: "100%",
        height: FIELD_H,
        borderRadius: 12,
        background: "linear-gradient(180deg, rgba(30,15,5,0.9) 0%, rgba(7,7,12,0.85) 100%)",
        border: "1px solid var(--line)",
        overflow: "hidden",
        cursor: "pointer",
        userSelect: "none",
      }
    },
      // Ground line
      React.createElement("div", {
        style: {
          position: "absolute",
          left: 0, right: 0,
          top: GROUND_Y,
          height: 2,
          background: "var(--gold)",
          opacity: 0.6,
        }
      }),

      // Horse
      React.createElement("div", {
        style: {
          position: "absolute",
          left: HORSE_X,
          top:  horseScreenY,
          width:  HORSE_W,
          height: HORSE_H,
          fontSize: 36,
          lineHeight: "1",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          userSelect: "none",
          pointerEvents: "none",
        }
      }, "🐴"),

      // Obstacles
      ...obstacles.map(obs =>
        React.createElement("div", {
          key: obs.id,
          style: {
            position: "absolute",
            left:   obs.x,
            top:    GROUND_Y - obs.h,
            width:  obs.w,
            height: obs.h,
            background: "var(--gold)",
            borderRadius: "3px 3px 0 0",
            opacity: 0.9,
            boxShadow: "0 0 8px 2px rgba(212,175,55,0.4)",
          }
        })
      ),

      // Elapsed time overlay
      phase === "playing" && React.createElement("div", {
        style: {
          position: "absolute",
          top: 10, right: 14,
          fontSize: 13,
          fontFamily: "var(--font-mono)",
          color: "var(--gold)",
          opacity: 0.8,
        }
      }, `${Math.floor(elapsed)}s / ${cfg.target}s`),

      // Progress bar
      phase === "playing" && React.createElement("div", {
        style: {
          position: "absolute",
          bottom: 8, left: 12, right: 12,
          height: 4,
          borderRadius: 3,
          background: "var(--line-dim)",
          overflow: "hidden",
        }
      },
        React.createElement("div", {
          style: {
            height: "100%",
            width:  `${Math.min(100, (elapsed / cfg.target) * 100)}%`,
            background: elapsed >= cfg.target ? "var(--success)" : "var(--gold)",
            borderRadius: 3,
            transition: "width 0.1s",
          }
        })
      )
    );
  };

  // START screen
  if (phase === "start") {
    return (
      React.createElement("div", { className: "col", style: { flex: 1, alignItems: "stretch", gap: 12 } },
        React.createElement("div", { className: "col", style: { alignItems: "center", gap: 8 } },
          React.createElement("div", { className: "prompt" },
            React.createElement("div", { className: "prompt__instruction" }, `Niveau ${level} · Survive ${cfg.target}s`),
            React.createElement("div", { className: "prompt__main" }, "La Chevauchée")
          ),
          React.createElement("div", { style: { fontSize: 13, color: "var(--bone)", textAlign: "center", maxWidth: 360 } },
            cfg.doubleJump
              ? "Appuie sur Espace / ↑ ou clique pour sauter (double saut disponible). Évite les herses !"
              : "Appuie sur Espace / ↑ ou clique pour sauter. Évite les herses !"
          )
        ),
        React.createElement("div", { ref: fieldRef,
          onClick: handleFieldClick,
          style: {
            position: "relative",
            width: "100%",
            height: FIELD_H,
            borderRadius: 12,
            background: "linear-gradient(180deg, rgba(30,15,5,0.9) 0%, rgba(7,7,12,0.85) 100%)",
            border: "1px solid var(--line)",
            overflow: "hidden",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }
        },
          // Ground line
          React.createElement("div", {
            style: {
              position: "absolute",
              left: 0, right: 0,
              top: GROUND_Y,
              height: 2,
              background: "var(--gold)",
              opacity: 0.6,
            }
          }),
          // Static horse
          React.createElement("div", {
            style: {
              position: "absolute",
              left: HORSE_X,
              top:  GROUND_Y - HORSE_H,
              fontSize: 36,
              lineHeight: "1",
            }
          }, "🐴"),
          React.createElement("button", { className: "k-btn k-btn--brand k-btn--lg" }, "Commencer →")
        )
      )
    );
  }

  // OVER screen
  if (phase === "over") {
    const elapsed  = gs.current ? gs.current.elapsed : 0;
    const passed   = elapsed >= cfg.target;
    return (
      React.createElement("div", { className: "col", style: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 } },
        React.createElement("div", { className: "prompt" },
          React.createElement("div", { className: "prompt__instruction" }, "Terminé"),
          React.createElement("div", { className: "prompt__main" }, `${Math.floor(elapsed)}s survivues`)
        ),
        React.createElement("div", { className: `feedback ${passed ? "ok" : "ko"}` },
          passed
            ? `Objectif atteint — ${Math.floor(elapsed)}s ≥ ${cfg.target}s`
            : `Insuffisant — minimum : ${cfg.target}s de survie`
        )
      )
    );
  }

  // PLAYING screen
  return (
    React.createElement("div", { className: "col", style: { flex: 1, alignItems: "stretch", gap: 12 } },
      React.createElement("div", { className: "row", style: { justifyContent: "space-between", alignItems: "center" } },
        React.createElement("div", { className: "prompt__instruction" },
          cfg.doubleJump ? "Espace / ↑ / clic = sauter (double saut)" : "Espace / ↑ / clic = sauter"
        ),
        React.createElement("div", { style: { fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--gold)" } },
          `Objectif : ${cfg.target}s`
        )
      ),
      renderField()
    )
  );
}

window.__GAMES__ = window.__GAMES__ || {};
window.__GAMES__.chevauchee = ChevaucheeGame;
})();
