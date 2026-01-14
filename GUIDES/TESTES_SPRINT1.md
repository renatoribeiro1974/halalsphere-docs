# Testes - Sprint 1: Correções Críticas

**Data:** 2025-11-18
**Objetivo:** Validar todas as implementações da Sprint 1

---

## 📋 CHECKLIST DE TESTES

### Testes Críticos (Obrigatórios):
- [ ] 1. Validação de status inválido
- [ ] 2. Todos os 16 status mapeados no frontend
- [ ] 3. Avanço de fase com sucesso
- [ ] 4. Avanço de fase bloqueado (pré-condições)
- [ ] 5. Histórico de fases registrado
- [ ] 6. Permissões de avanço de fase

### Testes Complementares:
- [ ] 7. Botão "Avançar Fase" no frontend
- [ ] 8. Mensagens de erro claras
- [ ] 9. Atualização da UI após avanço
- [ ] 10. Audit log registrado

---

## 🧪 TESTES DETALHADOS

### Teste 1: Validação de Status Inválido ❌ CRÍTICO

**Objetivo:** Garantir que backend rejeita status inválido

**Pré-requisitos:**
- Backend rodando
- Token de autenticação válido
- Processo existente

**Comandos:**
```bash
# Tentar atualizar com status inválido "em_analise"
curl -X PATCH http://localhost:3000/api/processes/{processId}/status \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "em_analise",
    "notes": "Testando status inválido"
  }'
```

**Resultado Esperado:**
```json
{
  "success": false,
  "error": "Status inválido: \"em_analise\". Status válidos: rascunho, pendente, em_andamento, aguardando_documentos, analise_documental, analise_tecnica, aguardando_auditoria, proposta_enviada, aguardando_assinatura, em_auditoria, concluido, aprovado, reprovado, certificado, cancelado, suspenso"
}
```

**Status Code:** 400

✅ **PASSOU:** [ ]  ❌ **FALHOU:** [ ]

---

### Teste 2: Todos os 16 Status Mapeados

**Objetivo:** Verificar que frontend exibe corretamente todos os status

**Pré-requisitos:**
- Frontend rodando
- Login como analista
- Processo em cada status diferente (ou alterar manualmente)

**Passos:**
1. Abrir ProcessDetails de um processo
2. Verificar que o badge de status está visível
3. Alterar status do processo no banco para cada um dos 16 valores
4. Recarregar página e verificar que label está correto

**Status a testar:**

| Status | Label Esperado | Variante |
|--------|----------------|----------|
| `rascunho` | Rascunho | default |
| `pendente` | Pendente | warning |
| `em_andamento` | Em Andamento | default |
| `aguardando_documentos` | Aguardando Documentos | warning |
| `analise_documental` | Análise Documental | default |
| `analise_tecnica` | Análise Técnica | default |
| `aguardando_auditoria` | Aguardando Auditoria | warning |
| `proposta_enviada` | Proposta Enviada | default |
| `aguardando_assinatura` | Aguardando Assinatura | warning |
| `em_auditoria` | Em Auditoria | default |
| `concluido` | Concluído | success |
| `aprovado` | Aprovado | success |
| `reprovado` | Reprovado | error |
| `certificado` | Certificado Emitido | success |
| `cancelado` | Cancelado | error |
| `suspenso` | Suspenso | warning |

✅ **PASSOU:** [ ]  ❌ **FALHOU:** [ ]

---

### Teste 3: Avanço de Fase com Sucesso ✅ CRÍTICO

**Objetivo:** Validar avanço de fase quando pré-condições são atendidas

**Cenário 1: Fase 1 → Fase 2**

**Setup:**
```sql
-- Criar processo na Fase 1 com analista
UPDATE processes
SET current_phase = 'cadastro_solicitacao',
    status = 'pendente',
    analyst_id = '{analystId}'
WHERE request_id = '{requestId}';
```

**Comando:**
```bash
curl -X POST http://localhost:3000/api/processes/{requestId}/advance-phase \
  -H "Authorization: Bearer {analystToken}" \
  -H "Content-Type: application/json"
```

**Resultado Esperado:**
```json
{
  "success": true,
  "message": "Fase avançada com sucesso"
}
```

