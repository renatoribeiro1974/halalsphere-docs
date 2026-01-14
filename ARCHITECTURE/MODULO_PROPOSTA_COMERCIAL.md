# Módulo de Proposta Comercial - HalalSphere

## 📋 Visão Geral

O módulo de **Proposta Comercial** é uma das **6 inovações exclusivas** do HalalSphere (Inovação #1: Calculadora Inteligente de Custos Multi-Variável).

### Objetivos
- ⚡ Reduzir **80% no tempo** de criação de propostas (horas → segundos)
- ✅ **100% de consistência** em precificação (elimina erro humano)
- 📊 Transparência total no breakdown de custos
- 🤖 Automação completa do cálculo baseado em múltiplas variáveis

---

## 📚 User Stories (Épico 2)

### **US-009: Configuração de Tabelas de Preço (Admin)**
**Prioridade**: Must Have (P0) | **Estimativa**: 8 SP

**Como** administrador da certificadora,
**Eu quero** configurar tabelas de preço e parâmetros de cálculo,
**Para** que o sistema calcule propostas comerciais automaticamente com precificação consistente.

**Acceptance Criteria**:
- [ ] Interface de configuração (Admin apenas)
- [ ] Tabela de Preços Base por Tipo de Certificação (C1-C6)
- [ ] Fatores Multiplicadores configuráveis:
  - Número de produtos (1-10: 1.0x, 11-50: 1.3x, etc.)
  - Turnos (1: 1.0x, 2: 1.4x, 3: 1.8x)
  - Histórico (primeira: 1.0x, renovação: 0.8x)
  - Fornecedores (1-5: 1.0x, 6-15: 1.2x, 16+: 1.5x)
- [ ] Cálculo de Man-Hour (PR 7.1 10.7.4):
  - Por funcionários (1-50: 8h, 51-150: 16h, etc.)
  - Valor/hora configurável
- [ ] Custos de Deslocamento:
  - Por distância (0km, 100km, 300km, 500km+)
  - Hospedagem se necessário
- [ ] Taxas Fixas:
  - Análise documental, Comitê, Emissão, Impostos
- [ ] Histórico de mudanças (versionamento)

**Regras de Negócio**:
- **RN-027**: Mudanças não afetam processos já iniciados
- **RN-028**: Sistema usa tabela vigente na data da solicitação

---

### **US-010: Cálculo Automático de Proposta**
**Prioridade**: Must Have (P0) | **Estimativa**: 13 SP

**Como** analista,
**Eu quero** que o sistema calcule automaticamente a proposta,
**Para** evitar cálculos manuais e erros.

**Acceptance Criteria**:
- [ ] Fórmula de cálculo:
  ```
  TOTAL = (PREÇO_BASE × MULTIPLICADORES)
        + MAN_HOUR + DESLOCAMENTO
        + TAXAS + IMPOSTOS
  ```
- [ ] Breakdown detalhado visível para analista
- [ ] Analista pode ajustar manualmente (com justificativa)
- [ ] Validações: Alertas se valor muito baixo/alto

**Regras de Negócio**:
- **RN-029**: Usa tabela vigente na data da solicitação
- **RN-030**: Ajustes >20% exigem aprovação coordenador

---

### **US-011: Geração de PDF Profissional**
**Prioridade**: Must Have (P0) | **Estimativa**: 8 SP

**Como** analista,
**Eu quero** gerar PDF profissional da proposta,
**Para** enviar à empresa.

**Acceptance Criteria**:
- [ ] Seções: Resumo, Breakdown, Escopo, Timeline, Condições, Próximos Passos
- [ ] Design profissional: Logo, cores, tabelas, gráficos, QR Code
- [ ] Geração em < 5 segundos
- [ ] Template personalizável (Admin)

---

## 🗄️ Modelo de Dados

### Tabelas Necessárias

#### 1. **PricingTable** (Tabela de Preços Vigente)
```prisma
model PricingTable {
  id                  String   @id @default(uuid())
  version             String   @db.VarChar(20)  // "v1.0", "v1.1", etc.
  effectiveFrom       DateTime @map("effective_from")
  effectiveTo         DateTime? @map("effective_to")
  isActive            Boolean  @default(true) @map("is_active")

  // Preços Base por Certificação
  basePrices          Json     @map("base_prices")
  // { C1: 5000, C2: 7000, C3: 6000, C4: 8000, C5: 4000, C6: 5500 }

  // Multiplicadores
  productMultipliers  Json     @map("product_multipliers")
  // { "1-10": 1.0, "11-50": 1.3, "51-100": 1.6, "100+": 2.0 }

  shiftMultipliers    Json     @map("shift_multipliers")
  // { "1": 1.0, "2": 1.4, "3": 1.8 }

  historyMultipliers  Json     @map("history_multipliers")
  // { "nova": 1.0, "renovacao": 0.8, "ampliacao": 0.9 }

  supplierMultipliers Json     @map("supplier_multipliers")
  // { "1-5": 1.0, "6-15": 1.2, "16+": 1.5 }

  // Man-Hour
  manHourRates        Json     @map("man_hour_rates")
  // { "1-50": { hours: 8, rate: 150 }, "51-150": { hours: 16, rate: 150 }, ... }

  // Deslocamento
  travelCosts         Json     @map("travel_costs")
  // { "0-100": 0, "100-300": 500, "300-500": 1000, "500+": 2000 }

  accommodationCost   Decimal  @map("accommodation_cost") @db.Decimal(10, 2)

  // Taxas Fixas
  documentAnalysisFee Decimal  @map("document_analysis_fee") @db.Decimal(10, 2)
  committeeFee        Decimal  @map("committee_fee") @db.Decimal(10, 2)
  issuanceFee         Decimal  @map("issuance_fee") @db.Decimal(10, 2)
  taxRate             Decimal  @map("tax_rate") @db.Decimal(5, 2) // Percentual (ex: 15.00)

  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  // Relações
  proposals           Proposal[]

  @@index([isActive])
  @@index([effectiveFrom])
  @@map("pricing_tables")
}
```

#### 2. **Proposal** (Proposta Comercial)
```prisma
enum ProposalStatus {
  rascunho
  calculada
  enviada
  aceita
  recusada
  expirada
}

model Proposal {
  id                  String         @id @default(uuid())
  processId           String         @unique @map("process_id") @db.Uuid
  pricingTableId      String         @map("pricing_table_id") @db.Uuid

  // Inputs do Cálculo (snapshot)
  calculationInputs   Json           @map("calculation_inputs")
  /* {
    certificationType: "C1",
    requestType: "nova",
    numProducts: 25,
    numShifts: 2,
    numSuppliers: 8,
    numEmployees: 75,
    distance: 250,
    requiresAccommodation: true
  } */

  // Breakdown Detalhado
  breakdown           Json
  /* {
    basePrice: 5000,
    productMultiplier: 1.3,
    shiftMultiplier: 1.4,
    historyMultiplier: 1.0,
    supplierMultiplier: 1.2,
    subtotal1: 10920, // basePrice × multiplicadores

    manHourHours: 16,
    manHourRate: 150,
    manHourTotal: 2400,

    travelCost: 500,
    accommodationCost: 300,

    documentAnalysisFee: 800,
    committeeFee: 1200,
    issuanceFee: 500,

    subtotalBeforeTax: 16620,
    taxRate: 15,
    taxAmount: 2493,

    totalValue: 19113
  } */

  totalValue          Decimal        @map("total_value") @db.Decimal(10, 2)

  // Ajustes Manuais
  manualAdjustment    Decimal?       @default(0) @map("manual_adjustment") @db.Decimal(10, 2)
  adjustmentReason    String?        @map("adjustment_reason") @db.Text
  adjustedBy          String?        @map("adjusted_by") @db.Uuid

  finalValue          Decimal        @map("final_value") @db.Decimal(10, 2)

  // Status e Validade
  status              ProposalStatus @default(rascunho)
  validUntil          DateTime?      @map("valid_until") // 30 dias após envio

  // PDF
  pdfUrl              String?        @map("pdf_url") @db.Text
  pdfGeneratedAt      DateTime?      @map("pdf_generated_at")

  // Histórico
  sentAt              DateTime?      @map("sent_at")
  respondedAt         DateTime?      @map("responded_at")
  responseNotes       String?        @map("response_notes") @db.Text

  createdAt           DateTime       @default(now()) @map("created_at")
  updatedAt           DateTime       @updatedAt @map("updated_at")

  // Relações
  process             Process        @relation(fields: [processId], references: [id], onDelete: Cascade)
  pricingTable        PricingTable   @relation(fields: [pricingTableId], references: [id])
  adjuster            User?          @relation("ProposalAdjuster", fields: [adjustedBy], references: [id])

  @@index([processId])
  @@index([status])
  @@index([validUntil])
  @@map("proposals")
}
```

#### 3. **Atualizar tabela Process**
```prisma
// Adicionar relação no model Process existente
model Process {
  // ... campos existentes ...

  // ADICIONAR:
  proposal            Proposal?
}
```

#### 4. **Atualizar tabela User**
```prisma
// Adicionar relação no model User existente
model User {
  // ... campos existentes ...

  // ADICIONAR:
  adjustedProposals   Proposal[] @relation("ProposalAdjuster")
}
```

---

## 🏗️ Arquitetura Backend

### Estrutura de Pastas
```
backend/src/modules/proposal/
├── proposal.controller.ts
├── proposal.service.ts
├── proposal.routes.ts
├── proposal.types.ts
├── pricing-table.service.ts
├── calculator.service.ts
└── pdf-generator.service.ts
```

### APIs Necessárias

#### 1. **Pricing Table APIs** (Admin)
```typescript
POST   /api/pricing-tables              // Criar nova tabela de preços
GET    /api/pricing-tables              // Listar todas (com histórico)
GET    /api/pricing-tables/active       // Obter tabela ativa atual
GET    /api/pricing-tables/:id          // Obter tabela específica
PUT    /api/pricing-tables/:id          // Atualizar (cria nova versão)
DELETE /api/pricing-tables/:id          // Desativar (soft delete)
```

#### 2. **Proposal APIs** (Analista)
```typescript
POST   /api/proposals/calculate         // Calcular proposta (sem salvar)
POST   /api/proposals                   // Criar proposta para processo
GET    /api/proposals/:processId        // Obter proposta de um processo
PUT    /api/proposals/:id/adjust        // Ajustar valor manualmente
POST   /api/proposals/:id/generate-pdf  // Gerar PDF
POST   /api/proposals/:id/send          // Enviar para empresa
PUT    /api/proposals/:id/respond       // Empresa aceita/recusa
```

---

## 🎨 UI/UX Frontend

### 1. **Admin: Configuração de Preços**
**Página**: `/admin/pricing-config`

**Componentes**:
- `PricingTableList` - Lista histórico de tabelas
- `PricingTableForm` - Formulário de configuração
- `PricingPreview` - Preview de como o cálculo funciona

**Features**:
- Editor visual para todas as variáveis
- Preview em tempo real de cálculo exemplo
- Validações (preços não podem ser negativos)
- Comparação entre versões

---

### 2. **Analista: Calcular Proposta**
**Página**: `/analyst/processes/:id/proposal`

**Fluxo**:
1. Sistema busca dados do processo (Request)
2. Preenche automaticamente os inputs:
   - Tipo de certificação
   - Tipo de solicitação (nova/renovação)
   - Número de produtos
   - Número de turnos
   - Número de fornecedores
   - Número de funcionários
   - Distância (calcula via Google Maps API)
3. Exibe breakdown detalhado
4. Analista pode ajustar valor final
5. Gera PDF
6. Envia para empresa

**Componentes**:
- `ProposalCalculator` - Formulário de inputs
- `ProposalBreakdown` - Tabela detalhada de custos
- `ProposalAdjustment` - Modal para ajustes manuais
- `ProposalPDFViewer` - Preview do PDF
- `ProposalActions` - Botões de ação

---

### 3. **Empresa: Visualizar Proposta**
**Página**: `/company/processes/:id/proposal`

**Componentes**:
- `ProposalSummary` - Resumo visual
- `ProposalBreakdown` - Breakdown simplificado (sem valores internos)
- `ProposalPDFDownload` - Download do PDF
- `ProposalResponse` - Botões Aceitar/Recusar

---

## 🧮 Lógica de Cálculo

### Calculator Service
```typescript
interface CalculationInput {
  certificationType: CertificationType;
  requestType: RequestType;
  numProducts: number;
  numShifts: number;
  numSuppliers: number;
  numEmployees: number;
  distance: number; // km
  requiresAccommodation: boolean;
}

interface CalculationBreakdown {
  // Etapa 1: Base × Multiplicadores
  basePrice: number;
  productMultiplier: number;
  shiftMultiplier: number;
  historyMultiplier: number;
  supplierMultiplier: number;
  subtotal1: number;

  // Etapa 2: Man-Hour
  manHourHours: number;
  manHourRate: number;
  manHourTotal: number;

  // Etapa 3: Deslocamento
  travelCost: number;
  accommodationCost: number;

  // Etapa 4: Taxas Fixas
  documentAnalysisFee: number;
  committeeFee: number;
  issuanceFee: number;

  // Etapa 5: Impostos
  subtotalBeforeTax: number;
  taxRate: number;
  taxAmount: number;

  // Total
  totalValue: number;
}

class CalculatorService {
  calculate(input: CalculationInput, pricingTable: PricingTable): CalculationBreakdown {
    // 1. Preço Base
    const basePrice = pricingTable.basePrices[input.certificationType];

    // 2. Multiplicadores
    const productMultiplier = this.getProductMultiplier(input.numProducts, pricingTable);
    const shiftMultiplier = pricingTable.shiftMultipliers[input.numShifts];
    const historyMultiplier = pricingTable.historyMultipliers[input.requestType];
    const supplierMultiplier = this.getSupplierMultiplier(input.numSuppliers, pricingTable);

    const subtotal1 = basePrice * productMultiplier * shiftMultiplier * historyMultiplier * supplierMultiplier;

    // 3. Man-Hour
    const { hours, rate } = this.getManHourRate(input.numEmployees, pricingTable);
    const manHourTotal = hours * rate;

    // 4. Deslocamento
    const travelCost = this.getTravelCost(input.distance, pricingTable);
    const accommodationCost = input.requiresAccommodation ? pricingTable.accommodationCost : 0;

    // 5. Taxas Fixas
    const documentAnalysisFee = pricingTable.documentAnalysisFee;
    const committeeFee = pricingTable.committeeFee;
    const issuanceFee = pricingTable.issuanceFee;

    // 6. Subtotal antes dos impostos
    const subtotalBeforeTax = subtotal1 + manHourTotal + travelCost + accommodationCost +
                              documentAnalysisFee + committeeFee + issuanceFee;

    // 7. Impostos
    const taxRate = pricingTable.taxRate;
    const taxAmount = subtotalBeforeTax * (taxRate / 100);

    // 8. Total
    const totalValue = subtotalBeforeTax + taxAmount;

    return {
      basePrice,
      productMultiplier,
      shiftMultiplier,
      historyMultiplier,
      supplierMultiplier,
      subtotal1,
      manHourHours: hours,
      manHourRate: rate,
      manHourTotal,
      travelCost,
      accommodationCost,
      documentAnalysisFee,
      committeeFee,
      issuanceFee,
      subtotalBeforeTax,
      taxRate,
      taxAmount,
      totalValue
    };
  }
}
```

---

## 📄 Geração de PDF

### Template Sections

```
┌─────────────────────────────────────────────┐
│         PROPOSTA COMERCIAL                  │
│         HalalSphere Certificações           │
│         [Logo]                              │
├─────────────────────────────────────────────┤
│                                             │
│ Protocolo: HS-2025-001234                   │
│ Data: 18/11/2025                            │
│ Validade: 18/12/2025 (30 dias)              │
│                                             │
│ Cliente:                                    │
│ - Razão Social: XYZ Alimentos Ltda          │
│ - CNPJ: 12.345.678/0001-90                  │
│ - Endereço: ...                             │
│                                             │
├─────────────────────────────────────────────┤
│ 1. RESUMO EXECUTIVO                         │
├─────────────────────────────────────────────┤
│ Tipo de Certificação: C1 - Alimentos        │
│ Tipo de Solicitação: Nova Certificação     │
│                                             │
│ VALOR TOTAL: R$ 19.113,00                   │
│ Parcelamento: 3x sem juros                  │
│                                             │
├─────────────────────────────────────────────┤
│ 2. BREAKDOWN DE CUSTOS                      │
├─────────────────────────────────────────────┤
│ 2.1 Base e Multiplicadores                  │
│ - Preço Base (C1):        R$  5.000,00      │
│ - Produtos (25 un):       × 1.3             │
│ - Turnos (2):             × 1.4             │
│ - Tipo (nova):            × 1.0             │
│ - Fornecedores (8):       × 1.2             │
│ Subtotal:                 R$ 10.920,00      │
│                                             │
│ 2.2 Man-Hour                                │
│ - Horas (16h):            R$    150,00/h    │
│ Subtotal:                 R$  2.400,00      │
│                                             │
│ 2.3 Deslocamento                            │
│ - Distância (250km):      R$    500,00      │
│ - Hospedagem:             R$    300,00      │
│ Subtotal:                 R$    800,00      │
│                                             │
│ 2.4 Taxas Administrativas                   │
│ - Análise Documental:     R$    800,00      │
│ - Comitê Técnico:         R$  1.200,00      │
│ - Emissão Certificado:    R$    500,00      │
│ Subtotal:                 R$  2.500,00      │
│                                             │
│ Subtotal (antes impostos): R$ 16.620,00     │
│ Impostos (15%):            R$  2.493,00     │
│                                             │
│ VALOR TOTAL:               R$ 19.113,00     │
│                                             │
├─────────────────────────────────────────────┤
│ 3. ESCOPO DA CERTIFICAÇÃO                   │
├─────────────────────────────────────────────┤
│ - 25 produtos (ver lista anexa)             │
│ - 8 fornecedores                            │
│ - 2 turnos de produção                      │
│ - Validade: 3 anos                          │
│                                             │
├─────────────────────────────────────────────┤
│ 4. TIMELINE ESTIMADO                        │
├─────────────────────────────────────────────┤
│ [Gantt chart visual]                        │
│ - Análise Documental: 10 dias               │
│ - Auditoria Estágio 1: 2 dias               │
│ - Auditoria Estágio 2: 3 dias               │
│ - Comitê Técnico: 5 dias                    │
│ - Emissão: 2 dias                           │
│ TOTAL: ~22 dias úteis                       │
│                                             │
├─────────────────────────────────────────────┤
│ 5. CONDIÇÕES COMERCIAIS                     │
├─────────────────────────────────────────────┤
│ - Parcelamento: 3x sem juros                │
│ - Validade da Proposta: 30 dias             │
│ - Contrato: 3 anos                          │
│ - Renovação: Desconto de 20%                │
│                                             │
├─────────────────────────────────────────────┤
│ 6. PRÓXIMOS PASSOS                          │
├─────────────────────────────────────────────┤
│ 1. Aceitar proposta no sistema              │
│ 2. Assinar contrato digitalmente            │
│ 3. Enviar documentação completa             │
│ 4. Agendar auditoria                        │
│                                             │
├─────────────────────────────────────────────┤
│ [QR Code - Verificar proposta online]       │
│                                             │
│ Dúvidas? contato@halalsphere.com            │
└─────────────────────────────────────────────┘
```

### Biblioteca: `pdfkit` ou `puppeteer`

---

## 🔄 Fluxo Completo

```
1. Empresa envia solicitação
   ↓
2. Analista aprova solicitação (US-020)
   ↓
3. Sistema avança para fase "proposta_comercial"
   ↓
4. Analista acessa "Calcular Proposta"
   ↓
5. Sistema preenche inputs automaticamente do Request
   ↓
6. Sistema busca PricingTable ativa
   ↓
7. CalculatorService.calculate() → Breakdown
   ↓
8. Analista revisa breakdown
   ↓
9. (Opcional) Analista ajusta valor manualmente
   ↓
10. Sistema salva Proposal com status "calculada"
    ↓
11. PDFGeneratorService.generate() → PDF
    ↓
12. Analista clica "Enviar Proposta"
    ↓
13. Sistema:
    - Atualiza Proposal.status = "enviada"
    - Atualiza Proposal.sentAt = now()
    - Atualiza Proposal.validUntil = now() + 30 dias
    - Envia email para empresa com link + PDF
    - Cria notificação para empresa
    ↓
14. Empresa visualiza proposta no sistema
    ↓
15. Empresa clica "Aceitar Proposta"
    ↓
16. Sistema:
    - Atualiza Proposal.status = "aceita"
    - Atualiza Proposal.respondedAt = now()
    - Avança Process.currentPhase = "contrato"
    - Cria Contract automaticamente (US-013)
    - Notifica analista
```

---

## 🧪 Testes

### Unit Tests
- `calculator.service.spec.ts` - Testar todos os cálculos
- `pricing-table.service.spec.ts` - CRUD de tabelas
- `proposal.service.spec.ts` - Lógica de negócio

### Integration Tests
- `proposal.e2e.spec.ts` - Fluxo completo de proposta
- Testar versionamento de tabelas
- Testar ajustes manuais
- Testar geração de PDF

---

## 📦 Dependências Novas

```json
{
  "dependencies": {
    "pdfkit": "^0.13.0",           // Geração de PDF
    "@google/maps": "^1.1.3"       // Cálculo de distância
  }
}
```

---

## 🚀 Plano de Implementação

### Sprint 1: Database + Backend Core (8 SP)
- [ ] Criar migrations para `PricingTable` e `Proposal`
- [ ] Criar models Prisma
- [ ] Implementar `PricingTableService` (CRUD)
- [ ] Testes unitários

### Sprint 2: Calculator + APIs (13 SP)
- [ ] Implementar `CalculatorService` com lógica de cálculo
- [ ] Implementar `ProposalService` (criar, ajustar, enviar)
- [ ] Criar todas as APIs REST
- [ ] Testes de integração

### Sprint 3: PDF Generator (8 SP)
- [ ] Implementar `PDFGeneratorService`
- [ ] Design do template PDF
- [ ] Integração com QR Code
- [ ] Testes de geração

### Sprint 4: Frontend Admin (8 SP)
- [ ] Página de configuração de preços
- [ ] Formulário de tabela de preços
- [ ] Preview de cálculo

### Sprint 5: Frontend Analista (8 SP)
- [ ] Página de calcular proposta
- [ ] Componente de breakdown
- [ ] Modal de ajuste manual
- [ ] Ação de enviar proposta

### Sprint 6: Frontend Empresa (5 SP)
- [ ] Visualização de proposta
- [ ] Download de PDF
- [ ] Aceitar/Recusar proposta

---

## ✅ Total de Story Points: 29 SP

**Estimativa**: ~3-4 sprints (6-8 semanas)

---

## 📊 Métricas de Sucesso

- [ ] Tempo de criação de proposta: < 5 minutos (vs. 2-3 horas manual)
- [ ] Erros de cálculo: 0% (vs. ~15% manual)
- [ ] Satisfação do analista: > 90%
- [ ] Taxa de aceitação de propostas: > 70%
- [ ] Tempo de resposta da empresa: < 7 dias

---

## 🔗 Integrações

1. **Google Maps API**: Cálculo de distância empresa ↔ certificadora
2. **Email Service**: Envio de proposta para empresa
3. **Notification System**: Notificar empresa e analista
4. **Contract Module**: Criar contrato automaticamente após aceitação (US-013)

---

## 📝 Notas Importantes

- Tabela de preços é **versionada** - mudanças não afetam processos já iniciados
- Analista pode fazer ajustes manuais, mas com **justificativa obrigatória**
- Ajustes >20% exigem **aprovação do coordenador**
- Proposta tem **validade de 30 dias** após envio
- PDF deve ser **profissional** e **personalizável**
- Breakdown deve ser **transparente** mas não expor detalhes internos para empresa
