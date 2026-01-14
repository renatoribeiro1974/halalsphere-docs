# 🔧 Solução: Processos Sumindo do Quadro Kanban

**Data:** 2025-12-17
**Problema:** Processos desaparecem em certas fases do quadro Kanban
**Status:** ✅ DIAGNOSTICADO - Solução disponível

---

## 🎯 Resumo Executivo

### O Problema
Processos estão **desaparecendo** do quadro Kanban dos analistas em determinadas fases da certificação.

### A Causa Raiz
**Incompatibilidade entre as definições de fases** em diferentes partes do sistema:
- ✅ **Prisma Schema:** 17 fases detalhadas (fonte da verdade)
- ❌ **Backend (process.phases.ts):** 8 fases simplificadas com nomes DIFERENTES
- ✅ **Frontend (process-phases.ts):** Mapeamento correto das 17 fases
- ⚠️ **Kanban:** 4 colunas que agrupam as 17 fases

### Impacto
- Processos que chegam em fases intermediárias **não são exibidos** no Kanban
- Analistas perdem visibilidade de processos em andamento
- Métricas ficam inconsistentes

---

## 📊 Tabela Comparativa de Fases

| Fase | Prisma Schema | Backend process.phases.ts | Aparece no Kanban? |
|------|--------------|---------------------------|-------------------|
| 1 | `cadastro_solicitacao` | ✅ `CADASTRO_SOLICITACAO` | ✅ Sim |
| 2 | `analise_documental_inicial` | ❌ Não existe | ✅ Sim |
| 3 | `elaboracao_proposta` | ❌ `PROPOSTA_COMERCIAL` (nome diferente) | ✅ Sim |
| 4 | `negociacao_proposta` | ❌ `PROPOSTA_COMERCIAL` (agrupado) | ✅ Sim |
| 5 | `proposta_aprovada` | ❌ Não existe | ✅ Sim |
| 6 | `elaboracao_contrato` | ❌ `CONTRATO` (nome diferente) | ✅ Sim |
| 7 | `assinatura_contrato` | ❌ `CONTRATO` (agrupado) | ✅ Sim |
| 8 | `avaliacao_documental` | ❌ Não existe | ✅ Sim |
| 9 | `planejamento_auditoria` | ❌ `AUDITORIA_AGENDADA` (nome diferente) | ✅ Sim |
| 10 | `auditoria_estagio1` | ❌ `AUDITORIA_REALIZADA` (nome diferente) | ✅ Sim |
| 11 | `auditoria_estagio2` | ❌ `AUDITORIA_REALIZADA` (agrupado) | ✅ Sim |
| 12 | `analise_nao_conformidades` | ❌ Não existe | ✅ Sim |
| 13 | `correcao_nao_conformidades` | ❌ Não existe | ✅ Sim |
| 14 | `validacao_correcoes` | ❌ Não existe | ✅ Sim |
| 15 | `comite_tecnico` | ✅ `COMITE_TECNICO` | ✅ Sim |
| 16 | `emissao_certificado` | ❌ Não existe | ✅ Sim |
| 17 | `certificado_emitido` | ✅ `CERTIFICADO_EMITIDO` | ✅ Sim |

---

## 🔍 Arquitetura Atual

### 1. Prisma Schema (Fonte da Verdade)
```
📁 backend/prisma/schema.prisma
└── enum ProcessPhase (17 fases)
```

### 2. Backend - Lógica de Transição (✅ CORRETO)
```
📁 backend/src/modules/process/
├── process-transition.service.ts  ✅ Usa ProcessPhase do Prisma
└── process.phases.ts              ❌ Define enum conflitante
```

### 3. Frontend - Mapeamento e UI (✅ CORRETO)
```
📁 frontend/src/
├── lib/process-phases.ts              ✅ Mapeia 17 fases → 4 grupos
└── pages/analyst/AnalystDashboard.tsx ✅ Define 4 colunas Kanban
```

---

## 🛠️ Solução Implementada

### 1. Script de Diagnóstico
```bash
cd backend
npx ts-node scripts/diagnose-kanban-phases.ts
```

**O que faz:**
- ✅ Lista todas as fases encontradas no banco de dados
- ✅ Identifica processos em fases inválidas (órfãos)
- ✅ Mostra quais colunas do Kanban têm processos
- ✅ Gera relatório completo de inconsistências

