# Phase 1.6 - Audit Module Implementation Plan

## Overview
Implement the complete Audit Module for managing the certification audit lifecycle, including planning, scheduling, execution, and reporting.

## Audit Workflow (7 States)
```
planejada → agendada → em_andamento → concluida → aprovada/reprovada/cancelada
```

## Components to Implement

### 1. DTOs (6 files)
- `create-audit.dto.ts` - Create audit linked to process
- `schedule-audit.dto.ts` - Schedule audit with auditor
- `start-audit.dto.ts` - Start audit execution
- `complete-audit.dto.ts` - Complete with findings
- `finalize-audit.dto.ts` - Final decision (approve/reject)
- `update-audit.dto.ts` - Update audit details

### 2. Services (1 file)
- `audit.service.ts` - Complete audit lifecycle management
  - create() - Create new audit
  - schedule() - Assign auditor and set date
  - start() - Begin execution
  - complete() - Submit findings
  - approve() - Approve audit (advances process)
  - reject() - Reject audit (requires follow-up)
  - cancel() - Cancel audit
  - findById() - Get audit by ID
  - findByProcessId() - Get audits for process
  - findAll() - List with filters
  - getStats() - Audit statistics

### 3. Controller (1 file)
- `audit.controller.ts` - REST API endpoints
  - POST /audits - Create audit
  - PATCH /audits/:id/schedule - Schedule audit
  - PATCH /audits/:id/start - Start execution
  - PATCH /audits/:id/complete - Complete with findings
  - PATCH /audits/:id/approve - Approve (gestor/admin only)
  - PATCH /audits/:id/reject - Reject (gestor/admin only)
  - PATCH /audits/:id/cancel - Cancel audit
  - GET /audits/:id - Get by ID
  - GET /audits/process/:processId - Get by process
  - GET /audits - List all with filters
  - GET /audits/stats/summary - Statistics

### 4. Module (1 file)
- `audit.module.ts` - Register providers and controllers

## Business Rules

### Audit States
1. **planejada** - Initial state after creation
2. **agendada** - Auditor assigned, date set
3. **em_andamento** - Audit in progress
4. **concluida** - Audit completed, awaiting review
5. **aprovada** - Approved by gestor/admin → advances process to emissao_certificado
6. **reprovada** - Rejected → process stays in auditoria phase, may require follow-up
7. **cancelada** - Cancelled for any reason

### State Transitions
- planejada → agendada: schedule()
- agendada → em_andamento: start()
- em_andamento → concluida: complete()
- concluida → aprovada: approve()
- concluida → reprovada: reject()
- any → cancelada: cancel()

### Access Control
- **auditor**: Can execute audits (start, complete)
- **gestor/admin**: Can approve/reject audits
- **analista/gestor/admin**: Can create and schedule audits
- **empresa**: Can view audit results

### Process Integration
- Each process can have multiple audits (initial + follow-ups)
- Audit approval advances process: auditoria → emissao_certificado
- Audit rejection keeps process in auditoria phase
- Process history tracks audit events

### Data Requirements
- **Audit findings**: List of observations/non-conformities
- **Audit checklist**: Items to verify during audit
- **Audit report**: Final summary and decision
- **Scheduled date**: When audit will occur
- **Assigned auditor**: User with auditor role

## Implementation Steps

1. ✅ Create DTOs with validation
2. ✅ Implement AuditService with all methods
3. ✅ Create AuditController with all endpoints
4. ✅ Create AuditModule and register in AppModule
5. ✅ Build and fix TypeScript errors
6. ✅ Create comprehensive tests
7. ✅ Run tests and verify

## Testing Strategy

### AuditService Tests (~25 tests)
- Audit creation
- State transitions (schedule, start, complete, approve, reject, cancel)
- Process integration (phase advancement)
- Access control validation
- Error handling (invalid transitions, not found, etc.)
- Statistics calculation

### Integration Points
- Process module (advance phase on approval)
- User module (auditor assignment)
- ProcessHistory (track audit events)

## Expected Deliverables
- 6 DTOs with validation
- 1 Service (~400 lines)
- 1 Controller with 11 endpoints (~350 lines)
- 1 Module
- ~25 comprehensive tests
- All tests passing
- Build successful
- Documentation updated

## Timeline
- DTOs: 30 min
- Service: 1.5 hours
- Controller: 1 hour
- Module: 15 min
- Tests: 1.5 hours
- **Total: ~4.5 hours**
