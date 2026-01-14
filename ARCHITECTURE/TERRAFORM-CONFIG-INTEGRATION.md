# Terraform - Integração com Config Management

## 📋 Visão Geral

Guia para integrar o Terraform existente com o sistema de gerenciamento de configurações (Parameter Store + Secrets Manager) implementado na Sprint 1.

## 🎯 Objetivo

Criar via Terraform:
1. Parâmetros no AWS Parameter Store (configs não sensíveis)
2. Secrets no AWS Secrets Manager (configs sensíveis)
3. IAM Policies para ECS Task Role acessar esses recursos

## 📦 Módulo Terraform - Parameter Store

### Estrutura de Arquivos Sugerida

```
terraform/
├── modules/
│   ├── parameter-store/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── secrets-manager/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── iam-ecs-task/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
└── environments/
    ├── production/
    │   ├── main.tf
    │   ├── terraform.tfvars
    │   └── backend.tf
    └── staging/
        ├── main.tf
        ├── terraform.tfvars
        └── backend.tf
```

## 🔧 Parameter Store Module

### modules/parameter-store/main.tf

```hcl
# modules/parameter-store/main.tf

locals {
  # Base path para os parâmetros
  base_path = "/halalsphere/${var.environment}/config"

  # Parâmetros padrão
  parameters = {
    cors_origin                 = var.cors_origin
    frontend_url                = var.frontend_url
    base_url                    = var.base_url
    smtp_host                   = var.smtp_host
    smtp_port                   = tostring(var.smtp_port)
    smtp_from_email             = var.smtp_from_email
    smtp_from_name              = var.smtp_from_name
    require_email_verification  = tostring(var.require_email_verification)
    aws_region                  = var.aws_region
  }
}

# Criar todos os parâmetros
resource "aws_ssm_parameter" "app_config" {
  for_each = local.parameters

  name        = "${local.base_path}/${each.key}"
  description = "HalalSphere ${var.environment} - ${each.key}"
  type        = "String"
  value       = each.value

  tags = merge(
    var.tags,
    {
      Name        = "${var.environment}-${each.key}"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Application = "HalalSphere"
    }
  )
}

# Output com todos os parâmetros criados
output "parameter_arns" {
  description = "ARNs de todos os parâmetros criados"
  value       = { for k, v in aws_ssm_parameter.app_config : k => v.arn }
}

output "parameter_names" {
  description = "Nomes de todos os parâmetros criados"
  value       = { for k, v in aws_ssm_parameter.app_config : k => v.name }
}

output "base_path" {
  description = "Path base dos parâmetros"
  value       = local.base_path
}
```

### modules/parameter-store/variables.tf

```hcl
variable "environment" {
  description = "Environment (production, staging, development)"
  type        = string

  validation {
    condition     = contains(["production", "staging", "development"], var.environment)
    error_message = "Environment must be production, staging, or development."
  }
}

variable "cors_origin" {
  description = "CORS allowed origin"
  type        = string
}

variable "frontend_url" {
  description = "Frontend URL"
  type        = string
}

variable "base_url" {
  description = "Backend API base URL"
  type        = string
}

variable "smtp_host" {
  description = "SMTP host"
  type        = string
  default     = "smtp.gmail.com"
}

variable "smtp_port" {
  description = "SMTP port"
  type        = number
  default     = 587
}

variable "smtp_from_email" {
  description = "SMTP from email"
  type        = string
}

variable "smtp_from_name" {
  description = "SMTP from name"
  type        = string
  default     = "HalalSphere"
}

variable "require_email_verification" {
  description = "Require email verification"
  type        = bool
  default     = true
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "tags" {
  description = "Additional tags"
  type        = map(string)
  default     = {}
}
```

## 🔐 Secrets Manager Module

### modules/secrets-manager/main.tf

