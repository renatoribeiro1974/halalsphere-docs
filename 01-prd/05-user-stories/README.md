# User Stories Detalhadas

**69 User Stories | 594 Story Points | 8 Épicos**

🟢 **Status Atual**: 70% Implementado (Dezembro 2025)

📄 **Análise Completa**: Ver [ANALISE-PROJETO-EPICOS-2025.md](../../ANALISE-PROJETO-EPICOS-2025.md)

---

## 📋 Épicos e User Stories

### Must Have (P0) - 6 Épicos, 468 SP | 🟢 75% Implementado

#### [Épico 1: Gestão de Solicitações e Onboarding](./epic-01-requests.md) 🟢 85%
**8 stories | 57 SP | Status: Quase Completo**

- ✅ US-001: Cadastro de Nova Empresa Solicitante (5 SP)
- ✅ US-002: Wizard de Solicitação de Certificação (13 SP) - 9 etapas
- ✅ US-003: Upload e Gestão de Documentos (8 SP)
- ✅ US-004: Dashboard de Status - 17 fases (8 SP)
- ✅ US-005: Calculadora de Custos (8 SP) - CalculatorService
- 🟡 US-006: Notificações (3 SP) - Schema pronto, falta emails
- ✅ US-007: Editar Rascunho (3 SP)
- ✅ US-008: Cancelar Solicitação (2 SP)

---

#### [Épico 2: Gestão Comercial e Contratual](./epic-02-contracts.md) 🚀 🟡 75%
**9 stories | 81 SP | Status: Funcional, faltam features avançadas**

- ✅ US-009: Config Tabelas de Preço (8 SP) - PricingTable
- ✅ US-010: Cálculo Automático de Proposta (13 SP) - Inovação #1 ✅
- 🟡 US-011: Geração de PDF Profissional (8 SP) - Preparado
- 🔴 US-012: Templates de Contratos (8 SP) - Não iniciado
- ✅ US-013: Geração Auto de Contrato (8 SP)
- 🔴 US-014: Interface Colaborativa (13 SP) - Não iniciado
- 🔴 US-015: Versionamento (5 SP) - Não iniciado
- ✅ US-016: Aprovação Final (5 SP)
- 🟡 US-017: Assinatura Digital (13 SP) - Schema pronto, falta integração

---

#### [Épico 3: Análise e Preparação](./epic-03-analysis.md) 🚀 🟢 90%
**12 stories | 94 SP | Status: Quase Completo**

- ✅ US-018: Kanban de Processos (8 SP) - Com lazy loading
- 🟡 US-019: Atribuição Automática (5 SP) - Apenas manual
- ✅ US-020: Revisão de Solicitação (8 SP)
- ✅ US-021: Enquadramento GSO (8 SP) - 3 níveis hierárquicos
- ✅ US-022: Checklist Estágio 1 (8 SP) - 5 seções
- ✅ US-023: Solicitação de Docs (5 SP) - DocumentRequest ✅
- ✅ US-023.1: Sistema de Comentários (5 SP) - Com @mentions ✅
- ✅ US-023.2: Agendamento Auditorias (8 SP) - Backend completo ✅
- 🔴 US-024: Assistência IA (13 SP) - Não iniciado
- ✅ US-025: Cadastro Auditores (5 SP)
- 🔴 US-026: Matching Inteligente (13 SP) - Algoritmo pendente
- 🟡 US-027: Agend. Colaborativo (8 SP) - Falta interface empresa
- ✅ US-028: Calendário Visual (8 SP)
- 🔴 US-029: Briefing Auditor (5 SP) - Falta email

---

#### [Épico 4: Execução de Auditorias](./epic-04-audits.md) 🚀 🟢 95%
**10 stories | 97 SP | Status: Implementado**

- ✅ US-030: Dashboard Auditor (8 SP) - AuditorDashboard ✅
- ✅ US-031: Ver Processo (5 SP) - ProcessDetails ✅
- ✅ US-032: Ver Documentação (3 SP) - ProcessDocuments ✅
- ✅ US-033: Checklist Digital (13 SP) - AuditExecution com 5 seções ✅
- ✅ US-034: Upload Evidências (8 SP) - EvidenceCapture ✅
- ✅ US-035: Relatório de Auditoria (13 SP) - NonConformityForm ✅
- ✅ US-036: Enviar Relatório (5 SP) - Submit workflow ✅
- ✅ US-037: Histórico (5 SP) - AuditorReports ✅
- 🟡 US-038: Notificações (3 SP) - Falta emails
- 🔴 US-039: App Mobile (21 SP) - Futuro

---

#### [Épico 5: Decisão e Emissão de Certificados](./epic-05-decision.md) 🟡 60%
**9 stories | 60 SP | Status: Decisões OK, falta certificados**

- ✅ US-040: Dashboard Comitê (8 SP) - ManagerDashboard ✅
- ✅ US-041: Analisar Relatório (8 SP) - Via ProcessDetails ✅
- ✅ US-042: Decisão do Comitê (5 SP) - submitCommitteeDecision ✅
- 🟡 US-043: Solicitar Info (3 SP) - Via comentários
- 🔴 US-044: Emitir Certificado (13 SP) - Schema pronto, não implementado
- 🔴 US-045: Enviar Certificado (3 SP) - Não iniciado
- 🔴 US-046: Consulta Pública (5 SP) - Não iniciado
- ✅ US-047: Histórico (3 SP) - getCommitteeDecisions ✅
- 🔴 US-048: Notificações (2 SP) - Falta emails

---

#### [Épico 8: Infraestrutura e Fundação Técnica](./epic-08-infra.md) 🟢 85%
**9 stories | 79 SP | Status: Core completo**

