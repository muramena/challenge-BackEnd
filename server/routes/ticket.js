const express = require('express');
const Ticket = require('../models/ticket');
const MovieFunction = require('../models/movieFunction');
const app = express();
const { verifyAdminRole, verifyToken } = require('../middleware/authentication');

/**
 * OBTENER TODOS LOS TICKETS
 * El usuario debe estar logeado y ser ADMIN
 * Se pueden enviar como parametros opcionales un idUser, idMovieFunction, skip y limit
 */
app.get('/ticket', [verifyToken, verifyAdminRole], (req, res) => {
    
    let searchParams = {}

    let idUser = req.query.idUser;
    if (idUser) {
        searchParams.idUser =  idUser;
    }

    let idMovieFunction = req.query.idMovieFunction;
    if (idMovieFunction) {
        searchParams.idMovieFunction =  idMovieFunction;
    }

    let skip = req.query.skip || 0;
    skip = Number(skip);

    let limit = req.query.limit || 20;
    limit = Number(limit);

    Ticket.find(searchParams)
        .skip(skip)
        .limit(limit)
        .populate({
            path: 'idMovieFunction',
            populate: {
                path: 'idRoom idMovie',
                populate: {
                    path: 'idCinema'
                }
            },
        })
        .populate('idUser')
        .exec((err, tickets) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            let entradas = [];
            tickets.map(entrada => {
                entradas.push({
                    ID: entrada.id,
                    Amount: entrada.amount,
                    Client: entrada.idUser.name + ' ' + entrada.idUser.lastname,
                    Room: entrada.idMovieFunction.idRoom.number,
                    Cinema: entrada.idMovieFunction.idRoom.idCinema.name,
                    Movie: entrada.idMovieFunction.idMovie.title,
                    Date: entrada.idMovieFunction.date
                })
            });

            res.json({
                ok: true,
                entradas
            });

        });

});

/**
 * OBTENER MIS TICKETS
 * El usuario debe estar logeado
 * Se obtiene el idUser del token
 * Se pueden enviar como parametros opcionales un skip y un limit
 */
app.get('/mytickets', verifyToken, (req, res) => {
    
    let searchParams = { idUser: req.user._id,}

    let skip = req.query.skip || 0;
    skip = Number(skip);

    let limit = req.query.limit || 20;
    limit = Number(limit);

    Ticket.find(searchParams)
        .skip(skip)
        .limit(limit)
        .populate({
            path: 'idMovieFunction',
            populate: {
                path: 'idRoom idMovie',
                populate: {
                    path: 'idCinema'
                }
            },
        })
        .populate('idUser')
        .exec((err, tickets) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            let entradas = [];
            tickets.map(entrada => {
                entradas.push({
                    ID: entrada.id,
                    Amount: entrada.amount,
                    Client: entrada.idUser.name + ' ' + entrada.idUser.lastname,
                    Room: entrada.idMovieFunction.idRoom.number,
                    Cinema: entrada.idMovieFunction.idRoom.idCinema.name,
                    Movie: entrada.idMovieFunction.idMovie.title,
                    Date: entrada.idMovieFunction.date
                })
            });

            res.json({
                ok: true,
                entradas
            });

        });

});



/**
 * CREAR UN TICKET
 * El usuario debe estar logeado
 * Se reciben en el body un idMovieFuncion y un amount(cantidad)
 * El idUser se obtiene del token
 * (Antes de crearlo se verifica que no se vaya a exceder la capacidad de la sala)
 */
app.post('/ticket', verifyToken, (req, res) => {

    let body = req.body;

    let ticket = new Ticket({
        idMovieFunction: body.idMovieFunction,
        idUser: req.user._id,
        amount: body.amount
    });

    Ticket.find({idMovieFunction: ticket.idMovieFunction}).exec((err, tickets) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        let totalSold = 0;
        tickets.forEach(ticketDB => totalSold += ticketDB.amount);
        // Total de tickets vendidos para la funcion

        MovieFunction.findById(ticket.idMovieFunction)
            .populate('idRoom')
            .exec((err, movieFunction) =>{

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }

                if (movieFunction.idRoom.capacity >= totalSold + ticket.amount) {

                    ticket.save((err, ticketDB) => {

                        if (err) {
                            return res.status(400).json({
                                ok: false,
                                err
                            });
                        }
                        // Hay suficientes entradas
                        res.json({
                            ok: true,
                            ticket: ticketDB
                        });
                    });

                } else {
                    return res.status(200).json({
                        ok: false,
                        message: 'No quedan suficientes entradas'
                    });
                }

        });

    });

});

/**
 * ELIMINAR UN TICKET
 * El usuario debe estar logeado y ser ADMIN
 * Se recibe en la URL el ID del ticket a eliminar
 */
app.delete('/ticket/:id', [verifyToken, verifyAdminRole], (req, res) => {

    let id = req.params.id;

    Ticket.findByIdAndDelete(id, (err, ticketDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!ticketDB) {
            return res.status(400).json({
                ok: false,
                message: 'Ticket no encontrado'
            });
        }

        res.json({
            ok: true,
            message: 'Ticket eliminado'
        });

    });

});

module.exports = app;