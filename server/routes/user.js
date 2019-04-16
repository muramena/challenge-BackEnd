const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const {  } = require('../middleware/authentication');
const _ = require('underscore');
const { verifyAdminRole, verifyToken } = require('../middleware/authentication');

const app = express();

/**
 * OBTENER TODOS LOS USUARIOS
 * El usuario debe estar logeado y ser ADMIN
 * Se pueden enviar como parametros opcionales un name, lastname, skip y limit
 */
app.get('/user', [verifyToken, verifyAdminRole], (req, res) => {

    let searchParams = {
        state: true
    }

    let name = req.query.name;
    if (name) {
        // Busca por coincidencia parcial, no hace falta que sea completa
        searchParams.name =  { "$regex": name, "$options": "i" };
    }

    let lastname = req.query.lastname;
    if (lastname) {
        // Busca por coincidencia parcial, no hace falta que sea completa
        searchParams.lastname =  { "$regex": lastname, "$options": "i" };
    }

    let skip = req.query.skip || 0;
    skip = Number(skip);

    let limit = req.query.limit || 20;
    limit = Number(limit);

    User.find(searchParams, 'name lastname email address phone img role')
        .skip(skip)
        .limit(limit)
        .exec((err, users) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            User.countDocuments(searchParams, (err, total) => {

                res.json({
                    ok: true,
                    users,
                    total: total
                });

            });

        });

});

/**
 * CREAR UN USUARIO
 * Se envia en el body un name, lastname, email, password, role, address, phone e img
 * (role e img son opcionales)
 * (role por defecto es CLIENT)
 */
app.post('/user', (req, res) => {

    let body = req.body;

    let user = new User({
        name: body.name,
        lastname: body.lastname,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role,
        address: body.address,
        phone: body.phone,
        img: body.img
    });

    user.save((err, userDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            user: userDB
        });
    });

});

/**
 * MODIFICAR UN USUARIO
 * El usuario debe estar logeado y ser ADMIN
 * Se obtiene por URL el ID del usuario a modificar
 * Se pueden enviar en el body un name, lastname, img, role, address y un phone
 */
app.put('/user/:id', [verifyToken, verifyAdminRole], (req, res) => {

    let id = req.params.id;
    let body = _.pick(req.body, ['name', 'lastname', 'img', 'role', 'address', 'phone']);

    User.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, userDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            user: userDB
        });

    });

});

/**
 * ELIMINAR UN USUARIO
 * El usuario debe estar logeado y ser ADMIN
 * Se recibe por URL el ID del usuario a eliminar
 * Efectua una eliminacion logica
 */
app.delete('/user/:id', [verifyToken, verifyAdminRole], (req, res) => {

    let id = req.params.id;

    let logicRemove = {
        state: false
    };

    User.findByIdAndUpdate(id, logicRemove, { new: true, runValidators: true }, (err, userDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!userDB) {
            return res.status(400).json({
                ok: false,
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            ok: true,
            message: 'El usuario ha sido borrado'
        });

    });

});

module.exports = app;