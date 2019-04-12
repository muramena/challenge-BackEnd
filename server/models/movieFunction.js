const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const movieFunctionSchema = new Schema({
    idRoom: {
        type: Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    idMovie: {
        type: Schema.Types.ObjectId,
        ref: 'Movie',
        required: true
    },
    date: {
        type: Date,
        //required: true
    }
});

module.exports = mongoose.model('MovieFunction', movieFunctionSchema);