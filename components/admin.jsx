/* global React */

/* ---------------------------------------------------------------
   ADMIN PANEL
   Tab 1 — Événement : toggle infos + edit all event fields
   Tab 2 — Gazette   : list / add / edit / delete posts
   --------------------------------------------------------------- */

const AdminPanel = ({ open, onClose, isAdmin, onLogin, onLogout, data, onUpdateData }) => {
  if (!open) return null;
  return (
    React.createElement("div", {
      className: "modal-stage",
      onClick: (e) => { if (e.target.classList.contains("modal-stage")) onClose(); }
    },
      !isAdmin
        ? React.createElement(AdminLogin, { onLogin, onClose })
        : React.createElement(AdminEditor, { data, onUpdateData, onClose, onLogout })
    )
  );
};

/* ---------- LOGIN ---------- */
const AdminLogin = ({ onLogin, onClose }) => {
  const [pwd, setPwd] = React.useState("");
  const [err, setErr] = React.useState(false);
  const submit = async (e) => {
    e.preventDefault();
    const ok = await onLogin(pwd);
    if (ok) onClose();
    else { setErr(true); setPwd(""); }
  };
  return (
    React.createElement("div", { className: "modal", onClick: (e) => e.stopPropagation() },
      React.createElement("button", { className: "modal-close", onClick: onClose }, "✕"),
      React.createElement("div", { className: "modal-eyebrow" }, "✠ Sceau de Sa Majesté ✠"),
      React.createElement("h2", { className: "modal-title" }, "Intendance"),
      React.createElement("p", { className: "modal-sub" }, "« Mot de passe requis pour franchir le poste de garde. »"),
      React.createElement("form", { onSubmit: submit },
        React.createElement("div", { className: "field" },
          React.createElement("label", { className: "field-label" }, "Mot de passe"),
          React.createElement("input", {
            type: "password",
            className: "field-input",
            autoFocus: true,
            value: pwd,
            onChange: (e) => { setPwd(e.target.value); setErr(false); },
            placeholder: "••••••••",
          }),
          err && React.createElement("div", {
            style: {
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.18em",
              color: "var(--neon-magenta)",
              marginTop: 8,
              textTransform: "uppercase",
            }
          }, "// access denied — point passé")
        ),
        React.createElement("div", { style: { display: "flex", gap: 12, marginTop: 24 } },
          React.createElement("button", {
            type: "submit",
            className: "btn btn--primary",
            style: { flex: 1, justifyContent: "center" }
          }, "⚜ Apposer le sceau"),
          React.createElement("button", {
            type: "button",
            className: "btn btn--ghost",
            onClick: onClose
          }, "Annuler")
        ),
      )
    )
  );
};

/* ---------- EDITOR ---------- */
const AdminEditor = ({ data, onUpdateData, onClose, onLogout }) => {
  const [tab, setTab] = React.useState("evenement");
  const [d, setD] = React.useState(data);
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));

  const save = () => { onUpdateData(d); onClose(); };

  const tabs = [
    { id: "evenement", label: "Événement" },
    { id: "gazette",   label: "Gazette" },
  ];

  return (
    React.createElement("div", {
      className: "modal modal-wide",
      style: { maxHeight: "88vh", overflowY: "auto", display: "flex", flexDirection: "column" },
      onClick: (e) => e.stopPropagation()
    },
      React.createElement("button", { className: "modal-close", onClick: onClose }, "✕"),
      React.createElement("div", { className: "modal-eyebrow" }, "✠ Intendance · Mode Édition ✠"),
      React.createElement("h2", { className: "modal-title" }, "Tenir les Registres"),

      /* Tabs */
      React.createElement("div", { className: "admin-tabs" },
        tabs.map(t =>
          React.createElement("button", {
            key: t.id,
            className: "admin-tab" + (tab === t.id ? " is-active" : ""),
            onClick: () => setTab(t.id),
          }, t.label)
        )
      ),

      /* Tab: Événement */
      tab === "evenement" && React.createElement(TabEvenement, { d, set }),

      /* Tab: Gazette */
      tab === "gazette" && React.createElement(TabGazette, { d, setD }),

      /* Footer buttons */
      React.createElement("div", {
        style: {
          display: "flex",
          gap: 12,
          marginTop: 20,
          paddingTop: 16,
          borderTop: "1px solid var(--line-dim)",
          position: "sticky",
          bottom: 0,
          background: "var(--ink)",
        }
      },
        React.createElement("button", {
          className: "btn btn--primary",
          style: { flex: 1, justifyContent: "center" },
          onClick: save,
        }, "⚜ Sceller les modifications"),
        React.createElement("button", {
          className: "btn btn--ghost",
          onClick: () => { onLogout(); onClose(); },
        }, "Déconnexion")
      )
    )
  );
};

