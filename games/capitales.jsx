;(function() {
// games/capitales.jsx — Capitales du monde
const { useState, useEffect, useRef } = React;

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
    { p: "Turquie",          c: "Ankara",        distractors: ["Istanbul", "Izmir", "Bursa", "Adana"] },
    { p: "Nouvelle-Zélande", c: "Wellington",    distractors: ["Auckland", "Christchurch", "Dunedin", "Hamilton"] },
    { p: "Pakistan",         c: "Islamabad",     distractors: ["Karachi", "Lahore", "Peshawar", "Quetta"] },
    { p: "Afrique du Sud",   c: "Pretoria",      distractors: ["Le Cap", "Johannesburg", "Durban", "Bloemfontein"] },
    { p: "Kazakhstan",       c: "Astana",        distractors: ["Almaty", "Chimkent", "Karaganda", "Actobe"] },
    { p: "Suède",            c: "Stockholm",     distractors: ["Göteborg", "Malmö", "Uppsala", "Örebro"] },
    { p: "Norvège",          c: "Oslo",          distractors: ["Bergen", "Trondheim", "Stavanger", "Tromsø"] },
    { p: "Pologne",          c: "Varsovie",      distractors: ["Cracovie", "Łódź", "Wrocław", "Poznań"] },
    { p: "Grèce",            c: "Athènes",       distractors: ["Thessalonique", "Patras", "Héraklion", "Larissa"] },
    { p: "Russie",           c: "Moscou",        distractors: ["Saint-Pétersbourg", "Novossibirsk", "Ekaterinbourg", "Kazan"] },
    { p: "Argentine",        c: "Buenos Aires",  distractors: ["Córdoba", "Rosario", "Mendoza", "Tucumán"] },
    { p: "Égypte",           c: "Le Caire",      distractors: ["Alexandrie", "Louxor", "Assouan", "Port-Saïd"] },
    { p: "Myanmar",          c: "Naypyidaw",     distractors: ["Rangoon", "Mandalay", "Pagan", "Mawlamyine"] },
    { p: "Nigeria",          c: "Abuja",         distractors: ["Lagos", "Kano", "Ibadan", "Port Harcourt"] },
  ],
  // Niveau 3 : capitales obscures ou très contre-intuitives
  3: [
    { p: "Bolivie",          c: "Sucre",         distractors: ["La Paz", "Santa Cruz", "Cochabamba", "Oruro", "Potosí"] },
    { p: "Bhoutan",          c: "Thimphou",      distractors: ["Paro", "Punakha", "Wangdue", "Trongsa", "Bumthang"] },
    { p: "Mongolie",         c: "Oulan-Bator",   distractors: ["Erdenet", "Darkhan", "Choibalsan", "Ölgii", "Khovd"] },
    { p: "Burkina Faso",     c: "Ouagadougou",   distractors: ["Bobo-Dioulasso", "Koudougou", "Banfora", "Ouahigouya", "Tenkodogo"] },
    { p: "Madagascar",       c: "Antananarivo",  distractors: ["Toamasina", "Mahajanga", "Fianarantsoa", "Toliara", "Antsiranana"] },
    { p: "Géorgie",          c: "Tbilissi",      distractors: ["Batoumi", "Koutaïssi", "Roustavi", "Zougdidi", "Gori"] },
    { p: "Slovénie",         c: "Ljubljana",     distractors: ["Maribor", "Celje", "Kranj", "Velenje", "Koper"] },
    { p: "Sri Lanka",        c: "Sri Jayewardenepura Kotte", distractors: ["Colombo", "Kandy", "Galle", "Jaffna", "Trincomalee"] },
    { p: "Namibie",          c: "Windhoek",      distractors: ["Walvis Bay", "Swakopmund", "Lüderitz", "Oshakati", "Rundu"] },
    { p: "Cambodge",         c: "Phnom Penh",    distractors: ["Siem Reap", "Battambang", "Sihanoukville", "Kampot", "Kratie"] },
    { p: "Népal",            c: "Katmandou",     distractors: ["Pokhara", "Bhaktapur", "Lalitpur", "Birgunj", "Biratnagar"] },
    { p: "Érythrée",         c: "Asmara",        distractors: ["Massawa", "Keren", "Assab", "Mendefera", "Barentu"] },
    { p: "Laos",             c: "Vientiane",     distractors: ["Luang Prabang", "Pakse", "Savannakhet", "Xam Neua", "Thakhek"] },
    { p: "Lettonie",         c: "Riga",          distractors: ["Daugavpils", "Liepāja", "Jūrmala", "Jelgava", "Rēzekne"] },
  ]
};

