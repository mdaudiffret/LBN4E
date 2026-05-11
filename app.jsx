/* global React, ReactDOM */

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

// ── Configuration de l'app (Supabase) ─────────────────────────────
const useAppConfig = () => {
  const [data, setData]           = React.useState(window.DEFAULT_DATA);
  const [configLoaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    const sb = window.__supabase;
    if (!sb) { setLoaded(true); return; }
    sb.from("app_config").select("data").eq("id", 1).single()
      .then(({ data: row }) => {
        if (row?.data && Object.keys(row.data).length > 0) {
          setData({ ...window.DEFAULT_DATA, ...row.data });
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const saveConfig = (next) => {
    setData(next);
    const sb = window.__supabase;
    if (!sb) return;
    sb.from("app_config")
      .upsert({ id: 1, data: next, updated_at: new Date().toISOString() })
      .then(null, () => {});
  };

  return [data, saveConfig, configLoaded];
};

// ── Session utilisateur (pseudo → localStorage) ────────────────────
const useUser = () => {
  const [user, setUser] = React.useState(() => {
    try {
      const raw = localStorage.getItem("lbn4e-user");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  const loginUser = async (pseudo) => {
    const sb = window.__supabase;
    if (!sb) return { ok: false, error: "Supabase non configuré" };

    const trimmed = pseudo.trim();
    if (trimmed.length < 2) return { ok: false, error: "Pseudo trop court (2 min)" };

    // Chercher un utilisateur existant avec ce pseudo
    const { data: existing } = await sb.from("users").select("*").eq("pseudo", trimmed).maybeSingle();
    if (existing) {
      localStorage.setItem("lbn4e-user", JSON.stringify(existing));
      setUser(existing);
      return { ok: true, user: existing };
    }

    // Créer un nouvel utilisateur
    const { data: created, error } = await sb.from("users").insert({ pseudo: trimmed }).select().single();
    if (error) {
      if (error.code === "23505") return { ok: false, error: "Pseudo déjà pris" };
      return { ok: false, error: "Erreur lors de la création" };
    }
    localStorage.setItem("lbn4e-user", JSON.stringify(created));
    setUser(created);
    return { ok: true, user: created };
  };

  const logoutUser = () => {
    localStorage.removeItem("lbn4e-user");
    setUser(null);
  };

  return [user, loginUser, logoutUser];
};

const App = () => {
  const route = useRoute();
  const [data, saveConfig, configLoaded] = useAppConfig();
  const [user, loginUser, logoutUser] = useUser();
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
    <React.Fragment>
      <div className="bg-stage" />
      <Topbar route={route} isAdmin={isAdmin} onAdminClick={() => setAdminOpen(true)} />
      {page === "maison"  && <MaisonPage  data={data} isAdmin={isAdmin} onUpdateData={saveConfig} user={user} />}
      {page === "gazette" && <GazettePage data={data} isAdmin={isAdmin} />}
      {page === "jeux"    && <JeuxPage    data={data} user={user} onLogout={logoutUser} />}
      <Footer />
      {!user && <UserLoginModal onLogin={loginUser} allowedPseudos={data.allowedPseudos || []} adminPseudo={data.adminPseudo || ""} configLoaded={configLoaded} />}
      <AdminPanel
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        isAdmin={isAdmin}
        onLogin={onLogin}
        onLogout={onLogout}
        data={data}
        onUpdateData={saveConfig}
      />
    </React.Fragment>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
