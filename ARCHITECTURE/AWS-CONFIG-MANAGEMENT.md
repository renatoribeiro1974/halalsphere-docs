# AWS Configuration Management Strategy

## 📋 Visão Geral

A aplicação utiliza **AWS Parameter Store** para configurações não sensíveis e **AWS Secrets Manager** para dados sensíveis, seguindo as melhores práticas de segurança da AWS.

## 🔐 Estratégia de Configuração

### Parameter Store (Configurações Não Sensíveis)

**Path:** `/halalsphere/{environment}/config/*`

Usado para configurações que **não contêm credenciais ou dados sensíveis**:

- URLs públicas (CORS_ORIGIN, FRONTEND_URL, BASE_URL)
- Configurações de SMTP não sensíveis (host, port, from email, from name)
- Feature flags
- Regiões AWS
- Configurações de comportamento

**Vantagens:**
- ✅ Gratuito até 10.000 parâmetros
- ✅ Versionamento automático
- ✅ Sem necessidade de criptografia KMS
- ✅ Acesso rápido (baixa latência)

### Secrets Manager (Dados Sensíveis)

**Secret Name:** `halalsphere/{environment}/secrets`

Usado para **credenciais e dados sensíveis** armazenados como um único JSON:

- DATABASE_URL (connection string com senha)
- REDIS_URL (connection string com senha)
- JWT_SECRET
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- SMTP_USER
- SMTP_PASSWORD

**Vantagens:**
- ✅ Criptografia automática com AWS KMS
- ✅ Rotação automática de secrets
- ✅ Auditoria via CloudTrail
- ✅ Controle de acesso granular via IAM
- ✅ Versionamento de secrets

**Custo:**
- $0.40 por secret/mês
- $0.05 por 10.000 API calls

## 🏗️ Estrutura de Configuração

### Ambientes Suportados

1. **Development** (`development`)
   - Usa variáveis de ambiente locais (`.env`)
   - Não acessa AWS Parameter Store/Secrets Manager
   - Ideal para desenvolvimento local

2. **Staging** (`staging`)
   - Parameter Store: `/halalsphere/staging/config/*`
   - Secrets Manager: `halalsphere/staging/secrets`
   - Ambiente de testes pré-produção

3. **Production** (`production`)
   - Parameter Store: `/halalsphere/production/config/*`
   - Secrets Manager: `halalsphere/production/secrets`
   - Ambiente de produção

## 📦 Parameter Store - Estrutura

### Paths

```
/halalsphere/{env}/config/
├── cors_origin          # Exemplo: https://app.halalsphere.com
├── frontend_url         # Exemplo: https://app.halalsphere.com
├── base_url             # Exemplo: https://api.halalsphere.com
├── smtp_host            # Exemplo: smtp.gmail.com
├── smtp_port            # Exemplo: 587
├── smtp_from_email      # Exemplo: noreply@halalsphere.com
├── smtp_from_name       # Exemplo: HalalSphere
├── require_email_verification  # Exemplo: true
└── aws_region           # Exemplo: us-east-1
```

### Criar Parâmetros via AWS CLI

```bash
# Production
aws ssm put-parameter \
  --name /halalsphere/production/config/cors_origin \
  --type String \
  --value "https://app.halalsphere.com" \
  --description "CORS allowed origin"

aws ssm put-parameter \
  --name /halalsphere/production/config/frontend_url \
  --type String \
  --value "https://app.halalsphere.com"

aws ssm put-parameter \
  --name /halalsphere/production/config/base_url \
  --type String \
  --value "https://api.halalsphere.com"

aws ssm put-parameter \
  --name /halalsphere/production/config/smtp_host \
  --type String \
  --value "smtp.gmail.com"

aws ssm put-parameter \
  --name /halalsphere/production/config/smtp_port \
  --type String \
  --value "587"

aws ssm put-parameter \
  --name /halalsphere/production/config/smtp_from_email \
  --type String \
  --value "noreply@halalsphere.com"

aws ssm put-parameter \
  --name /halalsphere/production/config/smtp_from_name \
  --type String \
  --value "HalalSphere"

aws ssm put-parameter \
  --name /halalsphere/production/config/require_email_verification \
  --type String \
  --value "true"

aws ssm put-parameter \
  --name /halalsphere/production/config/aws_region \
  --type String \
  --value "us-east-1"

# Staging (trocar production por staging)
aws ssm put-parameter \
  --name /halalsphere/staging/config/cors_origin \
  --type String \
  --value "https://staging.halalsphere.com"
```

