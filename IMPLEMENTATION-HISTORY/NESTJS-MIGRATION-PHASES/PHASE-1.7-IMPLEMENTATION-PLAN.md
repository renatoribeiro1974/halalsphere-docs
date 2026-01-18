# Phase 1.7 - Contract Module Implementation Plan

**Date:** 15 de Janeiro de 2026
**Status:** 🟡 In Progress
**Module:** ContractModule (Contract Management)

---

## 📋 Overview

Implement the **ContractModule** for managing certification contracts with a 5-state workflow.

### Key Features:
- Contract creation and management
- 5-state workflow (rascunho → enviado → em_negociacao → assinado/cancelado)
- Automatic process advancement when signed
- Contract statistics and tracking

---

## 🎯 Prisma Schema Analysis

### Contract Model (Simplified from Fastify)
```prisma
model Contract {
  id              String         @id @default(dbgenerated("uuid_generate_v4()"))
  processId       String         @map("process_id")
  companyId       String         @map("company_id")
  contractType    ContractType   @map("contract_type")
  status          ContractStatus
  totalValue      Decimal        @map("total_value")
  numInstallments Int            @map("num_installments")
  validityMonths  Int            @map("validity_months")
  pdfUrl          String?        @map("pdf_url")
  sentAt          DateTime?      @map("sent_at")
  signedAt        DateTime?      @map("signed_at")
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  process Process @relation(fields: [processId], references: [id], onDelete: Cascade)
  company Company @relation(fields: [companyId], references: [id])
}
```

### Enums
```prisma
enum ContractType {
  proposta
  contrato
}

enum ContractStatus {
  rascunho
  enviado
  em_negociacao
  assinado
  cancelado
}
```

---

## 🔄 Contract Workflow

### 5-State Workflow
```
rascunho → enviado → em_negociacao ↔ enviado → assinado
                                                    ↓
                                               cancelado
```

### State Transitions

1. **rascunho** (Draft)
   - Initial state when contract is created
   - Can be updated
   - Can be sent to company
   - Can be cancelled

2. **enviado** (Sent)
   - Contract sent to company for review
   - Can enter negotiation
   - Can be signed
   - Can be cancelled

3. **em_negociacao** (Negotiating)
   - Company requested changes
   - Can be sent back with updates
   - Can be cancelled

4. **assinado** (Signed)
   - Final state - contract accepted
   - **Process advances to planejamento_auditoria**
   - Cannot be modified

5. **cancelado** (Cancelled)
   - Final state - contract rejected/cancelled
   - Cannot be modified

---

## 📦 Implementation Components

### 1. DTOs (5 DTOs)

#### create-contract.dto.ts
```typescript
- processId: string
- companyId: string
- contractType: ContractType
- totalValue: number
- numInstallments: number
- validityMonths: number
- pdfUrl?: string
```

#### update-contract.dto.ts
```typescript
- numInstallments?: number
- validityMonths?: number
- totalValue?: number
- pdfUrl?: string
```

#### send-contract.dto.ts
```typescript
// Empty DTO, just triggers send action
```

#### sign-contract.dto.ts
```typescript
- signedAt: Date
```

#### contract-filters.dto.ts
```typescript
- status?: ContractStatus
- contractType?: ContractType
- processId?: string
- companyId?: string
- skip?: number
- take?: number
```

### 2. Service Methods (10 methods)

#### CRUD Operations
- `create(dto: CreateContractDto): Promise<Contract>` - Create draft contract
- `update(id: string, dto: UpdateContractDto): Promise<Contract>` - Update draft
- `findById(id: string): Promise<Contract>` - Get by ID
- `findByProcessId(processId: string): Promise<Contract | null>` - Get by process
- `findAll(filters: ContractFilters): Promise<{ data: Contract[], total: number }>` - List with filters

#### Workflow Operations
- `send(id: string): Promise<Contract>` - Send contract (rascunho → enviado)
- `negotiate(id: string): Promise<Contract>` - Mark as negotiating (enviado → em_negociacao)
- `sign(id: string, dto: SignContractDto): Promise<Contract>` - Sign contract (enviado → assinado) + **advance process**
- `cancel(id: string, reason?: string): Promise<Contract>` - Cancel contract

