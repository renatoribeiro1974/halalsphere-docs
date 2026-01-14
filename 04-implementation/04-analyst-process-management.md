# Gestão de Processos pelo Analista

**Data de Implementação**: 18 de Novembro de 2025
**Status**: ✅ Completo
**Épico**: [ÉPICO 3: Análise e Preparação](../01-prd/05-user-stories/epic-03-analysis.md)

---

## 📋 Resumo

Implementação completa das funcionalidades de gestão de processos para analistas, permitindo:
- Solicitação de documentos complementares
- Sistema de comentários e observações
- Agendamento de auditorias

---

## 🎯 User Stories Implementadas

### ✅ US-023: Solicitação de Documentos Complementares
**Prioridade**: Must Have (P0) | **Estimativa**: 5 SP

Analistas podem solicitar documentos adicionais às empresas diretamente no sistema, com rastreamento completo do status.

### ✅ US-023.1: Sistema de Comentários e Observações
**Prioridade**: Must Have (P0) | **Estimativa**: 5 SP

Sistema completo de comentários para documentar decisões, anotações e comunicação, com suporte a comentários internos e externos.

### ✅ US-023.2: Agendamento de Auditorias
**Prioridade**: Must Have (P0) | **Estimativa**: 8 SP

Criação e gerenciamento de agendamentos de auditorias com diferentes tipos, locais e status.

---

## 🗄️ Modelagem de Dados

### DocumentRequest Model

```prisma
model DocumentRequest {
  id               String                    @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  processId        String                    @map("process_id") @db.Uuid
  requestedBy      String                    @map("requested_by") @db.Uuid
  documentType     DocumentType              @map("document_type")
  description      String                    @db.Text
  dueDate          DateTime?                 @map("due_date")
  status           DocumentRequestStatus     @default(pendente)
  respondedAt      DateTime?                 @map("responded_at")
  uploadedDocId    String?                   @map("uploaded_doc_id") @db.Uuid
  createdAt        DateTime                  @default(now()) @map("created_at")
  updatedAt        DateTime                  @updatedAt @map("updated_at")

  // Relations
  process          Process                   @relation(fields: [processId], references: [id], onDelete: Cascade)
  requestedByUser  User                      @relation("DocumentRequestedBy", fields: [requestedBy], references: [id])
  uploadedDoc      Document?                 @relation("DocumentRequestDoc", fields: [uploadedDocId], references: [id])

  @@index([processId])
  @@index([requestedBy])
  @@index([status])
  @@index([dueDate])
  @@map("document_requests")
}

enum DocumentRequestStatus {
  pendente
  atendido
  cancelado
}
```

**Tipos de Documentos**:
- `contrato_social` - Contrato Social
- `certidao_negativa` - Certidão Negativa
- `alvara_funcionamento` - Alvará de Funcionamento
- `laudo_tecnico` - Laudo Técnico
- `manual_bpf` - Manual de Boas Práticas de Fabricação
- `fluxograma_processo` - Fluxograma do Processo
- `lista_fornecedores` - Lista de Fornecedores
- `certificado_ingredientes` - Certificados de Ingredientes
- `analise_produto` - Análise de Produto
- `rotulo_produto` - Rótulo do Produto
- `outros` - Outros

### Comment Model (já existente, atualizado)

```prisma
model Comment {
  id               String    @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  processId        String    @map("process_id") @db.Uuid
  userId           String    @map("user_id") @db.Uuid
  content          String    @db.Text
  mentions         String[]  @default([])
  isInternal       Boolean   @default(false) @map("is_internal")
  editedAt         DateTime? @map("edited_at")
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")

  // Relations
  process          Process @relation(fields: [processId], references: [id], onDelete: Cascade)
  user             User    @relation("CommentAuthor", fields: [userId], references: [id])

  @@index([processId])
  @@index([userId])
  @@index([createdAt])
  @@map("comments")
}
```

### Audit Model (já existente, atualizado)

