# Phase 1.13: Request & Company Modules - Implementation Plan

**Date**: 2026-01-15
**Status**: Planning
**Estimated Complexity**: HIGH (Core business entities + complex validation)
**Estimated Duration**: 5-7 days

---

## 📋 Overview

Phase 1.13 implements two **foundational modules** that are entry points for the certification workflow:

1. **Request Module** - Certification request management (wizard submission → process creation)
2. **Company Module** - Company profile management (registration, verification, CRUD)

These modules are **critical dependencies** for the certification workflow and must be implemented before advancing to document management and certificate issuance.

---

## 🎯 Scope

### In Scope - Request Module

1. **RequestService** - Business logic for certification requests
   - Create request (from wizard submission)
   - Validate request data
   - Approve/reject workflow
   - Convert approved requests to processes
   - Request statistics and reporting

2. **RequestController** - 10+ REST endpoints
   - POST /requests - Create new request
   - GET /requests/:id - Get request by ID
   - PATCH /requests/:id - Update request (draft only)
   - PATCH /requests/:id/submit - Submit request for analysis
   - PATCH /requests/:id/approve - Approve request (creates process)
   - PATCH /requests/:id/reject - Reject request
   - GET /requests - List all requests (with filters)
   - GET /requests/stats/summary - Get statistics
   - GET /requests/company/:companyId - Get company requests

3. **DTOs** - 6+ DTOs with validation
   - CreateRequestDto
   - UpdateRequestDto
   - SubmitRequestDto
   - ApproveRequestDto
   - RejectRequestDto
   - RequestFiltersDto

4. **Unit Tests** - ~40 tests
   - RequestService: 25 tests
   - RequestController: 15 tests

### In Scope - Company Module

1. **CompanyService** - Business logic for company management
   - CRUD operations
   - Company verification workflow
   - Search and filtering
   - Company statistics

2. **CompanyController** - 8+ REST endpoints
   - POST /companies - Register new company
   - GET /companies/:id - Get company by ID
   - PATCH /companies/:id - Update company details
   - DELETE /companies/:id - Soft delete company
   - PATCH /companies/:id/verify - Verify company (admin only)
   - GET /companies - List all companies (with filters)
   - GET /companies/search - Search companies
   - GET /companies/stats/summary - Get statistics

3. **DTOs** - 5+ DTOs with validation
   - CreateCompanyDto
   - UpdateCompanyDto
   - VerifyCompanyDto
   - CompanyFiltersDto
   - CompanySearchDto

4. **Unit Tests** - ~30 tests
   - CompanyService: 20 tests
   - CompanyController: 10 tests

### Out of Scope (Future Phases)

- Document upload integration (Phase 1.14)
- Certificate generation (Phase 1.15)
- Email notifications (Phase 2.x)
- AI-powered document analysis (Phase 2.x)
- Advanced reporting and analytics (Phase 2.x)

---

## 📊 Database Schema (Already Exists in Prisma)

### Request Model

