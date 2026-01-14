# Sprint 1 - Testing Guide

Guia completo para testar todas as implementações da Sprint 1 (Containerização).

## 📋 Checklist de Testes

### 1. Build do Docker Backend

#### 1.1 Build Local
```bash
cd backend
docker build -t halalsphere-backend:test .
```

**Verificações:**
- [ ] Build completa sem erros
- [ ] Todas as 3 stages executam corretamente
- [ ] Prisma Client é gerado
- [ ] TypeScript compila sem erros

#### 1.2 Verificar Tamanho da Imagem
```bash
docker images halalsphere-backend:test
```

**Critério de sucesso:** Imagem deve ter **menos de 300MB**

**Comandos para análise detalhada:**
```bash
# Ver camadas da imagem
docker history halalsphere-backend:test

# Inspecionar imagem
docker inspect halalsphere-backend:test
```

### 2. Security Scan

#### 2.1 Instalar Trivy (se necessário)

**Windows (PowerShell):**
```powershell
# Via Chocolatey
choco install trivy

# Ou via Scoop
scoop install trivy
```

**Linux/macOS:**
```bash
# Linux
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install trivy

# macOS
brew install trivy
```

#### 2.2 Executar Scan
```bash
trivy image halalsphere-backend:test
```

**Verificações:**
- [ ] Sem vulnerabilidades CRITICAL
- [ ] Máximo 5 vulnerabilidades HIGH aceitáveis
- [ ] Revisar vulnerabilidades MEDIUM

#### 2.3 Scan Detalhado (opcional)
```bash
# Gerar relatório JSON
trivy image --format json --output trivy-report.json halalsphere-backend:test

# Scan apenas de dependências
trivy image --scanners vuln halalsphere-backend:test

# Scan de configuração
trivy image --scanners config halalsphere-backend:test
```

### 3. Docker Compose Production Test

#### 3.1 Iniciar Stack Completo
```bash
# No diretório raiz do projeto
docker-compose -f docker-compose.prod-test.yml up -d
```

**Verificações:**
- [ ] Todos os 3 serviços iniciam (backend, postgres, redis)
- [ ] Health checks passam para todos os serviços
- [ ] Nenhum erro nos logs

#### 3.2 Verificar Health Checks
```bash
# Status dos containers
docker-compose -f docker-compose.prod-test.yml ps

# Todos devem mostrar "healthy" na coluna Status após ~40 segundos
```

#### 3.3 Testar Endpoints de Health

**Liveness Probe:**
```bash
curl http://localhost:3333/health/live
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-12T...",
  "uptime": 123.456
}
```

**Readiness Probe:**
```bash
curl http://localhost:3333/health/ready
```

**Resposta esperada:**
```json
{
  "status": "ready",
  "checks": {
    "database": "healthy"
  }
}
```

#### 3.4 Verificar Logs
```bash
# Logs do backend
docker-compose -f docker-compose.prod-test.yml logs backend

# Verificar:
# - "Storage initialized with..." message
# - "Server listening on port 3333"
# - Nenhum erro de conexão com DB/Redis
```

#### 3.5 Testar Graceful Shutdown
```bash
# Em um terminal, monitorar logs
docker-compose -f docker-compose.prod-test.yml logs -f backend

# Em outro terminal, enviar SIGTERM
docker-compose -f docker-compose.prod-test.yml stop backend

# Verificar nos logs:
# - "Received SIGTERM, starting graceful shutdown..."
# - "Graceful shutdown completed"
# - Container para em menos de 30 segundos
```

#### 3.6 Testar Auto-Migrate
```bash
# Parar stack
docker-compose -f docker-compose.prod-test.yml down

# Limpar volumes (CUIDADO: apaga dados)
docker-compose -f docker-compose.prod-test.yml down -v

# Iniciar novamente
docker-compose -f docker-compose.prod-test.yml up -d

# Verificar logs - deve mostrar:
docker-compose -f docker-compose.prod-test.yml logs backend | grep -i migrate

# Esperado: "Running Prisma migrations..."
```

### 4. Teste de Funcionalidades

#### 4.1 Testar API Básica
```bash
# Criar usuário admin (exemplo)
curl -X POST http://localhost:3333/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Test123!",
    "name": "Test Admin"
  }'

# Login
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Test123!"
  }'
```

