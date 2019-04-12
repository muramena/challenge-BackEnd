// Cliente: 
// Admin: GET, PUT, POST, DELETE
const express = require('express');
const Room = require('../models/room');
const app = express();

app.get('/room', function(req, res) {
    res.json({
        ok: true,
        message: 'Obtener salas'
    });
});

module.exports = app;