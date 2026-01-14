# Implementação do Sistema de Contratos com Assinatura Eletrônica

## 📋 Resumo da Implementação

Foi implementado um sistema completo de gestão de contratos com assinatura eletrônica configurável, incluindo:

- ✅ Geração automática de contratos a partir de propostas aceitas
- ✅ Templates HTML personalizáveis
- ✅ Geração de PDF com Puppeteer
- ✅ Integração com D4Sign e ClickSign (configurável)
- ✅ Rastreamento de assinaturas individuais
- ✅ Webhooks para eventos de assinatura

---

## 🗄️ Database Schema

### Novos Models

#### `Contract`
```prisma
model Contract {
  // Identificação
  id              String
  contractNumber  String         // HS-CONT-2025-0001

  // Relações
  processId       String
  companyId       String
  proposalId      String?

  // Dados do Contrato
  contractType    ContractType
  status          ContractStatus
  totalValue      Decimal
  numInstallments Int
  paymentTerms    Json           // {method, dueDay, installmentValue}
  validityMonths  Int
  startDate       DateTime?
  endDate         DateTime?

  // Template e Conteúdo
  templateVersion String?        // v1.0, v2.0
  contractData    Json           // Snapshot completo dos dados
  customClauses   Json?          // Cláusulas adicionais

  // PDF
  pdfUrl          String?
  pdfGeneratedAt  DateTime?

  // Assinatura Eletrônica
  eSignatureProvider ESignatureProvider?
  eSignatureDocId    String?     // ID na plataforma (D4Sign/ClickSign)
  eSignatureUrl      String?     // URL para assinatura

  // Timestamps
  sentAt          DateTime?
  signedAt        DateTime?
  canceledAt      DateTime?
  createdAt       DateTime
  updatedAt       DateTime

  // Relações
  signatures      ContractSignature[]
}
```

#### `ContractSignature`
```prisma
model ContractSignature {
  id                 String
  contractId         String

  // Dados do Signatário
  signerName         String
  signerEmail        String
  signerRole         String
  signerType         String     // "empresa" ou "certificadora"

  // Status
  status             SignatureStatus
  signedAt           DateTime?
  ipAddress          String?
  location           String?

  // Integração Plataforma
  eSignatureSignerId String?
  eSignatureUrl      String?
  signatureData      Json?      // Metadados da assinatura

  createdAt          DateTime
  updatedAt          DateTime
}
```

#### `ESignatureConfig`
```prisma
model ESignatureConfig {
  id       String
  provider ESignatureProvider    // none, d4sign, clicksign, docusign

  // Configurações D4Sign
  d4signApiKey      String?
  d4signCryptoKey   String?
  d4signSafeId      String?
  d4signEnvironment String?      // sandbox/production

  // Configurações ClickSign
  clicksignApiKey      String?
  clicksignEnvironment String?

  // Configurações DocuSign
  docusignIntegrationKey String?
  docusignUserId         String?
  docusignAccountId      String?
  docusignEnvironment    String?
  docusignPrivateKey     String?

  // Configurações Gerais
  autoSendOnCreate Boolean       // true = envia automaticamente
  expirationDays   Int            // 30 dias padrão
  reminderDays     Int            // 7 dias padrão

  isActive         Boolean
  createdAt        DateTime
  updatedAt        DateTime
}
```

### Novos Enums

```prisma
enum ESignatureProvider {
  none
  d4sign
  clicksign
  docusign
}

enum SignatureStatus {
  pendente
  assinado
  rejeitado
  cancelado
  expirado
}
```

---

## 🏗️ Arquitetura Backend

### Services

#### 1. **Contract Template Service**
📁 `backend/src/services/contract/contract-template.service.ts`

Responsável por gerenciar templates de contrato usando Handlebars.

**Principais métodos:**
- `loadTemplate(version)` - Carrega e compila template
- `renderContract(data, version)` - Renderiza contrato com dados
- `listTemplates()` - Lista templates disponíveis
- `templateExists(version)` - Verifica se template existe

