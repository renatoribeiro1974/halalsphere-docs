# Plano de Migração: Fastify → NestJS

**Projeto**: HalalSphere Backend
**Data**: 2026-01-12
**Versão Atual**: Fastify 5.2.0 + TypeScript
**Versão Alvo**: NestJS 10.x + TypeScript

---

## 📊 Análise do Estado Atual

### Arquitetura Atual (Fastify)

**Estatísticas Gerais:**
- **18 módulos** de domínio
- **111 endpoints** REST
- **19 tabelas** principais no banco (Prisma)
- **11 tipos** de roles de usuário
- **3 países** suportados (BR, CO, PY)
- **4 serviços externos** integrados (S3, AI, E-Signature, Email)

**Stack Tecnológico:**
```
Framework:    Fastify 5.2.0
ORM:          Prisma 6.1.0
Database:     PostgreSQL 16 + pgvector
Validation:   Zod 3.23.8
Auth:         @fastify/jwt
Files:        @fastify/multipart + AWS S3
Cache:        Redis 4.7.0
Email:        Nodemailer 7.0.10
PDF:          Puppeteer 24.32.1 + PDFKit
AI:           Anthropic Claude SDK
E-Signature:  ClickSign + D4Sign
```

**Módulos Existentes:**
1. `admin` - Gerenciamento de usuários admin
2. `auth` - Autenticação e registro
3. `process` - Processo de certificação (core)
4. `proposal` - Propostas comerciais e precificação
5. `contract` - Contratos e assinatura eletrônica
6. `audit-schedule` - Agendamento de auditorias
7. `audit-execution` - Execução de auditorias
8. `document-request` - Solicitações de documentos
9. `comment` - Sistema de comentários
10. `manager` - Dashboard de gestores
11. `comercial` - Departamento comercial
12. `juridico` - Departamento jurídico
13. `industrial-classification` - Classificação GSO 2055-2
14. `auditor-allocation` - Alocação de auditores
15. `users` - Gerenciamento de usuários
16. `ai` - Serviços de IA
17. `certificate` - Geração de certificados
18. `storage-config` - Configuração de storage

---

## 🎯 Objetivos da Migração

### Benefícios Esperados

#### 1. **Arquitetura e Organização**
- ✅ Dependency Injection nativa (vs. singletons manuais)
- ✅ Decorators para rotas, guards, interceptors
- ✅ Módulos auto-contidos com imports/exports claros
- ✅ CLI para scaffolding consistente

#### 2. **Developer Experience**
- ✅ Convenções estabelecidas (vs. padrões custom)
- ✅ Documentação automática com Swagger decorators
- ✅ Testing tools nativos (@nestjs/testing)
- ✅ Hot reload com HMR

#### 3. **Ecosystem**
- ✅ Integrações oficiais (Prisma, Redis, WebSocket, GraphQL)
- ✅ Microservices patterns prontos
- ✅ Queue management (@nestjs/bull)
- ✅ CQRS/Event Sourcing suporte

#### 4. **Performance**
- ⚠️ Fastify é ~20% mais rápido que Express
- ✅ NestJS permite usar Fastify como adapter (`@nestjs/platform-fastify`)
- ✅ Mantém performance + ganha features NestJS

#### 5. **Manutenibilidade**
- ✅ Padrões consistentes across time
- ✅ Onboarding mais fácil (NestJS é padrão mercado)
- ✅ Type safety melhorado com decorators

---

## 📋 Estratégia de Migração

### Abordagem Recomendada: **Gradual (Strangler Pattern)**

```
┌─────────────────────────────────────────────────┐
│  Fase 1: Setup Paralelo                        │
│  - Criar projeto NestJS paralelo               │
│  - Configurar infraestrutura base              │
│  - Migrar 1 módulo simples (health check)      │
│  - Testar deploy conjunto                      │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│  Fase 2: Migração por Módulo                   │
│  - Migrar 2-3 módulos por sprint               │
│  - Roteamento híbrido (proxy interno)          │
│  - Tests paralelos                             │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│  Fase 3: Cutover Final                         │
│  - Descomissionar Fastify                      │
│  - Consolidar infraestrutura                   │
│  - Cleanup código legado                       │
└─────────────────────────────────────────────────┘
```

