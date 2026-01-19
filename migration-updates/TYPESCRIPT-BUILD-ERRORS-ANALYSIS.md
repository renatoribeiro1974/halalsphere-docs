# Análise de Erros de Build - Branch Release

**Data:** 2026-01-19
**Branch:** release
**Total de Erros:** 155 erros TypeScript

---

## 1. PROBLEMA CRÍTICO: Incompatibilidade de Versão Prisma

### Situação Atual
- **package.json especifica:** Prisma ^6.1.0
- **node_modules contém:** Prisma 7.2.0
- **Impacto:** Prisma 7 tem breaking changes incompatíveis com o schema atual

### Erro Principal
```
Error: Prisma schema validation - (get-config wasm)
Error code: P1012
error: The datasource property `url` is no longer supported in schema files.
```

### Solução Necessária
**OPÇÃO 1 (RECOMENDADA):** Downgrade para Prisma 6
```bash
npm install @prisma/client@6.1.0 prisma@6.1.0
npx prisma generate
```

**OPÇÃO 2:** Atualizar para Prisma 7 (requer mudanças no schema)
- Criar arquivo `prisma.config.ts`
- Remover `url` do datasource
- Migrar configuração de conexão

---

## 2. TIPOS AUSENTES DO PRISMA CLIENT

### 2.1 Enums Internacionais (NÃO EXISTEM NO SCHEMA)

#### Erros:
```
error TS2305: Module '"@prisma/client"' has no exported member 'Country'
error TS2305: Module '"@prisma/client"' has no exported member 'Currency'
error TS2305: Module '"@prisma/client"' has no exported member 'Language'
error TS2305: Module '"@prisma/client"' has no exported member 'TaxIdType'
```

#### Arquivos Afetados (17 erros):
- `src/modules/auth/auth.service.ts` (3 erros)
- `src/modules/company/company.service.ts` (4 erros)
- `src/services/tax-validation.service.ts` (2 erros)
- `src/shared/dtos/international.dto.ts` (4 erros)
- E mais 4 arquivos

#### Solução:
Adicionar ao `schema.prisma`:
```prisma
enum Country {
  BR  // Brasil
  AR  // Argentina
  UY  // Uruguai
  PY  // Paraguai
  CL  // Chile
  BO  // Bolívia
  PE  // Peru
  CO  // Colômbia
  // ... outros países
}

enum TaxIdType {
  CNPJ
  CPF
  NIT
  RUT
  RUC
  CI
  // ... outros tipos
}

enum Currency {
  BRL  // Real Brasileiro
  USD  // Dólar Americano
  EUR  // Euro
  ARS  // Peso Argentino
  UYU  // Peso Uruguaio
  // ... outras moedas
}

enum Language {
  pt_BR  // Português Brasil
  en_US  // Inglês
  es_ES  // Espanhol
  ar_SA  // Árabe
  // ... outros idiomas
}
```

---

### 2.2 Enums E-Signature (NÃO EXISTEM NO SCHEMA)

#### Erros:
```
error TS2305: Module '"@prisma/client"' has no exported member 'ESignatureProvider'
error TS2305: Module '"@prisma/client"' has no exported member 'SignatureStatus'
```

#### Arquivos Afetados (13 erros):
- `src/services/e-signature/e-signature-config.service.ts` (7 erros)
- `src/services/e-signature/clicksign-provider.ts` (3 erros)
- `src/services/e-signature/d4sign-provider.ts` (3 erros)

#### Solução:
Adicionar ao `schema.prisma`:
```prisma
enum ESignatureProvider {
  clicksign
  d4sign
  docusign
}

enum SignatureStatus {
  pendente
  assinado
  recusado
  expirado
  cancelado
}
```

---

### 2.3 Enum Storage (NÃO EXISTE NO SCHEMA)

#### Erro:
```
error TS2305: Module '"@prisma/client"' has no exported member 'StorageProvider'
```

#### Arquivos Afetados (1 erro):
- `src/services/storage/storage-manager.service.ts`

#### Solução:
Adicionar ao `schema.prisma`:
```prisma
enum StorageProvider {
  s3
  local
  azure
  gcp
}
```

---

### 2.4 Modelos/Tabelas Ausentes no Prisma

#### Erros:
```
error TS2339: Property 'eSignatureConfig' does not exist on type 'PrismaClient'
error TS2339: Property 'storageConfig' does not exist on type 'PrismaClient'
error TS2339: Property 'companyBucket' does not exist on type 'PrismaClient'
```

#### Arquivos Afetados (10 erros):
- `src/services/e-signature/e-signature-config.service.ts` (7 erros)
- `src/services/storage/storage-manager.service.ts` (3 erros)

#### Solução:
Adicionar modelos ao `schema.prisma`:

