var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Publicacion = require('../models/publicacion');

// =====================================
// Obtener todas las publicaciones 
// =====================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Publicacion.find({})
        .skip(desde)
        .limit(20)
        .populate('usuario')
        .exec(
            (err, publicaciones) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando publicaciones',
                        errors: err
                    });
                }

                Publicacion.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        publicaciones: publicaciones,
                        total: conteo
                    });
                });


            });


});


// ==========================================
// Obtener Hospital por ID
// ==========================================
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Publicacion.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, publicacion) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar publicación',
                    errors: err
                });
            }
            if (!publicacion) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'la publicación con el id ' + id + 'no existe',
                    errors: { message: 'No existe una publicación con ese ID' }
                });
            }
            res.status(200).json({
                ok: true,
                publicacion: publicacion
            });
        })
})


// =====================================
// Crear una nueva publicacion
// =====================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var publicacion = new Publicacion({
        nombre: body.nombre,
        usuario: req.usuario._id,
        descripcion: body.descripcion,
        extracto: body.extracto,
        categoria: body.categoria,
        comentarios: body.comentarios,
        img: body.img,
        puntuacion: body.puntuacion,
        visitas: body.visitas,
    });

    publicacion.save((err, publicacionGuardada) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear publicacion',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            publicacion: publicacionGuardada
        });

    });
});

// =====================================
// Actualizar Publicacion
// =====================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Publicacion.findById(id, (err, publicacion) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar publicacion',
                errors: err
            });
        }

        if (!publicacion) {
            return res.status(404).json({
                ok: false,
                mensaje: 'La publicación con el id: ' + id + 'no existe',
                errors: { message: 'No existe una publicación con ese ID' }

            });
        }

        publicacion.nombre = body.nombre;
        publicacion.descripcion = body.descripcion;
        publicacion.extracto = body.extracto;
        publicacion.categoria = body.categoria;
        publicacion.comentarios = body.comentarios;
        publicacion.img = body.img;
        publicacion.puntuacion = body.puntuacion;
        publicacion.visitas = body.visitas;
        publicacion.usuario = req.usuario._id;

        publicacion.save((err, publicacionActualizada) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar publicacion',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                publicacion: publicacionActualizada
            });

        });

    });
});


