# Phase 1.5: Proposal Module - Implementation Plan

**Date**: 2026-01-15
**Status**: Planning
**Estimated Complexity**: HIGH (Complex calculation logic + versioned pricing tables)

---

## 📋 Overview

The **Proposal Module** manages commercial proposals for halal certification with:
- Multi-stage pricing calculation (5 stages)
- Versioned pricing tables
- Status workflow (6 states: rascunho → calculada → enviada → aceita/recusada/expirada)
- Manual adjustments with audit trail
- Integration with Process, Contract, Email modules

---

## 🎯 Scope

### In Scope
1. **ProposalService** - Business logic for proposal management
2. **CalculatorService** - Pricing calculation engine (5-stage pipeline)
3. **PricingTableService** - Pricing table version control
4. **ProposalController** - 12+ REST endpoints
5. **DTOs** - 5+ DTOs with validation
6. **ProposalModule** - NestJS module configuration
7. **Unit Tests** - ~80 tests (ProposalService: 40, CalculatorService: 20, PricingTableService: 15, Controller: 25)

### Out of Scope (Future Phases)
- PDF generation (Phase 2.x)
- Email notifications (Phase 2.x)
- Auto-contract creation (Phase 1.6)
- Background job for expiration (Phase 2.x)

---

## 📊 Database Schema (Already Exists in Prisma)

### Proposal Model
```prisma
model Proposal {
  id                  String           @id @default(uuid())
  processId           String           @unique // One-to-one
  pricingTableId      String
  calculationInputs   Json             // Snapshot
  breakdown           Json             // CalculationBreakdown
  totalValue          Decimal          @db.Decimal(10, 2)
  manualAdjustment    Decimal          @default(0) @db.Decimal(10, 2)
  adjustmentReason    String?
  adjustedBy          String?
  finalValue          Decimal          @db.Decimal(10, 2)
  status              ProposalStatus   @default(rascunho)
  validUntil          DateTime?
  pdfUrl              String?
  pdfGeneratedAt      DateTime?
  sentAt              DateTime?
  respondedAt         DateTime?
  responseNotes       String?
  createdAt           DateTime         @default(now())
  updatedAt           DateTime         @updatedAt

  process       Process       @relation(fields: [processId], references: [id], onDelete: Cascade)
  pricingTable  PricingTable  @relation(fields: [pricingTableId], references: [id])
  adjuster      User?         @relation(fields: [adjustedBy], references: [id])

  @@index([processId])
  @@index([status])
  @@index([validUntil])
}

enum ProposalStatus {
  rascunho
  calculada
  enviada
  aceita
  recusada
  expirada
}
```

### PricingTable Model
```prisma
model PricingTable {
  id                    String    @id @default(uuid())
  version               String    @db.VarChar(20)
  effectiveFrom         DateTime
  effectiveTo           DateTime?
  isActive              Boolean   @default(true)

  basePrices            Json
  productMultipliers    Json
  shiftMultipliers      Json
  historyMultipliers    Json
  supplierMultipliers   Json
  manHourRates          Json
  travelCosts           Json
  accommodationCost     Decimal   @db.Decimal(10, 2)
  documentAnalysisFee   Decimal   @db.Decimal(10, 2)
  committeeFee          Decimal   @db.Decimal(10, 2)
  issuanceFee           Decimal   @db.Decimal(10, 2)
  taxRate               Decimal   @db.Decimal(5, 2)

  country               Country   @default(BR)
  currency              Currency  @default(BRL)

  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  proposals Proposal[]

  @@index([isActive])
  @@index([effectiveFrom])
}
```

---

## 🏗️ Implementation Steps

### Step 1: DTOs & Interfaces (~150 lines)

**Files to Create**:

#### `src/proposal/dto/create-proposal.dto.ts`
```typescript
export class CalculationInputDto {
  @IsEnum(CertificationType)
  certificationType: CertificationType; // C1-C6

  @IsEnum(RequestType)
  requestType: RequestType; // nova, manutencao, adequacao

  @IsNumber()
  @Min(1)
  numProducts: number;

  @IsNumber()
  @Min(1)
  @Max(3)
  numShifts: number;

  @IsNumber()
  @Min(0)
  numSuppliers: number;

  @IsNumber()
  @Min(1)
  numEmployees: number;

  @IsNumber()
  @Min(0)
  distance: number; // km

  @IsBoolean()
  requiresAccommodation: boolean;
}

export class CreateProposalDto {
  @IsUUID()
  processId: string;

  @ValidateNested()
  @Type(() => CalculationInputDto)
  calculationInputs: CalculationInputDto;
}
```