**Duração Estimada**: 8-12 semanas (dependendo da equipe)

---

## 🗓️ Fases Detalhadas

### **FASE 0: Preparação (1 semana)**

#### Objetivos
- Congelar features no Fastify
- Documentar comportamento atual
- Setup ambiente NestJS
- Definir equipe

#### Atividades

**0.1. Auditoria e Documentação**
- [ ] Documentar todos os 111 endpoints (request/response)
- [ ] Mapear dependências entre módulos
- [ ] Listar todas as variáveis de ambiente
- [ ] Documentar regras de negócio críticas
- [ ] Criar testes de regressão E2E (Postman/Newman)

**0.2. Setup Inicial NestJS**
```bash
# Criar projeto NestJS com Fastify adapter
npm i -g @nestjs/cli
nest new halalsphere-nest --package-manager npm
cd halalsphere-nest

# Instalar Fastify adapter
npm install @nestjs/platform-fastify
npm install --save-dev @types/node

# Instalar dependências principais
npm install @nestjs/config @nestjs/jwt @nestjs/passport passport-jwt
npm install @nestjs/swagger swagger-ui-express
npm install @prisma/client prisma
npm install zod class-validator class-transformer
npm install bcrypt @types/bcrypt
```

**0.3. Configuração Base**
```typescript
// main.ts - Usando Fastify adapter
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true })
  );

  await app.listen(3334, '0.0.0.0'); // Porta diferente inicialmente
}
bootstrap();
```

**0.4. Migrar Prisma Schema**
- [ ] Copiar `schema.prisma` para projeto NestJS
- [ ] Configurar `@nestjs/prisma` ou criar `PrismaModule` customizado
- [ ] Testar conexão com banco de desenvolvimento

**0.5. Definir Branch Strategy**
```
main (Fastify - produção atual)
  ├── develop (Fastify - desenvolvimento atual)
  └── feature/nestjs-migration
       ├── phase-1-foundation
       ├── phase-2-auth-module
       ├── phase-3-process-module
       └── ...
```

---

### **FASE 1: Foundation (2 semanas)**

#### Objetivos
- Estrutura base NestJS funcionando
- Autenticação JWT migrada
- Health checks funcionando
- CI/CD ajustado

#### Deliverables

**1.1. Core Modules**

```
src/
├── app.module.ts                 # Root module
├── main.ts                       # Bootstrap
├── config/
│   ├── config.module.ts         # @nestjs/config
│   ├── database.config.ts
│   ├── jwt.config.ts
│   └── aws.config.ts
├── common/
│   ├── guards/
│   │   ├── jwt-auth.guard.ts    # Replace authMiddleware
│   │   └── roles.guard.ts       # Replace roleMiddleware
│   ├── decorators/
│   │   ├── roles.decorator.ts   # @Roles('admin', 'analista')
│   │   ├── user.decorator.ts    # @CurrentUser()
│   │   └── public.decorator.ts  # @Public() - skip auth
│   ├── interceptors/
│   │   ├── logging.interceptor.ts
│   │   └── transform.interceptor.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── pipes/
│   │   └── zod-validation.pipe.ts
│   └── types/
│       ├── user.types.ts
│       └── response.types.ts
├── database/
│   ├── database.module.ts
│   └── prisma.service.ts        # Wrap PrismaClient
└── modules/
    └── health/
        ├── health.module.ts
        ├── health.controller.ts
        └── health.service.ts
```

**1.2. Prisma Service (NestJS-style)**

```typescript
// database/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

// database/database.module.ts
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Available globally
})
export class DatabaseModule {}
```

**1.3. Auth Guards**

```typescript
// common/guards/jwt-auth.guard.ts
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}

// common/guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return requiredRoles.includes(user.role);
  }
}
```

