/**
 * Script de Teste - Sprint 1
 * Testa as correções críticas implementadas
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, ...args) {
  console.log(colors[color], ...args, colors.reset);
}

// Helper para fazer requests
async function request(method, path, data = null, token = null) {
  try {
    const response = await axios({
      method,
      url: `${API_URL}${path}`,
      data,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      validateStatus: () => true, // Aceita qualquer status
    });

    return {
      success: response.status >= 200 && response.status < 300,
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: 0,
    };
  }
}

// ====================================================================
// TESTES
// ====================================================================

/**
 * Teste 1: Validação de Status Inválido
 */
async function test1_invalidStatus(processId, token) {
  log('cyan', '\n🧪 Teste 1: Validação de Status Inválido');
  log('blue', '   Objetivo: Backend deve rejeitar status "em_analise"');

  const result = await request(
    'PATCH',
    `/processes/${processId}/status`,
    {
      status: 'em_analise',
      notes: 'Testando status inválido',
    },
    token
  );

  if (!result.success && result.status === 400 && result.data.error?.includes('Status inválido')) {
    log('green', '   ✅ PASSOU: Status inválido rejeitado');
    log('yellow', `   📝 Mensagem: ${result.data.error.substring(0, 80)}...`);
    return true;
  } else {
    log('red', '   ❌ FALHOU: Status inválido foi aceito');
    log('red', `   Status: ${result.status}, Response:`, result.data);
    return false;
  }
}

/**
 * Teste 2: Status Válido Aceito
 */
async function test2_validStatus(processId, token) {
  log('cyan', '\n🧪 Teste 2: Status Válido Aceito');
  log('blue', '   Objetivo: Backend deve aceitar status "em_andamento"');

  const result = await request(
    'PATCH',
    `/processes/${processId}/status`,
    {
      status: 'em_andamento',
      notes: 'Testando status válido',
    },
    token
  );

  if (result.success && result.status === 200) {
    log('green', '   ✅ PASSOU: Status válido aceito');
    return true;
  } else {
    log('red', '   ❌ FALHOU: Status válido foi rejeitado');
    log('red', `   Status: ${result.status}, Response:`, result.data);
    return false;
  }
}

/**
 * Teste 3: Avanço de Fase - Sem Permissão
 */
async function test3_noPermission(processId, empresaToken) {
  log('cyan', '\n🧪 Teste 3: Avanço de Fase - Sem Permissão');
  log('blue', '   Objetivo: Empresa não pode avançar fase');

  const result = await request('POST', `/processes/${processId}/advance-phase`, null, empresaToken);

  if (!result.success && result.status === 403) {
    log('green', '   ✅ PASSOU: Empresa bloqueada corretamente');
    log('yellow', `   📝 Mensagem: ${result.data.error}`);
    return true;
  } else {
    log('red', '   ❌ FALHOU: Empresa não deveria poder avançar');
    log('red', `   Status: ${result.status}, Response:`, result.data);
    return false;
  }
}

/**
 * Teste 4: Avanço de Fase - Com Permissão mas Bloqueado
 */
async function test4_blockedByPrecondition(processId, token) {
  log('cyan', '\n🧪 Teste 4: Avanço de Fase - Bloqueado por Pré-condição');
  log('blue', '   Objetivo: Validar que pré-condições bloqueiam avanço');

  const result = await request('POST', `/processes/${processId}/advance-phase`, null, token);

  if (!result.success && result.status === 400) {
    log('green', '   ✅ PASSOU: Avanço bloqueado por pré-condição');
    log('yellow', `   📝 Razão: ${result.data.error}`);
    return true;
  } else if (result.success) {
    log('yellow', '   ⚠️  INFO: Avanço permitido (pré-condições atendidas)');
    log('yellow', '   💡 Este teste precisa de um processo que não atenda pré-condições');
    return null; // Não conta como falha
  } else {
    log('red', '   ❌ FALHOU: Erro inesperado');
    log('red', `   Status: ${result.status}, Response:`, result.data);
    return false;
  }
}

/**
 * Teste 5: Buscar Processo e Verificar Campos
 */
async function test5_processFields(processId, token) {
  log('cyan', '\n🧪 Teste 5: Verificar Campos do Processo');
  log('blue', '   Objetivo: Processo deve ter currentPhase e status');

  const result = await request('GET', `/processes/${processId}`, null, token);

  if (result.success && result.data.data) {
    const process = result.data.data;

    const hasPhase = !!process.currentPhase;
    const hasStatus = !!process.status;
    const hasDaysInStage = process.daysInStage !== undefined;

    if (hasPhase && hasStatus && hasDaysInStage) {
      log('green', '   ✅ PASSOU: Todos os campos presentes');
      log('yellow', `   📝 Fase: ${process.currentPhase}`);
      log('yellow', `   📝 Status: ${process.status}`);
      log('yellow', `   📝 Dias na Fase: ${process.daysInStage}`);
      return true;
    } else {
      log('red', '   ❌ FALHOU: Campos faltando');
      log('red', `   Phase: ${hasPhase}, Status: ${hasStatus}, Days: ${hasDaysInStage}`);
      return false;
    }
  } else {
    log('red', '   ❌ FALHOU: Erro ao buscar processo');
    log('red', `   Status: ${result.status}, Response:`, result.data);
    return false;
  }
}

