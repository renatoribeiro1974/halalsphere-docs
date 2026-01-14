# 📜 Proposta - Módulo de Gestão de Certificados Halal

**Data**: 04 de Dezembro de 2025
**Versão**: 1.0
**Status**: 🟡 Aguardando Aprovação

---

## 📋 Contexto

Após a conclusão do fluxo completo de certificação (solicitação → proposta → contrato → auditoria → comitê técnico), o sistema gera um **Certificado Halal** para a empresa. Este certificado possui:

- ✅ **Prazo de validade** baseado no contrato
- ✅ **Escopo de produtos** auditados e aprovados
- ✅ **Dados da empresa** (exportadora/produtora)
- ✅ **Integração futura** com sistema Syshalal

---

## 🎯 Objetivos do Módulo

1. **Gestão Completa de Certificados**
   - Emissão automática após aprovação do comitê
   - Controle de validade e renovação
   - Gestão de escopo de produtos certificados
   - Histórico de alterações

2. **Cadastro de Produtos no Escopo**
   - Produtos incluídos no certificado
   - Ingredientes e composição
   - Classificação Halal
   - Documentação associada

3. **Controle de Status e Validade**
   - Alertas de vencimento (90, 60, 30 dias)
   - Suspensão e cancelamento
   - Renovação automática

4. **Preparação para Integração Syshalal**
   - API de exportação de dados
   - Formato padronizado
   - Sincronização de cadastros

---

## 🗄️ Modelagem do Banco de Dados

### 1. Extensão do Model `Certificate`

**Arquivo**: `backend/prisma/schema.prisma`

