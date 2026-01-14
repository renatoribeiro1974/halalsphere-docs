## 4. Arquitetura de Features (Épicos)

### 4.1 Estrutura Hierárquica

```
HalalSphere MVP (Baseado em PR 7.1 Rev 21)
│
├── ÉPICO 1: Gestão de Solicitações e Onboarding (Empresas)
│   ├── Feature 1.1: Cadastro e Solicitação de Certificação
│   ├── Feature 1.2: Dashboard de Acompanhamento em Tempo Real
│   ├── Feature 1.3: Gestão de Documentação Centralizada
│   └── Feature 1.4: Tratamento de Não-Conformidades (Empresa)
│
├── ÉPICO 2: Gestão Comercial e Contratual (Inovação 🚀)
│   ├── Feature 2.1: Calculadora Inteligente de Custos Multi-Variável
│   ├── Feature 2.2: Geração de Propostas Comerciais
│   └── Feature 2.3: Contratos Colaborativos por Cláusulas (Inovação)
│
├── ÉPICO 3: Análise e Preparação (Analistas)
│   ├── Feature 3.1: Painel de Controle de Processos (Kanban)
│   ├── Feature 3.2: Análise de Solicitação e Enquadramento (GSO/SMIIC)
│   ├── Feature 3.3: Análise Documental (Estágio 1) com IA
│   └── Feature 3.4: Coordenação de Auditoria com Calendário Inteligente (Inovação)
│
├── ÉPICO 4: Execução de Auditorias (Auditores + Inovação 🚀)
│   ├── Feature 4.1: Agenda de Auditorias (App Mobile)
│   ├── Feature 4.2: Preparação com IA de Suporte ao Auditor (Inovação)
│   ├── Feature 4.3: Execução de Auditoria (App Mobile Offline)
│   └── Feature 4.4: Relatório de Auditoria (Geração Automática)
│
├── ÉPICO 5: Decisão e Emissão de Certificados (Comitê)
│   ├── Feature 5.1: Painel de Casos Pendentes do Comitê
│   ├── Feature 5.2: Dossiê de Certificação Estruturado
│   ├── Feature 5.3: Deliberação e Votação Digital
│   └── Feature 5.4: Emissão de Certificados Digitais com QR Code
│
├── ÉPICO 6: Assistente IA Multilíngue (Inovação 🚀)
│   ├── Feature 6.1: Chatbot para Empresas (4 idiomas, RAG)
│   └── Feature 6.2: Assistente IA para Analistas (OCR, NLP)
│
├── ÉPICO 7: Gestão Administrativa e Dashboards (Coordenação)
│   ├── Feature 7.1: Dashboards Executivos com KPIs
│   ├── Feature 7.2: Relatórios de Conformidade PR 7.1 (Auditorias GAC/ISO)
│   └── Feature 7.3: Gestão de Usuários e Permissões (RBAC)
│
└── ÉPICO 8: Infraestrutura e Fundação (Base Técnica)
    ├── Feature 8.1: Autenticação e Autorização (JWT + RBAC)
    ├── Feature 8.2: Sistema de Notificações (E-mail, SMS, Push)
    ├── Feature 8.3: Central de Mensagens (Chat Interno)
    ├── Feature 8.4: Audit Trail e Logs (Rastreabilidade Total)
    └── Feature 8.5: Upload e Storage de Documentos (S3/Blob)
```

### 4.2 Priorização MoSCoW

| Épico | Prioridade | Justificativa | Impacto no MVP |
|-------|-----------|---------------|----------------|
| **Épico 8** | **Must Have (P0)** | Fundação técnica: sem auth, notificações e storage nada funciona | 🔴 Crítico - Bloqueante |
| **Épico 1** | **Must Have (P0)** | Porta de entrada: empresas solicitam certificação | 🔴 Crítico |
| **Épico 2** | **Must Have (P0)** | Maior gargalo identificado: contratos demoram 20-30 dias | 🔴 Crítico - Diferencial |
| **Épico 3** | **Must Have (P0)** | Coração do processo: analistas coordenam tudo | 🔴 Crítico |
| **Épico 4** | **Must Have (P0)** | Maior tempo consumido: auditorias são essenciais (Estágio 2) | 🔴 Crítico |
| **Épico 5** | **Must Have (P0)** | Decisão final: sem comitê não há certificado | 🔴 Crítico |
| **Épico 6** | **Should Have (P1)** | Diferencial competitivo: mas sistema funciona sem IA inicialmente | 🟡 Importante |
| **Épico 7** | **Should Have (P1)** | Gestão: importante mas não bloqueia certificação individual | 🟡 Importante |

### 4.3 Estimativa de Esforço

| Épico | User Stories | Story Points | Duração Estimada | Dependências Críticas |
|-------|-------------|-------------|-----------------|----------------------|
| **Épico 8** | 8 stories | 55 SP | Sprint 1-2 (4 semanas) | Nenhuma (fundação) |
| **Épico 1** | 8 stories | 60 SP | Sprint 2-3 (4 semanas) | Épico 8 |
| **Épico 2** | 9 stories | 80 SP | Sprint 3-5 (6 semanas) | Épico 1, Épico 8 |
| **Épico 3** | 12 stories | 90 SP | Sprint 4-6 (6 semanas) | Épico 1, Épico 2 |
| **Épico 4** | 10 stories | 100 SP | Sprint 6-8 (6 semanas) | Épico 3, App Mobile |
| **Épico 5** | 8 stories | 50 SP | Sprint 8-9 (4 semanas) | Épico 3, Épico 4 |
| **Épico 6** | 6 stories | 80 SP | Sprint 9-10 (4 semanas) | Integração IA (OpenAI/Claude) |
| **Épico 7** | 6 stories | 40 SP | Sprint 10 (2 semanas) | Todos épicos anteriores |
| **TOTAL MVP** | **67 stories** | **555 SP** | **10 sprints (20 semanas)** | - |

**Velocidade assumida**: 55-60 SP por sprint (time de 6-8 pessoas)

---