#### `src/proposal/dto/adjust-proposal.dto.ts`
```typescript
export class AdjustProposalDto {
  @IsNumber()
  manualAdjustment: number; // Can be negative

  @IsString()
  @IsNotEmpty()
  adjustmentReason: string;
}
```

#### `src/proposal/dto/respond-proposal.dto.ts`
```typescript
export class RespondProposalDto {
  @IsBoolean()
  accepted: boolean;

  @IsString()
  @IsOptional()
  responseNotes?: string;
}
```

#### `src/proposal/dto/create-pricing-table.dto.ts`
```typescript
export class CreatePricingTableDto {
  @IsString()
  version: string;

  @IsDate()
  @Type(() => Date)
  effectiveFrom: Date;

  @ValidateNested()
  basePrices: BasePricesDto;

  @ValidateNested()
  productMultipliers: ProductMultipliersDto;

  // ... more multipliers ...

  @IsNumber()
  @Min(0)
  accommodationCost: number;

  @IsNumber()
  @Min(0)
  documentAnalysisFee: number;

  @IsNumber()
  @Min(0)
  committeeFee: number;

  @IsNumber()
  @Min(0)
  issuanceFee: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate: number;

  @IsEnum(Country)
  @IsOptional()
  country?: Country;

  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency;
}
```

#### `src/proposal/interfaces/calculation.interface.ts`
```typescript
export interface CalculationBreakdown {
  // Stage 1: Base × Multipliers
  basePrice: number;
  productMultiplier: number;
  shiftMultiplier: number;
  historyMultiplier: number;
  supplierMultiplier: number;
  subtotal1: number;

  // Stage 2: Man-Hours
  manHourHours: number;
  manHourRate: number;
  manHourTotal: number;

  // Stage 3: Travel & Accommodation
  travelCost: number;
  accommodationCost: number;

  // Stage 4: Fixed Fees
  documentAnalysisFee: number;
  committeeFee: number;
  issuanceFee: number;

  // Stage 5: Tax
  subtotalBeforeTax: number;
  taxRate: number;
  taxAmount: number;
  totalValue: number;
}
```

### Step 2: CalculatorService (~250 lines)

**File**: `src/proposal/calculator.service.ts`

**Methods**:
```typescript
@Injectable()
export class CalculatorService {
  /**
   * Main calculation pipeline (5 stages)
   */
  calculate(
    input: CalculationInputDto,
    pricingTable: PricingTable,
  ): CalculationBreakdown;

  /**
   * Stage 1: Base price × multipliers
   */
  private calculateStage1(
    input: CalculationInputDto,
    pricingTable: PricingTable,
  ): {
    basePrice: number;
    productMultiplier: number;
    shiftMultiplier: number;
    historyMultiplier: number;
    supplierMultiplier: number;
    subtotal1: number;
  };

  /**
   * Stage 2: Man-hour calculation
   */
  private calculateStage2(
    input: CalculationInputDto,
    pricingTable: PricingTable,
  ): {
    manHourHours: number;
    manHourRate: number;
    manHourTotal: number;
  };

  /**
   * Stage 3: Travel & accommodation
   */
  private calculateStage3(
    input: CalculationInputDto,
    pricingTable: PricingTable,
  ): {
    travelCost: number;
    accommodationCost: number;
  };

  /**
   * Stage 4: Fixed fees
   */
  private calculateStage4(
    pricingTable: PricingTable,
  ): {
    documentAnalysisFee: number;
    committeeFee: number;
    issuanceFee: number;
  };

  /**
   * Stage 5: Tax calculation
   */
  private calculateStage5(
    subtotalBeforeTax: number,
    pricingTable: PricingTable,
  ): {
    taxRate: number;
    taxAmount: number;
    totalValue: number;
  };

  /**
   * Helper: Get product multiplier by range
   */
  private getProductMultiplier(
    numProducts: number,
    multipliers: any,
  ): number;

  /**
   * Helper: Get supplier multiplier by range
   */
  private getSupplierMultiplier(
    numSuppliers: number,
    multipliers: any,
  ): number;

  /**
   * Helper: Get man-hour rate by employee count
   */
  private getManHourRate(
    numEmployees: number,
    rates: any,
  ): { hours: number; rate: number };

  /**
   * Helper: Get travel cost by distance
   */
  private getTravelCost(distance: number, costs: any): number;
}
```