```prisma
// ========================================
// CERTIFICADOS - EXTENSÃO
// ========================================

model Certificate {
  id                String            @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  processId         String            @map("process_id") @db.Uuid
  certificateNumber String            @unique @map("certificate_number") @db.VarChar(50) // CERT-2025-001

  // Status e Validade
  status            CertificateStatus @default(ativo)
  issuedAt          DateTime          @map("issued_at")
  expiresAt         DateTime          @map("expires_at")
  renewalDate       DateTime?         @map("renewal_date") // Data em que foi renovado

  // Documentos
  pdfUrl            String            @map("pdf_url") @db.Text
  qrCodeUrl         String            @map("qr_code_url") @db.Text
  digitalSignature  String?           @map("digital_signature") @db.Text // Hash/assinatura digital

  // Escopo
  scopeDescription  String?           @map("scope_description") @db.Text // Descrição geral do escopo
  certificationType CertificationType @map("certification_type") // C1, C2, C3, etc.

  // Empresa (denormalizado para performance)
  companyName       String            @map("company_name") @db.VarChar(255)
  companyCnpj       String            @map("company_cnpj") @db.VarChar(14)
  companyAddress    Json              @map("company_address") // Endereço completo

  // Auditoria de referência
  auditId           String?           @map("audit_id") @db.Uuid

  // Notificações de vencimento
  notified90Days    Boolean           @default(false) @map("notified_90_days")
  notified60Days    Boolean           @default(false) @map("notified_60_days")
  notified30Days    Boolean           @default(false) @map("notified_30_days")

  // Metadata
  notes             String?           @db.Text
  createdAt         DateTime          @default(now()) @map("created_at")
  updatedAt         DateTime          @updatedAt @map("updated_at")

  // Relações
  process           Process           @relation(fields: [processId], references: [id])
  audit             Audit?            @relation(fields: [auditId], references: [id])
  products          CertifiedProduct[]
  history           CertificateHistory[]
  renewals          CertificateRenewal[]

  @@index([processId])
  @@index([certificateNumber])
  @@index([status])
  @@index([expiresAt])
  @@index([companyCnpj])
  @@map("certificates")
}

// ========================================
// PRODUTOS CERTIFICADOS (ESCOPO)
// ========================================

model CertifiedProduct {
  id                String       @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  certificateId     String       @map("certificate_id") @db.Uuid

  // Identificação do Produto
  productCode       String       @map("product_code") @db.VarChar(50) // Código interno da empresa
  productName       String       @map("product_name") @db.VarChar(255)
  productNameEn     String?      @map("product_name_en") @db.VarChar(255)
  productNameAr     String?      @map("product_name_ar") @db.VarChar(255)

  // Classificação
  category          String       @db.VarChar(100) // Ex: Laticínios, Carnes, Bebidas
  subcategory       String?      @db.VarChar(100)
  origin            ProductOrigin

  // Composição
  ingredients       Json         // Lista de ingredientes com certificação
  /* {
    "ingredients": [
      {
        "name": "Leite integral",
        "percentage": 85.5,
        "origin": "Brasil",
        "halalCertified": true,
        "supplierCertificateNumber": "CERT-SUP-123"
      },
      {
        "name": "Açúcar",
        "percentage": 10.0,
        "origin": "Brasil",
        "halalCertified": true,
        "supplierCertificateNumber": "CERT-SUP-456"
      }
    ]
  } */

  // Processo Produtivo
  productionProcess String?      @db.Text // Descrição do processo
  productionLine    String?      @db.VarChar(100) // Linha de produção

  // Embalagem
  packaging         Json?        // Tipo, material, fornecedor
  /* {
    "type": "Tetra Pak",
    "material": "Cartonado multicamadas",
    "supplier": "Tetra Pak Brasil",
    "halalCertified": true
  } */

  // Informações Comerciais
  brandName         String?      @map("brand_name") @db.VarChar(100) // Marca comercial
  eanCode           String?      @map("ean_code") @db.VarChar(13) // Código de barras
  netWeight         String?      @map("net_weight") @db.VarChar(50) // Ex: "1L", "500g"

  // Mercados de Exportação
  exportMarkets     String[]     @default([]) @map("export_markets") // ["Arábia Saudita", "Emirados Árabes"]

  // Status
  isActive          Boolean      @default(true) @map("is_active")
  addedAt           DateTime     @default(now()) @map("added_at")
  removedAt         DateTime?    @map("removed_at")
  removalReason     String?      @map("removal_reason") @db.Text

  // Documentação
  productSheetUrl   String?      @map("product_sheet_url") @db.Text // Ficha técnica
  labelImageUrl     String?      @map("label_image_url") @db.Text // Foto do rótulo
  analysisReportUrl String?      @map("analysis_report_url") @db.Text // Laudo de análise

  // Metadata
  createdAt         DateTime     @default(now()) @map("created_at")
  updatedAt         DateTime     @updatedAt @map("updated_at")

  // Relações
  certificate       Certificate  @relation(fields: [certificateId], references: [id], onDelete: Cascade)

  @@index([certificateId])
  @@index([productCode])
  @@index([isActive])
  @@map("certified_products")
}

// ========================================
// HISTÓRICO DE CERTIFICADOS
// ========================================

model CertificateHistory {
  id            String              @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  certificateId String              @map("certificate_id") @db.Uuid

  action        CertificateAction
  previousStatus CertificateStatus?  @map("previous_status")
  newStatus     CertificateStatus?   @map("new_status")

  reason        String?             @db.Text
  performedBy   String              @map("performed_by") @db.Uuid // User ID
  performedAt   DateTime            @default(now()) @map("performed_at")

  // Dados alterados (JSON diff)
  changes       Json?               // {before: {...}, after: {...}}

  // Relações
  certificate   Certificate         @relation(fields: [certificateId], references: [id], onDelete: Cascade)
  user          User                @relation(fields: [performedBy], references: [id])

  @@index([certificateId])
  @@index([performedAt])
  @@map("certificate_history")
}

// ========================================
// RENOVAÇÕES DE CERTIFICADO
// ========================================

model CertificateRenewal {
  id                  String       @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  certificateId       String       @map("certificate_id") @db.Uuid

  // Certificado anterior
  previousCertNumber  String       @map("previous_cert_number") @db.VarChar(50)
  previousExpiresAt   DateTime     @map("previous_expires_at")

  // Novo certificado
  newCertNumber       String       @map("new_cert_number") @db.VarChar(50)
  newIssuedAt         DateTime     @map("new_issued_at")
  newExpiresAt        DateTime     @map("new_expires_at")

  // Auditoria de renovação
  renewalAuditId      String?      @map("renewal_audit_id") @db.Uuid
  renewalProcessId    String?      @map("renewal_process_id") @db.Uuid

  // Alterações no escopo
  scopeChanges        Json?        @map("scope_changes")
  /* {
    "productsAdded": ["PRD-123", "PRD-456"],
    "productsRemoved": ["PRD-789"],
    "ingredientsChanged": ["PRD-001"]
  } */

  notes               String?      @db.Text
  createdAt           DateTime     @default(now()) @map("created_at")

  // Relações
  certificate         Certificate  @relation(fields: [certificateId], references: [id], onDelete: Cascade)
  renewalAudit        Audit?       @relation(fields: [renewalAuditId], references: [id])
  renewalProcess      Process?     @relation(fields: [renewalProcessId], references: [id])

  @@index([certificateId])
  @@index([previousCertNumber])
  @@index([newCertNumber])
  @@map("certificate_renewals")
}

// ========================================
// ENUMS ADICIONAIS
// ========================================

enum CertificateAction {
  emitido           // Certificado emitido pela primeira vez
  renovado          // Certificado renovado
  suspenso          // Certificado suspenso temporariamente
  reativado         // Certificado reativado após suspensão
  cancelado         // Certificado cancelado definitivamente
  escopo_alterado   // Escopo de produtos alterado
  dados_atualizados // Dados da empresa atualizados
  expirado          // Certificado expirou automaticamente
}
```

