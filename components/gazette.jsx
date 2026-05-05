/* global React */

const GazettePage = ({ data }) => {
  const now = new Date();
  const posts = [...data.posts]
    .filter(p => new Date(p.publishAt || p.iso + "T12:00:00") <= now)
    .sort((a, b) => b.iso.localeCompare(a.iso));
  return (
    React.createElement("div", { className: "page" },
      React.createElement("div", { className: "shell" },
        React.createElement("div", { className: "eyebrow" }, "La Gazette"),
        React.createElement("h1", { className: "page-title" },
          "Nouvelles ",
          React.createElement("em", null, "du chasteau")
        ),
        React.createElement("p", { className: "page-subtitle", style: { marginTop: 16 } },
          "Du plus récent au plus ancien."
        ),
        React.createElement("div", { className: "divider" }),
        posts.length === 0
          ? React.createElement("div", {
              style: {
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: 19,
                color: "var(--bone)",
                textAlign: "center",
                padding: "48px 0",
              }
            }, "Nulle dépêche pour l'heure. Revenez bientôt.")
          : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 64 } },
              posts.map(p => React.createElement(Post, { key: p.id, post: p }))
            )
      )
    )
  );
};

const copyToClipboard = (text) => {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  // Fallback for non-HTTPS or older browsers
  return new Promise((resolve, reject) => {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.cssText = "position:fixed;opacity:0;top:0;left:0";
    document.body.appendChild(el);
    el.focus();
    el.select();
    try {
      document.execCommand("copy") ? resolve() : reject();
    } catch(e) { reject(e); }
    document.body.removeChild(el);
  });
};

const Post = ({ post }) => {
  const [linkUrl, setLinkUrl] = React.useState(null); // null = hidden, string = show URL
  const copyAnchor = () => {
    const base = window.location.href.split("#")[0];
    const url = `${base}#/gazette#${post.id}`;
    setLinkUrl(url);
    copyToClipboard(url).catch(() => {});
    setTimeout(() => setLinkUrl(null), 8000);
  };
  return (
    React.createElement("article", { id: post.id, style: { scrollMarginTop: 80 } },
      React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 14,
          flexWrap: "wrap",
        }
      },
        React.createElement("span", {
          style: {
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.28em",
            color: "var(--gold)",
            textTransform: "uppercase",
          }
        }, post.dateLong),
        React.createElement("button", {
          onClick: copyAnchor,
          title: "Copier le lien vers cette dépêche",
          style: {
            marginLeft: "auto",
            background: linkUrl ? "var(--neon-cyan)" : "transparent",
            border: `1px solid ${linkUrl ? "var(--neon-cyan)" : "var(--line-dim)"}`,
            padding: "5px 10px",
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            letterSpacing: "0.22em",
            color: linkUrl ? "var(--void)" : "var(--bone)",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "all 0.2s",
            whiteSpace: "nowrap",
          }
        }, linkUrl ? "⚯ Lien prêt" : "⚯ Copier le lien")
      ),

      /* URL display — visible 8s after click, selectable for manual copy */
      linkUrl && React.createElement("div", {
        style: {
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }
      },
        React.createElement("input", {
          readOnly: true,
          value: linkUrl,
          onFocus: e => e.target.select(),
          onClick: e => e.target.select(),
          style: {
            flex: 1,
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.08em",
            color: "var(--neon-cyan)",
            background: "var(--char)",
            border: "1px solid var(--neon-cyan)",
            padding: "6px 10px",
            outline: "none",
            cursor: "text",
          }
        })
      ),

      React.createElement("h2", {
        style: {
          fontFamily: "var(--font-display)",
          fontSize: "clamp(24px, 3.4vw, 34px)",
          fontWeight: 600,
          letterSpacing: "0.02em",
          color: "var(--pearl)",
          textTransform: "uppercase",
          margin: "0 0 20px",
          lineHeight: 1.15,
        }
      }, post.titre.split(" · ")[0]),

      !post.noImage && React.createElement(PostImage, { seed: post.id, kind: post.imageKind, imageUrl: post.imageUrl }),
      post.youtubeUrl && React.createElement(YoutubeEmbed, { url: post.youtubeUrl }),

      React.createElement("p", {
        style: {
          fontFamily: "var(--font-serif)",
          fontSize: 18,
          lineHeight: 1.6,
          color: "var(--bone)",
          margin: "20px 0 0",
        }
      }, post.paragraphes[0]),

      post.paragraphes.length > 1 && React.createElement("p", {
        style: {
          fontFamily: "var(--font-serif)",
          fontSize: 17,
          lineHeight: 1.6,
          color: "var(--bone)",
          margin: "12px 0 0",
          opacity: 0.8,
        }
      }, post.paragraphes[1])
    )
  );
};