/* ---------- TAB: ÉVÉNEMENT ---------- */
const TabEvenement = ({ d, set }) => (
  React.createElement("div", null,

    /* Toggle infos */
    React.createElement("div", {
      style: {
        padding: "14px 16px",
        border: "1px solid var(--line-strong)",
        marginBottom: 20,
        background: "var(--char)",
      }
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
      React.createElement(Field, { label: "Chasteau", value: d.chateau, onChange: v => set("chateau", v) }),
      React.createElement(Field, { label: "Date · libellée", value: d.dateLabel, onChange: v => set("dateLabel", v) }),
      React.createElement(Field, { label: "Adresse", value: d.adresse, onChange: v => set("adresse", v), span: 2 }),
      React.createElement(Field, { label: "GPS", value: d.gps, onChange: v => set("gps", v), span: 2 }),
      React.createElement(Field, { label: "Date début", value: d.dateDebut, onChange: v => set("dateDebut", v) }),
      React.createElement(Field, { label: "Date fin", value: d.dateFin, onChange: v => set("dateFin", v) }),
      React.createElement(Field, { label: "Heure arrivée", value: d.heureArrivee, onChange: v => set("heureArrivee", v) }),
      React.createElement(Field, { label: "Heure départ", value: d.heureDepart, onChange: v => set("heureDepart", v) }),
      React.createElement(Field, { label: "Route (voiture)", value: d.routeCaleche, onChange: v => set("routeCaleche", v), span: 2 }),
      React.createElement(Field, { label: "Route (train)", value: d.routeTrain, onChange: v => set("routeTrain", v), span: 2 }),
      React.createElement(Field, { label: "Pigeon · email", value: d.contactEmail, onChange: v => set("contactEmail", v) }),
      React.createElement(Field, { label: "Cor de chasse · tel", value: d.contactTel, onChange: v => set("contactTel", v) }),
      React.createElement(Field, { label: "Compte à rebours (ISO)", value: d.countdownISO, onChange: v => set("countdownISO", v), span: 2, placeholder: "2026-06-12T16:00:00" }),
      React.createElement(Field, { label: "Mot de passe du site (accès global)", value: d.sitePassword, onChange: v => set("sitePassword", v), span: 2, placeholder: "mousquet" }),
    ),

    React.createElement("div", {
      style: {
        marginTop: 20,
        padding: "14px 16px",
        border: "1px solid var(--line)",
        background: "var(--char)",
      }
    },
      React.createElement("div", {
        style: {
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.26em",
          color: "var(--gold)",
          textTransform: "uppercase",
          marginBottom: 12,
        }
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
    )
  )
);

/* ---------- TAB: GAZETTE ---------- */
const TabGazette = ({ d, setD }) => {
  const [editing, setEditing] = React.useState(null); // null | "new" | post.id

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
    return React.createElement(PostForm, {
      post: existing,
      onSave: savePost,
      onCancel: () => setEditing(null),
    });
  }

  return (
    React.createElement("div", null,
      React.createElement("div", {
        style: { display: "flex", justifyContent: "flex-end", marginBottom: 16 }
      },
        React.createElement("button", {
          className: "btn btn--primary",
          onClick: () => setEditing("new"),
        }, "+ Nouvelle dépêche")
      ),

      posts.length === 0
        ? React.createElement("div", {
            style: {
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 16,
              color: "var(--bone)",
              padding: "24px 0",
              textAlign: "center",
            }
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
                  onClick: () => {
                    if (window.confirm("Supprimer cette dépêche ?")) deletePost(p.id);
                  },
                }, "✕")
              )
            )
          )
    )
  );
};