```prisma
model ESignatureConfig {
  id         String               @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  companyId  String?              @map("company_id") @db.Uuid
  provider   ESignatureProvider
  apiKey     String               @map("api_key") @db.Text
  apiSecret  String?              @map("api_secret") @db.Text
  webhookUrl String?              @map("webhook_url") @db.Text
  config     Json?                // Configurações específicas do provider
  isActive   Boolean              @default(true) @map("is_active")
  createdAt  DateTime             @default(now()) @map("created_at")
  updatedAt  DateTime             @updatedAt @map("updated_at")

  @@index([companyId])
  @@index([provider])
  @@map("e_signature_configs")
}

model StorageConfig {
  id            String          @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  provider      StorageProvider
  accessKey     String          @map("access_key") @db.Text
  secretKey     String          @map("secret_key") @db.Text
  region        String?         @db.VarChar(50)
  bucket        String          @db.VarChar(255)
  endpoint      String?         @db.Text
  isDefault     Boolean         @default(false) @map("is_default")
  isActive      Boolean         @default(true) @map("is_active")
  createdAt     DateTime        @default(now()) @map("created_at")
  updatedAt     DateTime        @updatedAt @map("updated_at")

  @@index([provider])
  @@index([isDefault])
  @@map("storage_configs")
}

model CompanyBucket {
  id            String   @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  companyId     String   @map("company_id") @db.Uuid
  bucketName    String   @map("bucket_name") @db.VarChar(255)
  storageConfigId String @map("storage_config_id") @db.Uuid
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  @@unique([companyId])
  @@index([bucketName])
  @@map("company_buckets")
}
```

---

## 3. ERROS DE TIPAGEM NO MÓDULO AUTH

### 3.1 Tipos `unknown` Não Tratados (18 erros)

#### Arquivos Afetados:
- `src/modules/auth/auth.service.ts` (9 erros)
- `src/modules/auth/auth.controller.ts` (1 erro)
- `src/modules/company/company.service.ts` (8 erros)

#### Exemplos de Erros:
```typescript
// Linha 37: Type 'unknown' is not assignable to type 'string | undefined'
error TS2322: Type 'unknown' is not assignable to type 'string | undefined'

// Linha 65, 76: Argument of type 'unknown' is not assignable to parameter of type 'string'
error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'string'

// Linha 82: unknown não é string | Buffer
error TS2345: Argument of type 'unknown' is not assignable to parameter of type 'string | Buffer<ArrayBufferLike>'
```

#### Causa:
Uso de `data` de validação Zod sem type assertion adequada.

#### Solução:
Adicionar type guards ou type assertions:
```typescript
// Antes
const email = data.email; // unknown

// Depois
const email = data.email as string;
// OU
if (typeof data.email === 'string') {
  const email = data.email;
}
```

---

### 3.2 Propriedades Ausentes no Schema Prisma (3 erros)

#### Erro em `auth.service.ts:47`:
```
error TS2353: Object literal may only specify known properties, and 'country' does not exist in type 'CompanyWhereInput'
```

#### Erro em `auth.service.ts:59`:
```
error TS2339: Property 'user' does not exist on type '{ razaoSocial: string; ... }'
```

#### Solução:
1. Adicionar campo `country` ao modelo `Company` no schema
2. Incluir relação `user` no `include` da query Prisma

---

## 4. ERROS DE ROTAS FASTIFY

### 4.1 WebSocket Route Error

#### Arquivo: `src/modules/auth/auth.routes.ts:58`

#### Erro:
```
error TS2769: No overload matches this call.
Property 'websocket' is missing in type '{ onRequest: ... }' but required in type '{ websocket: true; }'
```

#### Causa:
Uso incorreto da API de WebSocket do Fastify.

#### Solução:
```typescript
// Antes
fastify.get('/ws/endpoint', {
  onRequest: [authenticateUser]
}, handler)

// Depois
fastify.get('/ws/endpoint', {
  websocket: true,
  onRequest: [authenticateUser]
}, handler)
```

---

## 5. ERROS DE IMPORTAÇÃO

### 5.1 Express em Ambiente Fastify

#### Arquivo: `src/controllers/e-signature-config.controller.ts:1`

#### Erro:
```
error TS2307: Cannot find module 'express' or its corresponding type declarations
```

#### Causa:
Tentativa de importar Express em projeto Fastify.

#### Solução:
Substituir imports do Express por Fastify:
```typescript
// Antes
import { Request, Response } from 'express';

// Depois
import { FastifyRequest, FastifyReply } from 'fastify';
```

---

## 6. FUNÇÕES DUPLICADAS

### Arquivo: `src/services/storage.service.ts`

#### Erros:
```
src/services/storage.service.ts(107,9): error TS2393: Duplicate function implementation
src/services/storage.service.ts(189,9): error TS2393: Duplicate function implementation
```

#### Solução:
Remover implementações duplicadas ou renomear funções.

---

## 7. MÉTODOS ABSTRATOS NÃO IMPLEMENTADOS

### 7.1 E-Signature Providers

#### Arquivos:
- `src/services/e-signature/clicksign-provider.ts:20`
- `src/services/e-signature/d4sign-provider.ts:23`

