;(function() {
// games/annee.jsx — Devine l'année
const { useState, useEffect } = React;

const EVENTS = {
  1: [
    { y: 1969, e: "Premiers pas de l'homme sur la Lune" },
    { y: 1977, e: "Sortie du premier film Star Wars" },
    { y: 1989, e: "Chute du mur de Berlin" },
    { y: 1990, e: "Fin de l'apartheid : libération de Nelson Mandela" },
    { y: 1998, e: "La France gagne la Coupe du monde de football" },
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
    { y: 1969, e: "Premiers pas de l'homme sur la Lune" },
    { y: 1886, e: "Inauguration de la statue de la Liberté" },
    { y: 1889, e: "Inauguration de la tour Eiffel" },
    { y: 1903, e: "Premier vol motorisé des frères Wright" },
    { y: 1912, e: "Naufrage du Titanic" },
    { y: 1945, e: "Fin de la Seconde Guerre mondiale (capitulation du Japon)" },
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
  ],
};

const SLIDER = {
  1: { min: 1960, max: 2025, def: 1990 },
  2: { min: 1880, max: 2000, def: 1940 },
  3: { min: 1300, max: 1900, def: 1600 },
};

function pickEvent(level) {
  const pool = EVENTS[level];
  return pool[Math.floor(Math.random() * pool.length)];
}

function AnneeGame({ level, onHud, onFinish }) {
  const TOL = { 1: 10, 2: 5, 3: 2 }[level];
  const slider = SLIDER[level];
  const TOTAL = 5;
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [q, setQ] = useState(() => pickEvent(level));
  const [val, setVal] = useState(slider.def);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => { setQ(pickEvent(level)); setVal(slider.def); setFeedback(null); }, [round]);
  useEffect(() => onHud({ score, total: TOTAL }), [score]);

  const submit = () => {
    if (feedback) return;
    const diff = Math.abs(val - q.y);
    let result;
    if (diff === 0) result = "perfect";
    else if (diff <= TOL) result = "ok";
    else result = "ko";
    setFeedback({ result, diff });
    const newScore = result !== "ko" ? score + 1 : score;
    if (result !== "ko") setScore(newScore);
    setTimeout(() => {
      if (round >= TOTAL) onFinish(newScore);
      else setRound((r) => r + 1);
    }, 1600);
  };

  const mid = Math.round((slider.min + slider.max) / 2);

  return (
    <div className="col" style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 28 }}>
      <div className="prompt">
        <div className="prompt__instruction">Manche {round} / {TOTAL} — En quelle année ?</div>
        <div className="prompt__main" style={{ fontSize: 26, maxWidth: 640, margin: "0 auto" }}>{q.e}</div>
      </div>

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

      {feedback?.result === "perfect" && <div className="feedback ok">Pile dans le mille ! ({q.y})</div>}
      {feedback?.result === "ok"      && <div className="feedback ok">Bien vu — c'était {q.y} (à {feedback.diff} an{feedback.diff > 1 ? "s" : ""})</div>}
      {feedback?.result === "ko"      && <div className="feedback ko">C'était {q.y} ({feedback.diff} ans d'écart)</div>}
    </div>
  );
}

window.__GAMES__ = window.__GAMES__ || {};
window.__GAMES__.annee = AnneeGame;
})();