```prisma
model Request {
  id                    String             @id @default(uuid())
  companyId             String
  companyName           String             @db.VarChar(255)
  contactPerson         String             @db.VarChar(255)
  contactEmail          String             @db.VarChar(255)
  contactPhone          String             @db.VarChar(50)

  requestType           RequestType
  certificationType     CertificationType
  productType           ProductType
  productDescription    String
  productIngredients    String?

  facilityAddress       String
  facilityCity          String             @db.VarChar(100)
  facilityState         String             @db.VarChar(50)
  facilityCountry       String             @db.VarChar(50)
  facilityPostalCode    String             @db.VarChar(20)

  previousCertificates  Boolean            @default(false)
  certifyingBody        String?            @db.VarChar(255)
  certificateNumber     String?            @db.VarChar(100)
  certificateExpiry     DateTime?

  industrialGroupId     String?
  industrialCategoryId  String?
  industrialSubcategoryId String?

  numberOfEmployees     Int?
  annualProduction      String?
  rawMaterialSuppliers  Int?

  additionalInfo        String?

  status                RequestStatus      @default(rascunho)
  protocol              String?            @unique @db.VarChar(50)

  submittedAt           DateTime?
  reviewedAt            DateTime?
  reviewedBy            String?
  reviewNotes           String?
  rejectionReason       String?

  createdAt             DateTime           @default(now())
  updatedAt             DateTime           @updatedAt

  company               Company            @relation(fields: [companyId], references: [id])
  reviewer              User?              @relation("RequestReviewer", fields: [reviewedBy], references: [id])
  process               Process?
  industrialGroup       IndustrialGroup?   @relation(fields: [industrialGroupId], references: [id])
  industrialCategory    IndustrialCategory? @relation(fields: [industrialCategoryId], references: [id])
  industrialSubcategory IndustrialSubcategory? @relation(fields: [industrialSubcategoryId], references: [id])

  @@index([companyId])
  @@index([status])
  @@index([protocol])
  @@index([submittedAt])
}

enum RequestStatus {
  rascunho      // Draft - being filled by company
  pendente      // Pending - submitted, awaiting review
  em_analise    // Under review by analyst
  aprovado      // Approved - process created
  rejeitado     // Rejected
  cancelado     // Cancelled by company
}

enum RequestType {
  nova          // New certification
  renovacao     // Renewal
  ampliacao     // Scope expansion
}

enum CertificationType {
  C1  // Processed foods
  C2  // Chemicals
  C3  // Cosmetics
  C4  // Pharmaceuticals
  C5  // Packaging
  C6  // Food services
}

enum ProductType {
  produto_animal        // Animal products
  produto_vegetal       // Plant products
  produto_processado    // Processed products
  servico               // Services
}
```

### Company Model

```prisma
model Company {
  id                String    @id @default(uuid())

  razaoSocial       String    @db.VarChar(255)
  nomeFantasia      String?   @db.VarChar(255)
  cnpj              String    @unique @db.VarChar(18)

  email             String    @db.VarChar(255)
  telefone          String    @db.VarChar(50)

  endereco          String
  cidade            String    @db.VarChar(100)
  estado            String    @db.VarChar(50)
  pais              String    @db.VarChar(50) @default("Brasil")
  cep               String    @db.VarChar(20)

  website           String?   @db.VarChar(255)

  inscricaoEstadual String?   @db.VarChar(50)
  inscricaoMunicipal String?  @db.VarChar(50)

  isVerified        Boolean   @default(false)
  verifiedAt        DateTime?
  verifiedBy        String?

  isActive          Boolean   @default(true)

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  verifier          User?     @relation("CompanyVerifier", fields: [verifiedBy], references: [id])
  users             User[]    @relation("CompanyUsers")
  requests          Request[]
  processes         Process[]
  contracts         Contract[]
  documents         Document[]

  @@index([cnpj])
  @@index([isActive])
  @@index([isVerified])
}
```

---

## 🏗️ Implementation Steps

### Step 1: Request Module Setup (Day 1)

#### 1.1 Create Module Structure

```bash
nest g module request
nest g service request
nest g controller request
```

#### 1.2 Create DTOs