**1.4. Decorators**

```typescript
// common/decorators/roles.decorator.ts
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);

// common/decorators/user.decorator.ts
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// common/decorators/public.decorator.ts
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

**1.5. Global Setup (app.module.ts)**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    HealthModule,
    // ... outros módulos
  ],
  providers: [
    // Global guards
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },

    // Global interceptors
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },

    // Global filters
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
```

**1.6. Health Check Module**

```typescript
// modules/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Public()
  @Get()
  async check() {
    return this.healthService.check();
  }
}

// modules/health/health.service.ts
@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async check() {
    const dbStatus = await this.checkDatabase();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus,
    };
  }

  private async checkDatabase() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'healthy';
    } catch (error) {
      return 'unhealthy';
    }
  }
}
```

#### Checklist Fase 1

- [ ] NestJS projeto criado com Fastify adapter
- [ ] Prisma configurado e conectando ao banco
- [ ] Guards (JWT + Roles) implementados
- [ ] Decorators customizados criados
- [ ] Health check endpoint funcionando
- [ ] Logs estruturados configurados
- [ ] Exception filters globais
- [ ] Swagger básico configurado
- [ ] Testes unitários do core
- [ ] CI/CD pipeline criado para NestJS

---

### **FASE 2: Módulo Auth (1 semana)**

#### Objetivos
- Migrar completamente autenticação
- Login, registro, verificação email
- JWT generation/validation
- Password reset

#### Estrutura

```
modules/auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── strategies/
│   └── jwt.strategy.ts
├── dto/
│   ├── login.dto.ts
│   ├── register.dto.ts
│   └── verify-email.dto.ts
└── guards/
    └── local-auth.guard.ts
```

#### Endpoints a Migrar (8)

```typescript
@Controller('api/auth')
@ApiTags('Authentication')
export class AuthController {
  @Public()
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  login(@Body() dto: LoginDto) { }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register new company' })
  register(@Body() dto: RegisterDto) { }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser() user: User) { }

  @Public()
  @Get('verify-email')
  verifyEmail(@Query('token') token: string) { }

  @Public()
  @Post('resend-verification')
  resendVerification(@Body('email') email: string) { }

  @Public()
  @Post('forgot-password')
  forgotPassword(@Body('email') email: string) { }

  @Public()
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) { }

  @Post('change-password')
  changePassword(@CurrentUser() user: User, @Body() dto: ChangePasswordDto) { }
}
```

#### Implementação JWT Strategy

```typescript
// strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: { id: string; email: string; role: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyId: true,
        company: {
          select: {
            id: true,
            tradeName: true,
          },
        },
      },
    });

    return user; // Injected into request.user
  }
}
```

#### DTOs com Zod

```typescript
// dto/login.dto.ts
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export type LoginDto = z.infer<typeof LoginSchema>;

// Usar com pipe
@Post('login')
async login(@Body(new ZodValidationPipe(LoginSchema)) dto: LoginDto) {
  return this.authService.login(dto);
}
```

#### Checklist Fase 2

- [ ] AuthModule completo
- [ ] JwtStrategy implementada
- [ ] 8 endpoints migratos e testados
- [ ] DTOs com validação Zod
- [ ] Testes E2E do auth flow
- [ ] Swagger documentado
- [ ] Email service integrado
- [ ] Password hashing funcionando
- [ ] Token refresh (se necessário)

---

### **FASE 3-10: Migração de Módulos (6 semanas)**

#### Ordem de Migração Recomendada

**Critérios de priorização:**
1. Dependências (módulos independentes primeiro)
2. Complexidade (simples → complexos)
3. Criticidade (features menos usadas primeiro)

**Ordem sugerida:**