```hcl
# modules/secrets-manager/main.tf

locals {
  secret_name = "halalsphere/${var.environment}/secrets"

  # Montar JSON com todos os secrets
  secrets_json = jsonencode({
    SQL_HALALSPHERE_CONNECTION       = var.database_url
    REDIS_URL                        = var.redis_url
    JWT_PUBLIC_KEY_HALALSPHERE_API   = var.jwt_public_key
    JWT_PRIVATE_KEY_HALALSPHERE_API  = var.jwt_private_key
    JWT_EXPIRES_IN                   = var.jwt_expires_in
    SMTP_USER                        = var.smtp_user
    SMTP_PASSWORD                    = var.smtp_password
  })
}

# Nota: JWT keys devem ser fornecidas externamente (par de chaves RSA)
# Não geramos automaticamente pois é um par público/privado

# Secret principal
resource "aws_secretsmanager_secret" "app_secrets" {
  name        = local.secret_name
  description = "HalalSphere ${var.environment} application secrets"

  recovery_window_in_days = var.recovery_window_in_days

  tags = merge(
    var.tags,
    {
      Name        = local.secret_name
      Environment = var.environment
      ManagedBy   = "Terraform"
      Application = "HalalSphere"
    }
  )
}

# Versão do secret com valores
resource "aws_secretsmanager_secret_version" "app_secrets_version" {
  secret_id     = aws_secretsmanager_secret.app_secrets.id
  secret_string = local.secrets_json
}

# Rotação automática (opcional)
resource "aws_secretsmanager_secret_rotation" "app_secrets_rotation" {
  count = var.enable_rotation ? 1 : 0

  secret_id           = aws_secretsmanager_secret.app_secrets.id
  rotation_lambda_arn = var.rotation_lambda_arn

  rotation_rules {
    automatically_after_days = var.rotation_days
  }
}

# Outputs
output "secret_arn" {
  description = "ARN do secret"
  value       = aws_secretsmanager_secret.app_secrets.arn
}

output "secret_name" {
  description = "Nome do secret"
  value       = local.secret_name
}

# Output removido - JWT keys são sempre fornecidas externamente
```

### modules/secrets-manager/variables.tf

```hcl
variable "environment" {
  description = "Environment (production, staging)"
  type        = string
}

variable "database_url" {
  description = "PostgreSQL connection string"
  type        = string
  sensitive   = true
}

variable "redis_url" {
  description = "Redis connection string"
  type        = string
  sensitive   = true
  default     = ""
}

variable "jwt_public_key" {
  description = "JWT public key (RSA)"
  type        = string
  sensitive   = true
}

variable "jwt_private_key" {
  description = "JWT private key (RSA)"
  type        = string
  sensitive   = true
}

variable "jwt_expires_in" {
  description = "JWT expiration time"
  type        = string
  default     = "7d"
}

# AWS credentials removidas - ECS usa IAM Roles

variable "smtp_user" {
  description = "SMTP user"
  type        = string
  sensitive   = true
}

variable "smtp_password" {
  description = "SMTP password"
  type        = string
  sensitive   = true
}

variable "recovery_window_in_days" {
  description = "Recovery window for deleted secrets"
  type        = number
  default     = 30
}

variable "enable_rotation" {
  description = "Enable automatic rotation"
  type        = bool
  default     = false
}

variable "rotation_lambda_arn" {
  description = "Lambda ARN for rotation (required if enable_rotation = true)"
  type        = string
  default     = ""
}

variable "rotation_days" {
  description = "Rotation period in days"
  type        = number
  default     = 30
}

variable "tags" {
  description = "Additional tags"
  type        = map(string)
  default     = {}
}
```

## 🔑 IAM ECS Task Role Module

### modules/iam-ecs-task/main.tf

```hcl
# modules/iam-ecs-task/main.tf

# Trust policy para ECS Task
data "aws_iam_policy_document" "ecs_task_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

# IAM Role para ECS Task
resource "aws_iam_role" "ecs_task_role" {
  name               = "${var.app_name}-${var.environment}-ecs-task-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_assume_role.json

  tags = merge(
    var.tags,
    {
      Name        = "${var.app_name}-${var.environment}-ecs-task-role"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  )
}

# Policy document para acessar Parameter Store
data "aws_iam_policy_document" "parameter_store_access" {
  statement {
    sid    = "ParameterStoreAccess"
    effect = "Allow"

    actions = [
      "ssm:GetParameter",
      "ssm:GetParameters",
      "ssm:GetParametersByPath"
    ]

    resources = [
      "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter${var.parameter_store_base_path}/*"
    ]
  }
}

# Policy document para acessar Secrets Manager
data "aws_iam_policy_document" "secrets_manager_access" {
  statement {
    sid    = "SecretsManagerAccess"
    effect = "Allow"

    actions = [
      "secretsmanager:GetSecretValue",
      "secretsmanager:DescribeSecret"
    ]

    resources = [
      var.secret_arn
    ]
  }
}

# Policy document para KMS (descriptografia de secrets)
data "aws_iam_policy_document" "kms_access" {
  count = var.kms_key_arn != "" ? 1 : 0

  statement {
    sid    = "KMSDecrypt"
    effect = "Allow"

    actions = [
      "kms:Decrypt",
      "kms:DescribeKey"
    ]

    resources = [var.kms_key_arn]
  }
}

# Policy para S3 (upload de arquivos)
data "aws_iam_policy_document" "s3_access" {
  statement {
    sid    = "S3BucketAccess"
    effect = "Allow"

    actions = [
      "s3:PutObject",
      "s3:GetObject",
      "s3:DeleteObject",
      "s3:ListBucket"
    ]

    resources = concat(
      [for bucket in var.s3_bucket_arns : bucket],
      [for bucket in var.s3_bucket_arns : "${bucket}/*"]
    )
  }
}

# Combinar todas as policies
data "aws_iam_policy_document" "combined" {
  source_policy_documents = concat(
    [
      data.aws_iam_policy_document.parameter_store_access.json,
      data.aws_iam_policy_document.secrets_manager_access.json,
      data.aws_iam_policy_document.s3_access.json
    ],
    var.kms_key_arn != "" ? [data.aws_iam_policy_document.kms_access[0].json] : []
  )
}

# Criar policy
resource "aws_iam_policy" "ecs_task_policy" {
  name        = "${var.app_name}-${var.environment}-ecs-task-policy"
  description = "Policy for ${var.app_name} ECS Task in ${var.environment}"
  policy      = data.aws_iam_policy_document.combined.json

  tags = merge(
    var.tags,
    {
      Name        = "${var.app_name}-${var.environment}-ecs-task-policy"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  )
}

# Attach policy ao role
resource "aws_iam_role_policy_attachment" "ecs_task_policy_attachment" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = aws_iam_policy.ecs_task_policy.arn
}

# Data source para account ID
data "aws_caller_identity" "current" {}

# Outputs
output "role_arn" {
  description = "ARN do ECS Task Role"
  value       = aws_iam_role.ecs_task_role.arn
}

output "role_name" {
  description = "Nome do ECS Task Role"
  value       = aws_iam_role.ecs_task_role.name
}

output "policy_arn" {
  description = "ARN da policy"
  value       = aws_iam_policy.ecs_task_policy.arn
}
```