```prisma
model Audit {
  id               String       @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  processId        String       @map("process_id") @db.Uuid
  auditType        AuditType    @map("audit_type")
  status           AuditStatus
  scheduledDate    DateTime     @map("scheduled_date")
  completedDate    DateTime?    @map("completed_date")
  location         Json         // {tipo: 'presencial'|'remota', endereco?}
  result           AuditResult?
  findings         Json?        // {conformidades: [], nao_conformidades: []}
  auditorNotes     String?      @map("auditor_notes") @db.Text
  createdAt        DateTime     @default(now()) @map("created_at")
  updatedAt        DateTime     @updatedAt @map("updated_at")

  // Relations
  process          Process @relation(fields: [processId], references: [id], onDelete: Cascade)

  @@index([processId])
  @@index([status])
  @@index([scheduledDate])
  @@map("audits")
}

enum AuditType {
  estagio1
  estagio2
  vigilancia
  especial
}

enum AuditStatus {
  agendado
  em_andamento
  concluido
  cancelado
}

enum AuditResult {
  aprovado
  aprovado_condicional
  reprovado
}
```

---

## 🔌 APIs Implementadas

Documentação completa: [ANALYST_PROCESS_APIS.md](../../ANALYST_PROCESS_APIS.md)

### Document Request API

**Base URL**: `/api/document-requests`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/` | Criar solicitação de documento |
| GET | `/:id` | Buscar solicitação por ID |
| PATCH | `/:id` | Atualizar solicitação |
| POST | `/:id/fulfill` | Marcar como atendido |
| POST | `/:id/cancel` | Cancelar solicitação |
| DELETE | `/:id` | Deletar solicitação |
| GET | `/overdue` | Buscar solicitações atrasadas |

**Process-nested**:
- GET `/processes/:processId/document-requests` - Todas as solicitações
- GET `/processes/:processId/document-requests/pending` - Solicitações pendentes

### Comment API

**Base URL**: `/api/comments`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/` | Criar comentário |
| GET | `/:id` | Buscar comentário por ID |
| PATCH | `/:id` | Atualizar comentário (owner only) |
| DELETE | `/:id` | Deletar comentário (owner only) |
| GET | `/mentions` | Comentários onde usuário foi mencionado |
| GET | `/my-comments` | Comentários do usuário |

**Process-nested**:
- GET `/processes/:processId/comments` - Todos os comentários do processo

### Audit Schedule API

