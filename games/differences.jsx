;(function () {
// games/differences.jsx — Trouve les intrus anachroniques !
const { useState, useEffect, useRef, useCallback } = React;

// Coordonnées en % de l'image (x = gauche→droite, y = haut→bas)
// Images PNG 16:9 dans assets/differences/
const CONFIGS_DEFAULT = {
  1: {
    image: "assets/differences/lv1.png",
    tolerance: 5,
    maxTime: 180,
    intrus: [
      { id: 1, x: 10, y: 72, label: "Trottinette électrique" },  // bas-gauche, roue de la trottinette
      { id: 2, x: 38, y: 53, label: "Montre numérique" },         // poignet gauche du chevalier
      { id: 3, x: 42, y: 63, label: "Gourde en plastique" },      // bouteille arc-en-ciel dans la main gauche
      { id: 4, x: 40, y: 24, label: "Lunettes de soleil" },       // lunettes sur le casque (face)
      { id: 5, x: 58, y: 47, label: "Smartphone" },               // téléphone tenu dans la main droite
      { id: 6, x: 54, y: 20, label: "Drone" },                    // drone dans le ciel au-dessus
      { id: 7, x: 86, y: 57, label: "Poubelle à roulettes" },     // poubelle verte à droite
    ],
  },
  2: {
    image: "assets/differences/lv2.png",
    tolerance: 4,
    maxTime: 150,
    intrus: [
      { id: 1,  x: 39, y: 16, label: "Bouteille d'eau" },         // sur le heaume
      { id: 2,  x: 38, y: 46, label: "Lunettes de soleil" },      // visière du chevalier / bras gauche
      { id: 3,  x: 37, y: 57, label: "Caméra GoPro" },            // flanc de la selle
      { id: 4,  x: 19, y: 44, label: "Mini-cône bleu" },          // chemin forêt gauche
      { id: 5,  x: 13, y: 83, label: "Télécommande" },            // herbe premier plan gauche
      { id: 6,  x: 53, y: 59, label: "Montre connectée" },        // poignet droit de l'écuyer
      { id: 7,  x: 57, y: 66, label: "Canard en plastique" },     // rivière
      { id: 8,  x: 78, y: 57, label: "Sac à main" },              // tenu par la dame droite
      { id: 9,  x: 72, y: 52, label: "Parapluie multicolore" },   // ombrelle de la dame
      { id: 10, x: 83, y: 65, label: "Ordinateur portable" },     // posé sur le muret
      { id: 11, x: 82, y: 57, label: "Coccinelle" },              // devant le château droite
      { id: 12, x: 86, y: 14, label: "Antenne parabolique" },     // tour principale du château
      { id: 13, x: 81, y: 26, label: "Tube de chips" },           // rempart à côté du garde
      { id: 14, x: 93, y: 85, label: "QR Code" },                 // bordure décorative bas-droit
    ],
  },
  3: {
    image: "assets/differences/lv3.png",
    tolerance: 4,
    maxTime: 120,
    intrus: [
      { id: 1,  x: 19, y: 8,  label: "Drones" },                  // ciel haut-gauche
      { id: 2,  x: 35, y: 8,  label: "Parabole satellite" },      // clocher de l'église
      { id: 3,  x: 47, y: 13, label: "Éoliennes" },               // grande éolienne centre
      { id: 4,  x: 93, y: 9,  label: "Poteau électrique" },       // extrême droite haut
      { id: 5,  x: 67, y: 28, label: "Panneaux solaires" },       // sur l'arbre centre-droit
      { id: 6,  x: 86, y: 33, label: "Cabine WC bleue" },         // arrière-plan droit
      { id: 7,  x: 82, y: 78, label: "Bicyclette noire" },        // premier plan droit
      { id: 8,  x: 10, y: 72, label: "Caisse enregistreuse" },    // table marchande gauche
      { id: 9,  x: 6,  y: 75, label: "Panneaux signalisation" },  // premier plan gauche
      { id: 10, x: 18, y: 63, label: "Casque audio" },            // homme premier plan gauche
      { id: 11, x: 33, y: 80, label: "Peluche Spider-Man" },      // petite fille, main gauche
      { id: 12, x: 30, y: 63, label: "Figurine super-héros" },    // homme face à la fille
      { id: 13, x: 57, y: 52, label: "Smartphone chevalier" },    // chevalier sur cheval brun
      { id: 14, x: 67, y: 52, label: "Sacs de livraison" },       // cavalier centre-droit
      { id: 15, x: 79, y: 47, label: "Frisbee jaune" },           // en vol, champ droit
      { id: 16, x: 54, y: 80, label: "Gobelet de café" },         // sol, centre avant
      { id: 17, x: 75, y: 67, label: "Vélo moderne" },            // homme droite
      { id: 18, x: 87, y: 67, label: "Canettes de soda" },        // marcheur à côté du vélo
      { id: 19, x: 91, y: 77, label: "Journaux imprimés" },       // étal droit
      { id: 20, x: 93, y: 47, label: "Guirlandes lumineuses" },   // toit de l'étal droit
      { id: 21, x: 72, y: 53, label: "Vêtements denim" },         // cavalier / moto centre
    ],
  },
};

// Retourne la config effective (sauvegardée en admin ou valeur par défaut)
function getEffectiveConfig(level) {
  const saved = window.__differencesConfig;
  if (saved && saved[level]) {
    return {
      image:     CONFIGS_DEFAULT[level].image,
      maxTime:   CONFIGS_DEFAULT[level].maxTime,
      tolerance: saved[level].tolerance ?? CONFIGS_DEFAULT[level].tolerance,
      intrus:    saved[level].intrus    ?? CONFIGS_DEFAULT[level].intrus,
    };
  }
  return CONFIGS_DEFAULT[level];
}

/* ─── Helpers ─────────────────────────────────────────── */
function dist(ax, ay, bx, by) {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

/* ─── Composant Mode Édition (admin) ─────────────────── */
function DifferencesEditMode({ onSaveConfig }) {
  const [lvEdit, setLvEdit] = useState(1);
  // Init depuis la config effective courante (sauvegardée ou par défaut)
  const [configs, setConfigs] = useState(() => {
    const result = {};
    for (const lv of [1, 2, 3]) {
      const c = getEffectiveConfig(lv);
      result[lv] = { tolerance: c.tolerance, intrus: c.intrus.map(d => ({ ...d })) };
    }
    return result;
  });
  const [selected, setSelected] = useState(null);
  const [labelInput, setLabelInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef(null);

  const cfg = configs[lvEdit];

  // Convertit un événement souris ou touch en coordonnées % dans l'image
  function eventToPercent(e) {
    const el = containerRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const px = ((clientX - rect.left) / rect.width) * 100;
    const py = ((clientY - rect.top) / rect.height) * 100;
    if (px < 0 || px > 100 || py < 0 || py > 100) return null;
    return { px, py };
  }

  const handleImageClick = (e) => {
    const pos = eventToPercent(e);
    if (!pos) return;
    const { px, py } = pos;

    // Clic sur un hotpoint existant → sélection
    let hit = null, minD = Infinity;
    for (const d of cfg.intrus) {
      const d2 = dist(px, py, d.x, d.y);
      if (d2 < 5 && d2 < minD) { minD = d2; hit = d; }
    }

    if (hit) {
      setSelected(hit.id);
      setLabelInput(hit.label);
    } else {
      // Ajouter un nouveau hotpoint
      const maxId = cfg.intrus.reduce((m, d) => Math.max(m, d.id), 0);
      const newId = maxId + 1;
      const newHp = { id: newId, x: parseFloat(px.toFixed(1)), y: parseFloat(py.toFixed(1)), label: `Intrus ${newId}` };
      setConfigs(prev => ({
        ...prev,
        [lvEdit]: { ...prev[lvEdit], intrus: [...prev[lvEdit].intrus, newHp] }
      }));
      setSelected(newId);
      setLabelInput(`Intrus ${newId}`);
    }
  };

  const commitLabel = useCallback(() => {
    if (selected === null) return;
    setConfigs(prev => ({
      ...prev,
      [lvEdit]: {
        ...prev[lvEdit],
        intrus: prev[lvEdit].intrus.map(d => d.id === selected ? { ...d, label: labelInput } : d)
      }
    }));
  }, [selected, lvEdit, labelInput]);

  const deleteSelected = () => {
    setConfigs(prev => ({
      ...prev,
      [lvEdit]: { ...prev[lvEdit], intrus: prev[lvEdit].intrus.filter(d => d.id !== selected) }
    }));
    setSelected(null);
    setLabelInput("");
  };

  const setTolerance = (val) => {
    setConfigs(prev => ({
      ...prev,
      [lvEdit]: { ...prev[lvEdit], tolerance: parseFloat(val) }
    }));
  };

  const save = async () => {
    commitLabel();
    setSaving(true);
    const fullConfig = {};
    for (const lv of [1, 2, 3]) {
      fullConfig[lv] = { tolerance: configs[lv].tolerance, intrus: configs[lv].intrus };
    }
    window.__differencesConfig = fullConfig;
    if (onSaveConfig) await onSaveConfig(fullConfig);
    setSaving(false);
  };

  const copyJson = () => {
    commitLabel();
    const fullConfig = {};
    for (const lv of [1, 2, 3]) {
      fullConfig[lv] = { tolerance: configs[lv].tolerance, intrus: configs[lv].intrus };
    }
    navigator.clipboard.writeText(JSON.stringify(fullConfig, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const selectedHp = cfg.intrus.find(d => d.id === selected);

  const btnBase = {
    fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em",
    cursor: "pointer", borderRadius: 3, padding: "4px 10px", border: "1px solid var(--line)",
  };

  return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, flex: 1, minHeight: 0 } },

    // ── Barre du haut : onglets de niveau + compteur ──────────────
    React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" } },
      React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--gold)", letterSpacing: "0.18em", textTransform: "uppercase", marginRight: 4 } }, "Niveau :"),
      [1, 2, 3].map(lv =>
        React.createElement("button", {
          key: lv,
          onClick: () => { setLvEdit(lv); setSelected(null); setLabelInput(""); },
          style: {
            ...btnBase,
            background: lvEdit === lv ? "var(--gold)" : "transparent",
            color: lvEdit === lv ? "var(--ink)" : "var(--bone)",
            borderColor: lvEdit === lv ? "var(--gold)" : "var(--line)",
            fontWeight: lvEdit === lv ? 700 : 400,
          }
        }, `Niveau ${lv}`)
      ),
      React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--bone)", opacity: 0.5, marginLeft: 6 } },
        `${cfg.intrus.length} hotpoint${cfg.intrus.length !== 1 ? "s" : ""}`
      ),
      React.createElement("div", { style: { flex: 1 } }),
      React.createElement("button", { onClick: copyJson, style: { ...btnBase, background: "transparent", color: "var(--bone)" } },
        copied ? "✓ Copié !" : "Copier JSON"
      ),
      React.createElement("button", {
        onClick: save, disabled: saving,
        style: { ...btnBase, background: "var(--gold)", border: "none", color: "var(--ink)", fontWeight: 700, opacity: saving ? 0.6 : 1 }
      }, saving ? "Sauvegarde…" : "⚜ Sauvegarder")
    ),

    // ── Image cliquable avec hotpoints ────────────────────────────
    React.createElement("div", { style: { display: "flex", justifyContent: "center", flex: 1, minHeight: 0, overflow: "auto" } },
      React.createElement("div", {
        ref: containerRef,
        onClick: handleImageClick,
        style: {
          position: "relative",
          cursor: "crosshair",
          lineHeight: 0,
          userSelect: "none",
          border: "2px solid var(--gold)",
          borderRadius: 4,
          overflow: "hidden",
          display: "inline-block",
          maxWidth: "100%",
        }
      },
        React.createElement("img", {
          src: CONFIGS_DEFAULT[lvEdit].image,
          draggable: false,
          style: { maxWidth: "100%", maxHeight: "55vh", display: "block", pointerEvents: "none" }
        }),
        // Hotpoints
        ...cfg.intrus.map(d => {
          const isSel = d.id === selected;
          return React.createElement("div", {
            key: d.id,
            style: {
              position: "absolute",
              left: `${d.x}%`,
              top: `${d.y}%`,
              transform: "translate(-50%,-50%)",
              width: 26, height: 26,
              borderRadius: "50%",
              background: isSel ? "rgba(255,200,0,0.92)" : "rgba(230,50,50,0.85)",
              border: `2px solid ${isSel ? "#fff" : "rgba(255,255,255,0.65)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700,
              color: isSel ? "#000" : "#fff",
              pointerEvents: "none",
              boxShadow: "0 1px 5px rgba(0,0,0,0.65)",
              zIndex: 10,
              transition: "background 0.15s",
            }
          }, d.id)
        }),
        // Indicateur de tolérance sur le hotpoint sélectionné
        selectedHp && React.createElement("div", {
          key: "tol-ring",
          style: {
            position: "absolute",
            left: `${selectedHp.x}%`,
            top: `${selectedHp.y}%`,
            // La tolérance est en % d'image ; on convertit en px via calc
            // On utilise une approximation visuelle (container width ≈ largeur image)
            width: `${cfg.tolerance * 2}%`,
            height: `${cfg.tolerance * 2}%`,
            transform: "translate(-50%,-50%)",
            borderRadius: "50%",
            border: "1px dashed rgba(255,200,0,0.5)",
            pointerEvents: "none",
            zIndex: 9,
          }
        })
      )
    ),

    // ── Panneau de contrôle du hotpoint sélectionné + tolérance ───
    React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", paddingTop: 4 } },

      // Tolérance
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } },
        React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--bone)", opacity: 0.7, whiteSpace: "nowrap" } },
          `Tolérance : ${cfg.tolerance}`
        ),
        React.createElement("input", {
          type: "range", min: 1, max: 15, step: 0.5,
          value: cfg.tolerance,
          onChange: e => setTolerance(e.target.value),
          style: { width: 72, accentColor: "var(--gold)" }
        })
      ),

      // Hotpoint sélectionné
      selectedHp
        ? React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center", flex: 1, flexWrap: "wrap" } },
            React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--gold)", whiteSpace: "nowrap" } },
              `#${selected} · ${selectedHp.x.toFixed(1)}%, ${selectedHp.y.toFixed(1)}%`
            ),
            React.createElement("input", {
              type: "text",
              value: labelInput,
              onChange: e => setLabelInput(e.target.value),
              onBlur: commitLabel,
              onKeyDown: e => { if (e.key === "Enter") commitLabel(); },
              placeholder: "Label de l'intrus…",
              style: {
                flex: 1, minWidth: 120,
                background: "var(--char)", border: "1px solid var(--line)",
                color: "var(--bone)", fontFamily: "var(--font-mono)", fontSize: 11,
                padding: "3px 8px", borderRadius: 3,
              }
            }),
            React.createElement("button", {
              onClick: deleteSelected,
              style: { ...btnBase, background: "rgba(200,40,40,0.25)", borderColor: "rgba(200,40,40,0.5)", color: "#ff6b6b" }
            }, "✕ Supprimer")
          )
        : React.createElement("span", { style: { fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--bone)", opacity: 0.4 } },
            "Clic sur l'image → ajouter · Clic sur un cercle → sélectionner"
          )
    )
  );
}

/* ─── Composant principal ─────────────────────────────── */
function DifferencesGame({ level, onHud, onFinish, isAdmin, onSaveConfig }) {
  const cfg   = getEffectiveConfig(level);
  const total = cfg.intrus.length;

  const [editMode, setEditMode] = useState(false);
  const [found,   setFound]   = useState(new Set());
  const [wrong,   setWrong]   = useState(null);
  const [time,    setTime]    = useState(cfg.maxTime);
  const [over,    setOver]    = useState(false);
  const [tooltip, setTooltip] = useState(null);
  const containerRef          = useRef(null);
  const foundRef              = useRef(new Set());

  useEffect(() => { foundRef.current = found; }, [found]);
  useEffect(() => { onHud({ score: found.size, total }); }, [found.size]);

  // Timer
  useEffect(() => {
    if (over || editMode) return;
    if (time <= 0) { setOver(true); return; }
    const t = setTimeout(() => setTime(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [time, over, editMode]);

  // Fin si tous trouvés
  useEffect(() => {
    if (!over && found.size >= total) setOver(true);
  }, [found.size, over]);

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

    if (window.__diffDebug) {
      console.log(`{ x: ${px.toFixed(1)}, y: ${py.toFixed(1)} }`);
    }

    let hit = null, minD = Infinity;
    for (const d of cfg.intrus) {
      if (foundRef.current.has(d.id)) continue;
      const d2 = dist(px, py, d.x, d.y);
      if (d2 < cfg.tolerance && d2 < minD) { minD = d2; hit = d; }
    }

    if (hit) {
      setFound(prev => new Set([...prev, hit.id]));
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

  // ── Mode édition admin ────────────────────────────────
  if (editMode) {
    return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, flex: 1 } },
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
        React.createElement("div", {
          style: { fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--gold)", letterSpacing: "0.18em", textTransform: "uppercase" }
        }, "⚙ Mode édition hotpoints"),
        React.createElement("button", {
          onClick: () => setEditMode(false),
          style: {
            marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em",
            background: "transparent", border: "1px solid var(--line)", color: "var(--bone)",
            cursor: "pointer", borderRadius: 3, padding: "4px 10px",
          }
        }, "← Revenir au jeu")
      ),
      React.createElement(DifferencesEditMode, { onSaveConfig })
    );
  }

  // ── Fin de partie ─────────────────────────────────────
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

  // ── Markers trouvés ───────────────────────────────────
  const markers = [];
  for (const id of found) {
    const d = cfg.intrus.find(x => x.id === id);
    if (!d) continue;
    markers.push(
      React.createElement("div", {
        key: `m-${id}`,
        style: {
          position: "absolute",
          left: `${d.x}%`, top:  `${d.y}%`,
          width: 36, height: 36,
          transform: "translate(-50%,-50%)",
          borderRadius: "50%",
          border: "3px solid var(--success)",
          boxShadow: "0 0 8px rgba(80,200,80,0.6)",
          background: "rgba(80,200,80,0.15)",
          pointerEvents: "none", zIndex: 10,
        }
      })
    );
  }

  if (wrong) {
    markers.push(
      React.createElement("div", {
        key: "wrong",
        style: {
          position: "absolute",
          left:   `${wrong.x}%`, top:    `${wrong.y}%`,
          width: 30, height: 30,
          transform: "translate(-50%,-50%)",
          borderRadius: "50%",
          border: "2px solid var(--danger)",
          background: "rgba(200,60,60,0.2)",
          pointerEvents: "none", zIndex: 10,
          animation: "diff-wrong 0.7s ease forwards",
        }
      })
    );
  }

  if (tooltip) {
    markers.push(
      React.createElement("div", {
        key: "tooltip",
        style: {
          position: "absolute",
          left:   `${tooltip.x}%`,
          top:    `calc(${tooltip.y}% - 28px)`,
          transform: "translateX(-50%)",
          background: "rgba(10,8,4,0.85)", color: "var(--gold)",
          fontSize: 10, fontFamily: "var(--font-brand)", letterSpacing: "0.06em",
          padding: "3px 8px", borderRadius: 4, whiteSpace: "nowrap",
          pointerEvents: "none", zIndex: 20,
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
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
        isAdmin && React.createElement("button", {
          onClick: () => setEditMode(true),
          title: "Mode édition admin — placer les hotpoints",
          style: {
            fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase",
            background: "transparent", border: "1px solid var(--gold)", color: "var(--gold)",
            cursor: "pointer", borderRadius: 3, padding: "3px 8px", opacity: 0.8,
          }
        }, "⚙ Éditer"),
        React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 700, color: timerColor } },
          formatTime(time)
        )
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
          display: "inline-block",
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
