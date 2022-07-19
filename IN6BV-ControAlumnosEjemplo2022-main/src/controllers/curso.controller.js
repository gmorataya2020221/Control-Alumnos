const Curso = require('../models/curso.model');
const Asignacion = require('../models/asignacion.model');

function agregarCurso(req, res) {
    const parametros = req.body;
    const modeloCursos = new Curso();

    // if( req.user.rol == 'ROL_MAESTRO' )

    if(parametros.nombreCurso){

        modeloCursos.nombreCurso = parametros.nombreCurso;
        modeloCursos.idMaestro = req.user.sub;

        modeloCursos.save((err, cursoGuardado) => {
            if(err) return res.status(400).send({ mensaje: 'Erorr en la peticion.' });
            if(!cursoGuardado) return res.status(400).send({ mensaje: 'Error al agregar el curso.'});

            return res.status(200).send({ cursos: cursoGuardado });
        })

    } else {
        return res.status(400).send({ mensaje: 'Debe enviar los parametros obligatorios.' })
    }
}


function asignarCurso(req, res){
    const parametros = req.body;
    const usuarioLogeado = req.user.sub;

    if( parametros.nombreCurso ){

        Asignacion.find({ idAlumno : usuarioLogeado }).populate('idCurso').exec((err, asignacionesEncontradas) => {
            if( asignacionesEncontradas.length >= 3 ) return res.status(400)
                .send({ mensaje: 'Ya se asigno al maximo de cursos, que son 3 cursos por Alumno.'});
            
            for (let i = 0; i < asignacionesEncontradas.length; i++) {
                if( asignacionesEncontradas[i].idCurso.nombreCurso == parametros.nombreCurso) return res.status(400)
                    .send({ mensaje: 'Ya se encuentra asignado a este curso.' })
            }

            Curso.findOne( { nombreCurso: parametros.nombreCurso }, (err, cursoEncontrado) =>{
                if(err) return res.status(400).send({ mensaje: 'Erorr en la peticion de obtener Curso'});
                if(!cursoEncontrado) return res.status(400).send({ mensaje: 'Error al obtener el Curso'});

                const modeloAsignacion = new Asignacion();
                modeloAsignacion.idCurso = cursoEncontrado._id;
                modeloAsignacion.idAlumno = usuarioLogeado;

                modeloAsignacion.save((err, asignacionCreada) => {
                    if(err) return res.status(400).send({ mensaje: 'Error en la peticion de agregar asignacion' });
                    if(!asignacionCreada) return res.status(400).send({ mensaje: 'Error al agregar asignacion'});

                    return res.status(200).send({ asignacion: asignacionCreada})
                })
            })


        })

    } else{
        return res.status(400).send({ mensaje: 'Debe enviar los parametros obligatorios.'});
    }
}


function eliminarCursoADefault(req, res) {
    const cursoId = req.params.idCurso;

    Curso.findOne({ _id: cursoId, idMaestro: req.user.sub }, (err, cursoMaestro)=>{
        if(!cursoMaestro){
            return res.status(400).send({ mensaje: 'No puede editar cursos que no fueron creados por su persona'});
        } else {
            Curso.findOne({ nombreCurso : 'Por Defecto' }, (err, cursoEncontrado) => {
                if(!cursoEncontrado){

                    const modeloCurso = new Curso();
                    modeloCurso.nombreCurso = 'Por Defecto';
                    modeloCurso.idMaestro = null;

                    modeloCurso.save((err, cursoGuardado)=>{
                        if(err) return res.status(400).send({ mensaje: 'Error en la peticion de Guardar Curso'});
                        if(!cursoGuardado) return res.status(400).send({ mensaje: 'Error al guardar el curso'});

                        Asignacion.updateMany({ idCurso: cursoId }, { idCurso: cursoGuardado._id }, 
                            (err, asignacionesEditadas) => {
                                if(err) return res.status(400)
                                    .send({ mensaje: 'Error en la peticion de actualizar asignaciones'});
                                
                                Curso.findByIdAndDelete(cursoId, (err, cursoEliminado)=>{
                                    if(err) return res.status(400).send({ mensaje: "Error en la peticion de eliminar curso"});
                                    if(!cursoEliminado) return res.status(400).send({ mensaje: 'Error al eliminar el curso'});

                                    return res.status(200).send({ 
                                        editado: asignacionesEditadas,
                                        eliminado: cursoEliminado
                                    })
                                })
                            })
                    })

                } else {

                    Asignacion.updateMany({ idCurso: cursoId }, { idCurso: cursoEncontrado._id }, 
                        (err, asignacionesActualizadas) => {
                            if(err) return res.status(400).send({ mensaje:"Error en la peticion de actualizar asignaciones"});

                            Curso.findByIdAndDelete(cursoId, (err, cursoEliminado)=>{
                                if(err) return res.status(400).send({ mensaje: "Error en la peticion de eliminar curso"});
                                if(!cursoEliminado) return res.status(400).send({ mensaje: "Error al eliminar el curso"});

                                return res.status(200).send({ 
                                    editado: asignacionesActualizadas,
                                    eliminado: cursoEliminado
                                })
                            })
                        })

                }
            })
        }
    })


}

module.exports = {
    agregarCurso,
    asignarCurso,
    eliminarCursoADefault
}