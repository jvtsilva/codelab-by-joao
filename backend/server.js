const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

const SUPABASE_URL = 'https://acnbnvigexcvulfyngn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_i6BG4_xfle5uIF_qrTjGgw_BkTb_qoW';

// Inicializa o cliente oficial do Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

app.get('/', (req, res) => {
    res.json({ mensagem: 'API CodeLab online com SDK oficial!' });
});

app.post('/api/cadastro', async (req, res) => {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
        return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
    }

    try {
        // 1. Cadastro usando o SDK oficial do Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: senha
        });

        if (error) {
            return res.status(400).json({ erro: error.message });
        }

        const userId = data.user?.id;

        // 2. Insere na tabela progresso se o usuário foi criado com sucesso
        if (userId) {
            await supabase.from('progresso').insert([
                {
                    user_id: userId,
                    email: email,
                    fase_atual: 1,
                    pontos: 0
                }
            ]).catch(() => {}); // Ignora se já houver registro
        }

        return res.json({ sucesso: true, usuario: data.user });

    } catch (err) {
        return res.status(500).json({ erro: 'Erro interno no servidor: ' + err.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});