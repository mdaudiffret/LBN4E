/* global React */

// ── Modal de login utilisateur (saisie libre vérifiée contre liste admin) ──
const UserLoginModal = ({ onLogin, allowedPseudos, adminPseudos, configLoaded }) => {
  const [pseudo, setPseudo]   = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError]     = React.useState(null);
  const [tick, setTick]       = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 140);
    return () => clearInterval(id);
  }, []);

  const glyphs = "▓▒░█◆◇※★✦";
  const noise  = (n) => Array.from({ length: n }, (_, i) => glyphs[(i * 7 + tick) % glyphs.length]).join("");

  const submit = async (e) => {
    e.preventDefault();
    const trimmed = pseudo.trim();
    if (!trimmed || loading || !configLoaded) return;

    // Un adminPseudo bypass toujours la liste
    const admins = (adminPseudos || []).map(p => p.toLowerCase());
    const isAdmin = admins.includes(trimmed.toLowerCase());
    if (!isAdmin) {
      const allowed = (allowedPseudos || []).map(p => p.toLowerCase());
      if (!allowed.includes(trimmed.toLowerCase())) {
        setError("Nom non reconnu · Point de passage");
        return;
      }
    }

    setLoading(true);
    setError(null);
    // Utiliser le pseudo tel qu'il est dans la liste (casse canonique)
    const canonical = (allowedPseudos || []).find(p => p.toLowerCase() === trimmed.toLowerCase()) || trimmed;
    const result = await onLogin(canonical);
    if (!result.ok) {
      setError(result.error || "Erreur inconnue");
      setLoading(false);
    }
  };

  return (
    <div className="modal-stage" style={{ zIndex: 300 }}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-eyebrow">⚜ Identification du Chevalier ⚜</div>
        <h2 className="modal-title">Qui es-tu ?</h2>
        <p className="modal-sub">
          Entre ton nom pour accéder au site.
          Sur un autre appareil, saisis le même pour retrouver ta progression.
        </p>

        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          letterSpacing: "0.3em",
          color: "var(--gold)",
          opacity: 0.4,
          textAlign: "center",
          marginBottom: 24,
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}>
          {noise(32)}
        </div>

        <form onSubmit={submit}>
          <div className="field">
            <label className="field-label" style={{ textAlign: "center", display: "block" }}>
              Ton nom
            </label>
            <input
              type="text"
              className="field-input"
              value={pseudo}
              onChange={e => { setPseudo(e.target.value); setError(null); }}
              placeholder="Athos, Porthos, Aramis…"
              maxLength={24}
              autoFocus
              disabled={loading}
              style={{ textAlign: "center", letterSpacing: "0.1em", fontSize: 16 }}
            />
          </div>

          {error && (
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.2em",
              color: "var(--neon-magenta)",
              textTransform: "uppercase",
              textAlign: "center",
              marginBottom: 12,
            }}>
              // {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn--primary"
            style={{ width: "100%", justifyContent: "center", marginTop: 8, opacity: loading ? 0.6 : 1 }}
            disabled={loading || !pseudo.trim() || !configLoaded}
          >
            {!configLoaded ? "Chargement…" : loading ? "Vérification…" : "⚜ Entrer"}
          </button>
        </form>

        <div style={{
          marginTop: 28,
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 13,
          color: "var(--bone)",
          opacity: 0.4,
          textAlign: "center",
        }}>
          « Tous pour un · un pour tous.exe »
        </div>
      </div>
    </div>
  );
};

window.UserLoginModal = UserLoginModal;