### Step 3: PricingTableService (~300 lines)

**File**: `src/proposal/pricing-table.service.ts`

**Methods**:
```typescript
@Injectable()
export class PricingTableService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create new pricing table (auto-deactivates previous)
   */
  async create(dto: CreatePricingTableDto): Promise<PricingTable> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Deactivate all previous tables
      await tx.pricingTable.updateMany({
        where: { isActive: true },
        data: { isActive: false, effectiveTo: new Date() },
      });

      // 2. Create new table
      return tx.pricingTable.create({ data: dto });
    });
  }

  /**
   * Find active pricing table (optionally by country)
   */
  async findActive(country?: Country): Promise<PricingTable | null> {
    return this.prisma.pricingTable.findFirst({
      where: {
        isActive: true,
        ...(country && { country }),
      },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  /**
   * Find all pricing tables (with history)
   */
  async findAll(filters?: {
    country?: Country;
    isActive?: boolean;
  }): Promise<PricingTable[]>;

  /**
   * Find by ID
   */
  async findById(id: string): Promise<PricingTable>;

  /**
   * Update (creates new version)
   */
  async update(id: string, dto: UpdatePricingTableDto): Promise<PricingTable>;

  /**
   * Deactivate (soft delete)
   */
  async deactivate(id: string): Promise<PricingTable>;

  /**
   * Compare two pricing tables
   */
  async compare(id1: string, id2: string): Promise<ComparisonResult>;

  /**
   * Helper: Auto-increment version number
   */
  private incrementVersion(currentVersion: string): string {
    // "v1.0" → "v1.1"
  }
}
```

### Step 4: ProposalService (~600 lines)

**File**: `src/proposal/proposal.service.ts`

**Methods**:
```typescript
@Injectable()
export class ProposalService {
  constructor(
    private prisma: PrismaService,
    private calculator: CalculatorService,
    private pricingTableService: PricingTableService,
  ) {}

  /**
   * Calculate proposal (preview only, no save)
   */
  async calculate(dto: CalculationInputDto): Promise<CalculationBreakdown>;

  /**
   * Create new proposal for a process
   */
  async create(dto: CreateProposalDto, userId: string): Promise<Proposal> {
    // 1. Validate process exists and has no proposal
    // 2. Get active pricing table
    // 3. Calculate breakdown
    // 4. Create proposal with status: rascunho
  }

  /**
   * Find by ID
   */
  async findById(id: string, userId: string, userRole: string): Promise<Proposal>;

  /**
   * Find by process ID
   */
  async findByProcessId(processId: string): Promise<Proposal | null>;

  /**
   * Find all with filters
   */
  async findAll(filters?: {
    status?: ProposalStatus;
    processId?: string;
    companyId?: string;
  }): Promise<Proposal[]>;

  /**
   * Manually adjust proposal value
   */
  async adjust(
    id: string,
    dto: AdjustProposalDto,
    userId: string,
  ): Promise<Proposal> {
    // 1. Validate status (rascunho, calculada, recusada only)
    // 2. Check if adjustment > 20% (warning log)
    // 3. Update manualAdjustment, adjustmentReason, adjustedBy
    // 4. Recalculate finalValue
    // 5. Update status to calculada if was rascunho
  }

  /**
   * Recalculate with new inputs
   */
  async recalculate(
    id: string,
    dto: CalculationInputDto,
  ): Promise<Proposal> {
    // 1. Validate status (rascunho, calculada only)
    // 2. Get active pricing table
    // 3. Calculate new breakdown
    // 4. Reset manualAdjustment to 0
    // 5. Update status to calculada
  }

  /**
   * Send proposal to company
   */
  async send(id: string, userId: string): Promise<Proposal> {
    // 1. Validate status (rascunho, calculada only)
    // 2. Set status = enviada
    // 3. Set sentAt = now
    // 4. Set validUntil = now + 30 days
    // 5. TODO: Send email to company
    // 6. TODO: Update process phase to negociacao_proposta
  }

  /**
   * Company response (accept/reject)
   */
  async respond(
    id: string,
    dto: RespondProposalDto,
    userId: string,
    userRole: string,
  ): Promise<Proposal> {
    // 1. Validate status = enviada
    // 2. Check not expired
    // 3. Validate userRole = empresa or admin
    // 4. Update status (aceita or recusada)
    // 5. Set respondedAt, responseNotes
    // 6. If accepted:
    //    - Update process phase to elaboracao_contrato
    //    - TODO: Create contract
    //    - TODO: Notify analyst
    // 7. If rejected:
    //    - TODO: Notify analyst
  }

  /**
   * Check expired proposals (background job)
   */
  async checkExpired(): Promise<number> {
    const result = await this.prisma.proposal.updateMany({
      where: {
        status: ProposalStatus.enviada,
        validUntil: { lt: new Date() },
      },
      data: { status: ProposalStatus.expirada },
    });
    return result.count;
  }

  /**
   * Get proposal statistics
   */
  async getStats(): Promise<{
    byStatus: Record<ProposalStatus, number>;
    avgValue: number;
    avgResponseTime: number; // in days
    acceptanceRate: number; // percentage
  }>;

  /**
   * Get response history for audit trail
   */
  async getResponseHistory(id: string): Promise<any[]>;

  /**
   * Helper: Validate status for operation
   */
  private validateStatus(
    proposal: Proposal,
    allowedStatuses: ProposalStatus[],
    operation: string,
  ): void {
    if (!allowedStatuses.includes(proposal.status)) {
      throw new BadRequestException(
        `Cannot ${operation} proposal in status ${proposal.status}`,
      );
    }
  }

  /**
   * Helper: Check if adjustment requires approval
   */
  private checkAdjustmentThreshold(
    originalValue: number,
    adjustment: number,
  ): boolean {
    const percentageChange = Math.abs((adjustment / originalValue) * 100);
    const requiresApproval = percentageChange > 20;

    if (requiresApproval) {
      this.logger.warn(
        `⚠️ Adjustment of ${percentageChange.toFixed(2)}% requires coordinator approval`,
      );
    }

    return requiresApproval;
  }
}
```