### 2. Relações Adicionais nos Models Existentes

```prisma
// Adicionar ao model Audit
model Audit {
  // ... campos existentes ...
  certificates      Certificate[]
  renewals          CertificateRenewal[]
}

// Adicionar ao model Process
model Process {
  // ... campos existentes ...
  renewals          CertificateRenewal[]
}

// Adicionar ao model User
model User {
  // ... campos existentes ...
  certificateHistory CertificateHistory[]
}
```

---

## 🏗️ Arquitetura do Módulo

### Estrutura de Pastas

```
backend/src/modules/certificate/
├── certificate.service.ts          # Lógica de negócio
├── certificate.controller.ts       # Handlers das rotas
├── certificate.routes.ts           # Definição de rotas
├── certificate.types.ts            # Interfaces TypeScript
├── certificate-product.service.ts  # Gestão de produtos
├── certificate-renewal.service.ts  # Gestão de renovações
└── jobs/
    └── certificate-expiry-check.ts # Job de verificação de vencimento
```

---

## 🔧 Funcionalidades Principais

### 1. **Emissão Automática de Certificado**

**Trigger**: Quando o processo atinge a fase `certificado_emitido`

**Fluxo**:
1. Comitê técnico aprova o processo
2. Sistema atualiza processo para fase `certificado_emitido`
3. Service `certificate.service.ts` é acionado automaticamente
4. Gera número do certificado (CERT-YYYY-NNNNNN)
5. Calcula data de validade baseada no contrato
6. Extrai escopo de produtos da auditoria
7. Gera PDF do certificado com QR Code
8. Cria registros na tabela `certificates` e `certified_products`
9. Envia notificação por email para empresa

**Endpoint**:
```typescript
POST /api/certificates/issue
Body: {
  processId: string,
  auditId: string,
  scopeDescription?: string
}
```

---

### 2. **Gestão de Produtos no Escopo**

#### Adicionar Produto
```typescript
POST /api/certificates/:certificateId/products
Body: {
  productCode: string,
  productName: string,
  category: string,
  ingredients: Ingredient[],
  packaging?: PackagingInfo,
  exportMarkets?: string[]
}
```

#### Remover Produto do Escopo
```typescript
DELETE /api/certificates/:certificateId/products/:productId
Body: {
  reason: string
}
```

#### Atualizar Produto
```typescript
PUT /api/certificates/:certificateId/products/:productId
Body: {
  // Campos permitidos para atualização
  ingredients?: Ingredient[],
  exportMarkets?: string[]
}
```

#### Listar Produtos do Certificado
```typescript
GET /api/certificates/:certificateId/products
Query: {
  isActive?: boolean,
  category?: string,
  search?: string
}
```

---

### 3. **Controle de Validade e Alertas**

#### Job de Verificação Diária
```typescript
// Executa todo dia às 08:00
cron.schedule('0 8 * * *', async () => {
  await certificateService.checkExpiringCertificates();
});
```