**Validações:**
```sql
-- Verificar que fase avançou
SELECT current_phase, status FROM processes WHERE request_id = '{requestId}';
-- Esperado: current_phase = 'analise_documental', status = 'analise_documental'

-- Verificar histórico de fases
SELECT * FROM process_phase_history
WHERE process_id = (SELECT id FROM processes WHERE request_id = '{requestId}')
ORDER BY entered_at DESC;
-- Esperado: 2 registros (Fase 1 com exited_at preenchido, Fase 2 com exited_at null)

-- Verificar histórico geral
SELECT * FROM process_history
WHERE process_id = (SELECT id FROM processes WHERE request_id = '{requestId}')
ORDER BY created_at DESC LIMIT 1;
-- Esperado: notes contém "Fase avançada de cadastro_solicitacao para analise_documental"
```

✅ **PASSOU:** [ ]  ❌ **FALHOU:** [ ]

---

### Teste 4: Avanço de Fase Bloqueado ❌ CRÍTICO

**Objetivo:** Validar que pré-condições bloqueiam avanço incorreto

**Cenário 1: Fase 1 sem Analista**

**Setup:**
```sql
UPDATE processes
SET current_phase = 'cadastro_solicitacao',
    status = 'pendente',
    analyst_id = NULL
WHERE request_id = '{requestId}';
```

**Comando:**
```bash
curl -X POST http://localhost:3000/api/processes/{requestId}/advance-phase \
  -H "Authorization: Bearer {analystToken}" \
  -H "Content-Type: application/json"
```

**Resultado Esperado:**
```json
{
  "success": false,
  "error": "Analista não atribuído"
}
```

**Status Code:** 400

---

**Cenário 2: Fase 2 com Documentos Pendentes**

**Setup:**
```sql
UPDATE processes
SET current_phase = 'analise_documental',
    status = 'analise_documental'
WHERE request_id = '{requestId}';

-- Criar documento pendente
INSERT INTO documents (request_id, document_type, file_name, file_url, file_size, mime_type, validation_status)
VALUES ('{requestId}', 'contrato_social', 'contrato.pdf', '/uploads/contrato.pdf', 1000, 'application/pdf', 'pendente');
```

**Comando:**
```bash
curl -X POST http://localhost:3000/api/processes/{requestId}/advance-phase \
  -H "Authorization: Bearer {analystToken}"
```

**Resultado Esperado:**
```json
{
  "success": false,
  "error": "Existem documentos pendentes de validação"
}
```

---

**Cenário 3: Fase 3 sem Proposta Enviada**

**Setup:**
```sql
UPDATE processes
SET current_phase = 'proposta_comercial',
    status = 'em_andamento'
WHERE request_id = '{requestId}';

-- Garantir que não há proposta enviada
DELETE FROM contracts
WHERE process_id = (SELECT id FROM processes WHERE request_id = '{requestId}');
```

**Resultado Esperado:**
```json
{
  "success": false,
  "error": "Proposta comercial não enviada"
}
```

✅ **PASSOU:** [ ]  ❌ **FALHOU:** [ ]

---

### Teste 5: Histórico de Fases Registrado

**Objetivo:** Verificar que todas as transições são registradas

**Passos:**
1. Criar processo na Fase 1
2. Avançar para Fase 2
3. Verificar registro no `process_phase_history`

**Validação:**
```sql
SELECT
  phase,
  entered_at,
  exited_at,
  days_in_phase
FROM process_phase_history
WHERE process_id = '{processId}'
ORDER BY entered_at;
```

**Resultado Esperado:**
```
phase | entered_at          | exited_at           | days_in_phase
------|---------------------|---------------------|---------------
1     | 2025-11-18 10:00:00 | 2025-11-18 10:05:00 | 0
2     | 2025-11-18 10:05:00 | NULL                | NULL
```

**Verificações:**
- ✅ Fase anterior tem `exited_at` preenchido
- ✅ Fase anterior tem `days_in_phase` calculado
- ✅ Fase atual tem `exited_at` NULL
- ✅ Ordem das fases está correta (1, 2, 3...)

✅ **PASSOU:** [ ]  ❌ **FALHOU:** [ ]

---

### Teste 6: Permissões de Avanço de Fase

**Objetivo:** Garantir que apenas analista e gestor podem avançar

**Cenário 1: Empresa tenta avançar**

**Comando:**
```bash
curl -X POST http://localhost:3000/api/processes/{requestId}/advance-phase \
  -H "Authorization: Bearer {empresaToken}"
```

**Resultado Esperado:**
```json
{
  "success": false,
  "error": "Apenas analistas e gestores podem avançar fases"
}
```

**Status Code:** 403

---

