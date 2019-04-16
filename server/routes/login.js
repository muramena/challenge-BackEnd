const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const app = express();

/**
 * LOGEO
 * Genera un token si el mail y la contraseña son correctos
 * Ambos se envian en el body
 */
app.post('/login', (req, res) => {

    let body = req.body;

    User.findOne({ email: body.email }, (err, userDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!userDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrectos' // Usuario en este caso
                }
            });
        }

        if (!bcrypt.compareSync(body.password, userDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrectos' // Contraseña en este caso
                }
            });
        }

        // Tanto process.env.SEED como process.env.Token_Expiration se encuentran definidos en config/config.js
        let token = jwt.sign({user: userDB}, process.env.SEED, { expiresIn: process.env.Token_Expiration });

        res.json({
            ok: true,
            user: userDB,
            token
        });


    });

});

module.exports = app;