/* ---------- POST FORM ---------- */
const PostForm = ({ post, onSave, onCancel }) => {
  const today = new Date().toISOString().slice(0, 10);
  const [iso, setIso]         = React.useState(post ? post.iso : today);
  const [titre, setTitre]     = React.useState(post ? post.titre : "");
  const [author, setAuthor]   = React.useState(post ? post.author : "Intendance · LBN4E");
  const [kind, setKind]       = React.useState(post ? post.imageKind : "manuscrit");
  const [imageUrl, setImageUrl]     = React.useState(post ? (post.imageUrl || "") : "");
  const [noImage, setNoImage]       = React.useState(post ? !!post.noImage : false);
  const [youtubeUrl, setYoutubeUrl] = React.useState(post ? (post.youtubeUrl || "") : "");
  const [text1, setText1]     = React.useState(post ? post.paragraphes[0] : "");
  const [text2, setText2]     = React.useState(post ? (post.paragraphes[1] || "") : "");

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

    const saved = {
      id: post ? post.id : `post-${iso}`,
      iso,
      dateShort: `${String(dd).padStart(2,"0")}·${romans[mm]}·${yRom}`,
      dateLong: `${["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"][d.getDay()]} ${toRoman(dd)} de ${months[mm]} · ${yRom}`,
      titre: titre.trim(),
      author: author.trim(),
      imageKind: kind,
      imageUrl: imageUrl.trim() || null,
      noImage: noImage,
      youtubeUrl: youtubeUrl.trim() || null,
      tags: [],
      paragraphes: [text1.trim(), ...(text2.trim() ? [text2.trim()] : [])],
    };
    onSave(saved);
  };

  return (
    React.createElement("form", { onSubmit: submit },
      React.createElement("div", {
        style: {
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.24em",
          color: "var(--gold)",
          textTransform: "uppercase",
          marginBottom: 16,
        }
      }, post ? "Éditer la dépêche" : "Nouvelle dépêche"),

      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } },
        React.createElement(Field, { label: "Date (AAAA-MM-JJ)", value: iso, onChange: setIso, type: "date" }),
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
      React.createElement(Field, {
        label: "URL d'illustration (remplace l'illustration par défaut)",
        value: imageUrl,
        onChange: setImageUrl,
        placeholder: "https://…",
        span: 2,
        disabled: noImage,
      }),
      React.createElement(Field, {
        label: "URL YouTube (vidéo affichée sous l'illustration)",
        value: youtubeUrl,
        onChange: setYoutubeUrl,
        placeholder: "https://youtu.be/… ou https://youtube.com/watch?v=…",
        span: 2,
      }),

      React.createElement("div", { className: "field" },
        React.createElement("label", { className: "field-label" }, "Premier paragraphe"),
        React.createElement("textarea", {
          className: "field-textarea",
          value: text1,
          onChange: e => setText1(e.target.value),
          placeholder: "Le texte principal de la dépêche…",
          required: true,
        })
      ),

      React.createElement("div", { className: "field" },
        React.createElement("label", { className: "field-label" }, "Second paragraphe (optionnel)"),
        React.createElement("textarea", {
          className: "field-textarea",
          value: text2,
          onChange: e => setText2(e.target.value),
          placeholder: "Suite de la dépêche…",
        })
      ),

      React.createElement("div", { style: { display: "flex", gap: 12, marginTop: 8 } },
        React.createElement("button", {
          type: "submit",
          className: "btn btn--primary",
          style: { flex: 1, justifyContent: "center" },
        }, post ? "Mettre à jour" : "Publier la dépêche"),
        React.createElement("button", {
          type: "button",
          className: "btn btn--ghost",
          onClick: onCancel,
        }, "Annuler")
      )
    )
  );
};

/* ---------- SHARED FIELD COMPONENT ---------- */
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

window.AdminPanel = AdminPanel;
