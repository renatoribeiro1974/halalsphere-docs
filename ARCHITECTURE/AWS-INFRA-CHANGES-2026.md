# AWS Infrastructure Changes - Janeiro 2026

**Data:** 2026-01-14
**Status:** ✅ Documentado

## 📋 Sumário das Mudanças

Ajustes solicitados pela equipe de infraestrutura para adequação à arquitetura AWS ECS:

### 1. Renomeação de Secret: DATABASE_URL → SQL_HALALSPHERE_CONNECTION

**Antes:**
```json
{
  "DATABASE_URL": "postgresql://..."
}
```

**Depois:**
```json
{
  "SQL_HALALSPHERE_CONNECTION": "postgresql://..."
}
```

**Motivo:** Padronização de nomenclatura de secrets para toda a organização.

---

### 2. JWT: Migração de Secret Simétrico para Par de Chaves Assimétricas

**Antes:**
```json
{
  "JWT_SECRET": "symmetric-secret-key"
}
```

**Depois:**
```json
{
  "JWT_PUBLIC_KEY_HALALSPHERE_API": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----",
  "JWT_PRIVATE_KEY_HALALSPHERE_API": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
}
```

**Motivo:** Segurança aprimorada usando criptografia assimétrica (RSA 2048+).

**Vantagens:**
- ✅ Maior segurança (chave privada nunca sai do servidor)
- ✅ Possibilidade de distribuir chave pública para validação
- ✅ Compliance com padrões de segurança modernos
- ✅ Facilita rotação de chaves

**Geração de Chaves:**
```bash
# Gerar par de chaves RSA 2048
ssh-keygen -t rsa -b 2048 -m PEM -f jwt-key
# Gera: jwt-key (privada) e jwt-key.pub (pública)

# Ou usando OpenSSL
openssl genrsa -out jwt-private.pem 2048
openssl rsa -in jwt-private.pem -pubout -out jwt-public.pem
```

---

### 3. Remoção de Credenciais AWS (AWS_ACCESS_KEY_ID e AWS_SECRET_ACCESS_KEY)

**Antes:**
```json
{
  "AWS_ACCESS_KEY_ID": "AKIAXXXXXXXXXXXXXXXX",
  "AWS_SECRET_ACCESS_KEY": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

**Depois:**
```json
{
  // Credenciais AWS removidas
}
```

**Motivo:** Na arquitetura ECS, o container recebe permissões através de **IAM Roles** (ECS Task Role), eliminando a necessidade de credenciais estáticas.

**Benefícios:**
- ✅ Segurança aprimorada (sem credenciais hardcoded)
- ✅ Rotação automática de credenciais
- ✅ Auditoria via CloudTrail
- ✅ Princípio de menor privilégio (least privilege)
- ✅ Sem risco de vazamento de credenciais

---

## 🔐 Nova Estrutura de Secrets Manager

### Secret: `halalsphere/{environment}/secrets`

```json
{
  "SQL_HALALSPHERE_CONNECTION": "postgresql://admin:PASSWORD@rds.amazonaws.com:5432/halalsphere",
  "REDIS_URL": "redis://:PASSWORD@elasticache.amazonaws.com:6379",
  "JWT_PUBLIC_KEY_HALALSPHERE_API": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----",
  "JWT_PRIVATE_KEY_HALALSPHERE_API": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----",
  "JWT_EXPIRES_IN": "7d",
  "SMTP_USER": "noreply@halalsphere.com",
  "SMTP_PASSWORD": "smtp-app-password"
}
```

---

## 🏗️ IAM Roles - ECS Task Role

### Permissões Necessárias

O ECS Task Role precisa ter permissões para:

1. **AWS Secrets Manager** (ler secrets)
2. **AWS Parameter Store** (ler parâmetros de configuração)
3. **Amazon S3** (upload/download de arquivos)
4. **AWS KMS** (descriptografar secrets)

### Exemplo de Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ParameterStoreAccess",
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
      "Sid": "SecretsManagerAccess",
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": [
        "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:halalsphere/production/secrets-*"
      ]
    },
    {
      "Sid": "KMSDecrypt",
      "Effect": "Allow",
      "Action": [
        "kms:Decrypt"
      ],
      "Resource": [
        "arn:aws:kms:us-east-1:ACCOUNT_ID:key/KEY_ID"
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
        "arn:aws:s3:::halalsphere-uploads-production",
        "arn:aws:s3:::halalsphere-uploads-production/*"
      ]
    }
  ]
}
```

---

## 📦 ECS Task Definition

### Environment Variables (apenas não-sensíveis)

```json
{
  "containerDefinitions": [
    {
      "name": "halalsphere-backend",
      "environment": [
        { "name": "NODE_ENV", "value": "production" },
        { "name": "AWS_REGION", "value": "us-east-1" },
        { "name": "PORT", "value": "3333" },
        { "name": "TRUST_PROXY", "value": "true" }
      ]
    }
  ],
  "taskRoleArn": "arn:aws:iam::ACCOUNT_ID:role/halalsphere-ecs-task-role"
}
```

**Importante:**
- ❌ NÃO passar secrets via `environment`
- ✅ Secrets são carregados automaticamente via ConfigLoader do AWS Secrets Manager

---

## 🔄 Migração - Checklist

### Para Desenvolvedores

