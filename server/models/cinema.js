const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Room = require('./room');

const Schema = mongoose.Schema;

const cinemaSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: [true, 'Es necesario el nombre del cine']
    },
    state: {
        type: Boolean,
        default: true
    }
});


// TRIGGER PREVIO A LA ELIMINACION
// ELIMINA TODAS LAS SALAS DEL CINE ANTES DEL ELMINAR AL CINE MISMO
cinemaSchema.pre('findOneAndUpdate', async function(){

    if (this._update.state === false) {

        let logicRemove = {
            state: false
        };

        const cascade = await Room.updateMany({idCinema: this._conditions._id}, logicRemove);
        console.log('Salas eliminadas: ' + cascade.nModified);

    }
});

cinemaSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });

module.exports = mongoose.model('Cinema', cinemaSchema);