#### 4.2 Testar Trust Proxy
```bash
# Fazer request com X-Forwarded-For header
curl -X GET http://localhost:3333/health/live \
  -H "X-Forwarded-For: 203.0.113.195"

# Backend deve logar o IP correto (203.0.113.195) e não 127.0.0.1
docker-compose -f docker-compose.prod-test.yml logs backend | grep "203.0.113.195"
```

### 5. Teste de Storage (S3 - Opcional)

#### 5.1 Configurar LocalStack para Testes S3 Locais

**Adicionar ao docker-compose.prod-test.yml:**
```yaml
  localstack:
    image: localstack/localstack:latest
    container_name: halalsphere-localstack
    ports:
      - "4566:4566"
    environment:
      - SERVICES=s3
      - DEFAULT_REGION=us-east-1
      - AWS_DEFAULT_REGION=us-east-1
    volumes:
      - localstack_data:/var/lib/localstack
    networks:
      - halalsphere-network
```

**Habilitar S3 no backend:**
```yaml
backend:
  environment:
    NODE_ENV: production
    AWS_REGION: us-east-1
    AWS_ACCESS_KEY_ID: test
    AWS_SECRET_ACCESS_KEY: test
    AWS_S3_ENDPOINT: http://localstack:4566
```

#### 5.2 Testar Upload para S3
```bash
# Criar bucket no LocalStack
aws --endpoint-url=http://localhost:4566 s3 mb s3://halalsphere-test

# Fazer upload via API
curl -X POST http://localhost:3333/api/documents/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test-file.pdf"

# Verificar se arquivo está no S3
aws --endpoint-url=http://localhost:4566 s3 ls s3://halalsphere-test
```

### 6. Frontend Build & Deploy Test

#### 6.1 Build Frontend Staging
```bash
cd frontend
npm run build:staging
```

**Verificações:**
- [ ] Build completa sem erros TypeScript
- [ ] Pasta `dist/` criada
- [ ] Arquivos JS/CSS tem hash no nome
- [ ] Console.logs removidos (verificar no código minificado)

#### 6.2 Verificar Code Splitting
```bash
# Listar arquivos gerados
ls -lh dist/assets/

# Verificar se existem chunks separados:
# - react-vendor-*.js
# - ui-vendor-*.js
# - index-*.js
```

#### 6.3 Verificar Tamanho dos Bundles
```bash
cd frontend
npm run build:production -- --mode production

# Verificar warnings de tamanho
# Nenhum chunk deve ter mais de 1000KB
```

#### 6.4 Testar Deploy Script S3 (Dry Run)

**Configurar variáveis de ambiente:**
```bash
# Linux/macOS
export S3_BUCKET_STAGING="halalsphere-frontend-staging"
export CLOUDFRONT_DISTRIBUTION_ID_STAGING=""  # Vazio = skip invalidation

# Windows PowerShell
$env:S3_BUCKET_STAGING="halalsphere-frontend-staging"
$env:CLOUDFRONT_DISTRIBUTION_ID_STAGING=""
```

**Executar script (requer AWS CLI configurado):**
```bash
cd frontend
chmod +x scripts/deploy-s3.sh
./scripts/deploy-s3.sh staging

# Verificar output:
# - Build completa
# - Tentativa de sync (vai falhar se bucket não existe)
# - CloudFront invalidation pulada (se ID não configurado)
```

### 7. Performance Tests

#### 7.1 Teste de Carga Simples
```bash
# Instalar Apache Bench (se necessário)
# Ubuntu: sudo apt-get install apache2-utils
# macOS: brew install httpd (já vem com ab)

# Testar health endpoint
ab -n 1000 -c 10 http://localhost:3333/health/live

# Verificações:
# - Nenhum request falhou
# - Tempo médio < 100ms
# - Throughput > 100 req/s
```

#### 7.2 Teste de Memória
```bash
# Monitorar uso de memória durante execução
docker stats halalsphere-backend

# Verificações:
# - Memória em idle < 150MB
# - Memória sob carga < 500MB
```

## 📊 Critérios de Aceitação Sprint 1

### ✅ Containerização
- [x] Dockerfile multi-stage funcional
- [x] Imagem Docker < 300MB
- [x] docker-entrypoint.sh com migrations
- [x] docker-compose.prod-test.yml funcional
- [ ] Build local sem erros
- [ ] Security scan sem CRITICAL vulnerabilities

