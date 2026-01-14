# 🎯 Próximos Passos para MVP - HalalSphere
## Roadmap de Implementação Priorizado

**Data**: Dezembro 2025
**Status Atual**: 70% Implementado
**Meta**: MVP Completo e Funcional

---

## 🔥 SPRINT 1: MVP Blocker (Semana 1-2)
**Objetivo**: Funcionalidades críticas sem as quais o sistema não funciona

### 1. Sistema de Emails Transacionais 🚨 CRÍTICO
**Prioridade**: P0 - MÁXIMA
**Estimativa**: 3-5 dias
**Responsável**: Backend + DevOps

**Tarefas**:
- [ ] Configurar SendGrid ou AWS SES
- [ ] Criar templates de email profissionais:
  - ✉️ Confirmação de cadastro
  - ✉️ Notificação de mudança de fase
  - ✉️ Proposta comercial enviada
  - ✉️ Contrato pronto para assinatura
  - ✉️ Documentos rejeitados
  - ✉️ Auditoria agendada
  - ✉️ Certificado emitido
  - ✉️ Solicitação de documentos adicionais
- [ ] Implementar EmailService no backend
- [ ] Integrar com eventos do sistema:
  - Process phase transitions → Email
  - Document rejection → Email
  - Proposal sent → Email
  - Contract ready → Email
  - Audit scheduled → Email
- [ ] Configurar webhooks de delivery status
- [ ] Implementar retry automático em caso de falha
- [ ] Testar envio real em ambiente de staging

**Critérios de Aceitação**:
- ✅ Emails enviados automaticamente em cada transição de fase
- ✅ Templates profissionais com logo e branding
- ✅ Taxa de entrega >95%
- ✅ Tracking de abertura e cliques

**Referências**:
- US-006, US-038, US-048, US-067
- [backend/src/services/email.service.ts](backend/src/services/email.service.ts) - já existe base

---

### 2. Emissão de Certificados Digitais 📜
**Prioridade**: P0 - ALTA
**Estimativa**: 5-7 dias
**Responsável**: Backend + Frontend

**Tarefas**:

#### Backend (3-4 dias)
- [ ] Criar CertificateService:
  - `generateCertificate(processId)` - Cria registro
  - `generatePDF(certificateId)` - Gera PDF com template
  - `generateQRCode(certificateId)` - QR Code para validação
  - `sendCertificate(certificateId)` - Envia por email
  - `validateCertificate(number)` - API pública de validação
  - `revokeCertificate(id, reason)` - Suspender/cancelar
- [ ] Implementar geração de número único: HS-CERT-YYYY-NNNNNN
- [ ] Template de PDF profissional:
  - Logo certificadora + Logo Halal
  - Dados da empresa e produtos
  - Número do certificado + QR Code
  - Validade (3 anos)
  - Escopo da certificação
  - Assinatura digital (watermark)
- [ ] Integração com biblioteca de PDF (PDFKit ou Puppeteer)
- [ ] Geração de QR Code (biblioteca qrcode)
- [ ] Storage de PDFs (S3 ou local)
- [ ] API endpoint: `GET /api/certificates/validate/:number`

#### Frontend (2-3 dias)
- [ ] Página de consulta pública de certificados:
  - Input: Número do certificado
  - Validação em tempo real
  - Exibição de dados:
    - Status (Ativo, Suspenso, Expirado)
    - Empresa certificada
    - Produtos certificados
    - Validade
    - Data de emissão
  - Download do PDF
  - QR Code para validação mobile
- [ ] Página de certificados para empresa (dashboard):
  - Lista de certificados emitidos
  - Status visual
  - Download PDF
  - Solicitação de renovação (se expirado)
- [ ] Botão "Emitir Certificado" no dashboard do gestor:
  - Disponível após aprovação do comitê
  - Confirmação antes de emitir
  - Geração automática + email
- [ ] Toast/notificação quando certificado emitido

**Critérios de Aceitação**:
- ✅ Certificado gerado automaticamente após aprovação do comitê
- ✅ PDF profissional com QR Code funcional
- ✅ Consulta pública funcionando (qualquer pessoa pode validar)
- ✅ Empresa recebe email com certificado anexo
- ✅ Certificado armazenado de forma segura (não pode ser alterado)

**Referências**:
- US-044, US-045, US-046
- Schema: `Certificate` table já existe
- Libs sugeridas: `pdfkit`, `qrcode`, `puppeteer`

---

### 3. Integração com Assinatura Eletrônica 📝
**Prioridade**: P0 - ALTA
**Estimativa**: 5-7 dias
**Responsável**: Backend + Frontend

**Tarefas**:

