;(function() {
// games/tempo.jsx — Tap-tempo régulier
const { useState, useEffect, useRef } = React;

// Fixed BPM target per level — player must match it, not just be self-consistent
const CONFIGS = {
  1: { bpm: 60,  interval: 1000, tolerance: 220, label: "60 BPM",  hideAfter: null, hint: null },
  2: { bpm: 90,  interval: Math.round(60000 / 90), tolerance: 130, label: "90 BPM",  hideAfter: 5, hint: "Mémorise — le repère va disparaître" },
  3: { bpm: 120, interval: 500,  tolerance: 70,  label: "120 BPM", hideAfter: 2, hint: "Mémorise bien — seulement 2 repères" },
};

const TOTAL_TAPS = 10; // 9 intervals scored

function TempoGame({ level, onHud, onFinish }) {
  const cfg = CONFIGS[level];
  const [taps, setTaps] = useState([]);
  const [done, setDone] = useState(false);
  const [pulse, setPulse] = useState(false);
  const tapsRef = useRef([]);

  // Sync ref so the interval callback always sees the latest taps count
  useEffect(() => { tapsRef.current = taps; }, [taps]);

  // Visual metronome — pulses at target BPM, hidden after hideAfter taps on levels 2 & 3
  useEffect(() => {
    const iv = setInterval(() => {
      if (cfg.hideAfter !== null && tapsRef.current.length >= cfg.hideAfter) return;
      setPulse(true);
      setTimeout(() => setPulse(false), 80);
    }, cfg.interval);
    return () => clearInterval(iv);
  }, [cfg.interval, cfg.hideAfter]);

  // Compute intervals vs fixed target (not vs own average)
  const intervals = [];
  for (let i = 1; i < taps.length; i++) intervals.push(taps[i] - taps[i - 1]);
  const goodCount = intervals.filter(it => Math.abs(it - cfg.interval) <= cfg.tolerance).length;
  const consistency = intervals.length === 0
    ? null
    : Math.round((goodCount / intervals.length) * 100);

  useEffect(() => onHud({ score: Math.max(0, taps.length - 1), total: TOTAL_TAPS - 1 }), [taps]);

  const tap = () => {
    if (done) return;
    const t = performance.now();
    const next = [...taps, t];
    setTaps(next);
    if (next.length >= TOTAL_TAPS) setDone(true);
  };

  if (done) {
    if (consistency != null) setTimeout(() => onFinish(consistency), 0);
    return (
      <div className="col" style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <div className="prompt">
          <div className="prompt__instruction">Terminé</div>
          <div className="prompt__main">{consistency}% en rythme</div>
        </div>
      </div>
    );
  }

  // Whether the metronome dot should be visible at all
  const metronomeVisible = cfg.hideAfter === null || taps.length < cfg.hideAfter;

  return (
    <div className="col" style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 20 }}>
      <div className="prompt" style={{ marginBottom: 0, textAlign: "center" }}>
        <div className="prompt__instruction">Tape {TOTAL_TAPS} fois à <strong>{cfg.label}</strong></div>
        <div className="prompt__main">{taps.length} / {TOTAL_TAPS}</div>
      </div>

      {/* Warning hint for levels 2 & 3 before metronome disappears */}
      {cfg.hint && taps.length < cfg.hideAfter && (
        <div style={{
          fontSize: 12,
          color: "var(--gold)",
          background: "rgba(212,162,76,0.12)",
          border: "1px solid rgba(212,162,76,0.3)",
          borderRadius: 8,
          padding: "6px 14px",
          textAlign: "center",
        }}>
          {cfg.hint}
        </div>
      )}

      {/* Metronome dot */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "var(--secondary-high)" }}>
        <div style={{
          width: 14, height: 14, borderRadius: "50%",
          background: metronomeVisible && pulse ? "var(--gold-bright)" : metronomeVisible ? "rgba(212,162,76,0.2)" : "transparent",
          boxShadow: metronomeVisible && pulse ? "0 0 10px var(--gold)" : "none",
          transition: pulse ? "none" : "background .12s, box-shadow .12s",
          flexShrink: 0,
          border: metronomeVisible ? "none" : "1px dashed rgba(212,162,76,0.2)"
        }} />
        {metronomeVisible
          ? <span>Suis le point — tape en même temps que lui</span>
          : <span style={{ color: "var(--gold)", fontStyle: "italic" }}>Repère masqué — continue dans le rythme</span>
        }
      </div>

      <button onClick={tap}
        style={{
          width: 200, height: 200, borderRadius: "50%",
          background: "var(--komin-blue)",
          border: "none", color: "#fff",
          fontFamily: "var(--font-brand)", fontWeight: 800,
          fontSize: 22, letterSpacing: "-0.02em",
          cursor: "pointer",
          boxShadow: "var(--shadow-lg)",
          transition: "transform .07s"
        }}
        onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.95)"}
        onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
      >
        TAP
      </button>

      {intervals.length > 0 && (
        <div className="row" style={{ flexWrap: "wrap", gap: 6, justifyContent: "center", maxWidth: 480 }}>
          {intervals.map((it, i) => {
            const ok = Math.abs(it - cfg.interval) <= cfg.tolerance;
            return (
              <span key={i} className={`k-pill k-pill--sm ${ok ? "k-pill--light-success" : "k-pill--light-warning"}`}>
                {Math.round(it)} ms
              </span>
            );
          })}
        </div>
      )}

      <div className="muted" style={{ fontSize: 12 }}>Espace ou clic · cible : {cfg.interval} ms</div>
      <KeyTap onTap={tap} />
    </div>
  );
}

function KeyTap({ onTap }) {
  useEffect(() => {
    const h = (e) => {
      if (e.code === "Space" || e.key === " ") { e.preventDefault(); onTap(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onTap]);
  return null;
}

window.__GAMES__ = window.__GAMES__ || {};
window.__GAMES__.tempo = TempoGame;
})();
