# 🔍 Análise: Fases vs Status do Quadro Kanban

**Data:** 2025-12-17
**Status:** ⚠️ PROBLEMA IDENTIFICADO - Inconsistência entre fases

## 📊 Problema Identificado

Os processos **desaparecem do quadro Kanban** porque existe uma **incompatibilidade crítica** entre:
1. As **17 fases detalhadas** definidas no Prisma Schema
2. As **8 fases simplificadas** do backend (process.phases.ts)
3. As **17 fases mapeadas** no frontend (process-phases.ts)
4. As **4 colunas Kanban** que agrupam fases

---

## 🗂️ DE-PARA Completo das Fases

### 1️⃣ **Fases no Prisma Schema** (17 fases - fonte da verdade)
```prisma
enum ProcessPhase {
  // FLUXO COMERCIAL
  cadastro_solicitacao           // 1
  analise_documental_inicial     // 2
  elaboracao_proposta            // 3
  negociacao_proposta            // 4
  proposta_aprovada              // 5
  elaboracao_contrato            // 6
  assinatura_contrato            // 7

  // FLUXO OPERACIONAL
  avaliacao_documental           // 8
  planejamento_auditoria         // 9
  auditoria_estagio1             // 10
  auditoria_estagio2             // 11
  analise_nao_conformidades      // 12
  correcao_nao_conformidades     // 13
  validacao_correcoes            // 14
  comite_tecnico                 // 15
  emissao_certificado            // 16
  certificado_emitido            // 17
}
```

### 2️⃣ **Fases no Backend** (process.phases.ts - ❌ ERRADO: 8 fases)
```typescript
enum ProcessPhase {
  CADASTRO_SOLICITACAO = 'cadastro_solicitacao',        // 1
  ANALISE_DOCUMENTAL = 'analise_documental',            // ❌ NÃO EXISTE NO PRISMA
  PROPOSTA_COMERCIAL = 'proposta_comercial',            // ❌ NÃO EXISTE NO PRISMA
  CONTRATO = 'contrato',                                // ❌ NÃO EXISTE NO PRISMA
  AUDITORIA_AGENDADA = 'auditoria_agendada',            // ❌ NÃO EXISTE NO PRISMA
  AUDITORIA_REALIZADA = 'auditoria_realizada',          // ❌ NÃO EXISTE NO PRISMA
  COMITE_TECNICO = 'comite_tecnico',                    // 15
  CERTIFICADO_EMITIDO = 'certificado_emitido',          // 17
}
```
**❌ PROBLEMA:** Usa nomes de fases que **não existem** no Prisma Schema!

### 3️⃣ **Mapeamento no Frontend** (process-phases.ts - ✅ CORRETO)
```typescript
// 4 grupos macro (colunas do Kanban)
export enum ProcessPhase {
  CADASTRO_DOCUMENTACAO = 'cadastro_documentacao',
  PROPOSTA_CONTRATO = 'proposta_contrato',
  AUDITORIAS = 'auditorias',
  FINALIZACAO = 'finalizacao',
}

// Mapeamento das 17 fases do Prisma para 4 grupos
export const BACKEND_TO_MACRO_PHASE: Record<string, ProcessPhase> = {
  // Grupo 1: Cadastro e Documentação (Fases 1-3 + 8)
  'cadastro_solicitacao': CADASTRO_DOCUMENTACAO,
  'analise_documental_inicial': CADASTRO_DOCUMENTACAO,
  'avaliacao_documental': CADASTRO_DOCUMENTACAO,

  // Grupo 2: Proposta e Contrato (Fases 3-7)
  'elaboracao_proposta': PROPOSTA_CONTRATO,
  'negociacao_proposta': PROPOSTA_CONTRATO,
  'proposta_aprovada': PROPOSTA_CONTRATO,
  'elaboracao_contrato': PROPOSTA_CONTRATO,
  'assinatura_contrato': PROPOSTA_CONTRATO,

  // Grupo 3: Auditorias (Fases 9-14)
  'planejamento_auditoria': AUDITORIAS,
  'auditoria_estagio1': AUDITORIAS,
  'auditoria_estagio2': AUDITORIAS,
  'analise_nao_conformidades': AUDITORIAS,
  'correcao_nao_conformidades': AUDITORIAS,
  'validacao_correcoes': AUDITORIAS,

  // Grupo 4: Finalização (Fases 15-17)
  'comite_tecnico': FINALIZACAO,
  'emissao_certificado': FINALIZACAO,
  'certificado_emitido': FINALIZACAO,
};
```

