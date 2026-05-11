/* global React */

/* ---------------------------------------------------------------
   INTENDANCE PAGE  (#/intendance)
   Tab 0 — Dashboard  : liste des participants + stats
   Tab 1 — Événement  : toggle infos + champs événement
   Tab 2 — Gazette    : liste / ajout / édition / suppression posts
   Tab 3 — Jeux       : 27 indices configurables
   --------------------------------------------------------------- */

/* ── Page principale ─────────────────────────────────────────── */
const IntendancePage = ({ data, onUpdateData, isAdmin, onLogin, onLogout }) => {
  if (!isAdmin) return React.createElement(IntendanceLogin, { onLogin });
  return React.createElement(IntendanceEditor, { data, onUpdateData, onLogout });
};

/* ── Login (page entière) ────────────────────────────────────── */
const IntendanceLogin = ({ onLogin }) => {
  const [pwd, setPwd]       = React.useState("");
  const [err, setErr]       = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const ok = await onLogin(pwd);
    if (!ok) { setErr(true); setPwd(""); setLoading(false); }
  };

  return (
    React.createElement("main", {
      style: {
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }
    },
      React.createElement("div", { style: { maxWidth: 400, width: "100%" } },
        React.createElement("div", { className: "eyebrow", style: { textAlign: "center", marginBottom: 8 } }, "✠ Sceau de Sa Majesté ✠"),
        React.createElement("h1", {
          style: {
            fontFamily: "var(--font-display)",
            fontSize: 28,
            textAlign: "center",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            margin: "0 0 32px",
          }
        }, "Intendance"),
        React.createElement("form", { onSubmit: submit },
          React.createElement("div", { className: "field" },
            React.createElement("label", { className: "field-label" }, "Mot de passe"),
            React.createElement("input", {
              type: "password",
              className: "field-input",
              autoFocus: true,
              value: pwd,
              onChange: e => { setPwd(e.target.value); setErr(false); },
              placeholder: "••••••••",
            })
          ),
          err && React.createElement("div", {
            style: {
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.18em",
              color: "var(--neon-magenta)",
              textTransform: "uppercase",
              marginBottom: 12,
            }
          }, "// accès refusé — point de garde"),
          React.createElement("button", {
            type: "submit",
            className: "btn btn--primary",
            style: { width: "100%", justifyContent: "center", marginTop: 8 },
            disabled: loading || !pwd.trim(),
          }, loading ? "Vérification…" : "⚜ Apposer le sceau")
        )
      )
    )
  );
};

/* ── Éditeur (page entière) ──────────────────────────────────── */
const IntendanceEditor = ({ data, onUpdateData, onLogout }) => {
  const [tab, setTab] = React.useState("dashboard");
  const [d, setD]     = React.useState(data);
  const set = (k, v)  => setD(prev => ({ ...prev, [k]: v }));

  const save = () => onUpdateData(d);

  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "evenement", label: "Événement" },
    { id: "gazette",   label: "Gazette" },
    { id: "jeux",      label: "Jeux" },
  ];

  return (
    React.createElement("main", { className: "shell", style: { paddingTop: 40, paddingBottom: 80 } },
      React.createElement("div", { className: "eyebrow", style: { marginBottom: 4 } }, "✠ Intendance · Mode Édition ✠"),
      React.createElement("h1", {
        style: {
          fontFamily: "var(--font-display)",
          fontSize: 28,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          margin: "0 0 28px",
        }
      }, "Tenir les Registres"),

      React.createElement("div", { className: "admin-tabs", style: { marginBottom: 32 } },
        tabs.map(t =>
          React.createElement("button", {
            key: t.id,
            className: "admin-tab" + (tab === t.id ? " is-active" : ""),
            onClick: () => setTab(t.id),
          }, t.label)
        )
      ),

      tab === "dashboard" && React.createElement(DashboardTab, { data: d }),
      tab === "evenement" && React.createElement(TabEvenement, { d, set }),
      tab === "gazette"   && React.createElement(TabGazette, { d, setD }),
      tab === "jeux"      && React.createElement(TabJeux, { d, set }),

      tab !== "dashboard" && React.createElement("div", {
        style: {
          display: "flex",
          gap: 12,
          marginTop: 32,
          paddingTop: 24,
          borderTop: "1px solid var(--line-dim)",
        }
      },
        React.createElement("button", {
          type: "button",
          className: "btn btn--primary",
          style: { justifyContent: "center" },
          onClick: save,
        }, "⚜ Sceller les modifications"),
        React.createElement("button", {
          type: "button",
          className: "btn btn--ghost",
          onClick: onLogout,
        }, "Déconnexion")
      )
    )
  );
};