// =====================================
// Me gusta una publicación
// =====================================
app.put('/:id/meGusta', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    var usuario = req.usuario.nombre;
    Publicacion.findById(id, (err, publicacion) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar publicacion',
                errors: err
            });
        }

        if (!publicacion) {
            return res.status(404).json({
                ok: false,
                mensaje: 'La publicación con el id: ' + id + 'no existe',
                errors: { message: 'No existe una publicación con ese ID' }

            });
        }
        // Check if the user who liked the post has already liked the blog post before
        if ( publicacion.meGustaPor.includes(usuario) ) {
            res.json({ success: false, message: 'Ya te ha gustado la publicación' });
        }else {
              // Revisa si el usuario que le dió me gusta le dió Me Divierte antes
              if (publicacion.meDiviertePor.includes(usuario)) {
                publicacion.meDivierte--; // Reduce el número total de Me divierte
                const arrayIndex = publicacion.meDiviertePor.indexOf(usuario); // Get the index of the username in the array for removal
                publicacion.meDiviertePor.splice(arrayIndex, 1); // Remove user from array
                publicacion.meGusta++; // Incrementa Me gusta
                publicacion.meGustaPor.push(usuario); //Agrega el usuario al Array meGustaPor
                // Guardar datos de la publicación
                publicacion.save((err) => {
                  // Check if error was found
                  if (err) {
                    res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                  } else {
                    res.json({ success: true, message: 'Blog liked!' }); // Return success message
                  }
                });
              } else {
                  if (publicacion.meSorprendePor.includes(usuario)) {
                    publicacion.meSorprende--; // Reduce el número total de Me Sorprende
                    const arrayIndex = publicacion.meSorprendePor.indexOf(usuario); // Get the index of the username in the array for removal
                    publicacion.meSorprendePor.splice(arrayIndex, 1); // Remove user from array
                    publicacion.meGusta++; // Incrementa Me gusta
                    publicacion.meGustaPor.push(usuario); //Agrega el usuario al Array meGustaPor
                    // Guardar datos de la publicación
                    publicacion.save((err) => {
                      // Check if error was found
                      if (err) {
                        res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                      } else {
                        res.json({ success: true, message: 'Blog liked!' }); // Return success message
                      }
                    });
                  } else {
                    if (publicacion.meEntristecePor.includes(usuario)) {
                        publicacion.meEntristece--; // Reduce el número total de Me Entristece
                        const arrayIndex = publicacion.meEntristecePor.indexOf(usuario); // Get the index of the username in the array for removal
                        publicacion.meEntristecePor.splice(arrayIndex, 1); // Remove user from array
                        publicacion.meGusta++; // Incrementa Me gusta
                        publicacion.meGustaPor.push(usuario); //Agrega el usuario al Array meGustaPor
                        // Guardar datos de la publicación
                        publicacion.save((err) => {
                          // Check if error was found
                          if (err) {
                            res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                          } else {
                            res.json({ success: true, message: 'Blog liked!' }); // Return success message
                          }
                        });
                      } else {
                        if (publicacion.meEnojaPor.includes(usuario)) {
                            publicacion.meEnoja--; // Reduce el número total de Me Enoja
                            const arrayIndex = publicacion.meEnojaPor.indexOf(usuario); // Get the index of the username in the array for removal
                            publicacion.meEnojaPor.splice(arrayIndex, 1); // Remove user from array
                            publicacion.meGusta++; // Incrementa Me gusta
                            publicacion.meGustaPor.push(usuario); //Agrega el usuario al Array meGustaPor
                            // Guardar datos de la publicación
                            publicacion.save((err) => {
                              // Check if error was found
                              if (err) {
                                res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                              } else {
                                res.json({ success: true, message: 'Blog liked!' }); // Return success message
                              }
                            });
                          }    else {
                            publicacion.meGusta++; // Incrementa meGusta
                            publicacion.meGustaPor.push(usuario); // Add liker's username into array of likedBy
                            // Save blog post
                            publicacion.save((err) => {
                              if (err) {
                                res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                              } else {
                                res.json({ success: true, message: 'Blog liked!' }); // Return success message
                              }
                            });
                          }
                      }
                  }
              }
              
        }
    });
});


