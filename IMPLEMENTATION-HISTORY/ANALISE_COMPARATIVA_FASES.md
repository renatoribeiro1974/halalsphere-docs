# Análise Comparativa - Fases do Processo HalalSphere

**Data:** 2025-11-18
**Objetivo:** Identificar inconsistências na definição de fases e status entre todas as camadas do sistema

---

## 📊 RESUMO EXECUTIVO

O sistema HalalSphere apresenta **TRÊS conceitos distintos mas interligados** que estão sendo utilizados de forma inconsistente:

1. **FASES (ProcessPhase)** - Etapas sequenciais do processo de certificação (8 fases)
2. **STATUS (ProcessStatus)** - Estados do processo dentro de cada fase (16 status)
3. **STATUS DE REQUEST** - Estados da solicitação inicial (5 status)

### Problemas Principais Identificados:

1. ✅ **FASES estão sincronizadas** entre banco, backend e frontend
2. ❌ **STATUS estão DESSINCRONIZADOS** - Componentes usam status diferentes
3. ❌ **LÓGICA DE TRANSIÇÃO está em múltiplos lugares** sem consistência
4. ❌ **KANBAN usa apenas 4 status** enquanto o sistema possui 16
5. ❌ **DADOS MOCKADOS** ainda presentes em alguns componentes

---

## 🗄️ 1. BANCO DE DADOS (Prisma Schema)

### 1.1 Process Phases (8 fases) ✅

```prisma
enum ProcessPhase {
  cadastro_solicitacao        // 1 - Empresa
  analise_documental          // 2 - Analista
  proposta_comercial          // 3 - Analista
  contrato                    // 4 - Analista
  auditoria_agendada          // 5 - Analista
  auditoria_realizada         // 6 - Auditor
  comite_tecnico              // 7 - Analista + Gestor
  certificado_emitido         // 8 - Sistema
}
```

**Responsabilidades:**
```prisma
enum PhaseResponsibility {
  empresa
  analista
  auditor
  gestor
  analista_gestor
  sistema
}
```

### 1.2 Process Status (16 status) ⚠️

```prisma
enum ProcessStatus {
  rascunho                    // Inicial
  pendente                    // Aguardando analista
  em_andamento                // Analista trabalhando
  aguardando_documentos       // Empresa precisa enviar docs
  analise_documental          // Analisando documentos
  analise_tecnica             // Análise técnica
  aguardando_auditoria        // Aguardando agendamento
  proposta_enviada            // Proposta comercial enviada
  aguardando_assinatura       // Aguardando assinatura contrato
  em_auditoria                // Auditoria em andamento
  concluido                   // Processo concluído
  aprovado                    // Aprovado pelo comitê
  reprovado                   // Reprovado
  certificado                 // Certificado emitido
  cancelado                   // Cancelado
  suspenso                    // Suspenso
}
```

### 1.3 Request Status (5 status)

```prisma
enum RequestStatus {
  rascunho                    // Empresa preenchendo
  enviado                     // Empresa finalizou
  em_analise                  // Analista analisando
  aprovado                    // Aprovado
  rejeitado                   // Rejeitado
}
```

---

## 💻 2. BACKEND

### 2.1 Process Phases (process.phases.ts) ✅ SINCRONIZADO

```typescript
export enum ProcessPhase {
  CADASTRO_SOLICITACAO = 'cadastro_solicitacao',
  ANALISE_DOCUMENTAL = 'analise_documental',
  PROPOSTA_COMERCIAL = 'proposta_comercial',
  CONTRATO = 'contrato',
  AUDITORIA_AGENDADA = 'auditoria_agendada',
  AUDITORIA_REALIZADA = 'auditoria_realizada',
  COMITE_TECNICO = 'comite_tecnico',
  CERTIFICADO_EMITIDO = 'certificado_emitido',
}
```

**Configuração das Fases:**
- ✅ Ordem definida (1-8)
- ✅ Responsabilidades mapeadas
- ✅ Permissões por role
- ✅ Funções helper (getNextPhase, canUserActOnPhase, etc.)

### 2.2 Process Status (process.types.ts) ✅ PARCIALMENTE SINCRONIZADO