- ✅ US-059: Autenticação (13 SP) - JWT + bloqueio ✅
- ✅ US-060: RBAC (8 SP) - 11 roles ✅
- ✅ US-061: Gestão Usuários (8 SP) - AdminService ✅
- ✅ US-062: Logs de Auditoria (8 SP) - AuditTrail ✅
- 🟡 US-063: Backup (8 SP) - Manual, não automatizado
- 🔴 US-064: Monitoramento (13 SP) - Não iniciado
- ✅ US-065: i18n (8 SP) - PT/ES/EN/AR no schema ✅
- ✅ US-066: Storage S3 (5 SP) - StorageConfig ✅
- 🔴 US-067: Email (5 SP) - Não iniciado (CRÍTICO MVP)

---

### Should Have (P1) - 2 Épicos, 126 SP | 🔴 15% Implementado

#### [Épico 6: Assistente IA Multilíngue](./epic-06-ai.md) 🤖 🔴 5%
**6 stories | 81 SP | Status: Não iniciado (P1)**

- 🔴 US-049: Chatbot RAG (21 SP) - Schema KnowledgeBase pronto
- 🔴 US-050: Análise Pré-Auditoria (21 SP) - Schema AiAnalysis pronto
- 🔴 US-051: Sugestões IA (13 SP) - Não iniciado
- 🔴 US-052: Base Conhecimento (13 SP) - Schema com pgvector
- 🔴 US-053: Feedback IA (5 SP) - Não iniciado
- 🔴 US-054: Métricas Uso (5 SP) - Não iniciado

---

#### [Épico 7: Gestão Administrativa e Dashboards](./epic-07-admin.md) 📊 🟢 80%
**6 stories | 45 SP | Status: Core completo**

- ✅ US-055: Dashboard Gestor (13 SP) - ManagerDashboard ✅
- ✅ US-056: Relatórios (8 SP) - 3 tipos implementados ✅
- ✅ US-057: Config Sistema (5 SP) - Storage + ESignature ✅
- 🔴 US-058: Exportação (5 SP) - Não iniciado
- ✅ US-059: Auditoria (8 SP) - AuditTrail ✅
- 🔴 US-060: Renovação (8 SP) - Não iniciado

---

## 📊 Legenda de Status

- ✅ **Completo**: Implementado e testado
- 🟢 **Verde (>80%)**: Épico quase completo
- 🟡 **Amarelo (50-80%)**: Épico parcialmente implementado
- 🔴 **Vermelho (<50%)**: Épico não iniciado ou com pouca implementação

---

## 🎯 Resumo de Implementação (Dezembro 2025)

### ✅ O Que Está Funcionando
1. **Fluxo Completo de Certificação** (17 fases)
2. **Sistema de Propostas** com cálculo automático
3. **Gestão de Auditorias** completa (agendamento + execução)
4. **Dashboard Kanban** para analistas
5. **Dashboard Executivo** para gestores
6. **Sistema de Comentários** e solicitação de documentos
7. **RBAC** com 11 tipos de usuários
8. **Classificação Industrial** GSO 2055-2 (3 níveis)

### 🟡 O Que Está Parcial
1. **Contratos** - Falta interface colaborativa e assinatura digital integrada
2. **Notificações** - Schema pronto, falta envio de emails
3. **PDFs** - Backend pronto, falta templates profissionais

### 🔴 O Que Falta para MVP
1. **Sistema de Emails** (SendGrid/AWS SES) - CRÍTICO
2. **Emissão de Certificados** (PDF + QR Code + Consulta Pública)
3. **Assinatura Eletrônica** (D4Sign/Docusign integração)

### 🚀 Futuro (Pós-MVP)
1. **Sistema de IA** (Chatbot RAG + Análise Pré-Auditoria)
2. **Contratos Colaborativos** por cláusulas
3. **Matching Inteligente** de auditores
4. **App Mobile** para auditores

---

## 📊 Estatísticas por Épico

| Épico | Stories | Story Points | % do Total | Prioridade |
|-------|---------|--------------|------------|------------|
| Épico 1: Solicitações | 8 | 57 SP | 10% | P0 - Must Have |
| Épico 2: Comercial | 9 | 81 SP | 14% | P0 - Must Have |
| Épico 3: Análise | 12 | 94 SP | 16% | P0 - Must Have |
| Épico 4: Auditorias | 10 | 97 SP | 16% | P0 - Must Have |
| Épico 5: Decisão | 9 | 60 SP | 10% | P0 - Must Have |
| Épico 6: IA | 6 | 81 SP | 14% | P1 - Should Have |
| Épico 7: Admin | 6 | 45 SP | 8% | P1 - Should Have |
| Épico 8: Infra | 9 | 79 SP | 13% | P0 - Must Have |
| **TOTAL** | **69** | **594 SP** | **100%** | - |

---

## 🚀 Inovações Tecnológicas (6)

1. **Calculadora de Custos** (US-005) - Multi-variável, C1-C6
2. **Contratos Colaborativos** (US-014) - Assinatura em 48h
3. **Kanban Inteligente** (US-018) - 700 processos simultâneos
4. **Calendário de Agendamento** (US-028, US-029) - Score de disponibilidade
5. **IA Pré-Auditoria** (US-050) - Análise automática de docs
6. **Chatbot RAG** (US-049) - Multilíngue, 70%+ resolução

---

## 🔗 Navegação

- [← Voltar ao Índice do PRD](../README.md)
- [Roadmap e Faseamento →](../06-roadmap.md)
- [Acceptance Criteria Globais →](../09-acceptance-criteria.md)

---

**Última atualização**: 13 de Novembro de 2025
