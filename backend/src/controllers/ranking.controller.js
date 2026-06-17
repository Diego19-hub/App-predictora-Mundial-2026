const { all, get } = require('../config/database');

exports.getRanking = async (req, res) => {
    try {
        const ranking = await all(`
        SELECT
            r.rank_position,
            r.user_id,
            u.username,
            u.avatar,
            r.total_points,
            r.exact_predictions,
            r.correct_differences,
            r.correct_winners,
            r.updated_at
        FROM rankings r
        JOIN users u ON u.id = r.user_id
        ORDER BY r.rank_position ASC, r.total_points DESC, u.username ASC
        LIMIT 50
        `);

        return res.json({ ranking });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener la clasificación' });
    }
};

exports.getMyRanking = async (req, res) => {
    try {
        const userId = req.user.id;

        const myRanking = await get(`
        SELECT
            r.rank_position,
            r.user_id,
            u.username,
            u.avatar,
            r.total_points,
            r.exact_predictions,
            r.correct_differences,
            r.correct_winners,
            r.updated_at
        FROM rankings r
        JOIN users u ON u.id = r.user_id
        WHERE r.user_id = ?
        `, [userId]);

        if (!myRanking) {
        return res.status(404).json({ message: 'Tu ranking aún no está disponible' });
        }

        return res.json({ myRanking });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener tu posición' });
    }
};