| Ordem | Módulo | Endpoints | Complexidade | Dependências | Duração |
|-------|--------|-----------|--------------|--------------|---------|
| 1 | `industrial-classification` | 4 | Baixa | Nenhuma | 2 dias |
| 2 | `comment` | 6 | Baixa | Process | 3 dias |
| 3 | `document-request` | 7 | Média | Process | 4 dias |
| 4 | `users` / `admin` | 6 | Média | Auth | 3 dias |
| 5 | `process` | 7 | Alta | Várias | 5 dias |
| 6 | `proposal` | 16 | Alta | Process, Pricing | 5 dias |
| 7 | `contract` | 10 | Alta | Process, E-Signature | 5 dias |
| 8 | `audit-schedule` | 8 | Média | Process | 4 dias |
| 9 | `audit-execution` | 12 | Alta | Audit-Schedule | 5 dias |
| 10 | `manager` | 10 | Média | Process, Analytics | 4 dias |
| 11 | `comercial` | 4 | Baixa | Proposal | 2 dias |
| 12 | `juridico` | 4 | Baixa | Contract | 2 dias |
| 13 | `certificate` | 2 | Média | Process | 3 dias |
| 14 | `storage-config` | 2 | Baixa | Storage | 2 dias |
| 15 | `e-signature-config` | 2 | Baixa | E-Signature | 2 dias |

**Total**: ~50 dias úteis (~10 semanas com 2-3 devs)

#### Template de Migração por Módulo

Para cada módulo, seguir:

**1. Criar estrutura NestJS**
```
modules/[module-name]/
├── [module-name].module.ts
├── [module-name].controller.ts
├── [module-name].service.ts
├── dto/
│   ├── create-[entity].dto.ts
│   └── update-[entity].dto.ts
├── entities/
│   └── [entity].entity.ts      # Para Swagger docs
└── [module-name].types.ts
```

**2. Migrar Service (Business Logic)**
```typescript
@Injectable()
export class ProcessService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private emailService: EmailService,
  ) {}

  async createProcess(dto: CreateProcessDto, userId: string) {
    // Lógica de negócio mantém igual
    // Apenas adaptar injeção de dependências
  }
}
```

**3. Migrar Controller**
```typescript
@Controller('api/processes')
@ApiTags('Processes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProcessController {
  constructor(private processService: ProcessService) {}

  @Post()
  @Roles(UserRole.empresa)
  @ApiOperation({ summary: 'Create new certification process' })
  @ApiResponse({ status: 201, description: 'Process created' })
  create(
    @Body() dto: CreateProcessDto,
    @CurrentUser() user: User,
  ) {
    return this.processService.createProcess(dto, user.id);
  }

  @Get()
  @Roles(UserRole.analista, UserRole.gestor, UserRole.admin)
  findAll(@CurrentUser() user: User, @Query() filters: ProcessFiltersDto) {
    return this.processService.findAll(user, filters);
  }
}
```

**4. Testes**
```typescript
describe('ProcessService', () => {
  let service: ProcessService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProcessService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get(ProcessService);
    prisma = module.get(PrismaService);
  });

  it('should create process', async () => {
    // Test implementation
  });
});
```

**5. Documentação Swagger**
```typescript
// entities/process.entity.ts
export class ProcessEntity {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ProcessStatus })
  status: ProcessStatus;

  @ApiProperty()
  companyId: string;

  @ApiProperty({ type: CompanyEntity })
  company: CompanyEntity;
}
```

---

### **FASE 11: Serviços Compartilhados (1 semana)**

#### Objetivos
- Migrar services auxiliares
- Storage, Email, PDF, AI
- Mantém strategy pattern

#### Estrutura