### 4️⃣ **Colunas do Kanban** (AnalystDashboard.tsx)
```typescript
const COLUMNS = [
  {
    id: 'inicial',
    title: 'Cadastro e Documentação',
    subtitle: 'Fases 1-3',
    phases: [
      'cadastro_solicitacao',          // ✅ Existe no Prisma
      'analise_documental_inicial',    // ✅ Existe no Prisma
      'avaliacao_documental'            // ✅ Existe no Prisma
    ]
  },
  {
    id: 'comercial',
    title: 'Proposta e Contrato',
    subtitle: 'Fases 4-8',
    phases: [
      'elaboracao_proposta',           // ✅ Existe no Prisma
      'negociacao_proposta',           // ✅ Existe no Prisma
      'proposta_aprovada',             // ✅ Existe no Prisma
      'elaboracao_contrato',           // ✅ Existe no Prisma
      'assinatura_contrato'            // ✅ Existe no Prisma
    ]
  },
  {
    id: 'auditoria',
    title: 'Auditoria',
    subtitle: 'Fases 9-14',
    phases: [
      'planejamento_auditoria',        // ✅ Existe no Prisma
      'auditoria_estagio1',            // ✅ Existe no Prisma
      'auditoria_estagio2',            // ✅ Existe no Prisma
      'analise_nao_conformidades',     // ✅ Existe no Prisma
      'correcao_nao_conformidades',    // ✅ Existe no Prisma
      'validacao_correcoes'            // ✅ Existe no Prisma
    ]
  },
  {
    id: 'finalizacao',
    title: 'Finalização',
    subtitle: 'Fases 15-17',
    phases: [
      'comite_tecnico',                // ✅ Existe no Prisma
      'emissao_certificado',           // ✅ Existe no Prisma
      'certificado_emitido'            // ✅ Existe no Prisma
    ]
  }
];
```

---

## ⚠️ Onde os Processos "Somem"

### Cenário do Problema:
1. **Backend** retorna um processo com `currentPhase = "analise_documental_inicial"`
2. **Frontend** recebe esse valor e tenta mapear para a coluna do Kanban
3. **AnalystDashboard** filtra processos por fase: `phases.includes(p.currentPhase)`
4. ✅ **Funciona** porque `"analise_documental_inicial"` está na lista de `phases` da coluna "inicial"

### Mas quando o backend usa as fases ERRADAS:
Se o backend (por engano) usar as 8 fases do `process.phases.ts`:
- `analise_documental` → ❌ Não está em nenhuma coluna do Kanban → **processo some!**
- `proposta_comercial` → ❌ Não está em nenhuma coluna do Kanban → **processo some!**
- `contrato` → ❌ Não está em nenhuma coluna do Kanban → **processo some!**
- `auditoria_agendada` → ❌ Não está em nenhuma coluna do Kanban → **processo some!**
- `auditoria_realizada` → ❌ Não está em nenhuma coluna do Kanban → **processo some!**

---

## 🎯 Tabela DE-PARA Completa

| # | Fase Prisma (VERDADE) | Backend process.phases.ts | Frontend Macro | Coluna Kanban | Status |
|---|---|---|---|---|---|
| 1 | `cadastro_solicitacao` | ✅ `CADASTRO_SOLICITACAO` | `CADASTRO_DOCUMENTACAO` | inicial | ✅ OK |
| 2 | `analise_documental_inicial` | ❌ - | `CADASTRO_DOCUMENTACAO` | inicial | ⚠️ Falta no backend |
| 3 | `elaboracao_proposta` | ❌ `PROPOSTA_COMERCIAL` | `PROPOSTA_CONTRATO` | comercial | ⚠️ Nome diferente |
| 4 | `negociacao_proposta` | ❌ `PROPOSTA_COMERCIAL` | `PROPOSTA_CONTRATO` | comercial | ⚠️ Agrupa com #3 |
| 5 | `proposta_aprovada` | ❌ - | `PROPOSTA_CONTRATO` | comercial | ⚠️ Falta no backend |
| 6 | `elaboracao_contrato` | ❌ `CONTRATO` | `PROPOSTA_CONTRATO` | comercial | ⚠️ Nome diferente |
| 7 | `assinatura_contrato` | ❌ `CONTRATO` | `PROPOSTA_CONTRATO` | comercial | ⚠️ Agrupa com #6 |
| 8 | `avaliacao_documental` | ❌ - | `CADASTRO_DOCUMENTACAO` | inicial | ⚠️ Falta no backend |
| 9 | `planejamento_auditoria` | ❌ `AUDITORIA_AGENDADA` | `AUDITORIAS` | auditoria | ⚠️ Nome diferente |
| 10 | `auditoria_estagio1` | ❌ `AUDITORIA_REALIZADA` | `AUDITORIAS` | auditoria | ⚠️ Nome diferente |
| 11 | `auditoria_estagio2` | ❌ `AUDITORIA_REALIZADA` | `AUDITORIAS` | auditoria | ⚠️ Agrupa com #10 |
| 12 | `analise_nao_conformidades` | ❌ - | `AUDITORIAS` | auditoria | ⚠️ Falta no backend |
| 13 | `correcao_nao_conformidades` | ❌ - | `AUDITORIAS` | auditoria | ⚠️ Falta no backend |
| 14 | `validacao_correcoes` | ❌ - | `AUDITORIAS` | auditoria | ⚠️ Falta no backend |
| 15 | `comite_tecnico` | ✅ `COMITE_TECNICO` | `FINALIZACAO` | finalizacao | ✅ OK |
| 16 | `emissao_certificado` | ❌ - | `FINALIZACAO` | finalizacao | ⚠️ Falta no backend |
| 17 | `certificado_emitido` | ✅ `CERTIFICADO_EMITIDO` | `FINALIZACAO` | finalizacao | ✅ OK |