**create-request.dto.ts**:
```typescript
import { IsString, IsEmail, IsEnum, IsOptional, IsBoolean, IsInt, MaxLength, MinLength, Matches, IsUUID } from 'class-validator';
import { RequestType, CertificationType, ProductType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRequestDto {
  @ApiProperty({ description: 'Company ID' })
  @IsUUID()
  companyId: string;

  @ApiProperty({ description: 'Company name', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  companyName: string;

  @ApiProperty({ description: 'Contact person name', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  contactPerson: string;

  @ApiProperty({ description: 'Contact email', format: 'email' })
  @IsEmail()
  @MaxLength(255)
  contactEmail: string;

  @ApiProperty({ description: 'Contact phone number' })
  @IsString()
  @MaxLength(50)
  contactPhone: string;

  @ApiProperty({ description: 'Request type', enum: RequestType })
  @IsEnum(RequestType)
  requestType: RequestType;

  @ApiProperty({ description: 'Certification type', enum: CertificationType })
  @IsEnum(CertificationType)
  certificationType: CertificationType;

  @ApiProperty({ description: 'Product type', enum: ProductType })
  @IsEnum(ProductType)
  productType: ProductType;

  @ApiProperty({ description: 'Product description' })
  @IsString()
  productDescription: string;

  @ApiPropertyOptional({ description: 'Product ingredients' })
  @IsOptional()
  @IsString()
  productIngredients?: string;

  @ApiProperty({ description: 'Facility address' })
  @IsString()
  facilityAddress: string;

  @ApiProperty({ description: 'Facility city', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  facilityCity: string;

  @ApiProperty({ description: 'Facility state', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  facilityState: string;

  @ApiProperty({ description: 'Facility country', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  facilityCountry: string;

  @ApiProperty({ description: 'Facility postal code', maxLength: 20 })
  @IsString()
  @MaxLength(20)
  facilityPostalCode: string;

  @ApiPropertyOptional({ description: 'Has previous certificates', default: false })
  @IsOptional()
  @IsBoolean()
  previousCertificates?: boolean;

  @ApiPropertyOptional({ description: 'Previous certifying body' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  certifyingBody?: string;

  @ApiPropertyOptional({ description: 'Previous certificate number' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  certificateNumber?: string;

  @ApiPropertyOptional({ description: 'Previous certificate expiry date' })
  @IsOptional()
  certificateExpiry?: Date;

  @ApiPropertyOptional({ description: 'Industrial group ID' })
  @IsOptional()
  @IsUUID()
  industrialGroupId?: string;

  @ApiPropertyOptional({ description: 'Industrial category ID' })
  @IsOptional()
  @IsUUID()
  industrialCategoryId?: string;

  @ApiPropertyOptional({ description: 'Industrial subcategory ID' })
  @IsOptional()
  @IsUUID()
  industrialSubcategoryId?: string;

  @ApiPropertyOptional({ description: 'Number of employees' })
  @IsOptional()
  @IsInt()
  numberOfEmployees?: number;

  @ApiPropertyOptional({ description: 'Annual production volume' })
  @IsOptional()
  @IsString()
  annualProduction?: string;

  @ApiPropertyOptional({ description: 'Number of raw material suppliers' })
  @IsOptional()
  @IsInt()
  rawMaterialSuppliers?: number;

  @ApiPropertyOptional({ description: 'Additional information' })
  @IsOptional()
  @IsString()
  additionalInfo?: string;
}
```

**update-request.dto.ts**:
```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateRequestDto } from './create-request.dto';

export class UpdateRequestDto extends PartialType(CreateRequestDto) {}
```

**approve-request.dto.ts**:
```typescript
import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ApproveRequestDto {
  @ApiPropertyOptional({ description: 'Approval notes from reviewer' })
  @IsOptional()
  @IsString()
  reviewNotes?: string;
}
```

**reject-request.dto.ts**:
```typescript
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectRequestDto {
  @ApiProperty({ description: 'Reason for rejection' })
  @IsString()
  @IsNotEmpty()
  rejectionReason: string;

  @ApiProperty({ description: 'Detailed review notes' })
  @IsString()
  @IsNotEmpty()
  reviewNotes: string;
}
```