**Lógica**:
1. Busca certificados ativos
2. Calcula dias até expiração
3. Envia alertas:
   - **90 dias**: Email para empresa + analista
   - **60 dias**: Email + notificação no sistema
   - **30 dias**: Email urgente + notificação + WhatsApp (futuro)
4. Atualiza flags `notified90Days`, `notified60Days`, `notified30Days`

#### Expiração Automática
```typescript
// Executa todo dia às 00:00
cron.schedule('0 0 * * *', async () => {
  await certificateService.expireCertificates();
});
```

**Lógica**:
1. Busca certificados com `expiresAt < hoje`
2. Atualiza status para `expirado`
3. Cria registro no histórico
4. Envia notificação final

---

### 4. **Suspensão e Cancelamento**

#### Suspender Certificado
```typescript
PUT /api/certificates/:certificateId/suspend
Body: {
  reason: string,
  suspendProducts?: string[] // IDs dos produtos afetados
}
```

**Casos de Uso**:
- Não conformidade detectada em auditoria de vigilância
- Problema com fornecedor de ingrediente
- Solicitação voluntária da empresa

#### Reativar Certificado
```typescript
PUT /api/certificates/:certificateId/reactivate
Body: {
  reason: string,
  evidenceUrls?: string[]
}
```

#### Cancelar Certificado
```typescript
PUT /api/certificates/:certificateId/cancel
Body: {
  reason: string,
  permanent: boolean
}
```

---

### 5. **Renovação de Certificado**

#### Iniciar Processo de Renovação
```typescript
POST /api/certificates/:certificateId/renew
Body: {
  scopeChanges?: {
    productsToAdd?: string[],
    productsToRemove?: string[]
  }
}
```

**Fluxo**:
1. Cria novo `Request` com tipo `renovacao`
2. Vincula ao certificado anterior
3. Copia dados da empresa e produtos do escopo
4. Inicia novo `Process` de renovação
5. Desconto automático na proposta (80% do valor base)

---

### 6. **Consulta e Relatórios**

#### Listar Certificados
```typescript
GET /api/certificates
Query: {
  status?: 'ativo' | 'suspenso' | 'cancelado' | 'expirado',
  companyName?: string,
  certificateNumber?: string,
  expiringInDays?: number, // Ex: 30 (certificados que vencem em até 30 dias)
  page?: number,
  limit?: number
}
```

#### Detalhes do Certificado
```typescript
GET /api/certificates/:certificateId
Include: {
  products: true,
  history: true,
  renewals: true,
  process: {
    include: { request: { include: { company: true } } }
  }
}
```

#### Dashboard de Certificados
```typescript
GET /api/certificates/dashboard
Response: {
  totalActive: number,
  totalSuspended: number,
  expiringIn30Days: number,
  expiringIn60Days: number,
  expiringIn90Days: number,
  totalProducts: number,
  recentlyIssued: Certificate[],
  recentlyExpired: Certificate[]
}
```

#### Relatório de Vencimentos
```typescript
GET /api/certificates/expiry-report
Query: {
  startDate: string,
  endDate: string,
  format: 'json' | 'pdf' | 'excel'
}
```

---

## 📄 Geração de PDF do Certificado

### Template do Certificado

```typescript
// backend/src/services/certificate-pdf.service.ts

export class CertificatePdfService {
  async generateCertificate(certificateId: string): Promise<string> {
    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId },
      include: {
        products: { where: { isActive: true } },
        process: {
          include: {
            request: { include: { company: true } }
          }
        }
      }
    });

    // Gera PDF com:
    // 1. Logo HalalSphere + Logo Certificação Internacional
    // 2. Título: "CERTIFICADO HALAL"
    // 3. Número do certificado + QR Code
    // 4. Dados da empresa certificada
    // 5. Escopo de produtos (tabela)
    // 6. Validade: De DD/MM/AAAA até DD/MM/AAAA
    // 7. Tipo de certificação (C1, C2, etc.)
    // 8. Assinatura digital do diretor técnico
    // 9. Observações e condições
    // 10. Rodapé: "Este certificado é válido somente para..."

    return pdfPath;
  }
}
```

---

## 🔗 API de Integração Syshalal

### Estrutura da API de Exportação

