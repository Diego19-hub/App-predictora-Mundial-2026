import { useEffect, useState } from "react";
import {
    getUpcomingMatches,
    getLiveMatches,
    updateMatchResult,
} from "../../services/matchService";

import "./AdminResultados.css";

function AdminResultados() {
    const [matches, setMatches] = useState([]);
    const [selectedMatch, setSelectedMatch] = useState("");
    const [homeScore, setHomeScore] = useState("");
    const [awayScore, setAwayScore] = useState("");
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        loadMatches();
    }, []);

    const loadMatches = async () => {
        try {
        setLoading(true);

        const upcoming = await getUpcomingMatches();
        const live = await getLiveMatches();

        const upcomingMatches =
            upcoming.data.matches || upcoming.data || [];

        const liveMatches =
            live.data.matches || live.data || [];

        setMatches([...upcomingMatches, ...liveMatches]);
        } catch (error) {
        console.error(error);
        setMessage("Error al cargar partidos.");
        } finally {
        setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedMatch) {
        return setMessage("Selecciona un partido.");
        }

        try {
        await updateMatchResult(selectedMatch, {
            home_score: Number(homeScore),
            away_score: Number(awayScore),
        });

        setMessage("Resultado actualizado correctamente.");

        setHomeScore("");
        setAwayScore("");

        loadMatches();
        } catch (error) {
        console.error(error);

        setMessage(
            error.response?.data?.message ||
            "Error al actualizar resultado."
        );
        }
    };

    if (loading) {
        return (
        <div className="admin-loading">
            Cargando partidos...
        </div>
        );
    }

    return (
        <div className="admin-page">
        <div className="admin-container">

            <h1>Panel Administrador</h1>

            <p>
            Actualiza los resultados oficiales y genera
            automáticamente los puntos de los usuarios.
            </p>

            <form
            className="admin-form"
            onSubmit={handleSubmit}
            >
            <label>Partido</label>

            <select
                value={selectedMatch}
                onChange={(e) =>
                setSelectedMatch(e.target.value)
                }
            >
                <option value="">
                Selecciona un partido
                </option>

                {matches.map((match) => (
                <option
                    key={match.id}
                    value={match.id}
                >
                    {match.home_team?.name} vs{" "}
                    {match.away_team?.name}
                </option>
                ))}
            </select>

            <label>Goles Local</label>

            <input
                type="number"
                min="0"
                value={homeScore}
                onChange={(e) =>
                setHomeScore(e.target.value)
                }
            />

            <label>Goles Visitante</label>

            <input
                type="number"
                min="0"
                value={awayScore}
                onChange={(e) =>
                setAwayScore(e.target.value)
                }
            />

            <button type="submit">
                Guardar Resultado
            </button>
            </form>

            {message && (
            <div className="admin-message">
                {message}
            </div>
            )}
        </div>
        </div>
    );
}

export default AdminResultados;