**Helpers Handlebars:**
- `formatCurrency` - Formata valores monetários
- `formatDate` - Formata datas
- `numberToWords` - Converte números para extenso
- `ifEquals` - Condicional customizado

#### 2. **PDF Generator Service**
📁 `backend/src/services/contract/pdf-generator.service.ts`

Gera PDFs a partir de HTML usando Puppeteer.

**Principais métodos:**
- `generateContractPdf(data, contractNumber, version)` - Gera PDF completo
- `generatePreviewPdf(data, version)` - Gera preview sem salvar
- `generatePdfFromHtml(html, fileName)` - Gera PDF de HTML
- `deletePdf(fileName)` - Remove PDF
- `readPdf(fileName)` - Lê PDF existente

#### 3. **E-Signature Providers**

##### Base Provider (Abstrato)
📁 `backend/src/services/e-signature/base-provider.ts`

Interface abstrata que todos os providers implementam:

```typescript
abstract class ESignatureProvider {
  abstract createDocument(request): Promise<CreateDocumentResponse>
  abstract getDocumentStatus(documentId): Promise<DocumentStatusResponse>
  abstract cancelDocument(documentId): Promise<void>
  abstract resendNotification(documentId, signerId): Promise<void>
  abstract processWebhook(payload): Promise<SignatureEventWebhook>
  abstract validateCredentials(): Promise<boolean>
  abstract downloadSignedDocument(documentId): Promise<Buffer>
}
```

##### D4Sign Provider
📁 `backend/src/services/e-signature/d4sign-provider.ts`

Implementação completa para D4Sign API.

**Funcionalidades:**
- Upload de documentos em Base64
- Criação de lista de signatários
- Envio automático para assinatura
- Consulta de status
- Processamento de webhooks

##### ClickSign Provider
📁 `backend/src/services/e-signature/clicksign-provider.ts`

Implementação completa para ClickSign API.

**Funcionalidades:**
- Upload de documentos
- Gestão de signatários
- Controle de deadline
- Webhooks de eventos

#### 4. **E-Signature Config Service**
📁 `backend/src/services/e-signature/e-signature-config.service.ts`

Gerencia configurações de assinatura eletrônica.

**Principais métodos:**
- `getActiveConfig()` - Busca configuração ativa
- `upsertConfig(data)` - Cria/atualiza configuração
- `activateConfig(id)` - Ativa configuração específica
- `getActiveProvider()` - Retorna instância do provider ativo
- `testCredentials(data)` - Testa credenciais

#### 5. **Contract Service** (Principal)
📁 `backend/src/modules/contract/contract.service.ts`

Orquestra todo o fluxo de contratos.

**Principais métodos:**

**Criação:**
- `create(data)` - Cria contrato a partir de proposta aceita
- `generateContractNumber()` - Gera número sequencial (HS-CONT-YYYY-NNNN)

**Gestão:**
- `findById(id)` - Busca por ID
- `findByProcessId(processId)` - Busca por processo
- `findAll(filters)` - Lista com filtros
- `update(id, data)` - Atualiza (apenas rascunho)

**PDF e Assinatura:**
- `generatePDF(id)` - Gera PDF do contrato
- `sendForSignature(id, dto)` - Envia para assinatura eletrônica
- `processSignatureWebhook(payload)` - Processa eventos de assinatura

**Fluxo:**
- `sign(id, data)` - Marca contrato como assinado
- `cancel(id, reason)` - Cancela contrato
- `negotiate(id)` - Marca como em negociação

**Estatísticas:**
- `getStats()` - Estatísticas gerais de contratos

---

## 📄 Templates

### Template Padrão v1
📁 `backend/src/templates/contract-template-v1.html`

Template HTML completo com:

**Seções:**
1. Header com número e data do contrato
2. Identificação das partes (Contratante e Contratada)
3. Objeto do contrato
4. Valor e condições de pagamento
5. Vigência
6. Obrigações da contratada
7. Obrigações da contratante
8. Confidencialidade
9. Rescisão
10. Cláusulas personalizadas (opcionais)
11. Disposições gerais
12. Seção de assinaturas

