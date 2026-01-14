# 📋 Revisão - Processo de Solicitação de Certificação Halal

**Data**: 08 de Dezembro de 2025
**Versão**: 1.0
**Status**: 📊 Documento de Revisão

---

## 📌 Visão Geral

Este documento apresenta uma revisão completa do **processo de solicitação de certificação Halal** implementado no sistema HalalSphere, desde a criação inicial pela empresa até a transição para análise documental pelo analista.

---

## 🎯 Objetivo do Processo

Permitir que empresas solicitem certificação Halal de forma estruturada, passando por um wizard intuitivo de 9 etapas que coleta todas as informações necessárias para análise e auditoria.

---

## 🔄 Fluxo Completo do Processo

### **Fase 1: Cadastro da Solicitação** (Responsabilidade: Empresa)

```
┌─────────────────────────────────────────────────────────────┐
│  EMPRESA                                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1. Acessa "Nova Solicitação"                        │  │
│  │  2. Preenche Wizard (9 etapas)                       │  │
│  │  3. Revisa informações                               │  │
│  │  4. Concorda com termos                              │  │
│  │  5. Clica "Finalizar Solicitação"                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  Status: RASCUNHO → PENDENTE                                │
│  Fase: cadastro_solicitacao (mantém)                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  SISTEMA                                                     │
│  - Gera protocolo único (HS-2025-XXX)                       │
│  - Cria registro em Request                                 │
│  - Cria registro em Process vinculado                       │
│  - Status do Request: enviado                               │
│  - Status do Process: pendente                              │
│  - Processo fica visível para analistas                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  ANALISTA                                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1. Visualiza lista de processos pendentes           │  │
│  │  2. Abre processo de interesse                       │  │
│  │  3. Sistema AUTO-ATRIBUI analista                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  Status: PENDENTE → EM_ANDAMENTO                            │
│  Fase: cadastro_solicitacao → analise_documental            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Wizard de Solicitação - 7 Etapas

### **Etapa 1: Dados da Empresa**

**Campos obrigatórios:**
- Nome da empresa (Razão Social)
- CNPJ (14 dígitos)
- Endereço completo
- Telefone
- Nome do responsável
- Email do responsável

**Validações:**
- CNPJ válido e formatado
- Email em formato correto
- Telefone com DDD

**Arquivo de referência:**
[NewRequestWizard.tsx:26-32](frontend/src/pages/company/NewRequestWizard.tsx#L26-L32)

---

### **Etapa 2: Classificação Industrial (GSO 2055-2)**

**Seleção em cascata:**
1. **Grupo Industrial** (A, B, C, D)
   - A: Alimentos de origem animal
   - B: Alimentos de origem vegetal
   - C: Produtos químicos, cosméticos, farmacêuticos
   - D: Embalagens e serviços

2. **Categoria** (AI, AII, BI, BII, CI, CII, etc.)
   - Depende do grupo selecionado

3. **Subcategoria**
   - Lista específica para cada categoria
   - Exemplos de atividades

**Arquivo de referência:**
[IndustrialClassificationStep.tsx](frontend/src/components/wizard/IndustrialClassificationStep.tsx)
[schema.prisma:640-718](backend/prisma/schema.prisma#L640-L718)

---

### **Etapa 3: Tipo de Produto**

**Campos obrigatórios:**
- Tipo de produto (ex: Iogurte, Carne bovina, Cosmético)
- Categoria (ex: Laticínios, Carnes, Higiene)
- Descrição detalhada do produto

**Propósito:**
- Define o escopo inicial da certificação
- Determina tipo de auditoria necessária
- Influencia cálculo da proposta comercial

**Arquivo de referência:**
[process.service.ts:17-20](backend/src/modules/process/process.service.ts#L17-L20)

---

### **Etapa 4: Informações de Produção**

**Campos obrigatórios:**
- Capacidade de produção (kg/mês, litros/mês, etc.)
- Endereço da unidade de produção
- Possui outras certificações? (Sim/Não)
- Se sim, quais certificações? (ISO, ANVISA, etc.)

**Uso das informações:**
- Determina escopo da auditoria
- Influencia dias de auditoria necessários
- Facilita pré-análise de conformidade

**Arquivo de referência:**
[process.service.ts:136-149](backend/src/modules/process/process.service.ts#L136-L149)

---

### **Etapa 5: Ingredientes e Fornecedores**

**Campos obrigatórios:**
- Lista de ingredientes principais
- Lista de fornecedores
- Possui ingredientes de origem animal? (Sim/Não)
- Se sim, detalhes dos ingredientes animais:
  - Tipo (bovino, frango, peixe, etc.)
  - Origem geográfica
  - Certificação Halal do fornecedor

**Validações críticas:**
- Ingredientes de origem animal EXIGEM certificação Halal prévia
- Fornecedores devem estar identificados
- Rastreabilidade da cadeia de suprimentos

**Arquivo de referência:**
[process.service.ts:127-135](backend/src/modules/process/process.service.ts#L127-L135)

---

### **Etapa 6: Documentação**

**Documentos necessários:**
- ✅ Contrato social
- ✅ Certidão negativa de débitos
- ✅ Alvará de funcionamento
- ✅ Licença sanitária
- ✅ Manual de BPF (Boas Práticas de Fabricação)
- ✅ Fluxograma do processo produtivo
- ✅ Lista de fornecedores certificados
- ✅ Certificados Halal dos ingredientes (se aplicável)
- ✅ Laudos de análise dos produtos
- ✅ Rótulo dos produtos
- ✅ Fotos da unidade de produção

**Sistema de upload:**
- Suporta múltiplos arquivos
- Tipos aceitos: PDF, JPG, PNG, DOC, DOCX
- Limite: 10MB por arquivo
- Preview de arquivos carregados

**Arquivo de referência:**
[schema.prisma:102-120](backend/prisma/schema.prisma#L102-L120)

---

### **Etapa 7: Revisão e Submissão**

**Pré-visualização:**
- Sidebar com resumo de todas as informações preenchidas
- Possibilidade de voltar e editar qualquer etapa
- Checklist de documentos enviados

**Termos e condições:**
- ☑ Li e concordo com os termos de solicitação
- ☑ Declaro que todas as informações são verdadeiras
- ☑ Estou ciente dos custos e prazos da certificação

**Ações finais:**
- **Salvar como rascunho**: Mantém status "rascunho"
- **Finalizar Solicitação**: Submete para análise (status → "pendente")

**Arquivo de referência:**
[PreviewSidebar.tsx](frontend/src/components/wizard/PreviewSidebar.tsx)

---

## 🔄 Transição de Status e Fases

### **1. Criação Inicial (POST /api/processes)**

**Request Body:**
```json
{
  "companyName": "Laticínios ABC Ltda",
  "cnpj": "12345678000190",
  "address": "Rua das Flores, 123",
  "phone": "(11) 98765-4321",
  "contactName": "João Silva",
  "contactEmail": "joao@abc.com",
  "industrialGroup": "A",
  "industrialCategory": "AI",
  "industrialSubcategory": "AI-01",
  "productType": "Iogurte natural",
  "productCategory": "Laticínios",
  "productDescription": "Iogurte natural integral...",
  "productionCapacity": "10000 litros/mês",
  "productionAddress": "Rua Industrial, 456",
  "hasOtherCertifications": true,
  "otherCertifications": "ISO 9001, ANVISA",
  "ingredients": "Leite integral, fermento lácteo...",
  "suppliers": "Fazenda Boa Vista, Fermento Brasil",
  "hasAnimalIngredients": true,
  "animalIngredientDetails": "Leite bovino certificado...",
  "agreedToTerms": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "protocol": "HS-2025-001",
    "companyId": "uuid-company",
    "companyName": "Laticínios ABC Ltda",
    "productType": "Iogurte natural",
    "productCategory": "Laticínios",
    "status": "rascunho",
    "currentPhase": "cadastro_solicitacao",
    "priority": "media",
    "assignedAnalystId": null,
    "assignedAnalystName": null,
    "createdAt": "2025-12-08T10:00:00Z",
    "updatedAt": "2025-12-08T10:00:00Z",
    "daysInStage": 0
  }
}
```

**Arquivo de referência:**
[process.controller.ts:19-76](backend/src/modules/process/process.controller.ts#L19-L76)

---

### **2. Submissão do Wizard (POST /api/processes/:id/submit)**

**Endpoint:** `POST /api/processes/{processId}/submit`

**Validações:**
- ✅ Processo deve estar em status "rascunho"
- ✅ Processo deve estar na fase "cadastro_solicitacao"
- ✅ Apenas a empresa dona do processo pode submeter

**Ações executadas:**
```typescript
// 1. Atualiza Process
await prisma.process.update({
  where: { id: processId },
  data: {
    status: 'pendente',        // Aguardando analista
    updatedAt: new Date()
  }
});

