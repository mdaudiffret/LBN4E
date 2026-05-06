;(function() {
// games/capitales.jsx — Capitales du monde
const { useState, useEffect } = React;

const CAPITALES = {
  1: [
    { p: "France", c: "Paris" },
    { p: "Espagne", c: "Madrid" },
    { p: "Italie", c: "Rome" },
    { p: "Allemagne", c: "Berlin" },
    { p: "Belgique", c: "Bruxelles" },
    { p: "Royaume-Uni", c: "Londres" },
    { p: "Portugal", c: "Lisbonne" },
    { p: "Suisse", c: "Berne", distractors: ["Zurich", "Genève"] },
    { p: "Pays-Bas", c: "Amsterdam" },
    { p: "Maroc", c: "Rabat", distractors: ["Casablanca", "Marrakech"] },
  ],
  2: [
    { p: "Suède", c: "Stockholm" },
    { p: "Norvège", c: "Oslo" },
    { p: "Pologne", c: "Varsovie" },
    { p: "Grèce", c: "Athènes" },
    { p: "Russie", c: "Moscou" },
    { p: "Japon", c: "Tokyo" },
    { p: "Chine", c: "Pékin" },
    { p: "États-Unis", c: "Washington", distractors: ["New York", "Los Angeles"] },
    { p: "Brésil", c: "Brasília", distractors: ["Rio de Janeiro", "São Paulo"] },
    { p: "Canada", c: "Ottawa", distractors: ["Toronto", "Montréal"] },
    { p: "Australie", c: "Canberra", distractors: ["Sydney", "Melbourne"] },
    { p: "Égypte", c: "Le Caire" },
    { p: "Argentine", c: "Buenos Aires" },
    { p: "Inde", c: "New Delhi" },
    { p: "Turquie", c: "Ankara", distractors: ["Istanbul", "Izmir"] },
  ],
  3: [
    { p: "Kazakhstan", c: "Astana" },
    { p: "Bhoutan", c: "Thimphou" },
    { p: "Mongolie", c: "Oulan-Bator" },
    { p: "Sri Lanka", c: "Colombo" },
    { p: "Burkina Faso", c: "Ouagadougou" },
    { p: "Madagascar", c: "Antananarivo" },
    { p: "Géorgie", c: "Tbilissi" },
    { p: "Slovénie", c: "Ljubljana" },
    { p: "Croatie", c: "Zagreb" },
    { p: "Lettonie", c: "Riga" },
    { p: "Lituanie", c: "Vilnius" },
    { p: "Bolivie", c: "Sucre", distractors: ["La Paz", "Santa Cruz"] },
    { p: "Équateur", c: "Quito" },
    { p: "Paraguay", c: "Asunción" },
    { p: "Cambodge", c: "Phnom Penh" },
    { p: "Népal", c: "Katmandou" },
  ]
};

const ALL_CAPITALES = Object.values(CAPITALES).flat();

function pickCapitale(level) {
  const pool = CAPITALES[level];
  const item = pool[Math.floor(Math.random() * pool.length)];
  // gather 3 distractors
  const inherent = item.distractors || [];
  const fromOthers = ALL_CAPITALES.filter(x => x.c !== item.c).sort(() => Math.random() - 0.5);
  const distractors = [...inherent.slice(0, 2)];
  while (distractors.length < 3) {
    const candidate = fromOthers.shift().c;
    if (!distractors.includes(candidate) && candidate !== item.c) distractors.push(candidate);
  }
  const choices = [item.c, ...distractors].sort(() => Math.random() - 0.5);
  return { item, choices };
}

function CapitalesGame({ level, onHud, onFinish }) {
  const TOTAL = 6;
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [q, setQ] = useState(() => pickCapitale(level));
  const [picked, setPicked] = useState(null);

  useEffect(() => { setQ(pickCapitale(level)); setPicked(null); }, [round, level]);
  useEffect(() => onHud({ score, total: TOTAL }), [score]);

  const choose = (cap) => {
    if (picked) return;
    setPicked(cap);
    const ok = cap === q.item.c;
    const newScore = ok ? score + 1 : score;
    if (ok) setScore(newScore);
    setTimeout(() => {
      if (round >= TOTAL) onFinish(newScore);
      else setRound((r) => r + 1);
    }, 1100);
  };

  return (
    <div className="col" style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 24 }}>
      <div className="prompt">
        <div className="prompt__instruction">Manche {round} / {TOTAL} — Capitale de</div>
        <div className="prompt__main">{q.item.p}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, width: "100%", maxWidth: 480 }}>
        {q.choices.map((c) => {
          const isCorrect = c === q.item.c;
          const isPicked = picked === c;
          let bg = "var(--char-2)", color = "var(--pearl)", border = "var(--komin-lightgray)";
          if (picked) {
            if (isCorrect) { bg = "var(--komin-lightgreen)"; color = "var(--success)"; border = "var(--success)"; }
            else if (isPicked) { bg = "var(--komin-lightred)"; color = "var(--danger)"; border = "var(--danger)"; }
          }
          return (
            <button key={c} onClick={() => choose(c)} disabled={!!picked}
              style={{
                padding: "16px 18px",
                borderRadius: 10,
                background: bg, color,
                border: `1px solid ${border}`,
                fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 18,
                cursor: picked ? "default" : "pointer",
                transition: "all .15s",
                boxShadow: "var(--shadow-xs)"
              }}>
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );
}

window.__GAMES__ = window.__GAMES__ || {};
window.__GAMES__.capitales = CapitalesGame;
})();
