-- ============================================================================
-- MIGRATION: Gestão de Alocação de Auditores por Competências
-- Versão: 1.0
-- Data: 2025-12-17
-- ============================================================================
--
-- Este arquivo SQL demonstra a estrutura de banco de dados necessária
-- para implementar o sistema de alocação de auditores baseado em competências.
--
-- ATENÇÃO: Este é um arquivo de REFERÊNCIA.
-- Use o Prisma Migrate para gerar as migrations reais:
--   npx prisma migrate dev --name add-auditor-competencies
--
-- ============================================================================

-- ============================================================================
-- 1. ENUMS
-- ============================================================================

-- Nível de competência do auditor
CREATE TYPE "CompetencyLevel" AS ENUM (
  'basico',
  'intermediario',
  'avancado',
  'certificado'
);

-- Status de alocação
CREATE TYPE "AllocationStatus" AS ENUM (
  'sugerida',
  'aprovada',
  'modificada',
  'rejeitada',
  'cancelada'
);

-- ============================================================================
-- 2. TABELA: auditor_competencies
-- ============================================================================

CREATE TABLE "auditor_competencies" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "auditor_id" UUID NOT NULL,

  -- Competência em Categoria Industrial
  "industrial_category_id" UUID,
  "competency_level" "CompetencyLevel" NOT NULL,

  -- Competência em Tipo de Certificação
  "certification_type" "CertificationType",

  -- Experiência
  "years_experience" INTEGER,
  "audits_completed" INTEGER DEFAULT 0 NOT NULL,
  "success_rate" DECIMAL(5,2),

  -- Certificações Específicas (JSON)
  "certifications" JSONB,
  -- Exemplo:
  -- [
  --   {
  --     "name": "ISO 22000 Lead Auditor",
  --     "issuer": "BSI Group",
  --     "issuedAt": "2023-01-15",
  --     "validUntil": "2026-01-15"
  --   }
  -- ]

  -- Idiomas
  "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
  -- Exemplo: ['PT_BR', 'ES', 'EN', 'AR']

  -- Disponibilidade
  "is_active" BOOLEAN DEFAULT TRUE NOT NULL,
  "max_concurrent_audits" INTEGER DEFAULT 3 NOT NULL,

  -- Notas
  "notes" TEXT,

  -- Timestamps
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL,

  -- Foreign Keys
  FOREIGN KEY ("auditor_id") REFERENCES "users"("id") ON DELETE CASCADE,
  FOREIGN KEY ("industrial_category_id") REFERENCES "industrial_categories"("id"),

  -- Constraint: Unicidade por auditor + categoria + tipo
  UNIQUE ("auditor_id", "industrial_category_id", "certification_type")
);

-- Índices para performance
CREATE INDEX "idx_auditor_competencies_auditor" ON "auditor_competencies"("auditor_id");
CREATE INDEX "idx_auditor_competencies_category" ON "auditor_competencies"("industrial_category_id");
CREATE INDEX "idx_auditor_competencies_cert_type" ON "auditor_competencies"("certification_type");
CREATE INDEX "idx_auditor_competencies_level" ON "auditor_competencies"("competency_level");
CREATE INDEX "idx_auditor_competencies_active" ON "auditor_competencies"("is_active");

-- Trigger para atualizar updated_at
CREATE TRIGGER update_auditor_competencies_updated_at
  BEFORE UPDATE ON "auditor_competencies"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. TABELA: auditor_allocations
-- ============================================================================

CREATE TABLE "auditor_allocations" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "process_id" UUID NOT NULL,
  "audit_id" UUID,

  -- Auditores
  "suggested_auditor_id" UUID,  -- Sugerido pelo sistema
  "allocated_auditor_id" UUID,  -- Alocado pelo gestor

  -- Score de Compatibilidade
  "match_score" DECIMAL(5,2),
  "match_reasons" JSONB,
  -- Exemplo:
  -- {
  --   "competencyMatch": 100,
  --   "experienceYears": 12,
  --   "successRate": 98,
  --   "auditsCompleted": 45,
  --   "language": "PT_BR",
  --   "availability": true,
  --   "workload": "baixa",
  --   "currentAudits": 1,
  --   "maxAudits": 3
  -- }

  -- Gestão
  "status" "AllocationStatus" NOT NULL,
  "allocated_by" UUID,  -- Gestor que fez a alocação
  "allocation_notes" TEXT,

  -- Timestamps
  "suggested_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "decided_at" TIMESTAMP,
  "canceled_at" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL,

  -- Foreign Keys
  FOREIGN KEY ("process_id") REFERENCES "processes"("id") ON DELETE CASCADE,
  FOREIGN KEY ("audit_id") REFERENCES "audits"("id"),
  FOREIGN KEY ("suggested_auditor_id") REFERENCES "users"("id"),
  FOREIGN KEY ("allocated_auditor_id") REFERENCES "users"("id"),
  FOREIGN KEY ("allocated_by") REFERENCES "users"("id")
);

