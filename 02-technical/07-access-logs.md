# 07. Sistema de Logs de Acesso

> **Status**: Planejado
> **Data**: 2026-01-24
> **Prioridade**: Alta (Compliance ISO 17065 / LGPD)

## 1. Visão Geral

Sistema de registro de logs de acesso por usuário para rastrear quem acessou o quê, quando e de onde. Essencial para compliance ISO 17065 e LGPD.

### Requisitos
- Registrar login/logout de usuários
- Registrar navegação (páginas/recursos acessados)
- Registrar downloads, exports e ações críticas
- Capturar IP, user agent e tempo de resposta
- Dashboard administrativo para consulta
- Exportação para auditorias de compliance

## 2. Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                      NestJS Backend                              │
├─────────────────────────────────────────────────────────────────┤
│  Request → JwtGuard → AccessLogInterceptor → Controller → Response │
│                              │                                   │
│                              ▼                                   │
│                     AccessLogService                             │
│                     (buffer + flush)                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PostgreSQL                                   │
│  ┌─────────────────┐    ┌─────────────────┐                     │
│  │   access_logs   │    │   audit_trail   │                     │
│  │  (leitura/acesso)│   │ (mudanças CRUD) │                     │
│  └─────────────────┘    └─────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
```

### Separação de Responsabilidades

| Tabela | Propósito | Exemplos |
|--------|-----------|----------|
| `access_logs` | Registrar acessos/leitura | Login, visualizar processo, download certificado |
| `audit_trail` | Registrar mudanças em dados | Criar processo, aprovar certificado, editar contrato |

## 3. Modelo de Dados

### Tabela `access_logs`

```prisma
model AccessLog {
  id           String       @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  userId       String       @map("user_id") @db.Uuid
  sessionId    String?      @map("session_id")

  // Ação
  action       AccessAction

  // Recurso acessado
  resource     String       @db.VarChar(50)   // "process", "certificate", "document"
  resourceId   String?      @map("resource_id") @db.Uuid
  resourceName String?      @map("resource_name") @db.VarChar(255)

  // Contexto HTTP
  method       String       @db.VarChar(10)   // GET, POST, etc
  path         String       @db.VarChar(500)  // /api/processes/123
  statusCode   Int          @map("status_code")
  responseTime Int?         @map("response_time") // milissegundos

  // Metadados
  ipAddress    String       @map("ip_address") @db.VarChar(45)
  userAgent    String?      @map("user_agent") @db.Text

  createdAt    DateTime     @default(now()) @map("created_at")

  // Relacionamentos
  user         User         @relation(fields: [userId], references: [id])

  @@index([userId, createdAt(sort: Desc)])
  @@index([resource, resourceId])
  @@index([action])
  @@index([createdAt])
  @@map("access_logs")
}

enum AccessAction {
  // Autenticação
  login
  logout
  login_failed
  token_refresh

  // Navegação
  view
  list
  search

  // Ações de leitura
  download
  export
  print
}
```

### Índices

| Índice | Colunas | Propósito |
|--------|---------|-----------|
| `idx_access_logs_user_date` | `user_id, created_at DESC` | Histórico por usuário |
| `idx_access_logs_resource` | `resource, resource_id` | Quem acessou recurso X |
| `idx_access_logs_action` | `action` | Filtro por tipo de ação |
| `idx_access_logs_date` | `created_at` | Relatórios por período |

## 4. Implementação Backend

### Estrutura de Módulo

```
src/access-log/
├── access-log.module.ts
├── access-log.service.ts
├── access-log.controller.ts
├── access-log.interceptor.ts
├── decorators/
│   └── access-log.decorator.ts
└── dto/
    ├── access-log-filter.dto.ts
    └── access-log-export.dto.ts
```

### AccessLogService

```typescript
@Injectable()
export class AccessLogService {
  private buffer: AccessLogCreate[] = [];
  private readonly BUFFER_SIZE = 50;
  private readonly FLUSH_INTERVAL = 5000; // 5 segundos

  constructor(private prisma: PrismaService) {
    setInterval(() => this.flush(), this.FLUSH_INTERVAL);
  }

  async log(data: AccessLogCreate): Promise<void> {
    this.buffer.push(data);
    if (this.buffer.length >= this.BUFFER_SIZE) {
      await this.flush();
    }
  }

  private async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const logsToInsert = [...this.buffer];
    this.buffer = [];