#### Backend (4-5 dias)
- [ ] Escolher provedor (D4Sign para Brasil é a mais comum)
- [ ] Criar ESignatureService:
  - `sendForSignature(contractId)` - Envia contrato para plataforma
  - `checkSignatureStatus(contractId)` - Verifica status
  - `processWebhook(payload)` - Recebe notificações da plataforma
  - `downloadSignedDocument(contractId)` - Baixa PDF assinado
  - `cancelSignature(contractId)` - Cancela processo de assinatura
- [ ] Configurar webhook endpoint: `POST /api/contracts/signature-webhook`
- [ ] Implementar lógica de múltiplos signatários:
  1. Empresa assina primeiro
  2. Notifica certificadora
  3. Certificadora assina
  4. Contrato finalizado
- [ ] Armazenar certificado de assinatura
- [ ] Atualizar status do processo automaticamente:
  - Ambas assinaturas → Avança para próxima fase
- [ ] Variáveis de ambiente para credenciais:
  - `D4SIGN_API_KEY`
  - `D4SIGN_CRYPTO_KEY`
  - `D4SIGN_SAFE_ID` (ID do cofre)
  - `D4SIGN_ENVIRONMENT` (sandbox/production)

#### Frontend (1-2 dias)
- [ ] Tela de acompanhamento de assinatura:
  - Timeline visual:
    - ⏳ Aguardando Empresa
    - ✅ Empresa Assinou
    - ⏳ Aguardando Certificadora
    - ✅ Certificadora Assinou
    - ✅ Contrato Finalizado
  - Botão "Assinar Agora" (link externo para plataforma)
  - Botão "Reenviar Email de Assinatura"
  - Download do PDF após assinado
- [ ] Notificações in-app quando assinatura completada
- [ ] Integração no ProcessContract.tsx

**Critérios de Aceitação**:
- ✅ Contrato enviado automaticamente após aprovação
- ✅ Emails enviados aos signatários pela plataforma
- ✅ Webhook processa assinaturas e atualiza sistema
- ✅ PDF assinado armazenado com certificado
- ✅ Processo avança automaticamente após ambas assinaturas

