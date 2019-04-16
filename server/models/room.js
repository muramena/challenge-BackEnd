const mongoose = require('mongoose');
const MovieFunction = require('./movieFunction');
const Ticket = require('./ticket');
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
    },
    number: {
        type: Number,
        required: true
    },
    state: {
        type: Boolean,
        default: true
    }
});

// TRIGGER PREVIO A LA ELIMINACION
// ELIMINA TODAS LAS FUNCIONES FUTURAS EN LA SALA (NO FUNCIONA)
// deleteMany no dispara trigger, por eso se haría todo acá

// roomSchema.pre('updateMany', async function(){

//     if (this._update.state === false) {

//         let date = new Date();

//         await MovieFunction.find({date: { $gte: date }, idRoom: this._conditions._id}, (err, movieFunctionsID) => {
//             MovieFunction.deleteMany({date: { $gte: date }}, (err, movieFunctions) => {
//                 console.log(movieFunctionsID);
//                 movieFunctionsID.forEach(movieF => {
//                     let cascadeTicket = Ticket.deleteMany({idMovieFunction: movieF.id}, (err, tickets) => {
//                         console.log(tickets.length);
//                     });
//                 });
//             });

//         })

//         console.log(cascade);

//     }
// });


module.exports = mongoose.model('Room', roomSchema);