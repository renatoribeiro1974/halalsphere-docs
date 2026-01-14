# 🔄 Proposta de Ajustes - Processo de Certificação Halal

**Data**: 08 de Dezembro de 2025
**Versão**: 2.0
**Status**: 🔨 Em Desenvolvimento

---

## 📋 Visão Geral das Mudanças

Este documento detalha os ajustes necessários no processo de solicitação de certificação para:
1. Incluir departamentos **Comercial** e **Jurídico** no fluxo
2. Reordenar e adicionar etapa no wizard (9 etapas)
3. Implementar gestão completa de documentos (contratos PDF, propostas)

---

## 🎯 Macro Processo Atualizado

### **Módulos do Processo de Certificação:**

```
1. COMERCIAL/ADMINISTRATIVO
   └── Gestão comercial e financeira
       └── Elaboração de Proposta Comercial

2. ANALISTAS
   └── Avaliação dos documentos pré-auditoria
       └── Análise de riscos de matérias-primas

3. GESTÃO DE AUDITORIA
   └── Agendamento, alocação de equipe
       └── Notificação de prazos e monitoramento

4. AUDITORES / COMITÊ DE DECISÃO
   └── Planejamento, execução e validação
       └── Relatório de auditoria

5. CONTROLADORES E SUPERVISORES
   └── Acompanhamento in loco
       └── Validação para emissão de certificado

6. JURÍDICO [NOVO]
   └── Confecção de contratos
       └── Gestão de assinaturas e documentação legal
```

---

## 🔄 Novo Fluxo de Fases do Processo

### **Fases Atualizadas (12 fases)**

```prisma
enum ProcessPhase {
  // Fase 1: Empresa
  cadastro_solicitacao        // Empresa preenche wizard

  // Fase 2: Analista
  analise_documental          // Analista avalia documentos

  // Fase 3: Comercial [NOVO]
  elaboracao_proposta         // Comercial elabora proposta
  negociacao_proposta         // Comercial negocia com cliente
  proposta_aprovada           // Cliente aprova proposta

  // Fase 4: Jurídico [NOVO]
  elaboracao_contrato         // Jurídico elabora contrato
  assinatura_contrato         // Aguardando assinaturas

  // Fase 5: Gestão de Auditoria
  auditoria_agendada          // Auditoria agendada

  // Fase 6: Auditores
  auditoria_realizada         // Auditoria executada

  // Fase 7: Controladores/Supervisores
  validacao_auditoria         // Validação dos resultados

  // Fase 8: Comitê Técnico
  comite_tecnico              // Decisão final

  // Fase 9: Sistema
  certificado_emitido         // Certificado gerado
}
```

### **Responsabilidades por Fase:**

| Fase | Responsável | Ações |
|------|-------------|-------|
| 1. Cadastro da Solicitação | **Empresa** | Preencher wizard de 9 etapas |
| 2. Análise Documental | **Analista** | Validar documentos, analisar riscos de matérias-primas |
| 3. Elaboração de Proposta | **Comercial** | Calcular valores, elaborar proposta comercial |
| 4. Negociação de Proposta | **Comercial** | Negociar valores e condições com cliente |
| 5. Proposta Aprovada | **Cliente** | Aprovar proposta comercial |
| 6. Elaboração de Contrato | **Jurídico** | Redigir contrato baseado na proposta aprovada |
| 7. Assinatura de Contrato | **Ambas Partes** | Assinar contrato (digital ou física) |
| 8. Auditoria Agendada | **Gestor de Auditoria** | Agendar auditoria, alocar equipe |
| 9. Auditoria Realizada | **Auditor** | Executar auditoria in loco |
| 10. Validação de Auditoria | **Controlador/Supervisor** | Validar relatório, verificar não conformidades |
| 11. Comitê Técnico | **Comitê** | Decisão final (aprovar/reprovar/solicitar informações) |
| 12. Certificado Emitido | **Sistema** | Gerar certificado Halal |

---

## 🆕 Novos Roles (Papéis de Usuário)

### **Atualização do Enum UserRole:**

```prisma
enum UserRole {
  admin
  empresa
  analista
  comercial     // [NOVO] Departamento Comercial
  juridico      // [NOVO] Departamento Jurídico
  gestor_auditoria  // [ATUALIZADO] Específico para gestão de auditoria
  auditor
  supervisor    // [NOVO] Supervisores (rastreabilidade)
  controlador   // [NOVO] Controladores (validação)
  gestor        // Gestor geral (acesso amplo)
}
```