/* ── Dashboard ───────────────────────────────────────────────── */
const GAME_LABELS = {
  memoire: "Mémoire", suite: "Suite", anagrammes: "Anagrammes",
  reflexes: "Réflexes", cible: "Cible", tempo: "Tempo",
  drapeaux: "Drapeaux", capitales: "Capitales", annee: "Année",
};

const DashboardTab = ({ data }) => {
  const [users, setUsers]         = React.useState([]);
  const [loading, setLoading]     = React.useState(true);
  const [refreshedAt, setRefreshed] = React.useState(null);

  const load = () => {
    const sb = window.__supabase;
    if (!sb) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      sb.from("users").select("*"),
      sb.from("user_codes").select("*"),
      sb.from("user_indices").select("*"),
    ]).then(([u, c, i]) => {
      const codesData   = c.data || [];
      const indicesData = i.data || [];
      const list = (u.data || []).map(user => ({
        ...user,
        codes:  codesData.filter(x => x.user_id === user.id),
        games: [...new Set(indicesData.filter(x => x.user_id === user.id).map(x => x.game_id))],
      }));
      list.sort((a, b) => b.codes.length - a.codes.length || a.pseudo.localeCompare(b.pseudo));
      setUsers(list);
      setRefreshed(new Date());
      setLoading(false);
    }, () => setLoading(false));
  };

  React.useEffect(() => { load(); }, []);

  const revealCodes = data.revealCodes || [];
  const adminPseudo = (data.adminPseudo || "").toLowerCase();

  const fmtDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })
         + " " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) return React.createElement("div", {
    style: { padding: "40px 0", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--bone)", opacity: 0.5 }
  }, "Chargement…");

  const participants = users.filter(u => u.pseudo.toLowerCase() !== adminPseudo);

  return (
    React.createElement("div", null,

      /* Barre refresh + résumé */
      React.createElement("div", {
        style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }
      },
        React.createElement("div", {
          style: { fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--bone)", opacity: 0.4 }
        }, refreshedAt ? `Actualisé à ${fmtDate(refreshedAt.toISOString())}` : ""),
        React.createElement("button", {
          className: "btn btn--ghost",
          style: { fontSize: 11, padding: "4px 12px" },
          onClick: load,
        }, "↺ Actualiser")
      ),

      React.createElement("div", {
        style: { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--gold)", marginBottom: 24, letterSpacing: "0.12em" }
      },
        `${participants.length} participant${participants.length !== 1 ? "s" : ""} · `,
        `${participants.reduce((s, u) => s + u.codes.length, 0)} codes trouvés`
      ),

      /* Liste des participants */
      participants.length === 0
        ? React.createElement("div", {
            style: { textAlign: "center", padding: "60px 0", fontStyle: "italic", color: "var(--bone)", opacity: 0.35 }
          }, "Aucun participant enregistré.")
        : participants.map((user, rank) =>
            React.createElement("div", { key: user.id, className: "dash-user" },

              /* En-tête ligne */
              React.createElement("div", { className: "dash-user-head" },
                React.createElement("span", { className: "dash-rank" }, `#${rank + 1}`),
                React.createElement("span", { className: "dash-pseudo" }, user.pseudo),
                React.createElement("span", { className: "dash-meta" }, fmtDate(user.last_seen))
              ),

              /* Codes */
              React.createElement("div", { className: "dash-row" },
                React.createElement("span", { className: "dash-label" },
                  `Codes ${user.codes.length}/9`
                ),
                React.createElement("div", { className: "dash-badges" },
                  Array.from({ length: 9 }, (_, i) => {
                    const found   = user.codes.some(c => c.code_index === i);
                    const word    = revealCodes[i] || `·`;
                    return React.createElement("span", {
                      key: i,
                      className: "dash-badge" + (found ? " dash-badge--found" : " dash-badge--missing"),
                      title: found ? word : `Code ${i + 1} non trouvé`,
                    }, found ? word : "·");
                  })
                )
              ),

              /* Jeux */
              user.games.length > 0 && React.createElement("div", { className: "dash-row" },
                React.createElement("span", { className: "dash-label" },
                  `Jeux ${user.games.length}/9`
                ),
                React.createElement("div", { className: "dash-badges" },
                  user.games.map(g =>
                    React.createElement("span", { key: g, className: "dash-badge dash-badge--game" },
                      GAME_LABELS[g] || g
                    )
                  )
                )
              )
            )
          )
    )
  );
};

