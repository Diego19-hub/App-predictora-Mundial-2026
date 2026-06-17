const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const header = req.headers.authorization;//hacemos que express guarde la autorizacion 

    if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token requerido' });
    }//validamos que el token exista 

    const token = header.split(' ')[1];//extraer el token

    try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);//verificamos el token 
    req.user = decoded; //guardamos los datos del usuario 
    next();
    } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
    }
}

module.exports = authMiddleware;