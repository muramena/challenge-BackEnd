const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ticketSchema = new Schema({
    idUser: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    idMovieFunction: {
        type: Schema.Types.ObjectId,
        ref: 'MovieFunction',
        required: true
    },
    amount: {
        type: Number,
        default: 1,
        min: 1
    }
});

module.exports = mongoose.model('Ticket', ticketSchema);