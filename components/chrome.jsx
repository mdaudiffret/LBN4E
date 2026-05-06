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

const Topbar = ({ route, isAdmin, onAdminClick }) => {
  const links = [
    { to: "#/", label: "Maison" },
    { to: "#/gazette", label: "Gazette" },
    { to: "#/jeux", label: "Jeux" },
  ];
  const here = route.startsWith("#/gazette") ? "#/gazette"
             : route.startsWith("#/jeux")    ? "#/jeux"
             : "#/";
  return (
    React.createElement("header", { className: "topbar" },
      React.createElement("div", { className: "shell topbar-inner" },
        React.createElement(Brand, null),
        React.createElement("nav", { className: "nav" },
          links.map(l =>
            React.createElement("a", {
              key: l.to,
              href: l.to,
              className: "nav-link" + (here === l.to ? " is-active" : "")
            }, l.label)
          )
        ),
        React.createElement("button", {
          className: "admin-pill" + (isAdmin ? " is-on" : ""),
          onClick: onAdminClick
        },
          React.createElement("span", { className: "dot" }),
          React.createElement("span", null, isAdmin ? "Intendance" : "Sceau")
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
      React.createElement("div", { className: "footer-ornament" }, "⚜ · · · ✠ · · · ⚔ · · · ✠ · · · ⚜"),
      React.createElement("div", { className: "footer-inner" },
        React.createElement("div", { className: "footer-mark" }, "⚜ Weekend LBN4E ⚜"),
        React.createElement("div", { className: "footer-meta" }, "Tous pour un · un pour tous.exe")
      )
    )
  )
);

Object.assign(window, { HexMark, Brand, Topbar, Footer, Divider });