/* ── Section header helper ───────────────────────────────────── */
const SectionHeader = ({ label, onAdd, addLabel }) =>
  React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      letterSpacing: "0.26em",
      color: "var(--gold)",
      textTransform: "uppercase",
      marginBottom: 12,
    }
  },
    label,
    onAdd && React.createElement("button", {
      type: "button",
      className: "btn btn--ghost",
      style: { padding: "4px 10px", fontSize: 10 },
      onClick: onAdd,
    }, addLabel || "+ Ajouter")
  );

/* ── Équipement editor ───────────────────────────────────────── */
const EquipementEditor = ({ items, onChange }) => {
  const update = (i, key, val) => {
    const next = items.map((it, idx) => idx === i ? { ...it, [key]: val } : it);
    onChange(next);
  };
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const add    = () => onChange([...items, { cat: String(items.length + 1), titre: "", desc: "" }]);

  return React.createElement("div", {
    style: { marginTop: 20, padding: "14px 16px", border: "1px solid var(--line)", background: "var(--char)" }
  },
    React.createElement(SectionHeader, { label: "Ce qu'il faut apporter", onAdd: add, addLabel: "+ Article" }),
    items.map((it, i) =>
      React.createElement("div", {
        key: i,
        style: { display: "grid", gridTemplateColumns: "56px 1fr auto", gap: 8, marginBottom: 8, alignItems: "start" }
      },
        React.createElement("input", {
          className: "field-input",
          value: it.cat,
          onChange: e => update(i, "cat", e.target.value),
          placeholder: "I",
          style: { textAlign: "center" },
          title: "Numéro / catégorie",
        }),
        React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } },
          React.createElement("input", {
            className: "field-input",
            value: it.titre,
            onChange: e => update(i, "titre", e.target.value),
            placeholder: "Titre de l'article",
          }),
          React.createElement("textarea", {
            className: "field-textarea",
            value: it.desc,
            onChange: e => update(i, "desc", e.target.value),
            placeholder: "Description…",
            rows: 2,
          })
        ),
        React.createElement("button", {
          type: "button",
          className: "btn btn--danger",
          style: { padding: "6px 8px", fontSize: 10 },
          onClick: () => remove(i),
        }, "✕")
      )
    )
  );
};

