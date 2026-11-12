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

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Rota de teste
app.get('/', (req, res) => {
    res.json({ mensagem: 'API do CodeLab rodando com sucesso!' });
});

// Rota de Cadastro com tratamento de erro detalhado
app.post('/api/cadastro', async (req, res) => {
    const { email, senha } = req.body;
    
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        return res.status(500).json({ erro: 'Variáveis do Supabase não configuradas no servidor!' });
    }

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
            return res.status(400).json({ erro: resultado.msg || resultado.error_description || JSON.stringify(resultado) });
        }

        res.json({ sucesso: true, usuario: resultado.user });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});