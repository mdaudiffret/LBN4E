;(function() {
// games/escrime.jsx — L'Escrimeur
const { useState, useEffect, useRef } = React;

const CONFIGS = {
  1: { total: 15, visibility: 1400, feints: false },
  2: { total: 18, visibility: 1000, feints: false },
  3: { total: 20, visibility: 700,  feints: true  },
};

const NUM_SLITS = 4;

function EscrimeurGame({ level, onHud, onFinish }) {
  const cfg = CONFIGS[level];

  const [score, setScore] = useState(0);
  const [spawned, setSpawned] = useState(0);    // how many spawns done
  const [activeSlit, setActiveSlit] = useState(null);  // index 0-3 or null
  const [isFeint, setIsFeint] = useState(false);
  const [clicked, setClicked] = useState(false); // was current spawn clicked?
  const [timeLeft, setTimeLeft] = useState(30);
  const [done, setDone] = useState(false);

  const scoreRef = useRef(0);
  const spawnedRef = useRef(0);
  const activeSlitRef = useRef(null);
  const isFeintRef = useRef(false);
  const clickedRef = useRef(false);
  const doneRef = useRef(false);
  const gameTimerRef = useRef(null);
  const spawnTimerRef = useRef(null);

  function finish(finalScore) {
    if (doneRef.current) return;
    doneRef.current = true;
    setDone(true);
    clearInterval(gameTimerRef.current);
    clearTimeout(spawnTimerRef.current);
    setActiveSlit(null);
    onFinish(finalScore);
  }

  function spawnNext() {
    if (doneRef.current) return;
    const count = spawnedRef.current;
    if (count >= cfg.total) {
      // All spawns done, wait a moment then finish
      setTimeout(() => finish(scoreRef.current), 600);
      return;
    }

    const slit = Math.floor(Math.random() * NUM_SLITS);
    const feint = cfg.feints && Math.random() < 0.25;

    spawnedRef.current = count + 1;
    setSpawned(count + 1);
    activeSlitRef.current = slit;
    isFeintRef.current = feint;
    clickedRef.current = false;
    setActiveSlit(slit);
    setIsFeint(feint);
    setClicked(false);

    // Auto-disappear after visibility window
    spawnTimerRef.current = setTimeout(() => {
      activeSlitRef.current = null;
      setActiveSlit(null);
      // Short gap before next spawn
      spawnTimerRef.current = setTimeout(spawnNext, 200);
    }, cfg.visibility);
  }

  useEffect(() => {
    // Global game timer
    gameTimerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(gameTimerRef.current);
          finish(scoreRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    // Start first spawn
    spawnTimerRef.current = setTimeout(spawnNext, 600);

    return () => {
      clearInterval(gameTimerRef.current);
      clearTimeout(spawnTimerRef.current);
    };
  }, []);

  useEffect(() => { onHud({ score, total: cfg.total }); }, [score]);

  function handleSlitClick(idx) {
    if (doneRef.current) return;
    if (activeSlitRef.current !== idx) return; // no sword here
    if (clickedRef.current) return; // already clicked this spawn

    clickedRef.current = true;
    setClicked(true);

    if (isFeintRef.current) {
      // Clicked a feint → -1
      const newScore = Math.max(0, scoreRef.current - 1);
      scoreRef.current = newScore;
      setScore(newScore);
    } else {
      // Correct hit
      const newScore = scoreRef.current + 1;
      scoreRef.current = newScore;
      setScore(newScore);
    }

    // Clear current sword, schedule next
    clearTimeout(spawnTimerRef.current);
    activeSlitRef.current = null;
    setActiveSlit(null);
    spawnTimerRef.current = setTimeout(spawnNext, 250);
  }

  const timerColor = timeLeft <= 8 ? "var(--danger)" : "var(--gold)";

  return (
    <div className="col" style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 24 }}>
      <div className="prompt">
        <div className="prompt__instruction" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <span>Touchez les épées ! {level === 3 ? "· Rouge = feinte (ne pas cliquer)" : ""}</span>
          <span style={{
            fontFamily: "var(--font-brand)", fontWeight: 800,
            fontSize: 28, lineHeight: 1,
            color: timerColor, transition: "color .3s",
            flexShrink: 0
          }}>{timeLeft}s</span>
        </div>
        <div className="prompt__main" style={{ fontSize: 18 }}>
          Épées touchées : <strong style={{ color: "var(--gold)" }}>{score}</strong>
          <span style={{ color: "var(--char-2)", margin: "0 8px" }}>·</span>
          Vague : {spawned} / {cfg.total}
        </div>
      </div>

      {/* Timer bar */}
      <div style={{ width: "100%", maxWidth: 480, height: 4, background: "var(--line-dim)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${(timeLeft / 30) * 100}%`,
          background: timerColor,
          transition: "width 1s linear, background .3s"
        }} />
      </div>

      {/* Meurtrières */}
      <div className="row" style={{ gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
        {Array.from({ length: NUM_SLITS }).map((_, idx) => {
          const hasActive = activeSlit === idx;
          const feintActive = hasActive && isFeint;
          const realActive = hasActive && !isFeint;

          return (
            <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <span style={{
                fontSize: 11, fontFamily: "var(--font-serif)",
                color: "var(--bone)", letterSpacing: "0.08em",
                textTransform: "uppercase"
              }}>Meurtrière</span>
              <div
                onClick={() => handleSlitClick(idx)}
                style={{
                  width: 70, height: 130,
                  background: hasActive ? (feintActive ? "rgba(239,68,68,0.18)" : "rgba(212,162,76,0.12)") : "var(--char)",
                  border: `1px solid ${hasActive ? (feintActive ? "var(--danger)" : "var(--gold)") : "var(--gold)"}`,
                  borderRadius: 6,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: hasActive ? "pointer" : "default",
                  transition: "background .1s, border-color .1s",
                  userSelect: "none",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Decorative slit lines */}
                {!hasActive && (
                  <>
                    <div style={{ position: "absolute", top: 20, left: "20%", right: "20%", height: 1, background: "var(--line-dim)" }} />
                    <div style={{ position: "absolute", top: 40, left: "20%", right: "20%", height: 1, background: "var(--line-dim)" }} />
                    <div style={{ position: "absolute", top: 60, left: "20%", right: "20%", height: 1, background: "var(--line-dim)" }} />
                    <div style={{ position: "absolute", top: 80, left: "20%", right: "20%", height: 1, background: "var(--line-dim)" }} />
                    <div style={{ position: "absolute", top: 100, left: "20%", right: "20%", height: 1, background: "var(--line-dim)" }} />
                  </>
                )}
                {hasActive && (
                  <span style={{
                    fontSize: 40,
                    animation: "swordPop 0.2s ease-out",
                    display: "block",
                    filter: feintActive ? "hue-rotate(140deg) saturate(2)" : "none",
                    color: feintActive ? "var(--danger)" : "var(--gold-bright)",
                  }}>⚔</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {level === 3 && (
        <div style={{ fontSize: 13, color: "var(--bone)", fontFamily: "var(--font-serif)", textAlign: "center" }}>
          ⚠ Épées rouges = feintes — ne pas cliquer (−1 point)
        </div>
      )}

      <style>{`
        @keyframes swordPop {
          0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
          60%  { transform: scale(1.2) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

window.__GAMES__ = window.__GAMES__ || {};
window.__GAMES__.escrime = EscrimeurGame;
})();
