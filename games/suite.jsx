;(function() {
// games/suite.jsx — Suite logique
const { useState, useEffect, useRef } = React;

function sumDigits(n) {
  return String(Math.abs(n)).split("").reduce((acc, d) => acc + Number(d), 0);
}

function makeSuite(level) {
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  if (level === 1) {
    const t = rnd(0, 1);
    if (t === 0) {
      // Simple ×2 or ×3
      const ratio = rnd(2, 3);
      const start = rnd(2, 5);
      const arr = Array.from({ length: 6 }, (_, i) => start * Math.pow(ratio, i));
      return { seq: arr.slice(0, 5), answer: arr[5] };
    }
    // Simple arithmetic step 1-5
    const start = rnd(2, 20);
    const step = rnd(1, 5);
    const arr = Array.from({ length: 6 }, (_, i) => start + i * step);
    return { seq: arr.slice(0, 5), answer: arr[5] };
  }

  if (level === 2) {
    const t = rnd(0, 3);
    if (t === 0) {
      // Geometric ×2 to ×4
      const ratio = rnd(2, 4);
      const start = rnd(2, 8);
      const arr = Array.from({ length: 5 }, (_, i) => start * Math.pow(ratio, i));
      return { seq: arr.slice(0, 4), answer: arr[4] };
    }
    if (t === 1) {
      // Quadratic: differences grow by +dd each step
      const start = rnd(2, 15);
      const d1 = rnd(2, 5), dd = rnd(1, 3);
      const arr = [start];
      let diff = d1;
      for (let i = 0; i < 5; i++) { arr.push(arr[i] + diff); diff += dd; }
      return { seq: arr.slice(0, 5), answer: arr[5] };
    }
    if (t === 2) {
      // Alternating ×2 then +add
      const start = rnd(3, 10), add = rnd(4, 12);
      const arr = [start];
      for (let i = 0; i < 5; i++) arr.push(i % 2 === 0 ? arr[i] * 2 : arr[i] + add);
      return { seq: arr.slice(0, 5), answer: arr[5] };
    }
    if (t === 3) {
      // Sum of digits: next = prev + sum_of_digits(prev)
      const start = rnd(10, 25);
      const arr = [start];
      for (let i = 0; i < 5; i++) arr.push(arr[i] + sumDigits(arr[i]));
      return { seq: arr.slice(0, 5), answer: arr[5] };
    }
    // Perfect squares
    const offset = rnd(2, 10);
    const arr = Array.from({ length: 5 }, (_, i) => Math.pow(offset + i, 2));
    return { seq: arr.slice(0, 4), answer: arr[4] };
  }

  // Level 3
  const t = rnd(0, 4);
  if (t === 0) {
    // Fibonacci-like
    const a = rnd(2, 7), b = rnd(5, 12);
    const arr = [a, b];
    for (let i = 0; i < 5; i++) arr.push(arr[arr.length - 1] + arr[arr.length - 2]);
    return { seq: arr.slice(0, 5), answer: arr[5] };
  }
  if (t === 1) {
    // Cubes
    const start = rnd(2, 5);
    const arr = Array.from({ length: 5 }, (_, i) => Math.pow(start + i, 3));
    return { seq: arr.slice(0, 4), answer: arr[4] };
  }
  if (t === 2) {
    // Alternating ×m then −s
    const start = rnd(10, 24), m = rnd(2, 3), s = rnd(4, 10);
    const arr = [start];
    for (let i = 0; i < 5; i++) arr.push(i % 2 === 0 ? arr[i] * m : arr[i] - s);
    return { seq: arr.slice(0, 5), answer: arr[5] };
  }
  if (t === 3) {
    // Triangular numbers: n*(n+1)/2
    const sn = rnd(3, 8);
    const arr = Array.from({ length: 5 }, (_, i) => {
      const n = sn + i;
      return (n * (n + 1)) / 2;
    });
    return { seq: arr.slice(0, 4), answer: arr[4] };
  }
  // Powers of 2
  const start = rnd(1, 4);
  const arr = Array.from({ length: 5 }, (_, i) => Math.pow(2, start + i));
  return { seq: arr.slice(0, 4), answer: arr[4] };
}

const SUITE_TOTAL = 5;
const SUITE_TIMER = 60;

function SuiteGame({ level, onHud, onFinish }) {
  const [q, setQ] = useState(() => makeSuite(level));
  const [val, setVal] = useState("");
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(SUITE_TIMER);
  const inputRef = useRef(null);
  const doneRef = useRef(false);

  useEffect(() => { inputRef.current?.focus(); }, [round]);
  useEffect(() => { onHud({ score, total: SUITE_TOTAL }); }, [score]);

  // global countdown
  useEffect(() => {
    if (doneRef.current) return;
    if (timeLeft <= 0) {
      if (!doneRef.current) {
        doneRef.current = true;
        onFinish(score);
      }
      return;
    }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  const timerColor = timeLeft <= 15 ? "var(--danger)" : undefined;
  const timerDisplay = `⏱ 0:${String(timeLeft).padStart(2, "0")}`;

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
        doneRef.current = true;
        onFinish(newScore);
        return;
      }
      setRound(r => r + 1);
      setQ(makeSuite(level));
      setVal("");
    }, 1100);
  };

  return (
    React.createElement("div", { className: "col", style: { flex: 1, alignItems: "center", justifyContent: "center", gap: 24 } },
      React.createElement("div", { className: "prompt" },
        React.createElement("div", { className: "prompt__instruction", style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 } },
          React.createElement("span", null, `Manche ${round} / ${SUITE_TOTAL} — Trouve le suivant`),
          React.createElement("span", { style: { color: timerColor, fontVariantNumeric: "tabular-nums" } }, timerDisplay)
        ),
        React.createElement("div", {
          className: "prompt__main",
          style: { fontSize: 44, display: "flex", gap: 12, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }
        },
          q.seq.map((n, i) => React.createElement("span", { key: i }, n)),
          React.createElement("span", {
            style: {
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 72, height: 56, borderRadius: 12,
              border: "2px dashed var(--gold)", color: "var(--gold-bright)", fontSize: 28
            }
          }, "?")
        )
      ),
      React.createElement("form", { onSubmit: submit, style: { display: "flex", gap: 8 } },
        React.createElement("input", {
          ref: inputRef,
          className: "k-input k-input--lg",
          style: {
            width: 160, fontSize: 28, fontWeight: 700, textAlign: "center",
            borderColor: feedback === "ok" ? "var(--success)" : feedback === "ko" ? "var(--danger)" : undefined
          },
          value: val,
          onChange: (e) => setVal(e.target.value.replace(/[^\d-]/g, "")),
          inputMode: "numeric"
        }),
        React.createElement("button", {
          type: "submit",
          className: "k-btn k-btn--brand k-btn--lg",
          disabled: feedback != null
        }, "Valider")
      ),
      feedback === "ok" && React.createElement("div", { className: "feedback ok" }, "Bonne réponse !"),
      feedback === "ko" && React.createElement("div", { className: "feedback ko" }, `C'était ${q.answer}`)
    )
  );
}

window.__GAMES__ = window.__GAMES__ || {};
window.__GAMES__.suite = SuiteGame;
})();