#### Statistics
- `getStats(): Promise<ContractStats>` - Get statistics

### 3. Controller Endpoints (10 endpoints)

#### CRUD Endpoints
- `POST /contracts` - Create contract (analista, gestor, admin)
- `PATCH /contracts/:id` - Update contract (analista, gestor, admin)
- `GET /contracts/:id` - Get by ID (all roles)
- `GET /contracts/process/:processId` - Get by process (all roles)
- `GET /contracts` - List with filters (analista, gestor, admin)

#### Workflow Endpoints
- `PATCH /contracts/:id/send` - Send contract (analista, gestor, admin)
- `PATCH /contracts/:id/negotiate` - Mark as negotiating (empresa)
- `PATCH /contracts/:id/sign` - Sign contract (empresa)
- `PATCH /contracts/:id/cancel` - Cancel contract (analista, gestor, admin, empresa)

#### Statistics
- `GET /contracts/stats/summary` - Get statistics (gestor, admin)

---

## 🧪 Testing Strategy

### Test Coverage (Target: 20+ tests)

#### CRUD Tests (5 tests)
- Create contract successfully
- Create contract - process not found
- Create contract - process already has contract
- Update contract successfully
- Update contract - only draft can be updated

#### Workflow Tests (8 tests)
- Send draft contract
- Send non-draft contract (should fail)
- Negotiate sent contract
- Negotiate non-sent contract (should fail)
- Sign sent contract + process advancement
- Sign non-sent contract (should fail)
- Cancel contract in various states
- Cannot cancel signed contract

#### Query Tests (4 tests)
- Find by ID - found
- Find by ID - not found
- Find by process ID
- Find all with filters (status, type, pagination)

#### Statistics Tests (1 test)
- Get contract statistics

#### Business Rules Tests (3 tests)
- Contract can only be created for processes in assinatura_contrato phase
- Signing contract advances process to planejamento_auditoria
- Only draft contracts can be updated

---

## 📝 Implementation Notes

### Differences from Fastify Version

**Removed Features (Not in Prisma Schema):**
- ContractSignature model (separate signatures tracking)
- E-signature integration (d4sign, clicksign, docusign)
- PDF generation service
- Contract templates
- Custom clauses
- Payment terms JSON
- Contract data JSON
- Proposal ID reference

**Simplified to Core Features:**
- Basic contract CRUD
- Simple 5-state workflow
- Process integration
- Essential tracking (sent/signed dates)

### Process Integration

When contract is signed:
```typescript
await this.prisma.process.update({
  where: { id: contract.processId },
  data: {
    currentPhase: ProcessPhase.planejamento_auditoria,
    status: ProcessStatus.aguardando_auditoria,
  },
});
```

### Validation Rules

1. **Creation:**
   - Process must exist
   - Process must be in `assinatura_contrato` phase
   - Cannot create duplicate contract for same process

2. **Update:**
   - Contract must be in `rascunho` status
   - Cannot update sent/signed contracts

3. **Send:**
   - Contract must be in `rascunho` status

4. **Negotiate:**
   - Contract must be in `enviado` status

5. **Sign:**
   - Contract must be in `enviado` or `em_negociacao` status
   - Automatically advances process

6. **Cancel:**
   - Cannot cancel `assinado` contracts

---

## ✅ Completion Criteria

- [ ] 5 DTOs created and validated
- [ ] ContractService with 10 methods
- [ ] ContractController with 10 endpoints
- [ ] ContractModule created and registered
- [ ] 20+ unit tests (100% passing)
- [ ] Build passing without errors
- [ ] All business rules enforced
- [ ] Process integration working

---

## 🚀 Next Steps After Completion

Phase 1.8 will implement **DocumentRequestModule** for managing document submissions and reviews.

---

**Implementation Start:** 15/01/2026
**Expected Completion:** Same day
**Estimated LOC:** ~800 lines