### **Permissões por Role:**

#### **Comercial:**
- ✅ Visualizar processos na fase de elaboração de proposta
- ✅ Criar e editar propostas comerciais
- ✅ Enviar propostas para clientes
- ✅ Negociar valores e condições
- ✅ Aprovar descontos (até limite definido)
- ✅ Avançar processo após aprovação da proposta
- ❌ Não pode alterar dados técnicos da solicitação

#### **Jurídico:**
- ✅ Visualizar processos com proposta aprovada
- ✅ Criar e editar contratos
- ✅ Upload de contratos PDF
- ✅ Gerenciar assinaturas (empresa e certificadora)
- ✅ Avançar processo após assinatura completa
- ❌ Não pode alterar valores da proposta

---

## 📝 Novo Wizard de Solicitação (8 Etapas)

### **Etapa 1: Dados da Empresa**
**Mantém estrutura atual:**
- Nome da empresa (Razão Social)
- CNPJ
- Endereço completo
- Telefone
- Nome do responsável
- Email do responsável

---

### **Etapa 2: Classificação Industrial (GSO 2055-2)**
**Mantém estrutura atual:**
- Grupo Industrial (A, B, C, D)
- Categoria (AI, AII, BI, BII, etc.)
- Subcategoria (específica)

---

### **Etapa 3: Produção** ⬆️ **[MOVIDO]**
**Campos:**
- Capacidade de produção (kg/mês, litros/mês, unidades/mês)
- Endereço da unidade de produção (se diferente da sede)
- Número de turnos (1, 2 ou 3)
- Número de linhas de produção
- Número de funcionários na produção
- Possui outras certificações? (ISO, ANVISA, HACCP, etc.)
  - Se sim, listar certificações com validade

**Novo campo:**
- 🆕 **Distância da sede da certificadora** (para cálculo de deslocamento)
- 🆕 **Necessita hospedagem para auditoria?** (Sim/Não)

**Objetivo:**
- Informações usadas no cálculo da proposta comercial
- Determina dias de auditoria necessários
- Calcula custos de deslocamento e hospedagem

---

### **Etapa 4: Tipo de Produto**
**Campos:**
- Nome do produto principal
- Categoria do produto (ex: Laticínios, Carnes, Bebidas, Cosméticos)
- Subcategoria (ex: Iogurte, Carne bovina, Refrigerante)
- Descrição detalhada do produto
- Marca comercial (se aplicável)
- 🆕 **Número de produtos no escopo** (1-10, 11-50, 51-100, 100+)
  - Influencia multiplicador na proposta

**Objetivo:**
- Define escopo da certificação
- Usado no cálculo da proposta (multiplicador por número de produtos)

---

### **Etapa 5: Ingredientes e Fornecedores**
**Mantém estrutura atual:**
- Lista de ingredientes principais (textarea)
- Lista de fornecedores (textarea)
- Possui ingredientes de origem animal? (Sim/Não)
  - Se sim: tipo, origem geográfica, certificação Halal do fornecedor

**Novos campos:**
- 🆕 **Número de fornecedores** (1-5, 6-15, 16-30, 30+)
  - Influencia multiplicador na proposta
- 🆕 **Possui certificação Halal dos ingredientes?** (Sim/Não/Parcial)
  - Upload de certificados dos fornecedores

**Objetivo:**
- Análise de risco das matérias-primas
- Rastreabilidade da cadeia de suprimentos
- Multiplicador no cálculo da proposta

---

### **Etapa 6: Mercados (Países)** 🆕 **[NOVA ETAPA]**

**Campos:**
- 🆕 **Países de destino da exportação** (multi-select)
  - Arábia Saudita
  - Emirados Árabes Unidos
  - Catar
  - Bahrein
  - Kuwait
  - Omã
  - Malásia
  - Indonésia
  - Turquia
  - Egito
  - Outros (especificar)

- 🆕 **Já exporta para esses países?** (Sim/Não/Planejado)
- 🆕 **Volume de exportação estimado** (por país)
- 🆕 **Requisitos específicos do mercado?** (textarea)

**Objetivo:**
- Entender mercados-alvo do cliente
- Adequar certificação às exigências de cada país
- Informações para o certificado (países autorizados)

