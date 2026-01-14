# Correção: Erro ao Aceitar Proposta

**Data**: 2025-12-09
**Erro**: `PUT /api/proposals/:id/respond 400 (Bad Request)`

---

## 🐛 Problema

Quando a empresa tentava aceitar uma proposta, o sistema retornava erro 400 (Bad Request).

**Erro no Console**:
```
PUT http://localhost:3333/api/proposals/.../respond 400 (Bad Request)
```

---

## 🔍 Causa Raiz

O serviço de proposta estava tentando atualizar a fase do processo para `'contrato'`, que é uma fase antiga que não existe no schema do Prisma.

**Código com Problema** (linha 306):
```typescript
await prisma.process.update({
  where: { id: proposal.processId },
  data: {
    currentPhase: 'contrato', // ❌ Fase não existe no schema
  },
});
```

O Prisma rejeita a operação porque `'contrato'` não é um valor válido do enum `ProcessPhase`.

---

## ✅ Solução

Atualizado para usar a fase correta do Prisma schema: `'elaboracao_contrato'`

**Arquivo**: `backend/src/modules/proposal/proposal.service.ts`

**Antes** (linha 301-308):
```typescript
// Se aceita, avança o processo para a fase de contrato
if (data.accepted) {
  await prisma.process.update({
    where: { id: proposal.processId },
    data: {
      currentPhase: 'contrato', // ❌ ERRO
    },
  });
}
```

**Depois** (linha 301-308):
```typescript
// Se aceita, avança o processo para a fase de elaboração de contrato
if (data.accepted) {
  await prisma.process.update({
    where: { id: proposal.processId },
    data: {
      currentPhase: 'elaboracao_contrato', // ✅ Fase correta
    },
  });
}
```

---

## 🔄 Fluxo Correto Após Aceitação

### Antes da Correção
```
1. Analista envia proposta → status: 'enviada'
2. Empresa aceita proposta → ❌ ERRO 400
   └─ Tentava mudar fase para 'contrato' (não existe)
```

### Depois da Correção
```
1. Analista envia proposta → status: 'enviada'
2. Empresa aceita proposta → ✅ SUCESSO
   ├─ Proposta: status muda para 'aceita'
   └─ Processo: currentPhase muda para 'elaboracao_contrato'
3. Analista pode elaborar contrato
```

---

## 📊 Fases do Prisma Schema

| Fase Antiga (Errada) | Fase Nova (Correta) | Ordem |
|---------------------|---------------------|-------|
| ❌ `contrato` | ✅ `elaboracao_contrato` | 7 |
| - | ✅ `assinatura_contrato` | 8 |

**Fases de Contrato no Schema**:
1. `elaboracao_contrato` - Analista elabora o contrato
2. `assinatura_contrato` - Empresa assina o contrato

---

## 🧪 Como Testar

### Teste 1: Aceitar Proposta
1. Como analista, crie e envie uma proposta
2. Como empresa, visualize a proposta
3. ✅ Clique em "Aceitar Proposta"
4. ✅ Verifique que não há erro 400
5. ✅ Status da proposta muda para `aceita`
6. ✅ Fase do processo muda para `elaboracao_contrato`

### Teste 2: Recusar Proposta
1. Como analista, crie e envie uma proposta
2. Como empresa, visualize a proposta
3. ✅ Clique em "Recusar Proposta"
4. ✅ Status da proposta muda para `recusada`
5. ✅ Fase do processo permanece em `elaboracao_proposta`
6. ✅ Analista pode ajustar e reenviar

---

## 📝 Mudanças Relacionadas

Esta correção faz parte de uma série de atualizações para alinhar o código com o novo schema de 17 fases:

1. ✅ [CORRECOES-DASHBOARD-TIMELINE-COMMENTS.md](CORRECOES-DASHBOARD-TIMELINE-COMMENTS.md) - Dashboard e timeline
2. ✅ [CORRECAO-PROPOSTA-RECUSADA.md](CORRECAO-PROPOSTA-RECUSADA.md) - Ajuste de propostas recusadas
3. ✅ **Este arquivo** - Aceitar proposta

---

## 🎯 Resultado

Agora o fluxo completo de proposta funciona corretamente:

1. ✅ Analista cria e calcula proposta
2. ✅ Analista ajusta valores (opcional)
3. ✅ Analista envia proposta
4. ✅ Empresa pode aceitar → processo avança para `elaboracao_contrato`
5. ✅ Empresa pode recusar → analista pode ajustar e reenviar
6. ✅ Suporta múltiplas rodadas de negociação

**Status da Correção**: ✅ **COMPLETO**