/* ── Agenda editor ───────────────────────────────────────────── */
const AgendaEditor = ({ days, onChange }) => {
  const updateDay = (i, key, val) => {
    const next = days.map((d, idx) => idx === i ? { ...d, [key]: val } : d);
    onChange(next);
  };
  const updateEvt = (di, ei, key, val) => {
    const next = days.map((d, idx) => idx === di
      ? { ...d, evts: d.evts.map((e, eidx) => eidx === ei ? { ...e, [key]: val } : e) }
      : d
    );
    onChange(next);
  };
  const removeEvt = (di, ei) => {
    const next = days.map((d, idx) => idx === di
      ? { ...d, evts: d.evts.filter((_, eidx) => eidx !== ei) }
      : d
    );
    onChange(next);
  };
  const addEvt = (di) => {
    const next = days.map((d, idx) => idx === di
      ? { ...d, evts: [...d.evts, { h: "", t: "" }] }
      : d
    );
    onChange(next);
  };
  const removeDay = (i) => onChange(days.filter((_, idx) => idx !== i));
  const addDay    = () => onChange([...days, {
    roman: String(days.length + 1), code: `DAY·0${days.length}`,
    label: "Nouveau jour", titre: "", evts: []
  }]);

  return React.createElement("div", {
    style: { marginTop: 16, padding: "14px 16px", border: "1px solid var(--line)", background: "var(--char)" }
  },
    React.createElement(SectionHeader, { label: "Agenda", onAdd: addDay, addLabel: "+ Jour" }),
    days.map((day, di) =>
      React.createElement("div", {
        key: di,
        style: { marginBottom: 16, padding: "12px", border: "1px solid var(--line-dim)", background: "var(--ink)" }
      },
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "56px 1fr 1fr auto", gap: 8, marginBottom: 10 } },
          React.createElement("input", {
            className: "field-input",
            value: day.roman,
            onChange: e => updateDay(di, "roman", e.target.value),
            placeholder: "I",
            style: { textAlign: "center" },
            title: "Numéro romain",
          }),
          React.createElement("input", {
            className: "field-input",
            value: day.label,
            onChange: e => updateDay(di, "label", e.target.value),
            placeholder: "Vendredi soir",
            title: "Libellé du jour",
          }),
          React.createElement("input", {
            className: "field-input",
            value: day.titre,
            onChange: e => updateDay(di, "titre", e.target.value),
            placeholder: "Titre du jour",
          }),
          React.createElement("button", {
            type: "button",
            className: "btn btn--danger",
            style: { padding: "6px 8px", fontSize: 10 },
            onClick: () => removeDay(di),
          }, "✕")
        ),
        day.evts.map((evt, ei) =>
          React.createElement("div", {
            key: ei,
            style: { display: "grid", gridTemplateColumns: "80px 1fr auto", gap: 6, marginBottom: 6 }
          },
            React.createElement("input", {
              className: "field-input",
              value: evt.h,
              onChange: e => updateEvt(di, ei, "h", e.target.value),
              placeholder: "16h00",
              style: { textAlign: "center", fontSize: 12 },
            }),
            React.createElement("input", {
              className: "field-input",
              value: evt.t,
              onChange: e => updateEvt(di, ei, "t", e.target.value),
              placeholder: "Description du créneau",
              style: { fontSize: 12 },
            }),
            React.createElement("button", {
              type: "button",
              className: "btn btn--ghost",
              style: { padding: "4px 8px", fontSize: 10 },
              onClick: () => removeEvt(di, ei),
            }, "✕")
          )
        ),
        React.createElement("button", {
          type: "button",
          className: "btn btn--ghost",
          style: { padding: "4px 10px", fontSize: 10, marginTop: 4 },
          onClick: () => addEvt(di),
        }, "+ Créneau")
      )
    )
  );
};

