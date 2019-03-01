// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Inicializar variables
var app = express();

app.use(express.static('public'));

// CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});

// Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var publicacionRoutes = require('./routes/publicacion');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');
var loginRoutes = require('./routes/login');

// Conexión a la base de datos
mongoose.connection.openUri('mongodb+srv://mgoalez:Mirric1995@cluster0-qzif2.mongodb.net/test?retryWrites=true', (err, res) => {
    if (err) {
        throw err;
    }

    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
});


/* // Server index config
var serveIndex = require('serve-index');
app.use(express.static(__dirname + '/'))
app.use('/uploads', serveIndex(__dirname + '/uploads')); */

// Rutas
app.use('/usuario', usuarioRoutes);
app.use('/publicacion', publicacionRoutes);
app.use('/medico', medicoRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/login', loginRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);
app.use('/', appRoutes);


app.set('port', process.env.PORT || 3000);

// Excuchar peticiones
app.listen(app.get('port'), () => {
    console.log('Express server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m', 'online');

});