# 🔍 Análise de Aderência - Fluxo Atual vs Sistema Implementado

**Data**: 08 de Dezembro de 2025
**Versão**: 1.0

---

## 📋 Mapeamento do Fluxo da Imagem

### **Fluxo Completo (14 Etapas):**

```
1.  Solicitação de Certificação
2.  Análise da Solicitação
3.  Envio da Proposta
4.  Aceite da Proposta
5.  Assinatura do Contrato
6.  Avaliação Documental (Pré-Análise de Matéria-Prima)
7.  Pagamento de Taxas
8.  Auditoria Fase 01
9.  Envio do Relatório e Correção das Não Conformidades
10. Auditoria Fase 02
11. Envio do Relatório e Correção das Não Conformidades
12. Análise Laboratorial (se aplicável)
13. Decisão de Certificação
14. Emissão do Certificado
```

---

## ✅ Comparação Etapa por Etapa

### **1️⃣ Solicitação de Certificação**

**Fluxo da Imagem:**
- Empresa faz solicitação inicial

**Sistema Atual:**
- ✅ **IMPLEMENTADO** - Wizard de 9 etapas (empresa preenche)
- ✅ Status: `rascunho` → `pendente` ao submeter
- ✅ Fase: `cadastro_solicitacao`

**Aderência:** ✅ **100%** - Totalmente implementado