// =====================================
// Me divierte una publicación
// =====================================
app.put('/:id/meDivierte', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    var usuario = req.usuario.nombre;
    Publicacion.findById(id, (err, publicacion) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar publicacion',
                errors: err
            });
        }

        if (!publicacion) {
            return res.status(404).json({
                ok: false,
                mensaje: 'La publicación con el id: ' + id + 'no existe',
                errors: { message: 'No existe una publicación con ese ID' }

            });
        }
        // Check if the user who liked the post has already liked the blog post before
        if ( publicacion.meDiviertePor.includes(usuario) ) {
            res.json({ success: false, message: 'Ya te ha divertido la publicación' });
        }else {
              // Revisa si el usuario que le dió me gusta le dió Me Divierte antes
              if (publicacion.meGustaPor.includes(usuario)) {
                publicacion.meGusta--; // Reduce el número total de Me divierte
                const arrayIndex = publicacion.meDiviertePor.indexOf(usuario); // Get the index of the username in the array for removal
                publicacion.meGustaPor.splice(arrayIndex, 1); // Remove user from array
                publicacion.meDivierte++; // Incrementa Me divierte
                publicacion.meDiviertePor.push(usuario); //Agrega el usuario al Array meDiviertePor
                // Guardar datos de la publicación
                publicacion.save((err) => {
                  // Check if error was found
                  if (err) {
                    res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                  } else {
                    res.json({ success: true, message: 'Blog liked!' }); // Return success message
                  }
                });
              } else {
                  if (publicacion.meSorprendePor.includes(usuario)) {
                    publicacion.meSorprende--; // Reduce el número total de Me Sorprende
                    const arrayIndex = publicacion.meSorprendePor.indexOf(usuario); // Get the index of the username in the array for removal
                    publicacion.meSorprendePor.splice(arrayIndex, 1); // Remove user from array
                    publicacion.meDivierte++; // Incrementa Me divierte
                    publicacion.meDiviertePor.push(usuario); //Agrega el usuario al Array meDiviertePor
                    // Guardar datos de la publicación
                    publicacion.save((err) => {
                      // Check if error was found
                      if (err) {
                        res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                      } else {
                        res.json({ success: true, message: 'Blog liked!' }); // Return success message
                      }
                    });
                  } else {
                    if (publicacion.meEntristecePor.includes(usuario)) {
                        publicacion.meEntristece--; // Reduce el número total de Me Entristece
                        const arrayIndex = publicacion.meEntristecePor.indexOf(usuario); // Get the index of the username in the array for removal
                        publicacion.meEntristecePor.splice(arrayIndex, 1); // Remove user from array
                        publicacion.meDivierte++; // Incrementa Me divierte
                        publicacion.meDiviertePor.push(usuario); //Agrega el usuario al Array meDiviertePor
                        // Guardar datos de la publicación
                        publicacion.save((err) => {
                          // Check if error was found
                          if (err) {
                            res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                          } else {
                            res.json({ success: true, message: 'Blog liked!' }); // Return success message
                          }
                        });
                      } else {
                        if (publicacion.meEnojaPor.includes(usuario)) {
                            publicacion.meEnoja--; // Reduce el número total de Me Enoja
                            const arrayIndex = publicacion.meEnojaPor.indexOf(usuario); // Get the index of the username in the array for removal
                            publicacion.meEnojaPor.splice(arrayIndex, 1); // Remove user from array
                            publicacion.meDivierte++; // Incrementa Me divierte
                            publicacion.meDiviertePor.push(usuario); //Agrega el usuario al Array meDiviertePor
                            // Guardar datos de la publicación
                            publicacion.save((err) => {
                              // Check if error was found
                              if (err) {
                                res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                              } else {
                                res.json({ success: true, message: 'Blog liked!' }); // Return success message
                              }
                            });
                          }    else {
                            publicacion.meDivierte++; // Incrementa Me divierte
                            publicacion.meDiviertePor.push(usuario); //Agrega el usuario al Array meDiviertePor
                            // Save blog post
                            publicacion.save((err) => {
                              if (err) {
                                res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                              } else {
                                res.json({ success: true, message: 'Blog liked!' }); // Return success message
                              }
                            });
                          }
                      }
                  }
              }
              
        }
    });
});


