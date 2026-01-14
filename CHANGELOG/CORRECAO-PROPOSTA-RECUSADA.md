# Correção: Permitir Ajuste e Reenvio de Propostas Recusadas

**Data**: 2025-12-09
**Problema**: Quando a empresa recusa uma proposta, o analista não conseguia ajustá-la e reenviar.

---

## 🐛 Problema Identificado

Quando uma empresa recusava uma proposta:
- ❌ O sistema não permitia que o analista ajustasse a proposta
- ❌ Não era possível reenviar a proposta após ajuste
- ❌ Erro exibido: "Proposta já foi enviada e não pode ser ajustada"

Isso quebrava o fluxo normal de negociação:
1. Analista envia proposta → `status: 'enviada'`
2. Empresa recusa proposta → `status: 'recusada'`
3. Analista deveria poder ajustar valores e reenviar → ❌ **BLOQUEADO**

---

## ✅ Solução Implementada

### 1. Backend - Permitir Ajuste em Propostas Recusadas

**Arquivo**: `backend/src/modules/proposal/proposal.service.ts`

**Antes** (linha 186-188):
```typescript
if (proposal.status !== 'calculada' && proposal.status !== 'rascunho') {
  throw new Error('Proposta já foi enviada e não pode ser ajustada');
}
```

**Depois** (linha 186-190):
```typescript
// Permite ajuste em: rascunho, calculada, e recusada (para poder reenviar após recusa)
const allowedStatuses = ['rascunho', 'calculada', 'recusada'];
if (!allowedStatuses.includes(proposal.status)) {
  throw new Error('Proposta já foi aceita e não pode ser ajustada');
}
```

**Status que permitem ajuste**:
- ✅ `rascunho` - Proposta ainda não foi calculada
- ✅ `calculada` - Proposta calculada mas ainda não enviada
- ✅ `recusada` - Proposta foi recusada pela empresa (NOVO!)

**Status que NÃO permitem ajuste**:
- ❌ `enviada` - Proposta aguardando resposta da empresa
- ❌ `aceita` - Proposta foi aceita pela empresa

---

### 2. Backend - Permitir Reenvio de Propostas Recusadas

**Arquivo**: `backend/src/modules/proposal/proposal.service.ts`

**Antes** (linha 240-242):
```typescript
if (proposal.status === 'enviada') {
  throw new Error('Proposta já foi enviada');
}
```

**Depois** (linha 240-243):
```typescript
// Permite reenviar propostas recusadas (após ajuste)
if (proposal.status === 'enviada' || proposal.status === 'aceita') {
  throw new Error('Proposta já foi enviada e ainda está aguardando resposta ou foi aceita');
}
```

**Status que permitem envio**:
- ✅ `rascunho` - Primeira vez enviando
- ✅ `calculada` - Primeira vez enviando
- ✅ `recusada` - Reenviando após recusa (NOVO!)

**Status que NÃO permitem envio**:
- ❌ `enviada` - Já está aguardando resposta
- ❌ `aceita` - Já foi aceita

---

### 3. Frontend - Mostrar Ajuste para Propostas Recusadas

**Arquivo**: `frontend/src/pages/analyst/ProcessProposal.tsx`

**Antes** (linha 237):
```typescript
{proposal && showAdjustment && proposal.status !== 'enviada' && (
```

**Depois** (linha 237):
```typescript
{proposal && showAdjustment && proposal.status !== 'enviada' && proposal.status !== 'aceita' && (
```

**Mudança**: Agora o componente de ajuste aparece para todos os status EXCETO `enviada` e `aceita`, permitindo ajustar propostas `recusada`.

---

### 4. Frontend - Botão de Reenvio para Propostas Recusadas

**Arquivo**: `frontend/src/pages/analyst/ProcessProposal.tsx`

**Antes** (linha 250):
```typescript
{proposal && proposal.status === 'calculada' && (
  <button onClick={handleSend}>
    📤 Enviar Proposta para Empresa
  </button>
)}
```

**Depois** (linha 250-258):
```typescript
{proposal && (proposal.status === 'calculada' || proposal.status === 'recusada') && (
  <button onClick={handleSend}>
    {proposal.status === 'recusada'
      ? '🔄 Reenviar Proposta para Empresa'
      : '📤 Enviar Proposta para Empresa'}
  </button>
)}
```

**Mudanças**:
- ✅ Botão aparece tanto para `calculada` quanto para `recusada`
- ✅ Texto do botão muda dinamicamente:
  - `calculada` → "📤 Enviar Proposta para Empresa"
  - `recusada` → "🔄 Reenviar Proposta para Empresa"

---

## 🔄 Fluxo Completo de Negociação

### Cenário 1: Proposta Aceita na Primeira Tentativa
```
1. Analista cria proposta → status: 'rascunho'
2. Analista calcula proposta → status: 'calculada'
3. Analista ajusta manualmente (opcional) → status: 'calculada'
4. Analista envia proposta → status: 'enviada'
5. Empresa aceita proposta → status: 'aceita' ✅
```