const PostImage = ({ seed, kind, imageUrl }) => {
  if (imageUrl) {
    return (
      React.createElement("div", {
        style: {
          border: "1px solid var(--line)",
          aspectRatio: "16 / 9",
          overflow: "hidden",
          background: "var(--char)",
        }
      },
        React.createElement("img", {
          src: imageUrl,
          alt: "",
          style: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
          onError: (e) => { e.target.style.display = "none"; },
        })
      )
    );
  }
  const h = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const common = { display: "block", width: "100%", height: "100%" };

  return (
    React.createElement("div", {
      style: {
        border: "1px solid var(--line)",
        aspectRatio: "16 / 9",
        overflow: "hidden",
        background: "var(--char)",
      }
    },
      React.createElement("svg", { viewBox: "0 0 800 450", preserveAspectRatio: "xMidYMid slice", style: common },
        kind === "chateau" && React.createElement(React.Fragment, null,
          React.createElement("defs", null,
            React.createElement("linearGradient", { id: `s-${seed}`, x1: "0", y1: "0", x2: "0", y2: "1" },
              React.createElement("stop", { offset: "0%", stopColor: "#1A1A24" }),
              React.createElement("stop", { offset: "100%", stopColor: "#0A0A12" })
            )
          ),
          React.createElement("rect", { width: "800", height: "450", fill: `url(#s-${seed})` }),
          React.createElement("circle", { cx: "640", cy: "110", r: "42", fill: "#F4C871", opacity: "0.85" }),
          React.createElement("g", { fill: "#0A0A12", stroke: "#D4A24C", strokeWidth: "0.8" },
            React.createElement("path", { d: "M 80 360 L 80 270 L 130 270 L 130 240 L 180 240 L 180 200 L 230 200 L 230 170 L 290 170 L 290 140 L 350 140 L 360 125 L 370 140 L 430 140 L 430 170 L 490 170 L 490 200 L 540 200 L 540 240 L 590 240 L 590 270 L 720 270 L 720 360 Z" })
          ),
          React.createElement("g", { fill: "#F4C871" },
            React.createElement("rect", { x: "200", y: "240", width: "4", height: "10" }),
            React.createElement("rect", { x: "290", y: "200", width: "4", height: "10" }),
            React.createElement("rect", { x: "370", y: "170", width: "4", height: "10", opacity: "0.7" }),
            React.createElement("rect", { x: "490", y: "220", width: "4", height: "10" })
          ),
          React.createElement("line", { x1: "0", y1: "360", x2: "800", y2: "360", stroke: "#00E5FF", strokeWidth: "0.6", opacity: "0.4" }),
          React.createElement("rect", { y: "360", width: "800", height: "90", fill: "#0A0A12" })
        ),

        kind === "duel" && React.createElement(React.Fragment, null,
          React.createElement("rect", { width: "800", height: "450", fill: "#14141F" }),
          React.createElement("defs", null,
            React.createElement("radialGradient", { id: `g-${seed}`, cx: "0.5", cy: "0.5" },
              React.createElement("stop", { offset: "0%", stopColor: "#9B5DE5", stopOpacity: "0.25" }),
              React.createElement("stop", { offset: "100%", stopColor: "#0A0A12", stopOpacity: "0" })
            )
          ),
          React.createElement("ellipse", { cx: "400", cy: "225", rx: "380", ry: "180", fill: `url(#g-${seed})` }),
          React.createElement("g", { stroke: "#D4A24C", strokeWidth: "0.4", opacity: "0.35" },
            React.createElement("line", { x1: "0", y1: "320", x2: "800", y2: "320" }),
            React.createElement("line", { x1: "0", y1: "350", x2: "800", y2: "350" })
          ),
          React.createElement("g", { stroke: "#F4C871", strokeWidth: "1.4", strokeLinecap: "round", fill: "#0A0A12" },
            React.createElement("ellipse", { cx: "290", cy: "220", rx: "13", ry: "15" }),
            React.createElement("line", { x1: "290", y1: "235", x2: "290", y2: "310" }),
            React.createElement("line", { x1: "290", y1: "260", x2: "350", y2: "230" }),
            React.createElement("line", { x1: "350", y1: "230", x2: "500", y2: "218", stroke: "#00E5FF", strokeWidth: "2" }),
            React.createElement("line", { x1: "290", y1: "310", x2: "270", y2: "350" }),
            React.createElement("line", { x1: "290", y1: "310", x2: "310", y2: "350" }),
            React.createElement("ellipse", { cx: "540", cy: "220", rx: "13", ry: "15" }),
            React.createElement("line", { x1: "540", y1: "235", x2: "540", y2: "310" }),
            React.createElement("line", { x1: "540", y1: "260", x2: "480", y2: "230" }),
            React.createElement("line", { x1: "540", y1: "310", x2: "520", y2: "350" }),
            React.createElement("line", { x1: "540", y1: "310", x2: "560", y2: "350" })
          ),
          React.createElement("circle", { cx: "500", cy: "218", r: "5", fill: "#F4C871" }),
          React.createElement("circle", { cx: "500", cy: "218", r: "12", fill: "#F4C871", opacity: "0.3" })
        ),

        (!kind || kind === "manuscrit") && React.createElement(React.Fragment, null,
          React.createElement("defs", null,
            React.createElement("linearGradient", { id: `p-${seed}`, x1: "0", y1: "0", x2: "0", y2: "1" },
              React.createElement("stop", { offset: "0%", stopColor: "#1C1C2A" }),
              React.createElement("stop", { offset: "100%", stopColor: "#0A0A12" })
            )
          ),
          React.createElement("rect", { width: "800", height: "450", fill: `url(#p-${seed})` }),
          React.createElement("g", { transform: "translate(220 80) rotate(-2)" },
            React.createElement("rect", { width: "360", height: "280", fill: "#1A1A24", stroke: "#D4A24C", strokeWidth: "1" }),
            React.createElement("text", { x: "180", y: "60", textAnchor: "middle", fontFamily: "Cinzel, serif", fontSize: "22", fontWeight: "600", fill: "#F4C871", letterSpacing: "3" }, "MANDEMENT"),
            React.createElement("line", { x1: "60", y1: "78", x2: "300", y2: "78", stroke: "#D4A24C", strokeWidth: "0.5" }),
            Array.from({ length: 9 }).map((_, i) =>
              React.createElement("line", { key: i, x1: "40", y1: 108 + i * 18, x2: 40 + 240 + (i * 31 + h) % 50, y2: 108 + i * 18, stroke: "#B8B0A0", strokeWidth: "0.6", opacity: "0.45" })
            ),
            React.createElement("circle", { cx: "290", cy: "240", r: "20", fill: "#FF1B8D", opacity: "0.85" }),
            React.createElement("text", { x: "290", y: "246", textAnchor: "middle", fontFamily: "Cinzel, serif", fontSize: "14", fontWeight: "600", fill: "#F4C871" }, "✠")
          )
        )
      )
    )
  );
};

const YoutubeEmbed = ({ url }) => {
  const getVideoId = (u) => {
    try {
      const parsed = new URL(u);
      if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1);
      if (parsed.searchParams.get("v")) return parsed.searchParams.get("v");
      if (parsed.pathname.startsWith("/embed/")) return parsed.pathname.split("/embed/")[1];
    } catch(e) {}
    return null;
  };
  const id = getVideoId(url);
  if (!id) return null;
  return (
    React.createElement("div", {
      style: {
        border: "1px solid var(--line)",
        aspectRatio: "16 / 9",
        overflow: "hidden",
        background: "var(--void)",
        marginTop: 12,
      }
    },
      React.createElement("iframe", {
        width: "100%",
        height: "100%",
        src: `https://www.youtube-nocookie.com/embed/${id}`,
        title: "Vidéo",
        frameBorder: "0",
        allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
        allowFullScreen: true,
        style: { display: "block", border: "none" },
      })
    )
  );
};

window.GazettePage = GazettePage;
