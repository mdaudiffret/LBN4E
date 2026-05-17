/* global React */

const MaisonPage = ({ data, isAdmin, onUpdateData, user }) => {
  const [adminLocalReveal, setAdminLocalReveal] = React.useState(false);
  const revealed = data.infosRevealed || (isAdmin && adminLocalReveal);

  const handleSeal = () => {
    if (adminLocalReveal && !data.infosRevealed) {
      setAdminLocalReveal(false);
    } else {
      onUpdateData({ ...data, infosRevealed: false });
    }
  };

  return React.createElement("div", { className: "page" },
    React.createElement("div", { className: "shell" },
      React.createElement(Hero, { data }),
      React.createElement(Divider, null),
      revealed
        ? React.createElement(InfosRevealed, { data, isAdmin, onSeal: handleSeal })
        : React.createElement(InfosSealed, {
            isAdmin,
            revealCodes: data.revealCodes,
            onAdminReveal: () => setAdminLocalReveal(true),
            onGlobalReveal: () => onUpdateData({ ...data, infosRevealed: true }),
            user,
          }),
      React.createElement(Divider, null),
      React.createElement(Leaderboard, { adminPseudos: data.adminPseudos || (data.adminPseudo ? [data.adminPseudo] : []) })
    )
  );
};

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

const romans = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX"];

/* ---------- SEALED ---------- */
const InfosSealed = ({ isAdmin, onAdminReveal, onGlobalReveal, revealCodes, user }) => {
  const codes = revealCodes || Array(20).fill("");
  const [tick, setTick]           = React.useState(0);
  const [inputs, setInputs]       = React.useState(Array(20).fill(""));
  const [results, setResults]     = React.useState(Array(20).fill(null)); // null | 'correct' | 'almost' | 'wrong'
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
        setInputs(prev => prev.map((v, i) => found.has(i) ? "••••" : v));
        setResults(prev => prev.map((v, i) => found.has(i) ? "correct" : v));
      })
      .catch(() => {});
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Réappliquer le pre-fill quand app_config arrive après user_codes
  React.useEffect(() => {
    if (foundIdx.size === 0) return;
    setInputs(prev => prev.map((v, i) => foundIdx.has(i) ? "••••" : v));
  }, [codes]); // eslint-disable-line react-hooks/exhaustive-deps

  const glyphs = "▓▒░█◆◇※★✦";
  const noise = (n) => Array.from({ length: n }, (_, i) => glyphs[(i * 7 + tick) % glyphs.length]).join("");

  const setInput = (i, v) => {
    if (foundIdx.has(i)) return; // code déjà enregistré en DB — non modifiable
    const next = [...inputs];
    next[i] = v;
    setInputs(next);
    // Réinitialise l'indicateur : seul le bouton Soumettre teste ET enregistre
    if (submitted && results[i] !== null) {
      const r = [...results];
      r[i] = null;
      setResults(r);
    }
  };

  const submitReveal = async (e) => {
    e.preventDefault();
    const r = inputs.map((v, i) => {
      if (foundIdx.has(i)) return "correct"; // déjà enregistré en DB
      const target = (codes[i] || "").toLowerCase().trim();
      const val = v.toLowerCase().trim();
      if (!target) return "correct";
      if (!val) return null; // champ vide → neutre
      if (val === target) return "correct";
      if (levenshtein(val, target) <= 2) return "almost";
      return "wrong";
    });
    setResults(r);
    setSubmitted(true);

    // Sauvegarder les nouveaux codes corrects + enregistrer la tentative dans Supabase
    if (user) {
      const sb = window.__supabase;
      if (sb) {
        const newlyFound = r
          .map((status, i) => status === "correct" && !foundIdx.has(i) ? i : null)
          .filter(i => i !== null);
        if (newlyFound.length > 0) {
          const { error } = await sb.from("user_codes").upsert(
            newlyFound.map(i => ({ user_id: user.id, code_index: i, found_at: new Date().toISOString() }))
          );
          if (error) { console.error("[user_codes upsert]", error); }
          else { setFoundIdx(prev => new Set([...prev, ...newlyFound])); }
        }
        await sb.from("user_attempts").insert({ user_id: user.id });
      }
    }

    if (r.every(s => s === "correct")) onGlobalReveal();
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
        "Les détails du séjour sont tenus en lieu fort secret, & seuls les plus hardis d'entre vous pourront les découvrir. Aurez-vous l'audace, le courage & l'intelligence d'arriver au bout de ceste queste, & de dévoiler en premier le lieu caché de ceste rencontre ?"
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
        [
          "Pour dévoiler les informations ci-dessous, vous devez trouver 20 codes. Chaque code est un mot (sans majuscule).",
          "Pour trouver ces codes, chaque vendredi à 12h pile, une nouvelle dépêche sera publiée dans la gazette de ce site. Chaque dépêche contient une énigme que vous devez résoudre pour trouver le mot, mais aussi sa position parmi les codes numérotés ci-dessous. Et oui, ils ne sont pas dans l'ordre — ça serait trop facile.",
          "Pas besoin d'attendre tous les indices : soumettez vos codes au fur et à mesure, et vos bonnes réponses seront enregistrées automatiquement.",
          "Si un code est correct, son encadré devient bleu et il est sauvegardé — vous ne pouvez plus le modifier. Orange signifie que vous êtes à deux lettres près. Rouge, vous êtes loin du compte.",
          "Une fois les 20 codes trouvés, les informations sur le lieu et le programme seront dévoilées.",
          "Utilisez les jeux pour débloquer des indices complémentaires pour résoudre les énigmes.",
          "Bonne chasse !",
        ].map((line, i) =>
          React.createElement("p", {
            key: i,
            style: {
              fontFamily: "var(--font-serif)",
              fontSize: 18,
              lineHeight: 1.65,
              color: "var(--bone)",
              margin: i === 0 ? "0 0 12px" : "12px 0 0",
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
              countCorrect, " / 20 · ", results.filter(s => s === "almost").length, " approché(s)"
            )
          )
        ),

        /* Admin shortcut */
        isAdmin && React.createElement("button", {
          className: "btn btn--ghost",
          style: { marginTop: 12, fontSize: 10 },
          onClick: onAdminReveal,
        }, "↺ Rompre sans codes (admin)")
      )
    )
  );
};

