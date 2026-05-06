;(function() {
// games/suite.jsx — Suite logique
const { useState, useEffect, useRef } = React;

function makeSuite(level) {
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  if (level === 1) {
    const start = rnd(1, 10);
    const step = rnd(1, 4);
    const arr = Array.from({ length: 5 }, (_, i) => start + i * step);
    return { seq: arr.slice(0, 4), answer: arr[4], hint: `+${step}` };
  }
  if (level === 2) {
    if (Math.random() < 0.5) {
      const start = rnd(2, 12);
      const ratio = rnd(2, 3);
      const arr = Array.from({ length: 5 }, (_, i) => start * Math.pow(ratio, i));
      return { seq: arr.slice(0, 4), answer: arr[4], hint: `×${ratio}` };
    }
    const start = rnd(3, 25);
    const step = rnd(2, 7);
    const arr = Array.from({ length: 5 }, (_, i) => start + i * step);
    return { seq: arr.slice(0, 4), answer: arr[4], hint: `+${step}` };
  }
  const t = rnd(0, 3);
  if (t === 0) {
    const a = rnd(1, 5), b = rnd(2, 7);
    const arr = [a, b];
    for (let i = 0; i < 4; i++) arr.push(arr[arr.length - 1] + arr[arr.length - 2]);
    return { seq: arr.slice(0, 5), answer: arr[5], hint: "Fibonacci" };
  }
  if (t === 1) {
    const start = rnd(2, 5);
    const arr = Array.from({ length: 5 }, (_, i) => Math.pow(start + i, 2));
    return { seq: arr.slice(0, 4), answer: arr[4], hint: "carrés" };
  }
  if (t === 2) {
    const start = rnd(1, 8);
    const arr = [start];
    for (let i = 0; i < 5; i++) arr.push(arr[i] + (i + 2));
    return { seq: arr.slice(0, 5), answer: arr[5], hint: "+2, +3, +4..." };
  }
  const a = rnd(2, 6), b = rnd(3, 7);
  const arr = [a];
  for (let i = 0; i < 5; i++) arr.push(arr[i] + (i % 2 === 0 ? b : -1));
  return { seq: arr.slice(0, 5), answer: arr[5], hint: "alterné" };
}

const SUITE_TOTAL = 5;

function SuiteGame({ level, onHud, onFinish }) {
  const [q, setQ] = useState(() => makeSuite(level));
  const [val, setVal] = useState("");
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [feedback, setFeedback] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, [round]);
  useEffect(() => { onHud({ score, total: SUITE_TOTAL }); }, [score]);

  const submit = (e) => {
    e?.preventDefault?.();
    const n = Number(val);
    if (val === "" || Number.isNaN(n)) return;
    const ok = n === q.answer;
    setFeedback(ok ? "ok" : "ko");
    const newScore = ok ? score + 1 : score;
    if (ok) setScore(newScore);
    setTimeout(() => {
      setFeedback(null);
      if (round >= SUITE_TOTAL) {
        onFinish(newScore);
        return;
      }
      setRound(r => r + 1);
      setQ(makeSuite(level));
      setVal("");
    }, 1100);
  };

  return (
    <div className="col" style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 24 }}>
      <div className="prompt">
        <div className="prompt__instruction">Manche {round} / {SUITE_TOTAL} — Trouve le suivant</div>
        <div className="prompt__main" style={{ fontSize: 56, display: "flex", gap: 16, justifyContent: "center", alignItems: "center" }}>
          {q.seq.map((n, i) => (<span key={i}>{n}</span>))}
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 80, height: 64, borderRadius: 12,
            border: "2px dashed var(--gold)", color: "var(--gold-bright)", fontSize: 32
          }}>?</span>
        </div>
      </div>
      <form onSubmit={submit} style={{ display: "flex", gap: 8 }}>
        <input ref={inputRef}
          className="k-input k-input--lg"
          style={{
            width: 160, fontSize: 28, fontWeight: 700, textAlign: "center",
            borderColor: feedback === "ok" ? "var(--success)" : feedback === "ko" ? "var(--danger)" : undefined
          }}
          value={val} onChange={(e) => setVal(e.target.value.replace(/[^\d-]/g, ""))} inputMode="numeric"
        />
        <button type="submit" className="k-btn k-btn--brand k-btn--lg" disabled={feedback != null}>Valider</button>
      </form>
      {feedback === "ok" && <div className="feedback ok">Bonne réponse !</div>}
      {feedback === "ko" && <div className="feedback ko">C'était {q.answer} ({q.hint})</div>}
    </div>
  );
}

window.__GAMES__ = window.__GAMES__ || {};
window.__GAMES__.suite = SuiteGame;
})();