**Arquivo de referência:**
- [NewRequestWizard.tsx](frontend/src/pages/company/NewRequestWizard.tsx)
- [process.controller.ts:19-76](backend/src/modules/process/process.controller.ts#L19-L76)

---

### **2️⃣ Análise da Solicitação**

**Fluxo da Imagem:**
- Análise inicial dos documentos e informações

**Sistema Atual:**
- ✅ **IMPLEMENTADO** - Analista auto-atribuído ao abrir processo pendente
- ✅ Status: `pendente` → `em_andamento`
- ✅ Fase: `cadastro_solicitacao` → `analise_documental`
- ✅ Analista valida documentos, pode solicitar complementares

**Aderência:** ✅ **100%** - Totalmente implementado

**Gaps Identificados:**
- ⚠️ Não há uma etapa formal de "aprovação da análise" para avançar para proposta
- 💡 **Recomendação:** Adicionar status `analise_aprovada` antes de avançar para proposta

**Arquivo de referência:**
- [process.controller.ts:174-200](backend/src/modules/process/process.controller.ts#L174-L200)
- [process.service.ts:238-277](backend/src/modules/process/process.service.ts#L238-L277)

---

### **3️⃣ Envio da Proposta**

**Fluxo da Imagem:**
- Elaboração e envio da proposta comercial

**Sistema Atual:**
- ✅ **PARCIALMENTE IMPLEMENTADO** - Módulo de proposta existe
- ✅ Cálculo automático de proposta baseado em múltiplos fatores
- ✅ Geração de PDF da proposta
- ❌ **NÃO IMPLEMENTADO:** Role específico "Comercial" para gerenciar propostas
- ❌ **NÃO IMPLEMENTADO:** Fase específica `elaboracao_proposta`

**Aderência:** 🟡 **60%** - Estrutura existe, falta integração com fluxo e role

**Gaps Identificados:**
- ❌ Proposta não está integrada ao fluxo de fases do processo
- ❌ Não há transição automática: `analise_documental` → `elaboracao_proposta`
- ❌ Falta role "Comercial" para gerenciar exclusivamente propostas
- ❌ Não há dashboard específico para comercial

**Recomendações:**
- 🔧 Criar role `comercial`
- 🔧 Criar fase `elaboracao_proposta`
- 🔧 Integrar módulo de proposta ao fluxo principal
- 🔧 Criar dashboard comercial

**Arquivo de referência:**
- [Proposal model](backend/prisma/schema.prisma#L775-L850) - ✅ Existe
- [ProposalCalculator.tsx](frontend/src/components/proposal/ProposalCalculator.tsx) - ✅ Existe
- ❌ CommercialController - **NÃO EXISTE**
- ❌ CommercialService - **NÃO EXISTE**

---

### **4️⃣ Aceite da Proposta**

**Fluxo da Imagem:**
- Cliente aceita a proposta comercial

**Sistema Atual:**
- ❌ **NÃO IMPLEMENTADO** - Não há fluxo de aprovação de proposta pelo cliente
- ❌ Não há status `proposta_aprovada`
- ❌ Não há interface para cliente aprovar proposta

**Aderência:** 🔴 **0%** - Não implementado

**Gaps Identificados:**
- ❌ Falta endpoint para cliente aprovar proposta
- ❌ Falta interface de aprovação para empresa
- ❌ Falta notificação ao comercial quando proposta for aprovada
- ❌ Não há registro de data/hora de aprovação

**Recomendações:**
- 🔧 Criar endpoint `POST /api/proposals/:id/approve`
- 🔧 Criar interface para cliente visualizar e aprovar proposta
- 🔧 Adicionar status `proposta_aprovada`
- 🔧 Adicionar campos `approvedAt` e `approvedBy` no model Proposal
- 🔧 Enviar notificação para Comercial e Jurídico

**Implementação Necessária:**
```typescript
// backend/src/modules/proposal/proposal.controller.ts
POST /api/proposals/:id/approve
Body: {
  accepted: boolean,
  notes?: string
}

// Se aceita: proposta_aprovada → aciona Jurídico para elaborar contrato
// Se recusada: proposta_recusada → volta para Comercial renegociar
```

---

### **5️⃣ Assinatura do Contrato**

**Fluxo da Imagem:**
- Assinatura do contrato entre empresa e certificadora

**Sistema Atual:**
- ✅ **PARCIALMENTE IMPLEMENTADO** - Model Contract existe
- ✅ Campos para armazenar PDF do contrato
- ❌ **NÃO IMPLEMENTADO:** Role "Jurídico" para gerenciar contratos
- ❌ **NÃO IMPLEMENTADO:** Fluxo de assinatura (empresa + certificadora)
- ❌ **NÃO IMPLEMENTADO:** Upload de contrato assinado
- ❌ **NÃO IMPLEMENTADO:** Fase `elaboracao_contrato` e `assinatura_contrato`

**Aderência:** 🟡 **40%** - Estrutura existe, falta implementação do fluxo

**Gaps Identificados:**
- ❌ Não há role `juridico`
- ❌ Não há fluxo de elaboração de contrato
- ❌ Não há registro de assinaturas (quem assinou, quando)
- ❌ Não há upload de contrato assinado (PDF)
- ❌ Não há validação de assinaturas completas

**Recomendações:**
- 🔧 Criar role `juridico`
- 🔧 Criar fases `elaboracao_contrato` e `assinatura_contrato`
- 🔧 Implementar upload de contrato assinado
- 🔧 Adicionar campos no Contract:
  - `companySignedAt`, `companySignedBy`
  - `certSignedAt`, `certSignedBy`
  - `draftPdfUrl` (minuta)
  - `signedPdfUrl` (contrato assinado)
- 🔧 Criar dashboard jurídico

**Arquivo de referência:**
- [Contract model](backend/prisma/schema.prisma#L395-L418) - ✅ Existe (precisa expansão)
- ❌ LegalController - **NÃO EXISTE**
- ❌ LegalService - **NÃO EXISTE**

---

### **6️⃣ Avaliação Documental (Pré-Análise de Matéria-Prima)**

**Fluxo da Imagem:**
- Avaliação detalhada dos documentos após assinatura do contrato
- Análise de riscos de matérias-primas

**Sistema Atual:**
- ⚠️ **CONFLITO DE POSICIONAMENTO**
- ✅ Fase `analise_documental` existe, mas acontece ANTES da proposta (etapa 2)
- ❌ **NÃO HÁ** uma segunda análise documental detalhada após assinatura do contrato

**Aderência:** 🟡 **50%** - Existe análise documental, mas em momento diferente

**Análise:**
O fluxo da imagem mostra **DUAS análises documentais**:
1. **Análise inicial** (etapa 2) - Análise superficial para elaborar proposta
2. **Avaliação documental detalhada** (etapa 6) - Análise profunda de matérias-primas após contrato assinado

**No sistema atual temos apenas UMA análise (etapa 2).**

**Gaps Identificados:**
- ❌ Falta segunda fase de análise documental detalhada
- ❌ Falta análise específica de riscos de matérias-primas
- ❌ Falta validação de certificados Halal dos fornecedores
- ❌ Falta checklist de conformidade pré-auditoria

**Recomendações:**
- 🔧 Manter `analise_documental` (etapa 2) como análise inicial
- 🔧 Adicionar nova fase `avaliacao_detalhada` ou `pre_auditoria` (após contrato)
- 🔧 Criar módulo de análise de riscos de matérias-primas
- 🔧 Criar checklist de conformidade pré-auditoria
- 🔧 Integrar com sistema de gestão de fornecedores

**Fluxo Proposto Corrigido:**
```
1. Cadastro da Solicitação (Empresa)
2. Análise Inicial (Analista) ← superficial, para proposta
3. Elaboração de Proposta (Comercial)
4. Aprovação de Proposta (Empresa)
5. Elaboração de Contrato (Jurídico)
6. Assinatura de Contrato (Empresa + Certificadora)
7. Avaliação Documental Detalhada (Analista) ← NOVA FASE
   └─ Análise de riscos de matérias-primas
   └─ Validação de certificados de fornecedores
   └─ Checklist pré-auditoria
8. Pagamento de Taxas (Financeiro)
9. Auditoria Fase 01 (Auditor)
...
```

---

### **7️⃣ Pagamento de Taxas**

**Fluxo da Imagem:**
- Pagamento das taxas de certificação

**Sistema Atual:**
- ❌ **NÃO IMPLEMENTADO** - Não há módulo de pagamento
- ❌ Não há controle de parcelas
- ❌ Não há integração com gateways de pagamento
- ❌ Não há fase `aguardando_pagamento`

**Aderência:** 🔴 **0%** - Não implementado

**Gaps Identificados:**
- ❌ Falta módulo de gestão financeira
- ❌ Falta controle de parcelas (definidas no contrato)
- ❌ Falta registro de pagamentos
- ❌ Falta integração com gateway de pagamento
- ❌ Falta notificações de cobrança
- ❌ Falta bloqueio de avanço se pagamento pendente

**Recomendações:**
- 🔧 Criar model `Payment`
- 🔧 Criar model `Installment` (parcelas)
- 🔧 Criar fase `aguardando_pagamento`
- 🔧 Integrar com gateway (Stripe, PagSeguro, Mercado Pago)
- 🔧 Criar dashboard financeiro
- 🔧 Implementar regra: só agenda auditoria após pagamento confirmado

**Implementação Futura:**
```prisma
model Payment {
  id              String   @id @default(uuid())
  processId       String
  contractId      String
  installmentNum  Int      // Parcela 1, 2, 3...
  amount          Decimal
  dueDate         DateTime
  paidAt          DateTime?
  paymentMethod   String?  // boleto, cartao, pix
  transactionId   String?
  status          PaymentStatus // pendente, pago, vencido, cancelado

  process         Process  @relation(fields: [processId], references: [id])
  contract        Contract @relation(fields: [contractId], references: [id])
}
```

---

### **8️⃣ Auditoria Fase 01**

**Fluxo da Imagem:**
- Primeira fase da auditoria (Estágio 1)
- Auditoria documental e de processos

**Sistema Atual:**
- ✅ **IMPLEMENTADO** - Model Audit existe
- ✅ Suporte para `AuditType.estagio1`
- ✅ Fase `auditoria_agendada`
- ❌ **NÃO IMPLEMENTADO:** Separação clara entre Estágio 1 e Estágio 2
- ❌ **NÃO IMPLEMENTADO:** Fluxo de correção de não conformidades

**Aderência:** 🟡 **60%** - Estrutura existe, falta detalhamento do fluxo

**Gaps Identificados:**
- ❌ Não há fase específica `auditoria_estagio1`
- ❌ Não há controle de não conformidades por estágio
- ❌ Não há prazo para correção de não conformidades
- ❌ Não há validação de correção antes de Estágio 2

**Recomendações:**
- 🔧 Separar fases: `auditoria_estagio1` e `auditoria_estagio2`
- 🔧 Criar model `NonConformity` (Não Conformidade)
- 🔧 Adicionar fase `correcao_nc_estagio1` (entre estágio 1 e 2)
- 🔧 Implementar prazo para correção (geralmente 30-60 dias)
- 🔧 Criar interface para empresa submeter evidências de correção

**Arquivo de referência:**
- [Audit model](backend/prisma/schema.prisma#L420-L441) - ✅ Existe
- [AuditType enum](backend/prisma/schema.prisma#L147-L152) - ✅ Existe (estagio1, estagio2)
- ❌ NonConformity model - **NÃO EXISTE**

---

### **9️⃣ Envio do Relatório e Correção das Não Conformidades**

**Fluxo da Imagem:**
- Auditor envia relatório
- Empresa corrige não conformidades identificadas

**Sistema Atual:**
- ❌ **NÃO IMPLEMENTADO** - Não há fluxo de correção de não conformidades
- ❌ Não há model NonConformity
- ❌ Não há interface para empresa submeter correções
- ❌ Não há validação de correções pelo auditor

**Aderência:** 🔴 **0%** - Não implementado

**Gaps Identificados:**
- ❌ Falta model `NonConformity`
- ❌ Falta registro de não conformidades no relatório
- ❌ Falta fase `correcao_nc`
- ❌ Falta interface para empresa enviar evidências
- ❌ Falta validação das correções
- ❌ Falta prazo de correção
- ❌ Falta notificações de vencimento de prazo

**Recomendações:**
- 🔧 Criar model `NonConformity`:

```prisma
model NonConformity {
  id                String   @id @default(uuid())
  auditId           String
  processId         String
  category          NCCategory // menor, maior, critica
  description       String
  requirement       String   // Cláusula GSO violada
  dueDate           DateTime // Prazo para correção
  status            NCStatus // aberta, em_correcao, corrigida, validada

  // Correção
  correctionPlan    String?
  correctionEvidence Json?  // URLs de documentos/fotos
  correctedAt       DateTime?

  // Validação
  validatedBy       String?
  validatedAt       DateTime?
  validationNotes   String?

  audit             Audit    @relation(fields: [auditId], references: [id])
  process           Process  @relation(fields: [processId], references: [id])
}

enum NCCategory {
  menor      // Não conformidade menor
  maior      // Não conformidade maior
  critica    // Não conformidade crítica (bloqueia certificação)
}

enum NCStatus {
  aberta
  em_correcao
  evidencia_enviada
  validada
  rejeitada  // Correção insuficiente
}
```

- 🔧 Criar fase `correcao_nc_estagio1`
- 🔧 Criar interface de gestão de não conformidades
- 🔧 Implementar upload de evidências de correção
- 🔧 Criar workflow de validação de correções

---

### **🔟 Auditoria Fase 02**

**Fluxo da Imagem:**
- Segunda fase da auditoria (Estágio 2)
- Auditoria in loco completa

**Sistema Atual:**
- ✅ **PARCIALMENTE IMPLEMENTADO** - Suporte para `AuditType.estagio2`
- ❌ **NÃO IMPLEMENTADO:** Separação clara de fases
- ❌ **NÃO IMPLEMENTADO:** Validação de que Estágio 1 foi concluído

**Aderência:** 🟡 **40%** - Estrutura existe, falta implementação do fluxo

**Gaps Identificados:**
- ❌ Não há validação de que NC do Estágio 1 foram corrigidas antes de Estágio 2
- ❌ Não há fase específica `auditoria_estagio2`

**Recomendações:**
- 🔧 Criar fase `auditoria_estagio2`
- 🔧 Adicionar validação: só permite Estágio 2 se NC de Estágio 1 estiverem validadas
- 🔧 Manter mesmo fluxo de NC do Estágio 1 (mas separado)

---

### **1️⃣1️⃣ Envio do Relatório e Correção das Não Conformidades (Estágio 2)**

**Fluxo da Imagem:**
- Mesmo fluxo da etapa 9, mas para Estágio 2

**Sistema Atual:**
- ❌ **NÃO IMPLEMENTADO** - Mesmo gap da etapa 9

**Aderência:** 🔴 **0%** - Não implementado

**Recomendações:**
- 🔧 Mesmo que etapa 9, mas para `correcao_nc_estagio2`

---

### **1️⃣2️⃣ Análise Laboratorial (se aplicável)**

**Fluxo da Imagem:**
- Análise laboratorial de produtos (quando necessário)

**Sistema Atual:**
- ❌ **NÃO IMPLEMENTADO** - Não há módulo de análise laboratorial
- ❌ Não há fase `analise_laboratorial`
- ❌ Não há integração com laboratórios

**Aderência:** 🔴 **0%** - Não implementado

**Gaps Identificados:**
- ❌ Falta model `LabAnalysis`
- ❌ Falta controle de amostras coletadas
- ❌ Falta registro de resultados laboratoriais
- ❌ Falta integração com laboratórios externos
- ❌ Falta upload de laudos laboratoriais

**Recomendações:**
- 🔧 Criar model `LabAnalysis`:

```prisma
model LabAnalysis {
  id              String   @id @default(uuid())
  processId       String
  auditId         String?
  productName     String
  sampleCode      String   // Código da amostra
  collectedAt     DateTime
  labName         String   // Nome do laboratório

  // Análises
  analysisType    String[] // Halal ingredients, contamination, etc.
  status          LabStatus

  // Resultados
  resultUrl       String?  // PDF do laudo
  result          LabResult?
  resultDate      DateTime?
  resultNotes     String?

  process         Process  @relation(fields: [processId], references: [id])
  audit           Audit?   @relation(fields: [auditId], references: [id])
}

enum LabStatus {
  aguardando_coleta
  amostra_coletada
  em_analise
  concluida
}

enum LabResult {
  aprovado
  reprovado
  requer_nova_analise
}
```

- 🔧 Criar fase `analise_laboratorial` (opcional, entre auditoria e comitê)
- 🔧 Criar interface de gestão de amostras e resultados
- 🔧 Permitir upload de laudos laboratoriais

**Nota:** Esta etapa é **opcional** e depende do tipo de certificação:
- C1 (Alimentos processados): Geralmente requer análise
- C2 (Químicos): Sempre requer análise
- C3 (Cosméticos): Geralmente requer análise
- C4 (Farmacêuticos): Sempre requer análise
- C5 (Embalagens): Raramente requer análise
- C6 (Serviços): Não requer análise

---

### **1️⃣3️⃣ Decisão de Certificação**

**Fluxo da Imagem:**
- Comitê técnico analisa e decide sobre certificação

**Sistema Atual:**
- ✅ **IMPLEMENTADO** - Model CommitteeDecision existe
- ✅ Fase `comite_tecnico`
- ✅ Tipos de decisão: aprovar, reprovar, solicitar_info

**Aderência:** ✅ **90%** - Bem implementado

**Gaps Menores:**
- ⚠️ Não há registro de quem votou (apenas "decidedBy" como string)
- ⚠️ Não há suporte para múltiplos membros votando

**Recomendações:**
- 🔧 Adicionar model `CommitteeVote` para registrar votos individuais:

```prisma
model CommitteeVote {
  id               String   @id @default(uuid())
  decisionId       String
  voterId          String   // User ID do membro do comitê
  vote             VoteType // aprovar, reprovar, abstencao
  justification    String?
  votedAt          DateTime @default(now())

  decision         CommitteeDecision @relation(fields: [decisionId], references: [id])
  voter            User              @relation(fields: [voterId], references: [id])
}

enum VoteType {
  aprovar
  reprovar
  solicitar_info
  abstencao
}
```

**Arquivo de referência:**
- [CommitteeDecision model](backend/prisma/schema.prisma#L443-L457) - ✅ Existe

---

### **1️⃣4️⃣ Emissão do Certificado**

**Fluxo da Imagem:**
- Emissão final do certificado Halal

**Sistema Atual:**
- ✅ **IMPLEMENTADO** - Model Certificate existe
- ✅ Fase `certificado_emitido`
- ✅ Geração de número de certificado
- ✅ PDF com QR Code
- ⚠️ **PARCIAL:** Módulo de gestão de certificados (ver PROPOSTA-MODULO-CERTIFICADOS.md)

**Aderência:** ✅ **80%** - Bem implementado, módulo completo em proposta

**Arquivo de referência:**
- [Certificate model](backend/prisma/schema.prisma#L459-L477) - ✅ Existe
- [PROPOSTA-MODULO-CERTIFICADOS.md](PROPOSTA-MODULO-CERTIFICADOS.md) - ✅ Proposta completa

---

## 📊 Resumo Geral de Aderência

| Etapa | Descrição | Aderência | Status |
|-------|-----------|-----------|--------|
| 1 | Solicitação de Certificação | ✅ 100% | Implementado |
| 2 | Análise da Solicitação | ✅ 100% | Implementado |
| 3 | Envio da Proposta | 🟡 60% | Estrutura existe, falta integração |
| 4 | Aceite da Proposta | 🔴 0% | Não implementado |
| 5 | Assinatura do Contrato | 🟡 40% | Estrutura existe, falta fluxo |
| 6 | Avaliação Documental Detalhada | 🟡 50% | Existe, mas em momento errado |
| 7 | Pagamento de Taxas | 🔴 0% | Não implementado |
| 8 | Auditoria Fase 01 | 🟡 60% | Estrutura existe, falta detalhamento |
| 9 | Correção de NC (Estágio 1) | 🔴 0% | Não implementado |
| 10 | Auditoria Fase 02 | 🟡 40% | Estrutura existe, falta fluxo |
| 11 | Correção de NC (Estágio 2) | 🔴 0% | Não implementado |
| 12 | Análise Laboratorial | 🔴 0% | Não implementado |
| 13 | Decisão de Certificação | ✅ 90% | Bem implementado |
| 14 | Emissão do Certificado | ✅ 80% | Bem implementado |

### **Aderência Geral: 🟡 47% (Médio)**

---

## 🚨 Gaps Críticos Identificados

### **Prioridade ALTA (Bloqueadores):**

1. **❌ Aceite da Proposta pelo Cliente** (Etapa 4)
   - Sem isso, processo não avança corretamente para contrato
   - **Impacto:** Alto - Bloqueia fluxo comercial

2. **❌ Fluxo de Assinatura de Contrato** (Etapa 5)
   - Sem role Jurídico e fluxo de assinatura
   - **Impacto:** Alto - Bloqueia fluxo jurídico

3. **❌ Gestão de Não Conformidades** (Etapas 9 e 11)
   - Essencial para auditorias
   - **Impacto:** Alto - Processo de auditoria incompleto

4. **❌ Avaliação Documental Detalhada Pós-Contrato** (Etapa 6)
   - Análise de riscos de matérias-primas
   - **Impacto:** Alto - Crucial para conformidade

### **Prioridade MÉDIA:**

5. **🟡 Integração de Proposta no Fluxo** (Etapa 3)
   - Estrutura existe, falta integração
   - **Impacto:** Médio - Funciona manualmente

6. **🟡 Separação de Estágios de Auditoria** (Etapas 8 e 10)
   - Estrutura existe, falta organização
   - **Impacto:** Médio - Confuso para auditores

### **Prioridade BAIXA:**

7. **⚠️ Pagamento de Taxas** (Etapa 7)
   - Pode ser gerenciado externamente
   - **Impacto:** Baixo - Não bloqueia processo técnico

8. **⚠️ Análise Laboratorial** (Etapa 12)
   - Opcional, depende do tipo de certificação
   - **Impacto:** Baixo - Apenas alguns casos

---

## 🔧 Plano de Ação Recomendado

### **FASE 1: Comercial e Jurídico (2-3 semanas)**

**Objetivo:** Completar fluxo comercial e jurídico

- [ ] Criar roles `comercial` e `juridico`
- [ ] Integrar módulo de proposta ao fluxo
- [ ] Implementar aceite de proposta pelo cliente
- [ ] Implementar elaboração de contrato
- [ ] Implementar fluxo de assinatura de contrato
- [ ] Criar dashboards comercial e jurídico

**Etapas impactadas:** 3, 4, 5

---

### **FASE 2: Avaliação Detalhada Pré-Auditoria (1-2 semanas)**

**Objetivo:** Adicionar análise detalhada de matérias-primas

- [ ] Criar fase `avaliacao_detalhada` (após contrato)
- [ ] Implementar análise de riscos de matérias-primas
- [ ] Criar checklist de conformidade pré-auditoria
- [ ] Implementar validação de certificados de fornecedores

**Etapas impactadas:** 6

---

### **FASE 3: Gestão de Não Conformidades (2-3 semanas)**

**Objetivo:** Implementar fluxo completo de NC

- [ ] Criar model `NonConformity`
- [ ] Criar fases `correcao_nc_estagio1` e `correcao_nc_estagio2`
- [ ] Implementar interface de registro de NC
- [ ] Implementar interface de correção (empresa)
- [ ] Implementar validação de correções (auditor)
- [ ] Implementar prazos e notificações

**Etapas impactadas:** 9, 11

---

### **FASE 4: Auditorias Estruturadas (1-2 semanas)**

**Objetivo:** Separar e organizar estágios de auditoria

- [ ] Criar fases `auditoria_estagio1` e `auditoria_estagio2`
- [ ] Implementar validação de pré-requisitos entre estágios
- [ ] Implementar alocação de auditores
- [ ] Criar templates de relatórios por estágio

**Etapas impactadas:** 8, 10

---

### **FASE 5: Análise Laboratorial (1 semana) [OPCIONAL]**

**Objetivo:** Adicionar suporte para análises laboratoriais

- [ ] Criar model `LabAnalysis`
- [ ] Criar fase `analise_laboratorial`
- [ ] Implementar gestão de amostras
- [ ] Implementar upload de laudos

**Etapas impactadas:** 12

---

### **FASE 6: Pagamento e Financeiro (2-3 semanas) [FUTURO]**

**Objetivo:** Implementar controle financeiro

- [ ] Criar models `Payment` e `Installment`
- [ ] Integrar gateway de pagamento
- [ ] Criar dashboard financeiro
- [ ] Implementar cobranças automáticas

**Etapas impactadas:** 7

---

## 📈 Cronograma Sugerido

```
Semanas 1-3:  FASE 1 - Comercial e Jurídico
Semanas 4-5:  FASE 2 - Avaliação Detalhada
Semanas 6-8:  FASE 3 - Não Conformidades
Semanas 9-10: FASE 4 - Auditorias Estruturadas
Semana 11:    FASE 5 - Análise Laboratorial (opcional)
Semanas 12+:  FASE 6 - Financeiro (futuro)

Total: 10-12 semanas (2,5-3 meses) para completar fluxo principal
```

---

## 🎯 Conclusões

### **Pontos Positivos:**

✅ **Base sólida:** Estruturas fundamentais estão implementadas
✅ **Fases iniciais completas:** Solicitação e análise inicial funcionam bem
✅ **Proposta e contrato:** Estruturas de dados existem, faltam integrações
✅ **Certificação:** Etapa final bem implementada

### **Pontos de Atenção:**

⚠️ **Fluxo fragmentado:** Etapas 3-7 precisam de integração
⚠️ **Falta de roles específicos:** Comercial e Jurídico não existem
⚠️ **Não conformidades:** Gap crítico para auditorias
⚠️ **Duas análises documentais:** Confusão entre análise inicial e detalhada

### **Recomendação Final:**

Priorizar **FASE 1 (Comercial e Jurídico)** e **FASE 3 (Não Conformidades)**, pois são gaps críticos que bloqueiam o fluxo completo do processo de certificação.

---

**Elaborado por**: Claude Code (Assistente de IA)
**Data**: 08 de Dezembro de 2025
**Versão**: 1.0
**Baseado em**: Análise da imagem do fluxo atual vs sistema implementado
