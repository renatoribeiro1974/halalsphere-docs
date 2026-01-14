const axios = require('axios');

const API_URL = 'http://localhost:3333/api';

async function testAutoAssign() {
  console.log('=== TESTE FINAL DE AUTO-ATRIBUIÇÃO ===\n');

  try {
    // 1. Login como analista
    console.log('1️⃣ Login como analista...');
    const analystLogin = await axios.post(`${API_URL}/auth/login`, {
      email: 'analista@halalsphere.com',
      password: 'senha123',
    });
    const analystToken = analystLogin.data.data.token;
    const analyst = analystLogin.data.data.user;
    console.log(`✅ Login bem-sucedido: ${analyst.name}\n`);

    // 2. Buscar processos pendentes não atribuídos
    console.log('2️⃣ Buscando processos pendentes não atribuídos...');
    const processesResponse = await axios.get(`${API_URL}/processes`, {
      headers: { Authorization: `Bearer ${analystToken}` },
    });

    const pendingProcesses = processesResponse.data.data.filter(
      p => p.status === 'pendente' && !p.assignedAnalystId
    );

    if (pendingProcesses.length === 0) {
      console.log('❌ Nenhum processo pendente não atribuído encontrado');
      return;
    }

    const targetProcess = pendingProcesses[0];
    console.log(`✅ Processo encontrado: ${targetProcess.protocol}`);
    console.log(`   Status: ${targetProcess.status}`);
    console.log(`   Fase: ${targetProcess.currentPhase}`);
    console.log(`   Analista: ${targetProcess.assignedAnalystId || 'NENHUM'}\n`);

    // 3. Analista visualiza o processo (deve auto-atribuir)
    console.log('3️⃣ Analista visualizando processo (TESTE DE AUTO-ATRIBUIÇÃO)...');
    const viewResponse = await axios.get(
      `${API_URL}/processes/${targetProcess.id}`,
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

    // 4. Validar resultados
    let allPassed = true;
    const tests = [];

    // Test 1: Auto-assignment
    if (viewedProcess.assignedAnalystId === analyst.id) {
      tests.push({ name: 'AUTO-ATRIBUIÇÃO', status: '✅ OK', detail: `Processo atribuído a ${analyst.name}` });
    } else {
      tests.push({ name: 'AUTO-ATRIBUIÇÃO', status: '❌ FALHOU', detail: `Esperado: ${analyst.id}, Recebido: ${viewedProcess.assignedAnalystId || 'NENHUM'}` });
      allPassed = false;
    }

    // Test 2: Phase advancement
    if (viewedProcess.currentPhase === 'analise_documental') {
      tests.push({ name: 'AVANÇO DE FASE', status: '✅ OK', detail: 'Fase avançada para: analise_documental' });
    } else {
      tests.push({ name: 'AVANÇO DE FASE', status: '❌ FALHOU', detail: `Esperado: analise_documental, Recebido: ${viewedProcess.currentPhase}` });
      allPassed = false;
    }

    // Test 3: Status update
    if (viewedProcess.status === 'em_andamento') {
      tests.push({ name: 'ATUALIZAÇÃO DE STATUS', status: '✅ OK', detail: 'Status alterado para: em_andamento' });
    } else {
      tests.push({ name: 'ATUALIZAÇÃO DE STATUS', status: '❌ FALHOU', detail: `Esperado: em_andamento, Recebido: ${viewedProcess.status}` });
      allPassed = false;
    }

    // Display results
    console.log('RESULTADOS DOS TESTES:');
    console.log('─'.repeat(50));
    tests.forEach(test => {
      console.log(`${test.status} ${test.name}`);
      console.log(`   ${test.detail}`);
    });
    console.log('─'.repeat(50));

    console.log('\n' + '═'.repeat(50));
    if (allPassed) {
      console.log('🎉 TODOS OS TESTES PASSARAM!');
      console.log('\nA funcionalidade de auto-atribuição está funcionando corretamente:');
      console.log('  ✅ Analista é automaticamente atribuído ao visualizar processo');
      console.log('  ✅ Fase avança de cadastro_solicitacao → analise_documental');
      console.log('  ✅ Status muda de pendente → em_andamento');
    } else {
      console.log('⚠️  ALGUNS TESTES FALHARAM');
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
