const axios = require('axios');

const API_URL = 'http://localhost:3333/api';

async function submitWizard() {
  try {
    // Login como empresa
    console.log('Login empresa...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'empresa@halalsphere.com',
      password: 'senha123',
    });

    const token = loginResponse.data.data.token;
    console.log('Token obtido!');

    // Buscar processo
    const processesResponse = await axios.get(`${API_URL}/processes`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const process = processesResponse.data.data[0];
    console.log(`Processo: ${process.protocol} - Status: ${process.status}`);

    if (process.status === 'rascunho') {
      console.log('Submetendo wizard...');
      const submitResponse = await axios.post(
        `${API_URL}/processes/${process.id}/submit`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('✅ Wizard submetido!');
      console.log(`Status: ${submitResponse.data.data.status}`);
      console.log(`Fase: ${submitResponse.data.data.currentPhase}`);
    } else {
      console.log(`Processo já está ${process.status}`);
    }
  } catch (error) {
    console.error('Erro:', error.response?.data || error.message);
  }
}

submitWizard();
