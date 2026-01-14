# Mapeamento de Qualificações de Auditores

## 📊 Análise da Planilha `classifica_auditor.xlsx`

Data da análise: 2026-01-12

### Resumo Executivo

A planilha mapeia a relação entre **Classificações Industriais (GSO 2055-2)** e **Formações Acadêmicas** necessárias para auditores. O objetivo é permitir que o sistema sugira automaticamente auditores qualificados baseado na classificação industrial da empresa.

---

## 🎓 Formações Acadêmicas Identificadas

### 1. Agronomia, Alimentos, Veterinária, Zootecnista

**Categorias GSO que podem auditar:**
- AI, AII (Agricultura - criação de animais e piscicultura)
- BI, BII (Plantação agrícola)
- CI, CII, CIII, CIV, CV (Processamento de alimentos)
- DI, DII (Produção de ração animal)
- E (Serviço de alimentação)
- FI, FII (Distribuição)
- GI, GII (Transporte e armazenamento)
- HI, HIII (Serviços auxiliares, Turismo Muslim Friendly)
- I (Embalagem)
- K (Bioquímica)

**Categorias SMIIC 2 que podem auditar:**
- Mesmas da GSO + LIII (Couro e derivados)

**Total:** 19 categorias GSO / 20 categorias SMIIC

---

### 2. Química

**Categorias GSO que podem auditar:**
- CI, CII, CIII, CIV, CV (Processamento de alimentos)
- DI, DII (Produção de ração)
- FI, FII (Distribuição)
- GI, GII (Transporte)
- I (Embalagem)
- K (Bioquímica)

**Categorias SMIIC 2 que podem auditar:**
- Mesmas da GSO + E (Serviço de alimentação) + HI, HIII (Serviços auxiliares) + LI (Cosméticos)

**Total:** 12 categorias GSO / 16 categorias SMIIC

---

### 3. Farmácia

**Observação:** Apenas se na grade tiverem matérias relacionadas a alimentos

**Categorias GSO que podem auditar:**
- CI, CII, CIII, CIV (Processamento de alimentos)
- DI, DII (Produção de ração)
- E (Serviço de alimentação)
- FI, FII (Distribuição)
- GI, GII (Transporte)
- HI, HIII (Serviços auxiliares)
- I (Embalagem)
- K (Bioquímica)

**Categorias SMIIC 2 que podem auditar:**
- Mesmas da GSO + LI (Cosméticos)

**Total:** 15 categorias GSO / 16 categorias SMIIC

**Requisito especial:** Grade curricular deve conter matérias relacionadas a alimentos

---

### 4. Engenharia

**Categorias que podem auditar:**
- J (Fabricação de equipamentos)
- LII (Têxteis e produtos têxteis)

**Especialidades:** Engenharias diversas

**Total:** 2 categorias

---

### 5. Administração

**Categorias que podem auditar:**
- HII (Serviços financeiros)

**Total:** 1 categoria

---

### 6. Economia

**Categorias que podem auditar:**
- HII (Serviços financeiros)

**Total:** 1 categoria

---

### 7. Cosméticos

**Categorias SMIIC que podem auditar:**
- LI (Cosméticos)

**Total:** 1 categoria

---

## 📋 Matriz de Competências

| Formação | Categorias GSO | Categorias SMIIC | Observações |
|----------|---------------|------------------|-------------|
| **Agronomia** | 19 | 20 | Mais abrangente |
| **Alimentos** | 19 | 20 | Mais abrangente |
| **Veterinária** | 19 | 20 | Mais abrangente |
| **Zootecnista** | 19 | 20 | Mais abrangente |
| **Química** | 12 | 16 | Foco em processamento |
| **Farmácia** | 15 | 16 | Requer matérias de alimentos |
| **Engenharia** | 2 | 2 | Equipamentos e têxteis |
| **Administração** | 1 | 1 | Serviços financeiros |
| **Economia** | 1 | 1 | Serviços financeiros |
| **Cosméticos** | 0 | 1 | Apenas SMIIC |

