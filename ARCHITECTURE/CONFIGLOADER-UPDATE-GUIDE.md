# ConfigLoader Service - Update Guide

**Data:** 2026-01-14
**Status:** 📋 Guia de Implementação

## 📋 Objetivo

Atualizar o `ConfigLoader` service do backend para refletir as mudanças de infraestrutura:

1. `DATABASE_URL` → `SQL_HALALSPHERE_CONNECTION`
2. `JWT_SECRET` → `JWT_PUBLIC_KEY_HALALSPHERE_API` + `JWT_PRIVATE_KEY_HALALSPHERE_API`
3. Remover `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY` (ECS usa IAM Roles)

---

## 🔧 Arquivo: `backend/src/services/aws/config-loader.service.ts`

### Mudanças no Mapeamento de Secrets

#### ANTES

```typescript
interface SecretsFromAWS {
  DATABASE_URL: string;
  REDIS_URL?: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN?: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  SMTP_USER?: string;
  SMTP_PASSWORD?: string;
}

interface AppConfig {
  // Database
  databaseUrl: string;

  // Redis
  redisUrl?: string;

  // JWT
  jwtSecret: string;
  jwtExpiresIn: string;

  // AWS
  awsRegion: string;
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;

  // SMTP
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpFromEmail?: string;
  smtpFromName?: string;

  // CORS
  corsOrigin?: string;
  frontendUrl?: string;
  baseUrl?: string;

  // Feature Flags
  requireEmailVerification?: boolean;
}
```

#### DEPOIS

```typescript
interface SecretsFromAWS {
  SQL_HALALSPHERE_CONNECTION: string;
  REDIS_URL?: string;
  JWT_PUBLIC_KEY_HALALSPHERE_API: string;
  JWT_PRIVATE_KEY_HALALSPHERE_API: string;
  JWT_EXPIRES_IN?: string;
  // AWS_ACCESS_KEY_ID e AWS_SECRET_ACCESS_KEY removidos
  SMTP_USER?: string;
  SMTP_PASSWORD?: string;
}

interface AppConfig {
  // Database
  databaseUrl: string; // Internamente ainda pode usar este nome

  // Redis
  redisUrl?: string;

  // JWT (agora com par de chaves assimétricas)
  jwtPublicKey: string;
  jwtPrivateKey: string;
  jwtExpiresIn: string;

  // AWS
  awsRegion: string;
  // awsAccessKeyId e awsSecretAccessKey removidos

  // SMTP
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpFromEmail?: string;
  smtpFromName?: string;

  // CORS
  corsOrigin?: string;
  frontendUrl?: string;
  baseUrl?: string;

  // Feature Flags
  requireEmailVerification?: boolean;
}
```

---

## 📝 Implementação Completa Atualizada

### Parte 1: Interfaces e Tipos

```typescript
// backend/src/services/aws/config-loader.service.ts

import {
  SecretsManagerClient,
  GetSecretValueCommand
} from '@aws-sdk/client-secrets-manager';
import {
  SSMClient,
  GetParametersByPathCommand
} from '@aws-sdk/client-ssm';

/**
 * Secrets carregados do AWS Secrets Manager
 * Usa os novos nomes de acordo com o padrão de infra
 */
interface SecretsFromAWS {
  SQL_HALALSPHERE_CONNECTION: string;
  REDIS_URL?: string;
  JWT_PUBLIC_KEY_HALALSPHERE_API: string;
  JWT_PRIVATE_KEY_HALALSPHERE_API: string;
  JWT_EXPIRES_IN?: string;
  SMTP_USER?: string;
  SMTP_PASSWORD?: string;
}

/**
 * Configurações da aplicação
 * Interface interna - pode manter nomes mais amigáveis
 */
interface AppConfig {
  // Database
  databaseUrl: string;

  // Redis
  redisUrl?: string;

  // JWT (chaves assimétricas RSA)
  jwtPublicKey: string;
  jwtPrivateKey: string;
  jwtExpiresIn: string;

  // AWS
  awsRegion: string;

  // SMTP
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpFromEmail?: string;
  smtpFromName?: string;

  // CORS
  corsOrigin?: string;
  frontendUrl?: string;
  baseUrl?: string;

  // Feature Flags
  requireEmailVerification?: boolean;
}
```

