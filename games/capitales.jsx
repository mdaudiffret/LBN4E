;(function() {
// games/capitales.jsx — Capitales du monde
const { useState, useEffect } = React;

const CAPITALES = {
  // Niveau 1 : pays connus, mais capitale ≠ plus grande ville → pièges classiques
  1: [
    { p: "France",       c: "Paris" },
    { p: "Espagne",      c: "Madrid" },
    { p: "Japon",        c: "Tokyo" },
    { p: "Suisse",       c: "Berne",      distractors: ["Zurich", "Genève", "Lausanne"] },
    { p: "Pays-Bas",     c: "Amsterdam",  distractors: ["La Haye", "Rotterdam", "Utrecht"] },
    { p: "Australie",    c: "Canberra",   distractors: ["Sydney", "Melbourne", "Brisbane"] },
    { p: "Canada",       c: "Ottawa",     distractors: ["Toronto", "Montréal", "Vancouver"] },
    { p: "États-Unis",   c: "Washington", distractors: ["New York", "Los Angeles", "Chicago"] },
    { p: "Brésil",       c: "Brasília",   distractors: ["Rio de Janeiro", "São Paulo", "Salvador"] },
    { p: "Maroc",        c: "Rabat",      distractors: ["Casablanca", "Marrakech", "Fès"] },
    { p: "Inde",         c: "New Delhi",  distractors: ["Mumbai", "Calcutta", "Bangalore"] },
    { p: "Chine",        c: "Pékin",      distractors: ["Shanghai", "Shenzhen", "Guangzhou"] },
  ],
  // Niveau 2 : capitales moins évidentes, distracteurs plus piégeux
  2: [
    { p: "Turquie",          c: "Ankara",        distractors: ["Istanbul", "Izmir", "Bursa"] },
    { p: "Nouvelle-Zélande", c: "Wellington",    distractors: ["Auckland", "Christchurch", "Dunedin"] },
    { p: "Pakistan",         c: "Islamabad",     distractors: ["Karachi", "Lahore", "Peshawar"] },
    { p: "Afrique du Sud",   c: "Pretoria",      distractors: ["Le Cap", "Johannesburg", "Durban"] },
    { p: "Kazakhstan",       c: "Astana",        distractors: ["Almaty", "Chimkent", "Karaganda"] },
    { p: "Suède",            c: "Stockholm" },
    { p: "Norvège",          c: "Oslo" },
    { p: "Pologne",          c: "Varsovie" },
    { p: "Grèce",            c: "Athènes" },
    { p: "Russie",           c: "Moscou",        distractors: ["Saint-Pétersbourg", "Novossibirsk", "Ekaterinbourg"] },
    { p: "Argentine",        c: "Buenos Aires" },
    { p: "Égypte",           c: "Le Caire",      distractors: ["Alexandrie", "Louxor", "Assouan"] },
    { p: "Myanmar",          c: "Naypyidaw",     distractors: ["Rangoon", "Mandalay", "Pagan"] },
    { p: "Nigeria",          c: "Abuja",         distractors: ["Lagos", "Kano", "Ibadan"] },
  ],
  // Niveau 3 : capitales obscures ou très contre-intuitives
  3: [
    { p: "Bolivie",          c: "Sucre",         distractors: ["La Paz", "Santa Cruz", "Cochabamba"] },
    { p: "Bhoutan",          c: "Thimphou",      distractors: ["Paro", "Punakha", "Wangdue"] },
    { p: "Mongolie",         c: "Oulan-Bator",   distractors: ["Erdenet", "Darkhan", "Choibalsan"] },
    { p: "Burkina Faso",     c: "Ouagadougou",   distractors: ["Bobo-Dioulasso", "Koudougou", "Banfora"] },
    { p: "Madagascar",       c: "Antananarivo",  distractors: ["Toamasina", "Mahajanga", "Fianarantsoa"] },
    { p: "Géorgie",          c: "Tbilissi",      distractors: ["Batoumi", "Koutaïssi", "Roustavi"] },
    { p: "Slovénie",         c: "Ljubljana",     distractors: ["Maribor", "Celje", "Kranj"] },
    { p: "Sri Lanka",        c: "Sri Jayewardenepura Kotte", distractors: ["Colombo", "Kandy", "Galle"] },
    { p: "Namibie",          c: "Windhoek",      distractors: ["Walvis Bay", "Swakopmund", "Lüderitz"] },
    { p: "Cambodge",         c: "Phnom Penh",    distractors: ["Siem Reap", "Battambang", "Sihanoukville"] },
    { p: "Népal",            c: "Katmandou",     distractors: ["Pokhara", "Bhaktapur", "Lalitpur"] },
    { p: "Érythrée",         c: "Asmara",        distractors: ["Massawa", "Keren", "Assab"] },
    { p: "Laos",             c: "Vientiane",     distractors: ["Luang Prabang", "Pakse", "Savannakhet"] },
    { p: "Lettonie",         c: "Riga",          distractors: ["Daugavpils", "Liepāja", "Jūrmala"] },
  ]
};

function pickCapitale(level) {
  const pool = CAPITALES[level];
  const item = pool[Math.floor(Math.random() * pool.length)];
  // Build distractors: explicit ones first, then fill from same-level pool
  const distractors = [...(item.distractors || []).slice(0, 3)];
  const samePool = pool
    .filter(x => x.c !== item.c && !distractors.includes(x.c))
    .sort(() => Math.random() - 0.5);
  for (const x of samePool) {
    if (distractors.length >= 3) break;
    distractors.push(x.c);
  }
  const choices = [item.c, ...distractors.slice(0, 3)].sort(() => Math.random() - 0.5);
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
                fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 16,
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
