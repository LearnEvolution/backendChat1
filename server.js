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
      online: Object.values(usuariosOnline).some(o => o.id === String(u._i
