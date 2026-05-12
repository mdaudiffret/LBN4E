;(function() {
// games/copiste.jsx — Le Copiste
const { useState, useEffect, useRef, useCallback } = React;

const LEVELS = {
  1: { lv: 1, hint: "≥ 20/25 mots · 60s", maxTime: 60, target: 20, total: 25 },
  2: { lv: 2, hint: "≥ 25/30 mots · 60s", maxTime: 60, target: 25, total: 30 },
  3: { lv: 3, hint: "≥ 35/40 mots · 50s", maxTime: 50, target: 35, total: 40 },
};

const TEXTS = {
  1: "Le seigneur du chasteau convie ses amis à un grand festin royal plein de liesse et de joie partagée entre tous.",
  2: "Par décret de Sa Majesté le Roy très chrétien il est ordonné à tous les chevaliers de se présenter en armes devant la cour royale dès l'aurore du premier jour de juin.",
  3: "En l'an de grâce mil six cent vingt la troupe des mousquetaires du Roy sous les ordres du sieur de Tréville prêta serment de fidélité et défendit vaillamment les couleurs du royaume de France contre ses ennemis déclarés et secrets.",
};

function splitWords(text) {
  return text.trim().split(/\s+/).filter(Boolean);
}

function CopisteGame({ level, onHud, onFinish }) {
  const cfg = LEVELS[level] || LEVELS[1];
  const sourceText = TEXTS[level];
  const sourceWords = splitWords(sourceText);
  // Cap to cfg.total
  const targetWords = sourceWords.slice(0, cfg.total);

  const [input, setInput] = useState("");
  const [time, setTime] = useState(cfg.maxTime);
  const [over, setOver] = useState(false);
  const scoreRef = useRef(0);
  const inputRef = useRef(null);

  // Derive typed words from input
  const typedWords = input.split(/\s+/);
  // If input ends with space, last "word" is empty — typed words count includes that
  const inputEndsSpace = input.endsWith(" ");

  // Score: count correct words among completed words (ones followed by space or if game over)
  const completedCount = inputEndsSpace ? typedWords.length : Math.max(0, typedWords.length - 1);
  const cappedCompleted = Math.min(completedCount, cfg.total);

  // Also consider the last word done if it exactly matches (no trailing space needed)
  const lastIdx = cfg.total - 1;
  const lastWordExact = !inputEndsSpace &&
    typedWords.length >= cfg.total &&
    typedWords[lastIdx] === targetWords[lastIdx];
  const effectiveCompleted = lastWordExact ? cfg.total : cappedCompleted;

  let score = 0;
  for (let i = 0; i < effectiveCompleted; i++) {
    if (typedWords[i] === targetWords[i]) score++;
  }

  const allGreen = score === cfg.total;

  useEffect(() => { scoreRef.current = score; }, [score]);

  useEffect(() => {
    onHud({ score, total: cfg.total });
  }, [score]);

  // Auto-finish when all words are correct (all green) OR all words typed
  useEffect(() => {
    if (over || !allGreen) return;
    setOver(true);
  }, [allGreen, over]);

  // Timer
  useEffect(() => {
    if (over) return;
    if (time <= 0) { setOver(true); return; }
    const t = setTimeout(() => setTime(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [time, over]);

  useEffect(() => {
    if (over) onFinish(scoreRef.current);
  }, [over]);

  // Auto-focus
  useEffect(() => {
    if (inputRef.current && !over) inputRef.current.focus();
  }, [over]);

  const handleChange = useCallback((e) => {
    if (over) return;
    const val = e.target.value;
    // Count how many word-slots are filled
    const words = val.split(/\s+/);
    const endsSpace = val.endsWith(" ");
    const filledCount = endsSpace ? words.length : Math.max(0, words.length - 1);
    if (filledCount >= cfg.total) {
      // Allow up to cfg.total words + 1 space
      const maxAllowed = targetWords.join(" ") + " ";
      if (val.length > maxAllowed.length + 10) return;
    }
    setInput(val);
  }, [over, cfg.total, targetWords]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  if (over) {
    const passed = scoreRef.current >= cfg.target;
    return (
      React.createElement("div", { className: "col", style: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 } },
        React.createElement("div", { className: "prompt" },
          React.createElement("div", { className: "prompt__instruction" }, "Copie terminée"),
          React.createElement("div", { className: "prompt__main" }, `${scoreRef.current} mot${scoreRef.current > 1 ? "s" : ""} correct${scoreRef.current > 1 ? "s" : ""}`)
        ),
        React.createElement("div", { className: `feedback ${passed ? "ok" : "ko"}` },
          passed
            ? `Objectif atteint — ${scoreRef.current} ≥ ${cfg.target}`
            : `Insuffisant — minimum : ${cfg.target} mots`
        )
      )
    );
  }

  const timerPct = (time / cfg.maxTime) * 100;
  const timerColor = time <= 10 ? "var(--danger)" : time <= 20 ? "var(--gold)" : "var(--success)";

  // Render source text with word highlights
  const currentWordIdx = inputEndsSpace ? typedWords.length : typedWords.length - 1;

  const renderedWords = targetWords.map((word, i) => {
    let color, bgColor, fontWeight;
    if (i < effectiveCompleted) {
      // Completed word (including last word if exactly typed)
      const correct = typedWords[i] === word;
      color = correct ? "var(--success)" : "var(--danger)";
      bgColor = correct ? "rgba(80,180,80,0.12)" : "rgba(200,60,60,0.12)";
      fontWeight = 600;
    } else if (i === currentWordIdx) {
      // Current word being typed — green if exact match already
      const typed = typedWords[i] || "";
      if (typed === word) {
        color = "var(--success)";
        bgColor = "rgba(80,180,80,0.12)";
        fontWeight = 600;
      } else {
        color = "var(--gold-bright)";
        bgColor = "rgba(200,160,60,0.15)";
        fontWeight = 700;
      }
    } else {
      color = "var(--bone)";
      bgColor = "transparent";
      fontWeight = 400;
    }
    return React.createElement("span", {
      key: i,
      style: {
        color,
        background: bgColor,
        fontWeight,
        borderRadius: 2,
        padding: "1px 2px",
        transition: "color 0.15s, background 0.15s"
      }
    }, word + (i < targetWords.length - 1 ? " " : ""));
  });

  return (
    React.createElement("div", { className: "col", style: { flex: 1, gap: 12, alignItems: "stretch" } },
      // HUD
      React.createElement("div", { className: "row", style: { justifyContent: "space-between", alignItems: "center" } },
        React.createElement("div", { style: { fontFamily: "var(--font-serif)", color: "var(--bone)", fontSize: 13 } },
          React.createElement("span", { style: { color: "var(--success)", fontWeight: 700 } }, score),
          React.createElement("span", { style: { color: "var(--line)" } }, ` / ${cfg.total} mots corrects`)
        ),
        React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: timerColor } },
          formatTime(time)
        )
      ),
      // Timer bar
      React.createElement("div", { style: { height: 3, background: "var(--line-dim)", borderRadius: 2, overflow: "hidden" } },
        React.createElement("div", { style: { height: "100%", width: `${timerPct}%`, background: timerColor, transition: "width 1s linear, background 0.3s" } })
      ),
      // Source text display
      React.createElement("div", {
        style: {
          background: "var(--char)",
          border: "1px solid var(--line)",
          borderRadius: 8,
          padding: "12px 16px",
          fontFamily: "var(--font-serif)",
          fontSize: 15,
          lineHeight: 1.8,
          color: "var(--bone)",
          letterSpacing: "0.02em"
        }
      },
        React.createElement("div", { style: { fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--gold)", marginBottom: 6, fontFamily: "var(--font-brand)" } },
          "Texte à recopier"
        ),
        ...renderedWords
      ),
      // Textarea
      React.createElement("textarea", {
        ref: inputRef,
        value: input,
        onChange: handleChange,
        disabled: over,
        placeholder: "Commencez à recopier le texte ici…",
        className: "k-input",
        style: {
          flex: 1,
          minHeight: 100,
          resize: "none",
          fontFamily: "var(--font-serif)",
          fontSize: 15,
          lineHeight: 1.8,
          padding: "10px 14px",
          letterSpacing: "0.02em",
          background: "var(--char-2)",
          color: "var(--pearl)",
          border: "1px solid var(--line)",
          borderRadius: 8,
          outline: "none",
        },
        spellCheck: false,
        autoComplete: "off",
        autoCorrect: "off",
        autoCapitalize: "off"
      }),
      // Progress bar for words
      React.createElement("div", { style: { fontSize: 11, color: "var(--line)", fontFamily: "var(--font-mono)", textAlign: "right" } },
        `${effectiveCompleted} / ${cfg.total} mots saisis`
      )
    )
  );
}

window.__GAMES__ = window.__GAMES__ || {};
window.__GAMES__.copiste = CopisteGame;
})();