// 2. Atualiza Request
await prisma.request.update({
  where: { id: requestId },
  data: {
    status: 'enviado',
    submittedAt: new Date()
  }
});

// 3. Log de auditoria
await AuditLogger.logProcessStatusChange(
  request,
  processId,
  'rascunho',
  'pendente'
);
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "protocol": "HS-2025-001",
    "status": "pendente",
    "currentPhase": "cadastro_solicitacao"
  },
  "message": "Solicitação enviada com sucesso! Aguarde a atribuição de um analista."
}
```

**Arquivo de referência:**
[process.controller.ts:340-397](backend/src/modules/process/process.controller.ts#L340-L397)
[process.service.ts:628-702](backend/src/modules/process/process.service.ts#L628-L702)

---

### **3. Auto-atribuição ao Analista (GET /api/processes/:id)**

**Cenário:** Analista abre um processo pendente não atribuído

**Trigger:**
```typescript
if (
  user.role === 'analista' &&
  !process.assignedAnalystId &&
  process.status === 'pendente'
) {
  await processService.autoAssignAnalyst(id, user.id);
}
```

**Ações executadas:**
```typescript
await prisma.process.update({
  where: { id: processId },
  data: {
    analystId: analystId,           // Atribui analista
    currentPhase: 'analise_documental',  // Fase 1 → Fase 2
    status: 'em_andamento',         // Status atualizado
    updatedAt: new Date()
  }
});
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "protocol": "HS-2025-001",
    "status": "em_andamento",
    "currentPhase": "analise_documental",
    "assignedAnalystId": "uuid-analyst",
    "assignedAnalystName": "Maria Santos"
  }
}
```

**Arquivo de referência:**
[process.controller.ts:174-188](backend/src/modules/process/process.controller.ts#L174-L188)
[process.service.ts:584-626](backend/src/modules/process/process.service.ts#L584-L626)

---

## 📊 Estrutura de Dados

### **Modelo Request**

```prisma
model Request {
  id                   String            @id @default(uuid())
  companyId            String
  protocol             String            @unique  // HS-2025-001
  companyName          String
  cnpj                 String
  requestType          RequestType       // nova, renovacao, ampliacao
  certificationType    CertificationType // C1, C2, C3, etc.

  // Classificação Industrial
  industrialGroupId      String?
  industrialCategoryId   String?
  industrialSubcategoryId String?

  productOrigin        ProductOrigin     // animal, vegetal, misto
  productType          String
  productCategory      String
  productDescription   String

  // JSON fields
  productDetails       Json              // Detalhes completos
  productionDetails    Json              // Capacidade, endereço, etc.

  status               RequestStatus     // rascunho, enviado, em_analise, aprovado, rejeitado
  submittedAt          DateTime?
  createdAt            DateTime
  updatedAt            DateTime

  // Relações
  company              Company
  process              Process?
  documents            Document[]
}
```

**Arquivo de referência:**
[schema.prisma:294-334](backend/prisma/schema.prisma#L294-L334)

---

### **Modelo Process**

```prisma
model Process {
  id               String          @id @default(uuid())
  requestId        String          @unique
  analystId        String?
  auditorId        String?
  currentPhase     ProcessPhase    @default(cadastro_solicitacao)
  status           ProcessStatus
  priority         ProcessPriority @default(media)
  daysInPhase      Int             @default(0)
  estimatedEnd     DateTime?
  createdAt        DateTime
  updatedAt        DateTime

  // Relações
  request          Request
  analyst          User?
  auditor          User?
  contracts        Contract[]
  audits           Audit[]
  certificates     Certificate[]
  history          ProcessHistory[]
  comments         Comment[]
  proposal         Proposal?
}
```

**Arquivo de referência:**
[schema.prisma:336-370](backend/prisma/schema.prisma#L336-L370)

---

## 🎨 Interface Frontend

### **Página: Nova Solicitação**

**Rota:** `/company/new-request`

**Componentes principais:**
1. **Wizard Steps Navigation** - Barra de progresso com 9 etapas
2. **Form Inputs** - Formulários específicos por etapa
3. **Preview Sidebar** - Resumo em tempo real
4. **Auto-save** - Salvamento automático a cada 1.5s
5. **Success Screen** - Tela de confirmação com protocolo

**Features especiais:**
- ✅ Modo formulário ou chat (IA)
- ✅ Validação em tempo real
- ✅ Navegação entre etapas
- ✅ Salvamento de rascunho
- ✅ Upload de arquivos com preview
- ✅ Restauração de rascunho salvo

**Arquivo de referência:**
[NewRequestWizard.tsx](frontend/src/pages/company/NewRequestWizard.tsx)

---

### **Dashboard da Empresa**

**Rota:** `/company/dashboard`

**Visualização de processos:**
- Lista de todas as solicitações da empresa
- Filtros por status (rascunho, pendente, em_andamento, etc.)
- Cards com informações resumidas:
  - Protocolo
  - Tipo de produto
  - Status atual
  - Fase atual
  - Analista atribuído
  - Dias na fase atual
  - Botões de ação (Ver detalhes, Continuar preenchimento)

**Arquivo de referência:**
[CompanyDashboard.tsx](frontend/src/pages/company/CompanyDashboard.tsx)

---

## 🔐 Controle de Acesso e Permissões

### **Empresa (role: empresa)**

**Pode:**
- ✅ Criar novas solicitações
- ✅ Visualizar suas próprias solicitações
- ✅ Editar solicitações em rascunho
- ✅ Submeter solicitações finalizadas
- ✅ Adicionar comentários
- ✅ Fazer upload de documentos

**Não pode:**
- ❌ Ver solicitações de outras empresas
- ❌ Alterar status do processo
- ❌ Atribuir analistas
- ❌ Aprovar/reprovar processos

---

### **Analista (role: analista)**

**Pode:**
- ✅ Visualizar TODOS os processos
- ✅ Auto-atribuir processos pendentes
- ✅ Atualizar status de processos atribuídos a ele
- ✅ Solicitar documentos adicionais
- ✅ Adicionar comentários internos
- ✅ Avançar fases do processo
- ✅ Elaborar proposta comercial

**Não pode:**
- ❌ Editar processos de outros analistas
- ❌ Aprovar certificação final (apenas comitê técnico)

---

### **Gestor (role: gestor)**

**Pode:**
- ✅ Visualizar TODOS os processos
- ✅ Atribuir/reatribuir analistas
- ✅ Atualizar qualquer status
- ✅ Avançar/retroceder fases
- ✅ Aprovar propostas e contratos
- ✅ Participar do comitê técnico
- ✅ Emitir certificados

---

### **Auditor (role: auditor)**

**Pode:**
- ✅ Visualizar processos em auditoria
- ✅ Registrar resultados de auditoria
- ✅ Criar não conformidades
- ✅ Aprovar/reprovar auditorias

---

## 📈 Métricas e Analytics

### **KPIs do Processo de Solicitação**

1. **Taxa de Conversão de Rascunhos**
   - Rascunhos criados vs. Rascunhos submetidos
   - Meta: > 80%

2. **Tempo Médio de Preenchimento**
   - Desde criação até submissão
   - Meta: < 2 horas

3. **Taxa de Abandono por Etapa**
   - Identificar etapas com maior abandono
   - Otimizar etapas problemáticas

4. **Completude de Documentação**
   - Documentos enviados vs. Documentos necessários
   - Meta: 100% na primeira submissão

5. **Tempo de Auto-atribuição**
   - Desde submissão até atribuição de analista
   - Meta: < 24 horas

**Endpoint de métricas:**
```typescript
GET /api/metrics/certification-requests
Response: {
  draftConversionRate: 82.5,      // %
  avgTimeToSubmit: 1.5,            // horas
  abandonmentByStep: {
    step1: 5.2,  // %
    step2: 8.1,
    step3: 3.4,
    // ...
  },
  documentCompleteness: 94.3,      // %
  avgTimeToAssignment: 18.5        // horas
}
```

---

## 🚨 Notificações e Alertas

### **Para a Empresa**

1. **Rascunho salvo automaticamente**
   - Toast notification: "Rascunho salvo às 14:35"

2. **Solicitação submetida com sucesso**
   - Tela de sucesso com protocolo
   - Email de confirmação com protocolo

3. **Analista atribuído**
   - Email: "Seu processo HS-2025-001 foi atribuído ao analista Maria Santos"

4. **Mudança de status**
   - Email: "Seu processo mudou para: Análise Documental"

5. **Documentos solicitados**
   - Notificação no sistema + Email
   - Listagem de documentos pendentes

---

### **Para o Analista**

1. **Novo processo pendente**
   - Badge no dashboard
   - Notificação: "3 novos processos pendentes"

2. **Processo auto-atribuído**
   - Confirmação: "Processo HS-2025-001 atribuído a você"

3. **Novo comentário da empresa**
   - Notificação em tempo real

---

## 🔧 Melhorias Implementadas

### **1. Auto-save de Rascunhos**

**Problema anterior:** Perda de dados ao fechar navegador

**Solução:**
- Hook `useAutoSave` com debounce de 1.5s
- Armazenamento em localStorage
- Restauração automática ao reabrir
- Limpeza após submissão bem-sucedida

**Arquivo de referência:**
[useAutoSave.ts](frontend/src/hooks/useAutoSave.ts)

---

### **2. Validação em Tempo Real**

**Problema anterior:** Erros apenas ao submeter

**Solução:**
- Validação de campos ao sair (onBlur)
- Feedback visual imediato (borda vermelha, mensagem de erro)
- Botão "Próximo" desabilitado se etapa inválida

---

### **3. Upload de Documentos com Preview**

**Problema anterior:** Sem visualização dos arquivos

**Solução:**
- Preview de imagens antes do upload
- Lista de arquivos com possibilidade de remoção
- Validação de tipo e tamanho
- Drag & drop

**Arquivo de referência:**
[FileDropzone.tsx](frontend/src/components/ui/FileDropzone.tsx)

---

### **4. Modo Chat com IA (Futuro)**

**Proposta:** Permitir preenchimento via conversação natural

**Exemplo:**
```
Usuário: "Quero certificar iogurte natural"
IA: "Entendi! Iogurte é classificado como Grupo A - Alimentos de origem animal,
     Categoria AI - Laticínios. Vou preencher isso para você."