**Modelo de dados:**
```typescript
interface ExportMarket {
  country: string;
  status: 'exportando' | 'planejado' | 'futuro';
  estimatedVolume?: string;
  specificRequirements?: string;
}

// No Request/Process
exportMarkets: ExportMarket[]
```

---

### **Etapa 7: Documentação**
**Mantém estrutura atual:**
- Upload de documentos obrigatórios
- Validação de tipos e tamanhos
- Preview de arquivos

**Tipos de documentos:**
```prisma
enum DocumentType {
  // Documentos da Empresa
  contrato_social
  certidao_negativa
  alvara_funcionamento
  licenca_sanitaria

  // Documentos Técnicos
  manual_bpf              // Boas Práticas de Fabricação
  fluxograma_processo
  lista_fornecedores
  certificado_ingredientes
  analise_produto
  rotulo_produto

  // Documentos de Produção
  layout_fabrica
  fotos_instalacoes
  videos_processo

  // Documentos Comerciais [NOVOS]
  proposta_comercial      // PDF da proposta
  proposta_assinada       // Proposta assinada pelo cliente

  // Documentos Jurídicos [NOVOS]
  contrato_minuta         // Minuta do contrato
  contrato_assinado       // Contrato com assinaturas
  procuracao              // Procuração (se aplicável)

  // Outros
  outros
}
```

---

### **Etapa 8: Revisão e Submissão**
**Mantém estrutura atual:**
- Preview completo de todas as informações
- Checklist de documentos
- Termos e condições
- Botões: "Salvar Rascunho" ou "Finalizar Solicitação"

---

## 🔄 Fluxo Detalhado com Novos Departamentos