**Cenário 2: Analista avança (sucesso)**

**Comando:**
```bash
curl -X POST http://localhost:3000/api/processes/{requestId}/advance-phase \
  -H "Authorization: Bearer {analistaToken}"
```

**Resultado Esperado:**
```json
{
  "success": true,
  "message": "Fase avançada com sucesso"
}
```

---

**Cenário 3: Gestor avança (sucesso)**

**Comando:**
```bash
curl -X POST http://localhost:3000/api/processes/{requestId}/advance-phase \
  -H "Authorization: Bearer {gestorToken}"
```

**Resultado Esperado:**
```json
{
  "success": true,
  "message": "Fase avançada com sucesso"
}
```

✅ **PASSOU:** [ ]  ❌ **FALHOU:** [ ]

---

### Teste 7: Botão "Avançar Fase" no Frontend

**Objetivo:** Validar interação do usuário com o botão

**Pré-requisitos:**
- Frontend rodando em http://localhost:5173
- Login como analista
- Processo na Fase 1 com analista atribuído

**Passos:**
1. Fazer login como analista
2. Navegar para Dashboard
3. Clicar em um processo
4. Na página de detalhes, localizar botão "Avançar Fase"
5. Clicar no botão
6. Observar comportamento

**Resultado Esperado:**
- ✅ Botão fica desabilitado durante requisição
- ✅ Texto muda para "Avançando..."
- ✅ Após sucesso, botão volta ao normal
- ✅ Página atualiza mostrando nova fase
- ✅ Timeline atualiza mostrando progresso
- ✅ Badge de status atualiza

**Erros a Verificar:**
- ❌ Se pré-condições não atendidas, mostra toast com erro
- ❌ Se sem permissão, mostra erro 403

✅ **PASSOU:** [ ]  ❌ **FALHOU:** [ ]

---

### Teste 8: Mensagens de Erro Claras

**Objetivo:** Verificar que erros são informativos

**Cenários a testar:**

| Cenário | Mensagem Esperada |
|---------|-------------------|
| Status inválido | "Status inválido: \"{status}\". Status válidos: ..." |
| Sem analista | "Analista não atribuído" |
| Documentos pendentes | "Existem documentos pendentes de validação" |
| Proposta não enviada | "Proposta comercial não enviada" |
| Contrato não assinado | "Contrato não assinado" |
| Auditoria não agendada | "Auditoria não agendada" |
| Auditoria não concluída | "Auditoria não concluída" |
| Comitê não aprovou | "Comitê ainda não aprovou o processo" |
| Já na fase final | "Processo já está na fase final" |
| Sem permissão | "Apenas analistas e gestores podem avançar fases" |

✅ **PASSOU:** [ ]  ❌ **FALHOU:** [ ]

---

### Teste 9: Atualização da UI após Avanço

**Objetivo:** Garantir que UI reflete mudanças imediatamente

**Passos:**
1. Abrir ProcessDetails
2. Observar fase e status atuais
3. Clicar em "Avançar Fase"
4. Aguardar conclusão
5. Verificar atualizações

**Elementos a Verificar:**
- ✅ Badge de status no header atualiza
- ✅ Timeline marca fase anterior como concluída (✓)
- ✅ Timeline marca fase atual como "Em andamento"
- ✅ Contador "Dias na Fase Atual" reseta para 0
- ✅ Botão "Avançar Fase" continua habilitado (se pode avançar novamente)

✅ **PASSOU:** [ ]  ❌ **FALHOU:** [ ]

---

### Teste 10: Audit Log Registrado

**Objetivo:** Verificar rastreabilidade de ações

**Validação:**
```sql
SELECT
  entity,
  entity_id,
  action,
  user_id,
  changes,
  created_at
FROM audit_trail
WHERE entity = 'process'
  AND entity_id = '{requestId}'
ORDER BY created_at DESC
LIMIT 5;
```

**Verificar:**
- ✅ Ação de avanço de fase está registrada
- ✅ `user_id` corresponde ao analista que avançou
- ✅ `action` está correto
- ✅ Timestamp está correto

✅ **PASSOU:** [ ]  ❌ **FALHOU:** [ ]

---

## 🔧 FERRAMENTAS DE TESTE

### Script de Teste Automatizado (Node.js)

Criar arquivo: `test-sprint1.js`

