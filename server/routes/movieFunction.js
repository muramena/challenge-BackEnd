// Cliente: GET
// Admin: PUT, POST, DELETE

const express = require('express');
const MovieFunction = require('../models/movieFunction');
const _ = require('underscore');
//const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

const app = express();

//Obtener todas las funciones
app.get('/function', (req, res) => {
    
    let skip = req.query.skip || 0;
    skip = Number(skip);

    let limit = req.query.limit || 20;
    limit = Number(limit);

    MovieFunction.find({})
        .skip(skip)
        .limit(limit)
        .populate({
            path: 'idRoom',
            populate: {
                path: 'idCinema',
            }
        })
        .populate('idMovie', 'title')
        .exec((err, movieFunctions) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            let functions = [];
            movieFunctions = movieFunctions.map(movieF => {
                functions.push({
                    Room: movieF.idRoom.number,
                    Cinema: movieF.idRoom.idCinema.name,
                    Movie: movieF.idMovie.title,
                    Date: movieF.date
                })
            });

            res.json({
                ok: true,
                functions
            });

        });

});

//Obtener las funciones de un cine/sala/pelicula

app.post('/function', (req, res) => {
    
    let body = req.body;

    let movieFunction = new MovieFunction({
        idRoom: body.idRoom,
        idMovie: body.idMovie,
        date: body.date
    });

    movieFunction.save((err, movieFunctionDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            movieFunction: movieFunctionDB
        });
    });

});

app.put('/function/:id', (req, res) => {

    let id = req.params.id;

});

app.delete('/function/:id', (req, res) => {

    let id = req.params.id;

    //ELIMINA TICKETS

});

module.exports = app;