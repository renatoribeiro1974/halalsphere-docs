# AWS Infrastructure Migration - Checklist

**Data**: 14 de Janeiro de 2026
**Status**: 📋 Em Progresso

## 📋 Visão Geral

Checklist completo para migração das mudanças de infraestrutura AWS solicitadas pela equipe de infra em 14/01/2026.

**Mudanças principais**:
1. `DATABASE_URL` → `SQL_HALALSPHERE_CONNECTION`
2. `JWT_SECRET` → `JWT_PUBLIC_KEY_HALALSPHERE_API` + `JWT_PRIVATE_KEY_HALALSPHERE_API` (RS256)
3. Remover `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY` (usar IAM Roles)

---

## 🎯 FASE 0: PRÉ-REQUISITOS

### Documentação e Planejamento

- [x] Ler [AWS-INFRA-CHANGES-2026.md](./AWS-INFRA-CHANGES-2026.md)
- [x] Ler [CONFIGLOADER-UPDATE-GUIDE.md](./CONFIGLOADER-UPDATE-GUIDE.md)
- [x] Entender breaking changes
- [ ] Comunicar time sobre breaking changes
- [ ] Agendar janela de manutenção (se necessário)

### Ambiente Local

- [ ] Backup do código atual
- [ ] Criar branch `infra/aws-migration-2026`
- [ ] Configurar ambiente de desenvolvimento local

---

## 🔑 FASE 1: GERAR CHAVES JWT RSA

### Gerar Par de Chaves

```bash
# Opção 1: OpenSSL (recomendado)
openssl genrsa -out jwt-private.pem 2048
openssl rsa -in jwt-private.pem -pubout -out jwt-public.pem

# Opção 2: SSH-keygen
ssh-keygen -t rsa -b 2048 -m PEM -f jwt-key
```

### Validar Chaves

```bash
# Ver chave privada
cat jwt-private.pem

# Ver chave pública
cat jwt-public.pem

# Validar formato
openssl rsa -in jwt-private.pem -check
```

### Checklist

- [ ] Chaves RSA 2048 geradas
- [ ] Chave privada em formato PEM
- [ ] Chave pública em formato PEM
- [ ] Chaves validadas com OpenSSL
- [ ] Backup seguro das chaves
- [ ] Chaves armazenadas em local seguro (não commitar!)

**⚠️ IMPORTANTE**: Nunca commitar as chaves no Git! Adicionar `*.pem` ao `.gitignore`

---

## 💻 FASE 2: ATUALIZAR CÓDIGO BACKEND

### 2.1 ConfigLoader Service

**Arquivo**: `backend/src/services/aws/config-loader.service.ts`

- [ ] Atualizar interface `SecretsFromAWS`:
  - [ ] `DATABASE_URL` → `SQL_HALALSPHERE_CONNECTION`
  - [ ] `JWT_SECRET` → `JWT_PUBLIC_KEY_HALALSPHERE_API` + `JWT_PRIVATE_KEY_HALALSPHERE_API`
  - [ ] Remover `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY`

- [ ] Atualizar interface `AppConfig`:
  - [ ] Adicionar `jwtPublicKey: string`
  - [ ] Adicionar `jwtPrivateKey: string`
  - [ ] Remover `jwtSecret`
  - [ ] Remover `awsAccessKeyId` e `awsSecretAccessKey`

- [ ] Atualizar método `loadFromEnvironment()`:
  - [ ] Mapear `SQL_HALALSPHERE_CONNECTION` (com fallback para `DATABASE_URL`)
  - [ ] Mapear `JWT_PUBLIC_KEY_HALALSPHERE_API`
  - [ ] Mapear `JWT_PRIVATE_KEY_HALALSPHERE_API`
  - [ ] Remover mapeamento de AWS credentials

- [ ] Atualizar método `loadSecretsManager()`:
  - [ ] Mapear novos nomes de secrets
  - [ ] Validar que JWT keys existem

- [ ] Atualizar método `applyToEnvironment()`:
  - [ ] Aplicar `SQL_HALALSPHERE_CONNECTION`
  - [ ] Aplicar JWT keys
  - [ ] Remover aplicação de AWS credentials

