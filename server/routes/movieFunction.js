const express = require('express');
const MovieFunction = require('../models/movieFunction');
const Movie = require('../models/movie');
const _ = require('underscore');
const { verifyAdminRole, verifyToken } = require('../middleware/authentication');

const app = express();

//Obtener todas las funciones
app.get('/function', verifyToken, (req, res) => {
    
    let searchParams = {};

    let idMovie = req.query.idMovie;
    if (idMovie) {
        searchParams.idMovie = idMovie;
    }

    let idRoom = req.query.idRoom;
    if (idRoom) {
        searchParams.idRoom = idRoom;
    }

    let date = req.query.date;
    if (date) {
        let day = new Date(date);
        let tomorrow = new Date(date);
        tomorrow.setDate(tomorrow.getDate() + 1);
        searchParams.date = { $gt : day ,  $lt: tomorrow }
        console.log(day);
        console.log(tomorrow);
    }

    let skip = req.query.skip || 0;
    skip = Number(skip);

    let limit = req.query.limit || 20;
    limit = Number(limit);

    MovieFunction.find(searchParams)
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
            movieFunctions.map(movieF => {
                functions.push({
                    id: movieF.id,
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

// Obtener todas las funciones de un cine (Trae todas y luego las filtra)
app.get('/function/:id', [verifyToken, verifyAdminRole], (req, res) => {

    let idCinema = req.params.id;

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
                match: { _id: idCinema }
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

            movieFunctions = movieFunctions.filter(movieF => movieF.idRoom.idCinema);

            let functions = [];
            movieFunctions.map(movieF => {
                functions.push({
                    id: movieF.id,
                    Room: movieF.idRoom.number,
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

// Crear una funcion
app.post('/function', [verifyToken, verifyAdminRole], async (req, res) => {
    
    let problem = {}

    let body = req.body;

    let date = new Date(body.date);
    date.setHours(body.hours, body.minutes);
    // NO SE PORQUE ME CAMBIA LA HORA DE LA MANEA EN QUE LO HACE, PERO ESO LO ARRGLA 
    date.setTime( date.getTime() + date.getTimezoneOffset()*60*1000*7 );

    let movieFunction = new MovieFunction({
        idRoom: body.idRoom,
        idMovie: body.idMovie,
        date
    });

    //CHECKEAR DISPONIBILIDAD DE LA SALA EN ESA FECHA/HORA EN BASE A LA DURACION DE LA PELICULA
    await MovieFunction.find({date: { $gte: movieFunction.date }}) //$lt   $lte
        .sort({date: 1})
        .limit(1)
        .populate('idMovie')
        .exec((err, movieFunctionNextDB) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (movieFunctionNextDB) {
                
                Movie.find({_id: movieFunction.idMovie}).exec((err, movieDB) => {
                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            err
                        });
                    }
                    
                    let date = new Date(movieFunction.date);
                    // Fecha y hora del final de la funcion actual
                    date.setTime(date.getTime() + movieDB[0].minutes*60000);
                    
                    if (date >= movieFunctionNextDB[0].date){
                        return res.status(400).json({
                            ok: false,
                            message: 'La sala va a estar ocupada antes de que esta funcion termine'
                        });
                    }
                    
                });

            }

            MovieFunction.find({date: {$lte: movieFunction.date}})
                .sort({date: -1})
                .limit(1)
                .populate('idMovie')
                .exec((err, movieFunctionPrevDB) => {

                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            err
                        });
                    }

                    if (movieFunctionPrevDB[0]) {

                        let date = new Date(movieFunctionPrevDB[0].date);
                        // Fecha y hora del final de la funcion previa
                        date.setTime(date.getTime() + movieFunctionPrevDB[0].idMovie.minutes*60000);
                        
                        if (date >= movieFunction.date){
                            return res.status(400).json({
                                ok: false,
                                message: 'La sala esta ocupada por una funcion anterior'
                            });
                        } else {
                            return res.json({
                                movieFunctionNextDB,
                                movieFunctionPrevDB
                            })
                        }
                    }
                    
                });

        });




    // movieFunction.save((err, movieFunctionDB) => {

    //     if (err) {
    //         return res.status(400).json({
    //             ok: false,
    //             err
    //         });
    //     }
    //     res.json({
    //         ok: true,
    //         movieFunction: movieFunctionDB
    //     });
    // });

});

app.delete('/function/:id', [verifyToken, verifyAdminRole], (req, res) => {

    let id = req.params.id;

    //ELIMINA TICKETS

});

module.exports = app;