### modules/iam-ecs-task/variables.tf

```hcl
variable "app_name" {
  description = "Application name"
  type        = string
  default     = "halalsphere"
}

variable "environment" {
  description = "Environment (production, staging)"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "parameter_store_base_path" {
  description = "Base path for Parameter Store (e.g., /halalsphere/production/config)"
  type        = string
}

variable "secret_arn" {
  description = "ARN do Secrets Manager secret"
  type        = string
}

variable "kms_key_arn" {
  description = "ARN da KMS key (opcional)"
  type        = string
  default     = ""
}

variable "s3_bucket_arns" {
  description = "Lista de ARNs dos S3 buckets"
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "Additional tags"
  type        = map(string)
  default     = {}
}
```

## 🚀 Exemplo de Uso - Production

### environments/production/main.tf

```hcl
terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "HalalSphere"
      Environment = "production"
      ManagedBy   = "Terraform"
    }
  }
}

locals {
  environment = "production"
  app_name    = "halalsphere"
}

# Parameter Store
module "parameter_store" {
  source = "../../modules/parameter-store"

  environment                = local.environment
  cors_origin                = var.cors_origin
  frontend_url               = var.frontend_url
  base_url                   = var.base_url
  smtp_host                  = var.smtp_host
  smtp_port                  = var.smtp_port
  smtp_from_email            = var.smtp_from_email
  smtp_from_name             = var.smtp_from_name
  require_email_verification = var.require_email_verification
  aws_region                 = var.aws_region
}

# Secrets Manager
module "secrets_manager" {
  source = "../../modules/secrets-manager"

  environment            = local.environment
  database_url           = var.database_url
  redis_url              = var.redis_url
  jwt_public_key         = var.jwt_public_key
  jwt_private_key        = var.jwt_private_key
  jwt_expires_in         = "7d"
  smtp_user              = var.smtp_user
  smtp_password          = var.smtp_password

  enable_rotation = false  # Habilitar quando tiver Lambda de rotação
}

# IAM Role para ECS Task
module "iam_ecs_task" {
  source = "../../modules/iam-ecs-task"

  app_name                  = local.app_name
  environment               = local.environment
  aws_region                = var.aws_region
  parameter_store_base_path = module.parameter_store.base_path
  secret_arn                = module.secrets_manager.secret_arn
  s3_bucket_arns            = var.s3_bucket_arns

  # KMS key se necessário
  # kms_key_arn = aws_kms_key.secrets.arn
}

# Outputs
output "parameter_store_path" {
  value = module.parameter_store.base_path
}

output "secret_name" {
  value = module.secrets_manager.secret_name
}

output "ecs_task_role_arn" {
  value = module.iam_ecs_task.role_arn
}
```

### environments/production/terraform.tfvars