### Parte 2: ConfigLoader Class

```typescript
class ConfigLoader {
  private config: AppConfig | null = null;
  private initialized = false;

  constructor() {}

  /**
   * Inicializa o ConfigLoader
   * - Development: usa variáveis de ambiente locais (.env)
   * - Staging/Production: carrega do AWS (Parameter Store + Secrets Manager)
   */
  async initialize(): Promise<void> {
    const nodeEnv = process.env.NODE_ENV || 'development';

    console.log(`[ConfigLoader] Initializing for environment: ${nodeEnv}`);

    if (nodeEnv === 'development') {
      // Desenvolvimento: usar variáveis de ambiente locais
      this.loadFromEnvironment();
    } else {
      // Staging/Production: carregar do AWS
      await this.loadFromAWS();
    }

    this.initialized = true;
    console.log('[ConfigLoader] Initialization complete');
  }

  /**
   * Carrega configurações de variáveis de ambiente locais
   * Usado em desenvolvimento
   */
  private loadFromEnvironment(): void {
    console.log('[ConfigLoader] Loading from environment variables');

    this.config = {
      // Database
      databaseUrl: process.env.SQL_HALALSPHERE_CONNECTION ||
                   process.env.DATABASE_URL || // Fallback para compatibilidade
                   '',

      // Redis
      redisUrl: process.env.REDIS_URL,

      // JWT (suporte a ambos os formatos)
      jwtPublicKey: process.env.JWT_PUBLIC_KEY_HALALSPHERE_API ||
                    process.env.JWT_PUBLIC_KEY ||
                    '',
      jwtPrivateKey: process.env.JWT_PRIVATE_KEY_HALALSPHERE_API ||
                     process.env.JWT_PRIVATE_KEY ||
                     '',
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

      // AWS
      awsRegion: process.env.AWS_REGION || 'us-east-1',

      // SMTP
      smtpHost: process.env.SMTP_HOST,
      smtpPort: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined,
      smtpUser: process.env.SMTP_USER,
      smtpPassword: process.env.SMTP_PASSWORD,
      smtpFromEmail: process.env.SMTP_FROM_EMAIL,
      smtpFromName: process.env.SMTP_FROM_NAME,

      // CORS
      corsOrigin: process.env.CORS_ORIGIN,
      frontendUrl: process.env.FRONTEND_URL,
      baseUrl: process.env.BASE_URL,

      // Feature Flags
      requireEmailVerification: process.env.REQUIRE_EMAIL_VERIFICATION === 'true',
    };

    // Validação básica
    if (!this.config.databaseUrl) {
      throw new Error('SQL_HALALSPHERE_CONNECTION or DATABASE_URL is required');
    }

    if (!this.config.jwtPublicKey || !this.config.jwtPrivateKey) {
      console.warn('[ConfigLoader] JWT keys not found in environment');
    }
  }

  /**
   * Carrega configurações do AWS
   * - Parameter Store: configs não sensíveis
   * - Secrets Manager: credenciais e dados sensíveis
   */
  private async loadFromAWS(): Promise<void> {
    console.log('[ConfigLoader] Loading from AWS');

    const nodeEnv = process.env.NODE_ENV || 'production';
    const region = process.env.AWS_REGION || 'us-east-1';

    try {
      // 1. Carregar parâmetros do Parameter Store
      const parameters = await this.loadParameterStore(nodeEnv, region);

      // 2. Carregar secrets do Secrets Manager
      const secrets = await this.loadSecretsManager(nodeEnv, region);

      // 3. Combinar configs
      this.config = {
        // Database (do Secrets Manager)
        databaseUrl: secrets.SQL_HALALSPHERE_CONNECTION,

        // Redis (do Secrets Manager)
        redisUrl: secrets.REDIS_URL,

        // JWT (do Secrets Manager - chaves RSA)
        jwtPublicKey: secrets.JWT_PUBLIC_KEY_HALALSPHERE_API,
        jwtPrivateKey: secrets.JWT_PRIVATE_KEY_HALALSPHERE_API,
        jwtExpiresIn: secrets.JWT_EXPIRES_IN || '7d',

        // AWS (do Parameter Store)
        awsRegion: parameters.aws_region || region,

        // SMTP (combinado)
        smtpHost: parameters.smtp_host,
        smtpPort: parameters.smtp_port ? parseInt(parameters.smtp_port) : undefined,
        smtpUser: secrets.SMTP_USER,
        smtpPassword: secrets.SMTP_PASSWORD,
        smtpFromEmail: parameters.smtp_from_email,
        smtpFromName: parameters.smtp_from_name,

        // CORS (do Parameter Store)
        corsOrigin: parameters.cors_origin,
        frontendUrl: parameters.frontend_url,
        baseUrl: parameters.base_url,

        // Feature Flags (do Parameter Store)
        requireEmailVerification: parameters.require_email_verification === 'true',
      };

      console.log('[ConfigLoader] Successfully loaded from AWS');
    } catch (error) {
      console.error('[ConfigLoader] Failed to load from AWS:', error);

      // Fallback para variáveis de ambiente
      console.log('[ConfigLoader] Falling back to environment variables');
      this.loadFromEnvironment();
    }
  }

  /**
   * Carrega parâmetros do AWS Parameter Store
   */
  private async loadParameterStore(
    environment: string,
    region: string
  ): Promise<Record<string, string>> {
    const client = new SSMClient({ region });
    const basePath = `/halalsphere/${environment}/config`;

    console.log(`[ConfigLoader] Loading Parameter Store from: ${basePath}`);

    try {
      const command = new GetParametersByPathCommand({
        Path: basePath,
        Recursive: true,
        WithDecryption: false, // Parâmetros não são criptografados
      });

      const response = await client.send(command);
      const parameters: Record<string, string> = {};

      if (response.Parameters) {
        for (const param of response.Parameters) {
          if (param.Name && param.Value) {
            // Extrair nome do parâmetro (sem o path)
            const key = param.Name.replace(`${basePath}/`, '');
            parameters[key] = param.Value;
          }
        }
      }

      console.log(`[ConfigLoader] Loaded ${Object.keys(parameters).length} parameters from Parameter Store`);
      return parameters;
    } catch (error) {
      console.error('[ConfigLoader] Error loading Parameter Store:', error);
      throw error;
    }
  }

  /**
   * Carrega secrets do AWS Secrets Manager
   */
  private async loadSecretsManager(
    environment: string,
    region: string
  ): Promise<SecretsFromAWS> {
    const client = new SecretsManagerClient({ region });
    const secretName = `halalsphere/${environment}/secrets`;

    console.log(`[ConfigLoader] Loading Secrets Manager: ${secretName}`);

    try {
      const command = new GetSecretValueCommand({
        SecretId: secretName,
      });

      const response = await client.send(command);

      if (!response.SecretString) {
        throw new Error('Secret string is empty');
      }

      const secrets = JSON.parse(response.SecretString) as SecretsFromAWS;

      // Validar secrets obrigatórios
      if (!secrets.SQL_HALALSPHERE_CONNECTION) {
        throw new Error('SQL_HALALSPHERE_CONNECTION is required in secrets');
      }

      if (!secrets.JWT_PUBLIC_KEY_HALALSPHERE_API || !secrets.JWT_PRIVATE_KEY_HALALSPHERE_API) {
        throw new Error('JWT keys are required in secrets');
      }

      console.log('[ConfigLoader] Successfully loaded secrets from Secrets Manager');
      return secrets;
    } catch (error) {
      console.error('[ConfigLoader] Error loading Secrets Manager:', error);
      throw error;
    }
  }

  /**
   * Aplica configurações ao process.env para compatibilidade
   * com código legado que ainda usa process.env diretamente
   */
  applyToEnvironment(): void {
    if (!this.config) {
      throw new Error('ConfigLoader not initialized');
    }

    console.log('[ConfigLoader] Applying config to process.env');

    // Database
    process.env.DATABASE_URL = this.config.databaseUrl;
    process.env.SQL_HALALSPHERE_CONNECTION = this.config.databaseUrl;

    // Redis
    if (this.config.redisUrl) {
      process.env.REDIS_URL = this.config.redisUrl;
    }

    // JWT
    process.env.JWT_PUBLIC_KEY = this.config.jwtPublicKey;
    process.env.JWT_PRIVATE_KEY = this.config.jwtPrivateKey;
    process.env.JWT_PUBLIC_KEY_HALALSPHERE_API = this.config.jwtPublicKey;
    process.env.JWT_PRIVATE_KEY_HALALSPHERE_API = this.config.jwtPrivateKey;
    process.env.JWT_EXPIRES_IN = this.config.jwtExpiresIn;

    // AWS
    process.env.AWS_REGION = this.config.awsRegion;
    // Não definir AWS_ACCESS_KEY_ID e AWS_SECRET_ACCESS_KEY
    // ECS Task Role fornece credenciais automaticamente

    // SMTP
    if (this.config.smtpHost) process.env.SMTP_HOST = this.config.smtpHost;
    if (this.config.smtpPort) process.env.SMTP_PORT = this.config.smtpPort.toString();
    if (this.config.smtpUser) process.env.SMTP_USER = this.config.smtpUser;
    if (this.config.smtpPassword) process.env.SMTP_PASSWORD = this.config.smtpPassword;
    if (this.config.smtpFromEmail) process.env.SMTP_FROM_EMAIL = this.config.smtpFromEmail;
    if (this.config.smtpFromName) process.env.SMTP_FROM_NAME = this.config.smtpFromName;

    // CORS
    if (this.config.corsOrigin) process.env.CORS_ORIGIN = this.config.corsOrigin;
    if (this.config.frontendUrl) process.env.FRONTEND_URL = this.config.frontendUrl;
    if (this.config.baseUrl) process.env.BASE_URL = this.config.baseUrl;

    // Feature Flags
    process.env.REQUIRE_EMAIL_VERIFICATION = this.config.requireEmailVerification?.toString();
  }

  /**
   * Obtém um valor de configuração específico
   */
  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    if (!this.initialized) {
      throw new Error('ConfigLoader not initialized. Call initialize() first.');
    }

    if (!this.config) {
      throw new Error('Config is null');
    }

    return this.config[key];
  }

  /**
   * Obtém todas as configurações
   */
  getAll(): Readonly<AppConfig> {
    if (!this.initialized) {
      throw new Error('ConfigLoader not initialized. Call initialize() first.');
    }

    if (!this.config) {
      throw new Error('Config is null');
    }

    return Object.freeze({ ...this.config });
  }

  /**
   * Verifica se o ConfigLoader foi inicializado
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Reset (útil para testes)
   */
  reset(): void {
    this.config = null;
    this.initialized = false;
  }
}

// Exportar instância singleton
export const configLoader = new ConfigLoader();
```