- [ ] Atualizar `.env` local:
  - [ ] `DATABASE_URL` → `SQL_HALALSPHERE_CONNECTION`
  - [ ] `JWT_SECRET` → `JWT_PUBLIC_KEY_HALALSPHERE_API` + `JWT_PRIVATE_KEY_HALALSPHERE_API`
  - [ ] Remover `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY` (se em dev local, usar outro mecanismo)

- [ ] Gerar par de chaves JWT RSA 2048
- [ ] Atualizar código que acessa secrets:
  - [ ] Buscar por `process.env.DATABASE_URL` → trocar para `process.env.SQL_HALALSPHERE_CONNECTION`
  - [ ] Buscar por `process.env.JWT_SECRET` → implementar lógica de JWT assimétrico
  - [ ] Remover código que usa `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`

### Para Infra/DevOps

- [ ] Criar/Atualizar secrets no AWS Secrets Manager:
  ```bash
  aws secretsmanager update-secret \
    --secret-id halalsphere/production/secrets \
    --secret-string '{
      "SQL_HALALSPHERE_CONNECTION": "postgresql://...",
      "REDIS_URL": "redis://...",
      "JWT_PUBLIC_KEY_HALALSPHERE_API": "...",
      "JWT_PRIVATE_KEY_HALALSPHERE_API": "...",
      "JWT_EXPIRES_IN": "7d",
      "SMTP_USER": "...",
      "SMTP_PASSWORD": "..."
    }'
  ```

- [ ] Configurar ECS Task Role com permissões corretas
- [ ] Atualizar Task Definition (remover env vars sensíveis)
- [ ] Validar que application consegue ler secrets via IAM Role
- [ ] Configurar rotação de secrets (opcional)

---

## 🧪 Validação Pós-Deploy

### 1. Verificar que secrets são carregados corretamente

```bash
# Acessar container ECS
aws ecs execute-command \
  --cluster halalsphere-production \
  --task TASK_ID \
  --container halalsphere-backend \
  --interactive \
  --command "/bin/sh"

# Dentro do container (NÃO expor valores reais)
echo $NODE_ENV
# Verificar logs de inicialização do ConfigLoader
```

### 2. Verificar IAM Role

```bash
# No container, verificar role assumido
curl http://169.254.170.2$AWS_CONTAINER_CREDENTIALS_RELATIVE_URI

# Deve retornar credenciais temporárias do role
```

### 3. Testar acesso ao S3

```bash
# Upload de teste (via SDK na aplicação)
# Não deve retornar erros de permissão
```

---

## 📚 Documentos Atualizados

- ✅ [AWS-CONFIG-MANAGEMENT.md](./AWS-CONFIG-MANAGEMENT.md)
- ✅ [TERRAFORM-CONFIG-INTEGRATION.md](./TERRAFORM-CONFIG-INTEGRATION.md)
- ✅ [SPRINT1-CONFIG-MANAGEMENT-UPDATE.md](../IMPLEMENTATION-HISTORY/SPRINT1-CONFIG-MANAGEMENT-UPDATE.md)
- ✅ [SETUP.md](../GUIDES/SETUP.md)
- ✅ [MULTI-REPO-DEVELOPMENT-GUIDE.md](../GUIDES/MULTI-REPO-DEVELOPMENT-GUIDE.md)
- ✅ [05-security.md](../02-technical/05-security.md)
- ✅ [FICHA-TECNICA-PROJETO.md](../FICHA-TECNICA-PROJETO.md)

---

## ⚠️ Breaking Changes

### Para Backend

**CRITICAL:** Estas mudanças são **breaking changes** e requerem:

1. **Atualização do ConfigLoader Service** para mapear novos nomes de secrets
2. **Atualização do código de JWT** para usar criptografia assimétrica
3. **Atualização do StorageManager** para remover referências a credenciais AWS
4. **Rebuild e redeploy** da aplicação

### Exemplo de Atualização - ConfigLoader

```typescript
// backend/src/services/aws/config-loader.service.ts

// ANTES
const dbUrl = secrets.DATABASE_URL;
const jwtSecret = secrets.JWT_SECRET;
const awsKeyId = secrets.AWS_ACCESS_KEY_ID;

// DEPOIS
const dbUrl = secrets.SQL_HALALSPHERE_CONNECTION;
const jwtPublicKey = secrets.JWT_PUBLIC_KEY_HALALSPHERE_API;
const jwtPrivateKey = secrets.JWT_PRIVATE_KEY_HALALSPHERE_API;
// awsKeyId não é mais necessário - usar IAM Role
```

### Exemplo de Atualização - JWT Service

```typescript
// backend/src/services/auth/jwt.service.ts

import jwt from 'jsonwebtoken';

// ANTES (simétrico)
const token = jwt.sign(payload, process.env.JWT_SECRET, {
  expiresIn: '7d'
});

// DEPOIS (assimétrico)
const token = jwt.sign(payload, process.env.JWT_PRIVATE_KEY_HALALSPHERE_API, {
  algorithm: 'RS256',
  expiresIn: '7d'
});

// Verificação
const decoded = jwt.verify(token, process.env.JWT_PUBLIC_KEY_HALALSPHERE_API, {
  algorithms: ['RS256']
});
```

---

## 🔗 Referências

- [AWS ECS Task IAM Roles](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-iam-roles.html)
- [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html)
- [JWT com RS256](https://jwt.io/introduction)
- [OpenSSL Key Generation](https://www.openssl.org/docs/man1.1.1/man1/genrsa.html)

---

**Status:** ✅ Documentação completa e atualizada
**Próximos Passos:** Implementar mudanças no código backend (halalsphere-backend repo)
