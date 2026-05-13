const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

function gerarCodigo() {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

// Códigos temporários em memória
const codigos = {}

async function enviarCodigo(req, res) {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ erro: 'Email obrigatório!' })
  }

  const codigo = gerarCodigo()
  codigos[email] = {
    codigo,
    expira: Date.now() + 10 * 60 * 1000 // 10 minutos
  }

  try {
    await transporter.sendMail({
      from: `"ChatZap" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Seu código de verificação — ChatZap',
      html: `
        <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:32px;background:#0a0f1e;border-radius:16px;border:1px solid #1a2540;">
          <h1 style="color:#00d4ff;font-size:24px;margin-bottom:8px;">💬 ChatZap</h1>
          <p style="color:#94a3b8;margin-bottom:24px;">Seu código de verificação:</p>
          <div style="background:#050810;border:2px solid #00d4ff;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
            <span style="font-size:42px;font-weight:900;color:#00d4ff;letter-spacing:8px;">${codigo}</span>
          </div>
          <p style="color:#64748b;font-size:13px;">Este código expira em 10 minutos.</p>
          <p style="color:#64748b;font-size:13px;">Se não foi você, ignore este email.</p>
        </div>
      `
    })

    res.json({ mensagem: 'Código enviado!' })
  } catch (erro) {
    console.log('Erro ao enviar email:', erro.message)
    res.status(500).json({ erro: 'Erro ao enviar email!' })
  }
}

function verificarCodigo(req, res) {
  const { email, codigo } = req.body

  if (!email || !codigo) {
    return res.status(400).json({ erro: 'Email e código obrigatórios!' })
  }

  const dados = codigos[email]

  if (!dados) {
    return res.status(400).json({ erro: 'Código não encontrado!' })
  }

  if (Date.now() > dados.expira) {
    delete codigos[email]
    return res.status(400).json({ erro: 'Código expirado!' })
  }

  if (dados.codigo !== codigo) {
    return res.status(400).json({ erro: 'Código incorreto!' })
  }

  delete codigos[email]
  res.json({ mensagem: 'Email verificado!', verificado: true })
}

module.exports = { enviarCodigo, verificarCodigo }
