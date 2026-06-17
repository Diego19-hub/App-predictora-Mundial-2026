const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { get, run } = require('../config/database');

function generateToken(user) {
    console.log("JWT:", process.env.JWT_SECRET);
    return jwt.sign(
    {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
    );
}

exports.register = async (req, res) => {
    try {
    const { username, email, password, avatar } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    const existingUser = await get(
    'SELECT id FROM users WHERE username = ? OR email = ?',
    [username, email]
    );

    console.log("USERNAME:", username);
    console.log("EMAIL:", email);
    console.log("EXISTING USER:", existingUser);

    if (existingUser) {
        return res.status(409).json({
            message: 'El usuario o correo ya existe'
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await run(
        `INSERT INTO users (username, email, password, avatar)
        VALUES (?, ?, ?, ?)`,
        [username, email, hashedPassword, avatar || 'default-avatar.png']
    );

    const newUser = await get('SELECT * FROM users WHERE id = ?', [result.lastID]);
    const token = generateToken(newUser);

    return res.status(201).json({
        message: 'Usuario registrado correctamente',
        token,
        user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        avatar: newUser.avatar,
        total_points: newUser.total_points
        }
    });
    } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al registrar usuario' });
    }
};

exports.login = async (req, res) => {
    try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
        return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    const user = await get(
      'SELECT * FROM users WHERE email = ? OR username = ?',
        [identifier, identifier]
    );

    if (!user) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = generateToken(user);

    return res.json({
        message: 'Login exitoso',
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            total_points: user.total_points
        }
    });
    } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al iniciar sesión' });
    }
};

exports.me = async (req, res) => {
    try {
    const user = await get(
        'SELECT id, username, email, avatar, total_points, created_at FROM users WHERE id = ?',
        [req.user.id]
    );

    if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.json({ user });
    } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al obtener usuario' });
    }
};