# Phase 1.8 - DocumentRequest Module Implementation Plan

**Date:** 15 de Janeiro de 2026
**Status:** 🟡 In Progress
**Module:** DocumentRequestModule (Document Request Management)

---

## 📋 Overview

Implement the **DocumentRequestModule** for managing document requests from analysts to companies with a 3-state workflow.

### Key Features:
- Analysts request documents from companies during certification process
- 3-state workflow (pendente → atendido/cancelado)
- Due date tracking and overdue detection
- Link to uploaded documents when fulfilled

---

## 🎯 Prisma Schema Analysis

### DocumentRequest Model
```prisma
model DocumentRequest {
  id            String                @id @default(dbgenerated("uuid_generate_v4()"))
  processId     String                @map("process_id")
  requestedBy   String                @map("requested_by") // User ID (analyst)
  documentType  DocumentType          @map("document_type")
  description   String                @db.Text
  dueDate       DateTime?             @map("due_date")
  status        DocumentRequestStatus @default(pendente)
  respondedAt   DateTime?             @map("responded_at")
  uploadedDocId String?               @map("uploaded_doc_id") // Link to Document when fulfilled
  createdAt     DateTime              @default(now())
  updatedAt     DateTime              @updatedAt

  process         Process   @relation(fields: [processId], references: [id], onDelete: Cascade)
  requestedByUser User      @relation("DocumentRequestedBy", fields: [requestedBy], references: [id])
  uploadedDoc     Document? @relation("DocumentRequestDoc", fields: [uploadedDocId], references: [id])
}
```

### Enums
```prisma
enum DocumentRequestStatus {
  pendente
  atendido
  cancelado
}

enum DocumentType {
  contrato_social
  certidao_negativa
  alvara_funcionamento
  laudo_tecnico
  licenca_sanitaria
  fotos
  videos
  laudos
  manual_bpf
  fluxograma_processo
}
```

---

## 🔄 DocumentRequest Workflow

### 3-State Workflow
```
pendente → atendido
        ↘ cancelado
```

### State Transitions

1. **pendente** (Pending)
   - Initial state when analyst creates request
   - Company needs to upload requested document
   - Can be cancelled by analyst
   - Can be marked as atendido when document is uploaded

2. **atendido** (Fulfilled)
   - Final state - document was uploaded
   - Links to the uploaded document
   - Sets respondedAt timestamp
   - Cannot be modified

3. **cancelado** (Cancelled)
   - Final state - request was cancelled by analyst
   - Sets respondedAt timestamp
   - Cannot be modified

---

## 📦 Implementation Components

### 1. DTOs (4 DTOs)

#### create-document-request.dto.ts
```typescript
- processId: string
- documentType: DocumentType
- description: string (min 10 chars)
- dueDate?: Date
```

#### update-document-request.dto.ts
```typescript
- description?: string
- dueDate?: Date
```

#### fulfill-document-request.dto.ts
```typescript
- uploadedDocId: string
```

#### document-request-filters.dto.ts
```typescript
- processId?: string
- status?: DocumentRequestStatus
- documentType?: DocumentType
- overdue?: boolean
- skip?: number
- take?: number
```

### 2. Service Methods (10 methods)

#### CRUD Operations
- `create(requestedBy: string, dto: CreateDocumentRequestDto): Promise<DocumentRequest>` - Create request (analyst only)
- `update(id: string, dto: UpdateDocumentRequestDto): Promise<DocumentRequest>` - Update pending request
- `findById(id: string): Promise<DocumentRequest>` - Get by ID
- `findByProcessId(processId: string): Promise<DocumentRequest[]>` - Get all requests for a process
- `findAll(filters: DocumentRequestFiltersDto): Promise<{ data: DocumentRequest[], total: number }>` - List with filters

