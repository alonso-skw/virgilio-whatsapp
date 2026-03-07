const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const agentePath = '/Users/estudiozero/Documents/Claude Code';
let sistemaPrompt = '';
try {
  const archivos = fs.readdirSync(agentePath).filter(f => f.endsWith('.md'));
  archivos.forEach(archivo => {
    sistemaPrompt += fs.readFileSync(path.join(agentePath, archivo), 'utf8') + '\n\n';
  });
  console.log('Archivos del agente cargados:', archivos);
} catch (e) {
  console.error('Error cargando archivos:', e);
}

app.post('/mensaje', async (req, res) => {
  res.setHeader('ngrok-skip-browser-warning', 'true');
  const { mensaje } = req.body;
  if (!mensaje) return res.status(400).json({ error: 'Sin mensaje' });

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      system: sistemaPrompt,
      messages: [{ role: 'user', content: mensaje }]
    });
    res.json({ respuesta: response.content[0].text });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.listen(3000, () => console.log('Servidor Virgilio corriendo en puerto 3000'));
