// API pública/documentada para precificação
// Exemplo básico usando Express.js
// npm install express

import express from 'express';
import { calcularPrecificacaoAvancada } from './precificacao.avancada';

const app = express();
app.use(express.json());

app.post('/api/precificacao', (req, res) => {
  try {
    const resultado = calcularPrecificacaoAvancada(req.body);
    res.json(resultado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(3001, () => {
  console.log('API de precificação rodando na porta 3001');
});

// Documentação OpenAPI pode ser gerada para facilitar integração.