#### Erro:
```
error TS2515: Non-abstract class 'ClickSignProvider' does not implement inherited abstract member uploadDocument from class 'ESignatureProvider'
```

#### Solução:
Implementar método `uploadDocument` nas classes concretas:
```typescript
class ClickSignProvider extends ESignatureProvider {
  async uploadDocument(file: Buffer, fileName: string): Promise<string> {
    // Implementação
  }
}
```

---

## 8. ERROS DE COMPARAÇÃO DE TIPOS

### Arquivo: `src/services/pdf.service.ts:109`

#### Erro:
```
error TS2367: This comparison appears to be unintentional because the types 'ProcessStatus | undefined' and '"certificado_emitido"' have no overlap
```

#### Causa:
Comparação com string literal em vez de enum.

#### Solução:
```typescript
// Antes
if (status === 'certificado_emitido')

// Depois
if (status === ProcessStatus.certificado)
```

---

## 9. PROPRIEDADES AUSENTES EM TIPOS

### Arquivo: `src/services/pdf.service.ts:124`

#### Erro:
```
error TS2339: Property 'address' does not exist on type '{ process: { ... } } & { ... }'
```

#### Solução:
Verificar query Prisma e incluir campos necessários no `select` ou `include`.

---

## 10. ÍNDICES IMPLÍCITOS COM TIPO ANY

### Arquivo: `src/services/tax-validation.service.ts`

#### Erros (2):
```
error TS7053: Element implicitly has an 'any' type because expression of type 'TaxIdType' can't be used to index type '{ CNPJ: string; CPF: string; ... }'
```

#### Solução:
Adicionar type assertion ou criar type guard:
```typescript
type TaxIdMap = Record<TaxIdType, string>;
const taxIdMap: TaxIdMap = { /* ... */ };
```

---

## RESUMO POR CATEGORIA

| Categoria | Quantidade | Prioridade |
|-----------|------------|------------|
| Tipos ausentes Prisma (Enums) | 28 | **CRÍTICA** |
| Tipos ausentes Prisma (Models) | 10 | **CRÍTICA** |
| Incompatibilidade versão Prisma | 1 | **CRÍTICA** |
| Tipos `unknown` não tratados | 18 | ALTA |
| Erros de rota Fastify | 1 | ALTA |
| Importação Express | 1 | MÉDIA |
| Funções duplicadas | 2 | MÉDIA |
| Métodos abstratos | 2 | MÉDIA |
| Erros de comparação | 1 | BAIXA |
| Propriedades ausentes | 2 | BAIXA |
| Índices implícitos | 2 | BAIXA |
| **TOTAL** | **155** | |

---

## PLANO DE AÇÃO RECOMENDADO

### Fase 1: Resolver Problema Crítico do Prisma (OBRIGATÓRIA)
1. ✅ Downgrade Prisma para versão 6.1.0
2. ✅ Executar `npm install`
3. ✅ Limpar node_modules e package-lock.json se necessário

### Fase 2: Adicionar Tipos Ausentes ao Schema (OBRIGATÓRIA)
1. ✅ Adicionar enums: Country, Currency, Language, TaxIdType
2. ✅ Adicionar enums: ESignatureProvider, SignatureStatus, StorageProvider
3. ✅ Adicionar models: ESignatureConfig, StorageConfig, CompanyBucket
4. ✅ Executar `prisma generate`
5. ✅ Executar `prisma migrate dev`

### Fase 3: Corrigir Erros de Tipagem (ALTA PRIORIDADE)
1. ⬜ Adicionar type assertions no módulo auth
2. ⬜ Corrigir propriedades ausentes no Company model
3. ⬜ Ajustar queries Prisma para incluir relações necessárias

### Fase 4: Corrigir Imports e Rotas (MÉDIA PRIORIDADE)
1. ⬜ Substituir imports Express por Fastify
2. ⬜ Corrigir configuração WebSocket
3. ⬜ Remover funções duplicadas

### Fase 5: Implementações Faltantes (MÉDIA PRIORIDADE)
1. ⬜ Implementar método `uploadDocument` nos providers
2. ⬜ Corrigir comparações de enums
3. ⬜ Adicionar type guards para índices

---

## ESTIMATIVA DE IMPACTO

- **Tempo estimado (Fase 1+2):** 2-3 horas
- **Tempo estimado (todas as fases):** 1-2 dias
- **Risco de quebra:** ALTO (mudanças no schema requerem migrações)
- **Arquivos afetados:** ~30 arquivos
- **Prioridade:** CRÍTICA (build não funciona atualmente)

---

## OBSERVAÇÕES IMPORTANTES

1. **Backup do banco:** Fazer backup antes de executar migrações
2. **Ambiente de teste:** Testar todas as mudanças em ambiente de desenvolvimento
3. **Seed data:** Pode ser necessário atualizar scripts de seed
4. **Documentação:** Atualizar documentação após mudanças no schema
5. **Testes:** Executar testes após cada fase de correção

---

**Documento gerado automaticamente pela análise do build em 2026-01-19**