**request-filters.dto.ts**:
```typescript
import { IsEnum, IsOptional, IsInt, Min, IsUUID, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { RequestStatus, RequestType, CertificationType, ProductType } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RequestFiltersDto {
  @ApiPropertyOptional({ description: 'Filter by status', enum: RequestStatus })
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @ApiPropertyOptional({ description: 'Filter by request type', enum: RequestType })
  @IsOptional()
  @IsEnum(RequestType)
  requestType?: RequestType;

  @ApiPropertyOptional({ description: 'Filter by certification type', enum: CertificationType })
  @IsOptional()
  @IsEnum(CertificationType)
  certificationType?: CertificationType;

  @ApiPropertyOptional({ description: 'Filter by product type', enum: ProductType })
  @IsOptional()
  @IsEnum(ProductType)
  productType?: ProductType;

  @ApiPropertyOptional({ description: 'Filter by company ID' })
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @ApiPropertyOptional({ description: 'Search by company name' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ description: 'Pagination offset', default: 0, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number = 0;

  @ApiPropertyOptional({ description: 'Items per page', default: 50, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  take?: number = 50;
}
```

#### 1.3 Implement RequestService

**request.service.ts** - Part 1 (CRUD operations):
```typescript
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Request, RequestStatus, ProcessPhase, ProcessStatus } from '@prisma/client';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { ApproveRequestDto } from './dto/approve-request.dto';
import { RejectRequestDto } from './dto/reject-request.dto';
import { RequestFiltersDto } from './dto/request-filters.dto';

/**
 * Service for managing certification requests
 *
 * STATUS WORKFLOW:
 * rascunho → pendente → em_analise → aprovado/rejeitado
 *
 * BUSINESS RULES:
 * - Only draft requests can be updated
 * - Submitting a request generates a unique protocol number
 * - Approving a request creates a new Process
 * - Companies can only see their own requests
 * - Analysts can see all requests
 */
@Injectable()
export class RequestService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create new certification request (status: rascunho)
   */
  async create(dto: CreateRequestDto): Promise<Request> {
    // Validate company exists
    const company = await this.prisma.company.findUnique({
      where: { id: dto.companyId },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    // Validate industrial classification if provided
    if (dto.industrialGroupId) {
      const group = await this.prisma.industrialGroup.findUnique({
        where: { id: dto.industrialGroupId },
      });
      if (!group) {
        throw new BadRequestException('Grupo industrial inválido');
      }
    }

    if (dto.industrialCategoryId) {
      const category = await this.prisma.industrialCategory.findUnique({
        where: { id: dto.industrialCategoryId },
      });
      if (!category) {
        throw new BadRequestException('Categoria industrial inválida');
      }
    }

    if (dto.industrialSubcategoryId) {
      const subcategory = await this.prisma.industrialSubcategory.findUnique({
        where: { id: dto.industrialSubcategoryId },
      });
      if (!subcategory) {
        throw new BadRequestException('Subcategoria industrial inválida');
      }
    }

    // Create request
    return this.prisma.request.create({
      data: {
        ...dto,
        status: RequestStatus.rascunho,
      },
      include: {
        company: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true,
            cnpj: true,
          },
        },
        industrialGroup: true,
        industrialCategory: true,
        industrialSubcategory: true,
      },
    });
  }

  /**
   * Update request details
   * Can only update if status is rascunho
   */
  async update(id: string, dto: UpdateRequestDto): Promise<Request> {
    const request = await this.findById(id);

    // Can only update draft requests
    if (request.status !== RequestStatus.rascunho) {
      throw new BadRequestException(
        'Apenas solicitações em rascunho podem ser atualizadas',
      );
    }

    return this.prisma.request.update({
      where: { id },
      data: dto,
      include: {
        company: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true,
            cnpj: true,
          },
        },
        industrialGroup: true,
        industrialCategory: true,
        industrialSubcategory: true,
      },
    });
  }

  /**
   * Submit request for analysis
   * Transitions status from rascunho → pendente
   * Generates unique protocol number
   */
  async submit(id: string): Promise<Request> {
    const request = await this.findById(id);

    // Can only submit draft requests
    if (request.status !== RequestStatus.rascunho) {
      throw new BadRequestException(
        'Apenas solicitações em rascunho podem ser enviadas',
      );
    }

    // Generate protocol number: REQ-YYYYMMDD-XXXXX
    const protocol = await this.generateProtocol();

    return this.prisma.request.update({
      where: { id },
      data: {
        status: RequestStatus.pendente,
        protocol,
        submittedAt: new Date(),
      },
      include: {
        company: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true,
            cnpj: true,
          },
        },
      },
    });
  }

  /**
   * Start request review
   * Transitions status from pendente → em_analise
   */
  async startReview(id: string, reviewerId: string): Promise<Request> {
    const request = await this.findById(id);

    if (request.status !== RequestStatus.pendente) {
      throw new BadRequestException(
        'Apenas solicitações pendentes podem entrar em análise',
      );
    }

    return this.prisma.request.update({
      where: { id },
      data: {
        status: RequestStatus.em_analise,
        reviewedBy: reviewerId,
      },
      include: {
        company: true,
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Continue in next part...
}
```

