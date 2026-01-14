# 5. DDL - Criação de Tabelas

## 5.1 Extensions e Enums

```sql
-- Extensões PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";       -- UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";        -- Criptografia
CREATE EXTENSION IF NOT EXISTS "pg_trgm";         -- Fuzzy search
CREATE EXTENSION IF NOT EXISTS "vector";          -- pgvector (RAG)

-- === ENUMS ===

CREATE TYPE user_role AS ENUM ('empresa', 'analista', 'auditor', 'gestor');

CREATE TYPE request_type AS ENUM ('nova', 'renovacao', 'ampliacao');

CREATE TYPE certification_type AS ENUM ('C1', 'C2', 'C3', 'C4', 'C5', 'C6');

CREATE TYPE request_status AS ENUM ('rascunho', 'enviado', 'em_analise', 'aprovado', 'rejeitado');

CREATE TYPE process_status AS ENUM ('em_andamento', 'pendente', 'concluido', 'cancelado', 'suspenso');

CREATE TYPE product_origin AS ENUM ('animal', 'vegetal', 'misto', 'quimico');

CREATE TYPE document_type AS ENUM ('contrato_social', 'licenca_sanitaria', 'fotos', 'videos', 'laudos', 'manual_bpf', 'outros');

CREATE TYPE document_validation_status AS ENUM ('pendente', 'aprovado', 'rejeitado');

CREATE TYPE contract_type AS ENUM ('proposta', 'contrato');

CREATE TYPE contract_status AS ENUM ('rascunho', 'enviado', 'em_negociacao', 'assinado', 'cancelado');

CREATE TYPE audit_schedule_status AS ENUM ('disponivel', 'bloqueado', 'confirmado');

CREATE TYPE audit_type AS ENUM ('estagio1', 'estagio2', 'vigilancia', 'especial');

CREATE TYPE audit_status AS ENUM ('agendado', 'em_andamento', 'concluido', 'cancelado');

CREATE TYPE audit_result AS ENUM ('aprovado', 'aprovado_condicional', 'reprovado');

CREATE TYPE committee_decision_type AS ENUM ('aprovar', 'reprovar', 'solicitar_info');

CREATE TYPE certificate_status AS ENUM ('ativo', 'suspenso', 'cancelado', 'expirado');

CREATE TYPE ai_analysis_type AS ENUM ('pre_auditoria', 'risco', 'chatbot');

CREATE TYPE ai_status AS ENUM ('pendente', 'concluido', 'erro');

CREATE TYPE chat_role AS ENUM ('user', 'assistant', 'system');

CREATE TYPE notification_type AS ENUM ('info', 'warning', 'error', 'success');

CREATE TYPE audit_trail_entity AS ENUM ('process', 'contract', 'certificate', 'audit', 'document', 'user', 'company');

CREATE TYPE audit_trail_action AS ENUM ('create', 'update', 'delete', 'approve', 'reject', 'sign', 'cancel');
```

---

## 5.2 Tabela: `users`

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    mfa_config JSONB,  -- {secret: string, backup_codes: string[]}
    mfa_enabled BOOLEAN NOT NULL DEFAULT false,
    login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Constraint: email válido
ALTER TABLE users ADD CONSTRAINT email_valid
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

COMMENT ON TABLE users IS 'Usuários do sistema (4 roles: empresa, analista, auditor, gestor)';
COMMENT ON COLUMN users.mfa_config IS 'TOTP secret e backup codes para MFA';
COMMENT ON COLUMN users.login_attempts IS 'Contador para rate limiting (reset após login bem-sucedido)';
```

---

## 5.3 Tabela: `companies`

```sql
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cnpj VARCHAR(14) UNIQUE NOT NULL,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    address JSONB NOT NULL,  -- {cep, logradouro, numero, complemento, bairro, cidade, uf, pais}
    contact JSONB NOT NULL,  -- {email, telefone, whatsapp, responsavel}
    website VARCHAR(255),
    num_employees INTEGER,
    annual_revenue DECIMAL(15,2),
    main_activity TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_companies_cnpj ON companies(cnpj);

-- Trigger updated_at
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Constraint: CNPJ válido (14 dígitos)
ALTER TABLE companies ADD CONSTRAINT cnpj_valid
    CHECK (cnpj ~ '^\d{14}$');