```
┌─────────────────────────────────────────────────────────────┐
│  FASE 1: CADASTRO DA SOLICITAÇÃO                            │
│  Responsável: EMPRESA                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  - Preenche wizard de 9 etapas                       │  │
│  │  - Faz upload de documentos                          │  │
│  │  - Revisa e submete solicitação                      │  │
│  └──────────────────────────────────────────────────────┘  │
│  Status: rascunho → pendente                                │
│  Fase: cadastro_solicitacao                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  FASE 2: ANÁLISE DOCUMENTAL                                 │
│  Responsável: ANALISTA                                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  - Valida documentação                               │  │
│  │  - Analisa riscos de matérias-primas                 │  │
│  │  - Verifica conformidade inicial                     │  │
│  │  - Solicita documentos complementares (se necessário)│  │
│  │  - Aprova para elaboração de proposta                │  │
│  └──────────────────────────────────────────────────────┘  │
│  Status: em_andamento → analise_aprovada                    │
│  Fase: analise_documental                                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  FASE 3: ELABORAÇÃO DE PROPOSTA [NOVO]                      │
│  Responsável: COMERCIAL                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  - Sistema calcula proposta automática               │  │
│  │  - Comercial revisa cálculos                         │  │
│  │  - Ajusta valores manualmente (se necessário)        │  │
│  │  - Gera PDF da proposta comercial                    │  │
│  │  - Envia proposta para cliente                       │  │
│  └──────────────────────────────────────────────────────┘  │
│  Status: analise_aprovada → proposta_enviada                │
│  Fase: elaboracao_proposta                                  │
│                                                              │
│  Cálculo da Proposta (baseado em):                          │
│  ✓ Tipo de certificação (C1, C2, C3, etc.)                  │
│  ✓ Número de produtos (multiplicador)                       │
│  ✓ Número de turnos (multiplicador)                         │
│  ✓ Número de fornecedores (multiplicador)                   │
│  ✓ Número de funcionários (man-hour)                        │
│  ✓ Distância (custo de deslocamento)                        │
│  ✓ Hospedagem (se necessário)                               │
│  ✓ Taxas fixas (análise, comitê, emissão)                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  FASE 4: NEGOCIAÇÃO [NOVO]                                  │
│  Responsável: COMERCIAL + EMPRESA                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  - Cliente avalia proposta                           │  │
│  │  - Comercial negocia valores (se necessário)         │  │
│  │  - Ajustes manuais com justificativa                 │  │
│  │  - Cliente aprova proposta                           │  │
│  │  - Sistema registra aprovação                        │  │
│  └──────────────────────────────────────────────────────┘  │
│  Status: proposta_enviada → proposta_aprovada               │
│  Fase: negociacao_proposta → proposta_aprovada              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  FASE 5: ELABORAÇÃO DE CONTRATO [NOVO]                      │
│  Responsável: JURÍDICO                                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  - Sistema gera minuta de contrato                   │  │
│  │  - Jurídico revisa e ajusta cláusulas                │  │
│  │  - Inclui valores da proposta aprovada               │  │
│  │  - Gera PDF do contrato                              │  │
│  │  - Envia para assinatura (empresa)                   │  │
│  └──────────────────────────────────────────────────────┘  │
│  Status: proposta_aprovada → aguardando_assinatura          │
│  Fase: elaboracao_contrato                                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  FASE 6: ASSINATURA DE CONTRATO [NOVO]                      │
│  Responsável: JURÍDICO + EMPRESA                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  - Empresa assina contrato (digital ou física)       │  │
│  │  - Certificadora assina contrato                     │  │
│  │  - Jurídico faz upload do contrato assinado (PDF)    │  │
│  │  - Sistema valida assinaturas                        │  │
│  │  - Contrato arquivado no sistema                     │  │
│  └──────────────────────────────────────────────────────┘  │
│  Status: aguardando_assinatura → contrato_assinado          │
│  Fase: assinatura_contrato                                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  FASE 7: AGENDAMENTO DE AUDITORIA                           │
│  Responsável: GESTOR DE AUDITORIA                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  - Aloca equipe de auditoria                         │  │
│  │  - Agenda data e horário                             │  │
│  │  - Notifica cliente e auditores                      │  │
│  │  - Envia checklist pré-auditoria                     │  │
│  └──────────────────────────────────────────────────────┘  │
│  Status: contrato_assinado → auditoria_agendada             │
│  Fase: auditoria_agendada                                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  FASE 8: EXECUÇÃO DA AUDITORIA                              │
│  Responsável: AUDITOR                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  - Auditoria in loco na empresa                      │  │
│  │  - Verificação de processos e instalações            │  │
│  │  - Coleta de evidências                              │  │
│  │  - Registro de não conformidades (se houver)         │  │
│  │  - Elaboração de relatório de auditoria              │  │
│  └──────────────────────────────────────────────────────┘  │
│  Status: em_auditoria → auditoria_concluida                 │
│  Fase: auditoria_realizada                                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  FASE 9: VALIDAÇÃO [NOVO]                                   │
│  Responsável: CONTROLADOR + SUPERVISOR                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  - Supervisor acompanha relatório in loco            │  │
│  │  - Controlador valida relatório de auditoria         │  │
│  │  - Verifica evidências fotográficas                  │  │
│  │  - Analisa não conformidades                         │  │
│  │  - Aprova para comitê técnico                        │  │
│  └──────────────────────────────────────────────────────┘  │
│  Status: auditoria_concluida → em_validacao                 │
│  Fase: validacao_auditoria                                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  FASE 10: COMITÊ TÉCNICO                                    │
│  Responsável: COMITÊ (Analistas + Gestores)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  - Análise completa do processo                      │  │
│  │  - Revisão de não conformidades                      │  │
│  │  - Decisão: Aprovar / Reprovar / Solicitar Info      │  │
│  │  - Justificativa da decisão                          │  │
│  └──────────────────────────────────────────────────────┘  │
│  Status: em_validacao → aprovado / reprovado                │
│  Fase: comite_tecnico                                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  FASE 11: EMISSÃO DE CERTIFICADO                            │
│  Responsável: SISTEMA                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  - Gera número do certificado                        │  │
│  │  - Cria PDF do certificado com QR Code               │  │
│  │  - Registra produtos no escopo                       │  │
│  │  - Envia certificado para cliente                    │  │
│  │  - Arquiva no sistema                                │  │
│  └──────────────────────────────────────────────────────┘  │
│  Status: aprovado → certificado                             │
│  Fase: certificado_emitido                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Modelagem de Dados - Atualizações

### **1. Atualização do Schema Prisma:**

```prisma
// ========================================
// USER ROLES - ATUALIZADO
// ========================================

enum UserRole {
  admin
  empresa
  analista
  comercial         // [NOVO]
  juridico          // [NOVO]
  gestor_auditoria  // [NOVO]
  auditor
  supervisor        // [NOVO]
  controlador       // [NOVO]
  gestor
}

// ========================================
// PROCESS STATUS - EXPANDIDO
// ========================================

enum ProcessStatus {
  rascunho
  pendente
  em_andamento

  // Análise
  aguardando_documentos
  analise_documental
  analise_aprovada          // [NOVO]

