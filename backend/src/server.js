require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { initDb } = require('./config/database');
const authRoutes = require('./routes/auth.routes');
const matchRoutes = require('./routes/match.routes');
const predictionsRoutes = require('./routes/predictions.routes');
const rankingRoutes = require('./routes/ranking.routes');

const app = express();

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.json({ message: 'API Mundial 2026 funcionando' });
});

app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/predictions', predictionsRoutes);
app.use('/api/ranking', rankingRoutes);

const PORT = process.env.PORT || 3000;

initDb()
    .then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
    })
    .catch((error) => {
    console.error('Error al iniciar la base de datos:', error);
    });