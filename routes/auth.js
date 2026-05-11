const express = require('express')
const router = express.Router()
const controller = require('../controllers/authController')
const verificarToken = require('../middleware/verificarToken')

router.post('/register', controller.register)
router.post('/login', controller.login)
router.get('/usuarios', verificarToken, controller.listarUsuarios)

module.exports = router
