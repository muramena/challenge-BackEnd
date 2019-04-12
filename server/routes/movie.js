// Cliente: 
// Admin: GET, PUT, POST, DELETE
const express = require('express');
const Movie = require('../models/movie');
const app = express();

app.get('/movie', function(req, res) {
    res.json({
        ok: true,
        message: 'Obtener películas'
    });
});

module.exports = app;