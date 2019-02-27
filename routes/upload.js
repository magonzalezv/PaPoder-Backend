var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Publicacion = require('../models/publicacion');
var Medico = require('../models/medico');

app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de colección
    var tiposValidos = ['publicaciones', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no válida',
            error: { message: 'Las colecciones válidas son: ' + tiposValidos.join(', ') }
        });
    }

    if (!req.files) {
        return res.status(404).json({
            ok: false,
            mensaje: 'No seleccionó nada',
            error: { message: 'Debe seleccionar una imagen' }
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var nombreCompleto = archivo.name;
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Extensiones aceptadas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(404).json({
            ok: false,
            mensaje: 'Extensión no válida',
            error: { message: 'Las extensiones válidas son: ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    //var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${extensionArchivo}`;

    // Mover el archivo del temporal a un path
    var path = `./uploads/${ tipo }/${nombreCompleto}`;

    archivo.mv(path, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                error: err
            });
        }

        subirPorTipo(tipo, id, nombreCompleto, res);



        /*  res.status(200).json({
             ok: true,
             mensaje: 'Archivo movido',
             extension: extensionArchivo
         }); */
    });


});



function subirPorTipo(tipo, id, nombreCompleto, res) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(404).json({
                    ok: true,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });
            }

            
            var pathViejo = './uploads/usuarios/' + usuario.img;

            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, (err) =>{
                    if(err) {
                        console.log(err);
                    }
                });
            }

            usuario.img = nombreCompleto
            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
            });

        });
    }

    if (tipo === 'publicaciones') {

       return;
    }
}


module.exports = app;