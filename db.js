const mongoose = require('mongoose')

async function conectar() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ MongoDB conectado!')
  } catch (erro) {
    console.log('❌ Erro ao conectar MongoDB:', erro.message)
    process.exit(1)
  }
}

module.exports = conectar