**Base URL**: `/api/audits`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/` | Criar agendamento |
| GET | `/:id` | Buscar auditoria por ID |
| PATCH | `/:id` | Atualizar auditoria |
| POST | `/:id/complete` | Concluir com resultados |
| POST | `/:id/cancel` | Cancelar auditoria |
| DELETE | `/:id` | Deletar auditoria |
| GET | `/upcoming` | Auditorias próximas |
| GET | `/status/:status` | Auditorias por status |
| GET | `/statistics` | Estatísticas |

**Process-nested**:
- GET `/processes/:processId/audits` - Todas as auditorias do processo

---

## 🎨 Componentes Frontend

### DocumentRequestModal

**Localização**: `frontend/src/components/analyst/DocumentRequestModal.tsx`

Modal para criação de solicitações de documentos.

**Features**:
- Seleção de tipo de documento (dropdown com 11 tipos)
- Campo de descrição obrigatório
- Data limite opcional
- Validação de formulário
- Integração com React Query para mutations
- Toast notifications de sucesso/erro

**Props**:
```typescript
interface DocumentRequestModalProps {
  processId: string;
  onClose: () => void;
}
```

### AuditScheduleModal

**Localização**: `frontend/src/components/analyst/AuditScheduleModal.tsx`

Modal para agendamento de auditorias.

**Features**:
- Seleção de tipo de auditoria (4 tipos)
- Campos de data e hora
- Escolha entre auditoria presencial/remota
- Campo de endereço condicional
- Observações do auditor
- Validação de formulário completa

**Props**:
```typescript
interface AuditScheduleModalProps {
  processId: string;
  onClose: () => void;
}
```

### CommentsSection

**Localização**: `frontend/src/components/analyst/CommentsSection.tsx`

Seção completa de comentários e observações.

**Features**:
- Listagem de comentários em tempo real
- Criar novos comentários
- Toggle interno/externo (apenas analistas)
- Editar próprios comentários
- Deletar próprios comentários
- Indicadores visuais de comentários internos
- Timestamp e informações do autor
- Estado vazio com mensagem informativa

**Props**:
```typescript
interface CommentsSectionProps {
  processId: string;
}
```

---

## 📄 Página Atualizada: ProcessDetails

**Localização**: `frontend/src/pages/ProcessDetails.tsx`

Página de detalhes do processo foi atualizada para integrar todos os novos componentes.

**Mudanças**:
1. Adicionados botões de ação para analistas:
   - "Solicitar Documentos" → Abre `DocumentRequestModal`
   - "Agendar Auditoria" → Abre `AuditScheduleModal`

2. Seção de comentários integrada:
   - `CommentsSection` exibida abaixo dos detalhes do processo
   - Full-width para melhor visualização

3. Controle de acesso:
   - Botões de ação visíveis apenas para analistas
   - Comentários filtrados por role

---

## 🗂️ Services TypeScript

### document-request.service.ts

**Localização**: `frontend/src/services/document-request.service.ts`

Service para interagir com API de solicitações de documentos.

**Métodos**:
- `createDocumentRequest(data)` - Criar solicitação
- `getProcessDocumentRequests(processId)` - Listar por processo
- `getPendingDocumentRequests(processId)` - Pendentes por processo
- `getDocumentRequestById(id)` - Buscar por ID
- `updateDocumentRequest(id, data)` - Atualizar
- `fulfillDocumentRequest(id, uploadedDocId)` - Marcar como atendido
- `cancelDocumentRequest(id)` - Cancelar
- `getOverdueRequests()` - Buscar atrasados
- `deleteDocumentRequest(id)` - Deletar

### comment.service.ts

**Localização**: `frontend/src/services/comment.service.ts`

Service para interagir com API de comentários.

**Métodos**:
- `createComment(data)` - Criar comentário
- `getProcessComments(processId, includeInternal)` - Listar por processo
- `getCommentById(id)` - Buscar por ID
- `updateComment(id, data)` - Atualizar
- `deleteComment(id)` - Deletar
- `getMentions(limit)` - Comentários onde usuário foi mencionado
- `getMyComments(limit)` - Comentários do usuário

### audit.service.ts

**Localização**: `frontend/src/services/audit.service.ts`

Service para interagir com API de auditorias.

**Métodos**:
- `createAudit(data)` - Criar auditoria
- `getProcessAudits(processId)` - Listar por processo
- `getAuditById(id)` - Buscar por ID
- `updateAudit(id, data)` - Atualizar
- `completeAudit(id, data)` - Concluir com resultados
- `cancelAudit(id, reason)` - Cancelar
- `getUpcomingAudits(daysAhead)` - Auditorias próximas
- `getAuditsByStatus(status)` - Por status
- `getAuditStatistics()` - Estatísticas
- `deleteAudit(id)` - Deletar

---

## 🔒 Controle de Acesso

### Permissions Backend

**Solicitação de Documentos**:
- ✅ Criar: Apenas analistas
- ✅ Visualizar: Analistas e empresas (seus processos)
- ✅ Atualizar: Apenas analistas
- ✅ Cancelar/Deletar: Apenas analistas

**Comentários**:
- ✅ Criar: Todos os usuários autenticados
- ✅ Visualizar internos: Apenas analistas
- ✅ Visualizar externos: Todos
- ✅ Editar/Deletar: Apenas owner do comentário

**Auditorias**:
- ✅ Criar/Agendar: Apenas analistas
- ✅ Visualizar: Analistas e empresas (seus processos)
- ✅ Atualizar/Cancelar/Deletar: Apenas analistas
- ✅ Completar: Apenas analistas

---

## 📊 Migração de Banco de Dados

### Migration: 20251118_add_document_requests

**Arquivo**: `backend/prisma/migrations/20251118_add_document_requests/migration.sql`

**Operações**:
1. Criado enum `DocumentRequestStatus`
2. Criada tabela `document_requests` com:
   - Chave primária UUID
   - Foreign keys para `processes`, `users` e `documents`
   - 4 índices para performance (processId, requestedBy, status, dueDate)
   - Timestamps automáticos

**Execução**:
```bash
npx prisma migrate deploy
```

**Status**: ✅ Aplicado com sucesso

---

## ✅ Critérios de Aceite Atendidos

### US-023: Solicitação de Documentos

- [x] Botão "Solicitar Documentos" funcional
- [x] Lista de 11 tipos de documentos predefinidos
- [x] Campo de descrição obrigatório com mínimo de 10 caracteres
- [x] Prazo de envio opcional
- [x] Status rastreado (pendente/atendido/cancelado)
- [x] Visualização de solicitações por processo
- [x] API completa com 7 endpoints

### US-023.1: Sistema de Comentários

- [x] Adicionar comentários na página do processo
- [x] Toggle comentário interno/externo para analistas
- [x] Editar próprios comentários com indicador de edição
- [x] Deletar próprios comentários
- [x] Sistema de menções com array de user IDs
- [x] Histórico ordenado cronologicamente
- [x] Indicadores visuais (ícone de cadeado para internos)

### US-023.2: Agendamento de Auditorias

- [x] Criar agendamento com tipo, data, hora e local
- [x] 4 tipos de auditoria suportados
- [x] Auditoria presencial (com endereço) ou remota
- [x] Campo de observações do auditor
- [x] Status rastreado (agendado, em_andamento, concluído, cancelado)
- [x] Registro de resultados (aprovado, aprovado_condicional, reprovado)
- [x] Campo de findings (conformidades e não-conformidades)
- [x] API completa com 10 endpoints

---

## 🚀 Próximos Passos

### Melhorias Futuras

1. **Notificações em Tempo Real**:
   - WebSocket para notificar empresa quando documento for solicitado
   - Notificar analista quando documento for enviado
   - Notificar quando comentário mencionar usuário

2. **Integração com Calendário**:
   - Exportar auditorias para Google Calendar
   - Sincronização bidirecional
   - Reminders automáticos

3. **Sistema de Menções Avançado**:
   - Autocomplete ao digitar @
   - Notificações quando mencionado
   - Badge de menções não lidas

4. **Upload Direto de Documentos**:
   - Empresa responder solicitação com upload direto
   - Vincular automaticamente uploadedDocId
   - Marcar como atendido automaticamente

5. **Dashboard de Documentos Pendentes**:
   - Visualização de todas as solicitações em aberto
   - Filtros por empresa, analista, tipo
   - Alertas de solicitações atrasadas

6. **Matching Inteligente de Auditores** (US-026):
   - Cadastro de auditores com especialização
   - Algoritmo considera disponibilidade, localização e expertise
   - Sugestão de top 3 auditores

7. **Agendamento Colaborativo** (US-027):
   - Empresa confirmar/propor datas alternativas
   - Validação de disponibilidade em tempo real
   - Integração com Google Calendar

---

## 📚 Referências

- [Documentação Completa da API](../../ANALYST_PROCESS_APIS.md)
- [Classificação Industrial Migration](../../INDUSTRIAL_CLASSIFICATION_MIGRATION.md)
- [Épico 3: Análise e Preparação](../01-prd/05-user-stories/epic-03-analysis.md)
- [Database Schema](../02-technical/03-database/01-erd.md)

---

**Desenvolvido por**: Claude Code
**Data**: 18 de Novembro de 2025
**Tempo de Desenvolvimento**: ~3 horas
**Status**: ✅ Produção
