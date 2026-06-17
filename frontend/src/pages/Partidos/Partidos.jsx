import { useEffect, useState } from "react";
import { savePrediction } from "../../services/predictionService";
import "./Partidos.css";
import {
    getUpcomingMatches,
    getLiveMatches,
    getFinishedMatches,
} from "../../services/matchService";

    function Partidos() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("upcoming");
    const [predictions, setPredictions] = useState(() => {
        return JSON.parse(localStorage.getItem("predictions")) || {};
    });

    useEffect(() => {
        localStorage.setItem("predictions", JSON.stringify(predictions));
    }, [predictions]);

    useEffect(() => {
        const loadMatches = async () => {
        try {
            setLoading(true);
            setError("");

            let response;

            if (filter === "upcoming") {
            response = await getUpcomingMatches();
            } else if (filter === "live") {
            response = await getLiveMatches();
            } else if (filter === "finished") {
            response = await getFinishedMatches();
            }

            const data = Array.isArray(response.data)
            ? response.data
            : response.data.matches || response.data.data || [];

            setMatches(data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "No se pudieron cargar los partidos.");
        } finally {
            setLoading(false);
        }
        };

        loadMatches();
    }, [filter]);

    const handlePredictionChange = (matchId, field, value) => {
        setPredictions((prev) => ({
        ...prev,
        [matchId]: {
            ...prev[matchId],
            [field]: value,
        },
        }));
    };
    const handleSavePrediction = async (matchId) => {
    const prediction = predictions[matchId];

    if (
        !prediction ||
        prediction.home === "" ||
        prediction.home === undefined ||
        prediction.away === "" ||
        prediction.away === undefined
    ) {
        alert("Completa tu predicción antes de guardar.");
        return;
    }

    try {
        const payload = {
        matchId,
        predicted_home: Number(prediction.home),
        predicted_away: Number(prediction.away),
        };

        const response = await savePrediction(payload);

        alert(response.data.message || "Predicción guardada correctamente.");
    } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || "Error al guardar la predicción.");
    }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Sin fecha";
        const date = new Date(dateString.replace(" ", "T"));
        return new Intl.DateTimeFormat("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
        }).format(date);
    };

    if (loading) return <h1 className="page-message">Cargando partidos...</h1>;
    if (error) return <h1 className="page-message page-message--error">{error}</h1>;

    return (
        <div className="matches-page">

        <main className="matches-content">
            <h1 className="page-title">Partidos</h1>

            <div className="filters">
            <button
                className={filter === "upcoming" ? "filter-btn active" : "filter-btn"}
                onClick={() => setFilter("upcoming")}
            >
                Próximos
            </button>
            <button
                className={filter === "live" ? "filter-btn active" : "filter-btn"}
                onClick={() => setFilter("live")}
            >
                En vivo
            </button>
            <button
                className={filter === "finished" ? "filter-btn active" : "filter-btn"}
                onClick={() => setFilter("finished")}
            >
                Finalizados
            </button>
            </div>

            {matches.length === 0 ? (
            <p className="empty-state">No hay partidos disponibles.</p>
            ) : (
            <div className="matches-list">
                {matches.map((match) => {
                const canPredict = filter === "upcoming";

                return (
                    <article key={match.id} className="match-card">
                    <div className="match-card__header">
                        <span className="match-card__stage">{match.stage?.name}</span>
                        <span className={`match-card__status match-card__status--${match.status}`}>
                        {match.status === "upcoming"
                            ? "Próximo"
                            : match.status === "live"
                            ? "En vivo"
                            : "Finalizado"}
                        </span>
                    </div>

                    <div className="teams">
                        <div className="team">
                        <img
                            src={`/flags/${match.home_team?.flag}`}
                            alt={match.home_team?.name}
                            className="team__flag"
                        />
                        <span className="team__name">{match.home_team?.name}</span>
                        </div>

                        <div className="vs">VS</div>

                        <div className="team">
                        <img
                            src={`/flags/${match.away_team?.flag}`}
                            alt={match.away_team?.name}
                            className="team__flag"
                        />
                        <span className="team__name">{match.away_team?.name}</span>
                        </div>
                    </div>

                    {match.status !== "upcoming" && (
                        <div className="real-score">
                        <span className="real-score__label">Marcador</span>
                        <strong>
                            {match.home_score ?? 0} - {match.away_score ?? 0}
                        </strong>
                        </div>
                    )}

                    {canPredict && (
                        <div className="prediction-box">
                        <div className="prediction-input">
                            <label>Local</label>
                            <input
                            type="number"
                            min="0"
                            value={predictions[match.id]?.home ?? ""}
                            onChange={(e) =>
                                handlePredictionChange(match.id, "home", e.target.value)
                            }
                            />
                        </div>

                        <div className="prediction-input">
                            <label>Visitante</label>
                            <input
                            type="number"
                            min="0"
                            value={predictions[match.id]?.away ?? ""}
                            onChange={(e) =>
                                handlePredictionChange(match.id, "away", e.target.value)
                            }
                            />
                        </div>
                        </div>
                    )}

                    <div className="match-info">
                        <p><strong>Fecha:</strong> {formatDate(match.start_time)}</p>
                        <p><strong>Estadio:</strong> {match.stadium || "Sin estadio"}</p>
                    </div>

                    {canPredict && (
                        <button
                        className="save-btn"
                        onClick={() => handleSavePrediction(match.id)}
                        >
                        Guardar
                        </button>
                    )}
                    </article>
                );
                })}
            </div>
            )}
        </main>
        </div>
    );
}

export default Partidos;