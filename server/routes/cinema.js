// Cliente: 
// Admin: GET, POST, PUT, DELETE
const express = require('express');
const Cinema = require('../models/cinema');
const app = express();

app.get('/cinema', function(req, res) {
    res.json({
        ok: true,
        message: 'Obtener cines'
    });
});

module.exports = app;