// =====================================
// Me sorprende una publicación
// =====================================
app.put('/:id/meSorprende', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    var usuario = req.usuario.nombre;
    Publicacion.findById(id, (err, publicacion) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar publicacion',
                errors: err
            });
        }

        if (!publicacion) {
            return res.status(404).json({
                ok: false,
                mensaje: 'La publicación con el id: ' + id + 'no existe',
                errors: { message: 'No existe una publicación con ese ID' }

            });
        }
        // Check if the user who liked the post has already liked the blog post before
        if ( publicacion.meSorprendePor.includes(usuario) ) {
            res.json({ success: false, message: 'Ya te ha sorprendido la publicación' });
        }else {
              // Revisa si el usuario que le dió me gusta le dió Me Divierte antes
              if (publicacion.meGustaPor.includes(usuario)) {
                publicacion.meGusta--; // Reduce el número total de Me divierte
                const arrayIndex = publicacion.meDiviertePor.indexOf(usuario); // Get the index of the username in the array for removal
                publicacion.meGustaPor.splice(arrayIndex, 1); // Remove user from array
                publicacion.meSorprende++; // Incrementa Me divierte
                publicacion.meSorprendePor.push(usuario); //Agrega el usuario al Array meDiviertePor
                // Guardar datos de la publicación
                publicacion.save((err) => {
                  // Check if error was found
                  if (err) {
                    res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                  } else {
                    res.json({ success: true, message: 'Blog liked!' }); // Return success message
                  }
                });
              } else {
                  if (publicacion.meDiviertePor.includes(usuario)) {
                    publicacion.meDivierte--; // Reduce el número total de Me Sorprende
                    const arrayIndex = publicacion.meDiviertePor.indexOf(usuario); // Get the index of the username in the array for removal
                    publicacion.meDiviertePor.splice(arrayIndex, 1); // Remove user from array
                    publicacion.meSorprende++; // Incrementa Me divierte
                    publicacion.meSorprendePor.push(usuario); //Agrega el usuario al Array meDiviertePor
                    // Guardar datos de la publicación
                    publicacion.save((err) => {
                      // Check if error was found
                      if (err) {
                        res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                      } else {
                        res.json({ success: true, message: 'Blog liked!' }); // Return success message
                      }
                    });
                  } else {
                    if (publicacion.meEntristecePor.includes(usuario)) {
                        publicacion.meEntristece--; // Reduce el número total de Me Entristece
                        const arrayIndex = publicacion.meEntristecePor.indexOf(usuario); // Get the index of the username in the array for removal
                        publicacion.meEntristecePor.splice(arrayIndex, 1); // Remove user from array
                        publicacion.meSorprende++; // Incrementa Me divierte
                        publicacion.meSorprendePor.push(usuario); //Agrega el usuario al Array meDiviertePor
                        // Guardar datos de la publicación
                        publicacion.save((err) => {
                          // Check if error was found
                          if (err) {
                            res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                          } else {
                            res.json({ success: true, message: 'Blog liked!' }); // Return success message
                          }
                        });
                      } else {
                        if (publicacion.meEnojaPor.includes(usuario)) {
                            publicacion.meEnoja--; // Reduce el número total de Me Enoja
                            const arrayIndex = publicacion.meEnojaPor.indexOf(usuario); // Get the index of the username in the array for removal
                            publicacion.meEnojaPor.splice(arrayIndex, 1); // Remove user from array
                            publicacion.meSorprende++; // Incrementa Me divierte
                            publicacion.meSorprendePor.push(usuario); //Agrega el usuario al Array meDiviertePor
                            // Guardar datos de la publicación
                            publicacion.save((err) => {
                              // Check if error was found
                              if (err) {
                                res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                              } else {
                                res.json({ success: true, message: 'Blog liked!' }); // Return success message
                              }
                            });
                          }    else {
                            publicacion.meSorprende++; // Incrementa Me divierte
                            publicacion.meSorprendePor.push(usuario); //Agrega el usuario al Array meDiviertePor
                            // Save blog post
                            publicacion.save((err) => {
                              if (err) {
                                res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                              } else {
                                res.json({ success: true, message: 'Blog liked!' }); // Return success message
                              }
                            });
                          }
                      }
                  }
              }
              
        }
    });
});


