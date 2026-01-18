# Phase 1.13 Planning - Request & Company Modules

**Date**: 2026-01-15
**Status**: Ready for Implementation
**Previous Phase**: Phase 1.12 (IndustrialClassification) - ✅ Completed
**Current Phase**: Phase 1.13 (Request & Company) - 📋 Planning
**Next Phase**: Phase 1.14 (Document) - ⏳ Pending

---

## 📊 Migration Progress Update

### Overall Status

```
┌──────────────────────────────────────────────────────────────┐
│         NESTJS MIGRATION - PHASE 1 PROGRESS                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Completed Phases:  ████████████████████████░░░░  67% (12/18)│
│                                                              │
│  ✅ Phase 1.1:  PrismaModule + HealthModule                 │
│  ✅ Phase 1.2:  AuthModule (JWT + Guards)                   │
│  ✅ Phase 1.3:  UserModule (CRUD + Tests)                   │
│  ✅ Phase 1.4:  ProcessModule (17-phase FSM)                │
│  ✅ Phase 1.5:  ProposalModule (Pricing Engine)             │
│  ✅ Phase 1.6:  AuditModule (Workflow Management)           │
│  ✅ Phase 1.7:  ContractModule (Signing Workflow)           │
│  ✅ Phase 1.8:  DocumentRequestModule                       │
│  ✅ Phase 1.9:  CommentModule                               │
│  ✅ Phase 1.10: AuditorAllocationModule                     │
│  ✅ Phase 1.11: Audit Enhancement (Scheduling)              │
│  ✅ Phase 1.12: IndustrialClassificationModule              │
│  📋 Phase 1.13: Request & Company Modules (CURRENT)         │
│  ⏳ Phase 1.14: DocumentModule                              │
│  ⏳ Phase 1.15: CertificateModule                           │
│  ⏳ Phase 1.16: NotificationModule                          │
│  ⏳ Phase 1.17: Integration Testing                         │
│  ⏳ Phase 1.18: E2E Testing Suite (COMPLETED EARLY!)       │
│                                                              │
│  📅 Estimated Completion: January 30, 2026                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Gap Resolution Status

**Priority Gaps Resolved in Last Session**:

| Gap | Status | Date Resolved |
|-----|--------|---------------|
| TODOs no Código (3 instâncias) | ✅ RESOLVED | 2026-01-15 |
| E2E Testing Suite | ✅ RESOLVED | 2026-01-15 |
| Swagger/OpenAPI Docs | ✅ RESOLVED | 2026-01-15 |
| Deployment Guide | ✅ RESOLVED | 2026-01-15 |

📄 **Full Report**: [GAPS-RESOLVED.md](GAPS-RESOLVED.md)

---

## 🎯 Phase 1.13 Overview

### What We're Building

Phase 1.13 implements **two foundational modules** that serve as entry points to the certification workflow:

#### 1. **Request Module** 🔹
The gateway for companies to submit certification requests

**Key Features**:
- Wizard-based request submission (9-step wizard from frontend)
- Request lifecycle management (draft → submitted → approved → process)
- Protocol generation (REQ-YYYYMMDD-XXXXX format)
- Approval workflow with reviewer assignment
- Rejection with detailed notes
- Company-specific request views
- Statistics and reporting

**Endpoints**: 10+ REST endpoints
**Tests**: ~40 unit tests
**Complexity**: HIGH

#### 2. **Company Module** 🏢
Company profile and verification management

**Key Features**:
- Company registration (CNPJ validation)
- Profile management (CRUD operations)
- Company verification workflow (admin only)
- Search by name, CNPJ, location
- Company statistics
- Soft delete support

**Endpoints**: 8+ REST endpoints
**Tests**: ~30 unit tests
**Complexity**: MEDIUM

### Why These Modules Now?

1. **Critical Dependencies**: Request and Company are **required** before we can implement:
   - Document Management (Phase 1.14)
   - Certificate Issuance (Phase 1.15)
   - Notifications (Phase 1.16)

2. **Workflow Foundation**: These modules represent the **start** of the certification journey:
   ```
   Company Registration → Request Submission → Process Creation → ... → Certificate
   ```

3. **Frontend Integration Ready**: The frontend wizard is already implemented and awaiting backend endpoints

---

## 📋 Detailed Scope

### Request Module

#### Service Layer (request.service.ts)

**Core Operations**:
```typescript
// CRUD
create(dto: CreateRequestDto): Promise<Request>
update(id: string, dto: UpdateRequestDto): Promise<Request>
findById(id: string): Promise<Request>
findAll(filters: RequestFiltersDto): Promise<{ data: Request[]; total: number }>