---

## 🔄 Atualização do JWT Service

O JWT service também precisa ser atualizado para usar chaves assimétricas (RS256) ao invés de simétricas (HS256).

### Arquivo: `backend/src/services/auth/jwt.service.ts`

#### ANTES (HS256 - Simétrico)

```typescript
import jwt from 'jsonwebtoken';

export class JWTService {
  private secret: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'fallback-secret';
  }

  sign(payload: object): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
  }

  verify(token: string): any {
    return jwt.verify(token, this.secret);
  }
}
```

#### DEPOIS (RS256 - Assimétrico)

```typescript
import jwt from 'jsonwebtoken';
import { configLoader } from '../aws/config-loader.service';

export class JWTService {
  private privateKey: string;
  private publicKey: string;
  private expiresIn: string;

  constructor() {
    // Garantir que ConfigLoader está inicializado
    if (!configLoader.isInitialized()) {
      throw new Error('ConfigLoader must be initialized before JWTService');
    }

    this.privateKey = configLoader.get('jwtPrivateKey');
    this.publicKey = configLoader.get('jwtPublicKey');
    this.expiresIn = configLoader.get('jwtExpiresIn');

    if (!this.privateKey || !this.publicKey) {
      throw new Error('JWT keys are required');
    }

    console.log('[JWTService] Initialized with RS256 asymmetric keys');
  }

  /**
   * Assina um JWT usando a chave privada RSA
   */
  sign(payload: object): string {
    return jwt.sign(payload, this.privateKey, {
      algorithm: 'RS256',
      expiresIn: this.expiresIn,
    });
  }

  /**
   * Verifica um JWT usando a chave pública RSA
   */
  verify(token: string): any {
    return jwt.verify(token, this.publicKey, {
      algorithms: ['RS256'],
    });
  }

  /**
   * Decodifica um JWT sem verificar a assinatura
   * Útil para debug
   */
  decode(token: string): any {
    return jwt.decode(token);
  }
}

export const jwtService = new JWTService();
```

