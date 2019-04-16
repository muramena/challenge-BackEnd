const express = require('express');
const Cinema = require('../models/cinema');
const _ = require('underscore');
const { verifyAdminRole, verifyToken } = require('../middleware/authentication');

const app = express();

/**
 * OBTENER CINES
 * El usuario necesita estar logeado y ser admin
 * Se pueden enviar como parametros opcionales un "name", "skip" y "limit"
 */
app.get('/cinema', [verifyToken, verifyAdminRole], (req, res) => {
    
    let searchParams = {
        state: true
    }

    let name = req.query.name;
    if (name) {
        //El nombre debe tener el "name", no hace falta coincidencia completa
        searchParams.name = { "$regex": name, "$options": "i" };
    }

    let skip = req.query.skip || 0;
    skip = Number(skip);

    let limit = req.query.limit || 20;
    limit = Number(limit);

    Cinema.find(searchParams)
            .skip(skip)
            .limit(limit)
            .exec((err, cinemas) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }
    
                Cinema.countDocuments(searchParams, (err, total) => {
    
                    res.json({
                        ok: true,
                        cinemas,
                        total: total
                    });
    
                });

            });

});

/**
 * CREAR UN NUEVO CINE
 * El usuario necesita estar logeado y ser admin
 * Es necesario el envio de un "name" en el body
 */
app.post('/cinema', [verifyToken, verifyAdminRole], (req, res) => {

    let body = req.body;

    let cinema = new Cinema({
        name: body.name
    });

    cinema.save((err, cinemaDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            cinema: cinemaDB
        });
    });

});

/**
 * MODIFICAR UN CINE
 * El usuario necesita estar logeado y ser admin
 * En la URL se recibe el ID, y en el body se envia el "name" al que se quiere cambiar
 */
app.put('/cinema/:id', [verifyToken, verifyAdminRole], (req, res) => {

    let id = req.params.id;
    let body = _.pick(req.body, ['name']);

        Cinema.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, cinemaDB) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                cinema: cinemaDB
            });

        });

});

/**
 * ELIMINAR UN CINE
 * El usuario necesita estar logeado y ser admin
 * En la URL se recibe el ID, y se lo elimina de manera logica para mantener un registro historico
 */
app.delete('/cinema/:id', [verifyToken, verifyAdminRole], (req, res) => {

    let id = req.params.id;

    let logicRemove = {
        state: false
    };
    
    Cinema.findByIdAndUpdate(id, logicRemove,  { new: true, runValidators: true }, (err, cinemaDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            message: 'El cine ha sido borrado'
        })

    });

});

module.exports = app;