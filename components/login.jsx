/* global React */

const SiteLogin = ({ onSuccess, sitePassword }) => {
  const [pwd, setPwd]   = React.useState("");
  const [err, setErr]   = React.useState(false);
  const [shake, setShake] = React.useState(false);
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 140);
    return () => clearInterval(id);
  }, []);

  const glyphs = "▓▒░█◆◇※★✦";
  const noise = (n) => Array.from({ length: n }, (_, i) => glyphs[(i * 7 + tick) % glyphs.length]).join("");

  const submit = (e) => {
    e.preventDefault();
    if (pwd.toLowerCase().trim() === (sitePassword || "").toLowerCase().trim()) {
      try { sessionStorage.setItem("lbn4e-site", "1"); } catch(ex) {}
      onSuccess();
    } else {
      setErr(true);
      setPwd("");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    React.createElement("div", { className: "site-login-stage" },
      React.createElement("div", { className: "bg-stage" }),

      /* Scanline sweep */
      React.createElement("div", {
        style: {
          position: "fixed",
          top: 0,
          left: `${(tick * 2) % 110 - 10}%`,
          width: "8%",
          height: "100vh",
          background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.025), transparent)",
          pointerEvents: "none",
          zIndex: 0,
        }
      }),

      React.createElement("div", { className: "site-login-box" + (shake ? " is-shaking" : "") },

        /* Brand */
        React.createElement("div", { style: { textAlign: "center", marginBottom: 32 } },
          React.createElement("div", {
            style: {
              fontFamily: "var(--font-display)",
              fontSize: "clamp(32px, 6vw, 56px)",
              fontWeight: 700,
              letterSpacing: "0.2em",
              color: "var(--gold-bright)",
              textTransform: "uppercase",
              lineHeight: 1,
              marginBottom: 8,
            }
          },
            "LBN",
            React.createElement("span", { style: { color: "var(--neon-cyan)" } }, "4"),
            "E"
          ),
          React.createElement("div", {
            style: {
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 18,
              color: "var(--bone)",
              marginBottom: 16,
            }
          }, "De Cape & de Clavier"),
          React.createElement("div", {
            style: {
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              letterSpacing: "0.32em",
              color: "var(--neon-magenta)",
              textTransform: "uppercase",
            }
          }, "● Accès restreint · Compaignie privée")
        ),

        /* Noise bar */
        React.createElement("div", {
          style: {
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.22em",
            color: "var(--gold)",
            opacity: 0.45,
            textAlign: "center",
            marginBottom: 24,
            overflow: "hidden",
            whiteSpace: "nowrap",
          }
        }, noise(28)),

        /* Form */
        React.createElement("form", { onSubmit: submit },
          React.createElement("div", { className: "field" },
            React.createElement("label", { className: "field-label", style: { textAlign: "center", display: "block" } },
              "Mot de passe d'accès"
            ),
            React.createElement("input", {
              type: "password",
              className: "field-input site-login-input",
              autoFocus: true,
              value: pwd,
              onChange: (e) => { setPwd(e.target.value); setErr(false); },
              placeholder: "············",
              style: { textAlign: "center", letterSpacing: "0.2em", fontSize: 16 },
            })
          ),
          err && React.createElement("div", {
            style: {
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.2em",
              color: "var(--neon-magenta)",
              textTransform: "uppercase",
              textAlign: "center",
              marginBottom: 12,
            }
          }, "// Accès refusé · Point passé"),
          React.createElement("button", {
            type: "submit",
            className: "btn btn--primary",
            style: { width: "100%", justifyContent: "center", marginTop: 8 },
          }, "⚜ Entrer")
        ),

        /* Footer hint */
        React.createElement("div", {
          style: {
            marginTop: 28,
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 14,
            color: "var(--bone)",
            opacity: 0.4,
            textAlign: "center",
          }
        }, "« Tous pour un · un pour tous.exe »")
      )
    )
  );
};

window.SiteLogin = SiteLogin;
