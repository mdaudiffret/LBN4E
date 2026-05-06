;(function() {
// games/cible.jsx — Cibles mobiles
const { useState, useEffect, useRef } = React;

function CibleGame({ level, onHud, onFinish }) {
  const cfg = {
    1: { duration: 30, size: 64, ttl: 2200, gap: 700 },
    2: { duration: 30, size: 48, ttl: 1500, gap: 500 },
    3: { duration: 30, size: 36, ttl: 950,  gap: 350 }
  }[level];
  const [time, setTime] = useState(cfg.duration);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [over, setOver] = useState(false);
  const [target, setTarget] = useState(null); // {x, y, id, born}
  const fieldRef = useRef(null);
  const idRef = useRef(0);

  useEffect(() => onHud({ time, score }), [time, score]);

  useEffect(() => {
    if (over) return;
    if (time <= 0) { setOver(true); return; }
    const t = setTimeout(() => setTime((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [time, over]);

  useEffect(() => {
    if (over) onFinish(score);
  }, [over]);

  // spawn loop
  useEffect(() => {
    if (over) return;
    let cancel = false;
    const spawn = () => {
      if (cancel || over) return;
      const f = fieldRef.current;
      if (!f) return;
      const r = f.getBoundingClientRect();
      const pad = cfg.size / 2 + 8;
      const x = pad + Math.random() * (r.width - pad * 2);
      const y = pad + Math.random() * (r.height - pad * 2);
      const id = ++idRef.current;
      setTarget({ x, y, id, born: performance.now() });
      setTimeout(() => {
        setTarget((cur) => {
          if (cur && cur.id === id) {
            setMisses((m) => m + 1);
            setTimeout(spawn, cfg.gap);
            return null;
          }
          return cur;
        });
      }, cfg.ttl);
    };
    spawn();
    return () => { cancel = true; };
  }, [over]);

  const hit = () => {
    if (!target || over) return;
    setScore((s) => s + 1);
    setTarget(null);
    setTimeout(() => {
      const f = fieldRef.current;
      if (!f) return;
      const r = f.getBoundingClientRect();
      const pad = cfg.size / 2 + 8;
      const x = pad + Math.random() * (r.width - pad * 2);
      const y = pad + Math.random() * (r.height - pad * 2);
      const id = ++idRef.current;
      setTarget({ x, y, id, born: performance.now() });
      setTimeout(() => {
        setTarget((cur) => {
          if (cur && cur.id === id) {
            setMisses((m) => m + 1);
            return null;
          }
          return cur;
        });
      }, cfg.ttl);
    }, cfg.gap * 0.4);
  };

  if (over) {
    return (
      <div className="col" style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <div className="prompt">
          <div className="prompt__instruction">Terminé</div>
          <div className="prompt__main">{score} cibles</div>
        </div>
      </div>
    );
  }

  return (
    <div className="col" style={{ flex: 1, alignItems: "stretch", gap: 16 }}>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <div className="prompt__instruction" style={{ marginBottom: 0 }}>Touche la cible bleue</div>
        </div>
        <div className="row" style={{ gap: 12, fontSize: 13, fontWeight: 600 }}>
          <span className="muted">Ratés</span><span className="tnum">{misses}</span>
        </div>
      </div>
      <div ref={fieldRef}
        style={{
          position: "relative",
          flex: 1,
          minHeight: 360,
          borderRadius: 16,
          background: "linear-gradient(180deg, rgba(61,82,213,0.15), rgba(7,7,12,0.6))",
          border: "1px solid var(--komin-lightgray)",
          overflow: "hidden",
          cursor: "crosshair"
        }}>
        {target && (
          <button onClick={hit}
            style={{
              position: "absolute",
              left: target.x - cfg.size / 2,
              top: target.y - cfg.size / 2,
              width: cfg.size, height: cfg.size,
              borderRadius: "50%",
              background: "var(--komin-blue)",
              border: "4px solid #fff",
              boxShadow: "var(--shadow-md), 0 0 0 4px rgba(61,82,213,0.18)",
              cursor: "pointer",
              padding: 0,
              animation: "pop .15s ease-out"
            }}
          />
        )}
      </div>
      <style>{`@keyframes pop { from { transform: scale(.4); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  );
}

window.__GAMES__ = window.__GAMES__ || {};
window.__GAMES__.cible = CibleGame;
})();
