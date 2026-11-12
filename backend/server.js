const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// Credenciais fixas e garantidas para evitar qualquer falha de ambiente
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://acnbnvigexcvulfyngn.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_i6BG4_xfle5uIF_qrTjGgw_BkTb_qoW';

// Rota de teste
app.get('/', (req, res) => {
    res.json({ mensagem: 'API do CodeLab rodando com sucesso!' });
});

// Rota de Cadastro Otimizada com inserção na tabela progresso
app.post('/api/cadastro', async (req, res) => {
    const { email, senha } = req.body;
    
    try {
        // 1. Cadastra o usuário no Supabase Auth
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

        const userId = resultado.user?.id;

        // 2. Insere o registro inicial na tabela 'progresso' para evitar erros futuros
        if (userId) {
            await fetch(`${SUPABASE_URL}/rest/v1/progresso`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    user_id: userId,
                    email: email,
                    fase_atual: 1,
                    pontos: 0
                })
            });
        }

        res.json({ sucesso: true, usuario: resultado.user });
    } catch (err) {
        res.status(500).json({ erro: 'Erro interno no servidor: ' + err.message });
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
        res.status(500).json({ erro: 'Erro interno no login: ' + err.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});