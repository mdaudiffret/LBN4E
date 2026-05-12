;(function() {
// games/intrus.jsx — L'Imposteur
const { useState, useEffect, useRef } = React;

const DATA = {
  1: [
    { words: ["CHAT","CHIEN","LAPIN","AIGLE","TABLE"], intruder: 4, cat: "pas un animal" },
    { words: ["ROUGE","BLEU","VERT","MAISON","JAUNE"], intruder: 3, cat: "pas une couleur" },
    { words: ["PARIS","LYON","ROME","BORDEAUX","NANTES"], intruder: 2, cat: "pas en France" },
    { words: ["PIANO","GUITARE","TABLE","VIOLON","FLÛTE"], intruder: 2, cat: "pas un instrument" },
    { words: ["POMME","POIRE","BANANE","CAROTTE","CERISE"], intruder: 3, cat: "pas un fruit" },
    { words: ["LUNDI","MARDI","MARS","JEUDI","VENDREDI"], intruder: 2, cat: "pas un jour" },
    { words: ["NEIGE","PLUIE","SOLEIL","CHAISE","VENT"], intruder: 3, cat: "pas un temps" },
    { words: ["ROSE","TULIPE","DAUPHIN","IRIS","LYS"], intruder: 2, cat: "pas une fleur" },
  ],
  2: [
    { words: ["REQUIN","TRUITE","SAUMON","PIEUVRE","THON"], intruder: 3, cat: "pas un poisson" },
    { words: ["BRIE","CAMEMBERT","YAOURT","ROQUEFORT","COMTÉ"], intruder: 2, cat: "pas un fromage" },
    { words: ["RUBIS","DIAMANT","ÉMERAUDE","MARBRE","SAPHIR"], intruder: 3, cat: "pas une pierre précieuse" },
    { words: ["LION","TIGRE","LÉOPARD","GUÉPARD","HYÈNE"], intruder: 4, cat: "pas un félin" },
    { words: ["SOLEIL","MERCURE","VÉNUS","JUPITER","MARS"], intruder: 0, cat: "pas une planète" },
    { words: ["POIVRE","THYM","SEL","MOUTARDE","CUMIN"], intruder: 2, cat: "pas une épice/herbe" },
    { words: ["NIORT","RENNES","METZ","STRASBOURG","COLMAR"], intruder: 4, cat: "pas une préfecture de région" },
    { words: ["JAVELOT","MARTEAU","DISQUE","PERCHE","TENNIS"], intruder: 4, cat: "pas une épreuve d'athlétisme" },
  ],
  3: [
    { words: ["CHARDON","MARGUERITE","VIOLETTE","TROMPETTE","EGLANTINE"], intruder: 3, cat: "pas une fleur" },
    { words: ["LOUP","LÉOPARD","LION","LILAS","LYNX"], intruder: 3, cat: "pas un animal" },
    { words: ["ÉRABLE","BOULEAU","SAPIN","CHÊNE","ROSIER"], intruder: 4, cat: "pas un arbre" },
    { words: ["ATLAS","PAMPHLET","ALMANACH","GRIMOIRE","FUSIL"], intruder: 4, cat: "pas un livre/document" },
    { words: ["FLORIN","DUCAT","SEQUIN","PISTOLE","TURBAN"], intruder: 4, cat: "pas une monnaie ancienne" },
    { words: ["ARBALÈTE","ARQUEBUSE","ESCOPETTE","MANDOLINE","MOUSQUET"], intruder: 3, cat: "pas une arme à feu" },
    { words: ["ATHOS","PORTHOS","ARAMIS","TREVILLE","ROCHEFORT"], intruder: 3, cat: "pas un mousquetaire" },
    { words: ["AZUR","GUEULES","SABLE","SINOPLE","IVOIRE"], intruder: 4, cat: "pas une teinture héraldique" },
  ],
};

const TIME_PER_Q = { 1: 20, 2: 12, 3: 8 };
const TOTAL_ROUNDS = 6;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function IntrusGame({ level, onHud, onFinish }) {
  const timePerQ = TIME_PER_Q[level];
  const pool = DATA[level] || DATA[1];

  const [rounds] = useState(() => shuffle(pool).slice(0, TOTAL_ROUNDS));
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState("playing"); // playing | feedback | done
  const [chosen, setChosen] = useState(null); // index clicked or null (timeout)
  const [timeLeft, setTimeLeft] = useState(timePerQ);
  const timerRef = useRef(null);
  const startRef = useRef(Date.now());

  const current = rounds[roundIdx];

  useEffect(() => {
    onHud({ score, total: TOTAL_ROUNDS });
  }, [score]);

  // Countdown tick
  useEffect(() => {
    if (phase !== "playing") return;
    startRef.current = Date.now();
    setTimeLeft(timePerQ);
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const remaining = Math.max(0, timePerQ - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        handleAnswer(null); // timeout = wrong
      }
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [roundIdx, phase]);

  function handleAnswer(idx) {
    clearInterval(timerRef.current);
    const correct = idx === current.intruder;
    const newScore = correct ? score + 1 : score;
    if (correct) setScore(newScore);
    setChosen(idx);
    setPhase("feedback");
    onHud({ score: newScore, total: TOTAL_ROUNDS });

    setTimeout(() => {
      if (roundIdx + 1 >= TOTAL_ROUNDS) {
        setPhase("done");
        onFinish(newScore);
      } else {
        setRoundIdx(r => r + 1);
        setChosen(null);
        setPhase("playing");
      }
    }, 1200);
  }

  if (phase === "done") {
    const passed = score >= 4;
    return (
      React.createElement("div", { className: "col", style: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 } },
        React.createElement("div", { className: "prompt" },
          React.createElement("div", { className: "prompt__instruction" }, "Terminé"),
          React.createElement("div", { className: "prompt__main" }, `${score} / ${TOTAL_ROUNDS}`)
        ),
        React.createElement("div", { className: `feedback ${passed ? "ok" : "ko"}`, style: { marginTop: 8 } },
          passed
            ? `Bravo ! ${score} imposteurs démasqués sur ${TOTAL_ROUNDS}`
            : `Insuffisant — ${score} trouvé(s) sur ${TOTAL_ROUNDS} · cible : 4`
        )
      )
    );
  }

  const barPct = (timeLeft / timePerQ) * 100;
  const barColor = barPct > 50 ? "var(--success)" : barPct > 25 ? "var(--gold)" : "var(--danger)";

  return (
    React.createElement("div", { className: "col", style: { flex: 1, gap: 16 } },

      // Header row
      React.createElement("div", { className: "row", style: { justifyContent: "space-between", width: "100%" } },
        React.createElement("span", { className: "prompt__instruction" },
          `Série ${roundIdx + 1} / ${TOTAL_ROUNDS}`
        ),
        React.createElement("span", { className: "prompt__instruction" },
          `Score : ${score}`
        )
      ),

      // Timer bar
      React.createElement("div", {
        style: {
          width: "100%", height: 6, borderRadius: 4,
          background: "var(--line-dim)", overflow: "hidden"
        }
      },
        React.createElement("div", {
          style: {
            width: `${barPct}%`, height: "100%",
            background: barColor,
            transition: "width 0.1s linear, background 0.3s"
          }
        })
      ),

      // Countdown label
      React.createElement("div", {
        style: {
          textAlign: "center",
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          color: barColor
        }
      }, `${Math.ceil(timeLeft)}s`),

      // Prompt
      React.createElement("div", { className: "prompt", style: { marginBottom: 8 } },
        React.createElement("div", { className: "prompt__instruction" }, "Quel est l'intrus ?"),
        React.createElement("div", { className: "prompt__main", style: { fontSize: 22 } },
          phase === "feedback"
            ? (chosen === current.intruder
                ? `✓ Exact — ${current.cat}`
                : `✗ C'était : ${current.words[current.intruder]} — ${current.cat}`)
            : " "
        )
      ),

      // Word buttons grid
      React.createElement("div", {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 10,
          width: "100%"
        }
      },
        current.words.map((word, i) => {
          let bg = "var(--char-2)";
          let borderColor = "var(--line)";
          let color = "var(--pearl)";

          if (phase === "feedback") {
            if (i === current.intruder) {
              bg = "var(--success)";
              borderColor = "var(--success)";
              color = "var(--ink)";
            } else if (i === chosen && chosen !== current.intruder) {
              bg = "var(--danger)";
              borderColor = "var(--danger)";
              color = "var(--pearl)";
            } else {
              color = "var(--bone)";
              borderColor = "var(--line-dim)";
            }
          }

          return React.createElement("button", {
            key: i,
            onClick: phase === "playing" ? () => handleAnswer(i) : undefined,
            style: {
              background: bg,
              border: `2px solid ${borderColor}`,
              borderRadius: 12,
              color,
              fontFamily: "var(--font-display)",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.05em",
              padding: "18px 6px",
              cursor: phase === "playing" ? "pointer" : "default",
              transition: "background 0.15s, border-color 0.15s, color 0.15s",
              textAlign: "center",
              lineHeight: 1.2
            }
          }, word);
        })
      )
    )
  );
}

window.__GAMES__ = window.__GAMES__ || {};
window.__GAMES__.intrus = IntrusGame;
})();
