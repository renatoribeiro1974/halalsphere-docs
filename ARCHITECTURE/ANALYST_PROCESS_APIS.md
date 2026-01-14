# Analyst Process Management APIs

**Created**: November 18, 2025
**Status**: ✅ Backend Complete - Frontend Pending

This document lists all API endpoints created for analyst process management features: document requests, comments, and audit scheduling.

---

## 📋 Document Request API

### Base URL: `/api/document-requests`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/` | Create new document request | Analyst only |
| GET | `/:id` | Get document request by ID | Authenticated |
| PATCH | `/:id` | Update document request | Authenticated |
| POST | `/:id/fulfill` | Mark request as fulfilled with uploaded document | Authenticated |
| POST | `/:id/cancel` | Cancel document request | Analyst only |
| DELETE | `/:id` | Delete document request | Analyst only |
| GET | `/overdue` | Get all overdue document requests | Analyst only |

### Process-Specific Routes: `/api/processes/:processId/document-requests`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/:processId/document-requests` | Get all document requests for a process | Authenticated |
| GET | `/:processId/document-requests/pending` | Get pending document requests for a process | Authenticated |

### Request Body Examples

**Create Document Request:**
```json
{
  "processId": "uuid",
  "documentType": "contrato_social",
  "description": "Favor enviar cópia atualizada do contrato social",
  "dueDate": "2025-12-01T00:00:00Z"
}
```

**Fulfill Document Request:**
```json
{
  "uploadedDocId": "uuid"
}
```

---

## 💬 Comment API

### Base URL: `/api/comments`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/` | Create new comment | Authenticated |
| GET | `/:id` | Get comment by ID | Authenticated |
| PATCH | `/:id` | Update own comment | Owner only |
| DELETE | `/:id` | Delete own comment | Owner only |
| GET | `/mentions` | Get comments where user is mentioned | Authenticated |
| GET | `/my-comments` | Get user's own comments | Authenticated |

### Process-Specific Routes: `/api/processes/:processId/comments`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/:processId/comments` | Get all comments for a process | Authenticated |

### Query Parameters

- `includeInternal`: (boolean) Show internal comments (default: true for analysts, false for companies)
- `limit`: (number) Limit results (default: 50)

### Request Body Examples

**Create Comment:**
```json
{
  "processId": "uuid",
  "content": "Documentação aprovada. Seguir para próxima fase.",
  "mentions": ["user-uuid-1", "user-uuid-2"],
  "isInternal": true
}
```

**Update Comment:**
```json
{
  "content": "Documentação aprovada com ressalvas. Seguir para próxima fase.",
  "isInternal": false
}
```

---

## 📅 Audit Schedule API

### Base URL: `/api/audits`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/` | Create new audit schedule | Analyst only |
| GET | `/:id` | Get audit by ID | Authenticated |
| PATCH | `/:id` | Update audit | Analyst only |
| POST | `/:id/complete` | Mark audit as completed with results | Analyst only |
| POST | `/:id/cancel` | Cancel audit | Analyst only |
| DELETE | `/:id` | Delete audit | Analyst only |
| GET | `/upcoming` | Get upcoming audits | Analyst only |
| GET | `/status/:status` | Get audits by status | Analyst only |
| GET | `/statistics` | Get audit statistics | Analyst only |

### Process-Specific Routes: `/api/processes/:processId/audits`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/:processId/audits` | Get all audits for a process | Authenticated |

### Query Parameters

- `daysAhead`: (number) Days ahead for upcoming audits (default: 30)

### Request Body Examples

**Create Audit:**
```json
{
  "processId": "uuid",
  "auditType": "estagio1",
  "scheduledDate": "2025-12-15T14:00:00Z",
  "location": {
    "tipo": "presencial",
    "endereco": "Rua ABC, 123 - São Paulo, SP"
  },
  "auditorNotes": "Auditoria inicial do processo"
}
```

**Update Audit:**
```json
{
  "scheduledDate": "2025-12-16T14:00:00Z",
  "status": "em_andamento",
  "auditorNotes": "Auditoria adiada devido a falta de documentação"
}
```

**Complete Audit:**
```json
{
  "result": "aprovado",
  "findings": {
    "conformidades": [
      "Sistema de rastreabilidade adequado",
      "Procedimentos documentados corretamente"
    ],
    "nao_conformidades": [
      "Falta de treinamento para equipe de produção"
    ]
  },
  "auditorNotes": "Processo aprovado com recomendação de treinamento"
}
```