```typescript
export const ProcessStatus = z.enum([
  'rascunho',
  'pendente',
  'em_andamento',
  'aguardando_documentos',
  'analise_documental',
  'analise_tecnica',
  'aguardando_auditoria',
  'proposta_enviada',
  'aguardando_assinatura',
  'em_auditoria',
  'concluido',
  'aprovado',
  'reprovado',
  'certificado',
  'cancelado',
  'suspenso',
]);
```

**Status:** ✅ Todos os 16 status do Prisma estão mapeados

### 2.3 Lógica de Negócio (process.service.ts)

**Transições Implementadas:**

1. **Criação do Processo:**
   ```typescript
   currentPhase: 'cadastro_solicitacao'
   status: 'rascunho'
   ```

2. **Submit do Wizard (Empresa finaliza):**
   ```typescript
   currentPhase: 'cadastro_solicitacao' (mantém)
   status: 'rascunho' → 'pendente'
   request.status: 'rascunho' → 'enviado'
   ```

3. **Atribuição de Analista:**
   ```typescript
   Se currentPhase === 'cadastro_solicitacao' && status === 'pendente':
     currentPhase: 'cadastro_solicitacao' → 'analise_documental'
     status: 'pendente' → 'em_andamento'
   ```

**❌ PROBLEMA:** Lógica de transição entre fases não está completa. Apenas a transição da Fase 1 → Fase 2 está implementada.

---

## 🎨 3. FRONTEND

### 3.1 Process Phases (process-phases.ts) ✅ SINCRONIZADO

```typescript
export enum ProcessPhase {
  CADASTRO_SOLICITACAO = 'cadastro_solicitacao',
  ANALISE_DOCUMENTAL = 'analise_documental',
  PROPOSTA_COMERCIAL = 'proposta_comercial',
  CONTRATO = 'contrato',
  AUDITORIA_AGENDADA = 'auditoria_agendada',
  AUDITORIA_REALIZADA = 'auditoria_realizada',
  COMITE_TECNICO = 'comite_tecnico',
  CERTIFICADO_EMITIDO = 'certificado_emitido',
}
```

**Configuração:**
- ✅ Mesmas 8 fases do backend
- ✅ Propriedade adicional: `responsibilityLabel` (para exibição)
- ✅ Propriedade adicional: `icon` (emojis para UI)

### 3.2 Process Service (process.service.ts)

**Interface Process:**
```typescript
export interface Process {
  id: string;
  protocol: string;
  companyId: string;
  companyName: string;
  productType: string;
  productCategory: string;
  productDescription: string;
  status: string;              // ✅ Status genérico
  currentPhase: string;         // ✅ Fase atual
  priority: string | null;
  assignedAnalystId: string | null;
  assignedAnalystName: string | null;
  createdAt: string;
  updatedAt: string;
  daysInStage: number;
}
```

**Status:** ✅ Interface aceita qualquer status (string genérico)

### 3.3 Analyst Dashboard (AnalystDashboard.tsx) ❌ INCONSISTENTE

**Kanban Board - USA APENAS 4 STATUS:**

```typescript
const columns = [
  { id: 'pendente', title: 'Aguardando Início' },
  { id: 'em_andamento', title: 'Em Andamento' },
  { id: 'aguardando_documentos', title: 'Aguardando Docs' },
  { id: 'concluido', title: 'Concluídos' },
];
```

**❌ PROBLEMAS:**
1. Ignora 12 dos 16 status disponíveis
2. Não reflete as 8 fases do processo
3. Não mostra: proposta_enviada, aguardando_assinatura, em_auditoria, aprovado, certificado, etc.

### 3.4 Process Details (ProcessDetails.tsx) ❌ INCONSISTENTE

**STATUS_CONFIG - USA APENAS 8 STATUS:**

```typescript
const STATUS_CONFIG = {
  aguardando_documentos: { label: 'Aguardando Documentos', variant: 'warning' },
  em_analise: { label: 'Em Análise', variant: 'default' },  // ❌ Não existe no banco
  proposta_enviada: { label: 'Proposta Enviada', variant: 'default' },
  aguardando_assinatura: { label: 'Aguardando Assinatura', variant: 'warning' },
  em_auditoria: { label: 'Em Auditoria', variant: 'default' },
  aprovado: { label: 'Aprovado', variant: 'success' },
  reprovado: { label: 'Reprovado', variant: 'error' },
  certificado: { label: 'Certificado', variant: 'success' },
};
```

