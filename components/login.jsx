/* global React */

// ── Modal de login utilisateur (pseudo uniquement) ─────────────────
const UserLoginModal = ({ onLogin }) => {
  const [pseudo, setPseudo] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError]   = React.useState(null);
  const [tick, setTick]     = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 140);
    return () => clearInterval(id);
  }, []);

  const glyphs = "▓▒░█◆◇※★✦";
  const noise  = (n) => Array.from({ length: n }, (_, i) => glyphs[(i * 7 + tick) % glyphs.length]).join("");

  const submit = async (e) => {
    e.preventDefault();
    if (!pseudo.trim() || loading) return;
    setLoading(true);
    setError(null);
    const result = await onLogin(pseudo);
    if (!result.ok) {
      setError(result.error || "Erreur inconnue");
      setLoading(false);
    }
    // Si ok, le parent re-render avec user défini → modal disparaît
  };

  return (
    <div className="modal-stage" style={{ zIndex: 300 }}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-eyebrow">⚜ Identification du Mousquetaire ⚜</div>
        <h2 className="modal-title">Ton nom de guerre</h2>
        <p className="modal-sub">
          Choisis un pseudo — il apparaîtra dans le tableau d'honneur.
          Sur un autre appareil, saisis le même pour retrouver ta progression.
        </p>

        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          letterSpacing: "0.3em",
          color: "var(--gold)",
          opacity: 0.4,
          textAlign: "center",
          marginBottom: 20,
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}>
          {noise(32)}
        </div>

        <form onSubmit={submit}>
          <div className="field">
            <label className="field-label" style={{ textAlign: "center", display: "block" }}>
              Pseudo · 2 à 24 caractères
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
            disabled={loading || pseudo.trim().length < 2}
          >
            {loading ? "Vérification…" : "⚜ Rejoindre la compaignie"}
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