  // Comercial [NOVOS]
  elaborando_proposta       // [NOVO]
  proposta_enviada          // [NOVO]
  em_negociacao             // [NOVO]
  proposta_aprovada         // [NOVO]

  // Jurídico [NOVOS]
  elaborando_contrato       // [NOVO]
  aguardando_assinatura     // [NOVO]
  contrato_assinado         // [NOVO]

  // Auditoria
  auditoria_agendada
  em_auditoria
  auditoria_concluida       // [NOVO]

  // Validação [NOVO]
  em_validacao              // [NOVO]
  validacao_aprovada        // [NOVO]

  // Comitê
  comite_tecnico

  // Final
  aprovado
  reprovado
  certificado
  cancelado
  suspenso
}

// ========================================
// PROCESS PHASES - ATUALIZADO
// ========================================

enum ProcessPhase {
  cadastro_solicitacao        // 1 - Empresa
  analise_documental          // 2 - Analista
  elaboracao_proposta         // 3 - Comercial [NOVO]
  negociacao_proposta         // 4 - Comercial [NOVO]
  proposta_aprovada           // 5 - Transição [NOVO]
  elaboracao_contrato         // 6 - Jurídico [NOVO]
  assinatura_contrato         // 7 - Jurídico [NOVO]
  auditoria_agendada          // 8 - Gestor Auditoria
  auditoria_realizada         // 9 - Auditor
  validacao_auditoria         // 10 - Controlador/Supervisor [NOVO]
  comite_tecnico              // 11 - Comitê
  certificado_emitido         // 12 - Sistema
}

// ========================================
// REQUEST - NOVOS CAMPOS
// ========================================

model Request {
  // ... campos existentes ...

  // [NOVO] Mercados de exportação
  exportMarkets    Json?             @map("export_markets")
  /* {
    "markets": [
      {
        "country": "Arábia Saudita",
        "status": "exportando",
        "estimatedVolume": "1000 ton/ano",
        "specificRequirements": "Certificação SASO"
      }
    ]
  } */

  // [NOVO] Informações de produção para cálculo
  productionInfo   Json?             @map("production_info")
  /* {
    "numShifts": 2,
    "numLines": 3,
    "numEmployees": 45,
    "distanceKm": 250,
    "requiresAccommodation": true,
    "numProducts": 15,
    "numSuppliers": 8
  } */
}

// ========================================
// CONTRACT - ATUALIZADO
// ========================================

model Contract {
  id               String         @id @default(uuid())
  processId        String         @map("process_id")
  companyId        String         @map("company_id")

  contractType     ContractType   @map("contract_type")
  status           ContractStatus

  // Valores da proposta
  proposalId       String?        @map("proposal_id") // [NOVO] Link para proposta
  totalValue       Decimal        @map("total_value")
  numInstallments  Int            @map("num_installments")
  validityMonths   Int            @map("validity_months")

  // Documentos [ATUALIZADO]
  draftPdfUrl      String?        @map("draft_pdf_url")      // [NOVO] Minuta
  signedPdfUrl     String?        @map("signed_pdf_url")     // [ATUALIZADO] Contrato assinado

  // Assinaturas [NOVO]
  companySignedAt  DateTime?      @map("company_signed_at")
  companySignedBy  String?        @map("company_signed_by")  // Nome do signatário
  certSignedAt     DateTime?      @map("cert_signed_at")
  certSignedBy     String?        @map("cert_signed_by")     // Nome do signatário

  // Jurídico [NOVO]
  createdBy        String?        @map("created_by")         // User ID (jurídico)
  reviewedBy       String?        @map("reviewed_by")        // User ID (gestor)

  sentAt           DateTime?      @map("sent_at")
  signedAt         DateTime?      @map("signed_at")          // Data da última assinatura
  createdAt        DateTime       @default(now()) @map("created_at")
  updatedAt        DateTime       @updatedAt @map("updated_at")

  // Relações
  process          Process        @relation(fields: [processId], references: [id])
  company          Company        @relation(fields: [companyId], references: [id])
  proposal         Proposal?      @relation(fields: [proposalId], references: [id]) // [NOVO]
  creator          User?          @relation("ContractCreator", fields: [createdBy], references: [id]) // [NOVO]

  @@index([processId])
  @@index([companyId])
  @@index([status])
  @@map("contracts")
}

// ========================================
// PROPOSAL - AJUSTES
// ========================================