**❌ PROBLEMAS:**
1. Usa status `em_analise` que NÃO EXISTE no banco (deveria ser `analise_documental` ou `analise_tecnica`)
2. Falta mapeamento de 8 status válidos
3. Timeline usa `currentPhase` (correto) mas ações usam `status` (inconsistente)

**Lógica de Avanço de Fase - HARDCODED:**

```typescript
const statusFlow = [
  'aguardando_documentos',
  'em_analise',              // ❌ Não existe
  'proposta_enviada',
  'aguardando_assinatura',
  'em_auditoria',
  'aprovado',
  'certificado',
];
```

**❌ PROBLEMA:** Fluxo hardcoded não reflete nem as fases nem os status reais do sistema.

---

## 🔍 4. ANÁLISE DE INCONSISTÊNCIAS POR ATOR

### 4.1 EMPRESA

**O que a empresa vê:**

1. **Wizard de Cadastro:**
   - Fase: `cadastro_solicitacao`
   - Status: `rascunho`

2. **Após Submit:**
   - Fase: `cadastro_solicitacao` (mantém)
   - Status: `pendente`
   - Request: `enviado`

**Problema:** ❌ Empresa não tem visibilidade clara das fases seguintes

### 4.2 ANALISTA

**O que o analista vê:**

1. **Kanban Dashboard:**
   - Apenas 4 colunas (pendente, em_andamento, aguardando_documentos, concluido)
   - ❌ Não reflete as 8 fases reais

2. **Process Details:**
   - Timeline mostra as 8 fases corretas ✅
   - Botão "Avançar Fase" usa fluxo hardcoded ❌
   - Status mostrado pode não corresponder à fase atual ❌

**Problema:** ❌ Visão inconsistente entre Kanban e Details

### 4.3 AUDITOR

**O que o auditor vê:**

1. **Deveria ver processos na fase:**
   - `auditoria_agendada` (Fase 5)
   - `auditoria_realizada` (Fase 6)

2. **Status relevantes:**
   - `aguardando_auditoria`
   - `em_auditoria`

**Problema:** ❌ Não existe view específica para auditor

### 4.4 GESTOR

**O que o gestor vê:**

1. **Deveria ver processos na fase:**
   - `comite_tecnico` (Fase 7)
   - Todos os outros processos (visão geral)

2. **Status relevantes:**
   - `aprovado`
   - `reprovado`
   - `certificado`

**Problema:** ❌ Não existe dashboard específico para gestor

---

## 📋 5. MAPEAMENTO RECOMENDADO: FASES × STATUS

### Fase 1: Cadastro da Solicitação (EMPRESA)
**Status possíveis:**
- `rascunho` - Empresa preenchendo wizard
- `pendente` - Aguardando atribuição de analista

### Fase 2: Análise Documental (ANALISTA)
**Status possíveis:**
- `em_andamento` - Analista analisando
- `aguardando_documentos` - Falta documentação
- `analise_documental` - Documentos em análise

### Fase 3: Proposta Comercial (ANALISTA)
**Status possíveis:**
- `em_andamento` - Elaborando proposta
- `proposta_enviada` - Proposta enviada à empresa

### Fase 4: Contrato (ANALISTA)
**Status possíveis:**
- `em_andamento` - Preparando contrato
- `aguardando_assinatura` - Aguardando empresa assinar

### Fase 5: Auditoria Agendada (ANALISTA)
**Status possíveis:**
- `em_andamento` - Agendando auditoria
- `aguardando_auditoria` - Auditoria agendada

### Fase 6: Auditoria Realizada (AUDITOR)
**Status possíveis:**
- `em_auditoria` - Auditoria em execução
- `analise_tecnica` - Analisando resultados

### Fase 7: Comitê Técnico (ANALISTA + GESTOR)
**Status possíveis:**
- `em_andamento` - Comitê avaliando
- `aprovado` - Aprovado pelo comitê
- `reprovado` - Reprovado pelo comitê

### Fase 8: Certificado Emitido (SISTEMA)
**Status possíveis:**
- `certificado` - Certificado gerado

