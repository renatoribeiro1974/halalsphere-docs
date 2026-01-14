# Database Design

**PostgreSQL 16 + pgvector | 19 Tabelas | ERD Completo**

---

## 📊 Arquivos do Database Design

### [1. ERD - Entity Relationship Diagram](./01-erd.md)
**Diagramas Mermaid | Relacionamentos | Visão Geral**

- Diagrama resumido (alto nível)
- Diagrama detalhado (todas as 19 tabelas)
- Relacionamentos FK
- Tipos de dados principais

### [2. Dicionário de Dados](./02-data-dictionary.md)
**Documentação Completa de Tabelas**

- `users` - Usuários do sistema (4 roles)
- `companies` - Dados cadastrais das empresas
- `requests` - Solicitações de certificação
- `certification_processes` - Processos completos (12 fases)
- `products` - Produtos a certificar
- `certificates` - Certificados emitidos
- `ai_analysis` - Análises de IA
- E mais 12 tabelas...

### [3. DDL - Data Definition Language](./03-ddl.md)
**Scripts SQL Completos | CREATE TABLE | Constraints**

- Extensions (uuid-ossp, pgvector, pg_trgm)
- 15 ENUMs definidos
- 19 tabelas CREATE TABLE
- Triggers (updated_at automático)
- Constraints (validações, FKs)
- Seed data inicial (categorias C1-C6)

### [4. Índices e Performance](./04-indexes.md)
**Otimizações | Full-Text Search | pgvector**

- Índices simples (email, status, datas)
- Índices compostos (queries complexas)
- Full-text search (empresas, produtos)
- pgvector HNSW (RAG para chatbot)
- Materialized views (dashboards)
- Particionamento (futuro)

### [5. Migrations Strategy](./05-migrations.md)
**Prisma Migrate | Versionamento | Rollback**

- Estrutura de migrations
- Exemplo de migration
- Schema evolution
- Data migration
- Rollback strategy

---

## 📈 Estatísticas do Banco

### Tabelas
- **Total**: 19 tabelas
- **Core**: 8 (users, companies, processes, products, etc)
- **Workflow**: 5 (contracts, audits, committee, certificates)
- **IA**: 3 (ai_analysis, chat_messages, document_embeddings)
- **Sistema**: 3 (notifications, audit_trail, product_categories)

### Dados Esperados (Produção)
- **Processos ativos**: 600-700 simultâneos
- **Processos históricos**: Ilimitado (retenção 3 anos)
- **Usuários**: ~130 (50 empresas + 30 analistas + 40 auditores + 10 gestores)
- **Produtos**: ~3.500 (média 5 produtos/processo)
- **Documentos**: ~10.000 arquivos (média 15/processo)
- **Storage total**: ~350 GB (500 MB/processo × 700)

### Performance
- **Queries <1s**: 95% das consultas
- **Índices**: 40+ índices otimizados
- **Full-text search**: Sub-segundo em 10k registros
- **Backup**: Diário (retenção 3 anos)
- **Replicação**: 1 master + 2 read replicas

---

## 🔗 Relacionamentos Principais

```
users ─┬─→ companies
       ├─→ certification_processes (analista)
       ├─→ certification_processes (auditor)
       └─→ notifications

companies ─→ certification_processes

certification_processes ─┬─→ products
                         ├─→ documents
                         ├─→ contracts
                         ├─→ audits
                         ├─→ committee_decisions
                         ├─→ certificates
                         └─→ ai_analysis

products ─→ product_categories (C1-C6)

audits ─┬─→ audit_schedules
        └─→ audit_checklists
```

---

## 🚀 Quick Start

### 1. Executar DDL
```bash
# Usar Prisma (recomendado)
npx prisma migrate dev --name init

# Ou SQL direto
psql -U admin -d halalsphere -f 03-ddl.md
```

### 2. Verificar Schema
```bash
npx prisma studio
# Abre interface visual em http://localhost:5555
```

### 3. Popular Dados de Exemplo
```bash
npm run db:seed
# Cria: 1 empresa, 1 analista, 5 processos
```

---

## 🔗 Navegação

- [← Voltar para Technical Architecture](../README.md)
- [Stack Tecnológica](../01-stack.md)
- [System Architecture](../02-system-architecture.md)
- [APIs e Integrações →](../04-apis.md)

---

**Última atualização**: 13 de Novembro de 2025