### Cenário 2: Proposta Recusada e Ajustada (CORRIGIDO!)
```
1. Analista cria proposta → status: 'rascunho'
2. Analista calcula proposta → status: 'calculada'
3. Analista envia proposta → status: 'enviada'
4. Empresa recusa proposta → status: 'recusada' ❌
5. Analista ajusta valores → status: 'recusada' ✅ (AGORA PERMITIDO!)
6. Analista reenvia proposta → status: 'enviada'
7. Empresa aceita proposta ajustada → status: 'aceita' ✅
```

### Cenário 3: Múltiplas Recusas
```
1. Proposta enviada → status: 'enviada'
2. Empresa recusa → status: 'recusada'
3. Analista ajusta → status: 'recusada'
4. Analista reenvia → status: 'enviada'
5. Empresa recusa novamente → status: 'recusada'
6. Analista ajusta novamente → status: 'recusada'
7. Analista reenvia → status: 'enviada'
8. Empresa aceita → status: 'aceita' ✅
```

---

## 🎯 Estados da Proposta

| Status | Pode Ajustar? | Pode Enviar? | Descrição |
|--------|---------------|--------------|-----------|
| `rascunho` | ✅ Sim | ✅ Sim | Proposta criada mas não calculada |
| `calculada` | ✅ Sim | ✅ Sim | Proposta calculada, pronta para enviar |
| `enviada` | ❌ Não | ❌ Não | Aguardando resposta da empresa |
| `recusada` | ✅ **SIM** | ✅ **SIM** | Empresa recusou, permite ajustar e reenviar |
| `aceita` | ❌ Não | ❌ Não | Empresa aceitou, proposta finalizada |

---

## 📝 Validações de Negócio

### Quando PODE ajustar:
- ✅ Status `rascunho`, `calculada`, ou `recusada`
- ✅ Analista autenticado
- ✅ Processo existe e está ativo

### Quando NÃO PODE ajustar:
- ❌ Status `enviada` (aguardando resposta)
- ❌ Status `aceita` (já foi aceita)
- ❌ Proposta não existe
- ❌ Usuário não é analista

### Quando PODE enviar/reenviar:
- ✅ Status `rascunho`, `calculada`, ou `recusada`
- ✅ Proposta foi calculada (tem valores)
- ✅ Analista autenticado

### Quando NÃO PODE enviar:
- ❌ Status `enviada` (já está aguardando)
- ❌ Status `aceita` (já foi aceita)
- ❌ Proposta não calculada
- ❌ Usuário não é analista

---

## 🧪 Como Testar

### Teste 1: Ajustar Proposta Recusada
1. Como analista, crie e envie uma proposta
2. Como empresa, recuse a proposta
3. Como analista, acesse a proposta
4. ✅ Verifique que o componente de "Ajuste Manual" está visível
5. ✅ Ajuste o valor (ex: desconto de R$ 500)
6. ✅ Adicione justificativa
7. ✅ Clique em "Aplicar Ajuste"
8. ✅ Verifique que não há erro 400
9. ✅ Valores devem ser atualizados

### Teste 2: Reenviar Proposta Recusada
1. Após ajustar (Teste 1)
2. ✅ Verifique que aparece botão "🔄 Reenviar Proposta para Empresa"
3. ✅ Clique no botão
4. ✅ Status deve mudar de `recusada` para `enviada`
5. ✅ Nova validade de 30 dias deve ser definida

### Teste 3: Múltiplas Recusas e Ajustes
1. Envie proposta
2. Empresa recusa
3. Ajuste valores
4. Reenvie
5. Empresa recusa novamente
6. ✅ Verifique que pode ajustar novamente
7. ✅ Verifique que pode reenviar novamente

### Teste 4: Proposta Aceita Não Pode Ser Ajustada
1. Envie proposta
2. Empresa aceita
3. ✅ Verifique que componente de ajuste NÃO aparece
4. ✅ Verifique que botão de enviar NÃO aparece
5. ✅ Tente ajustar via API → deve retornar erro

---

## 📊 Impacto

### Funcionalidades Afetadas
- ✅ Ajuste manual de propostas
- ✅ Envio de propostas
- ✅ Fluxo de negociação analista-empresa
- ✅ Interface de gerenciamento de propostas

### Compatibilidade
- ✅ Mantém compatibilidade com propostas existentes
- ✅ Não quebra fluxos já implementados
- ✅ Apenas adiciona nova possibilidade (ajustar recusadas)

### Performance
- ✅ Sem impacto em performance
- ✅ Mesmas queries do banco de dados
- ✅ Apenas mudança em validações

---

## 🎉 Resultado

Agora o sistema permite um fluxo de negociação completo:
- ✅ Analista pode ajustar propostas recusadas
- ✅ Analista pode reenviar após ajuste
- ✅ Mensagens de erro mais claras
- ✅ Interface indica claramente quando é reenvio
- ✅ Suporta múltiplas rodadas de negociação

**Status da Correção**: ✅ **COMPLETO**
