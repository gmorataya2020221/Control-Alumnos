const express = require('express');
const controladorCurso = require('../controllers/curso.controller');

// MIDDLEWARES
const md_autenticacion = require('../middlewares/autenticacion');
const md_roles = require('../middlewares/roles');

const api = express.Router();

api.post('/agregarCurso', [md_autenticacion.Auth, md_roles.verMaestro], controladorCurso.agregarCurso);
api.post('/asignarCurso', [md_autenticacion.Auth, md_roles.verAlumno], controladorCurso.asignarCurso);
api.delete('/eliminarCurso/:idCurso', [md_autenticacion.Auth, md_roles.verMaestro], controladorCurso.eliminarCursoADefault);

module.exports = api;