```hcl
aws_region = "us-east-1"

# Parameter Store (não sensível)
cors_origin                = "https://app.halalsphere.com"
frontend_url               = "https://app.halalsphere.com"
base_url                   = "https://api.halalsphere.com"
smtp_host                  = "smtp.gmail.com"
smtp_port                  = 587
smtp_from_email            = "noreply@halalsphere.com"
smtp_from_name             = "HalalSphere"
require_email_verification = true

# Secrets Manager (sensível - não commitar)
# Use terraform.tfvars.secret ou variáveis de ambiente
# database_url          = "postgresql://..."
# redis_url             = "redis://..."
# jwt_public_key        = "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
# jwt_private_key       = "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
# smtp_user             = "user@domain.com"
# smtp_password         = "password"

# S3 Buckets
s3_bucket_arns = [
  "arn:aws:s3:::halalsphere-uploads-production",
  "arn:aws:s3:::halalsphere-documents-production"
]
```

### environments/production/variables.tf

```hcl
variable "aws_region" {
  description = "AWS region"
  type        = string
}

# Parameter Store variables
variable "cors_origin" {
  type = string
}

variable "frontend_url" {
  type = string
}

variable "base_url" {
  type = string
}

variable "smtp_host" {
  type = string
}

variable "smtp_port" {
  type = number
}

variable "smtp_from_email" {
  type = string
}

variable "smtp_from_name" {
  type = string
}

variable "require_email_verification" {
  type = bool
}

# Secrets Manager variables
variable "database_url" {
  type      = string
  sensitive = true
}

variable "redis_url" {
  type      = string
  sensitive = true
  default   = ""
}

variable "jwt_public_key" {
  type      = string
  sensitive = true
}

variable "jwt_private_key" {
  type      = string
  sensitive = true
}

variable "smtp_user" {
  type      = string
  sensitive = true
}

variable "smtp_password" {
  type      = string
  sensitive = true
}

variable "s3_bucket_arns" {
  type    = list(string)
  default = []
}
```

## 🔒 Secrets Seguras

### Opção 1: Arquivo .tfvars.secret (gitignored)

```hcl
# terraform.tfvars.secret (adicionar ao .gitignore)
database_url          = "postgresql://admin:PASSWORD@rds-prod.amazonaws.com:5432/halalsphere"
redis_url             = "redis://:PASSWORD@elasticache-prod.amazonaws.com:6379"
jwt_public_key        = "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
jwt_private_key       = "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
smtp_user             = "noreply@halalsphere.com"
smtp_password         = "app-password-here"
```

### Opção 2: Variáveis de Ambiente

```bash
export TF_VAR_database_url="postgresql://..."
export TF_VAR_redis_url="redis://..."
export TF_VAR_jwt_public_key="$(cat jwt-public.pem)"
export TF_VAR_jwt_private_key="$(cat jwt-private.pem)"
export TF_VAR_smtp_user="user@domain.com"
export TF_VAR_smtp_password="password"
```

### Opção 3: AWS Secrets Manager (Bootstrap)

Use secrets existentes como fonte:

```hcl
data "aws_secretsmanager_secret_version" "bootstrap" {
  secret_id = "halalsphere/terraform/bootstrap"
}

locals {
  bootstrap_secrets = jsondecode(data.aws_secretsmanager_secret_version.bootstrap.secret_string)
}

module "secrets_manager" {
  # ...
  database_url = local.bootstrap_secrets.database_url
  # ...
}
```

## 📋 Aplicar Terraform

```bash
cd terraform/environments/production

# Inicializar
terraform init

# Planejar
terraform plan -var-file="terraform.tfvars" -var-file="terraform.tfvars.secret"

# Aplicar
terraform apply -var-file="terraform.tfvars" -var-file="terraform.tfvars.secret"

# Ver outputs
terraform output
```

## ✅ Validação

Após aplicar o Terraform, validar:

```bash
# Ver parâmetros criados
aws ssm get-parameters-by-path \
  --path /halalsphere/production/config \
  --recursive

# Ver secret criado
aws secretsmanager describe-secret \
  --secret-id halalsphere/production/secrets

# Testar acesso (não mostra valor, só valida permissões)
aws secretsmanager get-secret-value \
  --secret-id halalsphere/production/secrets \
  --query 'SecretString' \
  --output text | jq .
```

## 🎯 Próximos Passos

1. ✅ Aplicar Terraform para criar Parameter Store + Secrets Manager
2. ✅ Verificar IAM permissions do ECS Task Role
3. ✅ Deploy da aplicação no ECS
4. ✅ Testar que configs são carregadas corretamente
5. ⚠️  Configurar rotação automática de secrets (opcional)
6. ⚠️  Configurar CloudWatch alarms para acessos

## 📚 Referências

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Parameter Store Terraform](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter)
- [AWS Secrets Manager Terraform](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/secretsmanager_secret)
- [AWS IAM Role Terraform](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role)
