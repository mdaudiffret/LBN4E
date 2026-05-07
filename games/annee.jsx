;(function() {
// games/annee.jsx — Devine l'année
const { useState, useEffect, useRef } = React;

const EVENTS = {
  1: [
    { y: 1969, e: "Premiers pas de l'homme sur la Lune" },
    { y: 1977, e: "Sortie du premier film Star Wars" },
    { y: 1989, e: "Chute du mur de Berlin" },
    { y: 1990, e: "Fin de l'apartheid : libération de Nelson Mandela" },
    { y: 1998, e: "Zidane offre la Coupe du Monde à la France en finale contre le Brésil (à domicile)" },
    { y: 2001, e: "Lancement de Wikipédia" },
    { y: 2004, e: "Ouverture de Facebook" },
    { y: 2007, e: "Sortie du premier iPhone" },
    { y: 2012, e: "Felix Baumgartner saute en chute libre depuis la stratosphère" },
    { y: 2015, e: "Accord de Paris sur le climat" },
    { y: 2016, e: "Brexit : référendum au Royaume-Uni" },
    { y: 2019, e: "Première photo d'un trou noir" },
    { y: 1971, e: "Création de Greenpeace" },
    { y: 1981, e: "Sortie du premier PC IBM" },
    { y: 1991, e: "Dissolution de l'URSS" },
    { y: 1994, e: "Inauguration du tunnel sous la Manche" },
    { y: 2000, e: "Explosion de la bulle internet (Dot-com crash)" },
    { y: 2008, e: "Élection de Barack Obama à la présidence des États-Unis" },
    { y: 2020, e: "Début de la pandémie de Covid-19" },
    { y: 1986, e: "Catastrophe nucléaire de Tchernobyl" },
  ],
  2: [
    { y: 1914, e: "Début de la Première Guerre mondiale" },
    { y: 1917, e: "Révolution bolchévique en Russie" },
    { y: 1929, e: "Krach boursier de Wall Street" },
    { y: 1939, e: "Début de la Seconde Guerre mondiale" },
    { y: 1945, e: "Bombardement atomique d'Hiroshima" },
    { y: 1953, e: "Découverte de la structure de l'ADN par Watson et Crick" },
    { y: 1957, e: "Lancement du satellite Spoutnik 1" },
    { y: 1963, e: "Assassinat de John F. Kennedy" },
    { y: 1886, e: "Inauguration de la statue de la Liberté" },
    { y: 1889, e: "Inauguration de la tour Eiffel" },
    { y: 1903, e: "Premier vol motorisé des frères Wright" },
    { y: 1912, e: "Naufrage du Titanic" },
    { y: 1947, e: "Indépendance de l'Inde et du Pakistan" },
    { y: 1969, e: "Premiers pas de l'homme sur la Lune" },
    { y: 1918, e: "Armistice de la Première Guerre mondiale" },
    { y: 1944, e: "Débarquement allié en Normandie" },
    { y: 1961, e: "Construction du mur de Berlin" },
    { y: 1968, e: "Assassinat de Martin Luther King" },
    { y: 1905, e: "Einstein publie la théorie de la relativité restreinte" },
    { y: 1936, e: "Début de la guerre civile espagnole" },
  ],
  3: [
    { y: 1492, e: "Christophe Colomb arrive aux Bahamas" },
    { y: 1453, e: "Chute de Constantinople" },
    { y: 1543, e: "Copernic publie son modèle héliocentrique" },
    { y: 1618, e: "Début de la guerre de Trente Ans" },
    { y: 1666, e: "Grand incendie de Londres" },
    { y: 1687, e: "Newton publie les Principia Mathematica" },
    { y: 1776, e: "Déclaration d'indépendance des États-Unis" },
    { y: 1789, e: "Prise de la Bastille" },
    { y: 1804, e: "Napoléon est sacré empereur des Français" },
    { y: 1815, e: "Bataille de Waterloo" },
    { y: 1348, e: "Arrivée de la Peste noire en France" },
    { y: 1431, e: "Exécution de Jeanne d'Arc à Rouen" },
    { y: 1517, e: "Luther publie ses 95 thèses" },
    { y: 1712, e: "Naissance de Jean-Jacques Rousseau" },
    { y: 1511, e: "Érasme publie l'Éloge de la folie" },
    { y: 1337, e: "Début de la guerre de Cent Ans" },
    { y: 1440, e: "Gutenberg invente l'imprimerie à caractères mobiles" },
    { y: 1610, e: "Galilée observe les lunes de Jupiter avec sa lunette" },
    { y: 1756, e: "Début de la guerre de Sept Ans" },
    { y: 1572, e: "Massacre de la Saint-Barthélemy à Paris" },
  ],
};

const SLIDER = {
  1: { min: 1960, max: 2025, def: 1990 },
  2: { min: 1880, max: 2000, def: 1940 },
  3: { min: 1300, max: 1900, def: 1600 },
};

function AnneeGame({ level, onHud, onFinish }) {
  const TOL = { 1: 10, 2: 5, 3: 2 }[level];
  const slider = SLIDER[level];
  const TOTAL = 6;
  const usedRef = useRef(new Set());

  function pickEventNoRepeat() {
    const pool = EVENTS[level];
    const available = pool.filter((_, i) => !usedRef.current.has(i));
    const pickPool = available.length > 0 ? available : pool;
    const item = pickPool[Math.floor(Math.random() * pickPool.length)];
    const idx = pool.indexOf(item);
    usedRef.current.add(idx);
    return item;
  }

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [q, setQ] = useState(() => pickEventNoRepeat());
  const [val, setVal] = useState(slider.def);
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const timerRef = useRef(null);
  const valRef = useRef(slider.def);

  // Keep valRef in sync so the timer callback can read current slider value
  useEffect(() => { valRef.current = val; }, [val]);

  useEffect(() => {
    setQ(pickEventNoRepeat());
    setVal(slider.def);
    valRef.current = slider.def;
    setFeedback(null);
    setTimeLeft(10);
  }, [round]);

  // Countdown timer — no early return: feedback may still hold last round's value
  useEffect(() => {
    setTimeLeft(10);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          submitValue(valRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [round]);

  useEffect(() => onHud({ score, total: TOTAL }), [score]);

  function submitValue(currentVal) {
    const diff = Math.abs(currentVal - q.y);
    let result;
    if (diff === 0) result = "perfect";
    else if (diff <= TOL) result = "ok";
    else result = "ko";
    setFeedback({ result, diff, year: q.y });
    const newScore = result !== "ko" ? score + 1 : score;
    if (result !== "ko") setScore(newScore);
    setTimeout(() => {
      if (round >= TOTAL) onFinish(newScore);
      else setRound(r => r + 1);
    }, 1600);
  }

  const submit = () => {
    if (feedback) return;
    clearInterval(timerRef.current);
    submitValue(val);
  };

  const mid = Math.round((slider.min + slider.max) / 2);
  const timerColor = timeLeft <= 3 ? "var(--danger)" : "var(--komin-blue)";

  return (
    <div className="col" style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 28 }}>
      <div className="prompt">
        <div className="prompt__instruction" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <span>Manche {round} / {TOTAL} — En quelle année ?</span>
          {!feedback && (
            <span style={{
              fontFamily: "var(--font-brand)", fontWeight: 800,
              fontSize: 28, lineHeight: 1,
              color: timerColor, transition: "color .3s",
              flexShrink: 0
            }}>{timeLeft}</span>
          )}
        </div>
        <div className="prompt__main" style={{ fontSize: 26, maxWidth: 640, margin: "0 auto" }}>{q.e}</div>
      </div>

      {/* Timer bar */}
      {!feedback && (
        <div style={{ width: "100%", maxWidth: 520, height: 4, background: "var(--komin-lightgray)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${(timeLeft / 10) * 100}%`,
            background: timerColor,
            transition: "width 1s linear, background .3s"
          }} />
        </div>
      )}

      <div className="col" style={{ alignItems: "center", gap: 12, width: "100%", maxWidth: 520 }}>
        <div style={{
          fontFamily: "var(--font-brand)", fontWeight: 800,
          fontSize: 64, letterSpacing: "-0.04em",
          color: feedback?.result === "perfect" ? "var(--success)"
                : feedback?.result === "ok"      ? "var(--komin-blue)"
                : feedback?.result === "ko"       ? "var(--danger)"
                : "var(--pearl)"
        }}>
          {val}
        </div>
        <input type="range" min={slider.min} max={slider.max} step="1" value={val}
               onChange={(e) => setVal(Number(e.target.value))}
               disabled={!!feedback}
               style={{ width: "100%", accentColor: "var(--komin-blue)" }} />
        <div className="row" style={{ justifyContent: "space-between", width: "100%", fontSize: 12, color: "var(--secondary-high)" }}>
          <span>{slider.min}</span><span>{mid}</span><span>{slider.max}</span>
        </div>
      </div>

      {!feedback && (
        <button className="k-btn k-btn--brand k-btn--lg" onClick={submit}>Valider</button>
      )}

      {feedback?.result === "perfect" && <div className="feedback ok">Pile dans le mille ! ({feedback.year})</div>}
      {feedback?.result === "ok"      && <div className="feedback ok">Bien vu — c'était {feedback.year} (à {feedback.diff} an{feedback.diff > 1 ? "s" : ""})</div>}
      {feedback?.result === "ko"      && <div className="feedback ko">C'était {feedback.year} ({feedback.diff} ans d'écart)</div>}
    </div>
  );
}

window.__GAMES__ = window.__GAMES__ || {};
window.__GAMES__.annee = AnneeGame;
})();
