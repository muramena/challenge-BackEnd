const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cinemaSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Es necesario el nombre del cine']
    }
});

module.exports = mongoose.model('Cinema', cinemaSchema);