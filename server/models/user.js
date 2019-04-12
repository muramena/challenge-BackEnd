//Falta validación teléfono, normalizar dirección

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
        required: [true, 'El nombre es necesario']
    },
    lastname: {
        type: String,
        required: [true, 'El apellido es necesario']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'El email es necesario']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    address: { //DEBERIA NORMALIZARCE
        type: String,
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

module.exports = mongoose.model('User', userSchema);



// userSchema.methods.toJSON = function() {

//     let user = this;
//     let userObject = user.toObject();
//     delete userObject.password;

//     return userObject;
// }