### Step 5: ProposalController (~400 lines)

**File**: `src/proposal/proposal.controller.ts`

**Endpoints**:
```typescript
@ApiTags('proposals')
@Controller('proposals')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProposalController {
  constructor(
    private proposalService: ProposalService,
    private pricingTableService: PricingTableService,
  ) {}

  // ========== PROPOSAL OPERATIONS ==========

  @Post('calculate')
  @Roles(UserRole.admin, UserRole.comercial, UserRole.analista)
  @ApiOperation({ summary: 'Preview proposal calculation' })
  calculate(@Body() dto: CalculationInputDto);

  @Post()
  @Roles(UserRole.admin, UserRole.comercial, UserRole.analista)
  @ApiOperation({ summary: 'Create new proposal for process' })
  create(@Body() dto: CreateProposalDto, @Request() req);

  @Get()
  @Roles(UserRole.admin, UserRole.comercial, UserRole.analista, UserRole.empresa)
  @ApiOperation({ summary: 'List all proposals with filters' })
  findAll(@Query() query: any);

  @Get(':id')
  @Roles(UserRole.admin, UserRole.comercial, UserRole.analista, UserRole.empresa)
  @ApiOperation({ summary: 'Get proposal by ID' })
  findOne(@Param('id') id: string, @Request() req);

  @Get('process/:processId')
  @Roles(UserRole.admin, UserRole.comercial, UserRole.analista, UserRole.empresa)
  @ApiOperation({ summary: 'Get proposal by process ID' })
  findByProcess(@Param('processId') processId: string);

  @Put(':id/adjust')
  @Roles(UserRole.admin, UserRole.comercial)
  @ApiOperation({ summary: 'Manually adjust proposal value' })
  adjust(
    @Param('id') id: string,
    @Body() dto: AdjustProposalDto,
    @Request() req,
  );

  @Put(':id/recalculate')
  @Roles(UserRole.admin, UserRole.comercial)
  @ApiOperation({ summary: 'Recalculate proposal with new inputs' })
  recalculate(
    @Param('id') id: string,
    @Body() dto: CalculationInputDto,
  );

  @Post(':id/send')
  @Roles(UserRole.admin, UserRole.comercial)
  @ApiOperation({ summary: 'Send proposal to company' })
  send(@Param('id') id: string, @Request() req);

  @Put(':id/respond')
  @Roles(UserRole.admin, UserRole.empresa)
  @ApiOperation({ summary: 'Company accepts/rejects proposal' })
  respond(
    @Param('id') id: string,
    @Body() dto: RespondProposalDto,
    @Request() req,
  );

  @Get('stats')
  @Roles(UserRole.admin, UserRole.comercial)
  @ApiOperation({ summary: 'Get proposal statistics' })
  getStats();

  // ========== PRICING TABLE OPERATIONS ==========

  @Post('pricing-tables')
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Create new pricing table' })
  createPricingTable(@Body() dto: CreatePricingTableDto);

  @Get('pricing-tables')
  @Roles(UserRole.admin, UserRole.comercial, UserRole.analista)
  @ApiOperation({ summary: 'List all pricing tables' })
  findAllPricingTables(@Query() query: any);

  @Get('pricing-tables/active')
  @Roles(UserRole.admin, UserRole.comercial, UserRole.analista)
  @ApiOperation({ summary: 'Get active pricing table' })
  findActivePricingTable(@Query('country') country?: Country);

  @Get('pricing-tables/:id')
  @Roles(UserRole.admin, UserRole.comercial, UserRole.analista)
  @ApiOperation({ summary: 'Get pricing table by ID' })
  findOnePricingTable(@Param('id') id: string);

  @Put('pricing-tables/:id')
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Update pricing table (creates new version)' })
  updatePricingTable(
    @Param('id') id: string,
    @Body() dto: UpdatePricingTableDto,
  );

  @Delete('pricing-tables/:id')
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Deactivate pricing table' })
  deactivatePricingTable(@Param('id') id: string);

  @Get('pricing-tables/compare/:id1/:id2')
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Compare two pricing tables' })
  comparePricingTables(
    @Param('id1') id1: string,
    @Param('id2') id2: string,
  );
}
```