/* ---------- REVEALED ---------- */
const InfosRevealed = ({ data, isAdmin, onSeal }) => {

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
        React.createElement("button", { className: "btn btn--ghost", onClick: onSeal },
          "↺ Re-sceller (admin)"
        )
      )
    )
  );
};

/* ── Leaderboard ─────────────────────────────────────────────── */
const Leaderboard = ({ adminPseudos }) => {
  const [rows, setRows] = React.useState(null);

  React.useEffect(() => {
    const sb = window.__supabase;
    if (!sb) { setRows([]); return; }

    const load = () =>
      Promise.all([
        sb.from("users").select("id, pseudo"),
        sb.from("user_codes").select("user_id"),
        sb.from("user_attempts").select("user_id"),
      ]).then(([u, c, a]) => {
        const admins = (adminPseudos || []).map(p => p.toLowerCase());
        const users = (u.data || []).filter(p => !admins.includes(p.pseudo.toLowerCase()));
        const counts = {};
        (c.data || []).forEach(r => { counts[r.user_id] = (counts[r.user_id] || 0) + 1; });
        const attempts = {};
        (a.data || []).forEach(r => { attempts[r.user_id] = (attempts[r.user_id] || 0) + 1; });
        const list = users
          .map(p => ({ ...p, count: counts[p.id] || 0, attempts: attempts[p.id] || 0 }))
          .sort((a, b) => b.count - a.count || a.pseudo.localeCompare(b.pseudo));
        setRows(list);
      }, () => setRows([]));

    load();

    const ch = sb.channel("lb-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "user_codes" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "user_attempts" }, load)
      .subscribe();
    return () => sb.removeChannel(ch);
  }, [adminPseudos]);

  if (!rows || rows.length === 0) return null;

  return React.createElement("section", { style: { paddingBottom: 32 } },
    React.createElement("div", { className: "eyebrow", style: { marginBottom: 6 } }, "Tableau d'honneur"),
    React.createElement("h2", {
      style: {
        fontFamily: "var(--font-display)",
        fontSize: 28,
        letterSpacing: "0.04em",
        color: "var(--pearl)",
        textTransform: "uppercase",
        margin: "0 0 24px",
      }
    }, "Les Chevaliers"),
    rows.map((row, i) =>
      React.createElement("div", { key: row.id, className: "lb-row" },
        React.createElement("span", { className: "lb-rank" }, `#${i + 1}`),
        React.createElement("span", { className: "lb-pseudo" }, row.pseudo),
        React.createElement("div", { className: "lb-bar-wrap" },
          React.createElement("div", {
            className: "lb-bar",
            style: { width: `${Math.round((row.count / 20) * 100)}%` },
          })
        ),
        React.createElement("span", { className: "lb-count" }, `${row.count}/20`),
        row.attempts > 0 && React.createElement("span", {
          className: "lb-attempts",
          title: "Nombre de tentatives",
        }, `${row.attempts} tentative${row.attempts > 1 ? "s" : ""}`)
      )
    )
  );
};

window.MaisonPage = MaisonPage;
