const jwt = require('jsonwebtoken')

const SEGREDO = 'chatsecreto123'

function verificarToken(req, res, next) {
  const token = req.headers['authorization']

  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido!' })
  }

  try {
    const decoded = jwt.verify(token, SEGREDO)
    req.usuario = decoded
    next()
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido!' })
  }
}

module.exports = verificarToken