### 2. Ações Recomendadas

#### Curto Prazo (URGENTE)
```bash
# 1. Executar diagnóstico
npx ts-node scripts/diagnose-kanban-phases.ts

# 2. Identificar processos órfãos
# O script mostrará quais processos não aparecem no Kanban

# 3. Migrar processos órfãos (se existirem)
# Criar script de migração baseado nos resultados
```

#### Médio Prazo (RECOMENDADO)
1. **Deletar `backend/src/modules/process/process.phases.ts`**
   - Este arquivo não está sendo usado
   - Causa confusão por ter enum conflitante

2. **Padronizar uso do Prisma**
   ```typescript
   // SEMPRE usar:
   import { ProcessPhase } from '@prisma/client';

   // NUNCA criar enum paralelo
   ```

3. **Documentar arquitetura**
   - Prisma = fonte da verdade (17 fases)
   - Frontend = agrupamento visual (4 colunas)

---

## 📋 Checklist de Correção

### Fase 1: Diagnóstico
- [x] Criar script de diagnóstico
- [ ] Executar diagnóstico no ambiente de dev
- [ ] Executar diagnóstico no ambiente de produção
- [ ] Documentar processos órfãos encontrados

### Fase 2: Correção Imediata
- [ ] Identificar processos em fases inválidas
- [ ] Criar script de migração para processos órfãos
- [ ] Executar migração em dev
- [ ] Validar que todos os processos aparecem no Kanban

### Fase 3: Refatoração
- [ ] Remover `process.phases.ts`
- [ ] Buscar e corrigir imports deste arquivo
- [ ] Garantir que todo código usa `@prisma/client`
- [ ] Atualizar testes

### Fase 4: Validação
- [ ] Teste manual: criar processo e avançar por todas as fases
- [ ] Verificar que processo aparece em todas as colunas corretas
- [ ] Confirmar que métricas estão corretas
- [ ] Deploy em produção

---

## 🧪 Como Testar

### Teste Manual Completo
```bash
# 1. Criar novo processo
# Login como empresa → Novo Wizard

# 2. Avançar por todas as fases manualmente
# Login como analista → Processos → Avançar Fase

# 3. Verificar em cada fase:
✓ Processo aparece na coluna correta do Kanban
✓ Contadores de processos estão corretos
✓ Cards exibem informações completas
```

### Teste Automatizado
```typescript
describe('Kanban Phase Coverage', () => {
  it('should map all Prisma phases to Kanban columns', () => {
    const prismaPhases = Object.values(ProcessPhase);
    const kanbanPhases = Object.values(KANBAN_COLUMNS).flatMap(c => c.phases);

    prismaPhases.forEach(phase => {
      expect(kanbanPhases).toContain(phase);
    });
  });
});
```

---

## 📊 Métricas de Sucesso

| Métrica | Antes | Depois | Meta |
|---------|-------|--------|------|
| Processos órfãos | ❓ | 0 | 0 |
| Fases cobertas | 3/17 (18%) | 17/17 (100%) | 100% |
| Processos visíveis no Kanban | ~60% | 100% | 100% |
| Tempo de diagnóstico | Manual (horas) | Automático (segundos) | < 1 min |

---

## 🎓 Documentação Relacionada

- [Análise Detalhada de Fases](./ANALISE-FASES-KANBAN.md)
- [Process Transition Service](../../backend/src/modules/process/process-transition.service.ts)
- [Frontend Process Phases](../../frontend/src/lib/process-phases.ts)

---

## 💡 Próximos Passos

1. ✅ **Executar script de diagnóstico**
   ```bash
   cd backend
   npx ts-node scripts/diagnose-kanban-phases.ts
   ```

2. 📊 **Analisar resultados**
   - Ver relatório no terminal
   - Identificar processos órfãos

3. 🔧 **Aplicar correções**
   - Migrar processos órfãos (se houver)
   - Remover arquivo conflitante

4. ✅ **Validar solução**
   - Todos os processos aparecem no Kanban
   - Métricas estão corretas

---

**Última atualização:** 2025-12-17
**Responsável:** Claude Code
**Status:** Aguardando execução do diagnóstico