---

## 🔴 Root Cause (Causa Raiz)

### Arquivo Problemático:
**`backend/src/modules/process/process.phases.ts`**

Este arquivo:
1. ❌ Define um `enum ProcessPhase` com **8 fases** que conflitam com o Prisma
2. ❌ Usa nomes de fases que **não existem** no schema (`analise_documental`, `proposta_comercial`, etc)
3. ❌ Agrupa múltiplas fases do Prisma em uma única fase simplificada
4. ⚠️ Isso causa confusão pois o Prisma já tem seu próprio enum `ProcessPhase` com 17 fases

### Arquivo Correto (mas subutilizado):
**`backend/src/modules/process/process-transition.service.ts`**

Este arquivo:
1. ✅ Usa corretamente `ProcessPhase` do Prisma (`@prisma/client`)
2. ✅ Define `PHASE_ORDER` com as **17 fases corretas**
3. ✅ Implementa toda a lógica de transição de fases
4. ✅ Está sincronizado com o schema do banco de dados

---

## 🛠️ Solução Proposta

### Opção 1: DELETAR `process.phases.ts` (Recomendado)
```bash
# Remover arquivo conflitante
rm backend/src/modules/process/process.phases.ts
```

**Impacto:**
- Qualquer código que importa deste arquivo precisará ser atualizado para usar:
  - `ProcessPhase` do Prisma (`@prisma/client`)
  - Funções de `process-transition.service.ts`

### Opção 2: Renomear para evitar conflito
```typescript
// Renomear enum para não conflitar
export enum ProcessPhaseMacro {
  CADASTRO_SOLICITACAO = 'cadastro_solicitacao',
  // ...
}
```

### Opção 3: Manter apenas como documentação
```typescript
/**
 * @deprecated Use ProcessPhase from @prisma/client
 * Este arquivo é mantido apenas para referência histórica
 */
```

---

## ✅ Checklist de Correção

- [ ] **1. Auditoria de Código**
  - [ ] Buscar todos os imports de `./process.phases` no backend
  - [ ] Identificar onde as 8 fases são usadas

- [ ] **2. Migração**
  - [ ] Substituir imports para usar `@prisma/client`
  - [ ] Usar funções de `process-transition.service.ts`

- [ ] **3. Validação**
  - [ ] Verificar que todos os processos aparecem no Kanban
  - [ ] Testar transições de fase
  - [ ] Validar logs de erros

- [ ] **4. Limpeza**
  - [ ] Remover `process.phases.ts`
  - [ ] Atualizar documentação

---

## 📝 Comandos para Diagnóstico

### Verificar quais fases estão no banco:
```sql
SELECT DISTINCT current_phase, COUNT(*)
FROM processes
GROUP BY current_phase
ORDER BY current_phase;
```

### Buscar usos do arquivo problemático:
```bash
grep -r "from.*process\.phases" backend/src/
grep -r "import.*ProcessPhase" backend/src/
```

### Validar se processos estão sumindo:
```typescript
// No AnalystDashboard, adicionar log:
console.log('Processos recebidos:', processes.map(p => ({
  id: p.id,
  phase: p.currentPhase,
  column: COLUMNS.find(c => c.phases.includes(p.currentPhase))?.id || 'NENHUMA'
})));
```

---

## 🎓 Lições Aprendidas

1. **Prisma Schema é a fonte da verdade**
   - Sempre usar os enums definidos no Prisma
   - Não criar enums paralelos que conflitem

2. **Simplicidade no frontend**
   - Frontend agrupa fases em "macro fases" para UI
   - Backend trabalha com fases detalhadas do Prisma

3. **Validação de consistência**
   - Toda fase no backend deve existir no Prisma
   - Todo filtro no frontend deve cobrir todas as fases do Prisma

---

**Próximo passo:** Revisar e corrigir imports no backend para usar o enum correto do Prisma.