### Step 6: ProposalModule (~20 lines)

**File**: `src/proposal/proposal.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ProposalController } from './proposal.controller';
import { ProposalService } from './proposal.service';
import { CalculatorService } from './calculator.service';
import { PricingTableService } from './pricing-table.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ProcessModule } from '../process/process.module';

@Module({
  imports: [PrismaModule, ProcessModule],
  controllers: [ProposalController],
  providers: [ProposalService, CalculatorService, PricingTableService],
  exports: [ProposalService],
})
export class ProposalModule {}
```

### Step 7: Register in AppModule

**File**: `src/app.module.ts`

```typescript
import { ProposalModule } from './proposal/proposal.module';

@Module({
  imports: [
    // ... existing modules ...
    ProcessModule,
    ProposalModule, // Add this
    // ...
  ],
})
export class AppModule {}
```

---

## 🧪 Testing Strategy

### Unit Tests (~80 tests, ~2,000 lines)

#### CalculatorService Tests (~20 tests)
- Stage 1: Base price × multipliers
  - Product multiplier ranges (1-10, 11-50, 51-100, 100+)
  - Shift multipliers (1, 2, 3)
  - History multipliers (nova, manutencao, adequacao)
  - Supplier multipliers (1-5, 6-15, 16+)
  - Combined multiplier calculation
- Stage 2: Man-hour calculation
  - Employee count ranges (1-50, 51-150, 151-300, 300+)
  - Hours × rate calculation
- Stage 3: Travel & accommodation
  - Distance ranges (0-100, 100-300, 300-500, 500+)
  - Accommodation flag handling
- Stage 4: Fixed fees (simple passthrough)
- Stage 5: Tax calculation
  - Subtotal aggregation
  - Tax rate application
  - Final total

#### PricingTableService Tests (~15 tests)
- Create with auto-deactivation of previous tables
- Find active table (with/without country filter)
- Find by ID
- Find all with filters
- Update (version increment)
- Deactivate (soft delete)
- Compare two tables
- Version number auto-increment logic

#### ProposalService Tests (~40 tests)
- **create()**: Process validation, pricing table lookup, calculation, save
- **calculate()**: Preview calculation without save
- **findById()**: Retrieval with role-based access
- **findByProcessId()**: Unique process lookup
- **findAll()**: Filtering by status, processId, companyId
- **adjust()**: Status validation, threshold check, finalValue recalculation
- **recalculate()**: Status validation, new breakdown, adjustment reset
- **send()**: Status validation, validUntil setting, status transition
- **respond()**: Status validation, expiration check, role validation, acceptance/rejection logic
- **checkExpired()**: Bulk status update for expired proposals
- **getStats()**: Aggregate calculations
- Error cases: NotFound, BadRequest, Forbidden, Expired

#### ProposalController Tests (~25 tests)
- All endpoints with proper role guards
- DTO validation
- Request/response mapping
- Error handling (400, 403, 404)
- @Roles decorator verification