/* ── Tab: Événement ──────────────────────────────────────────── */
const TabEvenement = ({ d, set }) => (
  React.createElement("div", null,

    React.createElement("div", {
      style: { padding: "14px 16px", border: "1px solid var(--line-strong)", marginBottom: 20, background: "var(--char)" }
    },
      React.createElement("label", {
        className: "switch" + (d.infosRevealed ? " is-on" : ""),
        onClick: () => set("infosRevealed", !d.infosRevealed),
      },
        React.createElement("div", {
          className: "switch-track" + (d.infosRevealed ? " is-on" : ""),
          style: { position: "relative" }
        },
          React.createElement("div", { className: "switch-knob" })
        ),
        React.createElement("span", { className: "switch-label" },
          "Infos pratiques · ", d.infosRevealed ? "AFFICHÉES" : "SCELLÉES"
        )
      )
    ),

    React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } },
      React.createElement(Field, { label: "Chasteau",         value: d.chateau,      onChange: v => set("chateau", v) }),
      React.createElement(Field, { label: "Date · libellée",  value: d.dateLabel,    onChange: v => set("dateLabel", v) }),
      React.createElement(Field, { label: "Adresse",          value: d.adresse,      onChange: v => set("adresse", v),      span: 2 }),
      React.createElement(Field, { label: "GPS",              value: d.gps,          onChange: v => set("gps", v),          span: 2 }),
      React.createElement(Field, { label: "Date début",       value: d.dateDebut,    onChange: v => set("dateDebut", v) }),
      React.createElement(Field, { label: "Date fin",         value: d.dateFin,      onChange: v => set("dateFin", v) }),
      React.createElement(Field, { label: "Heure arrivée",    value: d.heureArrivee, onChange: v => set("heureArrivee", v) }),
      React.createElement(Field, { label: "Heure départ",     value: d.heureDepart,  onChange: v => set("heureDepart", v) }),
      React.createElement(Field, { label: "Route (voiture)",  value: d.routeCaleche, onChange: v => set("routeCaleche", v), span: 2 }),
      React.createElement(Field, { label: "Route (train)",    value: d.routeTrain,   onChange: v => set("routeTrain", v),   span: 2 }),
      React.createElement(Field, { label: "Pigeon · email",   value: d.contactEmail, onChange: v => set("contactEmail", v) }),
      React.createElement(Field, { label: "Cor de chasse · tel", value: d.contactTel, onChange: v => set("contactTel", v) }),
      React.createElement(Field, { label: "Compte à rebours (ISO)", value: d.countdownISO, onChange: v => set("countdownISO", v), span: 2, placeholder: "2026-06-12T16:00:00" }),
    ),

    React.createElement("div", {
      style: { marginTop: 20, padding: "14px 16px", border: "1px solid var(--line)", background: "var(--char)" }
    },
      React.createElement("div", {
        style: { fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.26em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 12 }
      }, "Codes de révélation (9)"),
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 } },
        ["I","II","III","IV","V","VI","VII","VIII","IX"].map((roman, i) =>
          React.createElement("div", { key: i, className: "field", style: { margin: 0 } },
            React.createElement("label", { className: "field-label" }, "Code ", roman),
            React.createElement("input", {
              className: "field-input",
              value: (d.revealCodes || [])[i] || "",
              onChange: e => {
                const next = [...(d.revealCodes || Array(9).fill(""))];
                next[i] = e.target.value;
                set("revealCodes", next);
              },
              placeholder: "···",
            })
          )
        )
      )
    ),

    React.createElement("div", {
      style: { marginTop: 20, padding: "14px 16px", border: "1px solid var(--line)", background: "var(--char)" }
    },
      React.createElement("div", {
        style: { fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.26em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 8 }
      }, "Pseudo admin (exclu du classement)"),
      React.createElement("div", {
        style: { fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 13, color: "var(--bone)", opacity: 0.6, marginBottom: 10 }
      }, "Ce pseudo peut jouer normalement mais n'apparaît pas dans le tableau d'honneur."),
      React.createElement("input", {
        className: "field-input",
        value: d.adminPseudo || "",
        onChange: e => set("adminPseudo", e.target.value.trim()),
        placeholder: "Aramis",
        style: { maxWidth: 200 },
      })
    ),

    React.createElement("div", {
      style: { marginTop: 20, padding: "14px 16px", border: "1px solid var(--line)", background: "var(--char)" }
    },
      React.createElement("div", {
        style: { fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.26em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 8 }
      }, "Participants · pseudos autorisés"),
      React.createElement("div", {
        style: { fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 13, color: "var(--bone)", opacity: 0.6, marginBottom: 10 }
      }, "Un pseudo par ligne. Seuls ces noms pourront accéder au site."),
      React.createElement("textarea", {
        className: "field-textarea",
        rows: 8,
        value: (d.allowedPseudos || []).join("\n"),
        onChange: e => set("allowedPseudos", e.target.value.split("\n").map(s => s.trim()).filter(Boolean)),
        placeholder: "Athos\nPorthos\nAramis\n…",
        style: { fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.08em" },
      })
    ),

    React.createElement(EquipementEditor, { items: d.equipement || [], onChange: v => set("equipement", v) }),
    React.createElement(AgendaEditor,     { days: d.agenda || [],    onChange: v => set("agenda", v) })
  )
);

