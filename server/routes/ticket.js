// Cliente: GET?, POST 
// Admin: PUT, DELETE
const express = require('express');
const Ticket = require('../models/ticket');
const app = express();

app.get('/ticket', function(req, res) {
    res.json({
        ok: true,
        message: 'Obtener tickets'
    });
});

module.exports = app;