function pickCapitale(level, usedSet, numChoices) {
  const pool = CAPITALES[level];
  const available = pool.filter(x => !usedSet.has(x.p));
  const pickPool = available.length > 0 ? available : pool;
  const item = pickPool[Math.floor(Math.random() * pickPool.length)];
  usedSet.add(item.p);

  // Build distractors: explicit ones first, then fill from same-level pool capitals
  const distractors = [...(item.distractors || []).slice(0, numChoices - 1)];
  const samePool = pool
    .filter(x => x.c !== item.c && !distractors.includes(x.c))
    .sort(() => Math.random() - 0.5);
  for (const x of samePool) {
    if (distractors.length >= numChoices - 1) break;
    distractors.push(x.c);
  }
  const choices = [item.c, ...distractors.slice(0, numChoices - 1)].sort(() => Math.random() - 0.5);
  return { item, choices };
}

function CapitalesGame({ level, onHud, onFinish }) {
  const TOTAL = 8;
  const numChoices = level === 1 ? 4 : level === 2 ? 5 : 6;
  const usedRef = useRef(new Set());

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [q, setQ] = useState(() => pickCapitale(level, usedRef.current, numChoices));
  const [picked, setPicked] = useState(null);
  const [timeLeft, setTimeLeft] = useState(5);
  const timerRef = useRef(null);

  function advance(currentScore) {
    clearInterval(timerRef.current);
    if (round >= TOTAL) {
      onFinish(currentScore);
    } else {
      setRound(r => r + 1);
    }
  }

  useEffect(() => {
    setQ(pickCapitale(level, usedRef.current, numChoices));
    setPicked(null);
    setTimeLeft(5);
  }, [round]);

  // Countdown timer
  useEffect(() => {
    if (picked) return;
    setTimeLeft(5);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setPicked("__timeout__");
          setTimeout(() => advance(score), 1100);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [round]);

  useEffect(() => onHud({ score, total: TOTAL }), [score]);

  const choose = (cap) => {
    if (picked) return;
    clearInterval(timerRef.current);
    setPicked(cap);
    const ok = cap === q.item.c;
    const newScore = ok ? score + 1 : score;
    if (ok) setScore(newScore);
    setTimeout(() => advance(newScore), 1100);
  };

  const timerColor = timeLeft <= 2 ? "var(--danger)" : "var(--komin-blue)";

  // Grid layout: 2 cols for 4 choices, 2 cols for 5–6 choices too (last may span)
  const gridCols = numChoices <= 4 ? "repeat(2, 1fr)" : "repeat(2, 1fr)";

  return (
    <div className="col" style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 24 }}>
      <div className="prompt" style={{ position: "relative" }}>
        <div className="prompt__instruction">Manche {round} / {TOTAL} — Capitale de</div>
        <div className="prompt__main">{q.item.p}</div>
        {/* Countdown */}
        <div style={{
          position: "absolute", top: 0, right: 0,
          fontFamily: "var(--font-brand)", fontWeight: 800,
          fontSize: 28, lineHeight: 1,
          color: timerColor,
          transition: "color .3s",
          minWidth: 32, textAlign: "right"
        }}>
          {picked ? "" : timeLeft}
        </div>
      </div>

      {/* Timer bar */}
      {!picked && (
        <div style={{ width: "100%", maxWidth: 480, height: 4, background: "var(--komin-lightgray)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${(timeLeft / 5) * 100}%`,
            background: timerColor,
            transition: "width 1s linear, background .3s"
          }} />
        </div>
      )}

      {picked === "__timeout__" && (
        <div className="feedback ko" style={{ marginBottom: 0 }}>
          Temps écoulé — c'était {q.item.c}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 12, width: "100%", maxWidth: 480 }}>
        {q.choices.map((c, idx) => {
          const isCorrect = c === q.item.c;
          const isPicked = picked === c;
          let bg = "var(--char-2)", color = "var(--pearl)", border = "var(--komin-lightgray)";
          if (picked) {
            if (isCorrect) { bg = "var(--komin-lightgreen)"; color = "var(--success)"; border = "var(--success)"; }
            else if (isPicked) { bg = "var(--komin-lightred)"; color = "var(--danger)"; border = "var(--danger)"; }
          }
          // If odd number of choices, last item spans both columns
          const spanStyle = (numChoices % 2 !== 0 && idx === q.choices.length - 1)
            ? { gridColumn: "1 / -1" }
            : {};
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
                boxShadow: "var(--shadow-xs)",
                ...spanStyle
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
