var express = require('express');

var app = express();

var Publicacion = require('../models/publicacion');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// ===========================================
// Busqueda por Colecciones
// ===========================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;

        case 'publicaciones':
            promesa = buscarPublicaciones(busqueda, regex);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda solo son: usuarios y publicaciones',
                error: { message: 'Tipo de tabla/colección no válido' }
            });

    }
    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    })

});

// ===========================================
// Busqueda General
// ===========================================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
            buscarPublicaciones(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                publicaciones: respuestas[0],
                usuarios: respuestas[1]
            });
        });

});

function buscarPublicaciones(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Publicacion.find({ nombre: regex })
            .populate('usuario', 'nombre email img')
            .exec((err, publicaciones) => {
                if (err) {
                    reject('Error al cargar publicaciones', err);
                } else {
                    resolve(publicaciones)
                }
            });
    });


}


function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role img')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });


}

module.exports = app;