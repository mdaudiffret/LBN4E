/* global React, ReactDOM */

// Disable browser scroll restoration so our anchor scroll isn't overridden
if (history.scrollRestoration) history.scrollRestoration = "manual";

const ADMIN_PWD_HASH = "cadc62047f58dce349fe916385c2b3802c37490b02bc2135b298253d8f17b6f7";

const hashPassword = async (pwd) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pwd.toLowerCase().trim()));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
};

const useRoute = () => {
  const [route, setRoute] = React.useState(window.location.hash || "#/");
  React.useEffect(() => {
    const h = () => setRoute(window.location.hash || "#/");
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);
  return route;
};

const useStoredData = () => {
  const [data, _set] = React.useState(() => {
    try {
      const raw = localStorage.getItem("lbn4e-data");
      if (raw) return { ...window.DEFAULT_DATA, ...JSON.parse(raw) };
    } catch(e) {}
    return window.DEFAULT_DATA;
  });
  // Saves to React state + localStorage only (no sheet sync)
  const saveLocal = (next) => {
    _set(next);
    try { localStorage.setItem("lbn4e-data", JSON.stringify(next)); } catch(e) {}
  };
  return [data, saveLocal];
};

const toUrlSafeBase64 = (obj) => {
  const str = JSON.stringify(obj);
  // encode UTF-8 → binary → base64, then make URL-safe
  const b64 = btoa(unescape(encodeURIComponent(str)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
};

const sheetSync = (next) => {
  const url = window.DEFAULT_DATA.sheetUrl;
  const token = window.DEFAULT_DATA.sheetWriteToken;
  if (!url || !token) return;
  const { posts, sheetUrl: _u, sheetWriteToken: _t, infosRevealed: _r, ...infos } = next;
  const postWrite = (action, data) => {
    const body = new URLSearchParams({ action, token, data: JSON.stringify(data) });
    fetch(url, { method: "POST", mode: "no-cors", body }).catch(() => {});
  };
  postWrite("write_infos", infos);
  postWrite("write_posts", posts);
};

const App = () => {
  const route = useRoute();
  const [data, saveLocal] = useStoredData();
  const [adminOpen, setAdminOpen] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(() => {
    try { return sessionStorage.getItem("lbn4e-admin") === "1"; } catch(e) { return false; }
  });

  // On mount: fetch latest data from sheet
  React.useEffect(() => {
    const url = window.DEFAULT_DATA.sheetUrl;
    if (!url) return;
    fetch(`${url}?t=${Date.now()}`)
      .then(r => r.json())
      .then(({ infos, posts: sheetPosts }) => {
        const { infosRevealed: _r, ...safeInfos } = infos || {};
        const next = { ...window.DEFAULT_DATA, ...data, ...safeInfos };
        if (sheetPosts && sheetPosts.length) {
          // Merge : préserve les posts locaux absents du sheet (sync raté)
          const sheetById = Object.fromEntries(sheetPosts.map(p => [p.id, p]));
          const localOnly = (data.posts || []).filter(p => !sheetById[p.id]);
          next.posts = [...sheetPosts, ...localOnly].sort((a, b) => b.iso.localeCompare(a.iso));
        }
        saveLocal(next);
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Saves locally + syncs to sheet (used for all admin/user writes)
  const setData = (next) => {
    saveLocal(next);
    sheetSync(next);
  };

  const onLogin = async (pwd) => {
    const h = await hashPassword(pwd);
    if (h === ADMIN_PWD_HASH) {
      setIsAdmin(true);
      try { sessionStorage.setItem("lbn4e-admin", "1"); } catch(e) {}
      return true;
    }
    return false;
  };

  const onLogout = () => {
    setIsAdmin(false);
    try { sessionStorage.removeItem("lbn4e-admin"); } catch(e) {}
  };

  React.useEffect(() => {
    const parts = route.split("#").filter(Boolean);
    if (parts.length >= 2) {
      const id = parts[parts.length - 1];
      let attempts = 0;
      const tryScroll = () => {
        const el = document.getElementById(id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
        } else if (++attempts < 12) {
          setTimeout(tryScroll, 250);
        }
      };
      setTimeout(tryScroll, 400);
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [route]);

  const page = route.startsWith("#/gazette") ? "gazette"
             : route.startsWith("#/jeux")   ? "jeux"
             : "maison";

  return (
    React.createElement(React.Fragment, null,
      React.createElement("div", { className: "bg-stage" }),
      React.createElement(Topbar, { route, isAdmin, onAdminClick: () => setAdminOpen(true) }),
      page === "maison"  && React.createElement(MaisonPage,  { data, isAdmin, onUpdateData: setData }),
      page === "gazette" && React.createElement(GazettePage, { data, isAdmin }),
      page === "jeux"    && React.createElement(JeuxPage,    { data }),
      React.createElement(Footer, null),
      React.createElement(AdminPanel, {
        open: adminOpen,
        onClose: () => setAdminOpen(false),
        isAdmin,
        onLogin,
        onLogout,
        data,
        onUpdateData: setData,
      })
    )
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
