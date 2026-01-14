# Fluxo de Fases e Status - Correção Implementada

## Resumo das Mudanças

O fluxo de fases e status foi corrigido para refletir corretamente as 8 fases do processo de certificação e os status em cada fase.

## Fases do Processo

### 1. Cadastro da Solicitação (cadastro_solicitacao)
- **Responsável**: Empresa
- **Status Inicial**: `rascunho` (empresa está preenchendo o formulário)
- **Status Final**: `pendente` (empresa finalizou e está aguardando atribuição de analista)
- **Transição**: Quando a empresa clica em "Finalizar" no wizard

### 2. Análise Documental (analise_documental)
- **Responsável**: Analista
- **Status Inicial**: `em_andamento` (analista assumiu o processo)
- **Possíveis Status**:
  - `em_andamento`: Analista está revisando documentos
  - `aguardando_documentos`: Faltam documentos da empresa
- **Transição**: Quando o gestor atribui um analista ao processo pendente

### 3. Proposta Comercial (proposta_comercial)
- **Responsável**: Analista
- **Status**: `em_andamento`
- **Descrição**: Analista elabora e envia proposta comercial

### 4. Contrato (contrato)
- **Responsável**: Analista
- **Status**: `em_andamento` ou `aguardando_assinatura`
- **Descrição**: Analista gerencia assinatura do contrato

### 5. Auditoria Agendada (auditoria_agendada)
- **Responsável**: Analista
- **Status**: `em_andamento`
- **Descrição**: Analista agenda a auditoria

### 6. Auditoria Realizada (auditoria_realizada)
- **Responsável**: Auditor
- **Status**: `em_auditoria`
- **Descrição**: Auditor realiza a auditoria no local

### 7. Comitê Técnico (comite_tecnico)
- **Responsável**: Analista + Gestor
- **Status**: `em_andamento`
- **Descrição**: Comitê técnico avalia e decide sobre a certificação

### 8. Certificado Emitido (certificado_emitido)
- **Responsável**: Sistema
- **Status**: `certificado`
- **Descrição**: Sistema emite o certificado Halal

## Fluxo Detalhado

```
┌─────────────────────────────────────────────────────────────────┐
│ FASE 1: Cadastro da Solicitação                                │
│ Responsável: Empresa                                            │
├─────────────────────────────────────────────────────────────────┤
│ 1. Empresa cria nova solicitação                                │
│    - Process.status = 'rascunho'                                │
│    - Process.currentPhase = 'cadastro_solicitacao'              │
│                                                                  │
│ 2. Empresa preenche wizard (múltiplas etapas)                   │
│    - Status continua como 'rascunho'                            │
│                                                                  │
│ 3. Empresa clica em "Finalizar" no último passo                 │
│    - POST /api/processes/:id/submit                             │
│    - Process.status = 'pendente'                                │
│    - Process.currentPhase = 'cadastro_solicitacao'              │
│    - Request.status = 'enviado'                                 │
│    - Processo agora visível para analistas                      │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ TRANSIÇÃO: Atribuição de Analista                              │
├─────────────────────────────────────────────────────────────────┤
│ 1. Gestor atribui analista ao processo                          │
│    - POST /api/processes/:id/assign                             │
│    - Process.analystId = [analista_id]                          │
│    - Process.status = 'em_andamento'                            │
│    - Process.currentPhase = 'analise_documental'                │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ FASE 2: Análise Documental                                     │
│ Responsável: Analista                                           │
├─────────────────────────────────────────────────────────────────┤
│ 1. Analista revisa documentação                                 │
│    - Process.status = 'em_andamento'                            │
│                                                                  │
│ 2. Se faltarem documentos:                                      │
│    - Process.status = 'aguardando_documentos'                   │
│    - Analista solicita documentos via sistema                   │
│                                                                  │
│ 3. Quando documentos estiverem OK:                              │
│    - Analista avança para próxima fase                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ FASES 3-8: Restante do Processo                                │
│ (Seguem o mesmo padrão de transição)                            │
└─────────────────────────────────────────────────────────────────┘
```

## Dashboard do Analista

O dashboard do analista agora mostra os processos organizados em 4 colunas (Kanban):

### Coluna 1: Aguardando Início
- **Status**: `pendente`
- **Descrição**: Processos que a empresa finalizou mas ainda não foram atribuídos a nenhum analista
- **Ação**: Gestor pode atribuir analista

### Coluna 2: Em Andamento
- **Status**: `em_andamento`
- **Descrição**: Processos que estão sendo ativamente trabalhados pelo analista
- **Ação**: Analista continua trabalhando

### Coluna 3: Aguardando Documentos
- **Status**: `aguardando_documentos`
- **Descrição**: Processos que estão aguardando documentos da empresa
- **Ação**: Aguardar empresa enviar documentos

### Coluna 4: Concluídos
- **Status**: `concluido`
- **Descrição**: Processos finalizados
- **Ação**: Apenas visualização

## Endpoints da API

### 1. Finalizar Wizard (Empresa)
```http
POST /api/processes/:id/submit
Authorization: Bearer [empresa_token]

Response:
{
  "success": true,
  "data": {
    "id": "...",
    "status": "pendente",
    "currentPhase": "cadastro_solicitacao",
    ...
  },
  "message": "Solicitação enviada com sucesso! Aguarde a atribuição de um analista."
}
```

### 2. Atribuir Analista (Gestor)
```http
POST /api/processes/:id/assign
Authorization: Bearer [gestor_token]
Content-Type: application/json

{
  "analystId": "uuid-do-analista",
  "priority": "media"
}

Response:
{
  "success": true,
  "data": {
    "id": "...",
    "status": "em_andamento",
    "currentPhase": "analise_documental",
    "assignedAnalystId": "uuid-do-analista",
    "assignedAnalystName": "Nome do Analista",
    ...
  }
}
```

## Status Possíveis do Processo

- `rascunho`: Empresa ainda está preenchendo
- `pendente`: Aguardando atribuição de analista
- `em_andamento`: Processo está sendo trabalhado
- `aguardando_documentos`: Faltam documentos da empresa
- `aguardando_auditoria`: Aguardando agendamento/realização de auditoria
- `em_auditoria`: Auditoria em andamento
- `concluido`: Processo finalizado
- `cancelado`: Processo cancelado
- `suspenso`: Processo suspenso
- `certificado`: Certificado emitido

## Correções Implementadas

1. ✅ Processo inicia com status `rascunho` na fase `cadastro_solicitacao`
2. ✅ Quando empresa finaliza wizard, status muda para `pendente`
3. ✅ Fase permanece como `cadastro_solicitacao` até analista ser atribuído
4. ✅ Quando analista é atribuído, fase muda para `analise_documental` e status para `em_andamento`
5. ✅ Dashboard do analista mostra processos pendentes na coluna "Aguardando Início"
6. ✅ Processos são visíveis para todos os analistas (para permitir atribuição)
7. ✅ Endpoint `/api/processes/:id/submit` criado para finalizar wizard
8. ✅ Lógica de transição automática implementada no método `assignAnalyst`

## Próximos Passos

1. Implementar transições entre as demais fases (3-8)
2. Adicionar validações de permissão para cada fase
3. Implementar histórico de mudanças de fase
4. Criar notificações para mudanças de status
5. Adicionar métricas de tempo em cada fase