**Status Especiais (qualquer fase):**
- `cancelado` - Processo cancelado
- `suspenso` - Processo suspenso

---

## 🎯 6. PROBLEMAS CRÍTICOS IDENTIFICADOS

### 6.1 Problema #1: Status vs Fases
**Descrição:** Sistema mistura conceitos de "fase" e "status"

**Impacto:**
- Frontend confunde status com fases
- Kanban usa status, Timeline usa fases
- Lógica de transição inconsistente

**Recomendação:**
- ✅ Usar `currentPhase` como navegação principal (8 fases)
- ✅ Usar `status` como estado dentro da fase
- ✅ Criar mapeamento claro Fase → Status válidos

### 6.2 Problema #2: Kanban Simplificado Demais
**Descrição:** Kanban usa apenas 4 status de 16 disponíveis

**Impacto:**
- Analista não vê processos em outras fases
- Impossível diferenciar fases 3-7 no Kanban
- Perde informação valiosa

**Recomendação:**
- Opção A: Kanban baseado em FASES (8 colunas)
- Opção B: Kanban baseado em STATUS agrupados (6-8 colunas)
- Opção C: Kanban híbrido (Fases como grupos, status como cards)

### 6.3 Problema #3: Lógica de Transição Hardcoded
**Descrição:** Transições entre fases/status em múltiplos lugares

**Localização:**
- `process.service.ts` (backend) - Parcial
- `ProcessDetails.tsx` (frontend) - Hardcoded
- `AnalystDashboard.tsx` (frontend) - Implícita no drag & drop

**Impacto:**
- Mudanças requerem alterações em vários arquivos
- Risco de inconsistências
- Difícil manutenção

**Recomendação:**
- ✅ Centralizar lógica de transição no backend
- ✅ Criar endpoints para transições específicas
- ✅ Frontend apenas exibe e solicita transições

### 6.4 Problema #4: Status Inexistente
**Descrição:** Frontend usa `em_analise` que não existe no banco

**Impacto:**
- Erro ao tentar salvar
- Confusão de nomenclatura
- Possível perda de dados

**Recomendação:**
- ✅ Remover `em_analise`
- ✅ Usar `analise_documental` ou `analise_tecnica`
- ✅ Adicionar validação de status no backend

### 6.5 Problema #5: Falta de Views por Ator
**Descrição:** Apenas analista tem dashboard específico

**Impacto:**
- Auditor não tem view otimizada
- Gestor não tem view de decisões
- Empresa não vê progresso claramente

**Recomendação:**
- ✅ Dashboard para Auditor (fases 5-6)
- ✅ Dashboard para Gestor (fase 7 + overview)
- ✅ Melhorar dashboard da Empresa (progresso visual)

---

## 🔧 7. PLANO DE SINCRONIZAÇÃO RECOMENDADO

### Prioridade 1: CRÍTICO (Corrige erros)

1. **Remover status inexistente**
   - Arquivo: `ProcessDetails.tsx`
   - Ação: Substituir `em_analise` por `analise_documental`

2. **Adicionar validação de status**
   - Arquivo: `process.service.ts`
   - Ação: Validar que status existe no enum antes de salvar

3. **Corrigir fluxo hardcoded**
   - Arquivo: `ProcessDetails.tsx`
   - Ação: Remover array hardcoded, usar lógica baseada em fases

### Prioridade 2: ALTO (Melhora UX)

4. **Redesenhar Kanban do Analista**
   - Opção recomendada: Kanban baseado em FASES (8 colunas)
   - Cada coluna mostra processos naquela fase
   - Dentro de cada card, mostrar status atual

5. **Centralizar lógica de transição**
   - Criar service no backend: `ProcessPhaseTransitionService`
   - Implementar todas as 7 transições de fase
   - Validar pré-condições (docs assinados, auditoria concluída, etc.)

6. **Criar endpoints específicos**
   - `POST /processes/:id/advance-phase` - Avança para próxima fase
   - `POST /processes/:id/phases/:phase` - Vai para fase específica (gestor)
   - `PATCH /processes/:id/status` - Atualiza status dentro da fase

### Prioridade 3: MÉDIO (Completa funcionalidade)

7. **Dashboard do Auditor**
   - Filtrar processos nas fases 5 e 6
   - Ações: Iniciar auditoria, Finalizar auditoria, Registrar achados

