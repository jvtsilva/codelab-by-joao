const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

const SUPABASE_URL = 'https://acnbnvigexcvulfyngn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_i6BG4_xfle5uIF_qrTjGgw_BkTb_qoW';

app.get('/', (req, res) => {
    res.json({ mensagem: 'API CodeLab online!' });
});

app.post('/api/cadastro', async (req, res) => {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
        return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
    }

    try {
        const response = await fetch(SUPABASE_URL + '/auth/v1/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
            },
            body: JSON.stringify({
                email: email,
                password: senha
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(400).json({ 
                erro: data.msg || data.error_description || data.message || 'Erro ao cadastrar no Supabase' 
            });
        }

        // Insere na tabela progresso se houver usuário criado
        const userId = data.user?.id;
        if (userId) {
            await fetch(SUPABASE_URL + '/rest/v1/progresso', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    user_id: userId,
                    email: email,
                    fase_atual: 1,
                    pontos: 0
                })
            }).catch(() => {}); // Ignora erro secundário de progresso se já existir
        }

        return res.json({ sucesso: true, usuario: data.user });

    } catch (err) {
        return res.status(500).json({ erro: 'Falha de conexão com o Supabase: ' + err.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});