```typescript
// Endpoint para exportação de dados para Syshalal
POST /api/integrations/syshalal/export
Body: {
  certificateIds?: string[], // Se vazio, exporta todos ativos
  includeExpired?: boolean
}

Response: {
  success: true,
  data: {
    certificates: [
      {
        certificateNumber: "CERT-2025-001",
        companyData: {
          cnpj: "12.345.678/0001-90",
          razaoSocial: "Empresa ABC Ltda",
          address: {...},
          contact: {...}
        },
        products: [
          {
            productCode: "PRD-001",
            productName: "Leite Integral",
            category: "Laticínios",
            ingredients: [...],
            exportMarkets: ["Arábia Saudita"],
            certificationDate: "2025-01-15",
            expiryDate: "2027-01-15"
          }
        ],
        issuedAt: "2025-01-15",
        expiresAt: "2027-01-15",
        status: "ativo"
      }
    ],
    exportedAt: "2025-12-04T16:00:00Z",
    totalCertificates: 15,
    totalProducts: 247
  }
}
```

### Webhook para Sincronização

```typescript
// Syshalal pode registrar um webhook para receber atualizações
POST /api/integrations/syshalal/webhook/register
Body: {
  url: "https://syshalal.com/api/webhooks/halalsphere",
  secret: "shared-secret-key",
  events: ["certificate.issued", "certificate.renewed", "certificate.expired"]
}

// Quando um evento ocorre, HalalSphere envia:
POST https://syshalal.com/api/webhooks/halalsphere
Headers: {
  X-HalalSphere-Signature: "hmac-sha256-signature"
}
Body: {
  event: "certificate.issued",
  timestamp: "2025-12-04T16:00:00Z",
  data: {
    certificateId: "uuid",
    certificateNumber: "CERT-2025-001",
    companyData: {...},
    products: [...]
  }
}
```

---

## 🎨 Interface Frontend

### Páginas a Criar

#### 1. **Listagem de Certificados** (`/certificates`)
- Tabela com filtros (status, empresa, vencimento)
- Busca por número de certificado ou CNPJ
- Cards com métricas (ativos, expirando, suspensos)
- Ações: Visualizar, Download PDF, Renovar

#### 2. **Detalhes do Certificado** (`/certificates/:id`)
- Informações principais
- Lista de produtos no escopo (tabela)
- Timeline de histórico
- Botões: Suspender, Cancelar, Adicionar Produto

#### 3. **Gestão de Produtos** (`/certificates/:id/products`)
- Formulário para adicionar produto
- Lista de produtos com status
- Upload de documentação (ficha técnica, rótulo)
- Gestão de ingredientes

#### 4. **Dashboard de Certificados** (`/dashboard/certificates`)
- Gráficos:
  - Certificados emitidos por mês
  - Distribuição por tipo (C1, C2, C3...)
  - Taxa de renovação
  - Alertas de vencimento (timeline)
- Ações rápidas: Renovar, Visualizar vencimentos

---

## 📊 Relatórios e Analytics

### Relatórios Disponíveis

1. **Relatório de Certificados Ativos**
   - Listagem completa com escopo
   - Exportar em PDF/Excel

2. **Relatório de Vencimentos**
   - Certificados que vencem em período específico
   - Agrupado por mês

3. **Relatório de Escopo**
   - Produtos certificados por categoria
   - Ingredientes mais utilizados
   - Mercados de exportação

4. **Relatório de Histórico**
   - Todas as alterações em certificados
   - Filtros por período e tipo de ação

---

## ⚙️ Configurações e Regras de Negócio

### Configurações Globais

```typescript
// backend/src/config/certificate.config.ts

export const certificateConfig = {
  // Validade padrão (em meses)
  defaultValidityMonths: 24,

  // Alertas de vencimento
  expiryAlerts: {
    days90: true,
    days60: true,
    days30: true
  },

  // Numeração de certificados
  numberFormat: "CERT-{YEAR}-{SEQUENCE:6}",

  // PDF
  pdfTemplate: "default",
  includeQrCode: true,
  includeDigitalSignature: true,

  // Renovação
  renewalDiscountPercentage: 20, // 20% de desconto
  renewalAdvanceDays: 90, // Permite renovar 90 dias antes do vencimento

  // Escopo
  maxProductsPerCertificate: 500,
  requireProductDocumentation: true,

  // Integração Syshalal
  syshalal: {
    enabled: false, // Ativar quando estiver pronto
    apiUrl: "https://api.syshalal.com",
    apiKey: process.env.SYSHALAL_API_KEY,
    syncInterval: "daily" // daily, weekly, manual
  }
};
```