// Workflow
submit(id: string): Promise<Request>                                    // draft → pending
startReview(id: string, reviewerId: string): Promise<Request>           // pending → under review
approve(id: string, dto: ApproveRequestDto, userId: string): Promise<Request>  // → approved + create process
reject(id: string, dto: RejectRequestDto, userId: string): Promise<Request>    // → rejected
cancel(id: string, reason?: string): Promise<Request>                   // company cancellation

// Queries
findByCompany(companyId: string): Promise<Request[]>
findByProtocol(protocol: string): Promise<Request>
getStats(): Promise<RequestStatistics>
```

**Business Rules**:
- ✅ Only draft requests can be updated
- ✅ Submitting generates unique protocol (REQ-YYYYMMDD-XXXXX)
- ✅ Approval automatically creates a Process (integration with Phase 1.4)
- ✅ Companies can only view their own requests
- ✅ Analysts can view all requests
- ✅ Rejection requires detailed reason

#### Controller Layer (request.controller.ts)

**Endpoints**:
```
POST   /requests                    - Create new request
GET    /requests/:id                - Get request by ID
PATCH  /requests/:id                - Update request (draft only)
DELETE /requests/:id                - Cancel request
PATCH  /requests/:id/submit         - Submit for review
PATCH  /requests/:id/start-review   - Start analysis (analyst)
PATCH  /requests/:id/approve        - Approve request (creates process)
PATCH  /requests/:id/reject         - Reject request
GET    /requests                    - List all (with filters)
GET    /requests/company/:companyId - Get company requests
GET    /requests/protocol/:protocol - Get by protocol
GET    /requests/stats/summary      - Get statistics
```

**Authorization**:
- 🔐 All endpoints require JWT authentication
- 👤 Companies can only access their own requests
- 👔 Analysts/Gestores can access all requests
- 🔑 Admin has full access

#### DTOs (Data Transfer Objects)

1. **CreateRequestDto** - Full request data from wizard
2. **UpdateRequestDto** - Partial update (draft only)
3. **SubmitRequestDto** - Empty (just triggers submit)
4. **ApproveRequestDto** - Review notes
5. **RejectRequestDto** - Rejection reason + notes
6. **RequestFiltersDto** - Pagination + filters

---

### Company Module

#### Service Layer (company.service.ts)

**Core Operations**:
```typescript
// CRUD
create(dto: CreateCompanyDto): Promise<Company>
update(id: string, dto: UpdateCompanyDto): Promise<Company>
findById(id: string): Promise<Company>
findAll(filters: CompanyFiltersDto): Promise<{ data: Company[]; total: number }>
softDelete(id: string): Promise<Company>

// Verification
verify(id: string, verifierId: string): Promise<Company>
unverify(id: string): Promise<Company>

