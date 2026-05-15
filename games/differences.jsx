;(function () {
// games/differences.jsx — Trouve les intrus anachroniques !
const { useState, useEffect, useRef, useCallback } = React;

// Coordonnées en % de l'image (x = gauche→droite, y = haut→bas)
// Images PNG 16:9 dans assets/differences/
const CONFIGS = {
  1: {
    image: "assets/differences/lv1.png",
    tolerance: 7,
    maxTime: 180,
    intrus: [
      { id: 1, x: 8,  y: 73, label: "Trottinette électrique" },  // bas-gauche, barrière
      { id: 2, x: 36, y: 62, label: "Montre numérique" },         // poignet droit chevalier (vue gauche)
      { id: 3, x: 32, y: 68, label: "Gourde en plastique" },      // main droite chevalier
      { id: 4, x: 41, y: 22, label: "Lunettes de soleil" },       // casque
      { id: 5, x: 50, y: 55, label: "Smartphone" },               // main gauche chevalier
      { id: 6, x: 70, y: 8,  label: "Drone" },                    // ciel haut-droite
      { id: 7, x: 83, y: 65, label: "Poubelle à roulettes" },     // droite, château
    ],
  },
  2: {
    image: "assets/differences/lv2.png",
    tolerance: 6,
    maxTime: 150,
    intrus: [
      { id: 1,  x: 39, y: 17, label: "Bouteille d'eau" },         // heaume chevalier
      { id: 2,  x: 38, y: 23, label: "Lunettes de soleil" },      // visage chevalier
      { id: 3,  x: 46, y: 55, label: "Caméra GoPro" },            // flanc selle
      { id: 4,  x: 19, y: 73, label: "Mini-cône bleu" },          // chemin forêt gauche
      { id: 5,  x: 14, y: 81, label: "Télécommande" },            // herbe premier plan gauche
      { id: 6,  x: 53, y: 60, label: "Montre connectée" },        // poignet droit écuyer
      { id: 7,  x: 52, y: 67, label: "Canard en plastique" },     // rivière
      { id: 8,  x: 79, y: 55, label: "Sac à main" },              // dame droite
      { id: 9,  x: 75, y: 48, label: "Parapluie multicolore" },   // dame droite
      { id: 10, x: 83, y: 66, label: "Ordinateur portable" },     // muret pierre
      { id: 11, x: 84, y: 73, label: "Coccinelle" },              // porte château
      { id: 12, x: 85, y: 21, label: "Antenne parabolique" },     // tour château
      { id: 13, x: 81, y: 33, label: "Tube de chips" },           // rempart, garde
      { id: 14, x: 94, y: 90, label: "QR Code" },                 // bordure déco, bas-droit
    ],
  },
  3: {
    image: "assets/differences/lv3.png",
    tolerance: 5,
    maxTime: 120,
    intrus: [
      { id: 1,  x: 10, y: 5,  label: "Drones" },                  // ciel haut-gauche
      { id: 2,  x: 38, y: 13, label: "Parabole satellite" },      // clocher église
      { id: 3,  x: 68, y: 10, label: "Éoliennes" },               // collines fond
      { id: 4,  x: 96, y: 44, label: "Poteau électrique" },       // extrême droite
      { id: 5,  x: 67, y: 33, label: "Panneaux solaires" },       // arbre centre-droit
      { id: 6,  x: 83, y: 52, label: "Cabine WC bleue" },         // arrière-plan droit
      { id: 7,  x: 82, y: 64, label: "Bicyclette noire" },        // sous cabine WC
      { id: 8,  x: 10, y: 63, label: "Caisse enregistreuse" },    // table marchande gauche
      { id: 9,  x: 7,  y: 74, label: "Panneaux signalisation" },  // premier plan gauche
      { id: 10, x: 18, y: 68, label: "Casque audio" },            // homme premier plan gauche
      { id: 11, x: 18, y: 79, label: "Peluche Spider-Man" },      // petite fille gauche
      { id: 12, x: 24, y: 71, label: "Figurine super-héros" },    // homme face à la fille
      { id: 13, x: 57, y: 54, label: "Smartphone chevalier" },    // chevalier cheval brun
      { id: 14, x: 60, y: 66, label: "Sacs de livraison" },       // charrette centre-droit
      { id: 15, x: 79, y: 46, label: "Frisbee jaune" },           // en l'air, champ droit
      { id: 16, x: 54, y: 81, label: "Gobelet de café" },         // sol, centre avant
      { id: 17, x: 84, y: 76, label: "Vélo moderne" },            // homme chapeau marron
      { id: 18, x: 87, y: 68, label: "Canettes de soda" },        // marcheur à côté vélo
      { id: 19, x: 91, y: 61, label: "Journaux imprimés" },       // étal droit
      { id: 20, x: 90, y: 53, label: "Guirlandes lumineuses" },   // toit étal droit
      { id: 21, x: 66, y: 74, label: "Vêtements denim" },         // homme marchant avant centre
    ],
  },
};

/* ─── Helpers ─────────────────────────────────────────── */
function dist(ax, ay, bx, by) {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

/* ─── Composant principal ─────────────────────────────── */
function DifferencesGame({ level, onHud, onFinish }) {
  const cfg   = CONFIGS[level] || CONFIGS[1];
  const total = cfg.intrus.length;

  const [found,   setFound]   = useState(new Set());
  const [wrong,   setWrong]   = useState(null);   // { x, y, ts }
  const [time,    setTime]    = useState(cfg.maxTime);
  const [over,    setOver]    = useState(false);
  const [tooltip, setTooltip] = useState(null);   // { label, x, y }
  const containerRef          = useRef(null);
  const foundRef              = useRef(new Set());

  // Sync found → ref (pour accès dans closures)
  useEffect(() => { foundRef.current = found; }, [found]);
  useEffect(() => { onHud({ score: found.size, total }); }, [found.size]);

  // Timer
  useEffect(() => {
    if (over) return;
    if (time <= 0) { setOver(true); return; }
    const t = setTimeout(() => setTime(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [time, over]);

  // Fin si tous trouvés
  useEffect(() => {
    if (!over && found.size >= total) setOver(true);
  }, [found.size, over]);

  // onFinish
  useEffect(() => {
    if (over) onFinish(foundRef.current.size);
  }, [over]);

  const handleClick = useCallback((e) => {
    if (over) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.left + rect.width ||
        e.clientY < rect.top  || e.clientY > rect.top  + rect.height) return;
    const px = ((e.clientX - rect.left) / rect.width)  * 100;
    const py = ((e.clientY - rect.top)  / rect.height) * 100;

    // Mode calibration (activer via window.__diffDebug = true dans la console)
    if (window.__diffDebug) {
      console.log(`{ x: ${px.toFixed(1)}, y: ${py.toFixed(1)} }`);
    }

    let hit = null;
    let minD = Infinity;
    for (const d of cfg.intrus) {
      if (foundRef.current.has(d.id)) continue;
      const d2 = dist(px, py, d.x, d.y);
      if (d2 < cfg.tolerance && d2 < minD) { minD = d2; hit = d; }
    }

    if (hit) {
      setFound(prev => new Set([...prev, hit.id]));
      // Tooltip fugace avec le label
      setTooltip({ label: hit.label, x: px, y: py });
      setTimeout(() => setTooltip(t => t?.label === hit.label ? null : t), 1800);
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
    const won   = found.size === total;
    const score = found.size;
    const miss  = total - score;
    return React.createElement("div", { className: "col", style: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 } },
      React.createElement("div", { className: "prompt" },
        React.createElement("div", { className: "prompt__instruction" }, "Partie terminée"),
        React.createElement("div", { className: "prompt__main" }, `${score} / ${total} intrus`)
      ),
      React.createElement("div", { className: `feedback ${won ? "ok" : "ko"}` },
        won ? "Tous les intrus démasqués !" : `${miss} intrus manqué${miss > 1 ? "s" : ""}`
      )
    );
  }

  // Markers des intrus trouvés
  const markers = [];
  for (const id of found) {
    const d = cfg.intrus.find(x => x.id === id);
    if (!d) continue;
    markers.push(
      React.createElement("div", {
        key: `m-${id}`,
        style: {
          position: "absolute",
          left: `${d.x}%`,
          top:  `${d.y}%`,
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

  // Marker mauvais clic
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

  // Tooltip label intrus trouvé
  if (tooltip) {
    markers.push(
      React.createElement("div", {
        key: "tooltip",
        style: {
          position: "absolute",
          left:   `${tooltip.x}%`,
          top:    `calc(${tooltip.y}% - 28px)`,
          transform: "translateX(-50%)",
          background: "rgba(10,8,4,0.85)",
          color: "var(--gold)",
          fontSize: 10,
          fontFamily: "var(--font-brand)",
          letterSpacing: "0.06em",
          padding: "3px 8px",
          borderRadius: 4,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          zIndex: 20,
          animation: "diff-tooltip 1.8s ease forwards",
        }
      }, tooltip.label)
    );
  }

  return React.createElement("div", { className: "col", style: { flex: 1, gap: 10, alignItems: "stretch" } },
    // HUD
    React.createElement("div", { className: "row", style: { justifyContent: "space-between", alignItems: "center" } },
      React.createElement("div", { style: { fontFamily: "var(--font-serif)", color: "var(--bone)", fontSize: 13 } },
        React.createElement("span", { style: { color: "var(--success)", fontWeight: 700, fontSize: 16 } }, found.size),
        React.createElement("span", { style: { color: "var(--line)" } }, ` / ${total} intrus`)
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
    React.createElement("div", { style: { display: "flex", justifyContent: "center", width: "100%" } },
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
          lineHeight: 0,
          maxHeight: "65vh",
          background: "var(--ink)",
        }
      },
        React.createElement("img", {
          src: cfg.image,
          draggable: false,
          style: {
            maxWidth: "100%",
            maxHeight: "65vh",
            display: "block",
            pointerEvents: "none",
          }
        }),
        ...markers
      )
    ),
    // Légende
    React.createElement("div", { style: { fontSize: 10, color: "var(--line)", fontFamily: "var(--font-mono)", textAlign: "center" } },
      `Repère et clique sur les ${total} éléments anachroniques cachés dans l'image`
    )
  );
}

// CSS animations
if (!document.getElementById("diff-style")) {
  const s = document.createElement("style");
  s.id = "diff-style";
  s.textContent = [
    `@keyframes diff-wrong { 0%{opacity:1;transform:translate(-50%,-50%) scale(1)} 100%{opacity:0;transform:translate(-50%,-50%) scale(1.8)} }`,
    `@keyframes diff-tooltip { 0%{opacity:0;transform:translateX(-50%) translateY(4px)} 15%{opacity:1;transform:translateX(-50%) translateY(0)} 75%{opacity:1} 100%{opacity:0} }`,
  ].join("\n");
  document.head.appendChild(s);
}

window.__GAMES__ = window.__GAMES__ || {};
window.__GAMES__.differences = DifferencesGame;
})();
