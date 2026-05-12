const express = require('express')
const router = express.Router()
const controller = require('../controllers/authController')
const verificarToken = require('../middleware/verificarToken')
const Mensagem = require('../models/Mensagem')

router.post('/register', controller.register)
router.post('/login', controller.login)
router.get('/usuarios', verificarToken, controller.listarUsuarios)

// Histórico de mensagens
router.get('/mensagens', verificarToken, async (req, res) => {
  try {
    const mensagens = await Mensagem.find({ tipo: 'grupo' })
      .sort({ createdAt: 1 })
      .limit(50)

    const formatadas = mensagens.map(m => ({
      remetente: m.remetente,
      remetenteId: m.remetenteId,
      texto: m.texto,
      tipo: m.tipo,
      hora: new Date(m.createdAt).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }))

    res.json(formatadas)
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar mensagens!' })
  }
})

module.exports = router
