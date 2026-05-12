/* global React */

const HexMark = ({ size = 32 }) => (
  React.createElement("svg", { viewBox: "0 0 40 40", width: size, height: size, fill: "none" },
    React.createElement("polygon", { points: "20,4 34,12 34,28 20,36 6,28 6,12", stroke: "#D4A24C", strokeWidth: "1.4" }),
    React.createElement("path", { d: "M20 12 C 19 15, 17.5 16, 17.5 18 C 17.5 19.5, 18.5 20.5, 20 20.5 C 21.5 20.5, 22.5 19.5, 22.5 18 C 22.5 16, 21 15, 20 12 Z", fill: "#D4A24C" }),
    React.createElement("path", { d: "M20 20.5 L 20 26", stroke: "#D4A24C", strokeWidth: "1" }),
    React.createElement("path", { d: "M16.5 22 L 23.5 22", stroke: "#D4A24C", strokeWidth: "0.8" })
  )
);

const Brand = () => (
  React.createElement("a", { href: "#/", className: "brand" },
    React.createElement(HexMark, null),
    React.createElement("span", { className: "brand-text" },
      "LBN",
      React.createElement("span", { style: { color: "var(--neon-cyan)" } }, "4"),
      "E"
    )
  )
);

/* ── User chip + dropdown ─────────────────────────────────────── */
const UserChip = ({ user, onLogout }) => {
  const [open, setOpen]   = React.useState(false);
  const [stats, setStats] = React.useState(null);
  const ref               = React.useRef(null);

  React.useEffect(() => {
    if (!open || !user) return;
    setStats(null);
    const sb = window.__supabase;
    if (!sb) { setStats({ indices: 0, codes: 0 }); return; }
    Promise.all([
      sb.from("user_indices").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      sb.from("user_codes").select("*",   { count: "exact", head: true }).eq("user_id", user.id),
    ]).then(([i, c]) => {
      setStats({ indices: i.count || 0, codes: c.count || 0 });
    }, () => setStats({ indices: 0, codes: 0 }));
  }, [open, user]);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const Icon = () => React.createElement("svg", {
    width: 12, height: 12, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round",
  },
    React.createElement("path",   { d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" }),
    React.createElement("circle", { cx: 12, cy: 7, r: 4 })
  );

  return React.createElement("div", { className: "user-chip-wrap", ref },
    React.createElement("button", {
      className: "user-chip" + (open ? " is-open" : ""),
      onClick: () => setOpen(v => !v),
    }, React.createElement(Icon), React.createElement("span", { className: "user-chip__pseudo" }, user.pseudo)),

    open && React.createElement("div", { className: "user-dropdown" },
      React.createElement("div", { className: "user-dropdown__pseudo" }, user.pseudo),
      React.createElement("div", { className: "user-dropdown__divider" }),
      stats
        ? React.createElement(React.Fragment, null,
            React.createElement("div", { className: "user-dropdown__stat" },
              React.createElement("span", { className: "user-dropdown__stat-num" }, stats.indices),
              React.createElement("span", { className: "user-dropdown__stat-label" }, " / 27 indices")
            ),
            React.createElement("div", { className: "user-dropdown__stat" },
              React.createElement("span", { className: "user-dropdown__stat-num" }, stats.codes),
              React.createElement("span", { className: "user-dropdown__stat-label" }, " / 20 codes")
            )
          )
        : React.createElement("div", { className: "user-dropdown__loading" }, "…"),
      React.createElement("div", { className: "user-dropdown__divider" }),
      React.createElement("button", {
        className: "user-dropdown__logout",
        onClick: () => { setOpen(false); onLogout(); },
      }, "Déconnexion")
    )
  );
};

const Topbar = ({ route, user, onLogout }) => {
  const links = [
    { to: "#/", label: "Maison" },
    { to: "#/gazette", label: "Gazette" },
    { to: "#/jeux", label: "Jeux" },
  ];
  const here = route.startsWith("#/gazette")    ? "#/gazette"
             : route.startsWith("#/jeux")       ? "#/jeux"
             : route.startsWith("#/intendance") ? null
             : "#/";
  return (
    React.createElement("header", { className: "topbar" },
      React.createElement("div", { className: "shell topbar-inner" },
        React.createElement(Brand, null),
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
          React.createElement("nav", { className: "nav" },
            links.map(l =>
              React.createElement("a", {
                key: l.to,
                href: l.to,
                className: "nav-link" + (here === l.to ? " is-active" : "")
              }, l.label)
            )
          ),
          user && React.createElement(UserChip, { user, onLogout })
        )
      )
    )
  );
};

const Divider = () =>
  React.createElement("div", { className: "divider" },
    React.createElement("div", { className: "divider-line" }),
    React.createElement("span", { className: "divider-orn" }, "⚜  ✠  ⚔  ✠  ⚜"),
    React.createElement("div", { className: "divider-line" }),
  );

const Footer = () => (
  React.createElement("footer", { className: "footer" },
    React.createElement("div", { className: "shell" },
      React.createElement("div", { className: "footer-ornament" },
        "⚜ · · · ",
        React.createElement("a", {
          href: "#/intendance",
          style: { color: "inherit", opacity: 0.12, textDecoration: "none" },
          tabIndex: -1,
          "aria-hidden": "true",
        }, "✠"),
        " · · · ⚔ · · · ✠ · · · ⚜"
      ),
      React.createElement("div", { className: "footer-inner" },
        React.createElement("div", { className: "footer-mark" }, "⚜ Weekend LBN4E ⚜"),
        React.createElement("div", { className: "footer-meta" }, "Tous pour un · un pour tous.exe")
      )
    )
  )
);

Object.assign(window, { HexMark, Brand, Topbar, Footer, Divider });

