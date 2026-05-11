const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const Usuario = require('../models/Usuario')

const SEGREDO = process.env.JWT_SECRET || 'chatsecreto123'

async function register(req, res) {
  try {
    const { nome, email, senha } = req.body

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Preencha todos os campos!' })
    }

    const jaExiste = await Usuario.findOne({ email })
    if (jaExiste) {
      return res.status(400).json({ erro: 'Email já cadastrado!' })
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10)

    const usuario = await Usuario.create({
      nome,
      email,
      senha: senhaCriptografada
    })

    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' })

  } catch (erro) {
    res.status(500).json({ erro: 'Erro interno do servidor!' })
  }
}

async function login(req, res) {
  try {
    const { email, senha } = req.body

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Preencha todos os campos!' })
    }

    const usuario = await Usuario.findOne({ email })
    if (!usuario) {
      return res.status(400).json({ erro: 'Email ou senha incorretos!' })
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha)
    if (!senhaCorreta) {
      return res.status(400).json({ erro: 'Email ou senha incorretos!' })
    }

    await Usuario.findByIdAndUpdate(usuario._id, { online: true })

    const token = jwt.sign(
      { id: usuario._id, nome: usuario.nome, email: usuario.email },
      SEGREDO,
      { expiresIn: '24h' }
    )

    res.json({
      mensagem: 'Login realizado!',
      token,
      usuario: { id: usuario._id, nome: usuario.nome, email: usuario.email }
    })

  } catch (erro) {
    res.status(500).json({ erro: 'Erro interno do servidor!' })
  }
}

async function listarUsuarios(req, res) {
  try {
    const usuarios = await Usuario.find({}, { senha: 0 })
    res.json(usuarios)
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao listar usuários!' })
  }
}

module.exports = { register, login, listarUsuarios }
