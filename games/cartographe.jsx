;(function() {
// games/cartographe.jsx — Le Cartographe
const { useState, useEffect, useRef } = React;

const QUESTIONS = {
  1: [
    { clue: "Région du nord, entre mer du Nord et Belgique, chef-lieu Lille", answer: "Hauts-de-France", choices: ["Hauts-de-France","Normandie","Grand Est","Picardie"] },
    { clue: "Région côtière atlantique, vins célèbres, chef-lieu Bordeaux", answer: "Nouvelle-Aquitaine", choices: ["Nouvelle-Aquitaine","Occitanie","Bretagne","Pays de la Loire"] },
    { clue: "Région alpine et rhodanienne, chef-lieu Lyon", answer: "Auvergne-Rhône-Alpes", choices: ["Auvergne-Rhône-Alpes","Bourgogne-Franche-Comté","PACA","Grand Est"] },
    { clue: "Presqu'île bretonne, chef-lieu Rennes, entourée de mer sur trois côtés", answer: "Bretagne", choices: ["Bretagne","Normandie","Pays de la Loire","Poitou"] },
    { clue: "Région méditerranéenne, Marseille, Côte d'Azur", answer: "Provence-Alpes-Côte d'Azur", choices: ["Provence-Alpes-Côte d'Azur","Occitanie","Corse","Languedoc"] },
    { clue: "Région centrale du Massif Central, volcans et plateaux, chef-lieu Clermont-Ferrand", answer: "Auvergne-Rhône-Alpes", choices: ["Auvergne-Rhône-Alpes","Occitanie","Bourgogne","Limousin"] },
    { clue: "Région frontalière avec l'Allemagne et la Suisse, cathédrale de Strasbourg", answer: "Grand Est", choices: ["Grand Est","Île-de-France","Bourgogne-Franche-Comté","Normandie"] },
    { clue: "Île de Beauté, île méditerranéenne française", answer: "Corse", choices: ["Corse","PACA","Occitanie","Normandie"] },
  ],
  2: [
    { clue: "Province du Cardinal de Richelieu, entre Loire et Poitou, Tours comme ville principale", answer: "Touraine", choices: ["Touraine","Berry","Maine","Anjou","Blésois"] },
    { clue: "Province du Nord, Flandre française, ancienne possession des Habsbourg", answer: "Artois", choices: ["Artois","Picardie","Champagne","Lorraine","Alsace"] },
    { clue: "Grande province de l'Ouest, duché indépendant jusqu'en 1532, capitale Nantes", answer: "Bretagne", choices: ["Bretagne","Maine","Anjou","Poitou","Saintonge"] },
    { clue: "Province viticole de Bourgogne, au cœur de la France, Dijon comme capitale", answer: "Bourgogne", choices: ["Bourgogne","Champagne","Berry","Nivernais","Franche-Comté"] },
    { clue: "Province pyrénéenne du Sud-Ouest, Gascogne et pelote basque, Pau comme ville", answer: "Béarn", choices: ["Béarn","Gascogne","Bigorre","Rouergue","Languedoc"] },
    { clue: "Province méditerranéenne, Avignon siège de la papauté au XIVe, mistral et lavande", answer: "Provence", choices: ["Provence","Languedoc","Dauphiné","Comtat Venaissin","Roussillon"] },
    { clue: "Province rhénane, sous influence germanique, cathédrale de Strasbourg", answer: "Alsace", choices: ["Alsace","Lorraine","Champagne","Franche-Comté","Artois"] },
    { clue: "Province normande, Guillaume le Conquérant, falaises d'Étretat", answer: "Normandie", choices: ["Normandie","Picardie","Maine","Bretagne","Perche"] },
  ],
  3: [
    { clue: "Royaume ibérique uni à l'Espagne jusqu'en 1640, Lisbonne comme capitale", answer: "Portugal", choices: ["Portugal","Castille","Aragon","Navarre","León","Catalogne"] },
    { clue: "Principautés protestantes du nord de l'Empire germanique, révolte de Trente Ans", answer: "Prusse", choices: ["Prusse","Bavière","Saxe","Bohême","Autriche","Brandebourg"] },
    { clue: "République marchande adriatique, la Sérénissime, doge et gondoles", answer: "Venise", choices: ["Venise","Gênes","Florence","Naples","Milan","Ferrare"] },
    { clue: "Provinces unies calvinistes du nord des Pays-Bas, indépendantes depuis 1581", answer: "Hollande", choices: ["Hollande","Flandre","Brabant","Zélande","Utrecht","Gueldre"] },
    { clue: "Royaume scandinave, puissance balte au XVIIe, Gustave-Adolphe roi guerrier", answer: "Suède", choices: ["Suède","Danemark","Norvège","Finlande","Pologne","Russie"] },
    { clue: "Sultanat ottoman, capitale Constantinople, empire méditerranéen et balkanique", answer: "Empire Ottoman", choices: ["Empire Ottoman","Perse","Egypte","Maroc","Tunisie","Tripolitaine"] },
    { clue: "Grand-duché de Toscane, Florence, Médicis et arts de la Renaissance", answer: "Toscane", choices: ["Toscane","Venise","Gênes","États pontificaux","Modène","Mantoue"] },
    { clue: "Royaume catholique de la péninsule ibérique, empire colonial mondial, Madrid", answer: "Espagne", choices: ["Espagne","Portugal","Aragon","Castille","Navarre","Catalogue"] },
  ],
};

const TIME_PER_Q = { 1: 8, 2: 6, 3: 5 };

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRounds(level) {
  const pool = shuffle([...QUESTIONS[level]]);
  return pool.slice(0, 6).map(q => ({
    ...q,
    choices: shuffle([...q.choices]),
  }));
}

function CartographeGame({ level, onHud, onFinish }) {
  const TOTAL = 6;
  const timePerQ = TIME_PER_Q[level];
  const roundsRef = useRef(null);
  if (!roundsRef.current) roundsRef.current = pickRounds(level);
  const rounds = roundsRef.current;

  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const [timeLeft, setTimeLeft] = useState(timePerQ);
  const timerRef = useRef(null);
  const scoreRef = useRef(0);

  const current = rounds[roundIdx];

  function advance(currentScore) {
    clearInterval(timerRef.current);
    if (roundIdx >= TOTAL - 1) {
      onFinish(currentScore);
    } else {
      setRoundIdx(i => i + 1);
    }
  }

  useEffect(() => {
    setPicked(null);
    setTimeLeft(timePerQ);
  }, [roundIdx]);

  useEffect(() => {
    setTimeLeft(timePerQ);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setPicked("__timeout__");
          setTimeout(() => advance(scoreRef.current), 1200);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [roundIdx]);

  useEffect(() => { onHud({ score, total: TOTAL }); }, [score]);

  const choose = (answer) => {
    if (picked) return;
    clearInterval(timerRef.current);
    setPicked(answer);
    const ok = answer === current.answer;
    const newScore = ok ? score + 1 : score;
    if (ok) { setScore(newScore); scoreRef.current = newScore; }
    setTimeout(() => advance(newScore), 1200);
  };

  const timerColor = timeLeft <= 2 ? "var(--danger)" : "var(--gold)";
  const numChoices = current.choices.length;
  const gridCols = numChoices <= 4 ? "repeat(2, 1fr)" : "repeat(2, 1fr)";

  return (
    <div className="col" style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 20 }}>
      <div className="prompt">
        <div className="prompt__instruction" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <span>Manche {roundIdx + 1} / {TOTAL} — Quelle contrée ?</span>
          {!picked && (
            <span style={{
              fontFamily: "var(--font-brand)", fontWeight: 800,
              fontSize: 28, lineHeight: 1,
              color: timerColor, transition: "color .3s",
              flexShrink: 0
            }}>{timeLeft}</span>
          )}
        </div>
        <div className="prompt__main" style={{ fontSize: 22, fontFamily: "var(--font-serif)", fontStyle: "italic", maxWidth: 560, margin: "0 auto" }}>
          {current.clue}
        </div>
      </div>

      {!picked && (
        <div style={{ width: "100%", maxWidth: 520, height: 4, background: "var(--line-dim)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${(timeLeft / timePerQ) * 100}%`,
            background: timerColor,
            transition: "width 1s linear, background .3s"
          }} />
        </div>
      )}

      {picked === "__timeout__" && (
        <div className="feedback ko" style={{ marginBottom: 0 }}>
          Temps écoulé — c'était : {current.answer}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 10, width: "100%", maxWidth: 520 }}>
        {current.choices.map((c, idx) => {
          const isCorrect = c === current.answer;
          const isPicked = picked === c;
          let bg = "var(--char-2)", color = "var(--pearl)", border = "var(--line)";
          if (picked && picked !== "__timeout__") {
            if (isCorrect) { bg = "rgba(34,197,94,0.15)"; color = "var(--success)"; border = "var(--success)"; }
            else if (isPicked) { bg = "rgba(239,68,68,0.15)"; color = "var(--danger)"; border = "var(--danger)"; }
          }
          const spanStyle = (numChoices % 2 !== 0 && idx === current.choices.length - 1)
            ? { gridColumn: "1 / -1" } : {};
          return (
            <button key={c} onClick={() => choose(c)} disabled={!!picked}
              style={{
                padding: "15px 18px",
                borderRadius: 10,
                background: bg, color,
                border: `1px solid ${border}`,
                fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 15,
                cursor: picked ? "default" : "pointer",
                transition: "all .15s",
                textAlign: "center",
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
window.__GAMES__.cartographe = CartographeGame;
})();
