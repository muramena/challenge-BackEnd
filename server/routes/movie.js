const express = require('express');
const Movie = require('../models/movie');
const _ = require('underscore');
const { verifyAdminRole, verifyToken } = require('../middleware/authentication');

const app = express();

/**
 * OBTENER PELICULAS (con estado activo)
 * El usuario debe estar logeado y ser ADMIN
 * Puede recibir tres parametros opcionales: title(nombre de la pelicula)
 * skip(cantida de elementos que se saltea) y limit(maximo de elementos devueltos)
 */
app.get('/movie', [verifyToken, verifyAdminRole], (req, res) => {
    
    let searchParams = {
        state: true
    }

    let title = req.query.title;
    if (title) {
        //El titulo debe tener el "title", no hace falta coincidencia completa
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

/**
 * CREAR UNA PELICULA
 * El usuario debe estar logeado y ser ADMIN
 * Son necesario un title (titulo de la pelicula) y un year (año de publicacion)
 * Tambien se puede enviar de manera opcional los minutes (minutos de duracion)
 * Todos por el body
 */
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

/**
 * MODIFICAR UNA PELICULA
 * El usuario debe estar logeado y ser ADMIN
 * Se recibe en la URL el ID de la pelicula a modificar
 * Permite modificar tres atributos: title, minutes y year
 * Todos se envian por el body
 */
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

/**
 * ELIMINAR UNA PELICULA
 * El usuario debe estar loggeado y ser ADMIN
 * En la URL se recibe el ID, y se hace una eliminacion logica para mantener un registro historico
 */
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