const express = require('express');
const reiniciarBDD = require('../../Iniciar BDD/iniciar');

const app = express();

app.use(require('./cinema'));
app.use(require('./movie'));
app.use(require('./movieFunction'));
app.use(require('./room'));
app.use(require('./ticket'));
app.use(require('./user'));


// DESDE ACA
app.get('/BDD', (req, res) => {

    reiniciarBDD();

    res.json({
        ok: true,
        message: 'BDD reiniciada'
    });
});
// HASTA ACA

module.exports = app;