---

## 🗑️ Atualização do Storage Manager

Remover referências a credenciais AWS (usa IAM Role automaticamente).

### Arquivo: `backend/src/services/storage/storage-manager.service.ts`

#### ANTES

```typescript
import { S3Client } from '@aws-sdk/client-s3';

export class StorageManager {
  private s3Client: S3Client;

  constructor() {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION || 'us-east-1';

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId: accessKeyId!,
        secretAccessKey: secretAccessKey!,
      },
    });
  }
}
```

#### DEPOIS

```typescript
import { S3Client } from '@aws-sdk/client-s3';
import { configLoader } from '../aws/config-loader.service';

export class StorageManager {
  private s3Client: S3Client;

  constructor() {
    // Garantir que ConfigLoader está inicializado
    if (!configLoader.isInitialized()) {
      throw new Error('ConfigLoader must be initialized before StorageManager');
    }

    const region = configLoader.get('awsRegion');

    // ECS Task Role fornece credenciais automaticamente
    // Não é necessário passar credentials explicitamente
    this.s3Client = new S3Client({
      region,
      // credentials são obtidas automaticamente do ECS Task Role
    });

    console.log(`[StorageManager] Initialized with region: ${region}`);
    console.log('[StorageManager] Using ECS Task Role for credentials');
  }

  // ... resto do código
}
```