**Variáveis Handlebars:**
- `{{contractNumber}}` - Número do contrato
- `{{company.*}}` - Dados da empresa
- `{{services.*}}` - Dados dos serviços
- `{{payment.*}}` - Condições de pagamento
- `{{validity.*}}` - Datas de vigência
- `{{signers.*}}` - Dados dos signatários
- `{{#each customClauses}}` - Cláusulas adicionais

**Estilização:**
- CSS embutido com fonte Times New Roman
- Formatação profissional para impressão/PDF
- Quebras de página adequadas
- Cabeçalho e rodapé automáticos

---

## 🔄 Fluxo Completo

### 1. Criação do Contrato

```typescript
// 1. Proposta é aceita pela empresa
await proposalService.respond(proposalId, { accepted: true });

// 2. Processo avança para fase de elaboração_contrato
// (feito automaticamente pelo ProposalService)

// 3. Departamento Jurídico cria o contrato
const contract = await contractService.create({
  processId: process.id,
  contractType: 'contrato',
  numInstallments: 12,
  paymentMethod: 'boleto',
  paymentDueDay: 10,
  validityMonths: 12,
  startDate: new Date(),
  customClauses: [...], // Opcional
  signers: {
    companyName: 'João Silva',
    companyEmail: 'joao@empresa.com',
    companyRole: 'Diretor',
    certifierName: 'Maria Santos',
    certifierEmail: 'maria@halalsphere.com',
    certifierRole: 'Gerente Jurídico',
  },
});

// Resultado:
// - Contrato criado com status 'rascunho'
// - Número gerado automaticamente (HS-CONT-2025-0001)
// - Dados da proposta salvos como snapshot
// - 2 registros de assinatura criados (empresa + certificadora)
```

### 2. Geração de PDF

```typescript
// Gera PDF do contrato
const pdfUrl = await contractService.generatePDF(contract.id);

// Processo:
// 1. Carrega template HTML (v1 por padrão)
// 2. Renderiza com dados do contrato usando Handlebars
// 3. Converte HTML para PDF com Puppeteer
// 4. Salva em uploads/contracts/
// 5. Atualiza contrato com pdfUrl
```

### 3. Envio para Assinatura

```typescript
// Envia contrato para assinatura eletrônica
const updatedContract = await contractService.sendForSignature(contract.id);

// Processo:
// 1. Verifica se PDF existe, se não, gera
// 2. Busca configuração ativa de assinatura eletrônica
// 3. Se configurado (D4Sign ou ClickSign):
//    a. Cria documento na plataforma
//    b. Adiciona signatários
//    c. Envia para assinatura
//    d. Atualiza registros com IDs e URLs da plataforma
// 4. Se não configurado:
//    a. Envia apenas por email (manual)
// 5. Atualiza status para 'enviado'
// 6. Processo avança para fase 'assinatura_contrato'
```

### 4. Processamento de Assinaturas (Webhook)

```typescript
// Webhook recebido da plataforma de assinatura
await contractService.processSignatureWebhook(webhookPayload);

// Processo:
// 1. Provider processa o webhook (normaliza dados)
// 2. Identifica contrato pelo documentId
// 3. Atualiza assinatura específica:
//    - Status (assinado/rejeitado/etc)
//    - Data de assinatura
//    - IP e localização
// 4. Verifica se todas as assinaturas foram completadas
// 5. Se sim:
//    a. Atualiza contrato para 'assinado'
//    b. Processo avança para 'avaliacao_documental'
//    c. Notifica equipe técnica
```

---

## 🔐 Configuração de Assinatura Eletrônica

### D4Sign

```json
{
  "provider": "d4sign",
  "d4signApiKey": "sua-api-key",
  "d4signCryptoKey": "sua-crypto-key",
  "d4signSafeId": "id-do-cofre",
  "d4signEnvironment": "production", // ou "sandbox"
  "autoSendOnCreate": true,
  "expirationDays": 30,
  "reminderDays": 7
}
```