/**
 * Teste 6: Endpoint Exists
 */
async function test6_endpointExists(processId, token) {
  log('cyan', '\n🧪 Teste 6: Endpoint de Avanço Existe');
  log('blue', '   Objetivo: POST /advance-phase deve existir');

  const result = await request('POST', `/processes/${processId}/advance-phase`, null, token);

  // Aceita qualquer resposta que não seja 404
  if (result.status !== 404) {
    log('green', '   ✅ PASSOU: Endpoint existe');
    log('yellow', `   📝 Status retornado: ${result.status}`);
    return true;
  } else {
    log('red', '   ❌ FALHOU: Endpoint não encontrado (404)');
    return false;
  }
}

// ====================================================================
// EXECUÇÃO PRINCIPAL
// ====================================================================

async function runAllTests() {
  console.clear();

  log('cyan', '╔════════════════════════════════════════════════════════════╗');
  log('cyan', '║                                                            ║');
  log('cyan', '║         🚀 TESTES - SPRINT 1: CORREÇÕES CRÍTICAS          ║');
  log('cyan', '║                                                            ║');
  log('cyan', '╚════════════════════════════════════════════════════════════╝');

  // Configurações
  const PROCESS_ID = process.env.PROCESS_ID;
  const ANALYST_TOKEN = process.env.ANALYST_TOKEN;
  const EMPRESA_TOKEN = process.env.EMPRESA_TOKEN;

  if (!PROCESS_ID || !ANALYST_TOKEN) {
    log('red', '\n❌ ERRO: Variáveis de ambiente não configuradas');
    log('yellow', '\nConfigure:');
    log('yellow', '  PROCESS_ID=xxx');
    log('yellow', '  ANALYST_TOKEN=yyy');
    log('yellow', '  EMPRESA_TOKEN=zzz (opcional para teste 3)');
    log('yellow', '\nExemplo:');
    log('yellow', '  PROCESS_ID=abc123 ANALYST_TOKEN=xyz789 node test-sprint1.js');
    process.exit(1);
  }

  log('blue', '\n📋 Configuração:');
  log('yellow', `   API: ${API_URL}`);
  log('yellow', `   Process ID: ${PROCESS_ID.substring(0, 8)}...`);
  log('yellow', `   Analyst Token: ${ANALYST_TOKEN ? 'Configurado' : 'Não configurado'}`);
  log('yellow', `   Empresa Token: ${EMPRESA_TOKEN ? 'Configurado' : 'Não configurado'}`);

  // Array para armazenar resultados
  const results = [];

  // Executar testes
  results.push(await test1_invalidStatus(PROCESS_ID, ANALYST_TOKEN));
  results.push(await test2_validStatus(PROCESS_ID, ANALYST_TOKEN));

  if (EMPRESA_TOKEN) {
    results.push(await test3_noPermission(PROCESS_ID, EMPRESA_TOKEN));
  } else {
    log('yellow', '\n⚠️  Teste 3 pulado: EMPRESA_TOKEN não configurado');
    results.push(null);
  }

  results.push(await test4_blockedByPrecondition(PROCESS_ID, ANALYST_TOKEN));
  results.push(await test5_processFields(PROCESS_ID, ANALYST_TOKEN));
  results.push(await test6_endpointExists(PROCESS_ID, ANALYST_TOKEN));

  // Resumo
  log('cyan', '\n╔════════════════════════════════════════════════════════════╗');
  log('cyan', '║                     📊 RESUMO DOS TESTES                   ║');
  log('cyan', '╚════════════════════════════════════════════════════════════╝');

  const validResults = results.filter((r) => r !== null);
  const passed = validResults.filter((r) => r === true).length;
  const failed = validResults.filter((r) => r === false).length;
  const skipped = results.filter((r) => r === null).length;
  const total = results.length;

  log('green', `\n   ✅ Passou: ${passed}/${total}`);
  log('red', `   ❌ Falhou: ${failed}/${total}`);
  if (skipped > 0) {
    log('yellow', `   ⏭️  Pulado: ${skipped}/${total}`);
  }

  const percentage = total > 0 ? Math.round((passed / (total - skipped)) * 100) : 0;
  log('blue', `\n   📈 Taxa de Sucesso: ${percentage}%`);

  if (failed === 0) {
    log('green', '\n   🎉 TODOS OS TESTES PASSARAM!');
    log('green', '   ✅ Sprint 1 validada com sucesso');
  } else {
    log('red', '\n   ⚠️  ALGUNS TESTES FALHARAM');
    log('yellow', '   📝 Revise os logs acima para detalhes');
  }

  log('cyan', '\n' + '='.repeat(60) + '\n');

  process.exit(failed > 0 ? 1 : 0);
}

// Executar
runAllTests().catch((error) => {
  log('red', '\n❌ ERRO FATAL:', error.message);
  console.error(error);
  process.exit(1);
});
