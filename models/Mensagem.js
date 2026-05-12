const mongoose = require('mongoose')

const mensagemSchema = new mongoose.Schema({
  remetente: {
    type: String,
    required: true
  },
  remetenteId: {
    type: String,
    required: true
  },
  texto: {
    type: String,
    required: true
  },
  tipo: {
    type: String,
    enum: ['grupo', 'privada'],
    default: 'grupo'
  },
  destinatarioId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Mensagem', mensagemSchema)