```
src/shared/
├── services/
│   ├── email/
│   │   ├── email.module.ts
│   │   ├── email.service.ts
│   │   └── templates/
│   ├── storage/
│   │   ├── storage.module.ts
│   │   ├── storage.service.ts
│   │   ├── providers/
│   │   │   ├── storage-provider.interface.ts
│   │   │   ├── s3-storage.provider.ts
│   │   │   └── local-storage.provider.ts
│   │   └── storage.config.ts
│   ├── e-signature/
│   │   ├── e-signature.module.ts
│   │   ├── e-signature.service.ts
│   │   ├── providers/
│   │   │   ├── base.provider.ts
│   │   │   ├── clicksign.provider.ts
│   │   │   └── d4sign.provider.ts
│   │   └── e-signature.config.ts
│   ├── pdf/
│   │   ├── pdf.module.ts
│   │   ├── pdf.service.ts
│   │   └── pdf-generator.service.ts
│   ├── ai/
│   │   ├── ai.module.ts
│   │   └── anthropic.service.ts
│   └── audit/
│       ├── audit.module.ts
│       ├── audit.service.ts
│       └── audit-logger.ts
└── utils/
    ├── tax-validation.util.ts
    └── encryption.util.ts
```

#### Exemplo: Storage Module

```typescript
// storage/storage.module.ts
@Module({
  providers: [
    StorageService,
    {
      provide: 'STORAGE_PROVIDER',
      useFactory: (config: ConfigService) => {
        const provider = config.get('STORAGE_PROVIDER', 'local');

        if (provider === 's3') {
          return new S3StorageProvider(config);
        }

        return new LocalStorageProvider(config);
      },
      inject: [ConfigService],
    },
  ],
  exports: [StorageService],
})
export class StorageModule {}

// storage/storage.service.ts
@Injectable()
export class StorageService {
  constructor(
    @Inject('STORAGE_PROVIDER')
    private provider: StorageProviderInterface,
  ) {}

  async uploadFile(file: Express.Multer.File, options: UploadOptions) {
    return this.provider.uploadFile(file, options);
  }

  async deleteFile(path: string) {
    return this.provider.deleteFile(path);
  }

  async getFileStream(path: string) {
    return this.provider.getFileStream(path);
  }
}
```

#### Checklist Fase 11

- [ ] EmailModule com Nodemailer
- [ ] StorageModule com S3 + Local providers
- [ ] E-SignatureModule com ClickSign + D4Sign
- [ ] PDFModule com Puppeteer
- [ ] AIModule com Anthropic
- [ ] AuditModule para audit trails
- [ ] Testes unitários de todos os services
- [ ] Configuração injetável via ConfigService

---

### **FASE 12: WebSocket & Real-time (3 dias)**

#### Objetivos
- Implementar WebSocket gateway
- Notificações em tempo real
- Dashboard live updates

#### Implementação

```bash
npm install @nestjs/websockets @nestjs/platform-socket.io
npm install socket.io
```

```typescript
// modules/notifications/notifications.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string>(); // userId -> socketId

  handleConnection(client: Socket) {
    const userId = this.extractUserIdFromToken(client);
    if (userId) {
      this.userSockets.set(userId, client.id);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = Array.from(this.userSockets.entries())
      .find(([_, socketId]) => socketId === client.id)?.[0];

    if (userId) {
      this.userSockets.delete(userId);
    }
  }

  // Enviar notificação para usuário específico
  sendToUser(userId: string, event: string, data: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }

  // Broadcast para role específico
  sendToRole(role: UserRole, event: string, data: any) {
    this.server.emit(`${role}:${event}`, data);
  }
}

// Usage in ProcessService
@Injectable()
export class ProcessService {
  constructor(
    private notificationsGateway: NotificationsGateway,
  ) {}

  async updateProcessStatus(processId: string, newStatus: ProcessStatus) {
    const process = await this.prisma.process.update({
      where: { id: processId },
      data: { status: newStatus },
      include: { company: { select: { users: true } } },
    });

    // Notificar empresa em tempo real
    process.company.users.forEach(user => {
      this.notificationsGateway.sendToUser(user.id, 'process:status-changed', {
        processId,
        newStatus,
        message: `Status alterado para ${newStatus}`,
      });
    });

    return process;
  }
}
```

---

### **FASE 13: Testing & Quality (1 semana)**

#### Objetivos
- Cobertura de testes > 80%
- Testes E2E completos
- Performance testing

#### Setup

```bash
npm install --save-dev @nestjs/testing
npm install --save-dev supertest @types/supertest
npm install --save-dev jest
```

