
exports.verMaestro = function(req, res, next) {
    if(req.user.rol !== "ROL_MAESTRO") return res.status(403).send({mensaje: "Solo puede acceder el Maestro"})
    
    next();
}

exports.verAlumno = function(req, res, next) {
    if(req.user.rol !== "ROL_ALUMNO") return res.status(403).send({mensaje: "Solo puede acceder el Alumno"})
    
    next();
}