**Referência**: [CONFIGLOADER-UPDATE-GUIDE.md - Parte 2](./CONFIGLOADER-UPDATE-GUIDE.md#parte-2-configloader-class)

### 2.2 JWT Service

**Arquivo**: `backend/src/services/auth/jwt.service.ts`

- [ ] Atualizar construtor:
  - [ ] Usar `configLoader.get('jwtPublicKey')`
  - [ ] Usar `configLoader.get('jwtPrivateKey')`
  - [ ] Remover referência a `JWT_SECRET`

- [ ] Atualizar método `sign()`:
  - [ ] Usar `algorithm: 'RS256'`
  - [ ] Assinar com `privateKey`

- [ ] Atualizar método `verify()`:
  - [ ] Usar `algorithms: ['RS256']`
  - [ ] Verificar com `publicKey`

- [ ] Adicionar método `decode()` (opcional)

**Referência**: [CONFIGLOADER-UPDATE-GUIDE.md - JWT Service](./CONFIGLOADER-UPDATE-GUIDE.md#atualiza%C3%A7%C3%A3o-do-jwt-service)

### 2.3 Storage Manager

**Arquivo**: `backend/src/services/storage/storage-manager.service.ts`

- [ ] Atualizar construtor:
  - [ ] Remover `credentials` do `S3Client`
  - [ ] Usar apenas `region` do ConfigLoader
  - [ ] Confiar no ECS Task Role para credenciais

- [ ] Adicionar log indicando uso de IAM Role

**Referência**: [CONFIGLOADER-UPDATE-GUIDE.md - Storage Manager](./CONFIGLOADER-UPDATE-GUIDE.md#atualiza%C3%A7%C3%A3o-do-storage-manager)

### 2.4 Prisma Schema (Opcional)

**Arquivo**: `backend/prisma/schema.prisma`

- [ ] Verificar se `DATABASE_URL` está hardcoded
- [ ] Atualizar para usar `SQL_HALALSPHERE_CONNECTION` se necessário
- [ ] Documentar mudança no schema

### 2.5 Server Initialization

**Arquivo**: `backend/src/server.ts`

- [ ] Garantir ordem de inicialização:
  1. ConfigLoader.initialize()
  2. ConfigLoader.applyToEnvironment()
  3. Outros services (JWT, Storage, etc.)
  4. Server startup

- [ ] Adicionar validações de startup
- [ ] Adicionar logs de configuração carregada

**Referência**: [CONFIGLOADER-UPDATE-GUIDE.md - Testes](./CONFIGLOADER-UPDATE-GUIDE.md#3-testar-inicializa%C3%A7%C3%A3o)

### 2.6 Environment Variables

**Arquivo**: `backend/.env.example`

- [ ] Atualizar com novos nomes:
  ```bash
  SQL_HALALSPHERE_CONNECTION=postgresql://...
  JWT_PUBLIC_KEY_HALALSPHERE_API=-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----
  JWT_PRIVATE_KEY_HALALSPHERE_API=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
  # Remover AWS_ACCESS_KEY_ID e AWS_SECRET_ACCESS_KEY
  ```

**Arquivo**: `backend/.env` (local)

- [ ] Atualizar variáveis de desenvolvimento local
- [ ] Adicionar chaves JWT geradas
- [ ] Testar que aplicação inicia corretamente

---

## 🧪 FASE 3: TESTES LOCAIS

### 3.1 Testes Unitários

- [ ] ConfigLoader carrega configs corretamente
- [ ] JWT Service assina e verifica tokens com RS256
- [ ] Storage Manager inicializa sem credenciais explícitas

### 3.2 Testes de Integração

- [ ] Aplicação inicia sem erros
- [ ] Database connection funciona com novo nome
- [ ] JWT sign/verify funciona
- [ ] S3 upload funciona (se tiver AWS CLI configurado)

### 3.3 Testes de API

```bash
# Testar login
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Verificar token retornado
# Decodificar em jwt.io e verificar que usa RS256
```

- [ ] Login retorna token válido
- [ ] Token usa algoritmo RS256
- [ ] Endpoints protegidos aceitam token
- [ ] Refresh token funciona

### 3.4 Verificação de Logs

```bash
# Verificar logs de startup
npm run dev

# Deve mostrar:
# [ConfigLoader] Initializing for environment: development
# [ConfigLoader] Loading from environment variables
# [ConfigLoader] Initialization complete
# [JWTService] Initialized with RS256 asymmetric keys
# [StorageManager] Using ECS Task Role for credentials
```

- [ ] ConfigLoader inicializa corretamente
- [ ] JWT Service usa RS256
- [ ] Storage Manager usa IAM Role
- [ ] Sem erros de configuração

---

## ☁️ FASE 4: ATUALIZAR AWS SECRETS MANAGER

### 4.1 Preparar Secrets JSON

```json
{
  "SQL_HALALSPHERE_CONNECTION": "postgresql://admin:PASSWORD@rds-staging.amazonaws.com:5432/halalsphere",
  "REDIS_URL": "redis://:PASSWORD@elasticache-staging.amazonaws.com:6379",
  "JWT_PUBLIC_KEY_HALALSPHERE_API": "-----BEGIN PUBLIC KEY-----\nMIIBIjANB...\n-----END PUBLIC KEY-----",
  "JWT_PRIVATE_KEY_HALALSPHERE_API": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----",
  "JWT_EXPIRES_IN": "7d",
  "SMTP_USER": "noreply@halalsphere.com",
  "SMTP_PASSWORD": "smtp-app-password"
}
```

**⚠️ IMPORTANTE**: Converter newlines para `\n` no JSON

```bash
# Converter chave PEM para formato JSON
cat jwt-public.pem | awk '{printf "%s\\n", $0}'
```

### 4.2 Atualizar Secrets - Staging

```bash
# Atualizar secret no Secrets Manager (staging)
aws secretsmanager update-secret \
  --secret-id halalsphere/staging/secrets \
  --secret-string file://secrets-staging.json \
  --region us-east-1
```

- [ ] Secret criado/atualizado em staging
- [ ] Validar conteúdo do secret:
  ```bash
  aws secretsmanager get-secret-value \
    --secret-id halalsphere/staging/secrets \
    --region us-east-1 \
    --query 'SecretString' \
    --output text | jq .
  ```

### 4.3 Atualizar Secrets - Production

**⚠️ FAZER APENAS APÓS VALIDAÇÃO EM STAGING**

```bash
# Atualizar secret no Secrets Manager (production)
aws secretsmanager update-secret \
  --secret-id halalsphere/production/secrets \
  --secret-string file://secrets-production.json \
  --region us-east-1
```

- [ ] Secret criado/atualizado em production
- [ ] Validar conteúdo do secret

---

## 🔐 FASE 5: CONFIGURAR IAM ROLES

### 5.1 Verificar ECS Task Role

```bash
# Verificar role existente
aws iam get-role \
  --role-name halalsphere-ecs-task-role \
  --region us-east-1
```

- [ ] Role existe
- [ ] Trust policy permite `ecs-tasks.amazonaws.com`

### 5.2 Atualizar/Criar IAM Policy

**Arquivo**: `terraform/ecs-task-policy.json` ou criar manualmente

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "SecretsManagerAccess",
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": [
        "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:halalsphere/staging/secrets-*",
        "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:halalsphere/production/secrets-*"
      ]
    },
    {
      "Sid": "ParameterStoreAccess",
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:GetParametersByPath"
      ],
      "Resource": [
        "arn:aws:ssm:us-east-1:ACCOUNT_ID:parameter/halalsphere/staging/config/*",
        "arn:aws:ssm:us-east-1:ACCOUNT_ID:parameter/halalsphere/production/config/*"
      ]
    },
    {
      "Sid": "S3Access",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::halalsphere-uploads-staging",
        "arn:aws:s3:::halalsphere-uploads-staging/*",
        "arn:aws:s3:::halalsphere-uploads-production",
        "arn:aws:s3:::halalsphere-uploads-production/*"
      ]
    },
    {
      "Sid": "KMSDecrypt",
      "Effect": "Allow",
      "Action": [
        "kms:Decrypt"
      ],
      "Resource": [
        "arn:aws:kms:us-east-1:ACCOUNT_ID:key/*"
      ]
    }
  ]
}
```

- [ ] Policy criada/atualizada
- [ ] Policy attached ao ECS Task Role

```bash
# Attach policy
aws iam put-role-policy \
  --role-name halalsphere-ecs-task-role \
  --policy-name halalsphere-task-permissions \
  --policy-document file://ecs-task-policy.json