model Proposal {
  // ... campos existentes ...

  // Comercial [NOVO]
  createdBy          String?        @map("created_by")    // User ID (comercial)
  approvedBy         String?        @map("approved_by")   // User ID (gestor)

  // Relações [NOVO]
  creator            User?          @relation("ProposalCreator", fields: [createdBy], references: [id])
  approver           User?          @relation("ProposalApprover", fields: [approvedBy], references: [id])
  contracts          Contract[]     // Um contrato pode referenciar a proposta
}

// ========================================
// DOCUMENT TYPE - EXPANDIDO
// ========================================

enum DocumentType {
  // Empresa
  contrato_social
  certidao_negativa
  alvara_funcionamento
  licenca_sanitaria

  // Técnicos
  manual_bpf
  fluxograma_processo
  layout_fabrica               // [NOVO]
  lista_fornecedores
  certificado_ingredientes
  analise_produto
  rotulo_produto
  fotos_instalacoes            // [NOVO]
  videos_processo              // [NOVO]

  // Comercial [NOVOS]
  proposta_comercial
  proposta_assinada

  // Jurídico [NOVOS]
  contrato_minuta
  contrato_assinado
  procuracao

  // Auditoria
  relatorio_auditoria          // [NOVO]
  evidencias_auditoria         // [NOVO]
  plano_acao_nc                // [NOVO] Não conformidades

  // Outros
  outros
}

// ========================================
// NOVOS MODELS PARA USER ROLES
// ========================================

// Adicionar ao model User
model User {
  // ... campos existentes ...

  // Relações comercial [NOVO]
  proposalsCreated   Proposal[]  @relation("ProposalCreator")
  proposalsApproved  Proposal[]  @relation("ProposalApprover")

  // Relações jurídico [NOVO]
  contractsCreated   Contract[]  @relation("ContractCreator")
}
```

---

## 🎨 Atualizações no Frontend

### **1. Wizard - Ajuste de Etapas:**

**Arquivo:** `frontend/src/pages/company/NewRequestWizard.tsx`

```typescript
const steps = [
  { number: 1, title: 'Dados da Empresa', description: 'Informações básicas' },
  { number: 2, title: 'Classificação Industrial', description: 'Grupo, categoria e subcategoria' },
  { number: 3, title: 'Produção', description: 'Capacidade e infraestrutura' },      // MOVIDO
  { number: 4, title: 'Tipo de Produto', description: 'Detalhes do produto' },
  { number: 5, title: 'Ingredientes', description: 'Ingredientes e fornecedores' },
  { number: 6, title: 'Mercados', description: 'Países de destino' },                 // NOVO
  { number: 7, title: 'Documentação', description: 'Upload de documentos' },
  { number: 8, title: 'Revisão', description: 'Revisar e submeter' },
];
```

### **2. Novo Component: ExportMarketsStep**

**Arquivo:** `frontend/src/components/wizard/ExportMarketsStep.tsx`

```typescript
interface ExportMarket {
  country: string;
  status: 'exportando' | 'planejado' | 'futuro';
  estimatedVolume?: string;
  specificRequirements?: string;
}

export function ExportMarketsStep({
  exportMarkets,
  onChange
}: {
  exportMarkets: ExportMarket[];
  onChange: (markets: ExportMarket[]) => void;
}) {
  const countries = [
    'Arábia Saudita',
    'Emirados Árabes Unidos',
    'Catar',
    'Bahrein',
    'Kuwait',
    'Omã',
    'Malásia',
    'Indonésia',
    'Turquia',
    'Egito',
    'Outros'
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Mercados de Exportação</h3>
      <p className="text-sm text-gray-600">
        Selecione os países para onde você exporta ou pretende exportar
      </p>

      {/* Multi-select de países */}
      {/* Formulário de detalhes por país */}
    </div>
  );
}
```

---

### **3. Novos Dashboards:**

#### **Dashboard Comercial** (`/comercial/dashboard`)
- Lista de processos aguardando proposta
- Propostas em elaboração
- Propostas enviadas aguardando resposta
- Propostas em negociação
- Métricas: taxa de conversão, valor médio, tempo médio

#### **Dashboard Jurídico** (`/juridico/dashboard`)
- Propostas aprovadas aguardando contrato
- Contratos em elaboração
- Contratos aguardando assinatura
- Contratos assinados recentemente
- Alertas de prazos

---

## 🔧 Implementação Backend

### **1. Novos Controllers:**

#### **CommercialController** (`backend/src/modules/commercial/commercial.controller.ts`)

```typescript
// Listar processos para proposta
GET /api/commercial/processes

