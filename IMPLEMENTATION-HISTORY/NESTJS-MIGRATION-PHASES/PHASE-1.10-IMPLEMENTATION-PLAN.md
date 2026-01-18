# Phase 1.10 - AuditorAllocation Module Implementation Plan

**Date:** 15 de Janeiro de 2026
**Status:** 🟡 In Progress
**Module:** AuditorAllocationModule (Auditor Allocation to Processes)

---

## 📋 Overview

Implement the **AuditorAllocationModule** for allocating auditors to certification processes.

### Key Features:
- Allocate auditor to process (updates process.auditorId)
- Remove auditor from process
- List processes by auditor
- List available auditors (role='auditor')
- Simple allocation without complex matching algorithm

---

## 🎯 Schema Analysis

### Process Model (existing)
```prisma
model Process {
  ...
  auditorId    String?   @map("auditor_id") @db.Uuid
  auditor      User?     @relation("AuditorProcesses", fields: [auditorId], references: [id])
  ...
}
```

**Note:** There is NO separate AuditorAllocation model in the schema. Allocation is done by setting `auditorId` directly on the Process model.

---

## 📦 Implementation Components

### 1. DTOs (2 DTOs)

#### allocate-auditor.dto.ts
```typescript
- auditorId: string // User ID with role='auditor'
```

#### auditor-filters.dto.ts
```typescript
- available?: boolean // Filter auditors with capacity
- skip?: number
- take?: number
```

### 2. Service Methods (6 methods)

#### Allocation Operations
- `allocateAuditor(processId: string, dto: AllocateAuditorDto): Promise<Process>` - Allocate auditor to process
- `removeAuditor(processId: string): Promise<Process>` - Remove auditor from process

#### Query Operations
- `findProcessesByAuditor(auditorId: string): Promise<Process[]>` - Get processes assigned to auditor
- `findAvailableAuditors(filters?: AuditorFiltersDto): Promise<{ data: User[], total: number }>` - List auditors
- `getAuditorWorkload(auditorId: string): Promise<WorkloadInfo>` - Get auditor's current workload
- `getAuditorStats(): Promise<AllocationStats>` - Get allocation statistics

### 3. Controller Endpoints (6 endpoints)

#### Allocation Endpoints
- `PATCH /auditor-allocation/process/:processId/allocate` - Allocate auditor (gestor, admin)
- `PATCH /auditor-allocation/process/:processId/remove` - Remove auditor (gestor, admin)

#### Query Endpoints
- `GET /auditor-allocation/auditor/:auditorId/processes` - Get auditor's processes (gestor, admin, auditor)
- `GET /auditor-allocation/auditors` - List available auditors (gestor, admin)
- `GET /auditor-allocation/auditor/:auditorId/workload` - Get workload (gestor, admin, auditor)
- `GET /auditor-allocation/stats` - Get statistics (gestor, admin)

---

## 🧪 Testing Strategy

### Test Coverage (Target: 18+ tests)

#### Allocation Tests (6 tests)
- Allocate auditor to process successfully
- Allocate - process not found
- Allocate - user is not auditor
- Remove auditor from process
- Remove auditor - process not found
- Remove auditor - no auditor assigned

#### Query Tests (8 tests)
- Find processes by auditor
- Find available auditors
- Filter available auditors with pagination
- Get auditor workload
- Get auditor workload - auditor not found
- Get auditor stats
- Verify auditor role validation
- Handle process without auditor

#### Business Rules Tests (4 tests)
- Only users with role='auditor' can be allocated
- Allocating auditor updates process.auditorId
- Removing auditor sets process.auditorId to null
- Workload calculates correctly

---

## 📝 Implementation Notes

### Differences from Fastify Example

**Removed Features (Not in schema):**
- AuditorAllocation model (separate table)
- Complex matching algorithm with competencies
- Suggestion system with scoring
- Allocation status workflow (sugerida, aprovada, rejeitada, etc.)
- Competency-based matching
- Language matching
- Experience scoring
- Success rate calculation

**Simplified to Core Features:**
- Direct allocation: process.auditorId = auditorId
- Simple workload calculation (count processes per auditor)
- List available auditors
- Basic statistics

### Business Rules

1. **Allocate Auditor:**
   - Process must exist
   - User must exist and have role='auditor'
   - Updates process.auditorId
   - Creates process history entry

2. **Remove Auditor:**
   - Process must exist
   - Sets process.auditorId to null
   - Creates process history entry

3. **Workload Calculation:**
   - Count processes assigned to auditor
   - Count by status (active vs completed)
   - Simple metric without competency levels

4. **Available Auditors:**
   - Users with role='auditor'
   - Can optionally filter by workload

---

## ✅ Completion Criteria

- [ ] 2 DTOs created and validated
- [ ] AuditorAllocationService with 6 methods
- [ ] AuditorAllocationController with 6 endpoints
- [ ] AuditorAllocationModule created and registered
- [ ] 18+ unit tests (100% passing)
- [ ] Build passing without errors
- [ ] Role validation working (only auditors)
- [ ] Process history tracking

---

## 🚀 Next Steps After Completion

Phase 1.11 will implement **AuditScheduleModule** for scheduling audit dates and locations.

---

**Implementation Start:** 15/01/2026
**Expected Completion:** Same day
**Estimated LOC:** ~550 lines

---

## 📌 Notes

This is a simplified version compared to the Fastify example. The complex competency-based matching algorithm is intentionally omitted because:
1. No AuditorAllocation model exists in the schema
2. No AuditorCompetency model exists in the schema
3. Current schema only supports direct allocation via process.auditorId
4. This provides core functionality while staying aligned with the actual database schema

If competency-based matching is needed in the future, it would require:
- Adding AuditorAllocation model
- Adding AuditorCompetency model
- Adding IndustrialCategory model relations
- Implementing the full scoring algorithm from the example