-- Índices para performance
CREATE INDEX "idx_auditor_allocations_process" ON "auditor_allocations"("process_id");
CREATE INDEX "idx_auditor_allocations_audit" ON "auditor_allocations"("audit_id");
CREATE INDEX "idx_auditor_allocations_suggested" ON "auditor_allocations"("suggested_auditor_id");
CREATE INDEX "idx_auditor_allocations_allocated" ON "auditor_allocations"("allocated_auditor_id");
CREATE INDEX "idx_auditor_allocations_status" ON "auditor_allocations"("status");
CREATE INDEX "idx_auditor_allocations_manager" ON "auditor_allocations"("allocated_by");
CREATE INDEX "idx_auditor_allocations_suggested_at" ON "auditor_allocations"("suggested_at");

-- Trigger para atualizar updated_at
CREATE TRIGGER update_auditor_allocations_updated_at
  BEFORE UPDATE ON "auditor_allocations"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. VIEWS ÚTEIS
-- ============================================================================

-- View: Disponibilidade dos Auditores
CREATE OR REPLACE VIEW "v_auditor_availability" AS
SELECT
  u.id AS auditor_id,
  u.name AS auditor_name,
  u.email AS auditor_email,
  COALESCE(ac.max_concurrent_audits, 3) AS max_concurrent_audits,
  COUNT(aa.id) AS current_allocations,
  COALESCE(ac.max_concurrent_audits, 3) - COUNT(aa.id) AS available_slots,
  CASE
    WHEN COUNT(aa.id) >= COALESCE(ac.max_concurrent_audits, 3) THEN 'indisponivel'
    WHEN COUNT(aa.id) >= COALESCE(ac.max_concurrent_audits, 3) * 0.7 THEN 'ocupado'
    WHEN COUNT(aa.id) >= COALESCE(ac.max_concurrent_audits, 3) * 0.4 THEN 'moderado'
    ELSE 'disponivel'
  END AS availability_status,
  ROUND(
    (COUNT(aa.id)::DECIMAL / COALESCE(ac.max_concurrent_audits, 3)) * 100,
    2
  ) AS workload_percentage
FROM
  "users" u
  LEFT JOIN "auditor_competencies" ac ON u.id = ac.auditor_id AND ac.is_active = TRUE
  LEFT JOIN "auditor_allocations" aa ON u.id = aa.allocated_auditor_id
    AND aa.status IN ('aprovada', 'modificada')
    AND aa.canceled_at IS NULL
WHERE
  u.role = 'auditor'
GROUP BY
  u.id, u.name, u.email, ac.max_concurrent_audits;

-- View: Estatísticas de Competências por Categoria
CREATE OR REPLACE VIEW "v_competency_statistics" AS
SELECT
  ic.id AS category_id,
  ic.code AS category_code,
  ic.name AS category_name,
  COUNT(DISTINCT ac.auditor_id) AS total_auditors,
  COUNT(DISTINCT CASE WHEN ac.competency_level = 'certificado' THEN ac.auditor_id END) AS certified_auditors,
  COUNT(DISTINCT CASE WHEN ac.competency_level = 'avancado' THEN ac.auditor_id END) AS advanced_auditors,
  COUNT(DISTINCT CASE WHEN ac.competency_level = 'intermediario' THEN ac.auditor_id END) AS intermediate_auditors,
  COUNT(DISTINCT CASE WHEN ac.competency_level = 'basico' THEN ac.auditor_id END) AS basic_auditors,
  ROUND(AVG(ac.audits_completed), 2) AS avg_audits_completed,
  ROUND(AVG(ac.success_rate), 2) AS avg_success_rate
FROM
  "industrial_categories" ic
  LEFT JOIN "auditor_competencies" ac ON ic.id = ac.industrial_category_id
    AND ac.is_active = TRUE
GROUP BY
  ic.id, ic.code, ic.name
ORDER BY
  ic.code;

