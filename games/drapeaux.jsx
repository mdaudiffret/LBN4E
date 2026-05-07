;(function() {
// games/drapeaux.jsx — Devine le drapeau
const { useState, useEffect, useRef } = React;

// Simple SVG flag renderers — broad-stroke (good enough for a quiz).

function vBands(colors, weights) {
  const w = weights || colors.map(() => 1);
  const total = w.reduce((a, b) => a + b, 0);
  let x = 0;
  return (
    <svg viewBox="0 0 90 60" width="100%" height="100%" preserveAspectRatio="none">
      {colors.map((c, i) => {
        const seg = (90 * w[i]) / total;
        const r = <rect key={i} x={x} y={0} width={seg} height={60} fill={c} />;
        x += seg;
        return r;
      })}
    </svg>
  );
}
function hBands(colors, weights) {
  const w = weights || colors.map(() => 1);
  const total = w.reduce((a, b) => a + b, 0);
  let y = 0;
  return (
    <svg viewBox="0 0 90 60" width="100%" height="100%" preserveAspectRatio="none">
      {colors.map((c, i) => {
        const seg = (60 * w[i]) / total;
        const r = <rect key={i} x={0} y={y} width={90} height={seg} fill={c} />;
        y += seg;
        return r;
      })}
    </svg>
  );
}
function swiss() {
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%" preserveAspectRatio="none">
      <rect width="60" height="60" fill="#FF0000" />
      <rect x="25" y="12" width="10" height="36" fill="#fff" />
      <rect x="12" y="25" width="36" height="10" fill="#fff" />
    </svg>
  );
}
function japan() {
  return (
    <svg viewBox="0 0 90 60" width="100%" height="100%" preserveAspectRatio="none">
      <rect width="90" height="60" fill="#fff" />
      <circle cx="45" cy="30" r="18" fill="#BC002D" />
    </svg>
  );
}
function portugal() {
  return (
    <svg viewBox="0 0 90 60" width="100%" height="100%" preserveAspectRatio="none">
      <rect width="36" height="60" fill="#006600" />
      <rect x="36" width="54" height="60" fill="#FF0000" />
      <circle cx="36" cy="30" r="11" fill="#FFCC00" stroke="#000" strokeWidth="0.6" />
    </svg>
  );
}
function greece() {
  const c1 = "#0D5EAF", c2 = "#fff";
  return (
    <svg viewBox="0 0 90 60" width="100%" height="100%" preserveAspectRatio="none">
      {[0,1,2,3,4,5,6,7,8].map(i => (
        <rect key={i} y={(60/9)*i} width="90" height={60/9} fill={i % 2 === 0 ? c1 : c2} />
      ))}
      <rect width="36" height={60*5/9} fill={c1} />
      <rect x="14" y="0" width="8" height={60*5/9} fill={c2} />
      <rect x="0" y={(60*5/9 - 4) / 2 + 2 - 4} width="36" height="8" fill={c2} />
    </svg>
  );
}
function nordic(bg, cross) {
  return (
    <svg viewBox="0 0 90 60" width="100%" height="100%" preserveAspectRatio="none">
      <rect width="90" height="60" fill={bg} />
      <rect x="24" y="0" width="8" height="60" fill={cross} />
      <rect x="0" y="26" width="90" height="8" fill={cross} />
    </svg>
  );
}
function norway() {
  return (
    <svg viewBox="0 0 90 60" width="100%" height="100%" preserveAspectRatio="none">
      <rect width="90" height="60" fill="#EF2B2D" />
      <rect x="22" y="0" width="12" height="60" fill="#fff" />
      <rect x="0" y="24" width="90" height="12" fill="#fff" />
      <rect x="25" y="0" width="6" height="60" fill="#002868" />
      <rect x="0" y="27" width="90" height="6" fill="#002868" />
    </svg>
  );
}
function brazil() {
  return (
    <svg viewBox="0 0 90 60" width="100%" height="100%" preserveAspectRatio="none">
      <rect width="90" height="60" fill="#009C3B" />
      <polygon points="45,8 84,30 45,52 6,30" fill="#FFDF00" />
      <circle cx="45" cy="30" r="12" fill="#002776" />
    </svg>
  );
}
function canada() {
  return (
    <svg viewBox="0 0 90 60" width="100%" height="100%" preserveAspectRatio="none">
      <rect width="22" height="60" fill="#FF0000" />
      <rect x="22" width="46" height="60" fill="#fff" />
      <rect x="68" width="22" height="60" fill="#FF0000" />
      <text x="45" y="40" textAnchor="middle" fontSize="22" fill="#FF0000">🍁</text>
    </svg>
  );
}
function vietnam() {
  return (
    <svg viewBox="0 0 90 60" width="100%" height="100%" preserveAspectRatio="none">
      <rect width="90" height="60" fill="#DA251D" />
      <polygon fill="#FFFF00" points="45,15 49,27 62,27 51.5,34 55.5,46 45,38.5 34.5,46 38.5,34 28,27 41,27" />
    </svg>
  );
}
function chile() {
  return (
    <svg viewBox="0 0 90 60" width="100%" height="100%" preserveAspectRatio="none">
      <rect width="90" height="30" fill="#fff" />
      <rect y="30" width="90" height="30" fill="#D52B1E" />
      <rect width="30" height="30" fill="#0039A6" />
      <polygon fill="#fff" points="15,8 17,14 23,14 18,18 20,24 15,20 10,24 12,18 7,14 13,14" />
    </svg>
  );
}
function vBandsWithStar(colors, starOn) {
  return (
    <svg viewBox="0 0 90 60" width="100%" height="100%" preserveAspectRatio="none">
      {vBands(colors).props.children}
      <polygon fill={starOn === "#00853F" ? "#00853F" : "#fff"} points="45,21 47,27 53,27 48,31 50,37 45,33 40,37 42,31 37,27 43,27" />
    </svg>
  );
}
function uk() {
  // Union Jack approximation: blue field + white diagonals + red cross
  return (
    <svg viewBox="0 0 90 60" width="100%" height="100%" preserveAspectRatio="none">
      <rect width="90" height="60" fill="#012169" />
      {/* White diagonals (St Andrew + St Patrick outer) */}
      <line x1="0" y1="0" x2="90" y2="60" stroke="#fff" strokeWidth="12" />
      <line x1="90" y1="0" x2="0" y2="60" stroke="#fff" strokeWidth="12" />
      {/* Red diagonals (St Patrick inner) */}
      <line x1="0" y1="0" x2="90" y2="60" stroke="#CF142B" strokeWidth="6" />
      <line x1="90" y1="0" x2="0" y2="60" stroke="#CF142B" strokeWidth="6" />
      {/* White cross (St George outer) */}
      <rect x="36" y="0" width="18" height="60" fill="#fff" />
      <rect x="0" y="21" width="90" height="18" fill="#fff" />
      {/* Red cross (St George) */}
      <rect x="39" y="0" width="12" height="60" fill="#CF142B" />
      <rect x="0" y="24" width="90" height="12" fill="#CF142B" />
    </svg>
  );
}

const FLAGS = {
  1: [
    { name: "France",        svg: vBands(["#0055A4", "#FFFFFF", "#EF4135"]) },
    { name: "Italie",        svg: vBands(["#009246", "#FFFFFF", "#CE2B37"]) },
    { name: "Allemagne",     svg: hBands(["#000000", "#DD0000", "#FFCE00"]) },
    { name: "Espagne",       svg: hBands(["#AA151B", "#F1BF00", "#F1BF00", "#AA151B"], [1,2,2,1]) },
    { name: "Belgique",      svg: vBands(["#000000", "#FAE042", "#ED2939"]) },
    { name: "Pays-Bas",      svg: hBands(["#AE1C28", "#FFFFFF", "#21468B"]) },
    { name: "Suisse",        svg: swiss() },
    { name: "Japon",         svg: japan() },
    { name: "Danemark",      svg: nordic("#C60C30", "#FFFFFF") },
    { name: "Royaume-Uni",   svg: uk() },
  ],
  2: [
    { name: "Portugal",      svg: portugal() },
    { name: "Irlande",       svg: vBands(["#169B62", "#FFFFFF", "#FF883E"]) },
    { name: "Grèce",         svg: greece() },
    { name: "Suède",         svg: nordic("#006AA7", "#FECC00") },
    { name: "Norvège",       svg: norway() },
    { name: "Finlande",      svg: nordic("#FFFFFF", "#003580") },
    { name: "Pologne",       svg: hBands(["#FFFFFF", "#DC143C"]) },
    { name: "Autriche",      svg: hBands(["#ED2939", "#FFFFFF", "#ED2939"]) },
    { name: "Hongrie",       svg: hBands(["#CE2939", "#FFFFFF", "#477050"]) },
    { name: "Roumanie",      svg: vBands(["#002B7F", "#FCD116", "#CE1126"]) },
    { name: "Brésil",        svg: brazil() },
    { name: "Argentine",     svg: hBands(["#74ACDF", "#FFFFFF", "#74ACDF"]) },
    { name: "Canada",        svg: canada() },
    { name: "Mexique",       svg: vBands(["#006847", "#FFFFFF", "#CE1126"]) },
    { name: "Pérou",         svg: vBands(["#D91023", "#FFFFFF", "#D91023"]) },
    { name: "Ukraine",       svg: hBands(["#0057B7", "#FFD700"]) },
  ],
  3: [
    { name: "Sénégal",       svg: vBandsWithStar(["#00853F", "#FDEF42", "#E31B23"], "#00853F") },
    { name: "Indonésie",     svg: hBands(["#FF0000", "#FFFFFF"]) },
    { name: "Mongolie",      svg: vBands(["#C4272F", "#0066B3", "#C4272F"]) },
    { name: "Côte d'Ivoire", svg: vBands(["#FF8200", "#FFFFFF", "#009E60"]) },
    { name: "Lituanie",      svg: hBands(["#FDB913", "#006A44", "#C1272D"]) },
    { name: "Bulgarie",      svg: hBands(["#FFFFFF", "#00966E", "#D62612"]) },
    { name: "Tchad",         svg: vBands(["#002664", "#FECB00", "#C60C30"]) },
    { name: "Colombie",      svg: hBands(["#FCD116", "#FCD116", "#003893", "#CE1126"]) },
    { name: "Vietnam",       svg: vietnam() },
    { name: "Chili",         svg: chile() },
    { name: "Estonie",       svg: hBands(["#0072CE", "#000000", "#FFFFFF"]) },
    { name: "Arménie",       svg: hBands(["#D90012", "#0033A0", "#F2A800"]) },
    { name: "Lettonie",      svg: hBands(["#9E3039", "#FFFFFF", "#9E3039"], [5,1,5]) },
  ]
};

// NOTE: Ukraine was in level 3 originally but moved to level 2 pool;
// it's now duplicated as level 2 entry above (removed from level 3).

function DrapeauxGame({ level, onHud, onFinish }) {
  const TOTAL = 8;
  const numChoices = level === 1 ? 4 : 5;
  const usedRef = useRef(new Set());

  function pickNoRepeat() {
    const pool = FLAGS[level];
    const available = pool.filter(f => !usedRef.current.has(f.name));
    const pickPool = available.length >= numChoices ? available : pool;
    const correct = pickPool[Math.floor(Math.random() * pickPool.length)];
    usedRef.current.add(correct.name);
    const others = pool
      .filter(f => f.name !== correct.name)
      .sort(() => Math.random() - 0.5)
      .slice(0, numChoices - 1);
    return { correct, choices: [correct, ...others].sort(() => Math.random() - 0.5) };
  }

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [data, setData] = useState(() => pickNoRepeat());
  const [picked, setPicked] = useState(null);
  const [timeLeft, setTimeLeft] = useState(5);
  const timerRef = useRef(null);

  // Advance to next round (or finish)
  function advance(currentScore) {
    clearInterval(timerRef.current);
    if (round >= TOTAL) {
      onFinish(currentScore);
    } else {
      setRound(r => r + 1);
    }
  }

  // Reset question on new round
  useEffect(() => {
    setData(pickNoRepeat());
    setPicked(null);
    setTimeLeft(5);
  }, [round]);

  // Countdown timer
  useEffect(() => {
    if (picked) return;
    setTimeLeft(5);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          // Time out — mark as miss and advance
          setPicked("__timeout__");
          setTimeout(() => advance(score), 1100);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [round]);

  useEffect(() => onHud({ score, total: TOTAL }), [score]);

  const choose = (name) => {
    if (picked) return;
    clearInterval(timerRef.current);
    setPicked(name);
    const ok = name === data.correct.name;
    const newScore = ok ? score + 1 : score;
    if (ok) setScore(newScore);
    setTimeout(() => advance(newScore), 1100);
  };

  const timerColor = timeLeft <= 2 ? "var(--danger)" : "var(--komin-blue)";

  return (
    <div className="col" style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 24 }}>
      <div className="prompt" style={{ marginBottom: 0, position: "relative" }}>
        <div className="prompt__instruction">Manche {round} / {TOTAL} — Quel pays ?</div>
        {/* Countdown */}
        <div style={{
          position: "absolute", top: 0, right: 0,
          fontFamily: "var(--font-brand)", fontWeight: 800,
          fontSize: 28, lineHeight: 1,
          color: timerColor,
          transition: "color .3s",
          minWidth: 32, textAlign: "right"
        }}>
          {picked ? "" : timeLeft}
        </div>
      </div>

      {/* Timer bar */}
      {!picked && (
        <div style={{ width: "100%", maxWidth: 480, height: 4, background: "var(--komin-lightgray)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${(timeLeft / 5) * 100}%`,
            background: timerColor,
            transition: "width 1s linear, background .3s"
          }} />
        </div>
      )}

      <div style={{
        width: 240, height: 160, borderRadius: 12,
        overflow: "hidden",
        boxShadow: "var(--shadow-md)",
        border: "1px solid var(--komin-lightgray)"
      }}>
        {data.correct.svg}
      </div>

      {picked === "__timeout__" && (
        <div className="feedback ko" style={{ marginBottom: 0 }}>
          Temps écoulé — c'était {data.correct.name}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, width: "100%", maxWidth: 480 }}>
        {data.choices.map((c) => {
          const isCorrect = c.name === data.correct.name;
          const isPicked = picked === c.name;
          let bg = "var(--char-2)", color = "var(--pearl)", border = "var(--komin-lightgray)";
          if (picked) {
            if (isCorrect) { bg = "var(--komin-lightgreen)"; color = "var(--success)"; border = "var(--success)"; }
            else if (isPicked) { bg = "var(--komin-lightred)"; color = "var(--danger)"; border = "var(--danger)"; }
          }
          return (
            <button key={c.name} onClick={() => choose(c.name)}
              disabled={!!picked}
              style={{
                padding: "14px 16px",
                borderRadius: 10,
                background: bg, color,
                border: `1px solid ${border}`,
                fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 16,
                cursor: picked ? "default" : "pointer",
                textAlign: "left",
                transition: "all .15s",
                boxShadow: "var(--shadow-xs)"
              }}>
              {c.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

window.__GAMES__ = window.__GAMES__ || {};
window.__GAMES__.drapeaux = DrapeauxGame;
})();
