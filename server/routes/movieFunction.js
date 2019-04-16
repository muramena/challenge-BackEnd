const express = require('express');
const MovieFunction = require('../models/movieFunction');
const Ticket = require('../models/ticket');
const Movie = require('../models/movie');
const _ = require('underscore');
const { verifyAdminRole, verifyToken } = require('../middleware/authentication');

const app = express();

/**
 * OBTENER TODAS LAS FUNCIONES
 * El usuario debe estar logeado
 * Permite filtrar por idMovie, idRoom o una Fecha especifica
 * Tambien acepta parametros como skip y limit
 */
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

/**
 * OBTENER LAS FUNCIONES DE UN CINE PARTICULAR
 * EL usuario debe estar logeado y ser ADMIN
 * Caso particular de la funcion anterior, pero se debe ser admin y enviar el ID del cine en la URL
 * (Solo un ADMIN tiene acceso a los ID de los cines)
 * Tambien acepta como parametros skip y limit
 */
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

/**
 * CREAR UNA FUNCION DE CINE
 * El usuario debe estar logeado y ser ADMIN
 * Se reciben en el body el idRoom, idMovie, date (fecha en formato YYYY-MM-DD), hours y minutes
 */
app.post('/function', [verifyToken, verifyAdminRole], (req, res) => {
    
    let body = req.body;

    let date = new Date(body.date);
    date.setHours(body.hours, body.minutes);
    // Pone la hora en tiempo local, porque resta cerca de 21hs la primera vez
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
                    //No se puede porque hay una funcion antes de que la nueva termine
                    return res.status(201).json(resNext)
                } else {
                    if (resPrev.ok === false) {
                        //No se puede porque hay una funcion antes de que la nueva empieze
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

/**
 * ELIMINAR UNA FUNCION DE CINE
 * El usuario debe estar logeado y ser ADMIN
 * Se recibe la id en la URL
 * Elimina primero todos los tickets de la funcion, y luego la funcion misma
 * (Seria mejor hacerlo con un trigger, pero "deleteMany" no los dispara segun la documentacion)
 */
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


//FUNCIONES EXTRA

/**
 * OBTENER LA DURACION DE LA PELICULA
 * Devuelve la duracion de la pelicula de la funcion
 * @param {*} idMovieNF ID de la pelicula que se desea transmitir en la funcion
 * @param {*} callback Se devuelven como parametros en el la duracion misma
 */
const movieDuration = (idMovieNF, callback) => {
    Movie.find({_id: idMovieNF}).exec((err, movieDB) => {

        if (err) {
            return {
                ok: false,
                err
            };
        }
        
        callback(movieDB[0].minutes);
        return
        
    });
}

/**
 * REVISAR DISPONIBILIDAD FUTURA DE LA SALA
 * Obtiene la funcion siguiente calendarizada en la sala (si es que la hay), y verifica
 * que la funcion que se desea crear termine antes de que esa funcion comienze.
 * @param {*} dateNF Fecha de la funcion nueva
 * @param {*} idRoom Sala en la que se la desea crear
 * @param {*} duration Duracion de la funcion nueva
 * @param {*} callback Se devuelven como parametros en el un objeto de estado
 * Ese objeto dice si es posible con un ok:true o en caso contrario un ok:false
 * (Tambien puede incluir un mensaje para aclarar)
 */
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
                // No se encontro una funcion a futuro
                callback(dateNF, { ok: true })
                return 
            }

        });

}

/**
 * REVISAR DISPONIBILIDAD PREVIA DE LA SALA
 * Obtiene la funcion previa calendarizada en la sala (si es que la hay), y verifica
 * que la funcion que se desea crear empieze despues de que esa funcion termine.
 * @param {*} dateNF Fecha de la funcion nueva
 * @param {*} idRoom Sala en la que se la desea crear
 * @param {*} resNext Respuesta del checkeo por funcion futura
 * @param {*} callback Se devuelven como parametros en el resNext, y un objeto de estado
 * Ese objeto dice si es posible con un ok:true o en caso contrario un ok:false
 * (Tambien puede incluir un mensaje para aclarar)
 */
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
                // No se encontro una funcion anterior
                callback(resNext, { ok: true });
                return
            }
            
        });

}

module.exports = app;