### Criar Parâmetros via Terraform

```hcl
resource "aws_ssm_parameter" "cors_origin" {
  name        = "/halalsphere/${var.environment}/config/cors_origin"
  description = "CORS allowed origin"
  type        = "String"
  value       = var.cors_origin

  tags = {
    Environment = var.environment
    Project     = "HalalSphere"
  }
}

resource "aws_ssm_parameter" "frontend_url" {
  name        = "/halalsphere/${var.environment}/config/frontend_url"
  type        = "String"
  value       = var.frontend_url
}

resource "aws_ssm_parameter" "base_url" {
  name        = "/halalsphere/${var.environment}/config/base_url"
  type        = "String"
  value       = var.base_url
}

# ... demais parâmetros
```

## 🔐 Secrets Manager - Estrutura

### Secret JSON Format

```json
{
  "DATABASE_URL": "postgresql://user:password@host:5432/halalsphere",
  "REDIS_URL": "redis://:password@host:6379",
  "JWT_SECRET": "your-jwt-secret-min-32-chars",
  "JWT_EXPIRES_IN": "7d",
  "AWS_ACCESS_KEY_ID": "AKIAXXXXXXXXXXXXXXXX",
  "AWS_SECRET_ACCESS_KEY": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "SMTP_USER": "smtp-user@gmail.com",
  "SMTP_PASSWORD": "smtp-password-or-app-password"
}
```

### Criar Secret via AWS CLI

```bash
# Production
aws secretsmanager create-secret \
  --name halalsphere/production/secrets \
  --description "HalalSphere Production Secrets" \
  --secret-string '{
    "DATABASE_URL": "postgresql://admin:CHANGE_ME@rds-prod.amazonaws.com:5432/halalsphere",
    "REDIS_URL": "redis://:CHANGE_ME@elasticache-prod.amazonaws.com:6379",
    "JWT_SECRET": "CHANGE_ME_MIN_32_CHARACTERS_LONG",
    "JWT_EXPIRES_IN": "7d",
    "AWS_ACCESS_KEY_ID": "AKIAXXXXXXXXXXXXXXXX",
    "AWS_SECRET_ACCESS_KEY": "CHANGE_ME_SECRET_ACCESS_KEY",
    "SMTP_USER": "noreply@halalsphere.com",
    "SMTP_PASSWORD": "CHANGE_ME_SMTP_PASSWORD"
  }'

# Staging
aws secretsmanager create-secret \
  --name halalsphere/staging/secrets \
  --description "HalalSphere Staging Secrets" \
  --secret-string '{
    "DATABASE_URL": "postgresql://admin:CHANGE_ME@rds-staging.amazonaws.com:5432/halalsphere",
    "REDIS_URL": "redis://:CHANGE_ME@elasticache-staging.amazonaws.com:6379",
    "JWT_SECRET": "CHANGE_ME_STAGING_JWT_SECRET",
    "JWT_EXPIRES_IN": "7d",
    "AWS_ACCESS_KEY_ID": "AKIAXXXXXXXXXXXXXXXX",
    "AWS_SECRET_ACCESS_KEY": "CHANGE_ME_SECRET_ACCESS_KEY",
    "SMTP_USER": "staging@halalsphere.com",
    "SMTP_PASSWORD": "CHANGE_ME_SMTP_PASSWORD"
  }'
```

### Atualizar Secret

