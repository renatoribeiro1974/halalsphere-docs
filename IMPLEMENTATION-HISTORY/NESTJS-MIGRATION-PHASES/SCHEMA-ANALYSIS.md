# Schema Analysis: Current vs New Implementation

## Overview

This document analyzes the differences between the current Prisma schema and the newly implemented Request/Company modules, and proposes a migration strategy.

---

## 1. Request Model Differences

### Current Schema (Prisma)
```prisma
model Request {
  id                String            @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  companyId         String            @map("company_id") @db.Uuid
  protocol          String            @unique @db.VarChar(50)
  companyName       String            @map("company_name") @db.VarChar(255)
  cnpj              String            @db.VarChar(14)
  requestType       RequestType       @map("request_type")
  certificationType CertificationType @map("certification_type")

  // Industrial Classification
  industrialGroupId       String? @map("industrial_group_id") @db.Uuid
  industrialCategoryId    String? @map("industrial_category_id") @db.Uuid
  industrialSubcategoryId String? @map("industrial_subcategory_id") @db.Uuid

  productOrigin      ProductOrigin @map("product_origin")
  productType        String        @map("product_type") @db.VarChar(255)
  productCategory    String        @map("product_category") @db.VarChar(255)
  productDescription String        @map("product_description") @db.Text
  productDetails     Json          @map("product_details")
  productionDetails  Json          @map("production_details")
  status             RequestStatus
  submittedAt        DateTime?     @map("submitted_at")
  createdAt          DateTime      @default(now()) @map("created_at")
  updatedAt          DateTime      @updatedAt @map("updated_at")
}
```

### New Implementation (NestJS Service)
```typescript
{
  id: string
  protocol: string
  companyId: string
  companyName: string
  contactPerson: string      // ❌ MISSING in schema
  contactEmail: string       // ❌ MISSING in schema
  contactPhone: string       // ❌ MISSING in schema
  requestType: RequestType
  certificationType: CertificationType
  productDescription: string
  facilityAddress: string    // ❌ MISSING in schema
  facilityCity: string       // ❌ MISSING in schema
  facilityState: string      // ❌ MISSING in schema
  facilityCountry: string    // ❌ MISSING in schema
  industrialClassification: string // ❌ MISSING in schema (text version)
  estimatedProductionCapacity: string // ❌ MISSING in schema
  currentCertifications?: string // ❌ MISSING in schema
  additionalInfo?: string    // ❌ MISSING in schema
  status: RequestStatus
  reviewerId?: string        // ❌ MISSING in schema
  reviewedAt?: DateTime      // ❌ MISSING in schema
  reviewNotes?: string       // ❌ MISSING in schema
  rejectionReason?: string   // ❌ MISSING in schema
  cancelReason?: string      // ❌ MISSING in schema
  processId?: string         // ❌ MISSING in schema
}
```

### Missing Fields in Schema
1. **Contact Information** (3 fields)
   - `contactPerson` - Nome do contato
   - `contactEmail` - Email do contato
   - `contactPhone` - Telefone do contato

2. **Facility Information** (4 fields)
   - `facilityAddress` - Endereço da instalação
   - `facilityCity` - Cidade
   - `facilityState` - Estado
   - `facilityCountry` - País

3. **Review/Workflow Fields** (6 fields)
   - `reviewerId` - ID do revisor
   - `reviewedAt` - Data da revisão
   - `reviewNotes` - Notas da revisão
   - `rejectionReason` - Motivo de rejeição
   - `cancelReason` - Motivo de cancelamento
   - `processId` - ID do processo criado

4. **Additional Fields** (3 fields)
   - `industrialClassification` - Classificação textual
   - `estimatedProductionCapacity` - Capacidade estimada
   - `currentCertifications` - Certificações atuais
   - `additionalInfo` - Informações adicionais

### Unused Fields in New Implementation
1. `cnpj` - Presente no schema, não usado no serviço
2. `productOrigin` - Presente no schema, não usado
3. `productType` - Presente no schema, não usado
4. `productCategory` - Presente no schema, não usado
5. `productDetails` (Json) - Presente no schema, não usado
6. `productionDetails` (Json) - Presente no schema, não usado
7. `submittedAt` - Presente no schema, não usado

### Status Enum Differences
**Schema:** `rascunho | enviado | em_analise | aprovado | rejeitado`
**Implementation:** `rascunho | pendente | em_analise | aprovado | rejeitado | cancelado`

