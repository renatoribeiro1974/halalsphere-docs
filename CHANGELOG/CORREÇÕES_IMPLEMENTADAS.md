# Correções Implementadas - Fluxo de Fases

## 📋 Resumo

O fluxo de fases e status do processo de certificação foi corrigido para funcionar corretamente conforme as 8 fases definidas no PRD.

## ✅ Mudanças Implementadas

### 1. Schema do Prisma (`backend/prisma/schema.prisma`)

**Adicionado `rascunho` ao enum `ProcessStatus`:**
```prisma
enum ProcessStatus {
  rascunho              // ✨ NOVO - Empresa preenchendo wizard
  pendente              // Aguardando atribuição de analista
  em_andamento          // Processo em análise ativa
  aguardando_documentos // Faltam documentos
  // ... outros status
}
```

### 2. Backend - Service (`backend/src/modules/process/process.service.ts`)

#### ✨ Correção na criação do processo
```typescript
// ANTES: status: 'pendente'
// AGORA: status: 'rascunho'

const process = await tx.process.create({
  data: {
    requestId: request.id,
    status: 'rascunho',              // ✅ Empresa ainda preenchendo
    currentPhase: 'cadastro_solicitacao', // ✅ Fase 1
  },
});
```

#### ✨ Novo método: `submitWizard()`
Finaliza o wizard da empresa e torna o processo visível para analistas:

```typescript
async submitWizard(requestId: string): Promise<ProcessResponse> {
  // Valida que processo está na fase correta
  // Muda status: rascunho → pendente
  // Fase continua: cadastro_solicitacao
  // Request.status: enviado
  // Processo agora aparece no dashboard do analista
}
```

#### ✨ Atualização no `assignAnalyst()`
Transição automática da Fase 1 para Fase 2:

```typescript
// Quando gestor atribui analista a processo pendente:
if (currentPhase === 'cadastro_solicitacao' && status === 'pendente') {
  // Transição automática:
  currentPhase = 'analise_documental';  // Fase 1 → Fase 2
  status = 'em_andamento';               // pendente → em_andamento
}
```

### 3. Backend - Controller (`backend/src/modules/process/process.controller.ts`)

#### ✨ Novo endpoint: `submitWizard()`
```typescript
POST /api/processes/:id/submit
Authorization: Bearer [empresa_token]

// Apenas empresas podem finalizar suas próprias solicitações
// Valida que a empresa é dona do processo
// Chama processService.submitWizard()
```

### 4. Backend - Routes (`backend/src/modules/process/process.routes.ts`)

#### ✨ Nova rota registrada
```typescript
fastify.post('/:id/submit', submitWizard);
```

### 5. Frontend - Dashboard do Analista (`frontend/src/pages/analyst/AnalystDashboard.tsx`)

#### ✨ Colunas do Kanban atualizadas

**ANTES:**
- Aguardando Documentos
- Análise Documental
- Análise Técnica
- Aguardando Auditoria

**AGORA:**
- 🟡 **Aguardando Início** (`pendente`) - Processos que empresas finalizaram
- 🔵 **Em Andamento** (`em_andamento`) - Processos em análise ativa
- 🟠 **Aguardando Docs** (`aguardando_documentos`) - Faltam documentos
- 🟢 **Concluídos** (`concluido`) - Processos finalizados

#### ✨ Métricas atualizadas
```typescript
stats: {
  total: number;
  pendente: number;           // ✨ NOVO
  em_andamento: number;       // ✨ NOVO
  aguardando_documentos: number;
  concluido: number;          // ✨ NOVO
}
```

### 6. Banco de Dados

#### ✨ Migration criada e aplicada
```sql
-- Migration: 20251118_add_rascunho_status
ALTER TYPE "ProcessStatus" ADD VALUE IF NOT EXISTS 'rascunho';
```

## 🔄 Fluxo Completo Corrigido

### Fase 1: Cadastro da Solicitação

```
1. Empresa cria processo via wizard
   ├─ Process.status = 'rascunho'
   ├─ Process.currentPhase = 'cadastro_solicitacao'
   └─ Processo NÃO aparece para analistas

2. Empresa preenche múltiplos passos
   └─ Status permanece 'rascunho'

3. Empresa clica "Finalizar" no último passo
   ├─ POST /api/processes/:id/submit
   ├─ Process.status = 'pendente'
   ├─ Process.currentPhase = 'cadastro_solicitacao' (continua)
   ├─ Request.status = 'enviado'
   └─ ✅ Processo AGORA aparece no dashboard do analista (coluna "Aguardando Início")
```