/* ── Tab: Gazette ────────────────────────────────────────────── */
const TabGazette = ({ d, setD }) => {
  const [editing, setEditing] = React.useState(null);

  const posts = [...d.posts].sort((a, b) => b.iso.localeCompare(a.iso));

  const deletePost = (id) => {
    setD(prev => ({ ...prev, posts: prev.posts.filter(p => p.id !== id) }));
  };

  const savePost = (post) => {
    setD(prev => {
      const exists = prev.posts.find(p => p.id === post.id);
      const next = exists
        ? prev.posts.map(p => p.id === post.id ? post : p)
        : [post, ...prev.posts];
      return { ...prev, posts: next };
    });
    setEditing(null);
  };

  if (editing !== null) {
    const existing = editing === "new" ? null : d.posts.find(p => p.id === editing);
    return React.createElement(PostForm, { post: existing, onSave: savePost, onCancel: () => setEditing(null) });
  }

  return (
    React.createElement("div", null,
      React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 16 } },
        React.createElement("button", { className: "btn btn--primary", onClick: () => setEditing("new") }, "+ Nouvelle dépêche")
      ),
      posts.length === 0
        ? React.createElement("div", {
            style: { fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 16, color: "var(--bone)", padding: "24px 0", textAlign: "center" }
          }, "Nulle dépêche. Ajoutez-en une.")
        : posts.map(p =>
            React.createElement("div", { key: p.id, className: "post-card" },
              React.createElement("div", { style: { flex: 1 } },
                React.createElement("div", { className: "post-card-meta" }, p.dateLong),
                React.createElement("div", { className: "post-card-title" }, p.titre)
              ),
              React.createElement("div", { className: "post-card-actions" },
                React.createElement("button", {
                  className: "btn btn--ghost",
                  style: { padding: "6px 10px", fontSize: 10 },
                  onClick: () => setEditing(p.id),
                }, "Éditer"),
                React.createElement("button", {
                  className: "btn btn--danger",
                  style: { padding: "6px 10px", fontSize: 10 },
                  onClick: () => { if (window.confirm("Supprimer cette dépêche ?")) deletePost(p.id); },
                }, "✕")
              )
            )
          )
    )
  );
};