// =====================================
// Me entristece una publicación
// =====================================
app.put('/:id/meEntristece', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    var usuario = req.usuario.nombre;
    Publicacion.findById(id, (err, publicacion) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar publicacion',
                errors: err
            });
        }

        if (!publicacion) {
            return res.status(404).json({
                ok: false,
                mensaje: 'La publicación con el id: ' + id + 'no existe',
                errors: { message: 'No existe una publicación con ese ID' }

            });
        }
        // Check if the user who liked the post has already liked the blog post before
        if ( publicacion.meEntristecePor.includes(usuario) ) {
            res.json({ success: false, message: 'Ya te ha entristecido la publicación' });
        }else {
              // Revisa si el usuario que le dió me gusta le dió Me Divierte antes
              if (publicacion.meGustaPor.includes(usuario)) {
                publicacion.meGusta--; // Reduce el número total de Me divierte
                const arrayIndex = publicacion.meGustaPor.indexOf(usuario); // Get the index of the username in the array for removal
                publicacion.meGustaPor.splice(arrayIndex, 1); // Remove user from array
                publicacion.meEntristece++; // Incrementa Me divierte
                publicacion.meEntristecePor.push(usuario); //Agrega el usuario al Array meDiviertePor
                // Guardar datos de la publicación
                publicacion.save((err) => {
                  // Check if error was found
                  if (err) {
                    res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                  } else {
                    res.json({ success: true, message: 'Blog liked!' }); // Return success message
                  }
                });
              } else {
                  if (publicacion.meDiviertePor.includes(usuario)) {
                    publicacion.meDivierte--; // Reduce el número total de Me Sorprende
                    const arrayIndex = publicacion.meDiviertePor.indexOf(usuario); // Get the index of the username in the array for removal
                    publicacion.meDiviertePor.splice(arrayIndex, 1); // Remove user from array
                    publicacion.meEntristece++; // Incrementa Me divierte
                    publicacion.meEntristecePor.push(usuario); //Agrega el usuario al Array meDiviertePor
                    // Guardar datos de la publicación
                    publicacion.save((err) => {
                      // Check if error was found
                      if (err) {
                        res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                      } else {
                        res.json({ success: true, message: 'Blog liked!' }); // Return success message
                      }
                    });
                  } else {
                    if (publicacion.meSorprendePor.includes(usuario)) {
                        publicacion.meSorprende--; // Reduce el número total de Me Entristece
                        const arrayIndex = publicacion.meSorprendePor.indexOf(usuario); // Get the index of the username in the array for removal
                        publicacion.meSorprendePor.splice(arrayIndex, 1); // Remove user from array
                        publicacion.meEntristece++; // Incrementa Me divierte
                        publicacion.meEntristecePor.push(usuario); //Agrega el usuario al Array meDiviertePor
                        // Guardar datos de la publicación
                        publicacion.save((err) => {
                          // Check if error was found
                          if (err) {
                            res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                          } else {
                            res.json({ success: true, message: 'Blog liked!' }); // Return success message
                          }
                        });
                      } else {
                        if (publicacion.meEnojaPor.includes(usuario)) {
                            publicacion.meEnoja--; // Reduce el número total de Me Enoja
                            const arrayIndex = publicacion.meEnojaPor.indexOf(usuario); // Get the index of the username in the array for removal
                            publicacion.meEnojaPor.splice(arrayIndex, 1); // Remove user from array
                            publicacion.meEntristece++; // Incrementa Me divierte
                            publicacion.meEntristecePor.push(usuario); //Agrega el usuario al Array meDiviertePor
                            // Guardar datos de la publicación
                            publicacion.save((err) => {
                              // Check if error was found
                              if (err) {
                                res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                              } else {
                                res.json({ success: true, message: 'Blog liked!' }); // Return success message
                              }
                            });
                          }    else {
                            publicacion.meEntristece++; // Incrementa Me divierte
                            publicacion.meEntristecePor.push(usuario); //Agrega el usuario al Array meDiviertePor
                            // Save blog post
                            publicacion.save((err) => {
                              if (err) {
                                res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                              } else {
                                res.json({ success: true, message: 'Blog liked!' }); // Return success message
                              }
                            });
                          }
                      }
                  }
              }
              
        }
    });
});