### ✅ Health Checks
- [x] Endpoint /health/live implementado
- [x] Endpoint /health/ready com database check
- [x] Health check integrado ao Docker
- [ ] Health checks passando em ambiente de teste

### ✅ Graceful Shutdown
- [x] Handler de SIGTERM/SIGINT implementado
- [x] Timeout de 30 segundos
- [x] Prisma disconnect no shutdown
- [ ] Shutdown completa em < 30 segundos

### ✅ Trust Proxy
- [x] trust_proxy configurado no Fastify
- [x] Lê X-Forwarded-For corretamente
- [ ] IP real logado nos requests

### ✅ Storage S3
- [x] Storage Manager força S3 em production
- [x] Suporta AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
- [x] Fallback para local em dev/staging
- [ ] Upload funcional com LocalStack (opcional)

### ✅ Frontend Build
- [x] Build scripts para staging e production
- [x] Code splitting configurado
- [x] Minification com drop_console
- [x] .env.production e .env.staging
- [ ] Build sem erros TypeScript
- [ ] Bundles < 1000KB

### ✅ Deploy Script S3
- [x] Script deploy-s3.sh criado
- [x] Suporta staging e production
- [x] Cache headers otimizados
- [x] CloudFront invalidation
- [ ] Script executa sem erros (com bucket configurado)

## 🐛 Troubleshooting

### Erro: "Storage provider not initialized"
**Causa:** Variáveis AWS não configuradas em production

**Solução:**
```bash
# Adicionar ao .env ou docker-compose:
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

### Erro: "Failed to initialize S3 storage in production"
**Causa:** NODE_ENV=production mas credenciais AWS inválidas

**Solução:** Verificar credenciais ou usar NODE_ENV=staging para testes

### Container reiniciando constantemente
**Causa:** Migrations falhando ou DATABASE_URL incorreto

**Solução:**
```bash
# Ver logs
docker-compose -f docker-compose.prod-test.yml logs backend

# Verificar DATABASE_URL
docker-compose -f docker-compose.prod-test.yml exec backend env | grep DATABASE_URL
```

### Health check failing
**Causa:** Aplicação não iniciou completamente em 40s

**Solução:**
```bash
# Aumentar start_period no docker-compose.yml
healthcheck:
  start_period: 60s  # Aumentar de 40s para 60s
```

### Imagem Docker muito grande (>300MB)
**Causa:** node_modules incluindo dependências de dev

**Solução:**
```bash
# Verificar conteúdo da imagem
docker run --rm halalsphere-backend:test du -sh /app/node_modules

# Rebuild forçando npm ci --only=production
docker build --no-cache -t halalsphere-backend:test .
```

## 📝 Relatório de Testes

Após executar todos os testes, preencha:

```markdown
## Relatório Sprint 1 - [Data]

### Ambiente
- OS: [Windows/Linux/macOS]
- Docker version: [versão]
- Node version: [versão]

### Testes Executados
- [ ] Build Docker Backend: [✅ PASS / ❌ FAIL]
- [ ] Tamanho Imagem: [XXX MB] [✅ <300MB / ❌ >300MB]
- [ ] Security Scan: [✅ PASS / ❌ FAIL]
- [ ] Docker Compose: [✅ PASS / ❌ FAIL]
- [ ] Health Checks: [✅ PASS / ❌ FAIL]
- [ ] Graceful Shutdown: [✅ PASS / ❌ FAIL]
- [ ] Trust Proxy: [✅ PASS / ❌ FAIL]
- [ ] Frontend Build: [✅ PASS / ❌ FAIL]
- [ ] Code Splitting: [✅ PASS / ❌ FAIL]

### Problemas Encontrados
[Descrever problemas e soluções aplicadas]

### Próximos Passos
- Sprint 2: Terraform Infrastructure
- Sprint 3: ECS Fargate Deployment
```

## 🚀 Próxima Sprint

Após completar todos os testes da Sprint 1, você está pronto para:

**Sprint 2 - Semana 2 (Infraestrutura Terraform):**
- Criar módulos Terraform para VPC, RDS, ElastiCache
- Configurar S3 buckets e CloudFront
- Criar IAM roles para ECS
- Setup de API Gateway

Consulte [ROADMAP-COMPLETO-2026.md](../../ROADMAP-COMPLETO-2026.md) para detalhes.
