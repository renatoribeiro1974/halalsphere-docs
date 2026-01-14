const axios = require('axios');

const API_URL = 'http://localhost:3333/api';

async function testAutoAssign() {
  console.log('=== TESTE DE AUTO-ATRIBUIÇÃO ===\n');

  try {
    // 1. Login como analista
    console.log('1️⃣ Fazendo login como analista...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'analista@halalsphere.com',
      password: 'senha123',
    });

    const token = loginResponse.data.data.token;
    const analyst = loginResponse.data.data.user;

    if (!analyst) {
      console.log('❌ Erro: Usuário não encontrado no response');
      return;
    }

    console.log(`✅ Login bem-sucedido! Analista: ${analyst.name} (${analyst.id})\n`);

    // 2. Buscar processos pendentes
    console.log('2️⃣ Buscando processos...');
    const processesResponse = await axios.get(`${API_URL}/processes`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log(`📋 Total de processos: ${processesResponse.data.data.length}\n`);

    // Encontrar processo pendente não atribuído
    const pendingProcess = processesResponse.data.data.find(
      p => p.status === 'pendente' && !p.assignedAnalystId
    );

    if (!pendingProcess) {
      console.log('⚠️  Nenhum processo pendente não atribuído encontrado');
      console.log('Criando um processo de teste...\n');

      // Login como empresa
      const companyLogin = await axios.post(`${API_URL}/auth/login`, {
        email: 'empresa@halalsphere.com',
        password: 'senha123',
      });

      // Verificar se já existe processo em rascunho
      const companyProcesses = await axios.get(`${API_URL}/processes`, {
        headers: { Authorization: `Bearer ${companyLogin.data.token}` },
      });

      const draftProcess = companyProcesses.data.data.find(p => p.status === 'rascunho');

      if (draftProcess) {
        console.log(`✅ Encontrado processo em rascunho: ${draftProcess.protocol}`);
        console.log('Submetendo o wizard...\n');

        await axios.post(`${API_URL}/processes/${draftProcess.id}/submit`, {}, {
          headers: { Authorization: `Bearer ${companyLogin.data.token}` },
        });

        console.log(`✅ Processo ${draftProcess.protocol} submetido! Status: pendente\n`);
      }
    }

    // 3. Buscar novamente para pegar o processo pendente
    const updatedProcesses = await axios.get(`${API_URL}/processes`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const targetProcess = updatedProcesses.data.data.find(
      p => p.status === 'pendente' && !p.assignedAnalystId
    );

    if (!targetProcess) {
      console.log('❌ Nenhum processo pendente disponível para teste');
      return;
    }

    console.log(`3️⃣ Processo alvo encontrado:`);
    console.log(`   Protocol: ${targetProcess.protocol}`);
    console.log(`   Status: ${targetProcess.status}`);
    console.log(`   Fase: ${targetProcess.currentPhase}`);
    console.log(`   Analista atribuído: ${targetProcess.assignedAnalystId || 'NENHUM'}\n`);

    // 4. Analista visualiza o processo (deve auto-atribuir)
    console.log('4️⃣ Analista visualizando o processo (deve auto-atribuir)...');
    const viewResponse = await axios.get(`${API_URL}/processes/${targetProcess.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const viewedProcess = viewResponse.data.data;
    console.log(`\n📊 RESULTADO:`);
    console.log(`   Protocol: ${viewedProcess.protocol}`);
    console.log(`   Status: ${viewedProcess.status}`);
    console.log(`   Fase: ${viewedProcess.currentPhase}`);
    console.log(`   Analista atribuído: ${viewedProcess.assignedAnalystName || 'NENHUM'} (${viewedProcess.assignedAnalystId || 'NENHUM'})`);

    if (viewedProcess.assignedAnalystId === analyst.id) {
      console.log(`\n✅ AUTO-ATRIBUIÇÃO FUNCIONOU!`);
      console.log(`   O analista ${analyst.name} foi automaticamente atribuído ao processo.`);

      if (viewedProcess.currentPhase === 'analise_documental') {
        console.log(`   ✅ Fase avançou para: analise_documental`);
      } else {
        console.log(`   ⚠️  Fase: ${viewedProcess.currentPhase} (esperado: analise_documental)`);
      }
    } else {
      console.log(`\n❌ AUTO-ATRIBUIÇÃO FALHOU!`);
      console.log(`   Esperado: ${analyst.id}`);
      console.log(`   Recebido: ${viewedProcess.assignedAnalystId || 'NENHUM'}`);
    }

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

testAutoAssign();