---

## 📦 File Structure

```
src/
├── proposal/
│   ├── dto/
│   │   ├── create-proposal.dto.ts
│   │   ├── adjust-proposal.dto.ts
│   │   ├── respond-proposal.dto.ts
│   │   ├── create-pricing-table.dto.ts
│   │   ├── update-pricing-table.dto.ts
│   │   └── calculation-input.dto.ts
│   ├── interfaces/
│   │   ├── calculation.interface.ts
│   │   ├── pricing-table.interface.ts
│   │   └── proposal-response.interface.ts
│   ├── calculator.service.ts
│   ├── pricing-table.service.ts
│   ├── proposal.service.ts
│   ├── proposal.controller.ts
│   └── proposal.module.ts
└── __tests__/
    └── phase1.5/
        ├── calculator.service.spec.ts
        ├── pricing-table.service.spec.ts
        ├── proposal.service.spec.ts
        └── proposal.controller.spec.ts
```

---

## ⚠️ Complexity & Challenges

### High Complexity Items

1. **Calculation Logic** (CalculatorService)
   - 5-stage pipeline with range-based lookups
   - JSON structure parsing (multipliers, rates, costs)
   - Decimal precision for money values
   - Edge cases: division by zero, negative values, rounding

2. **Status Workflow** (ProposalService)
   - 6 states with strict transition rules
   - Validity checks (expiration)
   - Role-based state access
   - Atomic operations (adjust + recalculate)

3. **Pricing Table Versioning** (PricingTableService)
   - Auto-deactivation on create
   - Version number increment logic
   - Snapshot preservation for audit trail
   - Comparison between versions

4. **Process Integration**
   - One-to-one constraint enforcement
   - Process phase advancement on accept
   - Bidirectional sync (Proposal ↔ Process)

### Medium Complexity Items

5. **Manual Adjustments**
   - Threshold detection (>20% warning)
   - Audit trail (adjustedBy, adjustmentReason)
   - finalValue recalculation

6. **Role-Based Access**
   - Different permissions per status
   - Company can only respond
   - Comercial can adjust/send
   - Admin has full access

### Low Complexity Items

7. **Statistics** - Simple aggregations
8. **Filters** - Standard Prisma queries

---

## 🚀 Implementation Order

1. **DTOs & Interfaces** (30 min)
2. **CalculatorService** (2 hours - complex logic)
3. **PricingTableService** (1.5 hours - versioning)
4. **ProposalService** (3 hours - workflow + integration)
5. **ProposalController** (1 hour - endpoints)
6. **ProposalModule** (15 min)
7. **Tests** (4 hours - 80 tests)
8. **Build & Validation** (30 min)

**Total Estimated Time**: ~12-14 hours of development

---

## ✅ Acceptance Criteria

- [ ] All DTOs created with proper validation
- [ ] CalculatorService implements 5-stage calculation correctly
- [ ] PricingTableService handles versioning and auto-deactivation
- [ ] ProposalService implements all CRUD + workflow methods
- [ ] ProposalController has all 17 endpoints with role guards
- [ ] ProposalModule properly configured with DI
- [ ] All 80+ tests passing
- [ ] Build passes without errors
- [ ] Integration with ProcessModule working
- [ ] Proper error handling (NotFound, BadRequest, Forbidden)
- [ ] Swagger documentation complete
- [ ] Code follows NestJS conventions

---

## 📝 Notes

### TODO Items for Future Phases
- Email notifications (EmailService integration)
- PDF generation (PDFService integration)
- Auto-contract creation (ContractModule integration)
- Background job for expiration checking (ScheduleModule)
- Notification system (NotificationModule)

### Known Limitations
- No email notifications in Phase 1.5
- No PDF generation yet
- Contract auto-creation deferred to Phase 1.6
- Expiration checking requires manual trigger (no cron job yet)

### Dependencies
- ProcessModule (must import)
- PrismaModule (database access)
- AuthModule (guards)

---

## 🎯 Success Metrics

- **Lines of Code**: ~1,720 (implementation) + ~2,000 (tests) = ~3,720 total
- **Test Coverage**: 80+ tests covering all services and controller
- **Pass Rate**: Target 90%+ on first run
- **Build Time**: <5 seconds
- **Token Usage**: ~180k tokens (~$0.54 USD)

---

**Ready for Implementation**: ✅
**Complexity Level**: HIGH
**Estimated Duration**: 1 session (~12-14 hours)
