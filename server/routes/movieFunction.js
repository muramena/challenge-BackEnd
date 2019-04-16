const express = require('express');
const MovieFunction = require('../models/movieFunction');
const Ticket = require('../models/ticket');
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

    movieDuration(movieFunction.idMovie, (duration) => {
        checkNext(movieFunction.date, movieFunction.idRoom, duration, (date, resNext) => {
            checkPrev(date, movieFunction.idRoom, resNext, (resNext, resPrev) => {

                if (resNext.ok === false) {
                    return res.status(201).json(resNext)
                } else {
                    if (resPrev.ok === false) {
                        return res.status(201).json(resPrev)
                    } else {
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

                    }
                }
            });
        });
    });

});

app.delete('/function/:id', [verifyToken, verifyAdminRole], (req, res) => {

    let id = req.params.id;

    Ticket.deleteMany({idMovieFunction: id}, (err, tickets) => {

        console.log(`Tickets eliminados: ${tickets.deletedCount}`);

        MovieFunction.findByIdAndDelete(id, (err, ticketDB) => {
    
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
    
            if (!ticketDB) {
                return res.status(400).json({
                    ok: false,
                    message: 'Función no encontrada'
                });
            }
    
            res.json({
                ok: true,
                message: 'Función eliminada'
            });
    
        });

    });

});



// Obtener duración de la película
const movieDuration = (idMovieNF, callback) => {
    Movie.find({_id: idMovieNF}).exec((err, movieDB) => {

        if (err) {
            return {
                ok: false,
                err
            };
        }
        
        callback(movieDB[0].minutes);
        return movieDB[0].minutes;
        
    });
}

// Función para chequear que no vaya a empezar una película antes de que termine esta
const checkNext = (dateNF, idRoom, duration, callback) => {

    MovieFunction.find({date: { $gte: dateNF }, idRoom: idRoom})
        .sort({date: 1})
        .limit(1)
        .populate('idMovie')
        .exec((err, movieFunctionNextDB) => {

            if (err) {
                callback(dateNF, { ok: false, err })
                return
            }

            if (movieFunctionNextDB[0]) {
                
                let date = new Date(dateNF);
                // Fecha y hora del final de la funcion actual
                date.setTime(date.getTime() + duration*60000);
                
                if (date >= movieFunctionNextDB[0].date){
                    callback(dateNF, { ok: false, message: 'La sala va a estar ocupada antes de que esta función termine' })
                    return 
                } else {
                    callback(dateNF, { ok: true })
                    return 
                }

            } else {
                callback(dateNF, { ok: true })
                return 
            }

        });

}

//
const checkPrev = (dateNF, idRoom, resNext, callback) => {

    MovieFunction.find({date: {$lte: dateNF}, idRoom: idRoom})
        .sort({date: -1})
        .limit(1)
        .populate('idMovie')
        .exec((err, movieFunctionPrevDB) => {

            if (err) {
                callback (resNext, { ok: false, err });
                return 
            }

            if (movieFunctionPrevDB[0]) {

                let date = new Date(movieFunctionPrevDB[0].date);
                // Fecha y hora del final de la funcion previa
                date.setTime(date.getTime() + movieFunctionPrevDB[0].idMovie.minutes*60000);
                
                if (date >= dateNF){
                    callback(resNext, { ok: false, message: 'La sala esta ocupada por una funcion anterior' });
                    return
                } else {
                    callback(resNext, { ok: true });
                    return
                }

            } else {
                callback(resNext, { ok: true });
                return
            }
            
        });

}

module.exports = app;