// Search & Queries
search(query: string): Promise<Company[]>
findByCnpj(cnpj: string): Promise<Company>
getStats(): Promise<CompanyStatistics>
```

**Business Rules**:
- ✅ CNPJ must be unique and valid
- ✅ Verification requires admin role
- ✅ Soft delete (isActive = false) preserves historical data
- ✅ Search supports razaoSocial, nomeFantasia, CNPJ
- ✅ Unverified companies have limited access

#### Controller Layer (company.controller.ts)

**Endpoints**:
```
POST   /companies              - Register new company
GET    /companies/:id          - Get company by ID
PATCH  /companies/:id          - Update company details
DELETE /companies/:id          - Soft delete company
PATCH  /companies/:id/verify   - Verify company (admin only)
PATCH  /companies/:id/unverify - Remove verification
GET    /companies              - List all (with filters)
GET    /companies/search       - Search by name/CNPJ
GET    /companies/cnpj/:cnpj   - Get by CNPJ
GET    /companies/stats/summary - Get statistics
```

**Authorization**:
- 🔐 All endpoints require JWT authentication
- 🏢 Companies can only update their own data
- 👔 Analysts/Gestores can view all companies
- 🔑 Admin can verify/delete companies

#### DTOs

1. **CreateCompanyDto** - Company registration data
2. **UpdateCompanyDto** - Partial update (restricted fields)
3. **VerifyCompanyDto** - Verification notes
4. **CompanyFiltersDto** - Pagination + filters
5. **CompanySearchDto** - Search parameters

---

## 🔗 Module Dependencies

### Phase 1.13 depends on:

| Module | Phase | Required For | Status |
|--------|-------|-------------|--------|
| PrismaModule | 1.1 | Database access | ✅ |
| AuthModule | 1.2 | JWT guards | ✅ |
| ProcessModule | 1.4 | Request approval → Process creation | ✅ |
| IndustrialClassificationModule | 1.12 | Request classification | ✅ |

### Modules that depend on Phase 1.13:

| Module | Phase | Reason | Status |
|--------|-------|--------|--------|
| DocumentModule | 1.14 | Documents belong to Request/Company | ⏳ |
| CertificateModule | 1.15 | Certificates issued to Company | ⏳ |
| NotificationModule | 1.16 | Notify companies about requests | ⏳ |

---

## 📊 Database Schema

### Request Table

**23 columns**, including:
- Basic info (company, contact, type, description)
- Facility location (address, city, state, country)
- Previous certificates (optional)
- Industrial classification (optional, links to Phase 1.12)
- Workflow (status, protocol, review, approval/rejection)
- Timestamps (created, submitted, reviewed)

**Enums**:
- `RequestStatus`: rascunho, pendente, em_analise, aprovado, rejeitado, cancelado
- `RequestType`: nova, renovacao, ampliacao
- `CertificationType`: C1-C6 (different product categories)
- `ProductType`: produto_animal, produto_vegetal, produto_processado, servico

**Relations**:
- `belongsTo` Company
- `belongsTo` User (reviewer)
- `belongsTo` IndustrialGroup (optional)
- `belongsTo` IndustrialCategory (optional)
- `belongsTo` IndustrialSubcategory (optional)
- `hasOne` Process (created on approval)

### Company Table

**19 columns**, including:
- Legal info (razaoSocial, nomeFantasia, CNPJ)
- Contact (email, telefone, website)
- Address (endereco, cidade, estado, pais, cep)
- Tax IDs (inscricaoEstadual, inscricaoMunicipal)
- Verification (isVerified, verifiedAt, verifiedBy)
- Status (isActive)

**Relations**:
- `hasMany` User (company employees)
- `hasMany` Request
- `hasMany` Process
- `hasMany` Contract
- `hasMany` Document
- `belongsTo` User (verifier)

---

## 🧪 Testing Strategy

### Unit Tests (~70 total)

#### request.service.spec.ts (~25 tests)
```
describe('RequestService', () => {
  describe('create', () => {
    it('should create a draft request')
    it('should throw NotFoundException if company not found')
    it('should throw BadRequestException if invalid industrial classification')
    it('should set status to rascunho by default')
  });

  describe('update', () => {
    it('should update draft request')
    it('should throw BadRequestException if not draft')
  });

  describe('submit', () => {
    it('should generate unique protocol')
    it('should set status to pendente')
    it('should set submittedAt timestamp')
    it('should throw if not draft')
  });

  describe('approve', () => {
    it('should create Process on approval')
    it('should set status to aprovado')
    it('should require reviewer role')
    it('should throw if not em_analise')
  });

  describe('reject', () => {
    it('should set rejectionReason')
    it('should set status to rejeitado')
    it('should require rejection reason')
  });

  describe('findAll', () => {
    it('should filter by status')
    it('should filter by company')
    it('should paginate results')
  });

  describe('getStats', () => {
    it('should return total count')
    it('should return counts by status')
    it('should return counts by type')
  });
});
```

#### company.service.spec.ts (~20 tests)
```
describe('CompanyService', () => {
  describe('create', () => {
    it('should create company')
    it('should throw ConflictException if CNPJ exists')
    it('should validate CNPJ format')
  });

  describe('update', () => {
    it('should update company details')
    it('should not allow CNPJ change')
  });

  describe('verify', () => {
    it('should verify company')
    it('should set verifiedAt timestamp')
    it('should require admin role')
  });

  describe('softDelete', () => {
    it('should set isActive to false')
    it('should not delete from database')
  });

  describe('search', () => {
    it('should search by razaoSocial')
    it('should search by nomeFantasia')
    it('should search by CNPJ')
  });
});
```

#### request.controller.spec.ts (~15 tests)
```
describe('RequestController', () => {
  it('POST /requests - should create request')
  it('GET /requests/:id - should return request')
  it('PATCH /requests/:id - should update request')
  it('PATCH /requests/:id/submit - should submit request')
  it('PATCH /requests/:id/approve - should approve and create process')
  it('GET /requests - should list with filters')
  it('GET /requests/stats/summary - should return statistics')
  it('should enforce role-based access')
});
```

#### company.controller.spec.ts (~10 tests)
```
describe('CompanyController', () => {
  it('POST /companies - should register company')
  it('GET /companies/:id - should return company')
  it('PATCH /companies/:id - should update company')
  it('PATCH /companies/:id/verify - should verify (admin only)')
  it('GET /companies/search - should search companies')
  it('should enforce role-based access')
});
```

### Integration Tests

- ✅ Request approval creates Process (Phase 1.4 integration)
- ✅ Request includes IndustrialClassification (Phase 1.12 integration)
- ✅ JWT authentication on all endpoints (Phase 1.2 integration)

---

## 📈 Success Metrics

### Phase Completion Criteria

- ✅ All 18 endpoints implemented and tested
- ✅ 70+ unit tests passing (coverage > 80%)
- ✅ All DTOs with proper validation
- ✅ Swagger documentation complete
- ✅ Role-based access control enforced
- ✅ Request → Process integration working
- ✅ Protocol generation validated
- ✅ CNPJ validation working
- ✅ No TypeScript errors
- ✅ All business rules implemented

### Quality Gates

| Metric | Target | Status |
|--------|--------|--------|
| Test Coverage | > 80% | ⏳ |
| TypeScript Errors | 0 | ⏳ |
| ESLint Warnings | 0 | ⏳ |
| Endpoints Documented | 100% | ⏳ |
| Unit Tests Passing | 100% | ⏳ |

---

## 🚀 Implementation Timeline

### Day 1 (Jan 16): Request Module Setup
- Create module structure
- Implement DTOs
- Start RequestService (CRUD operations)

### Day 2 (Jan 17): Request Service Complete
- Complete RequestService (workflow methods)
- Implement protocol generation
- Write RequestService unit tests

### Day 3 (Jan 18): Request Controller
- Implement RequestController
- Add Swagger documentation
- Write RequestController unit tests

### Day 4 (Jan 19): Company Module Setup
- Create module structure
- Implement DTOs
- Start CompanyService

### Day 5 (Jan 20): Company Service Complete
- Complete CompanyService
- Implement CNPJ validation
- Write CompanyService unit tests

### Day 6 (Jan 21): Company Controller
- Implement CompanyController
- Add Swagger documentation
- Write CompanyController unit tests

### Day 7 (Jan 22): Integration & Testing
- Test Request → Process integration
- E2E testing
- Documentation updates
- Code review and cleanup

---

## 📚 Related Documentation

### Implementation Plans
- [Phase 1.4 - Process Module](../halalsphere-backend-nest/PHASE-1.4-IMPLEMENTATION-PLAN.md)
- [Phase 1.12 - Industrial Classification](../halalsphere-backend-nest/PHASE-1.12-IMPLEMENTATION-PLAN.md)
- [Phase 1.13 - Request & Company](../halalsphere-backend-nest/PHASE-1.13-IMPLEMENTATION-PLAN.md) (NEW!)

### Migration Documents
- [NestJS Migration Plan](../PLANNING/MIGRATION-NESTJS.md)
- [Token Tracking](../IMPLEMENTATION-HISTORY/MIGRATION-NESTJS-TOKEN-TRACKING.md)
- [Statistical Analysis](../IMPLEMENTATION-HISTORY/MIGRATION-NESTJS-STATISTICAL-ANALYSIS.md)

### Gap Resolution
- [Gaps Resolved - January 2026](GAPS-RESOLVED.md)
- [E2E Testing Suite](../halalsphere-backend-nest/test/README.md)
- [API Documentation Guide](../halalsphere-backend-nest/docs/API-DOCUMENTATION.md)
- [Deployment Guide](../halalsphere-backend-nest/docs/DEPLOYMENT.md)

---

## ✅ Pre-Implementation Checklist

Before starting Phase 1.13, ensure:

- [x] Phase 1.12 (IndustrialClassification) is completed
- [x] All priority gaps are resolved (TODOs, E2E, Swagger, Deployment)
- [x] PrismaModule is functional (Phase 1.1)
- [x] AuthModule is functional (Phase 1.2)
- [x] ProcessModule is functional (Phase 1.4)
- [x] Database schema includes Request and Company models
- [x] Development environment is set up
- [ ] Frontend wizard endpoints are documented
- [ ] CNPJ validation library is available
- [ ] Protocol generation format is approved

---

## 🎯 Next Steps After Phase 1.13

Once Phase 1.13 is completed, proceed to:

**Phase 1.14: Document Module** (5-6 days)
- Document upload and management
- S3 integration with AWS SDK
- Document request workflow
- File validation (size, type, virus scan)
- Document versioning

**Phase 1.15: Certificate Module** (4-5 days)
- Certificate generation
- PDF creation
- Certificate validation
- Renewal tracking
- Certificate history

**Phase 1.16: Notification Module** (3-4 days)
- Email notifications
- In-app notifications
- Notification templates
- Delivery tracking

---

**Status**: ✅ Planning Complete - Ready for Implementation
**Est. Start**: January 16, 2026
**Est. Completion**: January 22, 2026 (7 days)
**Blocker**: None