❌ **Missing in schema:** `pendente`, `cancelado`

---

## 2. Company Model Differences

### Current Schema (Prisma)
```prisma
model Company {
  id            String   @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  userId        String   @unique @map("user_id") @db.Uuid
  cnpj          String   @unique @db.VarChar(14)
  razaoSocial   String   @map("razao_social") @db.VarChar(255)
  nomeFantasia  String?  @map("nome_fantasia") @db.VarChar(255)
  address       Json     // Structured JSON
  contact       Json     // Structured JSON
  website       String?  @db.VarChar(255)
  numEmployees  Int?     @map("num_employees")
  annualRevenue Decimal? @map("annual_revenue") @db.Decimal(15, 2)
  mainActivity  String?  @map("main_activity") @db.Text
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
}
```

### New Implementation (NestJS Service)
```typescript
{
  id: string
  razaoSocial: string
  nomeFantasia?: string
  cnpj: string
  email: string              // ❌ MISSING in schema (stored in Json.contact)
  telefone?: string          // ❌ MISSING in schema (stored in Json.contact)
  endereco: string           // ❌ MISSING in schema (stored in Json.address)
  cidade: string             // ❌ MISSING in schema (stored in Json.address)
  estado: string             // ❌ MISSING in schema (stored in Json.address)
  cep?: string               // ❌ MISSING in schema (stored in Json.address)
  pais: string               // ❌ MISSING in schema (stored in Json.address)
  website?: string           // ✅ EXISTS
  tipoEmpresa?: string       // ❌ MISSING in schema
  isVerified: boolean        // ❌ MISSING in schema
  isActive: boolean          // ❌ MISSING in schema
  verifiedAt?: DateTime      // ❌ MISSING in schema
  verifiedBy?: string        // ❌ MISSING in schema (User ID)
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Missing Fields in Schema
1. **Flat Contact Fields** (2 fields)
   - `email` - Currently in Json.contact
   - `telefone` - Currently in Json.contact

2. **Flat Address Fields** (5 fields)
   - `endereco` - Currently in Json.address
   - `cidade` - Currently in Json.address
   - `estado` - Currently in Json.address
   - `cep` - Currently in Json.address
   - `pais` - Currently in Json.address

3. **Verification System** (4 fields)
   - `isVerified` - Boolean flag
   - `isActive` - Boolean flag for soft delete
   - `verifiedAt` - Timestamp
   - `verifiedBy` - Foreign key to User

4. **Company Type** (1 field)
   - `tipoEmpresa` - Type of company entity

### Unused Fields in New Implementation
1. `userId` - Company has direct relation to User in schema
2. `address` (Json) - New implementation uses flat fields
3. `contact` (Json) - New implementation uses flat fields
4. `numEmployees` - Not used in new implementation
5. `annualRevenue` - Not used in new implementation
6. `mainActivity` - Not used in new implementation

---

## 3. Migration Strategy Options

### Option A: Update Schema to Match New Implementation (RECOMMENDED)

**Pros:**
- Cleaner, more explicit fields
- Better TypeScript type safety
- Easier to query and filter
- Follows NestJS best practices
- Supports verification workflow

**Cons:**
- Requires database migration
- Need to migrate existing Json data to flat fields
- More schema changes

**Steps:**
1. Add missing fields to Request model
2. Restructure Company model (flatten Json fields)
3. Add verification fields to Company
4. Update RequestStatus enum
5. Create migration with data transformation
6. Update all services to use new fields

### Option B: Adapt Services to Use Current Schema

**Pros:**
- No database migration needed
- Preserves existing data structure
- Faster implementation

**Cons:**
- Services become more complex
- Json fields harder to query/filter
- TypeScript types less precise
- Missing workflow fields (reviewer, verification, etc.)
- Still need to add missing enums

**Steps:**
1. Modify DTOs to map to Json fields
2. Add transformation logic in services
3. Update RequestStatus enum (add pendente, cancelado)
4. Add missing Request workflow fields
5. Work around missing Company verification system

---

## 4. Recommended Approach: Hybrid Strategy

**Phase 1: Minimal Changes (Quick Fix)**
1. Add missing RequestStatus enum values: `pendente`, `cancelado`
2. Add critical Request workflow fields:
   - `reviewerId`
   - `reviewedAt`
   - `reviewNotes`
   - `rejectionReason`
   - `cancelReason`
   - `processId`
3. Add Company verification fields:
   - `isVerified`
   - `isActive`
   - `verifiedAt`
   - `verifiedBy`

**Phase 2: Full Restructure (Next Sprint)**
1. Flatten Company Json fields
2. Add Request contact/facility fields
3. Remove unused fields
4. Optimize indexes

---

## 5. Immediate Action Items

### Priority 1: Fix Compilation Errors
```prisma
// Add to RequestStatus enum
enum RequestStatus {
  rascunho
  enviado
  pendente     // NEW
  em_analise
  aprovado
  rejeitado
  cancelado    // NEW
}