#### Estrutura de Testes

```
src/
├── modules/
│   └── auth/
│       ├── auth.service.spec.ts       # Unit tests
│       ├── auth.controller.spec.ts    # Unit tests
│       └── auth.e2e-spec.ts          # E2E tests
└── test/
    ├── app.e2e-spec.ts
    ├── fixtures/
    │   └── test-data.ts
    └── helpers/
        └── test-utils.ts
```

#### Exemplo E2E Test

```typescript
// auth/auth.e2e-spec.ts
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('token');
          expect(res.body.user).toHaveProperty('email', 'test@example.com');
        });
    });

    it('should return 401 for invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });
});
```

#### Checklist Fase 13

- [ ] Testes unitários para todos os services
- [ ] Testes de integração para controllers
- [ ] Testes E2E dos principais fluxos
- [ ] Mocks configurados para serviços externos
- [ ] Coverage report > 80%
- [ ] Performance tests (load testing com k6 ou Artillery)

---

### **FASE 14: Deploy Paralelo & Cutover (1 semana)**

#### Objetivos
- Deploy NestJS em produção (porta paralela)
- Testes em produção
- Cutover gradual
- Rollback plan

#### Estratégia de Cutover

**Opção A: Blue-Green Deployment**
```
┌─────────────┐       ┌─────────────┐
│   Fastify   │       │   NestJS    │
│  (Blue)     │       │  (Green)    │
│  Port 3333  │       │  Port 3334  │
└──────┬──────┘       └──────┬──────┘
       │                     │
       └──────────┬──────────┘
                  │
            ┌─────▼─────┐
            │    ALB    │
            │  (Switch) │
            └───────────┘
```

1. Deploy NestJS na porta 3334
2. ALB roteia 10% tráfego → NestJS (canary)
3. Monitorar erros/latência
4. Gradualmente aumentar: 25% → 50% → 100%
5. Desligar Fastify após 24h estável

**Opção B: Strangler Pattern por Rota**
```typescript
// Nginx/ALB config
location /api/auth {
  proxy_pass http://nestjs:3334;  # Já migrado
}

location /api/processes {
  proxy_pass http://fastify:3333; # Ainda não migrado
}
```

#### Rollback Plan

```bash
# Se houver problemas críticos
# 1. ALB: Rotear 100% tráfego de volta para Fastify
aws elbv2 modify-listener --listener-arn xxx --default-actions TargetGroupArn=fastify-tg

# 2. Escalar Fastify de volta
aws ecs update-service --service fastify --desired-count 3

# 3. Investigar logs NestJS
kubectl logs -f deployment/nestjs --tail=1000

# 4. Fix & re-deploy
git revert <commit>
npm run build && npm run deploy
```

#### Monitoring durante Cutover

```typescript
// Adicionar métricas customizadas
@Injectable()
export class MetricsService {
  private errorCount = 0;
  private requestCount = 0;

  incrementError() {
    this.errorCount++;

    // CloudWatch Metric
    cloudwatch.putMetricData({
      MetricData: [{
        MetricName: 'NestJSErrors',
        Value: 1,
        Unit: 'Count',
      }],
    });
  }

  async getHealthMetrics() {
    return {
      errorRate: this.errorCount / this.requestCount,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }
}
```

#### Checklist Fase 14

- [ ] NestJS deployado em produção (paralelo)
- [ ] ALB configurado para canary deployment
- [ ] Logs centralizados (CloudWatch)
- [ ] Métricas de erro monitoradas
- [ ] Alertas configurados (SNS/Slack)
- [ ] Rollback testado
- [ ] Documentação de cutover criada
- [ ] Equipe treinada no rollback

---

## 🔧 Ferramentas e Configurações

### CLI Commands

