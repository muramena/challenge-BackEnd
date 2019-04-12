// Cliente: GET
// Admin: PUT, POST, DELETE

const express = require('express');
const MovieFunction = require('../models/movieFunction');
//const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

const app = express();

app.get('/function', (req, res) => {

});