---

## 📈 Success Metrics

- ✅ All 70+ tests passing
- ✅ Code coverage > 80%
- ✅ No TypeScript errors
- ✅ All endpoints documented in Swagger
- ✅ Request workflow validated end-to-end
- ✅ Company verification workflow tested

---

## 🔗 Dependencies

### Phase 1.13 depends on:
- ✅ Phase 1.1 - PrismaModule
- ✅ Phase 1.2 - AuthModule (JWT guards)
- ✅ Phase 1.4 - ProcessModule (for request approval → process creation)
- ✅ Phase 1.12 - IndustrialClassificationModule (for classification)

### Modules that depend on Phase 1.13:
- ⏳ Phase 1.14 - DocumentModule (needs Request + Company)
- ⏳ Phase 1.15 - CertificateModule (needs Request + Company)
- ⏳ Phase 1.16 - NotificationModule (needs Request + Company)

---

## 📝 Testing Strategy

### Unit Tests

**request.service.spec.ts** (~25 tests):
- ✅ create() - success
- ✅ create() - company not found
- ✅ create() - invalid industrial classification
- ✅ update() - success
- ✅ update() - only draft requests
- ✅ submit() - generates protocol
- ✅ submit() - only draft requests
- ✅ startReview() - assigns reviewer
- ✅ approve() - creates process
- ✅ approve() - only under review
- ✅ reject() - with reason
- ✅ cancel() - company cancellation
- ✅ findById() - not found
- ✅ findAll() - filters
- ✅ findByCompany() - company requests
- ✅ getStats() - statistics

**company.service.spec.ts** (~20 tests):
- ✅ create() - success
- ✅ create() - duplicate CNPJ
- ✅ update() - success
- ✅ verify() - admin only
- ✅ softDelete() - isActive = false
- ✅ findById() - not found
- ✅ findAll() - filters
- ✅ search() - by name/CNPJ
- ✅ getStats() - statistics

### Integration with Existing Modules

- ✅ Request approval creates Process (Phase 1.4)
- ✅ Industrial classification validation (Phase 1.12)
- ✅ JWT authentication on all endpoints (Phase 1.2)

---

## 🚀 Next Steps (Phase 1.14)

After completing Phase 1.13, move to **Phase 1.14: Document Module**:
- Document upload and management
- S3 integration
- Document request workflow
- File validation and virus scanning

---

## 📚 References

- [Prisma Schema](prisma/schema.prisma)
- [Phase 1.4 - Process Module](PHASE-1.4-IMPLEMENTATION-PLAN.md)
- [Phase 1.12 - Industrial Classification](PHASE-1.12-IMPLEMENTATION-PLAN.md)
- [NestJS Documentation](https://docs.nestjs.com)
- [AWS SDK Documentation](https://docs.aws.amazon.com/sdk-for-javascript/)

---

**Status**: Ready for implementation
**Estimated Start Date**: 2026-01-16
**Estimated Completion**: 2026-01-22 (5-7 days)
