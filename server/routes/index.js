const express = require('express');

const app = express();

app.use(require('./cinema'));
app.use(require('./movie'));
app.use(require('./movieFunction'));
app.use(require('./room'));
app.use(require('./ticket'));
app.use(require('./user'));

module.exports = app;