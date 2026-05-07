// components/jeux.jsx — Page des 9 mini-jeux LBN4E
/* global React */


const GAMES_LIST = [
  { id: "memoire",    num: "01", cat: "Logique",  title: "Mémoire flash",
    desc: "Reproduis la séquence de couleurs dans le bon ordre. 10 secondes par séquence.",
    levels: [
      { lv: 1, label: "Enfant",  hint: "4 couleurs · 10s/séquence",  maxTime: 60,  target: 4, total: 4 },
      { lv: 2, label: "Adulte",  hint: "6 couleurs · 10s/séquence",  maxTime: 90,  target: 6, total: 6 },
      { lv: 3, label: "Maître",  hint: "8 couleurs · 10s/séquence",  maxTime: 120, target: 8, total: 8 }
    ]
  },
  { id: "suite",      num: "02", cat: "Logique",  title: "Suite logique",
    desc: "Trouve le nombre qui complète la suite. 1 minute pour tout résoudre.",
    levels: [
      { lv: 1, label: "Enfant",  hint: "5 suites · 1:00",  maxTime: 120, target: 3, total: 5 },
      { lv: 2, label: "Adulte",  hint: "5 suites · 1:00",  maxTime: 120, target: 3, total: 5 },
      { lv: 3, label: "Maître",  hint: "5 suites · 1:00",  maxTime: 120, target: 3, total: 5 }
    ]
  },
  { id: "anagrammes", num: "03", cat: "Logique",  title: "Anagrammes",
    desc: "Remets les lettres dans l'ordre pour former un mot. 1 minute pour tout résoudre.",
    levels: [
      { lv: 1, label: "Enfant",  hint: "5 mots · 1:00",  maxTime: 120, target: 3, total: 5 },
      { lv: 2, label: "Adulte",  hint: "5 mots · 1:00",  maxTime: 120, target: 3, total: 5 },
      { lv: 3, label: "Maître",  hint: "5 mots · 1:00",  maxTime: 120, target: 3, total: 5 }
    ]
  },
  { id: "reflexes",   num: "04", cat: "Adresse",  title: "Réflexes",
    desc: "Clique dès que la cible passe au vert. L'objectif est une moyenne de temps de réaction suffisamment basse.",
    levels: [
      { lv: 1, label: "Enfant",  hint: "Moy. < 500 ms",                  maxTime: 60, target: 5, total: 5 },
      { lv: 2, label: "Adulte",  hint: "Moy. < 400 ms · délai aléatoire", maxTime: 60, target: 5, total: 5 },
      { lv: 3, label: "Maître",  hint: "Moy. < 300 ms · feintes rouges",  maxTime: 60, target: 5, total: 5 }
    ]
  },
  { id: "cible",      num: "05", cat: "Adresse",  title: "Cible mobile",
    desc: "Touche un maximum de cibles en 30s. Au niveau 3, les cibles rouges font perdre un point.",
    levels: [
      { lv: 1, label: "Enfant",  hint: "≥ 15 cibles · 30s",               maxTime: 35, target: 15, total: 50 },
      { lv: 2, label: "Adulte",  hint: "≥ 30 cibles · 30s",               maxTime: 35, target: 30, total: 60 },
      { lv: 3, label: "Maître",  hint: "≥ 45 cibles · leurres rouges −1", maxTime: 35, target: 45, total: 70 }
    ]
  },
  { id: "tempo",      num: "06", cat: "Adresse",  title: "Tap-tempo",
    desc: "Tape 10 fois en suivant le point clignotant au rythme imposé.",
    levels: [
      { lv: 1, label: "Enfant",  hint: "60 BPM · ±220 ms",                      maxTime: 60, target: 60, total: 100 },
      { lv: 2, label: "Adulte",  hint: "90 BPM · repère masqué après 5 taps",   maxTime: 60, target: 70, total: 100 },
      { lv: 3, label: "Maître",  hint: "120 BPM · repère masqué après 2 taps",  maxTime: 60, target: 80, total: 100 }
    ]
  },
  { id: "drapeaux",   num: "07", cat: "Culture",  title: "Drapeaux",
    desc: "Identifie le pays correspondant au drapeau affiché. 5 secondes par question.",
    levels: [
      { lv: 1, label: "Enfant",  hint: "4 choix · 5s/question",  maxTime: 60, target: 6, total: 8 },
      { lv: 2, label: "Adulte",  hint: "6 choix · 5s/question",  maxTime: 60, target: 6, total: 8 },
      { lv: 3, label: "Maître",  hint: "6 choix · 5s/question",  maxTime: 60, target: 6, total: 8 }
    ]
  },
  { id: "capitales",  num: "08", cat: "Culture",  title: "Capitales",
    desc: "Quelle est la capitale de ce pays ? 5 secondes par question.",
    levels: [
      { lv: 1, label: "Enfant",  hint: "4 choix · 5s/question",  maxTime: 60, target: 6, total: 8 },
      { lv: 2, label: "Adulte",  hint: "5 choix · 5s/question",  maxTime: 60, target: 6, total: 8 },
      { lv: 3, label: "Maître",  hint: "6 choix · 5s/question",  maxTime: 60, target: 6, total: 8 }
    ]
  },
  { id: "annee",      num: "09", cat: "Culture",  title: "Devine l'année",
    desc: "Devine l'année d'un événement célèbre à quelques années près. 5 secondes par question.",
    levels: [
      { lv: 1, label: "Enfant",  hint: "1960–2025 · ±10 ans · 10s/q",  maxTime: 90, target: 4, total: 6 },
      { lv: 2, label: "Adulte",  hint: "1880–2000 · ±5 ans · 10s/q",   maxTime: 90, target: 4, total: 6 },
      { lv: 3, label: "Maître",  hint: "1300–1900 · ±2 ans · 10s/q",   maxTime: 90, target: 4, total: 6 }
    ]
  },
];