/* ── Post form ───────────────────────────────────────────────── */
const PostForm = ({ post, onSave, onCancel }) => {
  const today = new Date().toISOString().slice(0, 10);
  const [iso, setIso]                   = React.useState(post ? post.iso : today);
  const [publishTime, setPublishTime]   = React.useState(post ? (post.publishAt ? post.publishAt.slice(11, 16) : "12:00") : "12:00");
  const [titre, setTitre]               = React.useState(post ? post.titre : "");
  const [author, setAuthor]             = React.useState(post ? post.author : "Intendance · LBN4E");
  const [kind, setKind]                 = React.useState(post ? post.imageKind : "manuscrit");
  const [imageUrl, setImageUrl]         = React.useState(post ? (post.imageUrl || "") : "");
  const [noImage, setNoImage]           = React.useState(post ? !!post.noImage : false);
  const [youtubeUrl, setYoutubeUrl]     = React.useState(post ? (post.youtubeUrl || "") : "");
  const [text1, setText1]               = React.useState(post ? post.paragraphes[0] : "");
  const [text2, setText2]               = React.useState(post ? (post.paragraphes[1] || "") : "");

  const submit = (e) => {
    e.preventDefault();
    if (!titre.trim() || !iso || !text1.trim()) return;
    const d = new Date(iso);
    const months = ["Janvier","Febvrier","Mars","Avril","May","Juin","Juillet","Aoust","Septembre","Octobre","Novembre","Décembre"];
    const romans  = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];
    const toRoman = (n) => {
      const r = ["","I","II","III","IV","V","VI","VII","VIII","IX"];
      const t = ["","X","XX","XXX","XL","L"];
      return (t[Math.floor(n/10)] || "") + (r[n%10] || "");
    };
    const yyyy = d.getFullYear();
    const mm   = d.getMonth();
    const dd   = d.getDate();
    const yRom = (() => {
      let y = yyyy, res = "";
      const vals = [[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
      for (const [v, s] of vals) { while (y >= v) { res += s; y -= v; } }
      return res;
    })();
    onSave({
      id: post ? post.id : `post-${iso}`,
      iso,
      publishAt: `${iso}T${publishTime}`,
      dateShort: `${String(dd).padStart(2,"0")}·${romans[mm]}·${yRom}`,
      dateLong: `${["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"][d.getDay()]} ${toRoman(dd)} de ${months[mm]} · ${yRom}`,
      titre: titre.trim(),
      author: author.trim(),
      imageKind: kind,
      imageUrl: imageUrl.trim() || null,
      noImage,
      youtubeUrl: youtubeUrl.trim() || null,
      tags: [],
      paragraphes: [text1.trim(), ...(text2.trim() ? [text2.trim()] : [])],
    });
  };

  return (
    React.createElement("form", { onSubmit: submit },
      React.createElement("div", {
        style: { fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.24em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 16 }
      }, post ? "Éditer la dépêche" : "Nouvelle dépêche"),

      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 } },
        React.createElement(Field, { label: "Date (AAAA-MM-JJ)", value: iso, onChange: setIso, type: "date" }),
        React.createElement(Field, { label: "Heure de publication", value: publishTime, onChange: setPublishTime, type: "time" }),
        React.createElement(Field, { label: "Auteur", value: author, onChange: setAuthor }),
      ),
      React.createElement(Field, { label: "Titre", value: titre, onChange: setTitre, placeholder: "Le titre de la dépêche" }),

      React.createElement("div", { className: "field", style: { gridColumn: "1 / -1" } },
        React.createElement("label", {
          className: "switch" + (noImage ? " is-on" : ""),
          onClick: () => setNoImage(v => !v),
          style: { cursor: "pointer" },
        },
          React.createElement("div", { className: "switch-track" + (noImage ? " is-on" : ""), style: { position: "relative" } },
            React.createElement("div", { className: "switch-knob" })
          ),
          React.createElement("span", { className: "switch-label" }, "Sans illustration")
        )
      ),
      React.createElement("div", { className: "field" },
        React.createElement("label", { className: "field-label" }, "Illustration"),
        React.createElement("select", {
          className: "field-input",
          value: kind,
          onChange: e => setKind(e.target.value),
          style: { cursor: "pointer" },
          disabled: noImage || !!imageUrl.trim(),
        },
          React.createElement("option", { value: "manuscrit" }, "Manuscrit"),
          React.createElement("option", { value: "chateau" }, "Château"),
          React.createElement("option", { value: "duel" }, "Duel")
        )
      ),
      React.createElement(Field, { label: "URL d'illustration (remplace l'illustration par défaut)", value: imageUrl, onChange: setImageUrl, placeholder: "https://…", span: 2, disabled: noImage }),
      React.createElement(Field, { label: "URL YouTube (vidéo affichée sous l'illustration)", value: youtubeUrl, onChange: setYoutubeUrl, placeholder: "https://youtu.be/…", span: 2 }),

      React.createElement("div", { className: "field" },
        React.createElement("label", { className: "field-label" }, "Premier paragraphe"),
        React.createElement("textarea", { className: "field-textarea", value: text1, onChange: e => setText1(e.target.value), placeholder: "Le texte principal de la dépêche…", required: true })
      ),
      React.createElement("div", { className: "field" },
        React.createElement("label", { className: "field-label" }, "Second paragraphe (optionnel)"),
        React.createElement("textarea", { className: "field-textarea", value: text2, onChange: e => setText2(e.target.value), placeholder: "Suite de la dépêche…" })
      ),

      React.createElement("div", { style: { display: "flex", gap: 12, marginTop: 8 } },
        React.createElement("button", { type: "submit", className: "btn btn--primary", style: { flex: 1, justifyContent: "center" } }, post ? "Mettre à jour" : "Publier la dépêche"),
        React.createElement("button", { type: "button", className: "btn btn--ghost", onClick: onCancel }, "Annuler")
      )
    )
  );
};