#### Workflow Operations
- `fulfill(id: string, dto: FulfillDocumentRequestDto): Promise<DocumentRequest>` - Mark as fulfilled (pendente → atendido)
- `cancel(id: string): Promise<DocumentRequest>` - Cancel request (pendente → cancelado)
- `delete(id: string): Promise<void>` - Delete request (analyst only)

#### Query Operations
- `findPendingByProcess(processId: string): Promise<DocumentRequest[]>` - Get pending requests for a process
- `findOverdue(): Promise<DocumentRequest[]>` - Get all overdue requests

### 3. Controller Endpoints (10 endpoints)

#### CRUD Endpoints
- `POST /document-requests` - Create request (analista, gestor, admin)
- `PATCH /document-requests/:id` - Update request (analista, gestor, admin)
- `GET /document-requests/:id` - Get by ID (all roles)
- `GET /document-requests/process/:processId` - Get by process (all roles)
- `GET /document-requests` - List with filters (analista, gestor, admin)

#### Workflow Endpoints
- `PATCH /document-requests/:id/fulfill` - Fulfill request (empresa)
- `PATCH /document-requests/:id/cancel` - Cancel request (analista, gestor, admin)
- `DELETE /document-requests/:id` - Delete request (analista, gestor, admin)

#### Query Endpoints
- `GET /document-requests/process/:processId/pending` - Get pending for process (all roles)
- `GET /document-requests/overdue` - Get overdue requests (analista, gestor, admin)

---

## 🧪 Testing Strategy

### Test Coverage (Target: 22+ tests)

#### CRUD Tests (5 tests)
- Create document request successfully
- Create request - process not found
- Update pending request
- Update non-pending request (should fail)
- Find by ID - found/not found

#### Workflow Tests (5 tests)
- Fulfill pending request
- Fulfill non-pending request (should fail)
- Cancel pending request
- Cancel non-pending request (should fail)
- Delete request

#### Query Tests (7 tests)
- Find by process ID
- Find pending by process
- Find overdue requests
- Find all with pagination
- Filter by status
- Filter by document type
- Filter by overdue flag

#### Business Rules Tests (5 tests)
- Only pending requests can be updated
- Only pending requests can be fulfilled
- Only pending requests can be cancelled
- Fulfilling request sets respondedAt
- Cancelling request sets respondedAt

---

## 📝 Implementation Notes

### Differences from Fastify Version

**Removed Features (Simplified):**
- Email notification service integration
- RequestId/ProcessId dual lookup (schema uses processId directly)

**Kept Core Features:**
- Complete CRUD operations
- 3-state workflow
- Due date tracking
- Overdue detection
- Document linking

### Business Rules

1. **Creation:**
   - Process must exist
   - Only analysts/gestors/admins can create requests
   - Description minimum 10 characters

2. **Update:**
   - Can only update pending requests
   - Can only update description and dueDate

3. **Fulfill:**
   - Can only fulfill pending requests
   - uploadedDocId must be valid
   - Sets respondedAt to current timestamp
   - Transitions status to atendido

4. **Cancel:**
   - Can only cancel pending requests
   - Sets respondedAt to current timestamp
   - Transitions status to cancelado

5. **Delete:**
   - Only analysts/gestors/admins can delete
   - Can delete in any status

6. **Overdue Detection:**
   - Request is overdue if status is pendente and dueDate < now
   - Overdue requests need urgent attention

---

## ✅ Completion Criteria

- [ ] 4 DTOs created and validated
- [ ] DocumentRequestService with 10 methods
- [ ] DocumentRequestController with 10 endpoints
- [ ] DocumentRequestModule created and registered
- [ ] 22+ unit tests (100% passing)
- [ ] Build passing without errors
- [ ] All business rules enforced
- [ ] Due date handling working correctly

---

## 🚀 Next Steps After Completion

Phase 1.9 will implement **CommentModule** for managing comments and discussions on processes.

---

**Implementation Start:** 15/01/2026
**Expected Completion:** Same day
**Estimated LOC:** ~900 lines