### ClickSign

```json
{
  "provider": "clicksign",
  "clicksignApiKey": "sua-api-key",
  "clicksignEnvironment": "production", // ou "sandbox"
  "autoSendOnCreate": true,
  "expirationDays": 30,
  "reminderDays": 7
}
```

### Sem Assinatura Eletrônica

```json
{
  "provider": "none"
}
```

---

## 📊 Estrutura de Dados do Contrato

```typescript
interface ContractData {
  company: {
    name: string;
    taxId: string;
    taxIdFormatted: string;
    address: any;
    contact: any;
  };

  proposal: {
    totalValue: number;
    finalValue: number;
    breakdown: any;
    validityMonths: number;
  };

  services: {
    certificationType: string;
    productDescription: string;
    scope: string[];
  };

  payment: {
    totalValue: number;
    numInstallments: number;
    installmentValue: number;
    paymentMethod: string;
    dueDay: number;
  };

  validity: {
    startDate: Date;
    endDate: Date;
    months: number;
  };

  signers: {
    company: {
      name: string;
      email: string;
      role: string;
    };
    certifier: {
      name: string;
      email: string;
      role: string;
    };
  };
}
```

---

## 🎯 Próximos Passos

### Backend (Faltam)
- [ ] Controllers para contratos
- [ ] Controllers para configuração de assinatura
- [ ] Rotas REST
- [ ] Webhooks endpoints

### Frontend (Pendente)
- [ ] Tela de configuração de assinatura eletrônica
- [ ] Interface de visualização de contratos
- [ ] Interface de assinatura
- [ ] Preview de PDF antes do envio
- [ ] Dashboard de contratos

### Melhorias Futuras
- [ ] Implementar provider DocuSign
- [ ] Múltiplos templates personalizáveis por empresa
- [ ] Editor de templates via interface
- [ ] Conversão de valores para extenso (biblioteca)
- [ ] Notificações por email
- [ ] Lembretes automáticos de assinatura pendente
- [ ] Download de contratos assinados
- [ ] Histórico de versões de contrato

---

## 📦 Dependências Instaladas

```json
{
  "handlebars": "^4.7.8",
  "puppeteer": "^22.x",
  "axios": "^1.x"
}
```

---

## 🧪 Testes

### Testar Geração de Contrato

```typescript
const contractService = new ContractService();

// Criar contrato
const contract = await contractService.create({
  processId: 'process-uuid',
  contractType: 'contrato',
  numInstallments: 12,
  paymentMethod: 'boleto',
  validityMonths: 12,
  startDate: new Date(),
  signers: { /* ... */ },
});

// Gerar PDF
const pdfUrl = await contractService.generatePDF(contract.id);
console.log('PDF gerado:', pdfUrl);
```

### Testar Configuração de Assinatura

```typescript
const configService = new ESignatureConfigService();

// Testar credenciais D4Sign
const isValid = await configService.testCredentials({
  provider: 'd4sign',
  d4signApiKey: 'key',
  d4signCryptoKey: 'crypto',
  d4signSafeId: 'safe',
  d4signEnvironment: 'sandbox',
});

console.log('Credenciais válidas:', isValid);
```

---

## 🐛 Troubleshooting

### PDF não gera

1. Verificar se Puppeteer instalou corretamente
2. Verificar permissões da pasta `uploads/contracts/`
3. Verificar logs do Puppeteer

### Assinatura eletrônica falha

1. Verificar credenciais na configuração
2. Testar credenciais com `testCredentials()`
3. Verificar logs de erro do provider
4. Verificar se URL do PDF é acessível externamente

### Template não renderiza

1. Verificar se arquivo template existe
2. Verificar sintaxe Handlebars
3. Verificar se dados estão completos
4. Testar com `renderContract()` diretamente

---

## 📞 Suporte

Para dúvidas ou problemas:
- Verificar logs do servidor
- Consultar documentação das APIs (D4Sign, ClickSign)
- Revisar este documento

---

**Documentação gerada em:** Dezembro de 2025
**Versão:** 1.0.0