**Cancel Audit:**
```json
{
  "reason": "Empresa solicitou reagendamento"
}
```

---

## 📊 Data Models

### DocumentRequest

```typescript
{
  id: string (UUID)
  processId: string (UUID)
  requestedBy: string (UUID) // User ID of analyst
  documentType: DocumentType
  description: string
  dueDate?: Date
  status: 'pendente' | 'atendido' | 'cancelado'
  respondedAt?: Date
  uploadedDocId?: string (UUID)
  createdAt: Date
  updatedAt: Date
}
```

### Comment

```typescript
{
  id: string (UUID)
  processId: string (UUID)
  userId: string (UUID)
  content: string
  mentions: string[] // Array of user IDs
  isInternal: boolean // Internal notes vs visible to client
  editedAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

### Audit

```typescript
{
  id: string (UUID)
  processId: string (UUID)
  auditType: 'estagio1' | 'estagio2' | 'vigilancia' | 'especial'
  status: 'agendado' | 'em_andamento' | 'concluido' | 'cancelado'
  scheduledDate: Date
  completedDate?: Date
  location: {
    tipo: 'presencial' | 'remota'
    endereco?: string
  }
  result?: 'aprovado' | 'aprovado_condicional' | 'reprovado'
  findings?: {
    conformidades: any[]
    nao_conformidades: any[]
  }
  auditorNotes?: string
  createdAt: Date
  updatedAt: Date
}
```

---

## 🔑 Authentication & Authorization

All endpoints require authentication via JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

### Role-Based Access:

- **Analyst (`analista`)**: Full access to all endpoints
- **Company (`empresa`)**: Read-only access to their process data
  - Cannot create/cancel document requests
  - Cannot create/update/cancel audits
  - Cannot see internal comments

---

## 🧪 Testing the APIs

### Using curl:

**Login as analyst:**
```bash
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"analista@halalsphere.com","password":"senha123"}'
```

**Create document request:**
```bash
TOKEN="your-jwt-token"
curl -X POST http://localhost:3333/api/document-requests \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "processId":"process-uuid",
    "documentType":"contrato_social",
    "description":"Favor enviar contrato social atualizado",
    "dueDate":"2025-12-01T00:00:00Z"
  }'
```

**Get document requests for a process:**
```bash
curl http://localhost:3333/api/processes/{processId}/document-requests \
  -H "Authorization: Bearer $TOKEN"
```

**Create comment:**
```bash
curl -X POST http://localhost:3333/api/comments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "processId":"process-uuid",
    "content":"Documentação aprovada",
    "isInternal":true
  }'
```

**Schedule audit:**
```bash
curl -X POST http://localhost:3333/api/audits \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "processId":"process-uuid",
    "auditType":"estagio1",
    "scheduledDate":"2025-12-15T14:00:00Z",
    "location":{"tipo":"presencial","endereco":"Rua ABC, 123"}
  }'
```

---

## 📝 Response Format

All endpoints return responses in this format:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message",
  "details": [ ... ] // Optional validation errors
}
```

---

## 🚀 Next Steps

### Frontend Implementation (Pending):

1. ✅ **Backend APIs** - Complete
2. ⏳ **ProcessActions Component** - Action buttons in ProcessDetails
3. ⏳ **DocumentRequestModal** - Modal to create document requests
4. ⏳ **CommentsSection** - Comments display and creation
5. ⏳ **AuditScheduleModal** - Modal to schedule audits
6. ⏳ **ProcessDetails Page Update** - Integrate all components

---

## 📚 Related Files

### Backend:
- `backend/src/modules/document-request/`
  - `document-request.service.ts`
  - `document-request.controller.ts`
  - `document-request.routes.ts`
- `backend/src/modules/comment/`
  - `comment.service.ts`
  - `comment.controller.ts`
  - `comment.routes.ts`
- `backend/src/modules/audit-schedule/`
  - `audit-schedule.service.ts`
  - `audit-schedule.controller.ts`
  - `audit-schedule.routes.ts`
- `backend/src/server.ts` - Route registration
- `backend/prisma/schema.prisma` - Database models
- `backend/prisma/migrations/20251118_add_document_requests/` - Migration

---

**Developed by**: Claude Code
**Date**: November 18, 2025
**Status**: Backend Complete ✅ | Frontend Pending ⏳
