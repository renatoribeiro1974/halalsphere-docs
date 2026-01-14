# 7. Migrations Strategy

## 7.1 Ferramenta de Migrations

**Recomendação**: Usar **Prisma Migrate** (já integrado com Prisma ORM).

Vantagens:
- Migrations automáticas baseadas no schema
- Rollback nativo
- Histórico versionado
- CI/CD friendly

Alternativas:
- **Flyway** (Java)
- **Liquibase** (Java/XML)
- **node-pg-migrate** (Node.js puro)

---

## 7.2 Estrutura de Migrations

```
/prisma
  /migrations
    /20250113000001_init_schema
      migration.sql
    /20250120143022_add_ai_analysis
      migration.sql
    /20250127091545_add_pgvector
      migration.sql
    migration_lock.toml
  schema.prisma
```

---

## 7.3 Exemplo de Migration (Prisma)

```sql
-- Migration: 20250113000001_init_schema

-- Criar extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Criar enums
CREATE TYPE user_role AS ENUM ('empresa', 'analista', 'auditor', 'gestor');
-- ... (outros enums)

-- Criar tabelas
CREATE TABLE users (...);
CREATE TABLE companies (...);
-- ... (outras tabelas)

-- Criar índices
CREATE INDEX idx_users_email ON users(email);
-- ... (outros índices)

-- Seed data inicial
INSERT INTO product_categories (...) VALUES (...);
```

---

## 7.4 Rollback Strategy

```bash
# Aplicar migration
npx prisma migrate deploy

# Rollback (reverter última migration)
npx prisma migrate rollback

# Ver status das migrations
npx prisma migrate status
```

---

## 7.5 Schema Evolution (Exemplo Prático)

**Cenário**: Adicionar campo `sla_hours` em `certification_processes`.

**Migration**:
```sql
-- Migration: 20250205120000_add_sla_hours

ALTER TABLE certification_processes
ADD COLUMN sla_hours INTEGER;

-- Valor padrão baseado na fase atual
UPDATE certification_processes
SET sla_hours =
    CASE current_phase
        WHEN 1 THEN 24
        WHEN 2 THEN 72
        WHEN 3 THEN 168
        ELSE 72
    END;

-- Constraint: sla_hours positivo
ALTER TABLE certification_processes
ADD CONSTRAINT sla_hours_positive
CHECK (sla_hours > 0);

COMMENT ON COLUMN certification_processes.sla_hours IS 'SLA em horas para conclusão da fase atual';
```

---

## 7.6 Data Migration (Exemplo)

**Cenário**: Migrar dados de `requests.additional_info` (JSONB) para tabela normalizada.

```sql
-- Migration: 20250301090000_normalize_request_metadata

-- 1. Criar nova tabela
CREATE TABLE request_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    value TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. Migrar dados existentes
INSERT INTO request_metadata (request_id, key, value)
SELECT
    id,
    jsonb_object_keys(additional_info) AS key,
    additional_info->>jsonb_object_keys(additional_info) AS value
FROM requests
WHERE additional_info IS NOT NULL;

-- 3. Índice
CREATE INDEX idx_request_metadata_request_id ON request_metadata(request_id);

-- 4. (Opcional) Remover coluna antiga após validação
-- ALTER TABLE requests DROP COLUMN additional_info;
```

---

