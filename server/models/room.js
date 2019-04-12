const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
    idCinema: {
        type: Schema.Types.ObjectId,
        ref: 'Cinema',
        required: true
    },
    capacity: {
        type: Number,
        required: [true, 'Necesita establecer una capacidad para la sala']
    }
});

module.exports = mongoose.model('Room', roomSchema);