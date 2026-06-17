// require('dotenv').config();

// const fs = require('fs');
// const path = require('path');
// const { initDb, run } = require('../config/database');

// async function seed() {
//     await initDb();

//     // Limpiar solo tablas de catálogo y partidos
//     await run('DELETE FROM matches');
//     await run('DELETE FROM teams');
//     await run('DELETE FROM stages');

//   // Si quieres reiniciar autoincrement en SQLite
//     await run("DELETE FROM sqlite_sequence WHERE name IN ('matches', 'teams', 'stages')");

//     // Fases del torneo
//     const stages = [
//         'Fase de grupos',
//         'Dieciseisavos de final',
//         'Octavos de final',
//         'Cuartos de final',
//         'Semifinal',
//         'Tercer lugar',
//         'Final'
//     ];

//     for (const stage of stages) {
//         await run('INSERT INTO stages (name) VALUES (?)', [stage]);
//     }

//   // Equipos desde JSON
//     const teamsPath = path.join(__dirname, '..', 'data', 'teams.json');
//     const teams = JSON.parse(fs.readFileSync(teamsPath, 'utf8'));

//     for (const team of teams) {
//         await run(
//         'INSERT INTO teams (name, flag) VALUES (?, ?)',
//         [team.name, team.flag || null]
//         );
//     }

//     console.log('Seed completado correctamente');
//     }

// seed().catch((error) => {
//     console.error('Error en seed:', error);
//     });
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { initDb, run, get } = require('../config/database');

const DATA_DIR = path.join(__dirname, '..', 'data');

function readJson(fileName) {
    const filePath = path.join(DATA_DIR, fileName);
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

async function seed() {
    await initDb();

    const teams = readJson('teams.json');
    const matches = readJson('matches.json');

  // Si quieres arrancar limpio cada vez, deja esto.
    // Si no quieres borrar datos existentes, comenta este bloque.
    await run('DELETE FROM matches');
    await run('DELETE FROM teams');
    await run('DELETE FROM stages');
    await run("DELETE FROM sqlite_sequence WHERE name IN ('matches', 'teams', 'stages')");

    // 1) Insertar fases
    const stages = [
        'Fase de grupos',
        'Dieciseisavos de final',
        'Octavos de final',
        'Cuartos de final',
        'Semifinal',
        'Tercer lugar',
        'Final'
    ];

    for (const stageName of stages) {
        await run('INSERT INTO stages (name) VALUES (?)', [stageName]);
    }

  // 2) Insertar equipos
    for (const team of teams) {
        await run(
        'INSERT INTO teams (name, flag) VALUES (?, ?)',
        [team.name, team.flag || null]
        );
    }

    // 3) Crear mapas para resolver IDs
    const teamRows = await runGetAllTeams();
    const stageRows = await runGetAllStages();

    const teamMap = new Map(teamRows.map((t) => [t.name, t.id]));
    const stageMap = new Map(stageRows.map((s) => [s.name, s.id]));

    // 4) Insertar partidos
    for (const match of matches) {
        const homeTeamId = teamMap.get(match.home_team);
        const awayTeamId = teamMap.get(match.away_team);
        const stageId = stageMap.get(match.stage);

        if (!homeTeamId) {
        throw new Error(`No existe el equipo local: ${match.home_team}`);
        }
        if (!awayTeamId) {
        throw new Error(`No existe el equipo visitante: ${match.away_team}`);
        }
        if (!stageId) {
        throw new Error(`No existe la fase: ${match.stage}`);
        }

        await run(
        `
        INSERT INTO matches (
            home_team_id,
            away_team_id,
            stage_id,
            home_score,
            away_score,
            status,
            stadium,
            start_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            homeTeamId,
            awayTeamId,
            stageId,
            match.home_score ?? null,
            match.away_score ?? null,
            match.status,
            match.stadium || null,
            match.start_time
        ]
        );
    }

    console.log(`Seed completado: ${teams.length} equipos y ${matches.length} partidos insertados.`);
    }

    async function runGetAllTeams() {
    const db = require('../config/database');
    return db.all('SELECT id, name FROM teams ORDER BY id ASC');
    }

    async function runGetAllStages() {
    const db = require('../config/database');
    return db.all('SELECT id, name FROM stages ORDER BY id ASC');
    }

    seed().catch((error) => {
    console.error('Error en el seed:', error.message);
    process.exit(1);
    });