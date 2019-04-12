// Cliente: 
// Admin: GET, POST, PUT, DELETE
const express = require('express');
const Cinema = require('../models/cinema');
const _ = require('underscore');

const app = express();

app.get('/cinema', (req, res) => {
    
    let skip = req.query.skip || 0;
    skip = Number(skip);

    let limit = req.query.limit || 20;
    limit = Number(limit);

    Cinema.find({ state: true })
            .skip(skip)
            .limit(limit)
            .exec((err, cinemas) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }
    
                Cinema.countDocuments({ state: true }, (err, total) => {
    
                    res.json({
                        ok: true,
                        cinemas,
                        total: total
                    });
    
                });

            });

});

app.post('/cinema', (req, res) => {

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

app.put('/cinema/:id', (req, res) => {

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

app.delete('/cinema/:id', (req, res) => {

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