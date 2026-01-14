# 4. Dicionário de Dados

## 4.1 Tabela: `users`

Armazena todos os usuários do sistema (4 roles).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PK, NOT NULL, DEFAULT uuid_generate_v4() | Identificador único |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email de login |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt hash (cost=12) |
| `role` | ENUM | NOT NULL | 'empresa', 'analista', 'auditor', 'gestor' |
| `name` | VARCHAR(255) | NOT NULL | Nome completo |
| `phone` | VARCHAR(20) | NULL | Telefone (formato internacional) |
| `mfa_config` | JSONB | NULL | `{secret, backup_codes[]}` para TOTP |
| `mfa_enabled` | BOOLEAN | NOT NULL, DEFAULT false | MFA ativado? |
| `login_attempts` | INTEGER | NOT NULL, DEFAULT 0 | Tentativas de login (rate limiting) |
| `locked_until` | TIMESTAMP | NULL | Bloqueio temporário (após 5 tentativas) |
| `last_login` | TIMESTAMP | NULL | Último login bem-sucedido |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Data de criação |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Data de atualização |

**Índices**:
- `idx_users_email` (UNIQUE)
- `idx_users_role`

---

## 4.2 Tabela: `companies`

Dados cadastrais das empresas solicitantes.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PK, NOT NULL | Identificador único |
| `user_id` | UUID | FK users(id), NOT NULL | Usuário proprietário |
| `cnpj` | VARCHAR(14) | UNIQUE, NOT NULL | CNPJ (apenas números) |
| `razao_social` | VARCHAR(255) | NOT NULL | Razão social |
| `nome_fantasia` | VARCHAR(255) | NULL | Nome fantasia |
| `address` | JSONB | NOT NULL | `{cep, logradouro, numero, complemento, bairro, cidade, uf, pais}` |
| `contact` | JSONB | NOT NULL | `{email, telefone, whatsapp, responsavel}` |
| `website` | VARCHAR(255) | NULL | Site da empresa |
| `num_employees` | INTEGER | NULL | Número de funcionários |
| `annual_revenue` | DECIMAL(15,2) | NULL | Faturamento anual (BRL) |
| `main_activity` | TEXT | NULL | Atividade principal (CNAE) |
| `created_at` | TIMESTAMP | NOT NULL | Data de cadastro |
| `updated_at` | TIMESTAMP | NOT NULL | Última atualização |

**Índices**:
- `idx_companies_cnpj` (UNIQUE)
- `idx_companies_user_id`

---

## 4.3 Tabela: `requests`

Solicitações iniciais de certificação (output do wizard US-002).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PK, NOT NULL | ID da solicitação |
| `company_id` | UUID | FK companies(id), NOT NULL | Empresa solicitante |
| `type` | ENUM | NOT NULL | 'nova', 'renovacao', 'ampliacao' |
| `certification_type` | ENUM | NOT NULL | 'C1', 'C2', 'C3', 'C4', 'C5', 'C6' (GSO 2055-2) |
| `num_products` | INTEGER | NOT NULL | Quantidade de produtos |
| `additional_info` | JSONB | NULL | Respostas do wizard (etapas 1-6) |
| `estimated_cost` | DECIMAL(15,2) | NULL | Calculado pela IA (US-005) |
| `status` | ENUM | NOT NULL, DEFAULT 'rascunho' | 'rascunho', 'enviado', 'em_analise', 'aprovado', 'rejeitado' |
| `submitted_at` | TIMESTAMP | NULL | Quando foi enviada |
| `created_at` | TIMESTAMP | NOT NULL | Início do preenchimento |
| `updated_at` | TIMESTAMP | NOT NULL | Último auto-save |

**Índices**:
- `idx_requests_company_id`
- `idx_requests_status`

---

## 4.4 Tabela: `certification_processes`

