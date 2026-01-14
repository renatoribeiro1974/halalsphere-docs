const axios = require('axios');

const API_URL = 'http://localhost:3333/api';

async function testAutoAssign() {
  console.log('=== TESTE COMPLETO DE AUTO-ATRIBUIÇÃO ===\n');

  try {
    // 1. Login como empresa para submeter processo
    console.log('1️⃣ Login como empresa...');
    const companyLogin = await axios.post(`${API_URL}/auth/login`, {
      email: 'empresa@teste.com',
      password: 'senha123',
    });
    const companyToken = companyLogin.data.data.token;
    console.log(`✅ Login empresa bem-sucedido!\n`);

    // 2. Buscar processos em rascunho
    console.log('2️⃣ Buscando processos em rascunho...');
    const companyProcesses = await axios.get(`${API_URL}/processes`, {
      headers: { Authorization: `Bearer ${companyToken}` },
    });

    let draftProcess = companyProcesses.data.data.find(p => p.status === 'rascunho');

    if (!draftProcess) {
      console.log('⚠️  Nenhum processo em rascunho encontrado. Criando um novo...');

      // Criar novo processo
      const createResponse = await axios.post(`${API_URL}/processes`, {
        companyName: 'Empresa Teste Auto-Assign',
        cnpj: '12345678000199',
        requestType: 'inicial',
        certificationType: 'produto',
      }, {
        headers: { Authorization: `Bearer ${companyToken}` },
      });

      draftProcess = createResponse.data.data;
      console.log(`✅ Processo criado: ${draftProcess.protocol}\n`);
    } else {
      console.log(`✅ Processo em rascunho encontrado: ${draftProcess.protocol}\n`);
    }

    // 3. Submeter o processo (deve mudar para 'pendente')
    console.log('3️⃣ Submetendo processo...');
    const submitResponse = await axios.post(
      `${API_URL}/processes/${draftProcess.id}/submit`,
      {},
      { headers: { Authorization: `Bearer ${companyToken}` } }
    );

    const submittedProcess = submitResponse.data.data;
    console.log(`✅ Processo submetido!`);
    console.log(`   Protocol: ${submittedProcess.protocol}`);
    console.log(`   Status: ${submittedProcess.status}`);
    console.log(`   Fase: ${submittedProcess.currentPhase}`);
    console.log(`   Analista: ${submittedProcess.assignedAnalystId || 'NENHUM'}\n`);

    // 4. Login como analista
    console.log('4️⃣ Login como analista...');
    const analystLogin = await axios.post(`${API_URL}/auth/login`, {
      email: 'analista@halalsphere.com',
      password: 'senha123',
    });
    const analystToken = analystLogin.data.data.token;
    const analyst = analystLogin.data.data.user;
    console.log(`✅ Login analista bem-sucedido: ${analyst.name}\n`);

    // 5. Analista visualiza o processo (deve auto-atribuir)
    console.log('5️⃣ Analista visualizando processo (TESTE DE AUTO-ATRIBUIÇÃO)...');
    const viewResponse = await axios.get(
      `${API_URL}/processes/${submittedProcess.id}`,
      { headers: { Authorization: `Bearer ${analystToken}` } }
    );

    const viewedProcess = viewResponse.data.data;

    console.log('\n📊 RESULTADO DA AUTO-ATRIBUIÇÃO:');
    console.log('════════════════════════════════════════');
    console.log(`Protocol: ${viewedProcess.protocol}`);
    console.log(`Status: ${viewedProcess.status}`);
    console.log(`Fase atual: ${viewedProcess.currentPhase}`);
    console.log(`Analista atribuído: ${viewedProcess.assignedAnalystName || 'NENHUM'}`);
    console.log(`Analista ID: ${viewedProcess.assignedAnalystId || 'NENHUM'}`);
    console.log('════════════════════════════════════════\n');

    // 6. Validar resultados
    let success = true;

    if (viewedProcess.assignedAnalystId === analyst.id) {
      console.log('✅ AUTO-ATRIBUIÇÃO: OK');
      console.log(`   O processo foi automaticamente atribuído a ${analyst.name}`);
    } else {
      console.log('❌ AUTO-ATRIBUIÇÃO: FALHOU');
      console.log(`   Esperado: ${analyst.id}`);
      console.log(`   Recebido: ${viewedProcess.assignedAnalystId || 'NENHUM'}`);
      success = false;
    }

    if (viewedProcess.currentPhase === 'analise_documental') {
      console.log('✅ AVANÇO DE FASE: OK');
      console.log('   A fase foi avançada para: analise_documental');
    } else {
      console.log('❌ AVANÇO DE FASE: FALHOU');
      console.log(`   Esperado: analise_documental`);
      console.log(`   Recebido: ${viewedProcess.currentPhase}`);
      success = false;
    }

    if (viewedProcess.status === 'em_andamento') {
      console.log('✅ STATUS: OK');
      console.log('   O status foi alterado para: em_andamento');
    } else {
      console.log('⚠️  STATUS: DIFERENTE');
      console.log(`   Status atual: ${viewedProcess.status} (pode ser válido dependendo das regras)`);
    }

    console.log('\n' + '═'.repeat(50));
    if (success) {
      console.log('🎉 TESTE CONCLUÍDO COM SUCESSO!');
    } else {
      console.log('⚠️  TESTE CONCLUÍDO COM FALHAS');
    }
    console.log('═'.repeat(50));

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Detalhes:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testAutoAssign();
