const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================
// 🔧 Funções auxiliares
// ============================

// Remove tudo que não for número (aceita "01001-000" ou "01001000")
function limparCep(cep) {
  return String(cep).replace(/\D/g, '');
}

// CEP válido = exatamente 8 dígitos
function validarCep(cep) {
  return /^[0-9]{8}$/.test(cep);
}

// ============================
// 📍 ENDPOINT CEP
// ============================
app.get('/cep/:cep', async (req, res) => {
  const cepLimpo = limparCep(req.params.cep);
  console.log('➡️  CEP recebido:', req.params.cep, '| limpo:', cepLimpo);

  // ❌ CEP mal formatado → 400
  if (!validarCep(cepLimpo)) {
    return res.status(400).json({
      erro: 'CEP mal formatado',
      detalhe: 'O CEP deve conter exatamente 8 dígitos numéricos'
    });
  }

  try {
    const url = `https://viacep.com.br/ws/${cepLimpo}/json/`;
    console.log('🌐 Chamando:', url);

    const response = await fetch(url);
    console.log('📡 Status ViaCEP:', response.status);

    if (!response.ok) {
      throw new Error(`Erro HTTP do ViaCEP: ${response.status}`);
    }

    const data = await response.json();

    // ❌ ViaCEP responde 200 + { erro: true } quando o CEP não existe → 404
    if (data.erro) {
      return res.status(404).json({ erro: 'CEP não encontrado' });
    }

    // ✅ CEP válido e encontrado → 200
    return res.status(200).json({
      cep: data.cep,
      logradouro: data.logradouro,
      bairro: data.bairro,
      cidade: data.localidade,
      estado: data.uf
    });

  } catch (err) {
    console.log('❌ ERRO CEP:', err.message);
    return res.status(500).json({
      erro: 'Erro ao consultar ViaCEP',
      detalhe: err.message
    });
  }
});

// ============================
// 🌤  ENDPOINT CLIMA
// ============================
app.get('/clima/:cidade', async (req, res) => {
  const cidade = req.params.cidade;
  console.log('➡️  Cidade recebida:', cidade);

  // ❌ Validação básica → 400
  if (!cidade || cidade.trim().length < 2) {
    return res.status(400).json({
      erro: 'Cidade inválida',
      detalhe: 'Informe uma cidade com pelo menos 2 caracteres'
    });
  }

  try {
    // encodeURIComponent protege contra acentos / espaços / caracteres especiais
    const url = `https://wttr.in/${encodeURIComponent(cidade)}?format=j1`;
    console.log('🌐 Chamando:', url);

    const response = await fetch(url);

    if (!response.ok) {
      // wttr.in responde 404 quando não conhece a cidade
      if (response.status === 404) {
        return res.status(404).json({ erro: 'Cidade não encontrada' });
      }
      throw new Error(`Erro HTTP do wttr.in: ${response.status}`);
    }

    const data = await response.json();

    // Acesso defensivo aos campos
    const atual = data?.current_condition?.[0];
    if (!atual) {
      return res.status(404).json({ erro: 'Dados de clima indisponíveis' });
    }

    return res.status(200).json({
      cidade: cidade,
      temperatura: `${atual.temp_C}°C`,
      sensacao: `${atual.FeelsLikeC}°C`,
      umidade: `${atual.humidity}%`,
      descricao: atual.weatherDesc?.[0]?.value ?? 'Sem descrição'
    });

  } catch (err) {
    console.log('❌ ERRO CLIMA:', err.message);
    return res.status(500).json({
      erro: 'Erro ao buscar clima',
      detalhe: err.message
    });
  }
});

// ============================
// 🏠 Rota raiz com mini-doc
// ============================
app.get('/', (req, res) => {
  res.json({
    mensagem: 'API de Consumo - ViaCEP + Clima',
    endpoints: {
      cep: 'GET /cep/:cep    (ex: /cep/01001000)',
      clima: 'GET /clima/:cidade (ex: /clima/Curitiba)'
    }
  });
});

// ============================
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