### Transição: Atribuição de Analista

```
4. Gestor atribui analista ao processo pendente
   ├─ POST /api/processes/:id/assign
   ├─ Process.analystId = [uuid]
   ├─ Process.status = 'em_andamento'
   ├─ Process.currentPhase = 'analise_documental'
   └─ ✅ Processo move para coluna "Em Andamento"
```

### Fase 2: Análise Documental

```
5. Analista trabalha no processo
   ├─ Se faltarem docs: status = 'aguardando_documentos'
   └─ Quando docs OK: avança para próxima fase
```

## 📝 Arquivos Modificados

1. ✅ [backend/prisma/schema.prisma](backend/prisma/schema.prisma) - Adicionado `rascunho` ao enum
2. ✅ [backend/src/modules/process/process.service.ts](backend/src/modules/process/process.service.ts) - Lógica corrigida
3. ✅ [backend/src/modules/process/process.controller.ts](backend/src/modules/process/process.controller.ts) - Novo endpoint
4. ✅ [backend/src/modules/process/process.routes.ts](backend/src/modules/process/process.routes.ts) - Nova rota
5. ✅ [frontend/src/pages/analyst/AnalystDashboard.tsx](frontend/src/pages/analyst/AnalystDashboard.tsx) - Kanban atualizado

## 📝 Arquivos Criados

1. ✅ [FLUXO_FASES_CORRIGIDO.md](FLUXO_FASES_CORRIGIDO.md) - Documentação detalhada
2. ✅ [backend/add-rascunho-status.ts](backend/add-rascunho-status.ts) - Script de migration
3. ✅ [backend/prisma/migrations/20251118_add_rascunho_status/migration.sql](backend/prisma/migrations/20251118_add_rascunho_status/migration.sql) - Migration SQL

## 🧪 Como Testar

### Teste 1: Wizard da Empresa
```bash
# 1. Login como empresa
POST /api/auth/login
{ "email": "empresa@example.com", "password": "..." }

# 2. Criar novo processo
POST /api/processes
{ /* dados do wizard */ }

# Verificar: status = 'rascunho', currentPhase = 'cadastro_solicitacao'

# 3. Finalizar wizard
POST /api/processes/:id/submit

# Verificar: status = 'pendente', currentPhase = 'cadastro_solicitacao'
```

### Teste 2: Dashboard do Analista
```bash
# 1. Login como analista
POST /api/auth/login
{ "email": "analista@halalsphere.com", "password": "..." }

# 2. Listar processos
GET /api/processes

# Verificar: processos com status 'pendente' aparecem na lista
# Verificar: processos com status 'rascunho' NÃO aparecem
```

### Teste 3: Atribuição de Analista
```bash
# 1. Login como gestor
POST /api/auth/login
{ "email": "gestor@halalsphere.com", "password": "..." }

# 2. Atribuir analista a processo pendente
POST /api/processes/:id/assign
{ "analystId": "uuid-do-analista" }

# Verificar:
# - status mudou de 'pendente' para 'em_andamento'
# - currentPhase mudou de 'cadastro_solicitacao' para 'analise_documental'
```

## ✅ Status das Correções

- ✅ Enum `ProcessStatus` atualizado no schema
- ✅ Migration criada e aplicada no banco
- ✅ Prisma Client regenerado
- ✅ Lógica de criação de processo corrigida
- ✅ Método `submitWizard()` implementado
- ✅ Endpoint `POST /api/processes/:id/submit` criado
- ✅ Transição automática na atribuição de analista
- ✅ Dashboard do analista atualizado
- ✅ Servidor backend rodando com sucesso
- ✅ Documentação criada

## 🎯 Próximos Passos

1. **Frontend**: Implementar botão "Finalizar" no último passo do wizard
2. **Frontend**: Fazer chamada ao endpoint `/api/processes/:id/submit`
3. **Frontend**: Adicionar feedback visual de sucesso
4. **Testes**: Testar fluxo completo end-to-end
5. **Gestor**: Implementar tela de atribuição de analistas
6. **Fases 3-8**: Implementar transições para as demais fases

## 🐛 Problemas Resolvidos

1. ✅ Processo iniciava com status `pendente` em vez de `rascunho`
2. ✅ Analista não conseguia ver processos recém-criados
3. ✅ Não havia transição clara entre Fase 1 e Fase 2
4. ✅ Dashboard do analista mostrava colunas incorretas
5. ✅ Faltava endpoint para finalizar o wizard
6. ✅ Prisma Client estava desatualizado
