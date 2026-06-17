const { get, all, run } = require('../config/database');

function calculatePoints(predictedHome, predictedAway, realHome, realAway) {
    if (predictedHome === realHome && predictedAway === realAway) {
        return { points: 5, reason: 'exact_score' };
    }

    const predictedDiff = predictedHome - predictedAway;
    const realDiff = realHome - realAway;

    if (predictedDiff === realDiff) {
        return { points: 3, reason: 'correct_difference' };
    }

    const predictedWinner =
        predictedHome > predictedAway ? 'home' :
        predictedAway > predictedHome ? 'away' : 'draw';

    const realWinner =
        realHome > realAway ? 'home' :
        realAway > realHome ? 'away' : 'draw';

    if (predictedWinner === realWinner) {
        return { points: 1, reason: 'correct_winner' };
    }

    return { points: 0, reason: 'incorrect_prediction' };
}

async function rebuildRankings() {
    const rows = await all(`
        SELECT
        u.id AS user_id,
        COALESCE(SUM(p.points), 0) AS total_points,
        COALESCE(SUM(CASE WHEN p.reason = 'exact_score' THEN 1 ELSE 0 END), 0) AS exact_predictions,
        COALESCE(SUM(CASE WHEN p.reason = 'correct_difference' THEN 1 ELSE 0 END), 0) AS correct_differences,
        COALESCE(SUM(CASE WHEN p.reason = 'correct_winner' THEN 1 ELSE 0 END), 0) AS correct_winners
        FROM users u
        LEFT JOIN points p ON p.user_id = u.id
        GROUP BY u.id
        ORDER BY total_points DESC, exact_predictions DESC, correct_differences DESC, correct_winners DESC, u.id ASC
    `);

    await run('DELETE FROM rankings');
    await run("DELETE FROM sqlite_sequence WHERE name = 'rankings'");

    let rank = 1;
    for (const row of rows) {
        await run(
        `
        INSERT INTO rankings (
            user_id,
            total_points,
            exact_predictions,
            correct_differences,
            correct_winners,
            rank_position,
            updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `,
        [
            row.user_id,
            row.total_points,
            row.exact_predictions,
            row.correct_differences,
            row.correct_winners,
            rank++
        ]
        );
    }
}

async function awardPointsForMatch(matchId) {
    const match = await get(
        'SELECT id, home_score, away_score, status FROM matches WHERE id = ?',
        [matchId]
    );

    if (!match) {
        throw new Error('Partido no encontrado');
    }

    if (match.status !== 'finished') {
        throw new Error('El partido debe estar finalizado');
    }

    const existingPoints = await all(
        'SELECT id, user_id, points FROM points WHERE match_id = ?',
        [matchId]
    );

    for (const pointRow of existingPoints) {
        await run(
        'UPDATE users SET total_points = COALESCE(total_points, 0) - ? WHERE id = ?',
        [pointRow.points, pointRow.user_id]
        );
    }

    await run('DELETE FROM points WHERE match_id = ?');
    await run('UPDATE predictions SET points_awarded = 0 WHERE match_id = ?', [matchId]);

    const predictions = await all(
        `
        SELECT id, user_id, predicted_home, predicted_away
        FROM predictions
        WHERE match_id = ?
        `,
        [matchId]
    );

    for (const prediction of predictions) {
        const result = calculatePoints(
        prediction.predicted_home,
        prediction.predicted_away,
        match.home_score,
        match.away_score
        );

        await run(
        `
        INSERT INTO points (
            user_id,
            match_id,
            prediction_id,
            points,
            reason,
            awarded_at
        ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `,
        [
            prediction.user_id,
            matchId,
            prediction.id,
            result.points,
            result.reason
        ]
        );

        await run(
        'UPDATE predictions SET points_awarded = ? WHERE id = ?',
        [result.points, prediction.id]
        );

        if (result.points > 0) {
        await run(
            'UPDATE users SET total_points = COALESCE(total_points, 0) + ? WHERE id = ?',
            [result.points, prediction.user_id]
        );
        }
    }

    await rebuildRankings();
}

module.exports = {
    calculatePoints,
    awardPointsForMatch,
    rebuildRankings
};