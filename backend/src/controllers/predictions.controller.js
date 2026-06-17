const { get, all, run } = require('../config/database');


function calculatePoints(predictedHome, predictedAway, realHome, realAway) {
    if (
        predictedHome === realHome &&
        predictedAway === realAway
    ) {
        return { points: 5, reason: 'exact_score' };
    }

    const predictedDiff = predictedHome - predictedAway;
    const realDiff = realHome - realAway;

    if (predictedDiff === realDiff) {
        return { points: 3, reason: 'correct_difference' };
    }

    const predictedWinner =
        predictedHome > predictedAway ? 'home' :
        predictedAway > predictedHome ? 'away' :
        'draw';

    const realWinner =
        realHome > realAway ? 'home' :
        realAway > realHome ? 'away' :
        'draw';

    if (predictedWinner === realWinner) {
        return { points: 1, reason: 'correct_winner' };
    }

    return { points: 0, reason: 'incorrect_prediction' };
}

    async function rebuildRankings() {
    const rankingRows = await all(`
        SELECT
        u.id AS user_id,
        u.username,
        u.avatar,
        COALESCE(SUM(p.points), 0) AS total_points,
        COALESCE(SUM(CASE WHEN p.reason = 'exact_score' THEN 1 ELSE 0 END), 0) AS exact_predictions,
        COALESCE(SUM(CASE WHEN p.reason = 'correct_difference' THEN 1 ELSE 0 END), 0) AS correct_differences,
        COALESCE(SUM(CASE WHEN p.reason = 'correct_winner' THEN 1 ELSE 0 END), 0) AS correct_winners
        FROM users u
        LEFT JOIN points p ON p.user_id = u.id
        GROUP BY u.id
        ORDER BY total_points DESC, exact_predictions DESC, correct_differences DESC, correct_winners DESC, u.username ASC
    `);

    await run('DELETE FROM rankings');
    await run("DELETE FROM sqlite_sequence WHERE name = 'rankings'");

    let position = 1;

    for (const row of rankingRows) {
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
            position++
        ]
        );
    }
}

async function awardPointsForMatch(matchId) {
    const match = await get(`
        SELECT id, home_score, away_score, status
        FROM matches
        WHERE id = ?
    `, [matchId]);

    if (!match) {
        throw new Error('Partido no encontrado');
    }

    if (match.status !== 'finished') {
        throw new Error('El partido aún no está finalizado');
    }

    const predictions = await all(`
        SELECT id, user_id, match_id, predicted_home, predicted_away, points_awarded
        FROM predictions
        WHERE match_id = ?
    `, [matchId]);

    for (const prediction of predictions) {
        const existingPoint = await get(
        'SELECT id FROM points WHERE prediction_id = ?',
        [prediction.id]
        );

        const { points, reason } = calculatePoints(
        prediction.predicted_home,
        prediction.predicted_away,
        match.home_score,
        match.away_score
        );

        if (!existingPoint) {
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
            prediction.match_id,
            prediction.id,
            points,
            reason
            ]
        );

        await run(
            'UPDATE predictions SET points_awarded = ? WHERE id = ?',
            [points, prediction.id]
        );

        if (points > 0) {
            await run(
            'UPDATE users SET total_points = COALESCE(total_points, 0) + ? WHERE id = ?',
            [points, prediction.user_id]
            );
        }
        }
    }

    await rebuildRankings();
}