---

## 🧪 Testes Locais

### 1. Criar arquivo `.env` de desenvolvimento

```bash
# backend/.env

NODE_ENV=development

# Database
SQL_HALALSPHERE_CONNECTION=postgresql://admin:secret123@localhost:5432/halalsphere

# Redis
REDIS_URL=redis://localhost:6379

# JWT (gerar chaves RSA para desenvolvimento)
JWT_PUBLIC_KEY_HALALSPHERE_API=-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END PUBLIC KEY-----
JWT_PRIVATE_KEY_HALALSPHERE_API=-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
-----END PRIVATE KEY-----
JWT_EXPIRES_IN=7d

# AWS
AWS_REGION=us-east-1

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=dev@halalsphere.com
SMTP_PASSWORD=dev-password
SMTP_FROM_EMAIL=noreply@halalsphere.com
SMTP_FROM_NAME=HalalSphere Dev

# CORS
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
BASE_URL=http://localhost:3333
```

### 2. Gerar chaves JWT RSA para desenvolvimento

```bash
# Gerar chave privada
openssl genrsa -out jwt-private.pem 2048

# Gerar chave pública a partir da privada
openssl rsa -in jwt-private.pem -pubout -out jwt-public.pem

# Ver conteúdo das chaves
cat jwt-private.pem
cat jwt-public.pem
```