Usuário: "Produzimos 10 mil litros por mês"
IA: "Perfeito! Anotei a capacidade de produção. Vocês possuem outras
     certificações como ISO ou ANVISA?"
```

**Arquivo de referência:**
[ChatMode.tsx](frontend/src/components/wizard/ChatMode.tsx)

---

## 🐛 Problemas Conhecidos e Limitações

### **1. Upload de Documentos**

**Problema:**
Atualmente o upload salva arquivos em localStorage (simulação), mas não envia para o backend.

**Solução necessária:**
Integrar com endpoint de upload de documentos:
```typescript
POST /api/documents/upload
Content-Type: multipart/form-data
Body: { file, requestId, documentType }
```

---

### **2. Validação de CNPJ**

**Problema:**
Validação apenas de formato, não verifica se CNPJ é válido na Receita Federal.

**Solução necessária:**
Integrar com API de consulta da Receita Federal ou serviço terceiro.

---

### **3. Classificação Industrial**

**Problema:**
Dados hardcoded, sem seed no banco.

**Solução necessária:**
Criar seed completo das tabelas:
- `industrial_groups`
- `industrial_categories`
- `industrial_subcategories`

**Arquivo de referência:**
[schema.prisma:640-718](backend/prisma/schema.prisma#L640-L718)

---

### **4. Email de Notificações**

**Problema:**
Serviço de email configurado mas não testado em produção.

**Solução necessária:**
- Validar configuração SMTP
- Testar templates de email
- Implementar fila de emails (Bull/BullMQ)

**Arquivo de referência:**
[email.service.ts](backend/src/services/email.service.ts)

---

## 📋 Checklist de Validação do Processo

### **Backend**

- [x] Endpoint de criação de processo funcional
- [x] Endpoint de submissão do wizard funcional
- [x] Auto-atribuição de analista implementada
- [x] Transição de fases correta (Fase 1 → Fase 2)
- [x] Validação de permissões (empresa só edita seus processos)
- [x] Log de auditoria em todas as ações
- [ ] Upload de documentos integrado
- [ ] Seed de classificação industrial
- [ ] Validação de CNPJ com API externa
- [ ] Testes unitários completos
- [ ] Testes de integração

---

### **Frontend**

- [x] Wizard de 9 etapas funcional
- [x] Auto-save de rascunhos
- [x] Validação de campos em tempo real
- [x] Preview sidebar com resumo
- [x] Navegação entre etapas
- [x] Tela de sucesso com protocolo
- [ ] Upload de documentos integrado
- [ ] Modo chat com IA
- [ ] Responsividade mobile
- [ ] Testes E2E (Cypress/Playwright)

---

## 🎯 Próximos Passos Recomendados

### **Curto Prazo (1-2 semanas)**

1. **Upload de Documentos Completo**
   - Integrar com backend storage (AWS S3, Minio, etc.)
   - Implementar validação de tipos
   - Adicionar thumbnails para imagens/PDFs

2. **Seed de Classificação Industrial**
   - Popular todas as categorias GSO 2055-2
   - Traduzir para PT/EN/AR
   - Adicionar exemplos de atividades

3. **Testes de Integração**
   - Testar fluxo completo empresa → analista
   - Validar transições de status
   - Testar auto-atribuição

---

### **Médio Prazo (3-4 semanas)**

1. **Dashboard de Métricas**
   - Implementar KPIs de conversão
   - Gráficos de tempo médio por etapa
   - Alertas de abandono

2. **Notificações em Tempo Real**
   - WebSocket ou Server-Sent Events
   - Toast notifications
   - Badge de notificações não lidas

3. **Modo Chat com IA**
   - Integração com OpenAI/Claude
   - Extração de dados de conversa
   - Preenchimento automático de campos

---

### **Longo Prazo (2-3 meses)**

1. **Mobile App**
   - React Native ou Flutter
   - Preenchimento offline
   - Upload de fotos pela câmera

2. **Assinatura Digital**
   - Integração ICP-Brasil
   - Certificado A1/A3
   - Validação de assinaturas

3. **Integração com Syshalal**
   - API de exportação de certificados
   - Webhook de sincronização
   - Autenticação segura

---

## 📚 Documentação Técnica de Referência

### **Backend**

1. [process.controller.ts](backend/src/modules/process/process.controller.ts) - Controladores de API
2. [process.service.ts](backend/src/modules/process/process.service.ts) - Lógica de negócio
3. [process.phases.ts](backend/src/modules/process/process.phases.ts) - Configuração de fases
4. [process.types.ts](backend/src/modules/process/process.types.ts) - Interfaces TypeScript
5. [schema.prisma](backend/prisma/schema.prisma) - Modelagem do banco de dados

---

### **Frontend**

1. [NewRequestWizard.tsx](frontend/src/pages/company/NewRequestWizard.tsx) - Wizard principal
2. [process.service.ts](frontend/src/services/process.service.ts) - Cliente de API
3. [IndustrialClassificationStep.tsx](frontend/src/components/wizard/IndustrialClassificationStep.tsx) - Classificação
4. [PreviewSidebar.tsx](frontend/src/components/wizard/PreviewSidebar.tsx) - Resumo
5. [SuccessScreen.tsx](frontend/src/components/wizard/SuccessScreen.tsx) - Confirmação

---

## 💡 Recomendações Finais

### **1. Usabilidade**

- ✅ Wizard está bem estruturado e intuitivo
- ✅ Auto-save evita perda de dados
- 🔄 Considerar reduzir para 5 etapas (combinar algumas)
- 🔄 Adicionar tooltips explicativos em campos complexos
- 🔄 Melhorar feedback visual de progresso

---

### **2. Performance**

- ✅ Debounce no auto-save evita sobrecarga
- 🔄 Implementar lazy loading de componentes
- 🔄 Otimizar queries do banco (incluir índices)
- 🔄 Cache de classificação industrial (Redis)

---

### **3. Segurança**

- ✅ Validação de permissões implementada
- ✅ Log de auditoria completo
- 🔄 Adicionar rate limiting nos endpoints
- 🔄 Sanitização de inputs (XSS prevention)
- 🔄 Validação de tamanho de arquivos no backend

---

### **4. Manutenibilidade**

- ✅ Código bem organizado e modularizado
- ✅ Tipos TypeScript para segurança de tipos
- 🔄 Adicionar mais comentários em lógicas complexas
- 🔄 Documentar decisões arquiteturais (ADRs)
- 🔄 Aumentar cobertura de testes

---

## 🎓 Conclusão

O processo de solicitação de certificação está **bem implementado** e atende aos requisitos principais:

✅ **Estruturado**: Wizard de 9 etapas claro e objetivo
✅ **Robusto**: Validações e transições de estado corretas
✅ **Auditável**: Log completo de todas as ações
✅ **Escalável**: Arquitetura modular e extensível
✅ **Seguro**: Controle de acesso e permissões adequados

**Principais pontos de atenção:**
1. Completar integração de upload de documentos
2. Popular classificação industrial no banco
3. Aumentar cobertura de testes
4. Melhorar notificações e feedback ao usuário

---

**Elaborado por**: Claude Code (Assistente de IA)
**Data**: 08 de Dezembro de 2025
**Versão**: 1.0
**Status**: 📊 Documento de Revisão Completa
