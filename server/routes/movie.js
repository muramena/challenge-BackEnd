// Cliente: 
// Admin: GET, PUT, POST, DELETE
const express = require('express');
const Movie = require('../models/movie');
const _ = require('underscore');

const app = express();

app.get('/movie', (req, res) => {
    
    let skip = req.query.skip || 0;
    skip = Number(skip);

    let limit = req.query.limit || 20;
    limit = Number(limit);

    Movie.find({ state: true })
            .skip(skip)
            .limit(limit)
            .exec((err, movies) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }
    
                Movie.countDocuments({ state: true }, (err, total) => {
    
                    res.json({
                        ok: true,
                        movies,
                        total: total
                    });
    
                });

            });

});

app.post('/movie', (req, res) => {

    let body = req.body;

    let movie = new Movie({
        title: body.title,
        minutes: body.minutes
    });

    movie.save((err, movieDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            movie: movieDB
        });
    });

});

app.put('/movie/:id', (req, res) => {

    let id = req.params.id;
    let body = _.pick(req.body, ['title', 'minutes']);

    Movie.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, movieDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            movie: movieDB
        });

    });

});

app.delete('/movie/:id', (req, res) => {

    let id = req.params.id;

    let logicRemove = {
        state: false
    };

    Movie.findByIdAndUpdate(id, logicRemove,  { new: true, runValidators: true }, (err, movieDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            message: 'La película ha sido borrada'
        })

    });

});

module.exports = app;