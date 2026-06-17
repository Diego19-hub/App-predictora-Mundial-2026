const { run, get, all } = require('../config/database');
const { awardPointsForMatch } = require('../services/scoring.service');

function formatMatch(match) {
    return {
        id: match.id,
        status: match.status,
        start_time: match.start_time,
        stadium: match.stadium,
        stage: {
        id: match.stage_id,
        name: match.stage_name
        },
        home_team: {
        id: match.home_team_id,
        name: match.home_team_name,
        flag: match.home_team_flag
        },
        away_team: {
        id: match.away_team_id,
        name: match.away_team_name,
        flag: match.away_team_flag
        },
        home_score: match.home_score,
        away_score: match.away_score
    };
}

exports.getUpcomingMatches = async (req, res) => {
    try {
        const matches = await all(`
        SELECT 
            m.id,
            m.status,
            m.start_time,
            m.stadium,
            m.stage_id,
            s.name AS stage_name,
            m.home_team_id,
            ht.name AS home_team_name,
            ht.flag AS home_team_flag,
            m.away_team_id,
            at.name AS away_team_name,
            at.flag AS away_team_flag,
            m.home_score,
            m.away_score
        FROM matches m
        JOIN teams ht ON ht.id = m.home_team_id
        JOIN teams at ON at.id = m.away_team_id
        JOIN stages s ON s.id = m.stage_id
        WHERE m.status = 'upcoming'
        ORDER BY m.start_time ASC
        `);

    const formatted = await Promise.all(matches.map(formatMatch));
        return res.json({ matches: formatted });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener partidos próximos' });
    }
    };

exports.getLiveMatches = async (req, res) => {
        try {
            const matches = await all(`
            SELECT 
                m.id,
                m.status,
                m.start_time,
                m.stadium,
                m.stage_id,
                s.name AS stage_name,
                m.home_team_id,
                ht.name AS home_team_name,
                ht.flag AS home_team_flag,
                m.away_team_id,
                at.name AS away_team_name,
                at.flag AS away_team_flag,
                m.home_score,
                m.away_score
            FROM matches m
            JOIN teams ht ON ht.id = m.home_team_id
            JOIN teams at ON at.id = m.away_team_id
            JOIN stages s ON s.id = m.stage_id
            WHERE m.status = 'live'
            ORDER BY m.start_time ASC
            `);

    const formatted = await Promise.all(matches.map(formatMatch));
    return res.json({ matches: formatted });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener partidos en vivo' });
    }
};

exports.getFinishedMatches = async (req, res) => {
    try {
        const matches = await all(`
        SELECT 
            m.id,
            m.status,
            m.start_time,
            m.stadium,
            m.stage_id,
            s.name AS stage_name,
            m.home_team_id,
            ht.name AS home_team_name,
            ht.flag AS home_team_flag,
            m.away_team_id,
            at.name AS away_team_name,
            at.flag AS away_team_flag,
            m.home_score,
            m.away_score
        FROM matches m
        JOIN teams ht ON ht.id = m.home_team_id
        JOIN teams at ON at.id = m.away_team_id
        JOIN stages s ON s.id = m.stage_id
        WHERE m.status = 'finished'
        ORDER BY m.start_time DESC
        `);

    const formatted = await Promise.all(matches.map(formatMatch));
        return res.json({ matches: formatted });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener partidos finalizados' });
    }
};

exports.getMatchById = async (req, res) => {
    try {
        const { id } = req.params;

        const match = await get(`
        SELECT 
            m.id,
            m.status,
            m.start_time,
            m.stadium,
            m.stage_id,
            s.name AS stage_name,
            m.home_team_id,
            ht.name AS home_team_name,
            ht.flag AS home_team_flag,
            m.away_team_id,
            at.name AS away_team_name,
            at.flag AS away_team_flag,
            m.home_score,
            m.away_score
        FROM matches m
        JOIN teams ht ON ht.id = m.home_team_id
        JOIN teams at ON at.id = m.away_team_id
        JOIN stages s ON s.id = m.stage_id
        WHERE m.id = ?
        `, [id]);

    if (!match) {
        return res.status(404).json({ message: 'Partido no encontrado' });
        }

        return res.json({ match: await formatMatch(match) });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener el partido' });
    }
};

exports.updateMatchResult = async (req, res) => {
    try {
        const { id } = req.params;
        const { home_score, away_score } = req.body;

        if (home_score === undefined || away_score === undefined) {
        return res.status(400).json({ message: 'Faltan goles del partido' });
        }

        const match = await get('SELECT * FROM matches WHERE id = ?', [id]);

        if (!match) {
        return res.status(404).json({ message: 'Partido no encontrado' });
        }

        await run(
        `
        UPDATE matches
        SET home_score = ?, away_score = ?, status = 'finished'
        WHERE id = ?
        `,
        [home_score, away_score, id]
        );

        await awardPointsForMatch(id);

        const updatedMatch = await get(`
        SELECT 
            m.id,
            m.status,
            m.start_time,
            m.stadium,
            m.stage_id,
            s.name AS stage_name,
            m.home_team_id,
            ht.name AS home_team_name,
            ht.flag AS home_team_flag,
            m.away_team_id,
            at.name AS away_team_name,
            at.flag AS away_team_flag,
            m.home_score,
            m.away_score
        FROM matches m
        JOIN teams ht ON ht.id = m.home_team_id
        JOIN teams at ON at.id = m.away_team_id
        JOIN stages s ON s.id = m.stage_id
        WHERE m.id = ?
        `, [id]);

        return res.json({
        message: 'Partido finalizado y puntos calculados correctamente',
        match: formatMatch(updatedMatch)
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
        message: error.message || 'Error al actualizar el partido'
        });
    }
};