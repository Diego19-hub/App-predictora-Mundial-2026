function adminMiddleware(req, res, next) {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminUsername = process.env.ADMIN_USERNAME;

    if (!adminEmail && !adminUsername) {
        return res.status(500).json({
        message: 'Configura ADMIN_EMAIL o ADMIN_USERNAME en tu .env'
        });
    }

    const isAdmin =
        (adminEmail && req.user.email === adminEmail) ||
        (adminUsername && req.user.username === adminUsername);

    if (!isAdmin) {
        return res.status(403).json({ message: 'No tienes permisos de administrador' });
    }

    next();
}

module.exports = adminMiddleware;