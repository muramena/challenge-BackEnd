const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const movieSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Es necesario un nombre para agregar la película']
    },
    minutes: { 
        // Se usa para validar que mientras se esta dando una función, no se pueda usar la sala para otra
        // Por default se asume que la pelicula dura 3hs
        type: Number,
        default: 180 
    }
});

module.exports = mongoose.model('Movie', movieSchema);