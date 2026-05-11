/* global React */

const MaisonPage = ({ data, isAdmin, onUpdateData, user }) => (
  React.createElement("div", { className: "page" },
    React.createElement("div", { className: "shell" },
      React.createElement(Hero, { data }),
      React.createElement(Divider, null),
      data.infosRevealed
        ? React.createElement(InfosRevealed, { data, isAdmin, onUpdateData })
        : React.createElement(InfosSealed, {
            isAdmin,
            revealCodes: data.revealCodes,
            onReveal: () => onUpdateData({ ...data, infosRevealed: true }),
            user,
          })
    )
  )
);

const Hero = ({ data }) => (
  React.createElement("section", { style: { paddingTop: 24, position: "relative", overflow: "hidden" } },
    React.createElement("div", {
      style: {
        position: "absolute",
        right: "-10px",
        top: "-10px",
        fontFamily: "var(--font-display)",
        fontSize: 380,
        color: "var(--gold)",
        opacity: 0.025,
        lineHeight: 1,
        pointerEvents: "none",
        userSelect: "none",
      }
    }, "⚜"),
    React.createElement("div", { className: "eyebrow" }, "Convocation · ", data.dateLabel),
    React.createElement("h1", { className: "page-title", style: { fontSize: "clamp(48px, 7vw, 84px)" } },
      React.createElement("span", { className: "glitch", "data-text": "Les Mystères" }, "Les Mystères"),
      React.createElement("br"),
      React.createElement("em", null, "du Chasteau")
    ),
    React.createElement("p", { className: "page-subtitle", style: { marginTop: 24 } },
      "« Oyez, mes très-honorez amis. Vos enfants & vous-mesme estes mandez en un chasteau. Point de roture ni de noblesse — que chacun s'esbaudisse deux jours durant !»"
    ),
    React.createElement(Countdown, { target: data.countdownISO, data })
  )
);

const Countdown = ({ target, data }) => {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, new Date(target).getTime() - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  const Cell = ({ n, lbl }) => (
    React.createElement("div", { className: "countdown-cell" },
      React.createElement("div", { className: "countdown-num" }, String(n).padStart(2, "0")),
      React.createElement("div", { className: "countdown-lbl" }, lbl)
    )
  );

  const Sep = () => React.createElement("div", { className: "countdown-sep" }, "·");

  return (
    React.createElement("div", { style: { marginTop: 36 } },
      React.createElement("div", {
        style: {
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.3em",
          color: "var(--gold)",
          textTransform: "uppercase",
          marginBottom: 14,
        }
      }, "◆ Compte à rebours · Weekend de la Pentecoste"),
      React.createElement("div", { className: "countdown-box" },
        React.createElement(Cell, { n: d, lbl: "Jours" }),
        React.createElement(Sep),
        React.createElement(Cell, { n: h, lbl: "Heures" }),
        React.createElement(Sep),
        React.createElement(Cell, { n: m, lbl: "Minutes" }),
        React.createElement(Sep),
        React.createElement(Cell, { n: s, lbl: "Secondes" })
      ),
      React.createElement("div", {
        style: {
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 15,
          color: "var(--bone)",
          marginTop: 12,
        }
      }, data.dateDebut, " · ", data.heureArrivee),
    React.createElement("div", {
      style: {
        fontSize: 14,
        letterSpacing: "0.5em",
        color: "var(--gold)",
        opacity: 0.32,
        marginTop: 36,
      }
    }, "· ⚜ · ♔ · ⚔ · ♔ · ⚜ ·")
    )
  );
};

/* Levenshtein distance */
const levenshtein = (a, b) => {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0)
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
};

const romans = ["I","II","III","IV","V","VI","VII","VIII","IX"];

