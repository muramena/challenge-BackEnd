// Cliente: 
// Admin: GET, PUT, POST, DELETE

const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const {  } = require('../middleware/authentication');

const app = express();

app.get('/user', /*tokenVerificationAdmin,*/ (req, res) => {
    let skip = req.query.skip || 0;
    skip = Number(skip);

    let limit = req.query.limit || 20;
    limit = Number(limit);

    User.find({ state: true }, 'name lastname email address phone img role')
        .skip(skip)
        .limit(limit)
        .exec((err, users) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            User.count({ state: true }, (err, total) => {

                res.json({
                    ok: true,
                    users,
                    total: total
                });

            });

        });

});

app.post('/user', function (req, res) {

    let body = req.body;

    let user = new User({
        name: body.name,
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
        })
    });

});