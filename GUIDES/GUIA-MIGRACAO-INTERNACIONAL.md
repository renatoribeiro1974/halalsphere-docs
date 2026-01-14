# Guia de Migração - Internacionalização HalalSphere

**Versão**: 1.0
**Data**: 2025-12-08
**Status**: Pronto para Implementação

---

## 📋 Índice

1. [Resumo Executivo](#resumo-executivo)
2. [Alterações no Banco de Dados](#alterações-no-banco-de-dados)
3. [Passo a Passo da Migração](#passo-a-passo-da-migração)
4. [Scripts de Migração de Dados](#scripts-de-migração-de-dados)
5. [Validação Pós-Migração](#validação-pós-migração)
6. [Rollback (Se Necessário)](#rollback-se-necessário)
7. [Checklist Final](#checklist-final)

---

## 1. Resumo Executivo

### O que mudou?

Esta migração adiciona suporte internacional ao HalalSphere para operar em:
- **Brasil** (BR) - Moeda: BRL, Idioma: PT-BR
- **Colômbia** (CO) - Moeda: COP, Idioma: ES
- **Paraguai** (PY) - Moeda: PYG, Idioma: ES

### Principais Alterações:

1. **Novos Enums**:
   - `Country` (BR, CO, PY)
   - `TaxIdType` (CNPJ, CPF, NIT, RUT, RUC, CI)
   - `Currency` (BRL, COP, PYG)
   - `Language` (PT_BR, ES)

2. **Enum UserRole Expandido**:
   - Adicionados: `comercial`, `juridico`, `financeiro`, `gestor_auditoria`, `supervisor`, `controlador`

3. **Enum RequestType Atualizado**:
   - `nova` (Nova Certificação)
   - `manutencao` (Manutenção/Renovação) - substituiu `renovacao`
   - `adequacao` (Adequação) - substituiu `ampliacao`

4. **Enum ProcessPhase Expandido**:
   - De 8 fases para 17 fases
   - Separação entre Fluxo Comercial (fases 1-7) e Fluxo Operacional (fases 8-17)

5. **Model Company**:
   - Novos campos: `country`, `taxId`, `taxIdFormatted`, `taxIdType`, `currency`, `language`
   - Campo `cnpj` marcado como opcional (legado)
   - Constraint `@@unique([country, taxId])`

6. **Model Request**:
   - Novos campos: `country`, `taxId`, `taxIdType`
   - Novos campos wizard: `supplierDetails`, `targetMarkets`
   - Campo `cnpj` marcado como opcional (legado)

7. **Model PricingTable**:
   - Novos campos: `country`, `currency`

### Impacto:

- **BREAKING CHANGES**: Sim
- **Requer downtime**: Sim (estimado: 5-10 minutos)
- **Migração de dados**: Sim (empresas existentes serão migradas para BR)
- **Rollback disponível**: Sim

---

## 2. Alterações no Banco de Dados

### 2.1. Novos Enums

```sql
-- Country
CREATE TYPE "Country" AS ENUM ('BR', 'CO', 'PY');

-- TaxIdType
CREATE TYPE "TaxIdType" AS ENUM ('CNPJ', 'CPF', 'NIT', 'RUT', 'RUC', 'CI');

-- Currency
CREATE TYPE "Currency" AS ENUM ('BRL', 'COP', 'PYG');

-- Language
CREATE TYPE "Language" AS ENUM ('PT_BR', 'ES');
```

### 2.2. Alterações em Enums Existentes

```sql
-- UserRole: Adicionar novos valores
ALTER TYPE "UserRole" ADD VALUE 'comercial';
ALTER TYPE "UserRole" ADD VALUE 'juridico';
ALTER TYPE "UserRole" ADD VALUE 'financeiro';
ALTER TYPE "UserRole" ADD VALUE 'gestor_auditoria';
ALTER TYPE "UserRole" ADD VALUE 'supervisor';
ALTER TYPE "UserRole" ADD VALUE 'controlador';

-- RequestType: Renomear valores
-- Será feito via migration com tratamento de dados existentes

-- ProcessPhase: Adicionar novas fases
-- Total de 17 fases (detalhadas no schema)
```

### 2.3. Alterações na Tabela `companies`

```sql
-- Adicionar novos campos
ALTER TABLE companies
  ADD COLUMN country "Country" DEFAULT 'BR' NOT NULL,
  ADD COLUMN tax_id VARCHAR(20) NOT NULL DEFAULT '',
  ADD COLUMN tax_id_formatted VARCHAR(25) NOT NULL DEFAULT '',
  ADD COLUMN tax_id_type "TaxIdType" NOT NULL DEFAULT 'CNPJ',
  ADD COLUMN currency "Currency" DEFAULT 'BRL' NOT NULL,
  ADD COLUMN language "Language" DEFAULT 'PT_BR' NOT NULL;

-- Tornar cnpj opcional
ALTER TABLE companies ALTER COLUMN cnpj DROP NOT NULL;

-- Adicionar constraint de unicidade
ALTER TABLE companies ADD CONSTRAINT companies_country_tax_id_key UNIQUE (country, tax_id);

-- Adicionar índice
CREATE INDEX companies_country_tax_id_idx ON companies(country, tax_id);
```

### 2.4. Alterações na Tabela `requests`

```sql
-- Adicionar novos campos
ALTER TABLE requests
  ADD COLUMN country "Country",
  ADD COLUMN tax_id VARCHAR(20),
  ADD COLUMN tax_id_type "TaxIdType",
  ADD COLUMN supplier_details JSONB,
  ADD COLUMN target_markets JSONB;

-- Tornar cnpj opcional
ALTER TABLE requests ALTER COLUMN cnpj DROP NOT NULL;

-- Adicionar índice
CREATE INDEX requests_country_tax_id_idx ON requests(country, tax_id);
```

### 2.5. Alterações na Tabela `pricing_tables`

```sql
-- Adicionar novos campos
ALTER TABLE pricing_tables
  ADD COLUMN country "Country" DEFAULT 'BR' NOT NULL,
  ADD COLUMN currency "Currency" DEFAULT 'BRL' NOT NULL;
```

---

## 3. Passo a Passo da Migração

### 3.1. Pré-requisitos

- [ ] Backup completo do banco de dados
- [ ] Ambiente de staging testado
- [ ] Validação de que não há transações em andamento
- [ ] Notificação aos usuários sobre manutenção

### 3.2. Comandos de Migração

#### Passo 1: Fazer backup

```bash
# Windows (CMD)
set PGPASSWORD=yourpassword
pg_dump -h localhost -U postgres -d halalsphere > backup_pre_migration_%date:~-4,4%%date:~-10,2%%date:~-7,2%.sql

# Linux/Mac
PGPASSWORD=yourpassword pg_dump -h localhost -U postgres -d halalsphere > backup_pre_migration_$(date +%Y%m%d).sql
```

#### Passo 2: Gerar migration Prisma

```bash
cd backend
npx prisma migrate dev --name add_international_support
```

#### Passo 3: Executar script de migração de dados

Criar arquivo `backend/prisma/migrations/migrate-existing-data.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import { TaxValidationService } from '../../src/services/tax-validation.service';

const prisma = new PrismaClient();

async function migrateExistingData() {
  console.log('🚀 Iniciando migração de dados existentes...\n');

  // 1. Migrar Companies
  console.log('1️⃣  Migrando empresas...');
  const companies = await prisma.company.findMany({
    where: {
      taxId: ''
    }
  });

  for (const company of companies) {
    const cleanCNPJ = company.cnpj?.replace(/\D/g, '') || '';
    const formattedCNPJ = TaxValidationService.format(cleanCNPJ, 'BR', 'CNPJ');

    await prisma.company.update({
      where: { id: company.id },
      data: {
        country: 'BR',
        taxId: cleanCNPJ,
        taxIdFormatted: formattedCNPJ,
        taxIdType: 'CNPJ',
        currency: 'BRL',
        language: 'PT_BR'
      }
    });
  }
  console.log(`   ✓ ${companies.length} empresas migradas\n`);

  // 2. Migrar Requests
  console.log('2️⃣  Migrando solicitações...');
  const requests = await prisma.request.findMany({
    where: {
      country: null
    },
    include: {
      company: true
    }
  });

  for (const request of requests) {
    const cleanCNPJ = request.cnpj?.replace(/\D/g, '') || '';

    await prisma.request.update({
      where: { id: request.id },
      data: {
        country: 'BR',
        taxId: cleanCNPJ,
        taxIdType: 'CNPJ'
      }
    });
  }
  console.log(`   ✓ ${requests.length} solicitações migradas\n`);

  // 3. Atualizar RequestType (renovacao -> manutencao, ampliacao -> adequacao)
  console.log('3️⃣  Atualizando tipos de solicitação...');
  // Nota: Prisma não suporta ALTER ENUM diretamente
  // Esta parte será feita via SQL raw na migration

  console.log('✅ Migração concluída com sucesso!\n');
}

migrateExistingData()
  .catch((e) => {
    console.error('❌ Erro na migração:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Executar:

```bash
npx ts-node prisma/migrations/migrate-existing-data.ts
```

---

## 4. Scripts de Migração de Dados

### 4.1. Script SQL Completo

Criar arquivo `backend/prisma/migrations/manual-enum-updates.sql`:

```sql
-- ================================================
-- MIGRAÇÃO MANUAL DE ENUMS
-- ================================================

BEGIN;

-- 1. Atualizar RequestType
-- Criar novo enum
CREATE TYPE "RequestType_new" AS ENUM ('nova', 'manutencao', 'adequacao');

-- Migrar dados existentes
UPDATE requests SET request_type =
  CASE
    WHEN request_type::text = 'renovacao' THEN 'manutencao'::text
    WHEN request_type::text = 'ampliacao' THEN 'adequacao'::text
    ELSE request_type::text
  END;

-- Alterar coluna para usar novo enum
ALTER TABLE requests ALTER COLUMN request_type TYPE "RequestType_new"
  USING (request_type::text::"RequestType_new");

-- Dropar enum antigo e renomear novo
DROP TYPE "RequestType";
ALTER TYPE "RequestType_new" RENAME TO "RequestType";

COMMIT;
```

Executar:

```bash
psql -h localhost -U postgres -d halalsphere -f backend/prisma/migrations/manual-enum-updates.sql
```

---

## 5. Validação Pós-Migração

### 5.1. Queries de Validação

```sql
-- 1. Verificar que todas as empresas têm country e taxId
SELECT COUNT(*) as total,
       COUNT(country) as with_country,
       COUNT(tax_id) as with_tax_id
FROM companies;
-- Esperado: total = with_country = with_tax_id

-- 2. Verificar distribuição por país
SELECT country, COUNT(*)
FROM companies
GROUP BY country;
-- Esperado: Todas em BR após migração inicial

-- 3. Verificar requests migrados
SELECT COUNT(*) as total,
       COUNT(country) as with_country
FROM requests;

-- 4. Verificar constraint de unicidade
SELECT country, tax_id, COUNT(*)
FROM companies
GROUP BY country, tax_id
HAVING COUNT(*) > 1;
-- Esperado: 0 linhas (sem duplicatas)

-- 5. Verificar novos roles
SELECT role, COUNT(*)
FROM users
GROUP BY role;
```

### 5.2. Testes Funcionais

Executar teste de validação:

```bash
cd backend
npx ts-node src/services/tax-validation.service.test.ts
```

Resultado esperado: Todos os testes passando (✓).

---

## 6. Rollback (Se Necessário)

### 6.1. Restaurar Backup

```bash
# Dropar banco atual
psql -h localhost -U postgres -c "DROP DATABASE halalsphere;"

# Recriar banco
psql -h localhost -U postgres -c "CREATE DATABASE halalsphere;"

# Restaurar backup
psql -h localhost -U postgres -d halalsphere < backup_pre_migration_YYYYMMDD.sql
```

### 6.2. Reverter Código

```bash
git checkout HEAD~1 backend/prisma/schema.prisma
cd backend
npx prisma generate
```

---

## 7. Checklist Final

### Pré-Migração

- [ ] Backup do banco de dados criado
- [ ] Ambiente de staging testado com sucesso
- [ ] Usuários notificados sobre manutenção
- [ ] Documentação revisada

### Durante Migração

- [ ] Sistema em modo de manutenção
- [ ] Migration Prisma executada sem erros
- [ ] Script de migração de dados executado
- [ ] Queries de validação executadas

### Pós-Migração

- [ ] Todas as queries de validação passando
- [ ] Testes de validação de documentos passando
- [ ] Frontend funcionando corretamente
- [ ] Backend funcionando corretamente
- [ ] Testes de integração passando
- [ ] Sistema saiu do modo de manutenção
- [ ] Usuários notificados sobre conclusão

### Validação Final

- [ ] Criar nova empresa teste (Brasil)
- [ ] Criar nova empresa teste (Colômbia)
- [ ] Criar nova empresa teste (Paraguai)
- [ ] Criar solicitação de cada tipo (nova, manutenção, adequação)
- [ ] Verificar formatação de documentos fiscais
- [ ] Verificar cálculo de propostas com moedas diferentes
- [ ] Verificar todas as fases do processo

---

## 8. Arquivos Criados/Modificados

### Novos Arquivos:

1. `backend/src/services/tax-validation.service.ts` - Validação de documentos fiscais
2. `backend/src/services/tax-validation.service.test.ts` - Testes de validação
3. `backend/src/shared/dtos/international.dto.ts` - DTOs e configurações internacionais

### Arquivos Modificados:

1. `backend/prisma/schema.prisma` - Schema atualizado com suporte internacional

### Migrations:

- Será criada automaticamente pelo Prisma ao executar `npx prisma migrate dev`

---

## 9. Próximos Passos

Após a migração bem-sucedida:

1. **Frontend**:
   - Atualizar wizard para 9 etapas
   - Adicionar seletor de país
   - Implementar validação de documentos fiscais no frontend
   - Adicionar formatação de moeda por país

2. **Backend**:
   - Atualizar controllers para usar novos campos
   - Implementar lógica de roteamento por tipo de solicitação
   - Atualizar cálculo de propostas para multi-moeda

3. **Testes**:
   - Testes de integração end-to-end
   - Testes de performance
   - Testes de segurança

4. **Documentação**:
   - Atualizar API documentation
   - Atualizar manual do usuário
   - Criar guia de operação para cada país

---

## 10. Suporte e Contato

Para dúvidas ou problemas durante a migração:

- **Documentação**: Consultar [PROCESSO-CERTIFICACAO-COMPLETO-FINAL.md](./PROCESSO-CERTIFICACAO-COMPLETO-FINAL.md)
- **Internacionalização**: Consultar [INTERNACIONALIZACAO-SISTEMA.md](./INTERNACIONALIZACAO-SISTEMA.md)
- **Fluxos**: Consultar [FLUXOS-TIPOS-SOLICITACAO.md](./FLUXOS-TIPOS-SOLICITACAO.md)

---

**Fim do Guia de Migração**
