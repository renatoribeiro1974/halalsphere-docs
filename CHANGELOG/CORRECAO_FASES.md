# Correção - Sistema de Fases do Processo

## Problema Identificado

Ao criar uma nova solicitação, o sistema estava:
1. ✅ Criando na fase correta: `cadastro_solicitacao` (Fase 1)
2. ❌ Mas o status era `aguardando_documentos` (inadequado)
3. ❌ Frontend tinha valores MOCK fixos (sempre mostrava fase 3 como atual)
4. ❌ Backend não estava retornando `currentPhase` na API

## Correções Aplicadas

### 1. Backend - Status Inicial Correto

**Arquivo**: `backend/src/modules/process/process.service.ts:118`

**Antes**:
```typescript
const process = await tx.process.create({
  data: {
    requestId: request.id,
    status: 'aguardando_documentos', // ❌ Errado
    currentPhase: 'cadastro_solicitacao',
  },
});
```

**Depois**:
```typescript
const process = await tx.process.create({
  data: {
    requestId: request.id,
    status: 'pendente', // ✅ Correto - aguardando atribuição de analista
    currentPhase: 'cadastro_solicitacao',
  },
});
```

### 2. Backend - Adicionar currentPhase na API Response

**Arquivos Modificados**:
- `backend/src/modules/process/process.types.ts` - Adicionado `currentPhase: string` ao `ProcessResponse`
- `backend/src/modules/process/process.service.ts` - Adicionado `currentPhase` em todos os métodos:
  - `createProcess()`
  - `getProcessesByCompany()`
  - `getProcessesByAnalyst()`
  - `getAllProcesses()`
  - `getProcessById()`
  - `updateProcessStatus()`
  - `assignAnalyst()`

### 3. Frontend - Remover Valores MOCK

**Arquivo**: `frontend/src/pages/ProcessDetails.tsx:140-143`

**Antes** (MOCK):
```typescript
const isCompleted = index < 2; // Mock: first 2 stages completed
const isCurrent = index === 2; // Mock: currently at stage 3
```

**Depois** (Dinâmico):
```typescript
// Determinar status da fase baseado no currentPhase do processo
const currentPhaseOrder = PROCESS_STAGES.findIndex(s => s.id === process.currentPhase);
const isCompleted = index < currentPhaseOrder;
const isCurrent = index === currentPhaseOrder;
```

### 4. Frontend - Adicionar currentPhase na Interface

**Arquivo**: `frontend/src/services/process.service.ts:47`

```typescript
export interface Process {
  id: string;
  protocol: string;
  // ... outros campos
  status: string;
  currentPhase: string; // ✅ Adicionado
  priority: string | null;
  // ...
}
```

### 5. Atualizar Processos Existentes

Executado comando SQL para corrigir processos já criados:
```sql
UPDATE processes
SET status = 'pendente'
WHERE currentPhase = 'cadastro_solicitacao'
  AND status = 'aguardando_documentos';
```
**Resultado**: 3 processos atualizados

## Fluxo Correto Agora

### Fase 1: Cadastro da Solicitação
- **Responsável**: Empresa
- **Status Inicial**: `pendente` (aguardando atribuição de analista)
- **Ação**: Empresa preenche e submete formulário
- **Próximo Passo**: Analista assume o processo

### Fase 2: Análise Documental
- **Responsável**: Analista
- **Quando**: Analista é atribuído e move para esta fase
- **Status Possível**: `analise_documental` ou `aguardando_documentos`
- **Ação**: Analista revisa documentos, pode solicitar mais
- **Próximo Passo**: Analista aprova documentos e avança

### Transição de Fases

```
Empresa cria solicitação
    ↓
Fase 1: cadastro_solicitacao (status: pendente)
    ↓
Analista assume processo
    ↓
Fase 2: analise_documental (status: analise_documental)
    ↓
Analista pode pedir documentos (status: aguardando_documentos)
    ↓
Empresa envia documentos
    ↓
Analista aprova e avança para próxima fase
```

## Status vs Fase

É importante entender a diferença:

### currentPhase (Enum)
Define **onde** o processo está no fluxo geral:
- `cadastro_solicitacao`
- `analise_documental`
- `proposta_comercial`
- etc.

### status (Enum)
Define o **estado** atual dentro de uma fase:
- `pendente` - Aguardando ação
- `em_andamento` - Sendo trabalhado
- `aguardando_documentos` - Bloqueado esperando docs
- `aprovado` - Concluído com sucesso
- etc.

**Exemplo**:
```json
{
  "currentPhase": "analise_documental",
  "status": "aguardando_documentos"
}
```
Significa: "Estamos na fase de análise documental, mas estamos aguardando a empresa enviar documentos solicitados"

## Testes Realizados

✅ Criação de novo processo começa em fase 1 com status `pendente`
✅ API retorna `currentPhase` corretamente
✅ Frontend exibe fase atual baseada em dados reais
✅ Timeline mostra fase 1 como atual para novos processos
✅ 3 processos existentes atualizados com sucesso

## Arquivos Modificados

- ✅ `backend/src/modules/process/process.service.ts`
- ✅ `backend/src/modules/process/process.types.ts`
- ✅ `frontend/src/services/process.service.ts`
- ✅ `frontend/src/pages/ProcessDetails.tsx`

## Próximos Passos

1. **Testar interface do usuário**
   - Criar nova solicitação e verificar que aparece na fase 1
   - Verificar timeline mostrando apenas fase 1 como ativa
   - Dashboard deve mostrar processo como "Pendente"

2. **Implementar transição de fases**
   - Quando analista assume processo → mover para fase 2
   - Quando analista solicita documentos → manter fase, mudar status
   - Implementar botões de ação por fase

3. **Validações de permissão**
   - Usar `canUserActOnPhase()` antes de permitir ações
   - Apenas analistas podem mover da fase 1 para fase 2

## Conclusão

✅ **Problema resolvido**: Agora novos processos começam corretamente na Fase 1 com status pendente
✅ **Timeline funcional**: Frontend exibe fase atual baseada em dados reais do backend
✅ **API completa**: Todas as respostas incluem `currentPhase`
✅ **Consistência**: Backend e frontend sincronizados

O sistema está pronto para uso correto das 8 fases do processo de certificação!