const JEUX_CATS = [
  { id: "all",      label: "Tous" },
  { id: "Logique",  label: "Logique" },
  { id: "Adresse",  label: "Adresse" },
  { id: "Culture",  label: "Culture G." },
];

function indiceKey(gameId, lv) { return `${gameId}-${lv}`; }


function formatJeuxTime(s) {
  if (s == null) return "—";
  if (s < 60) return `${Math.round(s)}s`;
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, "0")}`;
}

// ── Baroque ornaments ─────────────────────────────────────────────
function JeuxOrnament({ seed }) {
  const variants = [OrnA, OrnB, OrnC, OrnD];
  return React.createElement(variants[(seed || 0) % 4]);
}

function OrnA() {
  return (
    <svg viewBox="0 0 240 200" className="jcard__ornament" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="joa" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D4A24C" stopOpacity="0.6"/>
          <stop offset="1" stopColor="#8C6E26" stopOpacity="0.2"/>
        </linearGradient>
      </defs>
      <rect x="20" y="22" width="200" height="156" fill="none" stroke="url(#joa)" strokeWidth="1"/>
      <rect x="26" y="28" width="188" height="144" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 3"/>
      <ellipse cx="120" cy="100" rx="76" ry="60" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6"/>
      <ellipse cx="120" cy="100" rx="68" ry="52" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.4"/>
      <path d="M70 30 Q90 14 120 22 Q150 14 170 30" stroke="currentColor" strokeWidth="0.8" fill="none"/>
      <circle cx="120" cy="22" r="2.5" fill="currentColor" opacity="0.7"/>
      <path d="M20 100 Q4 80 14 60 Q26 70 30 90" stroke="currentColor" strokeWidth="0.7" fill="none"/>
      <path d="M220 100 Q236 80 226 60 Q214 70 210 90" stroke="currentColor" strokeWidth="0.7" fill="none"/>
      <path d="M20 100 Q4 120 14 140 Q26 130 30 110" stroke="currentColor" strokeWidth="0.7" fill="none"/>
      <path d="M220 100 Q236 120 226 140 Q214 130 210 110" stroke="currentColor" strokeWidth="0.7" fill="none"/>
      <path d="M70 170 Q90 186 120 178 Q150 186 170 170" stroke="currentColor" strokeWidth="0.8" fill="none"/>
      <circle cx="120" cy="178" r="2" fill="currentColor" opacity="0.7"/>
    </svg>
  );
}

function OrnB() {
  return (
    <svg viewBox="0 0 240 200" className="jcard__ornament" preserveAspectRatio="xMidYMid meet">
      <path d="M30 28 Q30 16 42 16 L60 16" stroke="currentColor" strokeWidth="0.8" fill="none"/>
      <path d="M210 28 Q210 16 198 16 L180 16" stroke="currentColor" strokeWidth="0.8" fill="none"/>
      <path d="M30 172 Q30 184 42 184 L60 184" stroke="currentColor" strokeWidth="0.8" fill="none"/>
      <path d="M210 172 Q210 184 198 184 L180 184" stroke="currentColor" strokeWidth="0.8" fill="none"/>
      <line x1="65" y1="16" x2="115" y2="16" stroke="currentColor" strokeWidth="0.6"/>
      <line x1="125" y1="16" x2="175" y2="16" stroke="currentColor" strokeWidth="0.6"/>
      <line x1="65" y1="184" x2="115" y2="184" stroke="currentColor" strokeWidth="0.6"/>
      <line x1="125" y1="184" x2="175" y2="184" stroke="currentColor" strokeWidth="0.6"/>
      <path d="M120 12 L124 16 L120 20 L116 16 Z" fill="currentColor" opacity="0.7"/>
      <path d="M120 180 L124 184 L120 188 L116 184 Z" fill="currentColor" opacity="0.7"/>
      <circle cx="120" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 4" opacity="0.5"/>
      <circle cx="120" cy="100" r="44" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.35"/>
      <path d="M40 40 Q56 44 60 60 Q44 56 40 40 Z" stroke="currentColor" strokeWidth="0.6" fill="none"/>
      <path d="M200 40 Q184 44 180 60 Q196 56 200 40 Z" stroke="currentColor" strokeWidth="0.6" fill="none"/>
      <path d="M40 160 Q56 156 60 140 Q44 144 40 160 Z" stroke="currentColor" strokeWidth="0.6" fill="none"/>
      <path d="M200 160 Q184 156 180 140 Q196 144 200 160 Z" stroke="currentColor" strokeWidth="0.6" fill="none"/>
    </svg>
  );
}

function OrnC() {
  const rays = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const x1 = 120 + Math.cos(a) * 64, y1 = 100 + Math.sin(a) * 54;
    const x2 = 120 + Math.cos(a) * (i % 2 === 0 ? 88 : 78);
    const y2 = 100 + Math.sin(a) * (i % 2 === 0 ? 78 : 70);
    rays.push(<line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="0.5" opacity="0.45"/>);
  }
  return (
    <svg viewBox="0 0 240 200" className="jcard__ornament" preserveAspectRatio="xMidYMid meet">
      <rect x="14" y="14" width="212" height="172" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5"/>
      <ellipse cx="120" cy="100" rx="64" ry="54" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.55"/>
      {rays}
      {[...Array(8)].map((_, i) => {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
        return <circle key={i} cx={120 + Math.cos(a) * 72} cy={100 + Math.sin(a) * 62} r="1.2" fill="currentColor" opacity="0.7"/>;
      })}
    </svg>
  );
}

function OrnD() {
  return (
    <svg viewBox="0 0 240 200" className="jcard__ornament" preserveAspectRatio="xMidYMid meet">
      <path d="M30 50 C 50 24,100 24,120 50 C 140 24,190 24,210 50" stroke="currentColor" strokeWidth="0.9" fill="none"/>
      <path d="M30 150 C 50 176,100 176,120 150 C 140 176,190 176,210 150" stroke="currentColor" strokeWidth="0.9" fill="none"/>
      <rect x="56" y="76" width="128" height="48" fill="none" stroke="currentColor" strokeWidth="0.6"/>
      <rect x="60" y="80" width="120" height="40" fill="none" stroke="currentColor" strokeWidth="0.4" strokeDasharray="2 3"/>
      <circle cx="120" cy="50" r="2" fill="currentColor" opacity="0.7"/>
      <circle cx="120" cy="150" r="2" fill="currentColor" opacity="0.7"/>
      <path d="M22 100 q-10-14 4-28" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.65"/>
      <path d="M218 100 q10-14-4-28" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.65"/>
      <path d="M22 100 q-10 14 4 28" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.65"/>
      <path d="M218 100 q10 14-4 28" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.65"/>
    </svg>
  );
}

function JeuxCorner() {
  return (
    <svg viewBox="0 0 28 28" width="20" height="20" fill="none">
      <path d="M2 14 Q2 2 14 2" stroke="currentColor" strokeWidth="1"/>
      <path d="M5 14 Q5 5 14 5" stroke="currentColor" strokeWidth="0.6" opacity="0.7"/>
      <circle cx="2" cy="14" r="1.2" fill="currentColor"/>
      <circle cx="14" cy="2" r="1.2" fill="currentColor"/>
    </svg>
  );
}

// ── HUD ───────────────────────────────────────────────────────────
function PlayHud({ time, score, total }) {
  return (
    <div className="play__hud">
      {time != null && (
        <div className="hud-stat">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <span className="v tnum">{formatJeuxTime(time)}</span>
        </div>
      )}
      {score != null && (
        <div className="hud-stat">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polygon points="12 2 15 8.5 22 9.3 17 14 18.2 21 12 17.8 5.8 21 7 14 2 9.3 9 8.5 12 2"/>
          </svg>
          <span className="v tnum">{score}{total != null ? ` / ${total}` : ""}</span>
        </div>
      )}
    </div>
  );
}

// ── Indice card ───────────────────────────────────────────────────
function JeuxIndiceCard({ game, level, justUnlocked, indiceText }) {
  return (
    <div className="jeux-indice-card">
      <div className="jeux-indice-card__label">
        {justUnlocked ? "★ Indice débloqué" : "Indice"}
      </div>
      <div className="jeux-indice-card__code">
        {game.num}<span className="lv">·{level}</span>
      </div>
      {indiceText
        ? <div className="jeux-indice-card__text">{indiceText}</div>
        : <div className="jeux-indice-card__text jeux-indice-card__placeholder">
            Note ce code — il fera partie du puzzle final.
          </div>
      }
    </div>
  );
}

// ── Game card ─────────────────────────────────────────────────────
function JeuxCard({ game, indices, onOpen }) {
  const unlocked = game.levels.map(lv => !!indices[indiceKey(game.id, lv.lv)]);
  return (
    <div className="jcard" onClick={onOpen}>
      <div className="jcard__cover">
        <JeuxOrnament seed={parseInt(game.num, 10) - 1} />
        <div className="jcard__corner tl"><JeuxCorner /></div>
        <div className="jcard__corner tr"><JeuxCorner /></div>
        <div className="jcard__corner bl"><JeuxCorner /></div>
        <div className="jcard__corner br"><JeuxCorner /></div>
        <div className="jcard__pips">
          {unlocked.map((u, i) => (
            <span key={i} className={`jcard__pip${u ? " on" : ""}`} title={`Indice niveau ${i+1}`}/>
          ))}
        </div>
        <div className="jcard__num">{game.num}</div>
      </div>
      <div className="jcard__body">
        <span className="jcard__cat">{game.cat}</span>
        <h3 className="jcard__title">{game.title}</h3>
        <p className="jcard__desc">{game.desc}</p>
      </div>
    </div>
  );
}

// ── Play overlay ──────────────────────────────────────────────────
function JeuxPlayView({ game, onClose, indices, unlockIndice, jeuxIndices }) {
  const [level, setLevel] = React.useState(1);
  const [hud, setHud] = React.useState({ time: null, score: null, total: null });
  const [runKey, setRunKey] = React.useState(0);
  const [runStart, setRunStart] = React.useState(() => performance.now());
  const [finished, setFinished] = React.useState(null);

  // Babel standalone compiles scripts async — poll until the game registers
  const [Game, setGame] = React.useState(() => window.__GAMES__ && window.__GAMES__[game.id]);
  React.useEffect(() => {
    if (Game) return;
    const iv = setInterval(() => {
      const g = window.__GAMES__ && window.__GAMES__[game.id];
      if (g) { setGame(() => g); clearInterval(iv); }
    }, 150);
    return () => clearInterval(iv);
  }, [game.id, Game]);

  const lvData = game.levels.find(l => l.lv === level);

  const restart = React.useCallback(() => {
    setRunKey(k => k + 1);
    setRunStart(performance.now());
    setFinished(null);
  }, []);

  const finish = React.useCallback((finalScore) => {
    if (!lvData) return;
    const elapsed = (performance.now() - runStart) / 1000;
    const okScore = finalScore >= lvData.target;
    const okTime = elapsed <= lvData.maxTime;
    const earned = okScore && okTime;
    const key = indiceKey(game.id, level);
    const already = !!indices[key];
    if (earned && !already) unlockIndice(key);
    setFinished({ score: finalScore, lv: level, earned, okScore, okTime, elapsed, alreadyHad: already });
  }, [lvData, runStart, level, game.id, indices, unlockIndice]);

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const getIndiceText = (lv) => (jeuxIndices || {})[indiceKey(game.id, lv)] || "";

  return (
    <div className="play-overlay" onClick={(e) => { if (e.target.classList.contains("play-overlay")) onClose(); }}>
      <div className="play">

        {/* Top bar */}
        <div className="play__top">
          <div className="play__top-left">
            <div className="play__num-tiny">{game.num}</div>
            <div>
              <div className="play__title">{game.title}</div>
              <div style={{ fontSize: 10, color: "var(--gold)", marginTop: 2, fontFamily: "var(--font-mono)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                {game.cat} · {lvData?.hint}
              </div>
            </div>
          </div>
          <button className="play__close" onClick={onClose} aria-label="Fermer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Level selector */}
        <div className="play__diff-bar">
          {game.levels.map((lv) => {
            const isUnlocked = !!indices[indiceKey(game.id, lv.lv)];
            return (
              <button
                key={lv.lv}
                className={`diff-tab${level === lv.lv ? " is-active" : ""}${isUnlocked ? " is-unlocked" : ""}`}
                onClick={() => { setLevel(lv.lv); restart(); }}
              >
                <span className="lvnum">{lv.lv}</span>
                {lv.label}
              </button>
            );
          })}
          <PlayHud time={hud.time} score={hud.score} total={hud.total} />
        </div>

        {/* Objectives */}
        <div className="play__targets">
          <span>Objectif :</span>
          <span><b>{lvData.target}</b>/{lvData.total} pts</span>
          <span style={{ opacity: 0.35 }}>·</span>
          <span>Max : <b>{formatJeuxTime(lvData.maxTime)}</b></span>
          <span style={{ opacity: 0.35 }}>·</span>
          <span>Récompense : <b>indice {game.num}·{level}</b></span>
        </div>

        {/* Game body */}
        <div className="play__body">
          {finished ? (
            <div className="result">
              <div className="result__big">{finished.score}</div>
              <div className="result__label">Score · niveau {finished.lv}</div>

              {finished.earned && !finished.alreadyHad && (
                <>
                  <div className="result__msg">⚜ Indice débloqué !</div>
                  <JeuxIndiceCard game={game} level={finished.lv} justUnlocked indiceText={getIndiceText(finished.lv)} />
                </>
              )}
              {finished.earned && finished.alreadyHad && (
                <>
                  <div className="result__msg">Déjà validé ⚜</div>
                  <JeuxIndiceCard game={game} level={finished.lv} indiceText={getIndiceText(finished.lv)} />
                </>
              )}
              {!finished.earned && (
                <div style={{ marginBottom: 16, textAlign: "center" }}>
                  <div className="feedback ko" style={{ marginBottom: 12 }}>
                    {!finished.okScore && `Score ${finished.score} < ${lvData.target}`}
                    {!finished.okScore && !finished.okTime && " · "}
                    {!finished.okTime && `Temps ${Math.round(finished.elapsed)}s > ${lvData.maxTime}s`}
                  </div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    Atteins l'objectif pour débloquer l'indice {game.num}·{finished.lv}.
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
                <button className="k-btn k-btn--brand k-btn--lg" onClick={restart}>Rejouer</button>
                <button className="k-btn k-btn--outline k-btn--lg" onClick={onClose}>Fermer</button>
              </div>
            </div>
          ) : Game ? (
            <Game key={runKey} level={level} onHud={setHud} onFinish={finish} onRestart={restart} />
          ) : (
            <div className="muted center" style={{ padding: "40px 0", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.2em" }}>
              Chargement…
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="play__footer">
          <button className="k-btn k-btn--sm k-btn--outline" onClick={restart}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
            Recommencer
          </button>
          <div className="muted" style={{ fontSize: 11 }}>Échap pour fermer</div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────
function JeuxPage({ data }) {
  const [filter, setFilter] = React.useState("all");
  const [openId, setOpenId] = React.useState(null);
  const [indices, setIndices] = React.useState({});

  const unlockIndice = (key) => {
    setIndices((prev) => ({ ...prev, [key]: { at: Date.now() } }));
  };

  const filtered = React.useMemo(
    () => filter === "all" ? GAMES_LIST : GAMES_LIST.filter(g => g.cat === filter),
    [filter]
  );

  const counts = React.useMemo(() => {
    const c = { all: GAMES_LIST.length };
    for (const g of GAMES_LIST) c[g.cat] = (c[g.cat] || 0) + 1;
    return c;
  }, []);

  const open = openId ? GAMES_LIST.find(g => g.id === openId) : null;
  const jeuxIndices = data.jeuxIndices || {};

  return (
    <div className="page jeux-page">
      <div className="shell">

        {/* Header */}
        <div className="jeux-header">
          <div className="eyebrow">⚜ Tournoi · 9 épreuves</div>
          <h1 className="page-title">Les Jeux du <em>Chasteau</em></h1>
          <p className="page-subtitle">
            Remporte chaque épreuve pour débloquer les 27 indices qui éclairent les neuf codes du puzzle final.
            Trois niveaux par jeu — du plus clément au plus ardu.
          </p>
          <p className="page-subtitle" style={{ marginTop: 10 }}>
            ⚠ Les indices sont des <em>aides</em> aux énigmes, pas des substituts — résoudre l'énigme reste indispensable.
            Joue au bon moment : le jeu <strong>n°1</strong> donne des indices sur le <strong>code n°1</strong>,
            le jeu <strong>n°2</strong> sur le <strong>code n°2</strong>, et ainsi de suite.
            Mieux vaut jouer face à l'énigme concernée.
          </p>
        </div>

        {/* Category filter */}
        <div className="jeux-filter-row">
          <span className="label">Catégorie</span>
          {JEUX_CATS.map(cat => (
            <button
              key={cat.id}
              className={`jchip${filter === cat.id ? " is-active" : ""}`}
              onClick={() => setFilter(cat.id)}
            >
              {cat.label}
              <span className="count">{counts[cat.id] || 0}</span>
            </button>
          ))}
        </div>

        {/* Cards grid */}
        <div className="jeux-grid">
          {filtered.map(g => (
            <JeuxCard key={g.id} game={g} indices={indices} onOpen={() => setOpenId(g.id)} />
          ))}
        </div>
      </div>

      {/* Play overlay */}
      {open && (
        <JeuxPlayView
          game={open}
          onClose={() => setOpenId(null)}
          indices={indices}
          unlockIndice={unlockIndice}
          jeuxIndices={jeuxIndices}
        />
      )}
    </div>
  );
}

window.JeuxPage = JeuxPage;