// Add to Request model
model Request {
  // ... existing fields ...

  // Contact information (can be optional for backward compatibility)
  contactPerson  String? @map("contact_person") @db.VarChar(255)
  contactEmail   String? @map("contact_email") @db.VarChar(255)
  contactPhone   String? @map("contact_phone") @db.VarChar(50)

  // Facility information
  facilityAddress String? @map("facility_address") @db.Text
  facilityCity    String? @map("facility_city") @db.VarChar(100)
  facilityState   String? @map("facility_state") @db.VarChar(100)
  facilityCountry String? @map("facility_country") @db.VarChar(100)

  // Workflow fields
  reviewerId       String?  @map("reviewer_id") @db.Uuid
  reviewedAt       DateTime? @map("reviewed_at")
  reviewNotes      String?  @map("review_notes") @db.Text
  rejectionReason  String?  @map("rejection_reason") @db.Text
  cancelReason     String?  @map("cancel_reason") @db.Text
  processId        String?  @unique @map("process_id") @db.Uuid

  // Additional info
  industrialClassification String? @map("industrial_classification") @db.VarChar(500)
  estimatedProductionCapacity String? @map("estimated_production_capacity") @db.VarChar(255)
  currentCertifications String? @map("current_certifications") @db.Text
  additionalInfo    String? @map("additional_info") @db.Text

  // Relations
  reviewer User? @relation("RequestReviewer", fields: [reviewerId], references: [id])
  process  Process? @relation(fields: [processId], references: [id])
}

// Add to Company model
model Company {
  // ... existing fields ...

  // Flat contact fields (alternative to Json)
  email    String? @db.VarChar(255)
  telefone String? @db.VarChar(50)

  // Flat address fields (alternative to Json)
  endereco String? @db.Text
  cidade   String? @db.VarChar(100)
  estado   String? @db.VarChar(100)
  cep      String? @db.VarChar(20)
  pais     String? @db.VarChar(100)

  // Verification system
  isVerified Boolean  @default(false) @map("is_verified")
  isActive   Boolean  @default(true) @map("is_active")
  verifiedAt DateTime? @map("verified_at")
  verifiedBy String?  @map("verified_by") @db.Uuid

  // Company type
  tipoEmpresa String? @map("tipo_empresa") @db.VarChar(100)

  // Relations
  verifier User? @relation("CompanyVerifier", fields: [verifiedBy], references: [id])

  // Add index for verification queries
  @@index([isVerified])
  @@index([isActive])
}
```

---

## 6. Data Migration Considerations

### For Companies with Existing Json Data
```typescript
// Migration script will need to:
// 1. Extract email from contact.email → email field
// 2. Extract telefone from contact.telefone → telefone field
// 3. Extract address fields from address Json → flat fields
// 4. Set isVerified = false for all existing companies
// 5. Set isActive = true for all existing companies
```

### For Existing Requests
```typescript
// Migration script will need to:
// 1. Map 'enviado' → 'pendente' (if that's the intent)
// 2. Set all new fields to null (backward compatible)
```

---

## 7. Next Steps

1. ✅ Create this analysis document
2. ⏳ Review with team and decide on strategy
3. ⏳ Update Prisma schema with Phase 1 changes
4. ⏳ Create migration file
5. ⏳ Test migration on development database
6. ⏳ Update services to use new fields
7. ⏳ Run tests
8. ⏳ Generate Swagger documentation
9. ⏳ Update progress documentation

---

## Conclusion

**Recommended Immediate Action:** Implement Phase 1 (Minimal Changes) to unblock development.

This adds critical workflow fields while maintaining backward compatibility with existing data through optional fields. The full restructure (Phase 2) can be done in a future sprint after validating the workflow with Phase 1 changes.