```bash
# Atualizar secret existente
aws secretsmanager update-secret \
  --secret-id halalsphere/production/secrets \
  --secret-string '{
    "DATABASE_URL": "postgresql://admin:NEW_PASSWORD@rds-prod.amazonaws.com:5432/halalsphere",
    "REDIS_URL": "redis://:NEW_PASSWORD@elasticache-prod.amazonaws.com:6379",
    "JWT_SECRET": "NEW_JWT_SECRET",
    "JWT_EXPIRES_IN": "7d",
    "AWS_ACCESS_KEY_ID": "AKIAXXXXXXXXXXXXXXXX",
    "AWS_SECRET_ACCESS_KEY": "NEW_SECRET_ACCESS_KEY",
    "SMTP_USER": "noreply@halalsphere.com",
    "SMTP_PASSWORD": "NEW_SMTP_PASSWORD"
  }'
```

### Criar Secret via Terraform

```hcl
resource "aws_secretsmanager_secret" "app_secrets" {
  name        = "halalsphere/${var.environment}/secrets"
  description = "HalalSphere ${var.environment} secrets"

  tags = {
    Environment = var.environment
    Project     = "HalalSphere"
  }
}

resource "aws_secretsmanager_secret_version" "app_secrets_version" {
  secret_id = aws_secretsmanager_secret.app_secrets.id
  secret_string = jsonencode({
    DATABASE_URL           = var.database_url
    REDIS_URL             = var.redis_url
    JWT_SECRET            = random_password.jwt_secret.result
    JWT_EXPIRES_IN        = "7d"
    AWS_ACCESS_KEY_ID     = var.aws_access_key_id
    AWS_SECRET_ACCESS_KEY = var.aws_secret_access_key
    SMTP_USER             = var.smtp_user
    SMTP_PASSWORD         = var.smtp_password
  })
}

resource "random_password" "jwt_secret" {
  length  = 64
  special = true
}
```

## 🔧 Uso na Aplicação

### ConfigLoader Service

O serviço `configLoader` é inicializado automaticamente no startup do servidor:

```typescript
// backend/src/server.ts
import { configLoader } from './services/aws/config-loader.service';

async function start() {
  // 1. Carregar configurações do AWS
  await configLoader.initialize();

  // 2. Aplicar ao process.env
  configLoader.applyToEnvironment();

  // 3. Iniciar servidor
  // ...
}
```

### Acessar Configurações no Código

```typescript
import { configLoader } from './services/aws/config-loader.service';

// Obter config específica
const corsOrigin = configLoader.get('corsOrigin');
const jwtSecret = configLoader.get('jwtSecret');

// Obter todas as configs
const allConfig = configLoader.getAll();
```

### Comportamento por Ambiente

```typescript
// Development
- Lê de process.env (variáveis locais)
- Não acessa AWS
- Ideal para dev local com .env

// Staging/Production
- Lê do AWS Parameter Store (/halalsphere/{env}/config/*)
- Lê do AWS Secrets Manager (halalsphere/{env}/secrets)
- Fallback para process.env se AWS falhar
- Aplica configs ao process.env para compatibilidade
```

## 🔑 IAM Permissions

### ECS Task Role (Production)

O container ECS precisa das seguintes permissões:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:GetParametersByPath"
      ],
      "Resource": [
        "arn:aws:ssm:us-east-1:ACCOUNT_ID:parameter/halalsphere/production/config/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": [
        "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:halalsphere/production/secrets-*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "kms:Decrypt"
      ],
      "Resource": [
        "arn:aws:kms:us-east-1:ACCOUNT_ID:key/KEY_ID"
      ]
    }
  ]
}
```

### Terraform IAM Policy

```hcl
data "aws_iam_policy_document" "ecs_task_policy" {
  statement {
    effect = "Allow"
    actions = [
      "ssm:GetParameter",
      "ssm:GetParameters",
      "ssm:GetParametersByPath"
    ]
    resources = [
      "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter/halalsphere/${var.environment}/config/*"
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "secretsmanager:GetSecretValue"
    ]
    resources = [
      aws_secretsmanager_secret.app_secrets.arn
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "kms:Decrypt"
    ]
    resources = [
      aws_kms_key.secrets.arn
    ]
  }
}

