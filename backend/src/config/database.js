const sqlite3 = require('sqlite3').verbose();//permite trabajar con sqlite desde node.js
const path = require('path'); //requerimos path pra la ruta mas segura 
const fs = require('fs'); //para manejar archivos 

const dbDir = path.join(__dirname, '..', '..', 'database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true }); //crear la carpeta si no existe 
}

const dbPath = path.join(dbDir, 'database.db');//ruta del archivo 
const db = new sqlite3.Database(dbPath); //conexion con database 

function run(sql, params = []) { //funcion run sirve para insertar, update, delete y crear tabla 
    return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve(this);
    });
    });
}

function get(sql, params = []) {//obtener un solo registro 
    return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
        if (err) return reject(err);
        resolve(row);
    });
    });
}

function all(sql, params = []) { //obtener varios registros 
    return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
    });
    });
}
async function initDb() {
    console.log("Base de datos conectada correctamente");
}

module.exports = {
    db,
    run,
    get,
    all,
    initDb
};