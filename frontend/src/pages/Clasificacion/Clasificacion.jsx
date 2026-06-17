import { useEffect, useMemo, useState } from "react";
import { getRanking } from "../../services/classificationService";
import "./Clasificacion.css";

function Clasificacion() {
    const [ranking, setRanking] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        const loadRanking = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getRanking();
            const data = response.data?.ranking || [];
            setRanking(data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "No se pudo cargar la clasificación.");
        } finally {
            setLoading(false);
        }
        };

        loadRanking();
    }, []);

    const filteredRanking = useMemo(() => {
        return ranking.filter((player) =>
        (player.username || "")
            .toLowerCase()
            .includes(search.toLowerCase())
        );
    }, [ranking, search]);

    const getAvatar = (player) =>
        player.avatar ? `/public/${player.avatar}` : "/avatars/default-avatar.png";

    const getName = (player) => player.username || "Usuario";

    if (loading) return <h1 className="page-message">Cargando clasificación...</h1>;
    if (error) return <h1 className="page-message page-message--error">{error}</h1>;

    return (
        <div className="ranking-page">
        <main className="ranking-content">
            <h1 className="page-title">Clasificación</h1>
            <p className="page-subtitle">Ranking general de usuarios por puntos.</p>

            <div className="ranking-search">
            <input
                type="text"
                placeholder="Buscar usuario"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            </div>

            {filteredRanking.length === 0 ? (
            <p className="empty-state">No hay usuarios para mostrar.</p>
            ) : (
            <div className="ranking-list">
                {filteredRanking.map((player) => (
                <article
                    key={player.user_id}
                    className={`ranking-card ${player.rank_position <= 3 ? "ranking-card--top" : ""}`}
                >
                    <div className="ranking-card__left">
                    <span className="ranking-position">#{player.rank_position}</span>

                    <img
                        src={getAvatar(player)}
                        alt={getName(player)}
                        className="ranking-avatar"
                    />

                    <div className="ranking-info">
                        <h3>{getName(player)}</h3>
                        <small>
                        Exactas: {player.exact_predictions || 0} | Diferencias:{" "}
                        {player.correct_differences || 0} | Ganadores:{" "}
                        {player.correct_winners || 0}
                        </small>
                    </div>
                    </div>

                    <strong className="ranking-points">
                    {player.total_points || 0} pts
                    </strong>
                </article>
                ))}
            </div>
            )}
        </main>
        </div>
    );
}

export default Clasificacion;