**Referências**:
- US-017
- Schema: `Contract.eSignatureProvider`, `ContractSignature` já existem
- [D4Sign API Docs](https://docapi.d4sign.com.br/docs/endpoints)
- [backend/src/services/e-signature/](backend/src/services/e-signature/) - já existe estrutura base

---

## 🟡 SPRINT 2: Polimento e PDFs (Semana 3-4)
**Objetivo**: Profissionalizar outputs e testar end-to-end

### 4. Templates de PDF Profissionais 📄
**Prioridade**: P1 - MÉDIA
**Estimativa**: 4-6 dias
**Responsável**: Backend + Design

**Tarefas**:
- [ ] Contratar/criar design profissional:
  - Template de Proposta Comercial
  - Template de Contrato
  - Template de Certificado (já coberto acima)
  - Template de Relatório de Auditoria
- [ ] Implementar PdfGeneratorService:
  - `generateProposalPDF(proposalId)`
  - `generateContractPDF(contractId)`
  - `generateAuditReportPDF(auditId)`
- [ ] Usar biblioteca Puppeteer (renderiza HTML como PDF):
  - Criar templates HTML profissionais
  - CSS com branding da certificadora
  - Quebras de página corretas
  - Headers e footers
  - Numeração de páginas
- [ ] Variáveis dinâmicas nos templates:
  - `{{NOME_EMPRESA}}`, `{{CNPJ}}`, `{{VALOR_TOTAL}}`, etc.
- [ ] Watermark opcional (ex: "RASCUNHO" em propostas não enviadas)
- [ ] Salvar PDFs gerados no storage (S3)
- [ ] Endpoint de download: `GET /api/proposals/:id/pdf`

**Critérios de Aceitação**:
- ✅ PDFs visualmente profissionais (logo, cores, tipografia)
- ✅ Todas variáveis dinâmicas preenchidas corretamente
- ✅ Quebras de página lógicas (não corta tabelas ao meio)
- ✅ Headers e footers em todas as páginas
- ✅ Geração rápida (<5 segundos)

**Referências**:
- US-011
- [backend/src/services/pdf-generator.service.ts](backend/src/services/pdf-generator.service.ts) - já existe base
- Libs: `puppeteer`, `pdfkit`

---

### 5. Testes End-to-End de Todo o Fluxo 🧪
**Prioridade**: P1 - MÉDIA
**Estimativa**: 3-5 dias
**Responsável**: QA + Devs

**Tarefas**:
- [ ] Criar cenários de teste completos:
  - **Cenário 1**: Nova certificação (do zero ao certificado)
  - **Cenário 2**: Renovação de certificado
  - **Cenário 3**: Processo rejeitado (documentos insuficientes)
  - **Cenário 4**: Não-conformidades em auditoria
  - **Cenário 5**: Proposta recusada → nova proposta
- [ ] Testar cada role separadamente:
  - Empresa
  - Analista
  - Auditor
  - Gestor
  - Admin
- [ ] Validar transições de fase:
  - Todas as 17 fases devem funcionar
  - Validações em cada transição
  - Emails enviados corretamente
- [ ] Testar notificações:
  - Email
  - In-app
  - Timing correto
- [ ] Testar permissões (RBAC):
  - Empresa não vê dashboard de analista
  - Analista não emite certificados, etc.
- [ ] Performance:
  - Kanban com 100+ processos
  - Upload de múltiplos arquivos grandes
  - Geração de PDFs simultâneos
- [ ] Segurança:
  - Tentar acessar processos de outras empresas
  - SQL injection nos filtros
  - XSS em comentários

**Critérios de Aceitação**:
- ✅ Fluxo completo funciona sem erros
- ✅ Todos emails enviados
- ✅ Permissões respeitadas
- ✅ Performance aceitável (<3s por página)
- ✅ Nenhuma vulnerabilidade crítica

---

### 6. Correção de Bugs Críticos 🐛
**Prioridade**: P0 - ALTA
**Estimativa**: Contínuo
**Responsável**: Todos

**Tarefas**:
- [ ] Revisar todos os TODOs no código
- [ ] Testar funcionalidades existentes:
  - Wizard de solicitação (9 etapas)
  - Kanban (drag-and-drop)
  - Calculadora de propostas
  - Upload de documentos
  - Agendamento de auditorias
  - Execução de auditorias
  - Dashboard de gestor
- [ ] Corrigir bugs encontrados em testes
- [ ] Validações de formulários:
  - Campos obrigatórios
  - Formatos (CNPJ, email, telefone)
  - Tamanhos de arquivo
- [ ] Mensagens de erro amigáveis
- [ ] Loading states em todas as ações assíncronas
- [ ] Tratamento de erros de API (500, 404, 401)

---

## 🚀 SPRINT 3: Features Avançadas (Mês 2)
**Objetivo**: Diferenciais competitivos

### 7. Sistema de IA Básico 🤖
**Prioridade**: P1 - Should Have
**Estimativa**: 2-3 semanas
**Responsável**: Backend + AI Engineer

**Tarefas**:
- [ ] Chatbot RAG (US-049):
  - Integração com OpenAI GPT-4 ou Claude
  - Base de conhecimento com normas Halal (GSO 2055-2, DT 7.1)
  - Embedding com pgvector
  - Interface de chat no frontend
- [ ] Análise Pré-Auditoria (US-050):
  - OCR de documentos (Tesseract ou Google Vision)
  - Extração de informações (ingredientes, fornecedores)
  - Identificação de riscos
  - Relatório para auditor

**Referências**:
- Épico 6
- Schema: `KnowledgeBase`, `AiAnalysis`, `ChatMessage` já existem

---

### 8. Contratos Colaborativos por Cláusulas 📝
**Prioridade**: P1 - Should Have (Inovação #3)
**Estimativa**: 2-3 semanas
**Responsável**: Backend + Frontend

**Tarefas**:
- [ ] Templates de contrato por cláusulas (US-012)
- [ ] Interface colaborativa de edição (US-014)
- [ ] Versionamento automático (US-015)
- [ ] Thread de comentários por cláusula

**Referências**:
- US-012, US-014, US-015

---

### 9. Matching Inteligente de Auditores 🎯
**Prioridade**: P1 - Should Have (Inovação #4)
**Estimativa**: 1-2 semanas
**Responsável**: Backend

**Tarefas**:
- [ ] Algoritmo de matching (US-026):
  - Disponibilidade em tempo real
  - Especialização × Tipo de empresa
  - Distância geográfica (Google Maps API)
  - Carga de trabalho atual
  - Histórico
  - Idiomas
- [ ] Sugestão de top 3 auditores com score

**Referências**:
- US-026

---

## 📋 Checklist de Lançamento do MVP

### Backend
- ✅ 11 módulos implementados
- 🔴 EmailService (PENDENTE)
- 🔴 CertificateService (PENDENTE)
- 🔴 ESignatureService integrado (PENDENTE)
- ✅ PdfGeneratorService base (precisa templates)
- ✅ Todas APIs documentadas (Swagger)
- 🔴 Testes unitários (cobertura >70%)
- 🔴 Testes de integração

### Frontend
- ✅ Todas páginas por role implementadas
- ✅ Componentes UI reutilizáveis
- 🔴 Página de certificados públicos (PENDENTE)
- ✅ Responsividade (mobile/tablet/desktop)
- 🔴 Loading states em todas ações
- 🔴 Mensagens de erro amigáveis
- 🔴 Testes E2E (Cypress/Playwright)

### DevOps
- 🔴 Deploy automatizado (CI/CD)
- 🔴 Ambiente de staging
- 🔴 Monitoramento (Sentry/DataDog)
- 🔴 Logs centralizados
- 🔴 Backup automatizado do banco
- 🔴 SSL/HTTPS configurado
- 🔴 CDN para assets estáticos

### Segurança
- ✅ Autenticação JWT
- ✅ RBAC (11 roles)
- ✅ Bloqueio de conta após 5 tentativas
- ✅ Audit trail completo
- 🔴 Scan de vulnerabilidades (OWASP Top 10)
- 🔴 Penetration testing
- 🔴 HTTPS everywhere
- 🔴 CORS configurado corretamente
- 🔴 Rate limiting em APIs

### Documentação
- ✅ PRD completo
- ✅ User Stories detalhadas
- ✅ Arquitetura técnica
- 🔴 Manual do usuário (por role)
- 🔴 API documentation (Swagger)
- 🔴 Guia de deploy
- 🔴 Runbook de troubleshooting

---

## 🎯 Critérios de Sucesso do MVP

### Funcional
- ✅ Empresa consegue solicitar certificação (wizard completo)
- 🔴 Analista consegue revisar, calcular proposta e enviar
- 🔴 Empresa recebe proposta por email e pode aceitar
- 🔴 Contrato é gerado e assinado digitalmente
- ✅ Auditor consegue executar auditoria com checklist
- ✅ Gestor consegue aprovar no comitê
- 🔴 Certificado é emitido e enviado para empresa
- 🔴 Certificado pode ser validado publicamente

### Performance
- Kanban carrega em <2s (com 100+ processos)
- Upload de arquivos funciona até 50MB
- Geração de PDF em <5s
- Dashboard de gestor carrega em <3s

### UX
- Usuário completa wizard em <15 minutos
- Taxa de conclusão do wizard >85%
- Analista encontra processo no Kanban em <10s
- NPS (Net Promoter Score) >70

### Técnico
- Uptime >99%
- Zero vulnerabilidades críticas
- Cobertura de testes >70%
- Tempo de deploy <15 minutos

---

## 📅 Timeline Estimado

| Sprint | Duração | Objetivo | Status |
|--------|---------|----------|--------|
| Sprint 1 | Semanas 1-2 | MVP Blocker (Emails, Certificados, Assinatura) | 🔴 Não iniciado |
| Sprint 2 | Semanas 3-4 | Polimento (PDFs, Testes, Bugs) | ⏸️ Aguardando |
| Sprint 3 | Semanas 5-8 | Features Avançadas (IA, Contratos, Matching) | ⏸️ Aguardando |
| **TOTAL** | **8 semanas** | **MVP Completo + Diferenciais** | **0% concluído** |

**MVP Mínimo** (sem features avançadas): 4 semanas

---

## 👥 Recursos Necessários

### Desenvolvedores
- **1 Backend Engineer** (Node.js/TypeScript) - Full-time
- **1 Frontend Engineer** (React/TypeScript) - Full-time
- **1 DevOps Engineer** - Part-time (20h/semana)
- **1 QA Engineer** - Part-time (20h/semana)

### Opcional (para acelerar)
- **1 AI Engineer** - Para features de IA (Sprint 3)
- **1 Designer** - Para templates de PDF profissionais

### Custos Estimados (Mensais)
- SendGrid/AWS SES: $50-100/mês
- D4Sign: ~R$ 500-1000/mês (depende de volume)
- OpenAI API: $200-500/mês (se implementar IA)
- Hospedagem (AWS/Railway): $100-300/mês
- Monitoramento (Sentry): $50-100/mês

**Total**: ~R$ 2.500-5.000/mês (operacional)

---

## 📞 Próximas Ações Imediatas

### Esta Semana
1. ✅ Definir provedor de email (SendGrid vs AWS SES)
2. ✅ Criar conta e configurar credenciais
3. ✅ Implementar EmailService base
4. ✅ Criar primeiro template de email (confirmação de cadastro)
5. ✅ Testar envio real em staging

### Próxima Semana
1. Completar todos os templates de email
2. Integrar emails com eventos do sistema
3. Iniciar CertificateService
4. Desenhar template de certificado

---

**Elaborado por**: Claude AI
**Data**: 16 de Dezembro de 2025
**Próxima Revisão**: Semanal durante implementação