### Regras de Validação

1. **Emissão de Certificado**
   - ✅ Processo deve estar na fase `certificado_emitido`
   - ✅ Auditoria deve estar concluída com resultado aprovado
   - ✅ Comitê técnico deve ter aprovado
   - ✅ Contrato deve estar assinado

2. **Adição de Produto ao Escopo**
   - ✅ Produto deve ter sido auditado
   - ✅ Ingredientes devem ter certificação Halal
   - ✅ Embalagem deve ser certificada (se aplicável)
   - ✅ Documentação completa (ficha técnica, rótulo)

3. **Renovação**
   - ✅ Pode iniciar até 90 dias antes do vencimento
   - ✅ Certificado deve estar ativo ou próximo ao vencimento
   - ✅ Não pode ter não conformidades abertas

4. **Suspensão**
   - ✅ Apenas certificados ativos podem ser suspensos
   - ✅ Requer justificativa obrigatória
   - ✅ Notifica empresa imediatamente

---

## 🧪 Testes

### Testes Unitários

```typescript
// certificate.service.spec.ts
describe('CertificateService', () => {
  it('deve emitir certificado após aprovação do comitê');
  it('deve calcular data de validade corretamente');
  it('deve gerar número de certificado único');
  it('deve adicionar produto ao escopo');
  it('deve remover produto com justificativa');
  it('deve suspender certificado com motivo válido');
  it('deve enviar alertas de vencimento nos prazos corretos');
  it('deve expirar certificado automaticamente');
  it('deve iniciar processo de renovação');
});
```

### Testes de Integração

```typescript
// certificate.integration.spec.ts
describe('Certificate Integration', () => {
  it('deve criar certificado quando processo for aprovado');
  it('deve gerar PDF do certificado');
  it('deve enviar email de emissão');
  it('deve atualizar escopo via API');
  it('deve exportar dados para Syshalal');
});
```

---

## 📅 Cronograma de Implementação

### Fase 1: Database e Models (2 dias)
- ✅ Atualizar schema Prisma
- ✅ Criar migrations
- ✅ Gerar Prisma Client
- ✅ Seeds de dados de teste

### Fase 2: Backend - Core (3 dias)
- ✅ Service: `certificate.service.ts`
- ✅ Service: `certificate-product.service.ts`
- ✅ Controller: `certificate.controller.ts`
- ✅ Routes: `certificate.routes.ts`
- ✅ Types: Interfaces TypeScript

### Fase 3: Backend - Features Avançadas (2 dias)
- ✅ Geração de PDF
- ✅ Job de verificação de vencimento
- ✅ Service de renovação
- ✅ Histórico de alterações

### Fase 4: Frontend - Listagem e Detalhes (3 dias)
- ✅ Página de listagem de certificados
- ✅ Página de detalhes do certificado
- ✅ Dashboard de certificados
- ✅ Serviço de API frontend

### Fase 5: Frontend - Gestão de Produtos (2 dias)
- ✅ Formulário de adição de produto
- ✅ Listagem de produtos do escopo
- ✅ Upload de documentação
- ✅ Edição e remoção de produtos

### Fase 6: Integração Syshalal (2 dias)
- ✅ API de exportação
- ✅ Webhook para sincronização
- ✅ Documentação da API
- ✅ Testes de integração

### Fase 7: Testes e Ajustes (2 dias)
- ✅ Testes unitários
- ✅ Testes de integração
- ✅ Testes E2E
- ✅ Correções e otimizações

**Total Estimado**: 16 dias úteis (3-4 semanas)

---

## 💰 Estimativa de Esforço

| Fase | Esforço (horas) | Complexidade |
|------|-----------------|--------------|
| Database | 16h | Média |
| Backend Core | 24h | Alta |
| Features Avançadas | 16h | Alta |
| Frontend Básico | 24h | Média |
| Gestão Produtos | 16h | Média |
| Integração Syshalal | 16h | Alta |
| Testes | 16h | Média |
| **TOTAL** | **128h** | **Alta** |

