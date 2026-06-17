import { useEffect, useMemo, useState } from "react";
import { getMyPredictions } from "../../services/predictionService";
import PointsInfo from "../../components/PointsInfo/PointsInfo";
import "./Predicciones.css";

function Predicciones() {
    const [predictions, setPredictions] = useState([]);
    const [stats, setStats] = useState({
        total_points: 0,
        exact_predictions: 0,
        correct_differences: 0,
        correct_winners: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        const loadPredictions = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getMyPredictions();
            const data = response.data?.predictions || [];
            const apiStats = response.data?.stats || {};

            setPredictions(data);
            setStats({
            total_points: apiStats.total_points || 0,
            exact_predictions: apiStats.exact_predictions || 0,
            correct_differences: apiStats.correct_differences || 0,
            correct_winners: apiStats.correct_winners || 0,
            });
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "No se pudieron cargar las predicciones.");
        } finally {
            setLoading(false);
        }
        };

        loadPredictions();
    }, []);

    const getPredictionStatus = (prediction) => {
        if (prediction.status === "upcoming" || prediction.status === "live") {
        return "pending";
        }

        if ((prediction.points_awarded || 0) > 0) {
        return "acertada";
        }

        return "fallida";
    };

    const filteredPredictions = useMemo(() => {
        return predictions.filter((prediction) => {
        if (filter === "all") return true;
        return getPredictionStatus(prediction) === filter;
        });
    }, [predictions, filter]);

    const formatDate = (dateString) => {
        if (!dateString) return "Sin fecha";
        const date = new Date(dateString.replace(" ", "T"));
        return new Intl.DateTimeFormat("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
        }).format(date);
    };

    if (loading) return <h1 className="page-message">Cargando predicciones...</h1>;
    if (error) return <h1 className="page-message page-message--error">{error}</h1>;

    return (
        <div className="predictions-page">
        <main className="predictions-content">
            <div className="predictions-header">
                <h1 className="page-title">Mis Predicciones</h1>
                <PointsInfo />
            </div>
            <section className="stats-grid">
            <article className="stat-card">
                <span className="stat-card__label">Puntos totales</span>
                <strong className="stat-card__value">{stats.total_points}</strong>
            </article>

            <article className="stat-card">
                <span className="stat-card__label">Exactas acertadas</span>
                <strong className="stat-card__value">{stats.exact_predictions}</strong>
            </article>

            <article className="stat-card">
                <span className="stat-card__label">Diferencias acertadas</span>
                <strong className="stat-card__value">{stats.correct_differences}</strong>
            </article>

            <article className="stat-card">
                <span className="stat-card__label">Ganadores acertados</span>
                <strong className="stat-card__value">{stats.correct_winners}</strong>
            </article>
            </section>

            <section className="precision-card">
            <span>Precisión %</span>
            <strong>
                {predictions.length > 0
                ? Math.round((stats.total_points / (predictions.length * 5)) * 100)
                : 0}
                %
            </strong>
            </section>

            <div className="filters">
            <button
                className={filter === "all" ? "filter-btn active" : "filter-btn"}
                onClick={() => setFilter("all")}
            >
                Todas
            </button>
            <button
                className={filter === "pending" ? "filter-btn active" : "filter-btn"}
                onClick={() => setFilter("pending")}
            >
                Pendientes
            </button>
            <button
                className={filter === "acertada" ? "filter-btn active" : "filter-btn"}
                onClick={() => setFilter("acertada")}
            >
                Acertadas
            </button>
            <button
                className={filter === "fallida" ? "filter-btn active" : "filter-btn"}
                onClick={() => setFilter("fallida")}
            >
                Fallidas
            </button>
            </div>

            {filteredPredictions.length === 0 ? (
            <p className="empty-state">No hay predicciones para mostrar.</p>
            ) : (
            <div className="predictions-list">
                {filteredPredictions.map((prediction) => {
                const status = getPredictionStatus(prediction);
                const realHome = prediction.real_score?.home;
                const realAway = prediction.real_score?.away;

                return (
                    <article key={prediction.id} className="prediction-card">
                    <div className="prediction-card__top">
                        <strong>{formatDate(prediction.start_time)}</strong>
                        <span className={`prediction-status prediction-status--${status}`}>
                        {status === "pending" ? "Pendiente" : status === "acertada" ? "Acertada" : "Fallida"}
                        </span>
                    </div>

                    <p className="prediction-stage">{prediction.stage}</p>

                    <div className="prediction-match">
                        <div className="prediction-team">
                        <img
                            src={`/flags/${prediction.home_team?.flag}`}
                            alt={prediction.home_team?.name}
                            className="prediction-team__flag"
                        />
                        <span>{prediction.home_team?.name}</span>
                        </div>

                        <div className="prediction-vs">VS</div>

                        <div className="prediction-team">
                        <img
                            src={`/flags/${prediction.away_team?.flag}`}
                            alt={prediction.away_team?.name}
                            className="prediction-team__flag"
                        />
                        <span>{prediction.away_team?.name}</span>
                        </div>
                    </div>

                    <div className="prediction-scores">
                        <div>
                        <span>Tu pronóstico</span>
                        <strong>
                            {prediction.predicted_home} - {prediction.predicted_away}
                        </strong>
                        </div>

                        <div>
                        <span>Resultado real</span>
                        <strong>
                            {prediction.status === "upcoming"
                            ? "Pendiente"
                            : `${realHome ?? 0} - ${realAway ?? 0}`}
                        </strong>
                        </div>

                        <div>
                        <span>Puntos obtenidos</span>
                        <strong>{prediction.points_awarded || 0}</strong>
                        </div>
                    </div>
                    </article>
                );
                })}
            </div>
            )}
        </main>
        </div>
    );
}

export default Predicciones;