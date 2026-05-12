;(function() {
// games/blason.jsx — L'Héraldiste
const { useState, useEffect, useRef } = React;

// Tinctures (heraldic colors)
const T = {
  or:       "#D4A24C",
  argent:   "#D8D0BC",
  azur:     "#1B4F8F",
  gueules:  "#8B1A1A",
  sable:    "#1A1A22",
  sinople:  "#1A6A2A",
  pourpre:  "#6B1A5A",
};

const TNAMES = {
  or: "or", argent: "argent", azur: "azur",
  gueules: "gueules", sable: "sable", sinople: "sinople", pourpre: "pourpre",
};

// Shield path in 60×65 viewBox
const SHIELD_PATH = "M 5 5 L 55 5 L 55 42 Q 30 62 30 62 Q 30 62 5 42 Z";

function renderCharge(chargeName, color) {
  switch (chargeName) {
    case "croix":
      return (
        <>
          <rect x="23" y="5" width="14" height="55" fill={color} />
          <rect x="5" y="22" width="50" height="14" fill={color} />
        </>
      );
    case "fasce":
      return <rect x="5" y="26" width="50" height="14" fill={color} />;
    case "pal":
      return <rect x="23" y="5" width="14" height="55" fill={color} />;
    case "bande":
      return <polygon points="5,5 55,5 55,18 5,42" fill={color} />;
    case "chevron":
      return <polygon points="5,48 30,18 55,48 49,48 30,28 11,48" fill={color} />;
    case "sautoir":
      return (
        <>
          <polygon points="5,5 16,5 55,50 55,62 44,62 5,17" fill={color} />
          <polygon points="55,5 44,5 5,50 5,62 16,62 55,17" fill={color} />
        </>
      );
    default:
      return null;
  }
}

function BlasonSVG({ field, charge, chargeColor, size = 120 }) {
  return (
    <svg viewBox="0 0 60 65" width={size} height={Math.round(size * 65 / 60)}
         style={{ display: "block", filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.45))" }}>
      {/* Shield field */}
      <path d={SHIELD_PATH} fill={T[field]} />
      {/* Charge */}
      <clipPath id={`clip-${field}-${charge}-${chargeColor}`}>
        <path d={SHIELD_PATH} />
      </clipPath>
      <g clipPath={`url(#clip-${field}-${charge}-${chargeColor})`}>
        {renderCharge(charge, T[chargeColor])}
      </g>
      {/* Shield border */}
      <path d={SHIELD_PATH} fill="none" stroke="var(--gold)" strokeWidth="1.2" />
    </svg>
  );
}

// Pool of blasons: { field, charge, chargeColor, label }
// label: "De [field] à la/au [charge] de/d'[chargeColor]"
const BLASONS = [
  { field: "azur",     charge: "croix",    chargeColor: "or",      label: "D'azur à la croix d'or" },
  { field: "gueules",  charge: "fasce",    chargeColor: "argent",  label: "De gueules à la fasce d'argent" },
  { field: "or",       charge: "pal",      chargeColor: "sable",   label: "D'or au pal de sable" },
  { field: "sable",    charge: "chevron",  chargeColor: "or",      label: "De sable au chevron d'or" },
  { field: "argent",   charge: "sautoir",  chargeColor: "gueules", label: "D'argent au sautoir de gueules" },
  { field: "sinople",  charge: "croix",    chargeColor: "argent",  label: "De sinople à la croix d'argent" },
  { field: "azur",     charge: "chevron",  chargeColor: "argent",  label: "D'azur au chevron d'argent" },
  { field: "gueules",  charge: "pal",      chargeColor: "or",      label: "De gueules au pal d'or" },
  { field: "or",       charge: "bande",    chargeColor: "azur",    label: "D'or à la bande d'azur" },
  { field: "pourpre",  charge: "fasce",    chargeColor: "or",      label: "De pourpre à la fasce d'or" },
  { field: "sable",    charge: "sautoir",  chargeColor: "argent",  label: "De sable au sautoir d'argent" },
  { field: "azur",     charge: "bande",    chargeColor: "or",      label: "D'azur à la bande d'or" },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildChoices(correct, level, pool) {
  const numChoices = level === 1 ? 4 : level === 2 ? 5 : 6;
  const others = pool.filter(b => b.label !== correct.label);

  if (level === 1) {
    // All very different: different charges AND different field tinctures
    const candidates = shuffle(others.filter(b =>
      b.charge !== correct.charge && b.field !== correct.field
    ));
    const fillers = shuffle(others.filter(b =>
      b.charge === correct.charge || b.field === correct.field
    ));
    const distractors = [...candidates, ...fillers].slice(0, numChoices - 1);
    return shuffle([correct, ...distractors]);
  } else if (level === 2) {
    // Some share same field color but different charge
    const sameField = shuffle(others.filter(b => b.field === correct.field && b.charge !== correct.charge));
    const rest = shuffle(others.filter(b => b.field !== correct.field));
    const distractors = [...sameField, ...rest].slice(0, numChoices - 1);
    return shuffle([correct, ...distractors]);
  } else {
    // Some share same field+charge but different tincture
    const similar = shuffle(others.filter(b => b.field === correct.field || b.charge === correct.charge));
    const rest = shuffle(others.filter(b => b.field !== correct.field && b.charge !== correct.charge));
    const distractors = [...similar, ...rest].slice(0, numChoices - 1);
    return shuffle([correct, ...distractors]);
  }
}

function pickRounds(level) {
  const pool = shuffle(BLASONS).slice(0, 6);
  return pool.map(correct => ({
    correct,
    choices: buildChoices(correct, level, BLASONS),
  }));
}

const TIME_PER_Q = { 1: 15, 2: 10, 3: 8 };

function BlasonGame({ level, onHud, onFinish }) {
  const TOTAL = 6;
  const timePerQ = TIME_PER_Q[level];
  const roundsRef = useRef(null);
  if (!roundsRef.current) roundsRef.current = pickRounds(level);
  const rounds = roundsRef.current;

  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const [timeLeft, setTimeLeft] = useState(timePerQ);
  const timerRef = useRef(null);
  const scoreRef = useRef(0);

  const current = rounds[roundIdx];

  function advance(currentScore) {
    clearInterval(timerRef.current);
    if (roundIdx >= TOTAL - 1) {
      onFinish(currentScore);
    } else {
      setRoundIdx(i => i + 1);
    }
  }

  useEffect(() => {
    setPicked(null);
    setTimeLeft(timePerQ);
  }, [roundIdx]);

  useEffect(() => {
    setTimeLeft(timePerQ);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setPicked("__timeout__");
          setTimeout(() => advance(scoreRef.current), 1200);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [roundIdx]);

  useEffect(() => { onHud({ score, total: TOTAL }); }, [score]);

  const choose = (label) => {
    if (picked) return;
    clearInterval(timerRef.current);
    setPicked(label);
    const ok = label === current.correct.label;
    const newScore = ok ? score + 1 : score;
    if (ok) { setScore(newScore); scoreRef.current = newScore; }
    setTimeout(() => advance(newScore), 1200);
  };

  const timerColor = timeLeft <= 3 ? "var(--danger)" : "var(--gold)";
  const numChoices = current.choices.length;
  const gridCols = numChoices <= 4 ? "repeat(2, 1fr)" : "repeat(2, 1fr)";

  return (
    <div className="col" style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 20 }}>
      <div className="prompt">
        <div className="prompt__instruction" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <span>Manche {roundIdx + 1} / {TOTAL} — Identifiez ce blason</span>
          {!picked && (
            <span style={{
              fontFamily: "var(--font-brand)", fontWeight: 800,
              fontSize: 28, lineHeight: 1,
              color: timerColor, transition: "color .3s",
              flexShrink: 0
            }}>{timeLeft}</span>
          )}
        </div>
      </div>

      {!picked && (
        <div style={{ width: "100%", maxWidth: 480, height: 4, background: "var(--line-dim)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${(timeLeft / timePerQ) * 100}%`,
            background: timerColor,
            transition: "width 1s linear, background .3s"
          }} />
        </div>
      )}

      <div style={{
        background: "var(--char-2)",
        border: "1px solid var(--line)",
        borderRadius: 16,
        padding: "24px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <BlasonSVG
          field={current.correct.field}
          charge={current.correct.charge}
          chargeColor={current.correct.chargeColor}
          size={130}
        />
      </div>

      {picked === "__timeout__" && (
        <div className="feedback ko" style={{ marginBottom: 0 }}>
          Temps écoulé — c'était : {current.correct.label}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 10, width: "100%", maxWidth: 520 }}>
        {current.choices.map((b, idx) => {
          const isCorrect = b.label === current.correct.label;
          const isPicked = picked === b.label;
          let bg = "var(--char-2)", color = "var(--pearl)", border = "var(--line)";
          if (picked && picked !== "__timeout__") {
            if (isCorrect) { bg = "rgba(34,197,94,0.15)"; color = "var(--success)"; border = "var(--success)"; }
            else if (isPicked) { bg = "rgba(239,68,68,0.15)"; color = "var(--danger)"; border = "var(--danger)"; }
          }
          const spanStyle = (numChoices % 2 !== 0 && idx === current.choices.length - 1)
            ? { gridColumn: "1 / -1" } : {};
          return (
            <button key={b.label} onClick={() => choose(b.label)} disabled={!!picked}
              style={{
                padding: "14px 16px",
                borderRadius: 10,
                background: bg, color,
                border: `1px solid ${border}`,
                fontFamily: "var(--font-serif)", fontWeight: 600, fontSize: 14,
                cursor: picked ? "default" : "pointer",
                transition: "all .15s",
                textAlign: "center",
                lineHeight: 1.3,
                ...spanStyle
              }}>
              {b.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

window.__GAMES__ = window.__GAMES__ || {};
window.__GAMES__.blason = BlasonGame;
})();