resource "aws_iam_role_policy" "ecs_task_policy" {
  name   = "halalsphere-${var.environment}-ecs-task-policy"
  role   = aws_iam_role.ecs_task_role.id
  policy = data.aws_iam_policy_document.ecs_task_policy.json
}
```

## 🧪 Testing Locally

### Opção 1: Usar .env (Recomendado para Dev)

```bash
# backend/.env
NODE_ENV=development
DATABASE_URL=postgresql://admin:secret123@localhost:5432/halalsphere
JWT_SECRET=local-dev-secret-key
AWS_REGION=us-east-1
# ... demais variáveis
```

### Opção 2: Testar AWS Parameter Store/Secrets Manager Localmente

```bash
# Configurar AWS CLI com credenciais de staging
aws configure --profile halalsphere-staging

# Usar profile específico
export AWS_PROFILE=halalsphere-staging
export NODE_ENV=staging

# Rodar aplicação
npm run dev
```

### Opção 3: LocalStack (AWS Local)

```yaml
# docker-compose.yml
services:
  localstack:
    image: localstack/localstack:latest
    ports:
      - "4566:4566"
    environment:
      - SERVICES=ssm,secretsmanager
      - DEFAULT_REGION=us-east-1
```

```bash
# Criar parâmetros no LocalStack
aws --endpoint-url=http://localhost:4566 ssm put-parameter \
  --name /halalsphere/staging/config/cors_origin \
  --type String \
  --value "http://localhost:5173"

# Configurar app para usar LocalStack
export AWS_ENDPOINT_URL=http://localhost:4566
export NODE_ENV=staging
npm run dev
```

## 📊 Monitoramento

### CloudWatch Metrics

- `GetParameter` - Chamadas ao Parameter Store
- `GetSecretValue` - Chamadas ao Secrets Manager
- Latência de chamadas

### CloudWatch Alarms

```hcl
resource "aws_cloudwatch_metric_alarm" "secrets_access_failures" {
  alarm_name          = "halalsphere-${var.environment}-secrets-access-failures"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "UserErrorCount"
  namespace           = "AWS/SecretsManager"
  period              = 60
  statistic           = "Sum"
  threshold           = 5
  alarm_description   = "Alert when secret access fails repeatedly"
  alarm_actions       = [aws_sns_topic.alerts.arn]
}
```

### CloudTrail Audit

Todos os acessos a secrets são logados no CloudTrail:

```bash
# Buscar acessos recentes
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=ResourceName,AttributeValue=halalsphere/production/secrets \
  --max-results 10
```

## 🔄 Rotação de Secrets

### Automática (Recomendado)

```hcl
resource "aws_secretsmanager_secret_rotation" "app_secrets_rotation" {
  secret_id           = aws_secretsmanager_secret.app_secrets.id
  rotation_lambda_arn = aws_lambda_function.rotate_secret.arn

  rotation_rules {
    automatically_after_days = 30
  }
}
```

### Manual

```bash
# Gerar nova versão do secret
aws secretsmanager update-secret \
  --secret-id halalsphere/production/secrets \
  --secret-string '{...new values...}'

# Reiniciar containers ECS para pegar novo secret
aws ecs update-service \
  --cluster halalsphere-production \
  --service halalsphere-backend \
  --force-new-deployment
```

## 🚀 Deployment Checklist

Antes de fazer deploy em produção:

- [ ] Criar todos os parâmetros no Parameter Store
- [ ] Criar secret no Secrets Manager com todos os valores
- [ ] Configurar IAM role com permissões corretas
- [ ] Testar acesso em staging primeiro
- [ ] Configurar CloudWatch alarms
- [ ] Habilitar rotação automática de secrets (opcional)
- [ ] Documentar valores em cofre seguro (1Password, Vault, etc)

## 📚 Referências

- [AWS Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html)
- [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [ECS Task IAM Roles](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-iam-roles.html)