// Criar/atualizar proposta
POST /api/commercial/proposals
PUT /api/commercial/proposals/:id

// Enviar proposta para cliente
POST /api/commercial/proposals/:id/send

// Registrar negociação
POST /api/commercial/proposals/:id/negotiate

// Aprovar proposta (cliente)
POST /api/commercial/proposals/:id/approve
```

#### **LegalController** (`backend/src/modules/legal/legal.controller.ts`)

```typescript
// Listar propostas aprovadas
GET /api/legal/proposals-approved

// Criar/atualizar contrato
POST /api/legal/contracts
PUT /api/legal/contracts/:id

// Upload de contrato PDF
POST /api/legal/contracts/:id/upload

// Registrar assinatura
POST /api/legal/contracts/:id/sign

// Validar assinaturas completas
POST /api/legal/contracts/:id/validate
```

---

### **2. Novos Services:**

#### **CommercialService**
- `calculateProposal()` - Calcula proposta baseado nos dados
- `createProposal()` - Cria nova proposta
- `sendProposal()` - Envia proposta para cliente
- `negotiateProposal()` - Registra negociação
- `approveProposal()` - Aprova proposta
- `advanceToContract()` - Avança processo para fase jurídica

#### **LegalService**
- `generateContractDraft()` - Gera minuta de contrato
- `createContract()` - Cria novo contrato
- `uploadSignedContract()` - Faz upload do PDF assinado
- `registerSignature()` - Registra assinatura (empresa ou certificadora)
- `validateContract()` - Valida assinaturas completas
- `advanceToAudit()` - Avança para fase de auditoria

---

## 📂 Sistema de Armazenamento de Documentos

### **Estrutura de Pastas:**

```
storage/
├── companies/
│   └── {cnpj}/
│       ├── documents/          # Documentos da empresa
│       │   ├── contrato_social.pdf
│       │   ├── alvara.pdf
│       │   └── ...
│       ├── proposals/          # Propostas comerciais
│       │   ├── {processId}/
│       │   │   ├── proposta_v1.pdf
│       │   │   ├── proposta_v2.pdf
│       │   │   └── proposta_assinada.pdf
│       ├── contracts/          # Contratos
│       │   ├── {processId}/
│       │   │   ├── contrato_minuta.pdf
│       │   │   ├── contrato_assinado.pdf
│       │   │   └── anexos/
│       ├── audits/             # Documentos de auditoria
│       │   └── {auditId}/
│       │       ├── relatorio.pdf
│       │       ├── fotos/
│       │       └── evidencias/
│       └── certificates/       # Certificados emitidos
│           └── {certificateId}/
│               ├── certificado.pdf
│               └── qrcode.png
```

### **Storage Service:**

```typescript
// backend/src/services/storage.service.ts

export class StorageService {
  // Upload genérico
  async uploadFile(
    file: File,
    path: string,
    metadata?: object
  ): Promise<{ url: string; size: number }>;

  // Upload específicos
  async uploadProposal(processId: string, file: File): Promise<string>;
  async uploadContract(processId: string, file: File, type: 'draft' | 'signed'): Promise<string>;
  async uploadAuditDocument(auditId: string, file: File, type: string): Promise<string>;

  // Download
  async getFile(path: string): Promise<Buffer>;
  async getSignedUrl(path: string, expiresIn?: number): Promise<string>;

  // Versionamento
  async listVersions(path: string): Promise<FileVersion[]>;