---

## 🎯 Categorias Especiais

### Categorias que Qualquer Formação pode Auditar
- **Nenhuma** - Todas as categorias exigem formação específica

### Categorias Mais Restritas
- **J (Fabricação de equipamentos)**: Apenas Engenharia
- **HII (Serviços financeiros)**: Apenas Administração ou Economia
- **LI (Cosméticos)**: Apenas Cosméticos ou Química ou Farmácia
- **LII (Têxteis)**: Apenas Engenharia
- **LIII (Couro)**: Apenas formações relacionadas a alimentos/animais

### Categorias Mais Abrangentes
- **CI, CII, CIII, CIV (Processamento)**: Aceita 3 formações principais
- **E (Serviço de alimentação)**: Aceita múltiplas formações

---

## 🔄 Comparação com Sistema Atual

### ✅ O Que Já Temos

1. **Modelo User com role `auditor`** ([schema.prisma:307-353](../../../backend/prisma/schema.prisma#L307-L353))
   ```prisma
   model User {
     role UserRole // Inclui 'auditor'
     auditorProcesses Process[] @relation("AuditorProcesses")
   }
   ```

2. **Classificação Industrial Completa** ([schema.prisma:792-870](../../../backend/prisma/schema.prisma#L792-L870))
   - IndustrialGroup (11 grupos A-K)
   - IndustrialCategory (22 categorias)
   - IndustrialSubcategory (22 subcategorias)

3. **Seeds com Dados GSO 2055-2** ([seeds/seed-industrial-classification.ts](../../../backend/prisma/seeds/seed-industrial-classification.ts))
   - Todos os grupos, categorias e subcategorias
   - Tempos de auditoria configurados

### ❌ O Que Está Faltando

1. **Modelo de Competências do Auditor**
   - Não existe tabela para armazenar formações acadêmicas
   - Não existe relação entre auditor e categorias que pode auditar
   - Não existe validação de grade curricular (ex: Farmácia com matérias de alimentos)

2. **Sistema de Sugestão de Auditores**
   - Não existe lógica para sugerir auditores baseado na categoria industrial
   - Não existe ranking/score de adequação
   - Não existe filtro de disponibilidade

3. **Interface de Cadastro**
   - Não existe tela para cadastrar competências do auditor
   - Não existe visualização das categorias que pode auditar
   - Não existe upload de documentos comprobatórios

4. **Dados SMIIC 2**
   - Sistema atual usa apenas GSO 2055-2
   - Categorias L (SMIIC) não estão no banco de dados

---

## 📝 Gap Analysis

### Crítico (Implementar Primeiro)
1. ❌ Modelo de dados para competências de auditores
2. ❌ Tabela de formações acadêmicas
3. ❌ Relação muitos-para-muitos entre auditores e categorias industriais

### Importante (Implementar em Seguida)
4. ❌ API para sugestão de auditores por categoria
5. ❌ Interface de cadastro de competências
6. ❌ Validação de elegibilidade

### Desejável (Funcionalidades Avançadas)
7. ❌ Sistema de scoring/ranking
8. ❌ Histórico de auditorias por categoria
9. ❌ Certificações e documentos comprobatórios
10. ❌ Categorias SMIIC 2 (expandir além de GSO)

---

## 🎯 Objetivos do Sistema

### 1. Cadastro de Competências
- Auditor informa suas formações acadêmicas
- Sistema valida documentação (opcional)
- Sistema mapeia automaticamente categorias que pode auditar

### 2. Sugestão Automática
- Ao criar/atribuir processo, sistema sugere auditores qualificados
- Considera:
  - ✅ Formação adequada
  - ✅ Disponibilidade
  - ✅ Histórico de auditorias na categoria
  - ✅ Carga de trabalho atual

### 3. Validação
- Impedir atribuição de auditor não qualificado
- Alertar sobre incompatibilidades
- Exigir justificativa para exceções

---

## 📊 Dados Estruturados Extraídos

### Mapeamento Formação → Categorias

```json
{
  "agronomia": {
    "gso": ["AI", "AII", "BI", "BII", "CI", "CII", "CIII", "CIV", "CV", "DI", "DII", "E", "FI", "FII", "GI", "GII", "HI", "HIII", "I", "K"],
    "smiic": ["AI", "AII", "BI", "BII", "CI", "CII", "CIII", "CIV", "DI", "DII", "E", "FI", "FII", "GI", "GII", "HI", "HIII", "I", "K", "LIII"]
  },
  "alimentos": {
    "gso": ["AI", "AII", "BI", "BII", "CI", "CII", "CIII", "CIV", "CV", "DI", "DII", "E", "FI", "FII", "GI", "GII", "HI", "HIII", "I", "K"],
    "smiic": ["AI", "AII", "BI", "BII", "CI", "CII", "CIII", "CIV", "DI", "DII", "E", "FI", "FII", "GI", "GII", "HI", "HIII", "I", "K", "LIII"]
  },
  "veterinaria": {
    "gso": ["AI", "AII", "BI", "BII", "CI", "CII", "CIII", "CIV", "CV", "DI", "DII", "E", "FI", "FII", "GI", "GII", "HI", "HIII", "I", "K"],
    "smiic": ["AI", "AII", "BI", "BII", "CI", "CII", "CIII", "CIV", "DI", "DII", "E", "FI", "FII", "GI", "GII", "HI", "HIII", "I", "K", "LIII"]
  },
  "zootecnista": {
    "gso": ["AI", "AII", "BI", "BII", "CI", "CII", "CIII", "CIV", "CV", "DI", "DII", "E", "FI", "FII", "GI", "GII", "HI", "HIII", "I", "K"],
    "smiic": ["AI", "AII", "BI", "BII", "CI", "CII", "CIII", "CIV", "DI", "DII", "E", "FI", "FII", "GI", "GII", "HI", "HIII", "I", "K", "LIII"]
  },
  "quimica": {
    "gso": ["CI", "CII", "CIII", "CIV", "CV", "DI", "DII", "FI", "FII", "GI", "GII", "I", "K"],
    "smiic": ["CI", "CII", "CIII", "CIV", "DI", "DII", "E", "FI", "FII", "GI", "GII", "HI", "HIII", "I", "K", "LI"]
  },
  "farmacia": {
    "gso": ["CI", "CII", "CIII", "CIV", "DI", "DII", "E", "FI", "FII", "GI", "GII", "HI", "HIII", "I", "K"],
    "smiic": ["CI", "CII", "CIII", "CIV", "DI", "DII", "E", "FI", "FII", "GI", "GII", "HI", "HIII", "I", "K", "LI"],
    "requires": "Grade curricular com matérias de alimentos"
  },
  "engenharia": {
    "gso": ["J"],
    "smiic": ["J", "LII"]
  },
  "administracao": {
    "gso": ["HII"],
    "smiic": ["HII"]
  },
  "economia": {
    "gso": ["HII"],
    "smiic": ["HII"]
  },
  "cosmeticos": {
    "gso": [],
    "smiic": ["LI"]
  }
}
```

---

## 🚀 Próximos Passos

1. **Criar documento de planejamento técnico**
   - Modelo de dados detalhado
   - APIs necessárias
   - Fluxos de tela

2. **Implementar modelo de dados**
   - Tabelas de formações e competências
   - Migrations
   - Seeds

3. **Desenvolver APIs**
   - CRUD de competências
   - Sugestão de auditores
   - Validação de elegibilidade

4. **Criar interfaces**
   - Cadastro de competências
   - Visualização de auditores sugeridos
   - Dashboard de competências

---

## 📚 Referências

- Planilha original: `docs/auditorias/classifica_auditor.xlsx`
- GSO 2055-2: Padrão de Classificação Industrial Halal
- SMIIC 2: Standards and Metrology Institute for Islamic Countries
