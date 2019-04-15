// Cliente: 
// Admin: GET, PUT, POST, DELETE
const express = require('express');
const Movie = require('../models/movie');
const _ = require('underscore');
const { verifyAdminRole, verifyToken } = require('../middleware/authentication');

const app = express();

app.get('/movie', [verifyToken, verifyAdminRole], (req, res) => {
    
    let searchParams = {
        state: true
    }

    let title = req.query.title;
    if (title) {
        searchParams.title =  { "$regex": title, "$options": "i" };
    }

    let skip = req.query.skip || 0;
    skip = Number(skip);

    let limit = req.query.limit || 20;
    limit = Number(limit);

    Movie.find(searchParams)
            .skip(skip)
            .limit(limit)
            .exec((err, movies) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }
    
                Movie.countDocuments(searchParams, (err, total) => {
    
                    res.json({
                        ok: true,
                        movies,
                        total: total
                    });
    
                });

            });

});

app.post('/movie', [verifyToken, verifyAdminRole], (req, res) => {

    let body = req.body;

    let movie = new Movie({
        title: body.title,
        minutes: body.minutes,
        year: body.year
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

app.put('/movie/:id', [verifyToken, verifyAdminRole], (req, res) => {

    let id = req.params.id;
    let body = _.pick(req.body, ['title', 'minutes', 'year']);

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

app.delete('/movie/:id', [verifyToken, verifyAdminRole], (req, res) => {

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