```bash
# Gerar módulo completo
nest g module modules/process
nest g controller modules/process
nest g service modules/process

# Gerar resource (tudo de uma vez)
nest g resource modules/audit-execution --no-spec

# Gerar guard
nest g guard common/guards/jwt-auth

# Gerar interceptor
nest g interceptor common/interceptors/logging

# Gerar pipe
nest g pipe common/pipes/zod-validation
```

### package.json Scripts

```json
{
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  }
}
```

### ESLint + Prettier

```json
// .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
```

---

## 📊 Métricas de Sucesso

### KPIs da Migração

| Métrica | Baseline Fastify | Target NestJS |
|---------|------------------|---------------|
| **Performance** | | |
| P95 Latency | 200ms | < 250ms (+25% ok) |
| Throughput | 1000 req/s | > 950 req/s |
| Memory Usage | 150MB | < 200MB |
| **Quality** | | |
| Test Coverage | ~40% | > 80% |
| Bugs em Prod | - | 0 críticos/mês |
| **Developer** | | |
| Build Time | 30s | < 45s |
| Hot Reload | ~2s | < 3s |
| Onboarding Time | 2 semanas | 1 semana |

---

## ⚠️ Riscos e Mitigações

### Riscos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Performance degradation** | Média | Alto | Use Fastify adapter; performance testing contínuo |
| **Breaking changes em APIs** | Baixa | Crítico | Contract testing; não mudar payloads |
| **Bugs em produção** | Média | Alto | Canary deployment; rollback rápido |
| **Atraso no cronograma** | Alta | Médio | Buffer de 2 semanas; priorizar módulos críticos |
| **Resistance da equipe** | Baixa | Médio | Training sessions; pair programming |
| **Perda de conhecimento** | Baixa | Alto | Documentação detalhada; code review rigoroso |

---

## 📚 Recursos e Treinamento

### Documentação NestJS

- [Official Docs](https://docs.nestjs.com/)
- [Fastify Adapter Guide](https://docs.nestjs.com/techniques/performance)
- [Prisma Integration](https://docs.nestjs.com/recipes/prisma)
- [Testing Guide](https://docs.nestjs.com/fundamentals/testing)

### Treinamento Recomendado

1. **NestJS Fundamentals** (16h)
   - Modules, Controllers, Services
   - Dependency Injection
   - Guards, Interceptors, Pipes
   - Testing

2. **Advanced Patterns** (8h)
   - Custom Decorators
   - Dynamic Modules
   - Microservices
   - WebSockets

3. **Migration Workshop** (4h)
   - Hands-on migração de 1 módulo
   - Code review coletivo
   - Q&A session

---

## 📝 Checklist Final

### Pré-Migration
- [ ] Congelar features no Fastify
- [ ] Documentar todos os 111 endpoints
- [ ] Criar testes de regressão E2E
- [ ] Definir equipe de migração
- [ ] Setup ambiente NestJS

### Durante Migração
- [ ] Migrar módulo por módulo (ordem definida)
- [ ] Manter 100% paridade de features
- [ ] Escrever testes para cada módulo
- [ ] Code review de cada PR
- [ ] Update documentação Swagger

### Pós-Migration
- [ ] Deploy paralelo em staging
- [ ] Performance testing
- [ ] Canary deployment em produção
- [ ] Monitorar erros por 7 dias
- [ ] Cutover final
- [ ] Descomissionar Fastify
- [ ] Atualizar documentação
- [ ] Retrospectiva da equipe

---

## 🎯 Conclusão

A migração de Fastify para NestJS trará:
- ✅ Melhor organização e padrões
- ✅ Type safety melhorado
- ✅ Ecosystem mais rico
- ✅ Onboarding mais fácil
- ✅ Testabilidade superior

**Duração total estimada**: 8-12 semanas
**Equipe recomendada**: 2-3 desenvolvedores
**Budget**: ~400-600 horas de desenvolvimento

**Status**: Pronto para iniciar após aprovação

---

**Próximos Passos Imediatos:**
1. Aprovar plano com stakeholders
2. Alocar equipe
3. Criar branch `feature/nestjs-migration`
4. Iniciar Fase 0 (Preparação)