---

## 🚀 Benefícios do Módulo

### Para a HalalSphere
- ✅ **Controle Completo**: Gestão centralizada de todos os certificados
- ✅ **Automatização**: Alertas e expirações automáticas
- ✅ **Rastreabilidade**: Histórico completo de alterações
- ✅ **Conformidade**: Cadastro detalhado de produtos e ingredientes
- ✅ **Receita Recorrente**: Facilita processo de renovação

### Para as Empresas Certificadas
- ✅ **Transparência**: Acesso completo ao escopo do certificado
- ✅ **Alertas**: Notificações de vencimento com antecedência
- ✅ **Facilidade**: Renovação simplificada e rápida
- ✅ **Credibilidade**: Certificado digital com QR Code

### Para Auditores/Analistas
- ✅ **Eficiência**: Emissão automática após aprovação
- ✅ **Visibilidade**: Dashboard com todos os certificados
- ✅ **Controle**: Gestão de suspensões e cancelamentos

---

## 📝 Próximos Passos

1. **Aprovação da Proposta**
   - Revisar estrutura de dados
   - Validar regras de negócio
   - Confirmar integrações necessárias

2. **Refinamento Técnico**
   - Definir prioridades de features
   - Ajustar cronograma se necessário
   - Planejar releases incrementais

3. **Kick-off da Implementação**
   - Setup do ambiente
   - Criar branch de desenvolvimento
   - Iniciar pela modelagem do banco

---

## ❓ Perguntas em Aberto

1. **Syshalal**:
   - Já existe documentação da API do Syshalal?
   - Quais dados exatos eles precisam receber?
   - Autenticação: API Key, OAuth, ou outro método?

2. **Validação de Ingredientes**:
   - Deve haver um cadastro global de ingredientes permitidos?
   - Quem mantém esse cadastro?

3. **Assinatura Digital**:
   - Qual método de assinatura digital usar? (ICP-Brasil, outro?)
   - Certificado A1, A3, ou assinatura eletrônica simples?

4. **Renovação**:
   - Renovação requer nova auditoria completa ou pode ser simplificada?
   - Desconto de 20% é aplicável a todos os tipos?

5. **Multilíngue**:
   - Certificado deve ser emitido em PT/EN/AR simultaneamente?
   - Apenas o PDF ou também a interface?

---

## 📚 Documentação Complementar

- 📖 [GSO 2055-2] Classificação Industrial Halal
- 📖 [DT 7.1] Documento Técnico de Auditoria
- 📖 [Manual BPF] Boas Práticas de Fabricação Halal
- 📖 [API Syshalal] Documentação da integração (a definir)

---

## ✅ Checklist de Aprovação

- [ ] Modelagem de dados aprovada
- [ ] Regras de negócio validadas
- [ ] Cronograma aceito
- [ ] Integração Syshalal definida
- [ ] Perguntas em aberto respondidas
- [ ] Prioridades de features definidas

---

**Elaborado por**: Claude Code (Assistente de IA)
**Data**: 04 de Dezembro de 2025
**Versão**: 1.0
**Status**: 🟡 Aguardando Aprovação

---

## 🎯 Resumo Executivo

Esta proposta apresenta um **módulo completo de gestão de certificados Halal** que:

1. ✅ **Emite certificados automaticamente** após aprovação do comitê técnico
2. ✅ **Gerencia escopo de produtos** com detalhes completos de ingredientes
3. ✅ **Controla validade** com alertas automáticos de vencimento
4. ✅ **Facilita renovações** com processo simplificado e desconto
5. ✅ **Prepara integração** com sistema Syshalal via API padronizada
6. ✅ **Mantém histórico** completo de todas as alterações
7. ✅ **Gera relatórios** para análise e compliance

O módulo se integra perfeitamente ao fluxo existente do HalalSphere e adiciona a **camada final** do processo de certificação, completando o ciclo de vida completo desde a solicitação até a gestão do certificado emitido.

**Recomendação**: Implementar em fases incrementais, começando pelas funcionalidades core (emissão, listagem, produtos) e depois evoluindo para features avançadas (renovação automática, integração Syshalal).
