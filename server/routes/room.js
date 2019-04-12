// Cliente: 
// Admin: GET, PUT, POST, DELETE
const express = require('express');
const Room = require('../models/room');
const _ = require('underscore');

const app = express();

app.get('/room', function(req, res) {
    
    let skip = req.query.skip || 0;
    skip = Number(skip);

    let limit = req.query.limit || 20;
    limit = Number(limit);

    Room.find({})
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

app.get('/room/:id', (req, res) => {

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

app.post('/room', (req, res) => {
    
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

app.put('/room/:id', (req, res) => {
 
    let id = req.params.id;
    let body = _.pick(req.body, ['number', 'capacity']);

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

app.delete('/room/:id', (req, res) => {

    let id = req.params.id;

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