-- View: Performance de Alocações
CREATE OR REPLACE VIEW "v_allocation_performance" AS
SELECT
  aa.allocated_by AS manager_id,
  u.name AS manager_name,
  COUNT(*) AS total_allocations,
  COUNT(CASE WHEN aa.status = 'aprovada' THEN 1 END) AS approved_suggestions,
  COUNT(CASE WHEN aa.status = 'modificada' THEN 1 END) AS modified_allocations,
  COUNT(CASE WHEN aa.status = 'rejeitada' THEN 1 END) AS rejected_suggestions,
  ROUND(
    (COUNT(CASE WHEN aa.status = 'aprovada' THEN 1 END)::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
    2
  ) AS approval_rate,
  ROUND(AVG(aa.match_score), 2) AS avg_match_score,
  ROUND(
    AVG(EXTRACT(EPOCH FROM (aa.decided_at - aa.suggested_at)) / 60),
    2
  ) AS avg_decision_time_minutes
FROM
  "auditor_allocations" aa
  LEFT JOIN "users" u ON aa.allocated_by = u.id
WHERE
  aa.decided_at IS NOT NULL
GROUP BY
  aa.allocated_by, u.name;

-- ============================================================================
-- 5. FUNÇÕES ÚTEIS
-- ============================================================================

-- Função: Obter auditores disponíveis para uma categoria
CREATE OR REPLACE FUNCTION get_available_auditors_for_category(
  p_category_id UUID,
  p_min_level CompetencyLevel DEFAULT 'basico'
)
RETURNS TABLE (
  auditor_id UUID,
  auditor_name VARCHAR,
  competency_level CompetencyLevel,
  years_experience INTEGER,
  audits_completed INTEGER,
  success_rate DECIMAL,
  current_allocations BIGINT,
  max_concurrent_audits INTEGER,
  is_available BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.name,
    ac.competency_level,
    ac.years_experience,
    ac.audits_completed,
    ac.success_rate,
    COUNT(aa.id) AS current_allocations,
    ac.max_concurrent_audits,
    (COUNT(aa.id) < ac.max_concurrent_audits) AS is_available
  FROM
    "users" u
    INNER JOIN "auditor_competencies" ac ON u.id = ac.auditor_id
    LEFT JOIN "auditor_allocations" aa ON u.id = aa.allocated_auditor_id
      AND aa.status IN ('aprovada', 'modificada')
      AND aa.canceled_at IS NULL
  WHERE
    u.role = 'auditor'
    AND ac.is_active = TRUE
    AND ac.industrial_category_id = p_category_id
    AND ac.competency_level >= p_min_level
  GROUP BY
    u.id, u.name, ac.competency_level, ac.years_experience,
    ac.audits_completed, ac.success_rate, ac.max_concurrent_audits
  HAVING
    COUNT(aa.id) < ac.max_concurrent_audits
  ORDER BY
    ac.competency_level DESC,
    ac.success_rate DESC,
    ac.audits_completed DESC;
END;
$$ LANGUAGE plpgsql;

-- Função: Calcular workload de um auditor
CREATE OR REPLACE FUNCTION calculate_auditor_workload(
  p_auditor_id UUID
)
RETURNS TABLE (
  current_audits INTEGER,
  max_audits INTEGER,
  workload_percentage DECIMAL,
  status TEXT
) AS $$
DECLARE
  v_current INTEGER;
  v_max INTEGER;
  v_percentage DECIMAL;
  v_status TEXT;
BEGIN
  -- Busca capacidade máxima
  SELECT COALESCE(MAX(max_concurrent_audits), 3)
  INTO v_max
  FROM auditor_competencies
  WHERE auditor_id = p_auditor_id AND is_active = TRUE;

  -- Conta alocações ativas
  SELECT COUNT(*)
  INTO v_current
  FROM auditor_allocations
  WHERE allocated_auditor_id = p_auditor_id
    AND status IN ('aprovada', 'modificada')
    AND canceled_at IS NULL;

  -- Calcula porcentagem
  v_percentage := (v_current::DECIMAL / v_max) * 100;

  -- Define status
  IF v_percentage >= 100 THEN
    v_status := 'completo';
  ELSIF v_percentage >= 70 THEN
    v_status := 'alto';
  ELSIF v_percentage >= 40 THEN
    v_status := 'moderado';
  ELSE
    v_status := 'baixo';
  END IF;

  RETURN QUERY SELECT v_current, v_max, ROUND(v_percentage, 2), v_status;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. DADOS DE EXEMPLO (SEED)
-- ============================================================================

-- Inserir competências para auditores existentes
-- NOTA: Ajustar IDs conforme seu banco de dados

-- Exemplo: Auditor especializado em Alimentos
/*
INSERT INTO auditor_competencies (
  auditor_id,
  industrial_category_id,
  competency_level,
  years_experience,
  audits_completed,
  success_rate,
  languages,
  max_concurrent_audits,
  certifications
) VALUES (
  'uuid-do-auditor-joao',
  'uuid-categoria-AI',
  'certificado',
  12,
  45,
  98.00,
  ARRAY['PT_BR', 'ES', 'EN'],
  3,
  '[
    {
      "name": "ISO 22000 Lead Auditor",
      "issuer": "BSI Group",
      "issuedAt": "2020-03-15",
      "validUntil": "2026-03-15"
    },
    {
      "name": "HACCP Certification",
      "issuer": "IFSQN",
      "issuedAt": "2019-06-20",
      "validUntil": "2025-06-20"
    }
  ]'::jsonb
);
*/

-- ============================================================================
-- 7. ROLLBACK (se necessário)
-- ============================================================================

/*
-- Para reverter esta migration:

DROP VIEW IF EXISTS v_allocation_performance;
DROP VIEW IF EXISTS v_competency_statistics;
DROP VIEW IF EXISTS v_auditor_availability;

DROP FUNCTION IF EXISTS calculate_auditor_workload(UUID);
DROP FUNCTION IF EXISTS get_available_auditors_for_category(UUID, CompetencyLevel);

DROP TABLE IF EXISTS auditor_allocations;
DROP TABLE IF EXISTS auditor_competencies;

DROP TYPE IF EXISTS AllocationStatus;
DROP TYPE IF EXISTS CompetencyLevel;
*/

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
