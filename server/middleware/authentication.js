const jwt = require('jsonwebtoken');

// Verifica si el token es valido, en caso contrario detiene la consulta y devuelve un status 401
let verifyToken = (req, res, next) => {

    let token = req.get('token');

    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }

        req.user = decoded.user;
        next();

    });

};

// Verifica si el usuario es ADMINI, en caso contrario detiene la consulta
let verifyAdminRole = (req, res, next) => {

    let user = req.user;

    if (user.role === 'ADMIN') {
        next();
    } else {

        return res.json({
            ok: false,
            err: {
                message: 'El usuario no es administrador'
            }
        });
    }
};


module.exports = {
    verifyToken,
    verifyAdminRole
}