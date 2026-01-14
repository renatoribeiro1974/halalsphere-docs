# Atualização das Fases do Processo - HalalSphere

## Resumo das Alterações

As fases do processo de certificação foram atualizadas de **7 fases** para **8 fases**, com responsabilidades claramente definidas para cada tipo de usuário.

## Fases Anteriores (7 fases)

1. Análise Documental
2. Proposta Comercial
3. Aguardando Contrato
4. Auditoria Agendada
5. Auditoria Realizada
6. Comitê Técnico
7. Certificado Emitido

## Novas Fases (8 fases)

| # | Fase | Responsável | Roles Permitidos |
|---|------|-------------|------------------|
| 1 | **Cadastro da Solicitação** | Empresa | empresa |
| 2 | **Análise Documental** | Analista | analista, gestor |
| 3 | **Proposta Comercial** | Analista | analista, gestor |
| 4 | **Contrato** | Analista | analista, gestor |
| 5 | **Auditoria Agendada** | Analista | analista, gestor |
| 6 | **Auditoria Realizada** | Auditor | auditor, gestor |
| 7 | **Comitê Técnico** | Analista + Gestor | analista, gestor |
| 8 | **Certificado Emitido** | Sistema | gestor |

## Alterações Realizadas

### 1. Schema do Banco de Dados (`backend/prisma/schema.prisma`)

#### Novos Enums Criados:

```prisma
enum ProcessPhase {
  cadastro_solicitacao        // 1 - Cadastro da Solicitação (empresa)
  analise_documental          // 2 - Análise Documental (analista)
  proposta_comercial          // 3 - Proposta Comercial (analista)
  contrato                    // 4 - Contrato (analista)
  auditoria_agendada          // 5 - Auditoria Agendada (analista)
  auditoria_realizada         // 6 - Auditoria Realizada (auditor)
  comite_tecnico              // 7 - Comitê Técnico (analista + gestor)
  certificado_emitido         // 8 - Certificado Emitido (sistema)
}

enum PhaseResponsibility {
  empresa
  analista
  auditor
  gestor
  analista_gestor  // Para Comitê Técnico que precisa de ambos
  sistema
}
```

#### Alterações no modelo `Process`:

- Alterado `currentPhase` de `Int` para `ProcessPhase`
- Adicionado campo `auditorId` para vincular auditores aos processos
- Valor padrão de `currentPhase` mudou de `1` para `cadastro_solicitacao`

#### Alterações no modelo `User`:

- Adicionado relação `auditorProcesses` para auditores

### 2. Backend

#### Arquivo: `backend/src/modules/process/process.service.ts`

- Atualizado para usar `currentPhase: 'cadastro_solicitacao'` ao criar novos processos

#### Arquivo Criado: `backend/src/modules/process/process.phases.ts`

Novo arquivo com:
- Enums `ProcessPhase` e `PhaseResponsibility`
- Constante `PROCESS_PHASES` com configuração completa de todas as fases
- Funções utilitárias:
  - `getPhaseConfig()` - Obtém configuração de uma fase
  - `getAllPhases()` - Retorna todas as fases ordenadas
  - `getNextPhase()` - Obtém próxima fase
  - `getPreviousPhase()` - Obtém fase anterior
  - `canUserActOnPhase()` - Verifica permissões
  - `getPhaseProgress()` - Calcula percentual de progresso

### 3. Frontend

#### Arquivo: `frontend/src/pages/ProcessDetails.tsx`

- Atualizado array `PROCESS_STAGES` para usar as 8 novas fases
- Adicionado exibição da responsabilidade de cada fase na timeline
- Importando e usando `getAllPhases()` do arquivo de configuração

#### Arquivo Criado: `frontend/src/lib/process-phases.ts`

Espelhamento do arquivo do backend para o frontend com:
- Mesmos enums e tipos
- Mesma configuração de fases
- Mesmas funções utilitárias
- Adicionado campo `icon` para cada fase
- Adicionado `responsibilityLabel` formatado para exibição

## ✅ Status da Implementação

### Migration Aplicada com Sucesso

A migration foi criada e aplicada ao banco de dados:
- ✅ Criados enums `ProcessPhase` e `PhaseResponsibility`
- ✅ Alterado tipo da coluna `current_phase` de `Int` para `ProcessPhase`
- ✅ Adicionada coluna `auditor_id` na tabela `processes`
- ✅ Criados índices apropriados
- ✅ Dados existentes migrados para `cadastro_solicitacao`

### Testes Executados

```bash
node test-process-phases.js
```

Resultados:
- ✅ ProcessPhase enum funcionando corretamente
- ✅ Schema do banco atualizado com sucesso
- ✅ 2 processos existentes migrados para fase `cadastro_solicitacao`
- ✅ Todas as 8 fases definidas e acessíveis

## Próximos Passos Recomendados

### 1. Testar Interface do Usuário

Testar no frontend:
- [ ] Visualização da timeline com 8 fases em [ProcessDetails.tsx](frontend/src/pages/ProcessDetails.tsx)
- [ ] Exibição correta dos responsáveis em cada fase
- [ ] Navegação entre fases
- [ ] Dashboard do analista
- [ ] Dashboard da empresa

### 2. Implementar Lógica de Transição de Fases

Próximas implementações recomendadas:
- [ ] Validar permissões antes de avançar fase (usar `canUserActOnPhase()`)
- [ ] Registrar histórico de mudanças de fase
- [ ] Notificar usuários responsáveis quando fase muda
- [ ] Calcular tempo em cada fase
- [ ] Implementar botões de ação específicos para cada fase

### 3. Atualizar ProcessPhaseHistory

A tabela `process_phase_history` ainda usa `Int` para fase. Considerar:
- Atualizar para usar o enum `ProcessPhase`
- Ou manter compatibilidade usando o campo `order` do `PhaseConfig`

## Impacto nas Funcionalidades

### Positivo ✅
- Maior clareza sobre responsabilidades
- Melhor rastreamento do processo
- Separação clara entre papel do analista e auditor
- Fase inicial para empresa cadastrar solicitação

### Atenção ⚠️
- Será necessário atualizar a lógica de negócio que depende de número de fases
- Dashboards e relatórios podem precisar ser atualizados
- Testes automatizados precisarão ser ajustados

## Arquivos Modificados

### Backend
- ✅ `backend/prisma/schema.prisma`
- ✅ `backend/src/modules/process/process.service.ts`
- ✅ `backend/src/modules/process/process.phases.ts` (novo)

### Frontend
- ✅ `frontend/src/pages/ProcessDetails.tsx`
- ✅ `frontend/src/lib/process-phases.ts` (novo)

### Migrations
- ⏳ `backend/prisma/migrations/[timestamp]_update_process_phases/` (pendente)

## Notas Técnicas

1. **Retrocompatibilidade**: O enum `ProcessStatus` foi mantido inalterado. Apenas `currentPhase` foi alterado.

2. **Histórico**: A tabela `process_phase_history` ainda usa `Int` para fase. Considerar atualizar para usar o enum também em implementação futura.

3. **Validações**: As funções utilitárias em `process.phases.ts` fornecem validações de permissão que devem ser usadas no backend antes de permitir transições de fase.

4. **Frontend/Backend Sync**: Manter os arquivos `backend/src/modules/process/process.phases.ts` e `frontend/src/lib/process-phases.ts` sincronizados.

## Documentação de Referência

- PR 7.1 Rev 21 (documento original das fases)
- User Stories: Epic 03 - Analysis
- Schema do banco: `backend/prisma/schema.prisma`
