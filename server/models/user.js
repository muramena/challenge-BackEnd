const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const validRoles = {
    values: ['CLIENT', 'ADMIN'],
    message: '{VALUE} no es un rol válido'
}

const Schema = mongoose.Schema;

let userSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'El nombre es necesario']
    },
    lastname: {
        type: String,
        trim: true,
        required: [true, 'El apellido es necesario']
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        required: [true, 'El email es necesario']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    address: { //DEBERIA NORMALIZARCE
        type: String,
        trim: true,
        required: [true, 'La dirección es necesaria']
    },
    phone: { //FALTA VALIDAR
        type: String,
        required: [true, 'El telefono es necesario']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'CLIENT',
        enum: validRoles
    },
    state: {
        type: Boolean,
        default: true
    }
});

userSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });

userSchema.methods.toJSON = () => {

    let user = this;

    let userJSON = {
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        address: user.address,
        phone: user.phone,
        img: user.img
    }

    console.log(user);
    console.log(userJSON);

    return userJSON;
}

module.exports = mongoose.model('User', userSchema);


