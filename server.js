const express = require('express');
const mysql = require('mysql2');
require('dotenv').config(); // Se você estiver usando variáveis de ambiente, mas não é necessário nesse caso

const app = express();
const PORT = process.env.PORT || 5000;
const cors = require('cors');
app.use(cors());

// Middleware para analisar o corpo das requisições como JSON
app.use(express.json());

// Substitua a string de conexão
const connection = mysql.createConnection({
    host: 'autorack.proxy.rlwy.net',
    user: 'root',
    password: 'tjOcKrgBKnIbvCxOIAJALfXCWndzJQLE',
    database: 'railway',
    port: 15828,  // Usando a porta fornecida
    // protocol: 'TCP',  // O protocolo TCP é o padrão, pode ser omitido
});

// Conectar ao banco de dados
connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conectado ao banco de dados MySQL!');
});

// Endpoint para buscar todos os produtos
app.get('/products', (req, res) => {
    console.log('Requisição recebida em /products');
    connection.query('SELECT * FROM product', (err, results) => {
        if (err) {
            console.error('Erro ao buscar produtos:', err);
            return res.status(500).json({ error: 'Erro ao buscar produtos' });
        }
        res.json(results);
    });
});

// Criar um novo produto
app.post('/products', (req, res) => {
    const { name, price, description } = req.body;

    // Logando os dados recebidos
    console.log('Dados recebidos para criação do produto:', { name, price, description });

    // Verifica se req.body está vazio
    if (!req.body) {
        console.error('O corpo da requisição está indefinido ou vazio.');
        return res.status(400).json({ error: 'O corpo da requisição está faltando' });
    }

    // Verifica se campos obrigatórios estão faltando
    if (!name || !price || !description) {
        console.error('Campos faltando:', { name, price, description });
        return res.status(400).json({ error: 'Por favor, forneça name, price e description' });
    }

    const query = 'INSERT INTO product (name, price, description) VALUES (?, ?, ?)';
    connection.query(query, [name, price, description], (err, results) => {
        if (err) {
            // Log detalhado do erro
            console.error('Erro ao criar produto:', {
                error: err.message,            // Mensagem do erro
                sql: query,                    // Consulta SQL
                parameters: [name, price, description], // Parâmetros da consulta
                statusCode: 500,               // Código de status
            });
            return res.status(500).json({ error: 'Erro ao criar produto' });
        }
        res.status(201).json({ id: results.insertId, name, price, description });
    });
});

// Atualizar um produto existente
app.put('/products/:id', (req, res) => {
    const { id } = req.params;
    const { name, price, description } = req.body;

    // Logando os dados recebidos
    console.log('Dados recebidos para atualização do produto:', { id, name, price, description });

    // Verifica se req.body está vazio
    if (!req.body) {
        console.error('O corpo da requisição está indefinido ou vazio.');
        return res.status(400).json({ error: 'O corpo da requisição está faltando' });
    }

    // Verifica se campos obrigatórios estão faltando
    if (!name || !price || !description) {
        console.error('Campos faltando:', { name, price, description });
        return res.status(400).json({ error: 'Por favor, forneça name, price e description' });
    }

    connection.query('UPDATE product SET name = ?, price = ?, description = ? WHERE id = ?', [name, price, description, id], (err, results) => {
        if (err) {
            console.error('Erro ao atualizar produto:', err);
            return res.status(500).json({ error: 'Erro ao atualizar produto' });
        }
        res.json({ id, name, price, description });
    });
});

// Excluir um produto
app.delete('/products/:id', (req, res) => {
    const { id } = req.params;
    connection.query('DELETE FROM product WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Erro ao excluir produto:', err);
            return res.status(500).json({ error: 'Erro ao excluir produto' });
        }
        res.status(204).send(); // No content
    });
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

// Não se esqueça de fechar a conexão quando terminar
// Pode-se fechar a conexão quando o servidor for encerrado
process.on('SIGINT', () => {
    connection.end((err) => {
        if (err) {
            console.error('Erro ao fechar a conexão:', err);
        } else {
            console.log('Conexão ao banco de dados fechada.');
        }
        process.exit(0);
    });
});
