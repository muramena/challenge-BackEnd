// Cliente: GET, POST 
// Admin: PUT, DELETE
const express = require('express');
const Ticket = require('../models/ticket');
const MovieFunction = require('../models/movieFunction');
const app = express();
const { verifyAdminRole, verifyToken } = require('../middleware/authentication');

app.get('/ticket', function(req, res) {
    
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

app.post('/ticket', (req, res) => {

    let body = req.body;

    let ticket = new Ticket({
        idMovieFunction: body.idMovieFunction,
        idUser: body.idUser,
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

        MovieFunction.findById(ticket.idMovieFunction)
            .populate('idRoom')
            .exec((err, movieFunction) =>{

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }

                console.log(movieFunction.idRoom.capacity);

                if (movieFunction.idRoom.capacity >= totalSold + ticket.amount) {

                    ticket.save((err, ticketDB) => {

                        if (err) {
                            return res.status(400).json({
                                ok: false,
                                err
                            });
                        }
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