8. **Dashboard do Gestor**
   - View de comitê técnico (fase 7)
   - Ações: Aprovar, Reprovar, Solicitar mais informações
   - Overview geral de todos os processos

9. **Melhorar Dashboard da Empresa**
   - Timeline visual das 8 fases
   - Indicador de fase atual
   - Próximos passos e pendências

### Prioridade 4: BAIXO (Otimizações)

10. **Histórico de fases**
    - Utilizar tabela `process_phase_history`
    - Registrar entrada/saída de cada fase
    - Calcular tempo médio por fase

11. **Notificações por fase**
    - Notificar empresa quando fase avança
    - Notificar analista quando docs são enviados
    - Notificar gestor quando processo chega ao comitê

12. **Métricas e Analytics**
    - Tempo médio por fase
    - Taxa de aprovação por fase
    - Gargalos identificados

---

## 📊 8. COMPARATIVO FINAL: ESTADO ATUAL

| Componente | Fases (8) | Status (16) | Sincronizado |
|------------|-----------|-------------|--------------|
| **Prisma Schema** | ✅ Definidos | ✅ Definidos | Referência |
| **Backend - Enums** | ✅ Sync | ✅ Sync | ✅ |
| **Backend - Service** | ⚠️ Parcial | ⚠️ Parcial | ⚠️ |
| **Frontend - Lib** | ✅ Sync | ✅ Sync | ✅ |
| **Frontend - Kanban** | ❌ Não usa | ❌ Usa 4/16 | ❌ |
| **Frontend - Details** | ✅ Usa | ❌ Usa 8/16 + 1 inválido | ❌ |

### Legenda:
- ✅ Sincronizado
- ⚠️ Parcialmente implementado
- ❌ Dessincronizado / Incorreto

---

## 📝 9. DECISÕES NECESSÁRIAS

Antes de implementar as correções, é necessário decidir:

### Decisão 1: Modelo de Kanban
**Opções:**
- A) Kanban por FASES (8 colunas) - Recomendado
- B) Kanban por STATUS agrupados (6-8 colunas)
- C) Kanban híbrido (Fases como swimlanes, status como colunas)

### Decisão 2: Transições Automáticas vs Manuais
**Opções:**
- A) Analista avança fases manualmente (controle total)
- B) Sistema avança automaticamente ao concluir ações (ex: contrato assinado → próxima fase)
- C) Híbrido (algumas automáticas, outras manuais)

### Decisão 3: Status "em_andamento"
**Pergunta:** Status `em_andamento` é válido para todas as fases ou precisa ser mais específico?
**Opções:**
- A) Manter `em_andamento` genérico
- B) Criar status específicos por fase (`analise_em_andamento`, `proposta_em_andamento`, etc.)
- C) Usar apenas status da lista atual (16)

### Decisão 4: Request vs Process
**Pergunta:** Manter separação entre Request.status e Process.status?
**Opções:**
- A) Manter separados (Request = status da solicitação, Process = status do processo)
- B) Unificar (usar apenas Process.status)
- C) Sincronizar (Request.status reflete automaticamente Process.status)

---

## ✅ 10. CONCLUSÕES

### Estado Atual:
1. ✅ **Enums de Fase**: Bem definidos e sincronizados
2. ✅ **Enums de Status**: Bem definidos no banco e backend
3. ❌ **Uso de Status**: Inconsistente no frontend
4. ❌ **Lógica de Transição**: Parcial e hardcoded
5. ❌ **Views por Ator**: Incompletas

### Riscos:
- **Alto:** Status inválido pode causar erros de persistência
- **Médio:** Kanban simplificado oculta processos importantes
- **Médio:** Lógica hardcoded dificulta manutenção
- **Baixo:** Falta de dashboards específicos por ator

### Próximos Passos:
1. Validar decisões com stakeholders
2. Implementar correções críticas (Prioridade 1)
3. Redesenhar Kanban (Prioridade 2)
4. Implementar dashboards específicos (Prioridade 3)
5. Otimizações e melhorias (Prioridade 4)

---

**Documento gerado em:** 2025-11-18
**Versão:** 1.0
**Próxima revisão:** Após implementação das correções críticas