/* ---------- SEALED ---------- */
const InfosSealed = ({ isAdmin, onReveal, revealCodes, user }) => {
  const codes = revealCodes || Array(9).fill("");
  const [tick, setTick]           = React.useState(0);
  const [inputs, setInputs]       = React.useState(Array(9).fill(""));
  const [results, setResults]     = React.useState(Array(9).fill(null)); // null | 'correct' | 'almost' | 'wrong'
  const [submitted, setSubmitted] = React.useState(false);
  const [foundIdx, setFoundIdx]   = React.useState(new Set()); // indices déjà trouvés par cet utilisateur

  React.useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 120);
    return () => clearInterval(id);
  }, []);

  // Charger les codes déjà trouvés par l'utilisateur
  React.useEffect(() => {
    if (!user) return;
    const sb = window.__supabase;
    if (!sb) return;
    sb.from("user_codes").select("code_index").eq("user_id", user.id)
      .then(({ data: rows }) => {
        if (!rows || rows.length === 0) return;
        const found = new Set(rows.map(r => r.code_index));
        setFoundIdx(found);
        // Pré-remplir les inputs déjà trouvés
        setInputs(prev => prev.map((v, i) => found.has(i) ? (codes[i] || "") : v));
        setResults(prev => prev.map((v, i) => found.has(i) ? "correct" : v));
      })
      .catch(() => {});
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const glyphs = "▓▒░█◆◇※★✦";
  const noise = (n) => Array.from({ length: n }, (_, i) => glyphs[(i * 7 + tick) % glyphs.length]).join("");

  const setInput = (i, v) => {
    const next = [...inputs];
    next[i] = v;
    setInputs(next);
    if (submitted) {
      const r = [...results];
      const target = (codes[i] || "").toLowerCase().trim();
      const val = v.toLowerCase().trim();
      r[i] = val === "" ? null : val === target ? "correct" : levenshtein(val, target) <= 2 ? "almost" : "wrong";
      setResults(r);
    }
  };

  const submitReveal = async (e) => {
    e.preventDefault();
    const r = inputs.map((v, i) => {
      const target = (codes[i] || "").toLowerCase().trim();
      const val = v.toLowerCase().trim();
      if (!target) return "correct";
      if (val === target) return "correct";
      if (levenshtein(val, target) <= 2) return "almost";
      return "wrong";
    });
    setResults(r);
    setSubmitted(true);

    // Sauvegarder les nouveaux codes corrects dans Supabase
    if (user) {
      const sb = window.__supabase;
      if (sb) {
        const newlyFound = r
          .map((status, i) => status === "correct" && !foundIdx.has(i) ? i : null)
          .filter(i => i !== null);
        if (newlyFound.length > 0) {
          await sb.from("user_codes").upsert(
            newlyFound.map(i => ({ user_id: user.id, code_index: i, found_at: new Date().toISOString() }))
          ).catch(() => {});
          setFoundIdx(prev => new Set([...prev, ...newlyFound]));
        }
      }
    }

    if (r.every(s => s === "correct")) onReveal();
  };

  const allCorrect = submitted && results.every(s => s === "correct");
  const countCorrect = results.filter(s => s === "correct").length;
  const statusText = { correct: "✓", almost: "≈", wrong: "✗" };

  return (
    React.createElement("section", null,
      React.createElement("div", { className: "eyebrow", style: { color: "var(--neon-magenta)" } }, "✠ Signal Brouillé"),
      React.createElement("h2", {
        style: {
          fontFamily: "var(--font-display)",
          fontSize: 32,
          letterSpacing: "0.04em",
          color: "var(--pearl)",
          textTransform: "uppercase",
          margin: "0 0 12px",
        }
      },
        "Lettres ",
        React.createElement("em", {
          style: {
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontWeight: 400,
            textTransform: "none",
            color: "var(--gold-bright)",
          }
        }, "scellées")
      ),
      React.createElement("p", {
        style: {
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 19,
          lineHeight: 1.45,
          color: "var(--bone)",
          margin: "0 0 32px",
        }
      },
        "Les détails du séjour — adresse, dates, agenda — demeurent en lieu sceuré. Patience encores quelques tours d'horloge, l'intendance ne tardera point."
      ),

      /* Instructions for the 9-code system */
      React.createElement("div", {
        style: {
          border: "1px solid var(--line-dim)",
          background: "var(--char)",
          padding: "20px 24px",
          marginBottom: 28,
        }
      },
        React.createElement("div", {
          style: {
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            letterSpacing: "0.3em",
            color: "var(--gold)",
            textTransform: "uppercase",
            marginBottom: 14,
          }
        }, "⚜ Ordonnance de l'Intendance ⚜"),
        [
          "Neuf codes scellent ces pages — chacun estant un mot. Pour chacun d'iceux, trois indices ont esté cachés en la Gazette — du plus ardu au plus clément — soit vingt & sept dépêches en tout, publiées chaque vendredi à XII heures sonnantes.",
          "Chaque indice vous révèle la position du code parmy les neuf, & quelque indice sur le mot qu'il vous faut trouver. Point n'est besoin d'attendre le dernier : si le premier vous illumine l'esprit, saisissez le mot sans délai.",
          "Soumettez vos neuf codes en mesme temps : si l'un est juste, son encadré s'allume en bleu. En orange s'il n'est qu'à deux lettres près — vous n'estes point loin. En rouge, point du tout.",
          "Encore faut-il les ranger dans le bon ordre. Le sceau ne se rompt que si les neuf sont exacts & bien ordonnez. Bonne chasse, mes très-honorez compaignons.",
        ].map((line, i) =>
          React.createElement("p", {
            key: i,
            style: {
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 16,
              lineHeight: 1.55,
              color: "var(--bone)",
              margin: i === 0 ? "0 0 10px" : "10px 0 0",
              opacity: 0.9,
            }
          }, line)
        )
      ),
      React.createElement("div", {
        style: {
          border: "1px solid var(--line)",
          background: "var(--ink)",
          padding: 32,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }
      },
        React.createElement("span", { className: "corner-orn corner-orn-tl" }, "⚜"),
        React.createElement("span", { className: "corner-orn corner-orn-tr" }, "⚜"),
        React.createElement("span", { className: "corner-orn corner-orn-bl" }, "⚜"),
        React.createElement("span", { className: "corner-orn corner-orn-br" }, "⚜"),
        React.createElement("div", {
          style: {
            position: "absolute",
            top: 0,
            left: `${(tick * 3) % 100}%`,
            width: "30%",
            height: 1,
            background: "linear-gradient(90deg, transparent, var(--neon-cyan), transparent)",
          }
        }),
        React.createElement("div", {
          style: {
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.32em",
            color: "var(--neon-magenta)",
            marginBottom: 16,
          }
        }, "● TRANSMISSION INTERROMPUE"),
        React.createElement("div", {
          style: {
            fontFamily: "var(--font-display)",
            fontSize: 28,
            letterSpacing: "0.18em",
            color: "var(--pearl)",
            textShadow: "1.5px 0 0 var(--neon-cyan), -1.5px 0 0 var(--neon-magenta)",
            marginBottom: 16,
          }
        }, tick % 30 < 24 ? "SIGNAL · LOST" : "S▓GN▒L · L░ST"),
        React.createElement("div", {
          style: {
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            letterSpacing: "0.28em",
            color: "var(--gold)",
            opacity: 0.7,
          }
        }, noise(20)),

        /* 9-code reveal form */
        React.createElement("form", { onSubmit: submitReveal },
          React.createElement("div", { className: "codes-grid" },
            inputs.map((val, i) =>
              React.createElement("div", { key: i, className: "code-cell" },
                React.createElement("div", { className: "code-label" }, "Code ", romans[i]),
                React.createElement("input", {
                  type: "text",
                  className: "code-input" + (results[i] ? " is-" + results[i] : ""),
                  value: val,
                  onChange: e => setInput(i, e.target.value),
                  placeholder: "···",
                  autoComplete: "off",
                  autoCorrect: "off",
                  spellCheck: false,
                  readOnly: foundIdx.has(i),
                  title: foundIdx.has(i) ? "Code déjà trouvé ✓" : undefined,
                }),
                React.createElement("div", {
                  className: "code-status" + (results[i] ? " is-" + results[i] : "")
                }, results[i] ? statusText[results[i]] : "")
              )
            )
          ),
          React.createElement("div", { className: "codes-submit" },
            React.createElement("button", {
              type: "submit",
              className: "btn btn--primary",
            }, "⚜ Soumettre les codes"),
            submitted && !allCorrect && React.createElement("span", { className: "codes-hint" },
              countCorrect, " / 9 · ", results.filter(s => s === "almost").length, " approché(s)"
            )
          )
        ),

        /* Admin shortcut */
        isAdmin && React.createElement("button", {
          className: "btn btn--ghost",
          style: { marginTop: 12, fontSize: 10 },
          onClick: onReveal,
        }, "↺ Rompre sans codes (admin)")
      )
    )
  );
};

/* ---------- REVEALED ---------- */
const InfosRevealed = ({ data, isAdmin, onUpdateData }) => {
  const seal = () => onUpdateData({ ...data, infosRevealed: false });

  return (
    React.createElement("section", null,
      React.createElement("div", { className: "eyebrow" }, "Infos pratiques"),
      React.createElement("h2", {
        style: {
          fontFamily: "var(--font-display)",
          fontSize: 32,
          letterSpacing: "0.04em",
          color: "var(--pearl)",
          textTransform: "uppercase",
          margin: "0 0 32px",
        }
      }, "Le séjour"),

      React.createElement("div", { className: "kv" },
        React.createElement("div", { className: "kv-key" }, "Chasteau"),
        React.createElement("div", { className: "kv-val" }, data.chateau)
      ),
      React.createElement("div", { className: "kv" },
        React.createElement("div", { className: "kv-key" }, "Adresse"),
        React.createElement("div", { className: "kv-val" }, data.adresse)
      ),
      React.createElement("div", { className: "kv" },
        React.createElement("div", { className: "kv-key" }, "GPS"),
        React.createElement("div", { className: "kv-val" },
          React.createElement("span", { className: "mono" }, data.gps)
        )
      ),
      React.createElement("div", { className: "kv" },
        React.createElement("div", { className: "kv-key" }, "Du · au"),
        React.createElement("div", { className: "kv-val" }, data.dateDebut, " → ", data.dateFin)
      ),
      React.createElement("div", { className: "kv" },
        React.createElement("div", { className: "kv-key" }, "Horloge"),
        React.createElement("div", { className: "kv-val" }, "Arrivée dès ", data.heureArrivee, " · Départ avant ", data.heureDepart)
      ),
      React.createElement("div", { className: "kv" },
        React.createElement("div", { className: "kv-key" }, "Route"),
        React.createElement("div", { className: "kv-val" }, data.routeCaleche)
      ),
      React.createElement("div", { className: "kv" },
        React.createElement("div", { className: "kv-key" }, "Train"),
        React.createElement("div", { className: "kv-val" }, data.routeTrain)
      ),
      React.createElement("div", { className: "kv" },
        React.createElement("div", { className: "kv-key" }, "Pigeon"),
        React.createElement("div", { className: "kv-val" },
          React.createElement("span", { className: "mono" }, data.contactEmail)
        )
      ),
      React.createElement("div", { className: "kv" },
        React.createElement("div", { className: "kv-key" }, "Cor de chasse"),
        React.createElement("div", { className: "kv-val" },
          React.createElement("span", { className: "mono" }, data.contactTel)
        )
      ),

      /* Equipement */
      React.createElement("h3", {
        style: {
          fontFamily: "var(--font-display)",
          fontSize: 22,
          letterSpacing: "0.04em",
          color: "var(--pearl)",
          textTransform: "uppercase",
          margin: "48px 0 20px",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }
      },
        React.createElement("span", { style: { color: "var(--gold)", opacity: 0.6, fontSize: 14 } }, "⚔"),
        "Ce qu'il faut apporter",
        React.createElement("span", { style: { color: "var(--gold)", opacity: 0.6, fontSize: 14 } }, "⚔"),
      ),
      data.equipement.map((item) =>
        React.createElement("div", { key: item.cat, className: "kv" },
          React.createElement("div", { className: "kv-key" }, item.cat, " · ", item.titre),
          React.createElement("div", {
            className: "kv-val",
            style: { fontFamily: "var(--font-serif)", fontSize: 16, color: "var(--bone)" }
          }, item.desc)
        )
      ),

      /* Agenda */
      React.createElement("h3", {
        style: {
          fontFamily: "var(--font-display)",
          fontSize: 22,
          letterSpacing: "0.04em",
          color: "var(--pearl)",
          textTransform: "uppercase",
          margin: "48px 0 20px",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }
      },
        React.createElement("span", { style: { color: "var(--gold)", opacity: 0.6, fontSize: 14 } }, "⚜"),
        "Agenda",
        React.createElement("span", { style: { color: "var(--gold)", opacity: 0.6, fontSize: 14 } }, "⚜"),
      ),
      data.agenda.map((day, i) =>
        React.createElement("div", {
          key: i,
          style: { padding: "18px 0", borderTop: "1px solid var(--line-dim)" }
        },
          React.createElement("div", {
            style: {
              display: "grid",
              gridTemplateColumns: "140px 1fr",
              gap: 24,
              alignItems: "baseline",
              marginBottom: 10,
            }
          },
            React.createElement("div", null,
              React.createElement("div", {
                style: {
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.22em",
                  color: "var(--gold)",
                  textTransform: "uppercase",
                }
              }, day.code),
              React.createElement("div", {
                style: {
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: 17,
                  color: "var(--bone)",
                  marginTop: 4,
                }
              }, day.label)
            ),
            React.createElement("div", {
              style: {
                fontFamily: "var(--font-serif)",
                fontSize: 18,
                color: "var(--pearl)",
                lineHeight: 1.5,
              }
            }, day.titre)
          ),
          React.createElement("div", {
            style: {
              paddingLeft: 164,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }
          },
            day.evts.map((evt, j) =>
              React.createElement("div", {
                key: j,
                style: { display: "flex", gap: 16, alignItems: "baseline" }
              },
                React.createElement("span", {
                  style: {
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--neon-cyan)",
                    letterSpacing: "0.12em",
                    flexShrink: 0,
                    minWidth: 44,
                  }
                }, evt.h),
                React.createElement("span", {
                  style: {
                    fontFamily: "var(--font-serif)",
                    fontSize: 16,
                    color: "var(--bone)",
                    lineHeight: 1.4,
                  }
                }, evt.t)
              )
            )
          )
        )
      ),

      isAdmin && React.createElement("div", { style: { marginTop: 32 } },
        React.createElement("button", { className: "btn btn--ghost", onClick: seal },
          "↺ Re-sceller (admin)"
        )
      )
    )
  );
};

window.MaisonPage = MaisonPage;
