import "./RankingTable.css";

function RankingTable({ players }) {
    return (
        <div className="ranking-table__wrapper">
        <table className="ranking-table">
            <thead>
            <tr>
                <th>#</th>
                <th>Usuario</th>
                <th>Partidos</th>
                <th>Aciertos</th>
                <th>Puntos</th>
            </tr>
            </thead>

            <tbody>
            {players.map((player, index) => (
                <tr key={player.id}>
                <td>{index + 1}</td>
                <td className="ranking-table__user">
                    <img src={player.avatar} alt={player.username} />
                    <span>{player.username}</span>
                </td>
                <td>{player.matches}</td>
                <td>{player.hits}</td>
                <td className="ranking-table__points">{player.points}</td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    );
}

export default RankingTable;