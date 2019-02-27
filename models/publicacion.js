var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var publicacionSchema = new Schema({
    nombre: { type: String, required: [true, 'El	nombre	es	necesario'] },
    descripcion: { type: String, required: [true, 'La descripción es	necesaria'] },
    extracto: { type: String, required: [true, 'El extracto es necesario'] },
    categoria: { type: String, required: [true, 'La categoria es necesaria'] },
    comentarios: { type: String, required: false },
    img: { type: String, required: false },
    puntuacion: { type: String, required: false },
    visitas: { type: Number, required: false },
    meGusta: { type: Number, default: 0, required: false },
    meDivierte: { type: Number, default: 0, required: false },
    meSorprende: { type: Number, default: 0, required: false },
    meEntristece: { type: Number, default: 0, required: false },
    meEnoja: { type: Number, default: 0, required: false },
    meGustaPor: { type: Array, required: false },
    meDiviertePor: { type: Array, required: false },
    meSorprendePor: { type: Array, required: false },
    meEntristecePor: { type: Array, required: false },
    meEnojaPor: { type: Array, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    fecha: { type: Date, default: Date.now() }
}, { collection: 'Publicaciones' });
module.exports = mongoose.model('Publicacion', publicacionSchema); 