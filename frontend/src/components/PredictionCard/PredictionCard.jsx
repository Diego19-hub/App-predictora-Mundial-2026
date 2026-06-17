import "./PredictionCard.css";

function PredictionCard({ prediction }) {
    return (
        <article className="prediction-card">
        <div className="prediction-card__top">
            <span className="prediction-card__date">{prediction.date}</span>
            <span className={`prediction-card__status prediction-card__status--${prediction.status.toLowerCase()}`}>
            {prediction.status}
            </span>
        </div>

        <div className="prediction-card__match">
            <h3>{prediction.homeTeam} vs {prediction.awayTeam}</h3>
            <p>{prediction.stadium}</p>
        </div>

        <div className="prediction-card__score">
            <div>
            <span className="prediction-card__team">{prediction.homeTeam}</span>
            <strong>{prediction.homeScore}</strong>
            </div>

            <span className="prediction-card__separator">-</span>

            <div>
            <span className="prediction-card__team">{prediction.awayTeam}</span>
            <strong>{prediction.awayScore}</strong>
            </div>
        </div>

        <div className="prediction-card__bottom">
            <span>Puntos: {prediction.points}</span>
        </div>
        </article>
    );
}

export default PredictionCard;