exports.createOrUpdatePrediction = async (req, res) => {
    try {
        const userId = req.user.id;
        const { matchId, predicted_home, predicted_away } = req.body;

        if (
        matchId === undefined ||
        predicted_home === undefined ||
        predicted_away === undefined
        ) {
        return res.status(400).json({ message: 'Faltan datos obligatorios' });
        }

        const match = await get(
        'SELECT id, status, home_team_id, away_team_id, start_time FROM matches WHERE id = ?',
        [matchId]
        );

        if (!match) {
        return res.status(404).json({ message: 'Partido no encontrado' });
        }

        if (match.status !== 'upcoming') {
        return res.status(400).json({
            message: 'Solo puedes pronosticar partidos próximos'
        });
        }

        const existingPrediction = await get(
        'SELECT id FROM predictions WHERE user_id = ? AND match_id = ?',
        [userId, matchId]
        );

        if (existingPrediction) {
        await run(
            `
            UPDATE predictions
            SET predicted_home = ?, predicted_away = ?
            WHERE id = ?
            `,
            [predicted_home, predicted_away, existingPrediction.id]
        );

        return res.json({
            message: 'Predicción actualizada correctamente'
        });
        }

        await run(
        `
        INSERT INTO predictions (
            user_id,
            match_id,
            predicted_home,
            predicted_away,
            points_awarded,
            created_at
        ) VALUES (?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
        `,
        [userId, matchId, predicted_home, predicted_away]
        );

        return res.status(201).json({
        message: 'Predicción guardada correctamente'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al guardar la predicción' });
    }
};

exports.getMyPredictions = async (req, res) => {
    try {
        const userId = req.user.id;

        const predictions = await all(`
        SELECT
            p.id,
            p.match_id,
            p.predicted_home,
            p.predicted_away,
            p.points_awarded,
            p.created_at,
            m.status,
            m.start_time,
            m.stadium,
            m.home_score,
            m.away_score,
            s.name AS stage_name,
            ht.name AS home_team_name,
            ht.flag AS home_team_flag,
            at.name AS away_team_name,
            at.flag AS away_team_flag
        FROM predictions p
        JOIN matches m ON m.id = p.match_id
        JOIN stages s ON s.id = m.stage_id
        JOIN teams ht ON ht.id = m.home_team_id
        JOIN teams at ON at.id = m.away_team_id
        WHERE p.user_id = ?
        ORDER BY m.start_time DESC
        `, [userId]);

        const stats = await get(`
        SELECT
            COALESCE(SUM(points), 0) AS total_points,
            COALESCE(SUM(CASE WHEN reason = 'exact_score' THEN 1 ELSE 0 END), 0) AS exact_predictions,
            COALESCE(SUM(CASE WHEN reason = 'correct_difference' THEN 1 ELSE 0 END), 0) AS correct_differences,
            COALESCE(SUM(CASE WHEN reason = 'correct_winner' THEN 1 ELSE 0 END), 0) AS correct_winners
        FROM points
        WHERE user_id = ?
        `, [userId]);

        const formatted = predictions.map((p) => ({
        id: p.id,
        match_id: p.match_id,
        predicted_home: p.predicted_home,
        predicted_away: p.predicted_away,
        points_awarded: p.points_awarded,
        created_at: p.created_at,
        status: p.status,
        start_time: p.start_time,
        stadium: p.stadium,
        stage: p.stage_name,
        home_team: {
            name: p.home_team_name,
            flag: p.home_team_flag
        },
        away_team: {
            name: p.away_team_name,
            flag: p.away_team_flag
        },
        real_score: {
            home: p.home_score,
            away: p.away_score
        }
        }));

        return res.json({
        stats: {
            total_points: stats.total_points,
            exact_predictions: stats.exact_predictions,
            correct_differences: stats.correct_differences,
            correct_winners: stats.correct_winners
        },
        predictions: formatted
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener tus predicciones' });
    }
};

exports.updatePrediction = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { predicted_home, predicted_away } = req.body;

        const prediction = await get(
        'SELECT id, match_id FROM predictions WHERE id = ? AND user_id = ?',
        [id, userId]
        );

        if (!prediction) {
        return res.status(404).json({ message: 'Predicción no encontrada' });
        }

        const match = await get(
        'SELECT id, status FROM matches WHERE id = ?',
        [prediction.match_id]
        );

        if (!match || match.status !== 'upcoming') {
        return res.status(400).json({
            message: 'Solo puedes editar predicciones de partidos próximos'
        });
        }

        await run(
        `
        UPDATE predictions
        SET predicted_home = ?, predicted_away = ?
        WHERE id = ? AND user_id = ?
        `,
        [predicted_home, predicted_away, id, userId]
        );

        return res.json({ message: 'Predicción actualizada correctamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al actualizar la predicción' });
    }
};

exports.deletePrediction = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const prediction = await get(
        'SELECT id, match_id FROM predictions WHERE id = ? AND user_id = ?',
        [id, userId]
        );

        if (!prediction) {
        return res.status(404).json({ message: 'Predicción no encontrada' });
        }

        const match = await get(
        'SELECT id, status FROM matches WHERE id = ?',
        [prediction.match_id]
        );

        if (!match || match.status !== 'upcoming') {
        return res.status(400).json({
            message: 'Solo puedes borrar predicciones de partidos próximos'
        });
        }

        await run(
        'DELETE FROM predictions WHERE id = ? AND user_id = ?',
        [id, userId]
        );

        return res.json({ message: 'Predicción eliminada correctamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al eliminar la predicción' });
    }
};

exports.settleMatchPredictions = async (req, res) => {
    try {
        const { matchId } = req.params;
        await awardPointsForMatch(matchId);

        return res.json({
        message: 'Predicciones calculadas y ranking actualizado correctamente'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message || 'Error al calcular puntos' });
    }
};

exports.settleMatchPredictions = async (req, res) => {
    try {
        const { matchId } = req.params;
        await awardPointsForMatch(matchId);

        return res.json({
        message: 'Predicciones calculadas y ranking actualizado correctamente'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message || 'Error al calcular puntos' });
    }
};