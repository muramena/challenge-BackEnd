const express = require('express');
const Room = require('../models/room');
const _ = require('underscore');
const { verifyAdminRole, verifyToken } = require('../middleware/authentication');

const app = express();

/**
 * OBTENER TODAS LAS SALAS
 * El usuario debe estar logeado y ser ADMIN
 * Puede recibir como parametros opcionales skip y limit
 */
app.get('/room', [verifyToken, verifyAdminRole], (req, res) => {
    
    let skip = req.query.skip || 0;
    skip = Number(skip);

    let limit = req.query.limit || 20;
    limit = Number(limit);

    Room.find({ state: true })
            .skip(skip)
            .limit(limit)
            .populate('idCinema', 'name')
            .exec((err, rooms) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }
    
                Room.countDocuments({ state: true }, (err, total) => {
    
                    res.json({
                        ok: true,
                        rooms,
                        total: total
                    });
    
                });

            });

});

/**
 * OBTENER TODAS LAS SALAS DE UN CINE
 * El usuario debe estar logeado y ser ADMIN
 * Recibe en la URL el ID del cine
 */
app.get('/room/:id', [verifyToken, verifyAdminRole], (req, res) => {

    let id = req.params.id;

    Room.find()
        .populate({
            path: 'idCinema',
            match: { _id: id }
        })
        .exec((err, rooms) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            rooms = rooms.filter(room => room.idCinema != null);

            res.json({
                ok: true,
                rooms
            });

        });

});

/**
 * CREAR UNA SALA
 * El usuario debe estar logeado y ser ADMIN
 * Recibe en el body un idCinema, capacity, y un number(identificador interno dentro del cine)
 */
app.post('/room', [verifyToken, verifyAdminRole], (req, res) => {
    
    let body = req.body;

    let room = new Room({
        idCinema: body.idCinema,
        capacity: body.capacity,
        number: body.number
    });

    room.save((err, roomDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            room: roomDB
        });
    });

});

/**
 * MODIFICAR UNA SALA
 * El usuario debe estar logeado y ser admin
 * Solo permite cambiar el number (identificador interno del cine) que se envia en el body
 */
app.put('/room/:id', [verifyToken, verifyAdminRole], (req, res) => {
 
    let id = req.params.id;
    let body = _.pick(req.body, ['number']);

    Room.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, roomDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            room: roomDB
        });

    });

});

/**
 * ELIMINAR UNA SALA
 * El usuario debe estar logeado y ser admin
 * Se recibe en la URL el ID de la sala a eliminar
 */
app.delete('/room/:id', [verifyToken, verifyAdminRole], (req, res) => {

    let id = req.params.id;

    //FALTA ELIMINAR FUNCIONES FUTURAS

    Room.findByIdAndDelete(id, { runValidators: true }, (err, roomDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!roomDB) {
            return res.status(400).json({
                ok: false,
                message: 'No se puede borrar esa sala porque no existe en el sistema'
            });
        }

        res.json({
            ok: true,
            message: 'La sala ha sido borrada'
        })

    });

});

module.exports = app;