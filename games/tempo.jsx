;(function() {
// games/tempo.jsx — Tap-tempo régulier
const { useState, useEffect, useRef } = React;

function TempoGame({ level, onHud, onFinish }) {
  const tolerance = { 1: 200, 2: 100, 3: 50 }[level];
  const TARGET_BPM = 100; // 600ms intervals
  const TARGET_INTERVAL = 60000 / TARGET_BPM;
  const TOTAL = 8;

  const [taps, setTaps] = useState([]); // timestamps
  const [done, setDone] = useState(false);

  useEffect(() => onHud({ score: Math.max(0, taps.length - 1), total: TOTAL - 1 }), [taps]);

  const tap = () => {
    if (done) return;
    const t = performance.now();
    const next = [...taps, t];
    setTaps(next);
    if (next.length >= TOTAL) setDone(true);
  };

  // compute intervals + score
  const intervals = [];
  for (let i = 1; i < taps.length; i++) intervals.push(taps[i] - taps[i - 1]);
  let goodCount = 0;
  let avg = null;
  if (intervals.length > 0) {
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    avg = avgInterval;
    for (const it of intervals) {
      if (Math.abs(it - avgInterval) <= tolerance) goodCount++;
    }
  }
  const consistency = intervals.length === 0 ? null : Math.round((goodCount / intervals.length) * 100);
  const bpm = avg ? Math.round(60000 / avg) : null;

  const reset = () => { setTaps([]); setDone(false); };

  if (done) {
    if (consistency != null) {
      // delegate result to parent
      setTimeout(() => onFinish(consistency), 0);
    }
    return (
      <div className="col" style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <div className="prompt">
          <div className="prompt__instruction">Terminé</div>
          <div className="prompt__main">{consistency}% de régularité</div>
        </div>
      </div>
    );
  }

  return (
    <div className="col" style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 24 }}>
      <div className="prompt" style={{ marginBottom: 0 }}>
        <div className="prompt__instruction">Tape {TOTAL} fois en rythme régulier</div>
        <div className="prompt__main">{taps.length} / {TOTAL}</div>
      </div>

      <button onClick={tap}
        style={{
          width: 220, height: 220, borderRadius: "50%",
          background: "var(--komin-blue)",
          border: "none", color: "#fff",
          fontFamily: "var(--font-brand)", fontWeight: 800,
          fontSize: 24, letterSpacing: "-0.02em",
          cursor: "pointer",
          boxShadow: "var(--shadow-lg)",
          transform: taps.length > 0 ? "scale(1)" : "scale(1)",
          transition: "transform .08s"
        }}
        onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.96)"}
        onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
      >
        TAP
      </button>

      {/* live intervals */}
      {intervals.length > 0 && (
        <div className="row" style={{ flexWrap: "wrap", gap: 6, justifyContent: "center", maxWidth: 480 }}>
          {intervals.map((it, i) => {
            const ref = avg || 0;
            const ok = Math.abs(it - ref) <= tolerance;
            return (
              <span key={i} className={`k-pill k-pill--sm ${ok ? "k-pill--light-success" : "k-pill--light-warning"}`}>
                {Math.round(it)} ms
              </span>
            );
          })}
        </div>
      )}
      <div className="muted" style={{ fontSize: 13 }}>Trouve un rythme stable. Espace ou clic.</div>
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
