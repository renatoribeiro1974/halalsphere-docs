# 6. Índices e Performance

## 6.1 Índices Compostos

```sql
-- Busca de processos por empresa + status (US-004 Dashboard)
CREATE INDEX idx_processes_company_status
    ON certification_processes(company_id, status);

-- Busca de processos por analista + fase (US-018 Kanban)
CREATE INDEX idx_processes_analyst_phase
    ON certification_processes(analyst_id, current_phase);

-- Busca de auditorias por auditor + data (US-029 Calendário)
CREATE INDEX idx_audits_auditor_date
    ON audits(auditor_id, scheduled_date);

-- Certificados próximos de vencer (US-054 Renovação)
CREATE INDEX idx_certificates_expiring
    ON certificates(status, valid_until)
    WHERE status = 'ativo';
```

---

## 6.2 Índices Full-Text Search

```sql
-- Busca de empresas por nome (US-016)
CREATE INDEX idx_companies_name_fts
    ON companies USING gin(to_tsvector('portuguese', razao_social || ' ' || COALESCE(nome_fantasia, '')));

-- Busca de produtos por nome (US-027)
CREATE INDEX idx_products_name_fts
    ON products USING gin(to_tsvector('portuguese', name || ' ' || COALESCE(description, '')));

-- Busca fuzzy de empresas (trigram similarity)
CREATE INDEX idx_companies_name_trgm
    ON companies USING gin(razao_social gin_trgm_ops);
```

---

## 6.3 Índices para RAG (pgvector)

```sql
-- Extensão pgvector para embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabela para armazenar embeddings de documentos
CREATE TABLE document_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),  -- OpenAI text-embedding-3-large
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índice HNSW para busca semântica rápida
CREATE INDEX idx_document_embeddings_vector
    ON document_embeddings
    USING hnsw (embedding vector_cosine_ops);

COMMENT ON TABLE document_embeddings IS 'Embeddings de documentos para chatbot RAG (US-049)';
COMMENT ON COLUMN document_embeddings.chunk_index IS 'Índice do chunk (documentos grandes são divididos)';
```

---

## 6.4 Particionamento de Tabelas (Futuro)

Para escalar além de 10.000 processos:

```sql
-- Particionar audit_trail por ano (retenção 3 anos)
CREATE TABLE audit_trail_2025 PARTITION OF audit_trail
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

CREATE TABLE audit_trail_2026 PARTITION OF audit_trail
    FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

-- Auto-vacuum agressivo em tabelas grandes
ALTER TABLE audit_trail SET (autovacuum_vacuum_scale_factor = 0.05);
ALTER TABLE notifications SET (autovacuum_vacuum_scale_factor = 0.1);
```

---

## 6.5 Materialized Views para Dashboards

```sql
-- View materializada: Estatísticas por analista (US-056)
CREATE MATERIALIZED VIEW analyst_stats AS
SELECT
    analyst_id,
    COUNT(*) AS total_processes,
    COUNT(*) FILTER (WHERE status = 'em_andamento') AS active_processes,
    COUNT(*) FILTER (WHERE status = 'concluido') AS completed_processes,
    AVG(EXTRACT(EPOCH FROM (completed_at - started_at)) / 86400)::INTEGER AS avg_days_to_complete
FROM certification_processes
WHERE analyst_id IS NOT NULL
GROUP BY analyst_id;

-- Índice na view
CREATE UNIQUE INDEX idx_analyst_stats_analyst_id ON analyst_stats(analyst_id);

-- Refresh automático (executar via cron ou background job)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY analyst_stats;

COMMENT ON MATERIALIZED VIEW analyst_stats IS 'Estatísticas por analista (atualizar 1x/dia)';
```

---

