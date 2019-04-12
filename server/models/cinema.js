const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

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

cinemaSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });

module.exports = mongoose.model('Cinema', cinemaSchema);