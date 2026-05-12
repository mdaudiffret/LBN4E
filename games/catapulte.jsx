;(function() {
// games/catapulte.jsx — Le Siège
const { useState, useEffect, useRef, useCallback } = React;

const LEVELS = {
  1: { lv: 1, hint: "≥ 3/5 · cible fixe · sans vent",          maxTime: 90, target: 3, total: 5, wind: 0,  targetMove: false },
  2: { lv: 2, hint: "≥ 3/5 · cible surélevée · vent léger",    maxTime: 90, target: 3, total: 5, wind: 5,  targetMove: false },
  3: { lv: 3, hint: "≥ 4/5 · créneaux mobiles · vent puissant", maxTime: 90, target: 4, total: 5, wind: 12, targetMove: true  },
};

// SVG viewBox constants
const VW = 600, VH = 260;
const CAT_X = 80, CAT_Y = 200;
const GROUND_Y = 220;

function getTargetRect(level, targetX) {
  if (level === 1) return { x: targetX - 20, y: 170, w: 40, h: 50 };
  if (level === 2) return { x: targetX - 20, y: 120, w: 40, h: 80 };
  return { x: targetX - 20, y: 140, w: 40, h: 60 };
}

function computeTrajectory(angleDeg, power, windDeg) {
  const angle = (angleDeg * Math.PI) / 180;
  const effectiveAngle = angle + (windDeg * Math.PI) / 180;
  const speed = power * 1.8;
  const vx = speed * Math.cos(effectiveAngle);
  const vy = -speed * Math.sin(effectiveAngle);
  const gravity = 0.6;
  const points = [];
  let x = CAT_X, y = CAT_Y;
  let dx = vx * 0.05, dy = vy * 0.05;
  for (let i = 0; i < 400; i++) {
    x += dx;
    dy += gravity * 0.05;
    y += dy;
    points.push({ x, y });
    if (y > GROUND_Y + 10 || x > VW + 50) break;
  }
  return points;
}

function checkHit(points, rect) {
  for (const p of points) {
    if (p.x >= rect.x && p.x <= rect.x + rect.w &&
        p.y >= rect.y && p.y <= rect.y + rect.h) return true;
  }
  return false;
}

function CastleSvg({ level, targetX }) {
  // Base tower
  const rect = getTargetRect(level, targetX);
  const towerX = rect.x - 10;
  const towerY = rect.y;
  const towerW = rect.w + 20;
  const towerH = GROUND_Y - towerY;

  // Crenellations on top
  const merls = [];
  const merlW = 10, merlH = 12, gap = 6;
  let cx = towerX + 4;
  while (cx + merlW <= towerX + towerW - 4) {
    merls.push(cx);
    cx += merlW + gap;
  }

  return React.createElement(React.Fragment, null,
    // Ground
    React.createElement("rect", { x: 0, y: GROUND_Y, width: VW, height: VH - GROUND_Y, fill: "var(--char-2)", opacity: 0.5 }),
    // Tower body
    React.createElement("rect", { x: towerX, y: towerY, width: towerW, height: towerH, fill: "var(--char-2)", stroke: "var(--line)", strokeWidth: 1 }),
    // Crenellations
    ...merls.map((mx, i) =>
      React.createElement("rect", { key: i, x: mx, y: towerY - merlH, width: merlW, height: merlH, fill: "var(--char-2)", stroke: "var(--line)", strokeWidth: 1 })
    ),
    // Target zone highlight
    React.createElement("rect", { x: rect.x, y: rect.y, width: rect.w, height: rect.h, fill: "var(--gold)", opacity: 0.15, stroke: "var(--gold)", strokeWidth: 1, strokeDasharray: "4 2" })
  );
}

function CatapultSvg() {
  return React.createElement(React.Fragment, null,
    // Catapult base
    React.createElement("rect", { x: CAT_X - 18, y: CAT_Y + 2, width: 36, height: 8, rx: 2, fill: "var(--char-2)", stroke: "var(--line)", strokeWidth: 1 }),
    // Arm
    React.createElement("line", { x1: CAT_X - 8, y1: CAT_Y + 2, x2: CAT_X + 10, y2: CAT_Y - 20, stroke: "var(--bone)", strokeWidth: 3, strokeLinecap: "round" }),
    // Sling cup
    React.createElement("circle", { cx: CAT_X + 12, cy: CAT_Y - 22, r: 4, fill: "var(--gold)", opacity: 0.9 }),
    // Wheels
    React.createElement("circle", { cx: CAT_X - 12, cy: CAT_Y + 12, r: 5, fill: "none", stroke: "var(--line)", strokeWidth: 2 }),
    React.createElement("circle", { cx: CAT_X + 12, cy: CAT_Y + 12, r: 5, fill: "none", stroke: "var(--line)", strokeWidth: 2 })
  );
}

function CatapulteGame({ level, onHud, onFinish }) {
  const cfg = LEVELS[level] || LEVELS[1];
  const [angle, setAngle] = useState(45);
  const [power, setPower] = useState(60);
  const [shots, setShots] = useState(0);         // shots fired
  const [hits, setHits] = useState(0);
  const [results, setResults] = useState([]);    // array of true/false per shot
  const [animPath, setAnimPath] = useState(null);// points array for current anim
  const [animIdx, setAnimIdx] = useState(0);
  const [lastHit, setLastHit] = useState(null);  // true/false/null
  const [firing, setFiring] = useState(false);
  const [over, setOver] = useState(false);
  const [targetX, setTargetX] = useState(490);
  const [windDeg, setWindDeg] = useState(0);
  const animRef = useRef(null);
  const hitsRef = useRef(0);

  // Moving target for level 3
  const targetDirRef = useRef(1);
  const targetXRef = useRef(490);
  useEffect(() => { targetXRef.current = targetX; }, [targetX]);

  useEffect(() => {
    // Init wind
    if (cfg.wind > 0) {
      const sign = Math.random() > 0.5 ? 1 : -1;
      setWindDeg(sign * (cfg.wind * 0.5 + Math.random() * cfg.wind * 0.5));
    }
  }, []);

  // Moving target loop
  useEffect(() => {
    if (!cfg.targetMove || over) return;
    const id = setInterval(() => {
      setTargetX(prev => {
        let next = prev + targetDirRef.current * 2;
        if (next > 530) { targetDirRef.current = -1; next = 530; }
        if (next < 450) { targetDirRef.current = 1; next = 450; }
        return next;
      });
    }, 40);
    return () => clearInterval(id);
  }, [cfg.targetMove, over]);

  useEffect(() => {
    hitsRef.current = hits;
  }, [hits]);

  useEffect(() => {
    onHud({ score: hits, total: cfg.total });
  }, [hits]);

  useEffect(() => {
    if (over) onFinish(hitsRef.current);
  }, [over]);

  const fire = useCallback(() => {
    if (firing || over || shots >= cfg.total) return;
    const currentTargetX = targetXRef.current;
    const points = computeTrajectory(angle, power, windDeg);
    const rect = getTargetRect(level, currentTargetX);
    const isHit = checkHit(points, rect);

    setFiring(true);
    setAnimPath(points);
    setAnimIdx(0);
    setLastHit(null);

    let idx = 0;
    const step = () => {
      idx += 3;
      if (idx >= points.length) {
        setAnimIdx(points.length - 1);
        // Register result
        const newShots = shots + 1;
        const newHits = isHit ? hits + 1 : hits;
        setShots(newShots);
        if (isHit) setHits(newHits);
        setResults(prev => [...prev, isHit]);
        setLastHit(isHit);
        setFiring(false);

        // Refresh wind
        if (cfg.wind > 0) {
          const sign = Math.random() > 0.5 ? 1 : -1;
          setWindDeg(sign * (cfg.wind * 0.5 + Math.random() * cfg.wind * 0.5));
        }

        if (newShots >= cfg.total) {
          setTimeout(() => setOver(true), 900);
        } else {
          setTimeout(() => { setAnimPath(null); setLastHit(null); }, 800);
        }
        return;
      }
      setAnimIdx(idx);
      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
  }, [firing, over, shots, hits, angle, power, windDeg, level, cfg]);

  useEffect(() => {
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  if (over) {
    const passed = hitsRef.current >= cfg.target;
    return (
      React.createElement("div", { className: "col", style: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 } },
        React.createElement("div", { className: "prompt" },
          React.createElement("div", { className: "prompt__instruction" }, "Siège terminé"),
          React.createElement("div", { className: "prompt__main" }, `${hitsRef.current} touche${hitsRef.current > 1 ? "s" : ""} sur ${cfg.total}`)
        ),
        React.createElement("div", { className: `feedback ${passed ? "ok" : "ko"}` },
          passed
            ? `Objectif atteint — ${hitsRef.current} ≥ ${cfg.target}`
            : `Insuffisant — minimum : ${cfg.target} touche${cfg.target > 1 ? "s" : ""}`
        )
      )
    );
  }

  const ballPos = animPath && animPath[animIdx] ? animPath[animIdx] : null;
  const windLabel = windDeg === 0 ? "— Pas de vent" :
    windDeg < 0 ? `← ${Math.abs(windDeg.toFixed(0))}°` : `→ ${windDeg.toFixed(0)}°`;

  return (
    React.createElement("div", { className: "col", style: { flex: 1, gap: 12 } },
      // HUD row
      React.createElement("div", { className: "row", style: { justifyContent: "space-between", alignItems: "center" } },
        React.createElement("div", { style: { fontSize: 13, color: "var(--gold)", fontFamily: "var(--font-serif)" } }, windLabel),
        React.createElement("div", { className: "row", style: { gap: 6 } },
          ...[0,1,2,3,4].map(i =>
            React.createElement("div", {
              key: i,
              style: {
                width: 12, height: 12, borderRadius: "50%",
                background: i < results.length
                  ? (results[i] ? "var(--success)" : "var(--danger)")
                  : "var(--line-dim)",
                border: "1px solid var(--line)"
              }
            })
          )
        ),
        React.createElement("div", { style: { fontSize: 13, color: "var(--bone)" } },
          `Tir ${shots + 1} / ${cfg.total}`
        )
      ),

      // SVG field
      React.createElement("svg", {
        viewBox: `0 0 ${VW} ${VH}`,
        style: { width: "100%", background: "linear-gradient(180deg,var(--char) 0%,var(--char-2) 100%)", borderRadius: 8, border: "1px solid var(--line)" }
      },
        // Sky gradient
        React.createElement("defs", null,
          React.createElement("linearGradient", { id: "skyGrad", x1: 0, y1: 0, x2: 0, y2: 1 },
            React.createElement("stop", { offset: "0%", stopColor: "#0a0a1a" }),
            React.createElement("stop", { offset: "100%", stopColor: "#1a1a2e" })
          )
        ),
        React.createElement("rect", { width: VW, height: VH, fill: "url(#skyGrad)" }),

        // Castle
        React.createElement(CastleSvg, { level, targetX }),

        // Catapult
        React.createElement(CatapultSvg, null),

        // Trajectory path (faint)
        animPath && React.createElement("polyline", {
          points: animPath.slice(0, animIdx + 1).map(p => `${p.x},${p.y}`).join(" "),
          fill: "none",
          stroke: "var(--gold)",
          strokeWidth: 1,
          strokeDasharray: "3 4",
          opacity: 0.4
        }),

        // Projectile ball
        ballPos && React.createElement("circle", {
          cx: ballPos.x, cy: ballPos.y, r: 6,
          fill: lastHit === null ? "var(--pearl)" : (lastHit ? "var(--success)" : "var(--danger)"),
          stroke: "var(--bone)",
          strokeWidth: 1
        }),

        // Hit/miss flash
        lastHit !== null && !firing && React.createElement("text", {
          x: ballPos ? ballPos.x : VW / 2, y: ballPos ? ballPos.y - 16 : VH / 2,
          textAnchor: "middle",
          fill: lastHit ? "var(--success)" : "var(--danger)",
          fontSize: 20,
          fontFamily: "var(--font-serif)"
        }, lastHit ? "✓" : "✗")
      ),

      // Controls
      React.createElement("div", { className: "row", style: { gap: 16, alignItems: "flex-end" } },
        React.createElement("div", { className: "col", style: { flex: 1, gap: 4 } },
          React.createElement("label", { style: { fontSize: 11, color: "var(--bone)", fontFamily: "var(--font-serif)" } },
            `Angle : ${angle}°`
          ),
          React.createElement("input", {
            type: "range", min: 10, max: 80, value: angle,
            onChange: e => setAngle(Number(e.target.value)),
            disabled: firing || over,
            className: "k-input",
            style: { width: "100%" }
          })
        ),
        React.createElement("div", { className: "col", style: { flex: 1, gap: 4 } },
          React.createElement("label", { style: { fontSize: 11, color: "var(--bone)", fontFamily: "var(--font-serif)" } },
            `Force : ${power}%`
          ),
          React.createElement("input", {
            type: "range", min: 10, max: 100, value: power,
            onChange: e => setPower(Number(e.target.value)),
            disabled: firing || over,
            className: "k-input",
            style: { width: "100%" }
          })
        ),
        React.createElement("button", {
          className: "k-btn k-btn--brand",
          onClick: fire,
          disabled: firing || over || shots >= cfg.total,
          style: { whiteSpace: "nowrap" }
        }, "Tirer !")
      ),

      React.createElement("style", null, `
        .catapulte-range { accent-color: var(--gold); }
      `)
    )
  );
}

window.__GAMES__ = window.__GAMES__ || {};
window.__GAMES__.catapulte = CatapulteGame;
})();
