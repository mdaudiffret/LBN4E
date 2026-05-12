;(function() {
// games/oracle.jsx — L'Oracle
const { useState, useEffect, useRef } = React;

const ROUNDS = {
  1: [
    [
      { event: "Naissance de Jules César", year: -100 },
      { event: "Sacre de Charlemagne", year: 800 },
      { event: "Prise de Constantinople", year: 1453 },
      { event: "Révolution française", year: 1789 },
    ],
    [
      { event: "Construction des pyramides de Gizeh", year: -2560 },
      { event: "Naissance de Jésus-Christ", year: 0 },
      { event: "Invention de l'imprimerie par Gutenberg", year: 1450 },
      { event: "Premier pas sur la Lune", year: 1969 },
    ],
    [
      { event: "Mort d'Alexandre le Grand", year: -323 },
      { event: "Chute de Rome occidentale", year: 476 },
      { event: "Découverte de l'Amérique par Colomb", year: 1492 },
      { event: "Naissance de Napoléon Bonaparte", year: 1769 },
    ],
  ],
  2: [
    [
      { event: "Édit de Nantes (Henri IV)", year: 1598 },
      { event: "Assassinat d'Henri IV", year: 1610 },
      { event: "Siège de La Rochelle", year: 1628 },
      { event: "Mort du Cardinal de Richelieu", year: 1642 },
      { event: "Traité des Pyrénées", year: 1659 },
    ],
    [
      { event: "Naissance de Molière", year: 1622 },
      { event: "Fronde des princes", year: 1648 },
      { event: "Mariage de Louis XIV", year: 1660 },
      { event: "Révocation de l'Édit de Nantes", year: 1685 },
      { event: "Mort de Louis XIV", year: 1715 },
    ],
  ],
  3: [
    [
      { event: "Fondation de la Compagnie du Saint-Sacrement", year: 1627 },
      { event: "Siège de La Rochelle par Richelieu", year: 1628 },
      { event: "Journée des dupes", year: 1630 },
      { event: "Traité de paix de Cherasco", year: 1631 },
      { event: "Mort de Gustavus Adolphus à Lützen", year: 1632 },
      { event: "Exécution du duc de Montmorency", year: 1632 },
    ],
    [
      { event: "Mort du Cardinal Mazarin", year: 1661 },
      { event: "Arrestation de Fouquet", year: 1661 },
      { event: "Grande peste de Londres", year: 1665 },
      { event: "Création de l'Académie des sciences", year: 1666 },
      { event: "Invasion de la Hollande par Louis XIV", year: 1672 },
      { event: "Construction du château de Versailles achevée", year: 1682 },
    ],
  ],
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function OracleGame({ level, onHud, onFinish }) {
  const MAX_TIME = 60;

  // Pick a random round set from the level pool
  const roundDataRef = useRef(null);
  if (!roundDataRef.current) {
    const pool = ROUNDS[level];
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    roundDataRef.current = chosen;
  }
  const events = roundDataRef.current;
  const N = events.length;

  // Shuffled display order (indices into `events`)
  const displayOrderRef = useRef(null);
  if (!displayOrderRef.current) {
    displayOrderRef.current = shuffle(events.map((_, i) => i));
  }
  const displayOrder = displayOrderRef.current;

  const [selection, setSelection] = useState([]); // ordered list of event indices as clicked
  const [phase, setPhase] = useState("playing"); // playing | validated | finished
  const [correct, setCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const timerRef = useRef(null);
  const doneRef = useRef(false);

  useEffect(() => { onHud({ score: 0, total: 1 }); }, []);

  function finish(won) {
    if (doneRef.current) return;
    doneRef.current = true;
    clearInterval(timerRef.current);
    setPhase("finished");
    setTimeout(() => onFinish(won ? 1 : 0), 2200);
  }

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          if (phase === "playing") {
            setPhase("validated");
            setCorrect(false);
            finish(false);
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const timerColor = timeLeft <= 10 ? "var(--danger)" : "var(--gold)";

  function handleCardClick(eventIdx) {
    if (phase !== "playing") return;
    if (selection.includes(eventIdx)) return; // already selected
    const newSel = [...selection, eventIdx];
    setSelection(newSel);
  }

  function handleReset() {
    if (phase !== "playing") return;
    setSelection([]);
  }

  function handleValidate() {
    if (phase !== "playing") return;
    if (selection.length < N) return;

    // Check if order matches chronological order
    const correct_order = [...events]
      .map((e, i) => ({ ...e, idx: i }))
      .sort((a, b) => a.year - b.year)
      .map(e => e.idx);

    const isCorrect = selection.every((idx, pos) => idx === correct_order[pos]);
    setCorrect(isCorrect);
    setPhase("validated");
    finish(isCorrect);
  }

  // Correct chronological order for display after validation
  const correctOrder = [...events]
    .map((e, i) => ({ ...e, idx: i }))
    .sort((a, b) => a.year - b.year);

  // Grid columns
  const cols = N <= 4 ? 2 : 3;

  return (
    <div className="col" style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 20 }}>
      <div className="prompt">
        <div className="prompt__instruction" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <span>
            {phase === "playing"
              ? `Classez ${N} événements du plus ancien au plus récent`
              : phase === "validated"
              ? (correct ? "Ordre correct !" : "Ordre incorrect")
              : ""}
          </span>
          {phase === "playing" && (
            <span style={{
              fontFamily: "var(--font-brand)", fontWeight: 800,
              fontSize: 28, lineHeight: 1,
              color: timerColor, transition: "color .3s",
              flexShrink: 0
            }}>{timeLeft}s</span>
          )}
        </div>
        {phase === "playing" && (
          <div className="prompt__main" style={{ fontSize: 16 }}>
            Cliquez dans l'ordre chronologique · {selection.length}/{N} sélectionnés
          </div>
        )}
      </div>

      {phase === "playing" && (
        <div style={{ width: "100%", maxWidth: 560, height: 4, background: "var(--line-dim)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${(timeLeft / MAX_TIME) * 100}%`,
            background: timerColor,
            transition: "width 1s linear, background .3s"
          }} />
        </div>
      )}

      {phase === "validated" && (
        <div className={`feedback ${correct ? "ok" : "ko"}`} style={{ marginBottom: 0, textAlign: "center" }}>
          {correct
            ? "Excellent ! Vous maîtrisez la chronologie."
            : "L'ordre était incorrect. Voici la chronologie correcte :"}
        </div>
      )}

      {/* Cards grid */}
      {phase === "playing" && (
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 12, width: "100%", maxWidth: 560
        }}>
          {displayOrder.map(eventIdx => {
            const ev = events[eventIdx];
            const selPos = selection.indexOf(eventIdx);
            const isSelected = selPos !== -1;

            return (
              <div
                key={eventIdx}
                onClick={() => handleCardClick(eventIdx)}
                style={{
                  position: "relative",
                  padding: "16px 14px",
                  borderRadius: 12,
                  background: isSelected ? "rgba(212,162,76,0.15)" : "var(--char-2)",
                  border: `1px solid ${isSelected ? "var(--gold)" : "var(--line)"}`,
                  cursor: isSelected ? "default" : "pointer",
                  transition: "all .15s",
                  fontFamily: "var(--font-serif)",
                  fontSize: 14,
                  color: isSelected ? "var(--gold-bright)" : "var(--pearl)",
                  lineHeight: 1.4,
                  userSelect: "none",
                  minHeight: 80,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  textAlign: "center",
                }}
              >
                {isSelected && (
                  <span style={{
                    position: "absolute",
                    top: 6, right: 8,
                    fontFamily: "var(--font-brand)",
                    fontWeight: 800,
                    fontSize: 13,
                    color: "var(--gold)",
                  }}>⚜{selPos + 1}</span>
                )}
                {ev.event}
              </div>
            );
          })}
        </div>
      )}

      {/* After validation: show correct order */}
      {phase !== "playing" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 560 }}>
          {correctOrder.map((ev, pos) => {
            const userPos = selection.indexOf(ev.idx);
            const userCorrect = userPos === pos;
            return (
              <div key={ev.idx} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 16px",
                borderRadius: 10,
                background: correct
                  ? "rgba(34,197,94,0.12)"
                  : userCorrect ? "rgba(34,197,94,0.10)" : "rgba(239,68,68,0.10)",
                border: `1px solid ${correct
                  ? "var(--success)"
                  : userCorrect ? "var(--success)" : "var(--danger)"}`,
              }}>
                <span style={{
                  fontFamily: "var(--font-brand)", fontWeight: 800,
                  fontSize: 15, color: "var(--gold)", flexShrink: 0, minWidth: 28
                }}>{pos + 1}</span>
                <span style={{ fontFamily: "var(--font-serif)", fontSize: 14, color: "var(--pearl)", flex: 1 }}>
                  {ev.event}
                </span>
                <span style={{
                  fontFamily: "var(--font-brand)", fontSize: 13,
                  color: "var(--bone)", flexShrink: 0
                }}>{ev.year < 0 ? `${Math.abs(ev.year)} av. J.-C.` : ev.year}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Action buttons */}
      {phase === "playing" && (
        <div className="row" style={{ gap: 12 }}>
          {selection.length > 0 && (
            <button className="k-btn k-btn--ghost k-btn--sm" onClick={handleReset}>
              Réinitialiser
            </button>
          )}
          {selection.length === N && (
            <button className="k-btn k-btn--brand k-btn--lg" onClick={handleValidate}>
              Valider l'ordre
            </button>
          )}
        </div>
      )}
    </div>
  );
}

window.__GAMES__ = window.__GAMES__ || {};
window.__GAMES__.oracle = OracleGame;
})();