COMMENT ON TABLE companies IS 'Dados cadastrais das empresas solicitantes de certificação';
COMMENT ON COLUMN companies.address IS 'Endereço completo em formato JSON';
COMMENT ON COLUMN companies.contact IS 'Informações de contato da empresa';
```

---

## 5.4 Tabela: `requests`

```sql
CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    type request_type NOT NULL,
    certification_type certification_type NOT NULL,
    num_products INTEGER NOT NULL,
    additional_info JSONB,  -- Respostas do wizard (9 etapas)
    estimated_cost DECIMAL(15,2),
    status request_status NOT NULL DEFAULT 'rascunho',
    submitted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_requests_company_id ON requests(company_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_submitted_at ON requests(submitted_at);

-- Trigger updated_at
CREATE TRIGGER update_requests_updated_at
    BEFORE UPDATE ON requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Constraint: num_products positivo
ALTER TABLE requests ADD CONSTRAINT num_products_positive
    CHECK (num_products > 0);

COMMENT ON TABLE requests IS 'Solicitações de certificação (output do wizard US-002)';
COMMENT ON COLUMN requests.additional_info IS 'Respostas das 9 etapas do wizard';
COMMENT ON COLUMN requests.estimated_cost IS 'Custo calculado pela IA (US-005)';
```

---

## 5.5 Tabela: `certification_processes`

```sql
CREATE TABLE certification_processes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID UNIQUE NOT NULL REFERENCES requests(id) ON DELETE RESTRICT,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    analyst_id UUID REFERENCES users(id) ON DELETE SET NULL,
    auditor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    current_phase INTEGER NOT NULL DEFAULT 1,
    status process_status NOT NULL DEFAULT 'em_andamento',
    deadline DATE,
    priority INTEGER DEFAULT 3,
    phase_metadata JSONB,  -- Dados específicos de cada fase
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_processes_request_id ON certification_processes(request_id);
CREATE INDEX idx_processes_company_id ON certification_processes(company_id);
CREATE INDEX idx_processes_analyst_id ON certification_processes(analyst_id);
CREATE INDEX idx_processes_auditor_id ON certification_processes(auditor_id);
CREATE INDEX idx_processes_current_phase ON certification_processes(current_phase);
CREATE INDEX idx_processes_status ON certification_processes(status);
CREATE INDEX idx_processes_priority ON certification_processes(priority);
CREATE INDEX idx_processes_deadline ON certification_processes(deadline);

-- Trigger updated_at
CREATE TRIGGER update_processes_updated_at
    BEFORE UPDATE ON certification_processes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Constraints
ALTER TABLE certification_processes ADD CONSTRAINT current_phase_valid
    CHECK (current_phase BETWEEN 1 AND 12);

ALTER TABLE certification_processes ADD CONSTRAINT priority_valid
    CHECK (priority BETWEEN 1 AND 5);

COMMENT ON TABLE certification_processes IS 'Processo completo de certificação (12 fases PR 7.1 Rev 21)';
COMMENT ON COLUMN certification_processes.current_phase IS 'Fase atual do processo (1-12 conforme PR 7.1)';
COMMENT ON COLUMN certification_processes.priority IS '1 (urgente) - 5 (baixa)';
```

---

## 5.6 Tabela: `process_history`

```sql
CREATE TABLE process_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    process_id UUID NOT NULL REFERENCES certification_processes(id) ON DELETE CASCADE,
    from_phase INTEGER NOT NULL,
    to_phase INTEGER NOT NULL,
    changed_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_process_history_process_id ON process_history(process_id);
CREATE INDEX idx_process_history_created_at ON process_history(created_at);

COMMENT ON TABLE process_history IS 'Histórico de mudanças de fase (rastreabilidade ISO 17065)';
```

---

## 5.7 Tabela: `product_categories`

```sql
CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code certification_type UNIQUE NOT NULL,
    name_pt VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    name_tr VARCHAR(255),
    description TEXT,
    standard_reference VARCHAR(255),  -- "GSO 2055-2 seção 4.1"
    requirements JSONB,  -- Requisitos específicos da categoria
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_product_categories_code ON product_categories(code);

COMMENT ON TABLE product_categories IS 'Categorias de produtos Halal (C1-C6 conforme GSO 2055-2 e SMIIC 02)';

-- Seed data (categorias padrão)
INSERT INTO product_categories (code, name_pt, name_en, name_ar, name_tr, standard_reference) VALUES
('C1', 'Carne e Derivados', 'Meat and Derivatives', 'اللحوم ومشتقاتها', 'Et ve Türevleri', 'GSO 2055-2 Section 4.1'),
('C2', 'Leite e Derivados', 'Milk and Derivatives', 'الحليب ومشتقاته', 'Süt ve Türevleri', 'GSO 2055-2 Section 4.2'),
('C3', 'Produtos Vegetais', 'Vegetable Products', 'المنتجات النباتية', 'Bitkisel Ürünler', 'GSO 2055-2 Section 4.3'),
('C4', 'Aditivos e Ingredientes', 'Additives and Ingredients', 'المضافات والمكونات', 'Katkı Maddeleri ve İçerikler', 'GSO 2055-2 Section 4.4'),
('C5', 'Cosméticos', 'Cosmetics', 'مستحضرات التجميل', 'Kozmetikler', 'SMIIC 02 Section 5'),
('C6', 'Farmacêuticos', 'Pharmaceuticals', 'الأدوية', 'İlaçlar', 'SMIIC 02 Section 6');
```

---

## 5.8 Tabela: `products`

```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    process_id UUID NOT NULL REFERENCES certification_processes(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES product_categories(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    origin product_origin NOT NULL,
    description TEXT,
    composition JSONB,  -- [{ingredient: string, percentage: number}]
    manufacturing_process JSONB,  -- Etapas de fabricação
    ncm_code VARCHAR(8),
    is_exported BOOLEAN DEFAULT false,
    export_countries JSONB,  -- ['BR', 'UAE', 'SAU']
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_products_process_id ON products(process_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_name ON products USING gin(to_tsvector('portuguese', name));

-- Trigger updated_at
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE products IS 'Produtos a serem certificados em cada processo';
COMMENT ON COLUMN products.composition IS 'Array de ingredientes com percentuais';
```

---

## 5.9 Tabela: `documents`

```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    process_id UUID NOT NULL REFERENCES certification_processes(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    type document_type NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    storage_key VARCHAR(500) NOT NULL,  -- S3 path
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,  -- bytes
    checksum VARCHAR(64),  -- SHA-256
    is_required BOOLEAN DEFAULT false,
    validation_status document_validation_status NOT NULL DEFAULT 'pendente',
    rejection_reason TEXT,
    validated_at TIMESTAMP,
    validated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_documents_process_id ON documents(process_id);
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_validation_status ON documents(validation_status);

COMMENT ON TABLE documents IS 'Documentos uploadados (contratos, licenças, fotos, vídeos, laudos)';
COMMENT ON COLUMN documents.storage_key IS 'Path no S3: uploads/{company_id}/{process_id}/{file_id}';
COMMENT ON COLUMN documents.checksum IS 'SHA-256 para integridade';
```

---

## 5.10 Tabela: `contracts`

```sql
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    process_id UUID NOT NULL REFERENCES certification_processes(id) ON DELETE CASCADE,
    type contract_type NOT NULL,
    contract_number VARCHAR(50) UNIQUE,
    total_value DECIMAL(15,2) NOT NULL,
    installments INTEGER DEFAULT 1,
    payment_terms TEXT,
    line_items JSONB,  -- Detalhamento de custos
    special_clauses TEXT,
    status contract_status NOT NULL DEFAULT 'rascunho',
    sent_at TIMESTAMP,
    signed_at TIMESTAMP,
    signature_ip VARCHAR(45),
    signature_metadata JSONB,  -- {device, location, user_agent}
    pdf_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_contracts_process_id ON contracts(process_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_number ON contracts(contract_number);

-- Trigger updated_at
CREATE TRIGGER update_contracts_updated_at
    BEFORE UPDATE ON contracts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Constraint: total_value positivo
ALTER TABLE contracts ADD CONSTRAINT total_value_positive
    CHECK (total_value > 0);

COMMENT ON TABLE contracts IS 'Propostas comerciais e contratos (US-011, US-012)';
COMMENT ON COLUMN contracts.line_items IS 'Detalhamento: [{item, description, quantity, unit_price, total}]';
```

---

## 5.11 Tabela: `audit_schedules`

```sql
CREATE TABLE audit_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auditor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    schedule_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status audit_schedule_status NOT NULL DEFAULT 'disponivel',
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_audit_schedules_auditor_id ON audit_schedules(auditor_id);
CREATE INDEX idx_audit_schedules_date ON audit_schedules(schedule_date);
CREATE INDEX idx_audit_schedules_status ON audit_schedules(status);

-- Constraint: end_time > start_time
ALTER TABLE audit_schedules ADD CONSTRAINT valid_time_range
    CHECK (end_time > start_time);

COMMENT ON TABLE audit_schedules IS 'Calendário de disponibilidade dos auditores (US-028)';
```

---

## 5.12 Tabela: `audits`

```sql
CREATE TABLE audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    process_id UUID NOT NULL REFERENCES certification_processes(id) ON DELETE CASCADE,
    auditor_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    schedule_id UUID REFERENCES audit_schedules(id) ON DELETE SET NULL,
    type audit_type NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    location JSONB,  -- Endereço da empresa ou {type: 'remoto'}
    status audit_status NOT NULL DEFAULT 'agendado',
    duration_minutes INTEGER,
    observations TEXT,
    score DECIMAL(5,2),  -- 0-100
    result audit_result,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_audits_process_id ON audits(process_id);
CREATE INDEX idx_audits_auditor_id ON audits(auditor_id);
CREATE INDEX idx_audits_type ON audits(type);
CREATE INDEX idx_audits_status ON audits(status);
CREATE INDEX idx_audits_scheduled_date ON audits(scheduled_date);

-- Trigger updated_at
CREATE TRIGGER update_audits_updated_at
    BEFORE UPDATE ON audits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Constraint: score entre 0 e 100
ALTER TABLE audits ADD CONSTRAINT score_valid
    CHECK (score IS NULL OR (score BETWEEN 0 AND 100));

COMMENT ON TABLE audits IS 'Auditorias Estágio 1, Estágio 2, Vigilância (US-031 a US-035)';
```

---

## 5.13 Tabela: `audit_checklists`

```sql
CREATE TABLE audit_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    checklist_template VARCHAR(255) NOT NULL,  -- "PR 7.1 Rev 21 Section X"
    items JSONB NOT NULL,  -- [{question, answer, evidence_url, notes, is_conforming}]
    total_items INTEGER NOT NULL,
    conforming_items INTEGER NOT NULL,
    non_conforming_items INTEGER NOT NULL,
    compliance_percentage DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_audit_checklists_audit_id ON audit_checklists(audit_id);

-- Trigger updated_at
CREATE TRIGGER update_audit_checklists_updated_at
    BEFORE UPDATE ON audit_checklists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE audit_checklists IS 'Checklists de auditoria (PR 7.1 Rev 21 digitalizado - US-033)';
COMMENT ON COLUMN audit_checklists.items IS 'Array de itens do checklist com evidências';
```

---

## 5.14 Tabela: `committee_decisions`

```sql
CREATE TABLE committee_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    process_id UUID NOT NULL REFERENCES certification_processes(id) ON DELETE CASCADE,
    decided_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    decision committee_decision_type NOT NULL,
    justification TEXT NOT NULL,
    voting_details JSONB,  -- Se houver votação: [{member, vote, comments}]
    decided_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_committee_decisions_process_id ON committee_decisions(process_id);
CREATE INDEX idx_committee_decisions_decision ON committee_decisions(decision);

COMMENT ON TABLE committee_decisions IS 'Deliberações do Comitê Técnico (US-041, US-042)';
```

---

## 5.15 Tabela: `certificates`

```sql
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    process_id UUID UNIQUE NOT NULL REFERENCES certification_processes(id) ON DELETE RESTRICT,
    certificate_number VARCHAR(50) UNIQUE NOT NULL,
    issued_date DATE NOT NULL,
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    certified_products JSONB NOT NULL,  -- Array de produtos certificados
    pdf_url VARCHAR(500) NOT NULL,
    qr_code_data VARCHAR(500) NOT NULL,  -- URL de verificação
    status certificate_status NOT NULL DEFAULT 'ativo',
    suspension_reason TEXT,
    suspended_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_certificates_number ON certificates(certificate_number);
CREATE INDEX idx_certificates_process_id ON certificates(process_id);
CREATE INDEX idx_certificates_status ON certificates(status);
CREATE INDEX idx_certificates_valid_until ON certificates(valid_until);

-- Trigger updated_at
CREATE TRIGGER update_certificates_updated_at
    BEFORE UPDATE ON certificates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Constraint: valid_until > valid_from
ALTER TABLE certificates ADD CONSTRAINT valid_dates
    CHECK (valid_until > valid_from);

-- Function para gerar certificate_number
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.certificate_number IS NULL THEN
        NEW.certificate_number := 'HS-' ||
            TO_CHAR(NEW.issued_date, 'YYYY') || '-' ||
            LPAD(NEXTVAL('certificate_number_seq')::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE certificate_number_seq START 1;

CREATE TRIGGER generate_certificate_number_trigger
    BEFORE INSERT ON certificates
    FOR EACH ROW
    EXECUTE FUNCTION generate_certificate_number();

COMMENT ON TABLE certificates IS 'Certificados Halal emitidos (US-044)';
COMMENT ON COLUMN certificates.qr_code_data IS 'URL para verificação pública: https://halalsphere.com/verify/{cert_id}';
```

---

## 5.16 Tabela: `ai_analysis`

```sql
CREATE TABLE ai_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    process_id UUID REFERENCES certification_processes(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    analysis_type ai_analysis_type NOT NULL,
    model_used VARCHAR(100) NOT NULL,
    input_data JSONB NOT NULL,
    output_data JSONB NOT NULL,
    confidence_score DECIMAL(5,4),  -- 0.0000 - 1.0000
    tokens_used INTEGER,
    cost_usd DECIMAL(10,4),
    processing_time_ms INTEGER,
    status ai_status NOT NULL DEFAULT 'pendente',
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_ai_analysis_process_id ON ai_analysis(process_id);
CREATE INDEX idx_ai_analysis_type ON ai_analysis(analysis_type);
CREATE INDEX idx_ai_analysis_created_at ON ai_analysis(created_at DESC);

COMMENT ON TABLE ai_analysis IS 'Análises realizadas por IA (US-047, US-048, US-049)';
COMMENT ON COLUMN ai_analysis.confidence_score IS 'Score de confiança da IA (0.0 - 1.0)';
```

---

## 5.17 Tabela: `chat_messages`

```sql
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    process_id UUID REFERENCES certification_processes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role chat_role NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB,  -- {context, intent, entities}
    session_id VARCHAR(100),
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_chat_messages_process_id ON chat_messages(process_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);

COMMENT ON TABLE chat_messages IS 'Mensagens do chatbot RAG multilíngue (US-049)';
COMMENT ON COLUMN chat_messages.role IS 'user (usuário), assistant (IA), system (sistema)';
```

---

## 5.18 Tabela: `notifications`

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    action_url JSONB,  -- {url: string, label: string}
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

COMMENT ON TABLE notifications IS 'Notificações em tempo real (US-024, US-053)';
```

---

## 5.19 Tabela: `audit_trail`

```sql
CREATE TABLE audit_trail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    entity_type audit_trail_entity NOT NULL,
    entity_id UUID NOT NULL,
    action audit_trail_action NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_audit_trail_user_id ON audit_trail(user_id);
CREATE INDEX idx_audit_trail_entity ON audit_trail(entity_type, entity_id);
CREATE INDEX idx_audit_trail_action ON audit_trail(action);
CREATE INDEX idx_audit_trail_created_at ON audit_trail(created_at DESC);

COMMENT ON TABLE audit_trail IS 'Log de auditoria completo (LGPD, ISO 17065 - retenção 3 anos)';
COMMENT ON COLUMN audit_trail.old_values IS 'Valores antes da mudança (para UPDATE)';
COMMENT ON COLUMN audit_trail.new_values IS 'Valores após a mudança (para CREATE/UPDATE)';
```

---

