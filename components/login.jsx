/* global React */

// ── Modal de login utilisateur (choix dans liste prédéfinie) ───────
const UserLoginModal = ({ onLogin, allowedPseudos }) => {
  const [loading, setLoading]   = React.useState(false);
  const [error, setError]       = React.useState(null);
  const [selected, setSelected] = React.useState(null);
  const [tick, setTick]         = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 140);
    return () => clearInterval(id);
  }, []);

  const glyphs = "▓▒░█◆◇※★✦";
  const noise  = (n) => Array.from({ length: n }, (_, i) => glyphs[(i * 7 + tick) % glyphs.length]).join("");

  const pseudos = allowedPseudos || [];

  const pick = async (pseudo) => {
    if (loading) return;
    setSelected(pseudo);
    setLoading(true);
    setError(null);
    const result = await onLogin(pseudo);
    if (!result.ok) {
      setError(result.error || "Erreur inconnue");
      setLoading(false);
      setSelected(null);
    }
  };

  return (
    <div className="modal-stage" style={{ zIndex: 300 }}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-eyebrow">⚜ Identification du Mousquetaire ⚜</div>
        <h2 className="modal-title">Qui es-tu ?</h2>
        <p className="modal-sub">
          Choisis ton nom dans la liste pour accéder au site.
          Sur un autre appareil, sélectionne le même pour retrouver ta progression.
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

        {pseudos.length === 0 ? (
          <div style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 15,
            color: "var(--bone)",
            opacity: 0.6,
            textAlign: "center",
            padding: "24px 0",
          }}>
            Aucun accès configuré — l'intendance doit d'abord renseigner la liste des participants.
          </div>
        ) : (
          <div className="pseudo-grid">
            {pseudos.map(pseudo => (
              <button
                key={pseudo}
                className={`pseudo-btn${selected === pseudo ? " is-loading" : ""}`}
                onClick={() => pick(pseudo)}
                disabled={loading}
              >
                {selected === pseudo && loading ? "…" : pseudo}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.2em",
            color: "var(--neon-magenta)",
            textTransform: "uppercase",
            textAlign: "center",
            marginTop: 16,
          }}>
            // {error}
          </div>
        )}

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