Processo completo de certificação (12 fases PR 7.1).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PK, NOT NULL | ID do processo |
| `request_id` | UUID | FK requests(id), UNIQUE, NOT NULL | Solicitação origem |
| `company_id` | UUID | FK companies(id), NOT NULL | Empresa |
| `analyst_id` | UUID | FK users(id), NULL | Analista responsável |
| `auditor_id` | UUID | FK users(id), NULL | Auditor designado |
| `current_phase` | INTEGER | NOT NULL, DEFAULT 1 | Fase atual (1-12) |
| `status` | ENUM | NOT NULL | 'em_andamento', 'pendente', 'concluido', 'cancelado', 'suspenso' |
| `deadline` | DATE | NULL | Prazo de conclusão |
| `priority` | INTEGER | DEFAULT 3 | 1 (urgente) - 5 (baixa) |
| `phase_metadata` | JSONB | NULL | Dados específicos de cada fase |
| `started_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Início do processo |
| `completed_at` | TIMESTAMP | NULL | Conclusão do processo |
| `created_at` | TIMESTAMP | NOT NULL | Criação do registro |
| `updated_at` | TIMESTAMP | NOT NULL | Última atualização |

**Índices**:
- `idx_processes_request_id` (UNIQUE)
- `idx_processes_company_id`
- `idx_processes_analyst_id`
- `idx_processes_current_phase`
- `idx_processes_status`
- `idx_processes_priority`

---

## 4.5 Tabela: `products`

Produtos a serem certificados em cada processo.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PK, NOT NULL | ID do produto |
| `process_id` | UUID | FK certification_processes(id), NOT NULL | Processo relacionado |
| `category_id` | UUID | FK product_categories(id), NOT NULL | Categoria (C1-C6) |
| `name` | VARCHAR(255) | NOT NULL | Nome do produto |
| `origin` | ENUM | NOT NULL | 'animal', 'vegetal', 'misto', 'quimico' |
| `description` | TEXT | NULL | Descrição detalhada |
| `composition` | JSONB | NULL | `[{ingredient, percentage}]` |
| `manufacturing_process` | JSONB | NULL | Etapas de fabricação |
| `ncm_code` | VARCHAR(8) | NULL | Código NCM fiscal |
| `is_exported` | BOOLEAN | DEFAULT false | Produto será exportado? |
| `export_countries` | JSONB | NULL | `['BR', 'UAE', 'SAU']` |
| `created_at` | TIMESTAMP | NOT NULL | Data de cadastro |
| `updated_at` | TIMESTAMP | NOT NULL | Última atualização |

**Índices**:
- `idx_products_process_id`
- `idx_products_category_id`

---

## 4.6 Tabela: `certificates`

Certificados Halal emitidos (US-044).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PK, NOT NULL | ID do certificado |
| `process_id` | UUID | FK certification_processes(id), UNIQUE, NOT NULL | Processo certificado |
| `certificate_number` | VARCHAR(50) | UNIQUE, NOT NULL | 'HS-2025-00001' |
| `issued_date` | DATE | NOT NULL | Data de emissão |
| `valid_from` | DATE | NOT NULL | Início da validade |
| `valid_until` | DATE | NOT NULL | Fim da validade (3 anos) |
| `certified_products` | JSONB | NOT NULL | Array de produtos certificados |
| `pdf_url` | VARCHAR(500) | NOT NULL | URL do PDF no S3 |
| `qr_code_data` | VARCHAR(500) | NOT NULL | URL de verificação |
| `status` | ENUM | NOT NULL, DEFAULT 'ativo' | 'ativo', 'suspenso', 'cancelado', 'expirado' |
| `suspension_reason` | TEXT | NULL | Motivo de suspensão |
| `suspended_at` | TIMESTAMP | NULL | Data de suspensão |
| `created_at` | TIMESTAMP | NOT NULL | Criação do registro |
| `updated_at` | TIMESTAMP | NOT NULL | Última atualização |

**Índices**:
- `idx_certificates_number` (UNIQUE)
- `idx_certificates_process_id` (UNIQUE)
- `idx_certificates_status`
- `idx_certificates_valid_until`

---

## 4.7 Tabela: `ai_analysis`

Análises realizadas por IA (US-047, US-048, US-049).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PK, NOT NULL | ID da análise |
| `process_id` | UUID | FK certification_processes(id), NULL | Processo relacionado |
| `requested_by` | UUID | FK users(id), NOT NULL | Quem solicitou |
| `analysis_type` | ENUM | NOT NULL | 'pre_auditoria', 'risco', 'chatbot' |
| `model_used` | VARCHAR(100) | NOT NULL | 'gpt-4o-2024-11-20' |
| `input_data` | JSONB | NOT NULL | Documentos, prompt, contexto |
| `output_data` | JSONB | NOT NULL | Resultados estruturados |
| `confidence_score` | DECIMAL(5,4) | NULL | 0.0000 - 1.0000 |
| `tokens_used` | INTEGER | NULL | Custo em tokens |
| `cost_usd` | DECIMAL(10,4) | NULL | Custo em USD |
| `processing_time_ms` | INTEGER | NULL | Tempo de processamento |
| `status` | ENUM | NOT NULL | 'pendente', 'concluido', 'erro' |
| `error_message` | TEXT | NULL | Se status=erro |
| `created_at` | TIMESTAMP | NOT NULL | Data da solicitação |

**Índices**:
- `idx_ai_analysis_process_id`
- `idx_ai_analysis_type`
- `idx_ai_analysis_created_at`

---

## 4.8 Outras Tabelas (Resumo)

| Tabela | Propósito | Colunas Principais |
|--------|-----------|-------------------|
| `process_history` | Rastreamento de mudanças de fase | process_id, from_phase, to_phase, changed_by, reason |
| `product_categories` | Categorias C1-C6 (GSO 2055-2) | code, name (i18n), standard_reference |
| `documents` | Uploads de documentos | process_id, type, storage_key, validation_status |
| `contracts` | Propostas e contratos | process_id, type, total_value, status, pdf_url |
| `audit_schedules` | Calendário de disponibilidade | auditor_id, schedule_date, status |
| `audits` | Auditorias Estágio 1/2 | process_id, auditor_id, type, result, score |
| `audit_checklists` | Checklists PR 7.1 Rev 21 | audit_id, items (JSONB), compliance_percentage |
| `committee_decisions` | Deliberações do comitê | process_id, decision, justification |
| `chat_messages` | Mensagens do chatbot RAG | user_id, message, session_id |
| `notifications` | Notificações em tempo real | user_id, type, message, is_read |
| `audit_trail` | Log de auditoria (LGPD/ISO) | user_id, entity_type, action, old_values, new_values |

---

