;(function() {
// games/suite.jsx — Suite logique
const { useState, useEffect, useRef } = React;

function makeSuite(level) {
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  if (level === 1) {
    const t = rnd(0, 2);
    if (t === 0) {
      // Alternating +a +b
      const a = rnd(2, 7), b = rnd(3, 9);
      const start = rnd(3, 20);
      const arr = [start];
      for (let i = 0; i < 5; i++) arr.push(arr[i] + (i % 2 === 0 ? a : b));
      return { seq: arr.slice(0, 5), answer: arr[5], hint: `alterné +${a}/+${b}` };
    }
    if (t === 1) {
      // ×2 or ×3
      const ratio = rnd(2, 3);
      const start = rnd(2, 6);
      const arr = Array.from({ length: 6 }, (_, i) => start * Math.pow(ratio, i));
      return { seq: arr.slice(0, 5), answer: arr[5], hint: `×${ratio}` };
    }
    // Arithmetic, bigger step
    const start = rnd(4, 30);
    const step = rnd(4, 12);
    const arr = Array.from({ length: 6 }, (_, i) => start + i * step);
    return { seq: arr.slice(0, 5), answer: arr[5], hint: `+${step}` };
  }

  if (level === 2) {
    const t = rnd(0, 3);
    if (t === 0) {
      // Geometric ×2 to ×4
      const ratio = rnd(2, 4);
      const start = rnd(2, 8);
      const arr = Array.from({ length: 5 }, (_, i) => start * Math.pow(ratio, i));
      return { seq: arr.slice(0, 4), answer: arr[4], hint: `×${ratio}` };
    }
    if (t === 1) {
      // Quadratic: differences grow by +dd each step
      const start = rnd(2, 15);
      const d1 = rnd(2, 5), dd = rnd(1, 3);
      const arr = [start];
      let diff = d1;
      for (let i = 0; i < 5; i++) { arr.push(arr[i] + diff); diff += dd; }
      return { seq: arr.slice(0, 5), answer: arr[5], hint: `+${d1}, +${d1+dd}, +${d1+2*dd}…` };
    }
    if (t === 2) {
      // Alternating ×ratio then +add
      const start = rnd(3, 10), add = rnd(4, 12);
      const arr = [start];
      for (let i = 0; i < 5; i++) arr.push(i % 2 === 0 ? arr[i] * 2 : arr[i] + add);
      return { seq: arr.slice(0, 5), answer: arr[5], hint: `alterné ×2/+${add}` };
    }
    // Perfect squares
    const offset = rnd(2, 10);
    const arr = Array.from({ length: 5 }, (_, i) => Math.pow(offset + i, 2));
    return { seq: arr.slice(0, 4), answer: arr[4], hint: 'carrés' };
  }

  // Level 3
  const t = rnd(0, 4);
  if (t === 0) {
    // Fibonacci-like
    const a = rnd(2, 7), b = rnd(5, 12);
    const arr = [a, b];
    for (let i = 0; i < 5; i++) arr.push(arr[arr.length - 1] + arr[arr.length - 2]);
    return { seq: arr.slice(0, 5), answer: arr[5], hint: 'Fibonacci' };
  }
  if (t === 1) {
    // Cubes
    const start = rnd(2, 5);
    const arr = Array.from({ length: 5 }, (_, i) => Math.pow(start + i, 3));
    return { seq: arr.slice(0, 4), answer: arr[4], hint: 'cubes' };
  }
  if (t === 2) {
    // Alternating ×m then −s
    const start = rnd(10, 24), m = rnd(2, 3), s = rnd(4, 10);
    const arr = [start];
    for (let i = 0; i < 5; i++) arr.push(i % 2 === 0 ? arr[i] * m : arr[i] - s);
    return { seq: arr.slice(0, 5), answer: arr[5], hint: `alterné ×${m}/−${s}` };
  }
  if (t === 3) {
    // Triangular numbers: n*(n+1)/2
    const sn = rnd(3, 8);
    const arr = Array.from({ length: 5 }, (_, i) => {
      const n = sn + i;
      return (n * (n + 1)) / 2;
    });
    return { seq: arr.slice(0, 4), answer: arr[4], hint: 'triangulaires' };
  }
  // Powers of 2
  const start = rnd(1, 4);
  const arr = Array.from({ length: 5 }, (_, i) => Math.pow(2, start + i));
  return { seq: arr.slice(0, 4), answer: arr[4], hint: 'puissances de 2' };
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
      if (round >= SUITE_TOTAL) { onFinish(newScore); return; }
      setRound(r => r + 1);
      setQ(makeSuite(level));
      setVal("");
    }, 1100);
  };

  return (
    <div className="col" style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 24 }}>
      <div className="prompt">
        <div className="prompt__instruction">Manche {round} / {SUITE_TOTAL} — Trouve le suivant</div>
        <div className="prompt__main" style={{ fontSize: 44, display: "flex", gap: 12, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
          {q.seq.map((n, i) => (<span key={i}>{n}</span>))}
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 72, height: 56, borderRadius: 12,
            border: "2px dashed var(--gold)", color: "var(--gold-bright)", fontSize: 28
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
