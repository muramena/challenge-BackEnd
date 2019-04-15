//===========================================
//  Puerto
//===========================================

process.env.PORT = process.env.PORT || 3000;

// ============================
//  Entorno
// ============================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ============================
//  Token
// ============================

//Seed
process.env.SEED = process.env.SEED || 'dev-seed';

//Caducidad
process.env.Token_Expiration = 60 * 60 * 60 * 60; // Una hora

// ============================
//  Base de datos
// ============================
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/ticketsCine';
} else {
    urlDB = process.env.MONGO_URI;
}
process.env.URLDB = urlDB;