/**
 * Script de teste para validar o fluxo completo de aceite de proposta
 *
 * Testa:
 * 1. Criação de proposta
 * 2. Envio da proposta
 * 3. Aceite pela empresa
 * 4. Verificação de atualização de status do processo
 * 5. Verificação do campo responseNotes
 */

const API_URL = 'http://localhost:3333/api';

// Token do analista
const ANALYST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQ1OWU1OTc1LTMxYzUtNDJjZi05YzA4LWJiMmNjZWM1MjQ2MSIsImVtYWlsIjoiYW5hbGlzdGFAaGFsYWxzcGhlcmUuY29tIiwicm9sZSI6ImFuYWxpc3RhIiwiY29tcGFueUlkIjpudWxsLCJpYXQiOjE3NjM1MjUwMjUsImV4cCI6MTc2NDEyOTgyNX0.plfg0DZJDcPwQDqVMAwaaknZQ74-L1f34OKpYal1Ijo';

async function testProposalAcceptFlow() {
  console.log('🧪 Iniciando teste de aceite de proposta...\n');

  try {
    // 1. Buscar processos do analista
    console.log('📋 1. Buscando processos do analista...');
    const processesRes = await fetch(`${API_URL}/processes`, {
      headers: {
        'Authorization': `Bearer ${ANALYST_TOKEN}`,
      },
    });

    if (!processesRes.ok) {
      throw new Error(`Erro ao buscar processos: ${processesRes.status}`);
    }

    const processesData = await processesRes.json();
    const processes = processesData.data;

    console.log(`   ✅ Encontrados ${processes.length} processos`);

    // Encontrar um processo na fase de proposta comercial
    const processInProposal = processes.find(p =>
      p.currentPhase === 'proposta_comercial' || p.currentPhase === 'analise_documental'
    );

    if (!processInProposal) {
      console.log('   ⚠️  Nenhum processo encontrado em fase adequada para proposta');
      console.log('   💡 Crie um processo e avance para a fase de proposta comercial primeiro');
      return;
    }

    const processId = processInProposal.id;
    console.log(`   📌 Usando processo: ${processInProposal.protocol} (ID: ${processId})`);
    console.log(`   📍 Fase atual: ${processInProposal.currentPhase}\n`);

    // 2. Verificar se já existe proposta
    console.log('📋 2. Verificando proposta existente...');
    const existingProposalRes = await fetch(`${API_URL}/proposals/process/${processId}`, {
      headers: {
        'Authorization': `Bearer ${ANALYST_TOKEN}`,
      },
    });

    let proposalId;

    if (existingProposalRes.ok) {
      const existingProposal = await existingProposalRes.json();
      proposalId = existingProposal.data.id;
      console.log(`   ✅ Proposta existente encontrada (ID: ${proposalId})`);
      console.log(`   📊 Status: ${existingProposal.data.status}\n`);
    } else {
      // 3. Criar proposta
      console.log('📋 3. Criando nova proposta...');
      const createProposalRes = await fetch(`${API_URL}/proposals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ANALYST_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          processId: processId,
          calculationInputs: {
            certificationType: 'C1',
            requestType: 'nova',
            numProducts: 5,
            numShifts: 1,
            numSuppliers: 3,
            numEmployees: 20,
            distance: 100,
            requiresAccommodation: false,
          },
        }),
      });

      if (!createProposalRes.ok) {
        const errorData = await createProposalRes.json();
        throw new Error(`Erro ao criar proposta: ${errorData.error}`);
      }

      const createData = await createProposalRes.json();
      proposalId = createData.data.id;
      console.log(`   ✅ Proposta criada com sucesso (ID: ${proposalId})`);
      console.log(`   💰 Valor: R$ ${createData.data.finalValue}\n`);

      // 4. Enviar proposta
      console.log('📋 4. Enviando proposta para empresa...');
      const sendRes = await fetch(`${API_URL}/proposals/${proposalId}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ANALYST_TOKEN}`,
        },
      });

      if (!sendRes.ok) {
        const errorData = await sendRes.json();
        throw new Error(`Erro ao enviar proposta: ${errorData.error}`);
      }

      console.log('   ✅ Proposta enviada com sucesso\n');
    }

    // 5. Aceitar proposta (simulando empresa)
    console.log('📋 5. Aceitando proposta (como empresa)...');
    const acceptRes = await fetch(`${API_URL}/proposals/${proposalId}/respond`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${ANALYST_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accepted: true,
        responseNotes: 'Proposta aprovada pela diretoria. Estamos ansiosos para iniciar o processo de certificação.',
      }),
    });

    if (!acceptRes.ok) {
      const errorData = await acceptRes.json();
      throw new Error(`Erro ao aceitar proposta: ${errorData.error}`);
    }

    const acceptData = await acceptRes.json();
    console.log('   ✅ Proposta aceita com sucesso');
    console.log(`   📊 Novo status da proposta: ${acceptData.data.status}`);
    console.log(`   📝 Observações: ${acceptData.data.responseNotes}\n`);

    // 6. Verificar atualização do processo
    console.log('📋 6. Verificando atualização do processo...');
    const processRes = await fetch(`${API_URL}/processes/${processId}`, {
      headers: {
        'Authorization': `Bearer ${ANALYST_TOKEN}`,
      },
    });

    if (!processRes.ok) {
      throw new Error(`Erro ao buscar processo: ${processRes.status}`);
    }

    const processData = await processRes.json();
    const updatedProcess = processData.data;

    console.log(`   📍 Fase atual do processo: ${updatedProcess.currentPhase}`);
    console.log(`   📊 Status do processo: ${updatedProcess.status}`);

    if (updatedProcess.currentPhase === 'contrato') {
      console.log('   ✅ Processo avançou para fase de CONTRATO corretamente!\n');
    } else {
      console.log(`   ⚠️  ATENÇÃO: Processo deveria estar na fase "contrato" mas está em "${updatedProcess.currentPhase}"\n`);
    }

    // 7. Verificar proposta novamente
    console.log('📋 7. Verificando dados finais da proposta...');
    const finalProposalRes = await fetch(`${API_URL}/proposals/${proposalId}`, {
      headers: {
        'Authorization': `Bearer ${ANALYST_TOKEN}`,
      },
    });

    if (!finalProposalRes.ok) {
      throw new Error(`Erro ao buscar proposta: ${finalProposalRes.status}`);
    }

    const finalProposalData = await finalProposalRes.json();
    const finalProposal = finalProposalData.data;

    console.log(`   📊 Status: ${finalProposal.status}`);
    console.log(`   📅 Respondida em: ${finalProposal.respondedAt ? new Date(finalProposal.respondedAt).toLocaleString('pt-BR') : 'N/A'}`);
    console.log(`   📝 Observações: ${finalProposal.responseNotes || 'Nenhuma'}\n`);

    // Resumo final
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ TESTE CONCLUÍDO COM SUCESSO!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📌 Processo: ${updatedProcess.protocol}`);
    console.log(`📍 Fase: ${updatedProcess.currentPhase}`);
    console.log(`💰 Proposta ID: ${proposalId}`);
    console.log(`📊 Status da proposta: ${finalProposal.status}`);
    console.log(`📝 Observações salvas: ${finalProposal.responseNotes ? 'SIM ✅' : 'NÃO ❌'}`);
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Executar teste
testProposalAcceptFlow();
