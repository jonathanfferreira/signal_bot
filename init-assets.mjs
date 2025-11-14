import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/api/trpc';

async function initializeAssets() {
  try {
    console.log('Inicializando ativos padrão...');
    
    const response = await fetch(`${API_URL}/assets.initializeDefaults`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Ativos inicializados com sucesso:', data);
  } catch (error) {
    console.error('Erro ao inicializar ativos:', error);
  }
}

initializeAssets();