// =====================================
// Me enoja una publicación
// =====================================
app.put('/:id/meEnoja', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    var usuario = req.usuario.nombre;
    Publicacion.findById(id, (err, publicacion) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar publicacion',
                errors: err
            });
        }

        if (!publicacion) {
            return res.status(404).json({
                ok: false,
                mensaje: 'La publicación con el id: ' + id + 'no existe',
                errors: { message: 'No existe una publicación con ese ID' }

            });
        }
        // Check if the user who liked the post has already liked the blog post before
        if ( publicacion.meEnojaPor.includes(usuario) ) {
            res.json({ success: false, message: 'Ya te ha enojado la publicación' });
        }else {
              // Revisa si el usuario que le dió me gusta le dió Me Divierte antes
              if (publicacion.meGustaPor.includes(usuario)) {
                publicacion.meGusta--; // Reduce el número total de Me divierte
                const arrayIndex = publicacion.meDiviertePor.indexOf(usuario); // Get the index of the username in the array for removal
                publicacion.meGustaPor.splice(arrayIndex, 1); // Remove user from array
                publicacion.meEnoja++; // Incrementa Me divierte
                publicacion.meEnojaPor.push(usuario); //Agrega el usuario al Array meDiviertePor
                // Guardar datos de la publicación
                publicacion.save((err) => {
                  // Check if error was found
                  if (err) {
                    res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                  } else {
                    res.json({ success: true, message: 'Blog liked!' }); // Return success message
                  }
                });
              } else {
                  if (publicacion.meDiviertePor.includes(usuario)) {
                    publicacion.meDivierte--; // Reduce el número total de Me Sorprende
                    const arrayIndex = publicacion.meDiviertePor.indexOf(usuario); // Get the index of the username in the array for removal
                    publicacion.meDiviertePor.splice(arrayIndex, 1); // Remove user from array
                    publicacion.meEnoja++; // Incrementa Me divierte
                    publicacion.meEnojaPor.push(usuario); //Agrega el usuario al Array meDiviertePor
                    // Guardar datos de la publicación
                    publicacion.save((err) => {
                      // Check if error was found
                      if (err) {
                        res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                      } else {
                        res.json({ success: true, message: 'Blog liked!' }); // Return success message
                      }
                    });
                  } else {
                    if (publicacion.meSorprendePor.includes(usuario)) {
                        publicacion.meSorprende--; // Reduce el número total de Me Entristece
                        const arrayIndex = publicacion.meSorprendePor.indexOf(usuario); // Get the index of the username in the array for removal
                        publicacion.meSorprendePor.splice(arrayIndex, 1); // Remove user from array
                        publicacion.meEnoja++; // Incrementa Me divierte
                        publicacion.meEnojaPor.push(usuario); //Agrega el usuario al Array meDiviertePor
                        // Guardar datos de la publicación
                        publicacion.save((err) => {
                          // Check if error was found
                          if (err) {
                            res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                          } else {
                            res.json({ success: true, message: 'Blog liked!' }); // Return success message
                          }
                        });
                      } else {
                        if (publicacion.meEntristecePor.includes(usuario)) {
                            publicacion.meEntristece--; // Reduce el número total de Me Enoja
                            const arrayIndex = publicacion.meEntristecePor.indexOf(usuario); // Get the index of the username in the array for removal
                            publicacion.meEntristecePor.splice(arrayIndex, 1); // Remove user from array
                            publicacion.meEnoja++; // Incrementa Me divierte
                            publicacion.meEnojaPor.push(usuario); //Agrega el usuario al Array meDiviertePor
                            // Guardar datos de la publicación
                            publicacion.save((err) => {
                              // Check if error was found
                              if (err) {
                                res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                              } else {
                                res.json({ success: true, message: 'Blog liked!' }); // Return success message
                              }
                            });
                          }    else {
                            publicacion.meEnoja++; // Incrementa Me divierte
                            publicacion.meEnojaPor.push(usuario); //Agrega el usuario al Array meDiviertePor
                            // Save blog post
                            publicacion.save((err) => {
                              if (err) {
                                res.json({ success: false, message: 'Something went wrong.' }); // Return error message
                              } else {
                                res.json({ success: true, message: 'Blog liked!' }); // Return success message
                              }
                            });
                          }
                      }
                  }
              }
              
        }
    });
});


// =====================================
// Eliminar publicacion por el id
// =====================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Publicacion.findByIdAndRemove(id, (err, publicacionBorrada) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar publicación',
                errors: err
            });
        }

        if (!publicacionBorrada) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe una publicación con ese id',
                errors: { message: 'No existe una publicación con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            publicacion: publicacionBorrada
        });

    });

});

module.exports = app;