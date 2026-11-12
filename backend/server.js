const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// Puxa das variáveis de ambiente do Render (ou usa fallback se necessário)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://acnbnvigexcvulfyngn.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_i6BG4_xfle5uIF_qrTjGgw_BkTb_qoW'; 

// Rota de teste
app.get('/', (req, res) => {
    res.json({ mensagem: 'API do CodeLab by João rodando na nuvem com sucesso!' });
});

// Rota de Cadastro
app.post('/api/cadastro', async (req, res) => {
    const { email, senha } = req.body;
    try {
        const respostaSupabase = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify({ email, password: senha })
        });

        const resultado = await respostaSupabase.json();

        if (!respostaSupabase.ok) {
            return res.status(400).json({ erro: resultado.msg || resultado.error_description || 'Erro no cadastro' });
        }

        res.json({ sucesso: true, usuario: resultado.user });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// Rota de Login
app.post('/api/login', async (req, res) => {
    const { email, senha } = req.body;
    try {
        const respostaSupabase = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify({ email, password: senha })
        });

        const resultado = await respostaSupabase.json();

        if (!respostaSupabase.ok) {
            return res.status(400).json({ erro: resultado.error_description || resultado.msg || 'Erro no login' });
        }

        res.json({ sucesso: true, session: resultado, user: resultado.user });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});