    await this.prisma.accessLog.createMany({
      data: logsToInsert,
      skipDuplicates: true,
    });
  }
}
```

### AccessLogInterceptor

```typescript
@Injectable()
export class AccessLogInterceptor implements NestInterceptor {
  constructor(private accessLogService: AccessLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => this.logAccess(request, startTime, 200),
        error: (err) => this.logAccess(request, startTime, err.status || 500),
      }),
    );
  }

  private async logAccess(request: any, startTime: number, statusCode: number) {
    const user = request.user;
    if (!user) return;

    await this.accessLogService.log({
      userId: user.id,
      action: this.determineAction(request.method),
      resource: this.extractResource(request.path),
      resourceId: request.params?.id,
      method: request.method,
      path: request.path,
      statusCode,
      responseTime: Date.now() - startTime,
      ipAddress: request.ip || request.headers['x-forwarded-for'],
      userAgent: request.headers['user-agent'],
    });
  }
}
```

### Decorators

```typescript
// Customizar log para endpoint específico
@AccessLog({ resource: 'certificate', action: 'download' })

// Excluir endpoint do log (health checks, métricas internas)
@NoAccessLog()
```

## 5. API Endpoints

### Admin - Consulta de Logs

| Método | Rota | Descrição | Roles |
|--------|------|-----------|-------|
| GET | `/admin/access-logs` | Listar logs com filtros | admin, gestor |
| GET | `/admin/access-logs/user/:userId` | Logs por usuário | admin, gestor |
| GET | `/admin/access-logs/resource/:resource/:id` | Quem acessou recurso | admin, gestor |
| GET | `/admin/access-logs/stats` | Estatísticas de uso | admin |
| GET | `/admin/access-logs/export` | Exportar para compliance | admin |

### Filtros Disponíveis

```typescript
interface AccessLogFilterDto {
  userId?: string;
  action?: AccessAction;
  resource?: string;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  ipAddress?: string;
}
```

### Exemplo de Response

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "user-123",
      "userName": "João Silva",
      "action": "view",
      "resource": "process",
      "resourceId": "proc-456",
      "resourceName": "Certificação BRF Foods",
      "method": "GET",
      "path": "/api/processes/proc-456",
      "statusCode": 200,
      "responseTime": 45,
      "ipAddress": "189.40.123.45",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2026-01-24T14:30:00Z"
    }
  ],
  "pagination": {
    "total": 1520,
    "page": 1,
    "limit": 20
  }
}
```

## 6. Frontend - Dashboard

### Estrutura

```
src/app/admin/access-logs/
├── page.tsx              # Página principal
├── components/
│   ├── AccessLogTable.tsx
│   ├── AccessLogFilters.tsx
│   └── AccessLogStats.tsx
└── hooks/
    └── useAccessLogs.ts
```

### Funcionalidades

1. **Tabela de Logs**
   - Paginação server-side
   - Ordenação por data
   - Filtros por usuário, ação, recurso, período

2. **Estatísticas**
   - Usuários mais ativos
   - Recursos mais acessados
   - Horários de pico
   - Gráfico de acessos por dia

3. **Exportação**
   - JSON (compliance)
   - CSV (análise)
   - Filtros aplicados na exportação

## 7. Compliance

### ISO 17065
- Rastreabilidade completa de acessos a documentos de certificação
- Histórico de quem visualizou/baixou certificados
- Exportação para auditorias externas

### LGPD
- Registro de acesso a dados pessoais
- Capacidade de gerar relatório de acessos por titular
- Retenção configurável (padrão: 1 ano para logs de acesso)

### Política de Retenção

| Tipo de Log | Retenção | Justificativa |
|-------------|----------|---------------|
| access_logs | 1 ano | Compliance LGPD |
| audit_trail | 5 anos | Compliance ISO 17065 |

## 8. Considerações de Performance

### Volume Esperado
- ~100 usuários ativos/dia
- ~50 ações/usuário/dia
- ~5.000 registros/dia
- ~150.000 registros/mês

### Otimizações Implementadas
1. **Buffer de escrita**: Acumula 50 logs antes de INSERT (reduz I/O)
2. **Flush periódico**: A cada 5 segundos (garante dados não perdidos)
3. **Índices otimizados**: Para queries mais comuns
4. **Paginação obrigatória**: Máximo 100 registros por request

### Monitoramento
- Alertar se tabela > 10M registros
- Job de limpeza mensal para logs > 1 ano
