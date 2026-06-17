import "./MatchCard.css";

function MatchCard({ match, onSelect }) {
    return (
        <article className="match-card">
        <div className="match-card__top">
            <span className="match-card__date">{match.date}</span>
            <span className={`match-card__status match-card__status--${match.status.toLowerCase()}`}>
            {match.status}
            </span>
        </div>

        <div className="match-card__teams">
            <div className="match-card__team">
            <img src={match.homeFlag} alt={match.homeTeam} />
            <h3>{match.homeTeam}</h3>
            </div>

            <div className="match-card__vs">
            <span>VS</span>
            </div>

            <div className="match-card__team">
            <img src={match.awayFlag} alt={match.awayTeam} />
            <h3>{match.awayTeam}</h3>
            </div>
        </div>

        <div className="match-card__info">
            <p>{match.stadium}</p>
            <p>{match.time}</p>
        </div>

        <button className="match-card__button" onClick={() => onSelect(match)}>
            Hacer predicción
        </button>
        </article>
    );
}

export default MatchCard;