### 3. Testar inicialização

```typescript
// backend/src/server.ts

import { configLoader } from './services/aws/config-loader.service';
import { jwtService } from './services/auth/jwt.service';

async function start() {
  try {
    // 1. Inicializar ConfigLoader PRIMEIRO
    console.log('Initializing ConfigLoader...');
    await configLoader.initialize();

    // 2. Aplicar configs ao process.env
    configLoader.applyToEnvironment();

    // 3. Verificar que configs foram carregadas
    console.log('Database URL:', configLoader.get('databaseUrl') ? '✓ Loaded' : '✗ Missing');
    console.log('JWT Keys:', configLoader.get('jwtPublicKey') ? '✓ Loaded' : '✗ Missing');

    // 4. Testar JWT Service
    const testPayload = { userId: '123', email: 'test@example.com' };
    const token = jwtService.sign(testPayload);
    const decoded = jwtService.verify(token);
    console.log('JWT Test:', decoded ? '✓ Success' : '✗ Failed');

    // 5. Inicializar servidor
    // ... resto do código

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
```

---

## ✅ Checklist de Implementação

### Backend Code

- [ ] Atualizar `config-loader.service.ts`:
  - [ ] Interface `SecretsFromAWS` com novos nomes
  - [ ] Interface `AppConfig` com `jwtPublicKey` e `jwtPrivateKey`
  - [ ] Método `loadFromEnvironment()` com fallback
  - [ ] Método `loadSecretsManager()` com validação de JWT keys
  - [ ] Método `applyToEnvironment()` sem AWS credentials
  - [ ] Remover referências a `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY`

- [ ] Atualizar `jwt.service.ts`:
  - [ ] Usar chaves assimétricas (RS256)
  - [ ] Usar `configLoader.get('jwtPublicKey')` e `configLoader.get('jwtPrivateKey')`
  - [ ] Atualizar métodos `sign()` e `verify()`

- [ ] Atualizar `storage-manager.service.ts`:
  - [ ] Remover credenciais AWS do construtor
  - [ ] Confiar no ECS Task Role

- [ ] Atualizar `server.ts`:
  - [ ] Garantir ordem de inicialização (ConfigLoader → Services → Server)
  - [ ] Adicionar validações

### Testes

- [ ] Testar em desenvolvimento local (.env)
- [ ] Testar JWT sign/verify com chaves RSA
- [ ] Testar S3 upload sem credenciais explícitas (com AWS CLI configurado)
- [ ] Validar logs de inicialização

### Deployment

- [ ] Atualizar secrets no AWS Secrets Manager (staging)
- [ ] Testar deploy em staging
- [ ] Validar que ECS Task Role tem permissões corretas
- [ ] Atualizar secrets no AWS Secrets Manager (production)
- [ ] Deploy em production

---

## 📚 Referências

- [AWS SDK for JavaScript v3 - Credentials](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/modules/_aws_sdk_credential_providers.html)
- [ECS Task IAM Roles](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-iam-roles.html)
- [JWT with RS256](https://www.npmjs.com/package/jsonwebtoken#algorithms-supported)
- [OpenSSL RSA Key Generation](https://www.openssl.org/docs/man1.1.1/man1/genrsa.html)

---

**Status:** 📋 Pronto para implementação
**Arquivo de referência:** [AWS-INFRA-CHANGES-2026.md](./AWS-INFRA-CHANGES-2026.md)