```

**Referência**: [AWS-INFRA-CHANGES-2026.md - IAM Policy](./AWS-INFRA-CHANGES-2026.md#exemplo-de-policy)

---

## 🐳 FASE 6: ATUALIZAR ECS TASK DEFINITION

### 6.1 Atualizar Task Definition JSON

**Arquivo**: `terraform/ecs-task-definition.json` ou console AWS

```json
{
  "family": "halalsphere-backend",
  "taskRoleArn": "arn:aws:iam::ACCOUNT_ID:role/halalsphere-ecs-task-role",
  "executionRoleArn": "arn:aws:iam::ACCOUNT_ID:role/ecsTaskExecutionRole",
  "networkMode": "awsvpc",
  "containerDefinitions": [
    {
      "name": "halalsphere-backend",
      "image": "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/halalsphere-backend:latest",
      "portMappings": [
        {
          "containerPort": 3333,
          "protocol": "tcp"
        }
      ],
      "environment": [
        { "name": "NODE_ENV", "value": "production" },
        { "name": "AWS_REGION", "value": "us-east-1" },
        { "name": "PORT", "value": "3333" },
        { "name": "TRUST_PROXY", "value": "true" }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/halalsphere-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ],
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024"
}
```

**⚠️ IMPORTANTE**:
- ❌ NÃO passar secrets via `environment`
- ✅ ConfigLoader carrega automaticamente do Secrets Manager
- ✅ `taskRoleArn` deve apontar para role com permissões

- [ ] Task Definition atualizada
- [ ] `taskRoleArn` configurado corretamente
- [ ] Sem secrets em `environment`
- [ ] Registrar nova revisão

```bash
# Registrar nova task definition
aws ecs register-task-definition \
  --cli-input-json file://ecs-task-definition.json
```

---

## 🚀 FASE 7: DEPLOY E VALIDAÇÃO

### 7.1 Deploy em Staging

- [ ] Build nova imagem Docker
  ```bash
  docker build -t halalsphere-backend:staging .
  ```

- [ ] Push para ECR
  ```bash
  aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
  docker tag halalsphere-backend:staging ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/halalsphere-backend:staging
  docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/halalsphere-backend:staging
  ```

- [ ] Atualizar ECS Service com nova Task Definition
  ```bash
  aws ecs update-service \
    --cluster halalsphere-staging \
    --service halalsphere-backend \
    --task-definition halalsphere-backend:REVISION \
    --force-new-deployment
  ```

- [ ] Aguardar deployment completo
- [ ] Verificar logs do container

### 7.2 Validar em Staging

```bash
# Acessar logs do container
aws ecs execute-command \
  --cluster halalsphere-staging \
  --task TASK_ID \
  --container halalsphere-backend \
  --interactive \
  --command "/bin/sh"
```

**Dentro do container**:

- [ ] Verificar variáveis de ambiente (NÃO mostrar valores sensíveis)
  ```bash
  echo $NODE_ENV
  # Verificar que AWS_ACCESS_KEY_ID NÃO existe
  env | grep -v "SECRET\|PASSWORD\|KEY" | sort
  ```

- [ ] Verificar que ConfigLoader carregou configs
  ```bash
  # Ver logs de inicialização
  # Deve mostrar: [ConfigLoader] Loading from AWS
  ```

- [ ] Verificar IAM Role
  ```bash
  # Credenciais temporárias do role
  curl http://169.254.170.2$AWS_CONTAINER_CREDENTIALS_RELATIVE_URI
  # Deve retornar AccessKeyId, SecretAccessKey, Token temporários
  ```

### 7.3 Testes de API em Staging

- [ ] Testar login (JWT RS256)
  ```bash
  curl -X POST https://api-staging.halalsphere.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@halalsphere.com","password":"password"}'
  ```

- [ ] Verificar token retornado
  - Decodificar em jwt.io
  - Verificar algoritmo = RS256

- [ ] Testar upload S3 (via IAM Role)
  ```bash
  # Upload através da API (endpoint que faz upload)
  curl -X POST https://api-staging.halalsphere.com/api/documents/upload \
    -H "Authorization: Bearer TOKEN" \
    -F "file=@test.pdf"
  ```

- [ ] Testar database connection
  ```bash
  curl https://api-staging.halalsphere.com/api/health
  ```

### 7.4 Validar Logs e Métricas

- [ ] CloudWatch Logs mostram inicialização correta
- [ ] Sem erros de configuração
- [ ] Sem erros de permissão (403 Forbidden)
- [ ] Application healthy

---

## 🎯 FASE 8: DEPLOY EM PRODUCTION

**⚠️ FAZER APENAS APÓS VALIDAÇÃO COMPLETA EM STAGING**

### 8.1 Backup Pre-Deployment

- [ ] Backup do banco de dados
- [ ] Snapshot da infraestrutura atual
- [ ] Documentar versão atual (rollback plan)

### 8.2 Deploy em Production

- [ ] Build imagem production
  ```bash
  docker build -t halalsphere-backend:production .
  ```

- [ ] Push para ECR
  ```bash
  docker tag halalsphere-backend:production ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/halalsphere-backend:production
  docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/halalsphere-backend:production
  ```

- [ ] Atualizar ECS Service production
  ```bash
  aws ecs update-service \
    --cluster halalsphere-production \
    --service halalsphere-backend \
    --task-definition halalsphere-backend:REVISION \
    --force-new-deployment
  ```

- [ ] Aguardar deployment completo
- [ ] Monitorar logs e métricas

### 8.3 Smoke Tests em Production

- [ ] Health check endpoint responde OK
- [ ] Login funciona
- [ ] Upload S3 funciona
- [ ] Database queries funcionam
- [ ] Sem erros 500 nos logs

### 8.4 Monitoramento Pós-Deploy

- [ ] Configurar CloudWatch Alarms
  - [ ] CPU > 80%
  - [ ] Memory > 80%
  - [ ] Error rate > 1%
  - [ ] Failed logins > 10/min

- [ ] Monitorar por 24-48h
- [ ] Verificar métricas de performance
- [ ] Coletar feedback de usuários

---

## 📚 FASE 9: DOCUMENTAÇÃO E CLEANUP

### 9.1 Atualizar Documentação

- [x] [AWS-INFRA-CHANGES-2026.md](./AWS-INFRA-CHANGES-2026.md)
- [x] [CONFIGLOADER-UPDATE-GUIDE.md](./CONFIGLOADER-UPDATE-GUIDE.md)
- [x] [RESUMO-EXECUTIVO-JANEIRO-2026.md](../IMPLEMENTATION-HISTORY/RESUMO-EXECUTIVO-JANEIRO-2026.md)
- [x] [DOCUMENTATION_STATUS.md](../DOCUMENTATION_STATUS.md)
- [ ] README.md do backend
- [ ] Changelog / Release notes

### 9.2 Comunicação

- [ ] Notificar time sobre mudanças
- [ ] Atualizar runbooks
- [ ] Atualizar oncall playbooks
- [ ] Documentar rollback procedure

### 9.3 Cleanup

- [ ] Remover secrets antigos (após período de grace)
  ```bash
  # Aguardar 30 dias antes de deletar
  # aws secretsmanager delete-secret --secret-id halalsphere/OLD/secrets
  ```

- [ ] Remover código legacy (se houver fallbacks)
- [ ] Remover variáveis de ambiente antigas
- [ ] Atualizar .env.example

---

## ✅ CRITÉRIOS DE ACEITAÇÃO

### Backend Code

- [x] ConfigLoader atualizado com novos nomes
- [x] JWT Service usa RS256
- [x] Storage Manager sem AWS credentials
- [ ] Testes locais passando
- [ ] Code review aprovado

### AWS Infrastructure

- [ ] Secrets atualizados em Secrets Manager
- [ ] ECS Task Role com permissões corretas
- [ ] Task Definition atualizada
- [ ] Deploy em staging bem-sucedido
- [ ] Deploy em production bem-sucedido

### Validação

- [ ] Login funciona (JWT RS256)
- [ ] Upload S3 funciona (via IAM Role)
- [ ] Database connection funciona
- [ ] Logs não mostram erros de configuração
- [ ] Sem erros de permissão AWS

### Rollback Plan

- [ ] Documentar como fazer rollback
- [ ] Manter secrets antigos por 30 dias
- [ ] Manter Task Definition anterior disponível

---

## 🚨 ROLLBACK PROCEDURE

### Se algo der errado em Staging/Production:

1. **Reverter Task Definition**
   ```bash
   aws ecs update-service \
     --cluster halalsphere-staging \
     --service halalsphere-backend \
     --task-definition halalsphere-backend:PREVIOUS_REVISION
   ```

2. **Restaurar Secrets Antigos** (se necessário)
   ```bash
   aws secretsmanager update-secret \
     --secret-id halalsphere/staging/secrets \
     --secret-string file://secrets-backup.json
   ```

3. **Verificar que sistema volta ao normal**

4. **Investigar causa raiz**

---

## 📊 MÉTRICAS DE SUCESSO

- ✅ Zero downtime durante migração
- ✅ Nenhum erro de configuração em production
- ✅ JWT tokens funcionam com RS256
- ✅ S3 uploads funcionam via IAM Role
- ✅ Logs mostram configurações carregadas corretamente
- ✅ Secrets Manager queries bem-sucedidas
- ✅ CloudWatch sem alertas críticos

---

## 🔗 Referências

- [AWS-INFRA-CHANGES-2026.md](./AWS-INFRA-CHANGES-2026.md) - Detalhes das mudanças
- [CONFIGLOADER-UPDATE-GUIDE.md](./CONFIGLOADER-UPDATE-GUIDE.md) - Código completo
- [AWS ECS Task IAM Roles](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-iam-roles.html)
- [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/)
- [JWT RS256](https://jwt.io/)

---

**Status**: 📋 Em Progresso
**Última atualização**: 14 de Janeiro de 2026
**Responsável**: DevOps Team + Backend Team
