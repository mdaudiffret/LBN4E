;(function () {
// games/differences.jsx — Les 7 Différences
const { useState, useEffect, useRef, useCallback } = React;

// split: "v" = top(original) / bottom(modified)
//        "h" = left(original) / right(modified)
// diffs: coords en % DANS UNE MOITIÉ (0-100)
// tolerance: rayon de clic en % d'une moitié

const CONFIGS = {
  1: {
    image: "assets/differences/lv1.jpg",
    split: "v",
    tolerance: 10,
    maxTime: 180,
    diffs: [
      { id: 1, x: 44,  y: 17 }, // panache casque  (plume rouge→bleue)
      { id: 2, x: 36,  y: 78 }, // cape             (verte→orange, bas)
      { id: 3, x: 36,  y: 56 }, // bouclier         (rayé→rouge)
      { id: 4, x: 66,  y: 65 }, // gemme épée       (absente→rouge)
      { id: 5, x: 84,  y: 39 }, // drapeau château  (violet→vert)
      { id: 6, x: 17,  y: 15 }, // soleil / nuage   (nuage blanc→foncé)
      { id: 7, x: 84,  y: 87 }, // fleurs / rochers (rochers→fleurs)
    ],
  },
  2: {
    image: "assets/differences/lv2.jpg",
    split: "v",
    tolerance: 8,
    maxTime: 150,
    diffs: [
      { id: 1, x: 63,  y: 16 }, // drapeaux château centre-droit
      { id: 2, x: 40,  y: 15 }, // drapeaux château centre-gauche
      { id: 3, x: 63,  y: 65 }, // champ tournoi centre-droit
      { id: 4, x: 40,  y: 84 }, // cour royale bas centre
      { id: 5, x: 78,  y: 43 }, // tente tournoi droite
      { id: 6, x: 32,  y: 38 }, // balcon dames
      { id: 7, x: 80,  y: 76 }, // tente / personnages bas droite
    ],
  },
  3: {
    image: "assets/differences/lv3.jpg",
    split: "h",
    tolerance: 6,
    maxTime: 120,
    diffs: [
      { id: 1, x: 53,  y: 56 }, // centre-droit bas
      { id: 2, x: 21,  y: 34 }, // gauche milieu
      { id: 3, x: 29,  y: 64 }, // centre-gauche bas
      { id: 4, x: 89,  y: 72 }, // droite bas
      { id: 5, x: 62,  y: 77 }, // centre-droite bas
      { id: 6, x: 91,  y: 42 }, // droite milieu
      { id: 7, x: 76,  y: 34 }, // droite haut-milieu
    ],
  },
};

/* ─── Helpers ─────────────────────────────────────────── */
function dist(ax, ay, bx, by) {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

// Rect réel de l'image rendue avec object-fit:contain dans son conteneur
function getImageRect(container, img) {
  const cr = container.getBoundingClientRect();
  const nw = img.naturalWidth  || img.width  || cr.width;
  const nh = img.naturalHeight || img.height || cr.height;
  const ca = cr.width / cr.height;
  const ia = nw / nh;
  let w, h, ox, oy;
  if (ia > ca) { w = cr.width;  h = cr.width / ia;  ox = 0; oy = (cr.height - h) / 2; }
  else         { h = cr.height; w = cr.height * ia;  oy = 0; ox = (cr.width  - w) / 2; }
  return { left: cr.left + ox, top: cr.top + oy, width: w, height: h };
}

// Click (px, py) en % du conteneur → coords normalisées dans la demi-image
// Retourne { normX, normY } en % ou null si inclassable
function normalize(px, py, split) {
  if (split === "v") {
    if (py < 50) return { normX: px, normY: py * 2 };
    return { normX: px, normY: (py - 50) * 2 };
  }
  // split === "h"
  if (px < 50) return { normX: px * 2, normY: py };
  return { normX: (px - 50) * 2, normY: py };
}

// Coordonnées des deux markers à afficher (% du conteneur)
function markerPositions(normX, normY, split) {
  if (split === "v") {
    return [
      { x: normX, y: normY * 0.5 },           // moitié haute
      { x: normX, y: 50 + normY * 0.5 },      // moitié basse
    ];
  }
  return [
    { x: normX * 0.5,       y: normY },        // moitié gauche
    { x: 50 + normX * 0.5,  y: normY },        // moitié droite
  ];
}

/* ─── Composant principal ─────────────────────────────── */
function DifferencesGame({ level, onHud, onFinish }) {
  const cfg   = CONFIGS[level] || CONFIGS[1];
  const total = cfg.diffs.length; // 7

  const [found,     setFound]     = useState(new Set());
  const [wrong,     setWrong]     = useState(null);   // { x, y, ts }
  const [time,      setTime]      = useState(cfg.maxTime);
  const [over,      setOver]      = useState(false);
  const containerRef              = useRef(null);
  const imgRef                    = useRef(null);
  const foundRef                  = useRef(new Set());

  // Sync found → ref (pour accès dans closure)
  useEffect(() => { foundRef.current = found; }, [found]);

  useEffect(() => { onHud({ score: found.size, total }); }, [found.size]);

  // Timer
  useEffect(() => {
    if (over) return;
    if (time <= 0) { setOver(true); return; }
    const t = setTimeout(() => setTime(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [time, over]);

  // Fin si toutes trouvées
  useEffect(() => {
    if (!over && found.size >= total) setOver(true);
  }, [found.size, over]);

  // onFinish
  useEffect(() => {
    if (over) onFinish(foundRef.current.size);
  }, [over]);

  const handleClick = useCallback((e) => {
    if (over) return;
    const rect = getImageRect(containerRef.current, imgRef.current);
    // Ignorer les clics hors de l'image réelle (zones letterbox)
    if (e.clientX < rect.left || e.clientX > rect.left + rect.width ||
        e.clientY < rect.top  || e.clientY > rect.top  + rect.height) return;
    const px = ((e.clientX - rect.left) / rect.width)  * 100;
    const py = ((e.clientY - rect.top)  / rect.height) * 100;

    const { normX, normY } = normalize(px, py, cfg.split);

    // Cherche la diff la plus proche dans le rayon
    let hit = null;
    let minD = Infinity;
    for (const d of cfg.diffs) {
      if (foundRef.current.has(d.id)) continue;
      const d2 = dist(normX, normY, d.x, d.y);
      if (d2 < cfg.tolerance && d2 < minD) { minD = d2; hit = d; }
    }

    if (hit) {
      setFound(prev => new Set([...prev, hit.id]));
    } else {
      const ts = Date.now();
      setWrong({ x: px, y: py, ts });
      setTimeout(() => setWrong(w => w?.ts === ts ? null : w), 700);
    }
  }, [over, cfg]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const timerPct   = (time / cfg.maxTime) * 100;
  const timerColor = time <= 15 ? "var(--danger)" : time <= 30 ? "var(--gold)" : "var(--success)";

  if (over) {
    const passed = found.size >= cfg.diffs.filter(() => true).length;
    const score  = found.size;
    // target is all 7 for win
    const won = score === total;
    return React.createElement("div", { className: "col", style: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 } },
      React.createElement("div", { className: "prompt" },
        React.createElement("div", { className: "prompt__instruction" }, "Partie terminée"),
        React.createElement("div", { className: "prompt__main" }, `${score} / ${total} différences`)
      ),
      React.createElement("div", { className: `feedback ${won ? "ok" : "ko"}` },
        won ? `Toutes trouvées !` : `${total - score} différence${total - score > 1 ? "s" : ""} manquée${total - score > 1 ? "s" : ""}`
      )
    );
  }

  // Markers des diffs trouvées
  const markers = [];
  for (const id of found) {
    const d = cfg.diffs.find(x => x.id === id);
    if (!d) continue;
    for (const pos of markerPositions(d.x, d.y, cfg.split)) {
      markers.push(
        React.createElement("div", {
          key: `m-${id}-${pos.x}-${pos.y}`,
          style: {
            position: "absolute",
            left:   `${pos.x}%`,
            top:    `${pos.y}%`,
            width: 36, height: 36,
            transform: "translate(-50%,-50%)",
            borderRadius: "50%",
            border: "3px solid var(--success)",
            boxShadow: "0 0 8px rgba(80,200,80,0.6)",
            background: "rgba(80,200,80,0.15)",
            pointerEvents: "none",
            zIndex: 10,
          }
        })
      );
    }
  }

  // Marker "mauvais clic"
  if (wrong) {
    markers.push(
      React.createElement("div", {
        key: "wrong",
        style: {
          position: "absolute",
          left:   `${wrong.x}%`,
          top:    `${wrong.y}%`,
          width: 30, height: 30,
          transform: "translate(-50%,-50%)",
          borderRadius: "50%",
          border: "2px solid var(--danger)",
          background: "rgba(200,60,60,0.2)",
          pointerEvents: "none",
          zIndex: 10,
          animation: "diff-wrong 0.7s ease forwards",
        }
      })
    );
  }

  return React.createElement("div", { className: "col", style: { flex: 1, gap: 10, alignItems: "stretch" } },
    // HUD
    React.createElement("div", { className: "row", style: { justifyContent: "space-between", alignItems: "center" } },
      React.createElement("div", { style: { fontFamily: "var(--font-serif)", color: "var(--bone)", fontSize: 13 } },
        React.createElement("span", { style: { color: "var(--success)", fontWeight: 700, fontSize: 16 } }, found.size),
        React.createElement("span", { style: { color: "var(--line)" } }, ` / ${total} différences`)
      ),
      React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 700, color: timerColor } },
        formatTime(time)
      )
    ),
    // Barre timer
    React.createElement("div", { style: { height: 3, background: "var(--line-dim)", borderRadius: 2, overflow: "hidden" } },
      React.createElement("div", { style: { height: "100%", width: `${timerPct}%`, background: timerColor, transition: "width 1s linear, background .3s" } })
    ),
    // Image + overlay
    React.createElement("div", {
      ref: containerRef,
      onClick: handleClick,
      style: {
        position: "relative",
        cursor: "crosshair",
        borderRadius: 8,
        overflow: "hidden",
        border: "1px solid var(--line)",
        userSelect: "none",
        touchAction: "none",
        width: "100%",
        maxHeight: "65vh",
        background: "var(--ink)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }
    },
      React.createElement("img", {
        ref: imgRef,
        src: cfg.image,
        draggable: false,
        style: {
          maxWidth: "100%",
          maxHeight: "65vh",
          objectFit: "contain",
          display: "block",
          pointerEvents: "none",
        }
      }),
      // Séparateur central
      React.createElement("div", {
        style: Object.assign(
          { position: "absolute", background: "var(--gold)", opacity: 0.6, zIndex: 5, pointerEvents: "none" },
          cfg.split === "v"
            ? { left: 0, right: 0, top: "50%", height: 2, transform: "translateY(-50%)" }
            : { top: 0, bottom: 0, left: "50%", width: 2, transform: "translateX(-50%)" }
        )
      }),
      // Labels Original / Modifié
      React.createElement("div", {
        style: {
          position: "absolute", zIndex: 6, pointerEvents: "none",
          ...(cfg.split === "v"
            ? { top: 4, left: 6 }
            : { top: 4, left: 6 }),
          fontSize: 9, fontFamily: "var(--font-brand)",
          color: "var(--gold)", letterSpacing: "0.1em", textTransform: "uppercase",
          background: "rgba(10,8,4,0.6)", padding: "2px 6px", borderRadius: 3,
        }
      }, "Original"),
      React.createElement("div", {
        style: {
          position: "absolute", zIndex: 6, pointerEvents: "none",
          ...(cfg.split === "v"
            ? { top: "calc(50% + 4px)", left: 6 }
            : { top: 4, left: "calc(50% + 6px)" }),
          fontSize: 9, fontFamily: "var(--font-brand)",
          color: "var(--gold)", letterSpacing: "0.1em", textTransform: "uppercase",
          background: "rgba(10,8,4,0.6)", padding: "2px 6px", borderRadius: 3,
        }
      }, "Modifié"),
      ...markers
    ),
    // Légende
    React.createElement("div", { style: { fontSize: 10, color: "var(--line)", fontFamily: "var(--font-mono)", textAlign: "center" } },
      "Clique sur les différences dans l'une ou l'autre moitié"
    )
  );
}

// CSS animation mauvais clic
if (!document.getElementById("diff-style")) {
  const s = document.createElement("style");
  s.id = "diff-style";
  s.textContent = `@keyframes diff-wrong { 0%{opacity:1;transform:translate(-50%,-50%) scale(1)} 100%{opacity:0;transform:translate(-50%,-50%) scale(1.8)} }`;
  document.head.appendChild(s);
}

window.__GAMES__ = window.__GAMES__ || {};
window.__GAMES__.differences = DifferencesGame;
})();