  // Cleanup
  async deleteFile(path: string): Promise<void>;
}
```

---

## 📊 Métricas e KPIs Atualizados

### **Dashboard Comercial:**
- Taxa de conversão de análise → proposta enviada
- Tempo médio de elaboração de proposta
- Taxa de aprovação de propostas
- Valor médio de propostas
- Propostas em negociação (quantidade e valor)

### **Dashboard Jurídico:**
- Tempo médio de elaboração de contrato
- Taxa de assinatura de contratos
- Contratos pendentes de assinatura (> 7 dias)
- Tempo médio até assinatura completa

### **Dashboard Geral:**
- Taxa de conversão end-to-end (solicitação → certificado)
- Tempo médio por fase
- Gargalos do processo (fases com maior tempo)
- Processos por status

---

## 📋 Checklist de Implementação

### **Backend:**

#### Fase 1: Database (2 dias)
- [ ] Atualizar schema.prisma com novos roles
- [ ] Adicionar novos status e fases
- [ ] Adicionar campos exportMarkets e productionInfo
- [ ] Atualizar model Contract
- [ ] Atualizar model Proposal
- [ ] Criar migrations
- [ ] Atualizar seeds

#### Fase 2: Módulo Comercial (3 dias)
- [ ] Criar CommercialService
- [ ] Criar CommercialController
- [ ] Criar rotas comerciais
- [ ] Implementar cálculo automático de proposta
- [ ] Implementar envio de proposta
- [ ] Implementar fluxo de negociação
- [ ] Testes unitários

#### Fase 3: Módulo Jurídico (3 dias)
- [ ] Criar LegalService
- [ ] Criar LegalController
- [ ] Criar rotas jurídicas
- [ ] Implementar geração de minuta
- [ ] Implementar upload de PDF assinado
- [ ] Implementar registro de assinaturas
- [ ] Testes unitários

#### Fase 4: Storage (2 dias)
- [ ] Configurar storage (AWS S3 ou Minio)
- [ ] Implementar StorageService
- [ ] Criar estrutura de pastas
- [ ] Implementar versionamento
- [ ] Implementar signed URLs
- [ ] Testes de upload/download

#### Fase 5: Process Transitions (2 dias)
- [ ] Atualizar ProcessTransitionService
- [ ] Implementar transições comercial
- [ ] Implementar transições jurídico
- [ ] Validar permissões por fase
- [ ] Testes de integração

---

### **Frontend:**

#### Fase 1: Wizard (3 dias)
- [ ] Reordenar etapas (3 e 4 trocadas)
- [ ] Criar ExportMarketsStep component
- [ ] Atualizar ProductionStep com novos campos
- [ ] Atualizar IngredientsStep com número de fornecedores
- [ ] Ajustar navegação e validações
- [ ] Testes E2E

#### Fase 2: Dashboard Comercial (3 dias)
- [ ] Criar página CommercialDashboard
- [ ] Criar ProposalList component
- [ ] Criar ProposalForm component
- [ ] Criar ProposalNegotiation component
- [ ] Implementar cálculo interativo
- [ ] Integrar com API comercial

#### Fase 3: Dashboard Jurídico (3 dias)
- [ ] Criar página LegalDashboard
- [ ] Criar ContractList component
- [ ] Criar ContractForm component
- [ ] Criar ContractSignature component
- [ ] Implementar upload de PDF
- [ ] Integrar com API jurídica

#### Fase 4: Document Manager (2 dias)
- [ ] Criar DocumentViewer component
- [ ] Implementar preview de PDF
- [ ] Implementar download de documentos
- [ ] Implementar histórico de versões
- [ ] Implementar upload com drag & drop

---

## 🎯 Cronograma Total

| Fase | Duração | Equipe |
|------|---------|--------|
| Backend - Database | 2 dias | Backend |
| Backend - Comercial | 3 dias | Backend |
| Backend - Jurídico | 3 dias | Backend |
| Backend - Storage | 2 dias | Backend + DevOps |
| Backend - Transitions | 2 dias | Backend |
| Frontend - Wizard | 3 dias | Frontend |
| Frontend - Comercial | 3 dias | Frontend |
| Frontend - Jurídico | 3 dias | Frontend |
| Frontend - Documents | 2 dias | Frontend |
| Testes Integrados | 3 dias | Full Stack |
| Ajustes e Refinamentos | 2 dias | Full Stack |

**Total: 28 dias úteis (~6 semanas)**

---

## 🚀 Próximos Passos

1. **Aprovação desta proposta**
   - Validar novo fluxo com stakeholders
   - Confirmar responsabilidades dos departamentos
   - Ajustar se necessário

2. **Priorização das fases**
   - Definir MVP (Minimum Viable Product)
   - Identificar funcionalidades críticas
   - Planejar releases incrementais

3. **Setup inicial**
   - Criar branches de desenvolvimento
   - Configurar storage (S3/Minio)
   - Preparar ambientes de teste

4. **Kick-off da implementação**
   - Começar pelo backend (database e models)
   - Paralelamente: frontend wizard
   - Integração progressiva

---

**Elaborado por**: Claude Code (Assistente de IA)
**Data**: 08 de Dezembro de 2025
**Versão**: 2.0
**Status**: 🔨 Proposta de Ajustes