```javascript
const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
let TOKEN = '';

// Helper para fazer requests
async function request(method, path, data = null, token = TOKEN) {
  try {
    const response = await axios({
      method,
      url: `${API_URL}${path}`,
      data,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

// Teste 1: Status Inválido
async function test1_invalidStatus(processId) {
  console.log('\n🧪 Teste 1: Status Inválido');

  const result = await request('PATCH', `/processes/${processId}/status`, {
    status: 'em_analise',
    notes: 'Testando status inválido'
  });

  if (!result.success && result.status === 400) {
    console.log('✅ PASSOU: Status inválido rejeitado corretamente');
    console.log('   Mensagem:', result.error.error);
    return true;
  } else {
    console.log('❌ FALHOU: Status inválido foi aceito');
    return false;
  }
}

// Teste 3: Avanço de Fase com Sucesso
async function test3_advancePhaseSuccess(processId) {
  console.log('\n🧪 Teste 3: Avanço de Fase (Sucesso)');

  const result = await request('POST', `/processes/${processId}/advance-phase`);

  if (result.success) {
    console.log('✅ PASSOU: Fase avançada com sucesso');
    console.log('   Mensagem:', result.data.message);
    return true;
  } else {
    console.log('❌ FALHOU: Não foi possível avançar fase');
    console.log('   Erro:', result.error);
    return false;
  }
}

// Teste 4: Avanço Bloqueado
async function test4_advancePhaseBlocked(processId) {
  console.log('\n🧪 Teste 4: Avanço de Fase Bloqueado');

  const result = await request('POST', `/processes/${processId}/advance-phase`);

  if (!result.success && result.status === 400) {
    console.log('✅ PASSOU: Avanço bloqueado corretamente');
    console.log('   Razão:', result.error.error);
    return true;
  } else {
    console.log('❌ FALHOU: Avanço deveria ter sido bloqueado');
    return false;
  }
}

// Teste 6: Permissões
async function test6_permissions(processId, empresaToken) {
  console.log('\n🧪 Teste 6: Permissões');

  const result = await request('POST', `/processes/${processId}/advance-phase`, null, empresaToken);

  if (!result.success && result.status === 403) {
    console.log('✅ PASSOU: Empresa bloqueada corretamente');
    console.log('   Mensagem:', result.error.error);
    return true;
  } else {
    console.log('❌ FALHOU: Empresa não deveria poder avançar');
    return false;
  }
}

// Executar todos os testes
async function runAllTests() {
  console.log('🚀 Iniciando Testes Sprint 1\n');
  console.log('=' .repeat(60));

  // Configurar (ajustar IDs conforme necessário)
  const PROCESS_ID = process.env.PROCESS_ID || 'seu-process-id-aqui';
  const ANALYST_TOKEN = process.env.ANALYST_TOKEN || 'seu-token-aqui';
  const EMPRESA_TOKEN = process.env.EMPRESA_TOKEN || 'seu-token-empresa-aqui';

  TOKEN = ANALYST_TOKEN;

  const results = [];

  // Executar testes
  results.push(await test1_invalidStatus(PROCESS_ID));
  results.push(await test3_advancePhaseSuccess(PROCESS_ID));
  results.push(await test4_advancePhaseBlocked(PROCESS_ID));
  results.push(await test6_permissions(PROCESS_ID, EMPRESA_TOKEN));

  // Resumo
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO DOS TESTES');
  console.log('='.repeat(60));

  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log(`\n✅ Passou: ${passed}/${total}`);
  console.log(`❌ Falhou: ${total - passed}/${total}`);

  if (passed === total) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
  } else {
    console.log('\n⚠️  ALGUNS TESTES FALHARAM');
  }
}

// Executar
runAllTests();
```

**Executar:**
```bash
PROCESS_ID=xxx ANALYST_TOKEN=yyy EMPRESA_TOKEN=zzz node test-sprint1.js
```

---

## 📊 RELATÓRIO DE TESTES

### Resumo Final:

**Data de Execução:** ___/___/_____

**Testes Executados:** ___ / 10

**Testes Passou:** ___ / ___

**Testes Falharam:** ___ / ___

### Detalhes de Falhas:

| Teste | Motivo da Falha | Severidade |
|-------|-----------------|------------|
|       |                 |            |
|       |                 |            |

### Decisão:

- [ ] ✅ Aprovado para produção
- [ ] ⚠️  Aprovado com ressalvas
- [ ] ❌ Reprovado - Correções necessárias

---

**Testado por:** _____________________
**Data:** ___/___/_____
**Assinatura:** _____________________
