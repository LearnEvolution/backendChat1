require('dotenv').config()
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const conectar = require('./db')

const app = express()
const servidor = http.createServer(app)

const FRONTEND_URL = process.env.FRONTEND_URL || '*'

const io = new Server(servidor, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true
  }
})

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}))
app.use(express.json())

// Rotas
const authRoutes = require('./routes/auth')
app.use('/auth', authRoutes)

// Rota principal
app.get('/', (req, res) => {
  res.json({
    mensagem: '💬 BackendChat1 funcionando!',
    autor: 'Cleber Almeida',
    rotas: {
      register: 'POST /auth/register',
      login: 'POST /auth/login',
      usuarios: 'GET /auth/usuarios'
    }
  })
})

// Usuários conectados
const usuariosOnline = {}

io.on('connection', (socket) => {
  console.log('🟢 Alguém conectou:', socket.id)

  socket.on('entrar', async (dados) => {
    const Usuario = require('./models/Usuario')
    usuariosOnline[socket.id] = {
      id: dados.id,
      nome: dados.nome,
      socketId: socket.id
    }
    await Usuario.findByIdAndUpdate(dados.id, { online: true })
    console.log('👤 Entrou:', dados.nome)

    const todosUsuarios = await Usuario.find({}, { senha: 0 })
    const listaCompleta = todosUsuarios.map(u => ({
      id: String(u._id),
      nome: u.nome,
      online: Object.values(usuariosOnline).some(o => o.id === String(u._id))
    }))

    io.emit('usuariosOnline', listaCompleta)
  })

  socket.on('mensagemGrupo', async (dados) => {
    console.log('💬 Mensagem grupo:', dados)
    const Mensagem = require('./models/Mensagem')

    const hora = new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })

    await Mensagem.create({
      remetente: dados.remetente,
      remetenteId: dados.remetenteId,
      texto: dados.texto,
      tipo: 'grupo'
    })

    io.emit('novaMensagem', {
      tipo: 'grupo',
      remetente: dados.remetente,
      remetenteId: dados.remetenteId,
      texto: dados.texto,
      hora
    })
  })

  socket.on('mensagemPrivada', (dados) => {
    console.log('🔒 Mensagem privada:', dados)
    const destinatario = Object.values(usuariosOnline)
      .find(u => u.id === dados.destinatarioId)

    const mensagem = {
      tipo: 'privada',
      remetente: dados.remetente,
      remetenteId: dados.remetenteId,
      texto: dados.texto,
      hora: new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    if (destinatario) {
      io.to(destinatario.socketId).emit('novaMensagem', mensagem)
    }
    socket.emit('novaMensagem', mensagem)
  })

  socket.on('disconnect', async () => {
    const usuario = usuariosOnline[socket.id]
    if (usuario) {
      const Usuario = require('./models/Usuario')
      console.log('🔴 Saiu:', usuario.nome)
      await Usuario.findByIdAndUpdate(usuario.id, { online: false })
      delete usuariosOnline[socket.id]

      const todosUsuarios = await Usuario.find({}, { senha: 0 })
      const listaCompleta = todosUsuarios.map(u => ({
        id: String(u._id),
        nome: u.nome,
        online: Object.values(usuariosOnline).some(o => o.id === String(u._id))
      }))

      io.emit('usuariosOnline', listaCompleta)
    }
  })
})

const PORT = process.env.PORT || 3000

conectar().then(() => {
  servidor.listen(PORT, () => {
    console.log(`💬 BackendChat1 rodando na porta ${PORT}!`)
  })
})
