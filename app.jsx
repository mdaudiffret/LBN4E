/* global React, ReactDOM */

const ADMIN_PWD_HASH = "cadc62047f58dce349fe916385c2b3802c37490b02bc2135b298253d8f17b6f7";

const hashPassword = async (pwd) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pwd.toLowerCase().trim()));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
};

const getSitePassword = () => {
  try {
    const raw = localStorage.getItem("lbn4e-data");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.sitePassword) return parsed.sitePassword;
    }
  } catch(e) {}
  return window.DEFAULT_DATA.sitePassword || "";
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
  const [data, setData] = React.useState(() => {
    try {
      const raw = localStorage.getItem("lbn4e-data");
      if (raw) return { ...window.DEFAULT_DATA, ...JSON.parse(raw) };
    } catch(e) {}
    return window.DEFAULT_DATA;
  });
  const update = (next) => {
    setData(next);
    try { localStorage.setItem("lbn4e-data", JSON.stringify(next)); } catch(e) {}
  };
  return [data, update];
};

const App = () => {
  const [siteAuthed, setSiteAuthed] = React.useState(() => {
    try { return sessionStorage.getItem("lbn4e-site") === "1"; } catch(e) { return false; }
  });

  const route = useRoute();
  const [data, setData] = useStoredData();
  const [adminOpen, setAdminOpen] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(() => {
    try { return sessionStorage.getItem("lbn4e-admin") === "1"; } catch(e) { return false; }
  });

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
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [route]);

  const page = route.startsWith("#/gazette") ? "gazette" : "maison";

  if (!siteAuthed) {
    return React.createElement(SiteLogin, {
      sitePassword: data.sitePassword,
      onSuccess: () => setSiteAuthed(true),
    });
  }

  return (
    React.createElement(React.Fragment, null,
      React.createElement("div", { className: "bg-stage" }),
      React.createElement(Topbar, { route, isAdmin, onAdminClick: () => setAdminOpen(true) }),
      page === "maison"  && React.createElement(MaisonPage,  { data, isAdmin, onUpdateData: setData }),
      page === "gazette" && React.createElement(GazettePage, { data }),
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