/* ── Shared field component ──────────────────────────────────── */
const Field = ({ label, value, onChange, span = 1, type = "text", placeholder = "", disabled = false }) => (
  React.createElement("div", {
    className: "field",
    style: { ...(span === 2 ? { gridColumn: "1 / -1" } : {}), ...(disabled ? { opacity: 0.4, pointerEvents: "none" } : {}) },
  },
    React.createElement("label", { className: "field-label" }, label),
    React.createElement("input", {
      type,
      className: "field-input",
      value: value || "",
      onChange: e => onChange(e.target.value),
      placeholder,
      disabled,
    })
  )
);

/* ── Tab: Jeux ───────────────────────────────────────────────── */
const JEUX_ADMIN_GAMES = [
  { id: "memoire",    num: "01", title: "Mémoire flash" },
  { id: "suite",      num: "02", title: "Suite logique" },
  { id: "anagrammes", num: "03", title: "Anagrammes" },
  { id: "reflexes",   num: "04", title: "Réflexes" },
  { id: "cible",      num: "05", title: "Cible mobile" },
  { id: "tempo",      num: "06", title: "Tap-tempo" },
  { id: "drapeaux",   num: "07", title: "Drapeaux" },
  { id: "capitales",  num: "08", title: "Capitales" },
  { id: "annee",      num: "09", title: "Devine l'année" },
];

const TabJeux = ({ d, set }) => {
  const indices = d.jeuxIndices || {};
  const update  = (key, val) => set("jeuxIndices", { ...indices, [key]: val });

  return React.createElement("div", null,
    React.createElement("div", {
      style: { fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.26em", color: "var(--bone)", textTransform: "uppercase", marginBottom: 12, fontStyle: "italic" }
    }, "Ces textes apparaissent dans la carte d'indice une fois l'épreuve validée. Laissez vide pour masquer."),

    React.createElement("div", { className: "jeux-admin-grid" },
      JEUX_ADMIN_GAMES.map(g =>
        React.createElement("div", { key: g.id, className: "jeux-admin-card" },
          React.createElement("div", { className: "jeux-admin-card__title" }, `${g.num} · ${g.title}`),
          [1, 2, 3].map(lv =>
            React.createElement("div", { key: lv, className: "jeux-admin-field" },
              React.createElement("label", null, `Indice ${g.num}·${lv} — Niveau ${["Enfant","Adulte","Maître"][lv-1]}`),
              React.createElement("textarea", {
                rows: 3,
                value: indices[`${g.id}-${lv}`] || "",
                onChange: e => update(`${g.id}-${lv}`, e.target.value),
                placeholder: "Texte de l'indice (ex : « Le code est un prénom, commence par A »)",
              })
            )
          )
        )
      )
    )
  );
};

window.IntendancePage = IntendancePage;
