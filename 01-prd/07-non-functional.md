# 7. Requisitos Não-Funcionais

## 7.1 Performance e Escalabilidade

### 7.1.1 Tempo de Resposta
| Operação | Tempo Máximo | Percentil | Justificativa |
|----------|--------------|-----------|---------------|
| **Carregamento de página** | 2s | P95 | Nielsen Norman Group: <2s para boa experiência |
| **Ações simples** (salvar, deletar) | 500ms | P95 | Limite de percepção instantânea |
| **Busca/filtros** | 1s | P95 | Busca deve parecer instantânea |
| **Upload de arquivo** (<10MB) | 30s | P95 | Depende de conexão do usuário |
| **Geração de PDF** (certificado) | 5s | P95 | Processamento complexo aceitável |
| **Análise IA pré-auditoria** | 60s | P95 | Análise de múltiplos documentos |
| **Chatbot RAG** (resposta) | 3s | P95 | Expectativa de chat em tempo real |

### 7.1.2 Throughput
| Métrica | Valor | Justificativa |
|---------|-------|---------------|
| **Requisições simultâneas** | 1.000/seg | 600-700 processos ativos + margem 40% |
| **Usuários concorrentes** | 200 | 50 empresas + 30 analistas + 40 auditores + 10 gestores |
| **Upload simultâneo** | 50 arquivos/min | Auditores enviando evidências |
| **Geração de PDF** | 20/min | Certificados em lote |

### 7.1.3 Escalabilidade Horizontal
- **Backend API**: Pods Kubernetes auto-scaling (min: 2, max: 10)
  - Scale up: CPU >70% por 2min
  - Scale down: CPU <30% por 5min
- **Workers de IA**: Fila Redis + workers escaláveis (min: 1, max: 5)
- **Database**: PostgreSQL com read replicas (1 master + 2 replicas)
- **Storage**: S3-compatible (ilimitado, pay-as-you-go)

### 7.1.4 Limites de Volume
| Recurso | Limite | Justificativa |
|---------|--------|---------------|
| **Processos ativos** | 700 simultâneos | Requisito do cliente |
| **Processos históricos** | Ilimitado | Auditoria ISO 17065 (min 3 anos) |
| **Upload de arquivo** | 100MB/arquivo | Vídeos de auditoria |
| **Total storage/processo** | 500MB | 20 docs × 5MB + 10 vídeos × 30MB |
| **Produtos por solicitação** | 500 | Grandes indústrias (ex: fábrica de temperos) |
| **Categorias C1-C6** | 6 categorias × 30 subcategorias | GSO 2055-2 + SMIIC 02 |

---

## 7.2 Disponibilidade e Confiabilidade

### 7.2.1 SLA (Service Level Agreement)
| Métrica | Valor | Penalidade |
|---------|-------|------------|
| **Uptime mensal** | 99.9% | Crédito proporcional se <99.5% |
| **Downtime aceitável/mês** | 43 minutos | Janelas de manutenção programada |
| **Recovery Time Objective (RTO)** | 4 horas | Tempo máximo para restauração |
| **Recovery Point Objective (RPO)** | 1 hora | Perda máxima de dados aceitável |

### 7.2.2 Backups
- **Frequência**: Backups automáticos diários às 02:00 UTC-3
- **Retenção**:
  - Diários: 7 dias
  - Semanais: 4 semanas
  - Mensais: 12 meses
  - Anuais: 3 anos (compliance ISO 17065)
- **Testes de restore**: Mensais (validar integridade)
- **Storage**: S3 Glacier para backups antigos (custo-efetivo)

### 7.2.3 Disaster Recovery
- **Multi-region backup**: Réplica em região secundária AWS
- **Plano de failover**: Documentado e testado trimestralmente
- **Prioridade de restauração**:
  1. Database (processos ativos)
  2. Storage (documentos)
  3. Logs e analytics

---

## 7.3 Segurança

### 7.3.1 Autenticação e Autorização
| Aspecto | Implementação |
|---------|---------------|
| **Autenticação** | JWT (Access Token 15min + Refresh Token 7 dias) |
| **MFA (Multi-Factor)** | TOTP (Google Authenticator) - **obrigatório para Analistas, Auditores, Gestores** |
| **SSO (futuro)** | SAML 2.0 / OAuth 2.0 (Google Workspace, Microsoft Entra) |
| **Senha** | Min 12 caracteres, mix (maiúsc/minúsc/número/especial), bcrypt cost=12 |
| **Bloqueio de conta** | 5 tentativas erradas → bloqueio 30min |
| **Sessões simultâneas** | Max 3 dispositivos/usuário |

### 7.3.2 RBAC (Role-Based Access Control)
- **Hierarquia rígida**: 4 papéis (Empresas, Analistas, Auditores, Gestores)
- **Permissões granulares**: Ver US-064 (detalhamento completo)
- **Auditoria de acesso**: Log de todas as ações (quem, quando, o quê, IP)
- **Segregation of Duties**:
  - Analista NÃO pode auditar
  - Auditor NÃO pode emitir certificado
  - Gestor NÃO pode executar processos

### 7.3.3 Proteção de Dados (LGPD)
| Princípio LGPD | Implementação |
|----------------|---------------|
| **Finalidade** | Uso restrito a certificação Halal (consentimento na US-001) |
| **Adequação** | Apenas dados necessários (minimização) |
| **Necessidade** | Não coletamos dados sensíveis extras (religião, etnia, etc) |
| **Acesso** | Empresas podem exportar seus dados (US-058) |
| **Retificação** | Empresas podem editar dados cadastrais (US-057) |
| **Exclusão** | Direito ao esquecimento (após fim de relação contratual + prazo legal) |
| **Portabilidade** | Exportação JSON estruturado (US-058) |
| **DPO** | Encarregado de dados designado (contato na plataforma) |

### 7.3.4 Segurança de Dados
- **Criptografia em trânsito**: TLS 1.3 (HTTPS obrigatório)
- **Criptografia em repouso**:
  - Database: PostgreSQL encryption at rest (AES-256)
  - Storage: S3 Server-Side Encryption (SSE-S3)
- **Dados sensíveis no DB**: Não armazenamos cartões de crédito (usamos Stripe)
- **Secrets management**: Vault (HashiCorp) ou AWS Secrets Manager
- **IP Whitelisting**: Opcional para clientes enterprise

### 7.3.5 OWASP Top 10 (2023)
| Vulnerabilidade | Mitigação |
|-----------------|-----------|
| **A01: Broken Access Control** | RBAC rígido, validação server-side, audit trail |
| **A02: Cryptographic Failures** | TLS 1.3, AES-256, bcrypt, sem hardcoded secrets |
| **A03: Injection** | Prepared statements (SQL), sanitização (XSS), CSP headers |
| **A04: Insecure Design** | Threat modeling, segregation of duties, rate limiting |
| **A05: Security Misconfiguration** | Hardened configs, CORS restrito, headers de segurança |
| **A06: Vulnerable Components** | Dependabot, renovate bot, scan semanal (Snyk/npm audit) |
| **A07: Auth Failures** | MFA, JWT short-lived, rate limiting login, session timeout |
| **A08: Software Data Integrity** | Assinatura de pacotes, CI/CD signing, webhook HMAC |
| **A09: Logging Failures** | Logs centralizados (ELK), alertas de anomalias, SIEM |
| **A10: SSRF** | Validação de URLs, network segmentation, proxy interno |

### 7.3.6 Compliance e Auditoria
- **Audit Trail completo**: Todas as ações ficam registradas (imutável, timestamped)
- **Retenção de logs**: 3 anos (compliance ISO 17065)
- **Relatórios de segurança**: Trimestral para gestores
- **Pentests**: Anual (empresa terceirizada)
- **Certificações alvo** (Fase 2026): ISO 27001, SOC 2 Type II

---

## 7.4 Usabilidade e Acessibilidade

### 7.4.1 Usabilidade
| Métrica | Meta | Método de Medição |
|---------|------|-------------------|
| **System Usability Scale (SUS)** | >75 (good) | Questionário 10 perguntas após 2 semanas de uso |
| **Task Success Rate** | >90% | Testes de usabilidade com 5 usuários/persona |
| **Time on Task** | Redução 60% vs. atual | Comparação wizard (12min) vs. planilhas (45min) |
| **Error Rate** | <5% | Erros de validação/submissão |
| **Learning Curve** | 1 dia | Novo usuário consegue criar solicitação sem ajuda |

### 7.4.2 Acessibilidade (WCAG 2.1 Nível AA)
| Critério | Implementação |
|----------|---------------|
| **Perceivable** | Alt text em imagens, contraste 4.5:1 (textos), 3:1 (botões), captions em vídeos |
| **Operable** | Navegação 100% por teclado (Tab, Enter, Esc), sem time limits críticos |
| **Understandable** | Labels claros, mensagens de erro específicas, idioma da página declarado |
| **Robust** | HTML semântico, ARIA landmarks, testado com NVDA/JAWS |

**Ferramentas de teste**:
- Lighthouse (Chrome DevTools) - score >90
- axe DevTools - 0 violações críticas
- Testes manuais com leitores de tela

### 7.4.3 Responsividade
| Breakpoint | Largura | Ajustes |
|------------|---------|---------|
| **Mobile** | 320px - 767px | Sidebar colapsada, stack vertical, touch-friendly (min 44px) |
| **Tablet** | 768px - 1023px | Sidebar semi-colapsada (ícones), kanban 3 colunas |
| **Desktop** | 1024px+ | Sidebar expandida, kanban 7 colunas, multi-column forms |

**Nota**: Auditores usam principalmente tablet (campo), analistas usam desktop.

---

## 7.5 Internacionalização (i18n)

### 7.5.1 Idiomas Suportados
1. **Português (pt-BR)** - Default, 100% completo
2. **Inglês (en-US)** - 100% (MVP Fase 1)
3. **Árabe (ar-SA)** - 100% (Fase 3) - Right-to-Left (RTL)
4. **Turco (tr-TR)** - 80% (Fase 3) - termos técnicos Halal

### 7.5.2 Escopo de Tradução
| Elemento | Traduzido | Observações |
|----------|-----------|-------------|
| **UI (botões, labels)** | ✅ Sim | Biblioteca i18next |
| **Mensagens de erro** | ✅ Sim | Todas as validações |
| **Emails transacionais** | ✅ Sim | Template por idioma |
| **PDFs (certificados)** | ✅ Sim | LaTeX multilíngue |
| **Documentação de ajuda** | ✅ Sim | Help center traduzido |
| **Dados do usuário** | ❌ Não | Nome de empresa, produtos, etc |
| **Logs técnicos** | ❌ Não | Sempre em inglês |

### 7.5.3 Considerações Técnicas
- **Detecção automática**: Accept-Language header do browser
- **Preferência do usuário**: Salva no perfil (US-057)
- **Fallback**: pt-BR → en-US
- **Formato de datas**:
  - pt-BR: 13/11/2025 14:30
  - en-US: 11/13/2025 2:30 PM
  - ar-SA: ١٣/١١/٢٠٢٥ ١٤:٣٠ (números árabes)
- **Moeda**:
  - pt-BR: R$ 12.500,00
  - en-US: $2,500.00 USD
  - ar-SA: ٩٬٣٧٥ ر.س
- **RTL (Right-to-Left)**: Layout espelhado para árabe (flexbox, CSS logical properties)

---

## 7.6 Compatibilidade

### 7.6.1 Browsers Suportados
| Browser | Versões | Market Share | Observações |
|---------|---------|--------------|-------------|
| **Chrome** | Últimas 2 versões | ~65% | Prioridade 1 (development target) |
| **Firefox** | Últimas 2 versões | ~10% | Prioridade 2 |
| **Safari** | Últimas 2 versões | ~15% | Prioridade 1 (iOS) |
| **Edge** | Últimas 2 versões | ~5% | Prioridade 2 (Chromium-based) |
| **Opera** | Últimas 2 versões | ~3% | Prioridade 3 (best effort) |
| **IE 11** | ❌ Não suportado | Deprecated | Banner de upgrade |

### 7.6.2 Dispositivos
| Tipo | Especificações | Justificativa |
|------|----------------|---------------|
| **Desktop** | 1024px+, mouse+teclado | Analistas e gestores |
| **Tablet** | 768px-1023px, touch | **Auditores em campo** (iPad, Android tablets) |
| **Mobile** | 320px-767px, touch | Empresas (consulta rápida) |

### 7.6.3 PWA (Progressive Web App)
- **Offline mode** (Fase 4): Auditores podem preencher checklists offline
- **Installable**: Add to Home Screen (iOS/Android)
- **Push notifications**: Lembretes de tarefas (US-024)
- **Camera access**: Upload de fotos diretamente da câmera (tablet/mobile)

---

## 7.7 Observabilidade e Monitoramento

### 7.7.1 Golden Signals (Site Reliability Engineering)
| Signal | Métrica | Alert Threshold |
|--------|---------|-----------------|
| **Latency** | P95 response time | >2s por 5min → alerta |
| **Traffic** | Requests/seg | Baseline +200% → alerta |
| **Errors** | Error rate % | >1% por 5min → alerta |
| **Saturation** | CPU/Memory/Disk | >80% por 10min → alerta |

### 7.7.2 Dashboards (Grafana)
1. **Dashboard de Negócio**:
   - Solicitações/dia (tendência)
   - Processos por fase (funil)
   - SLA de aprovação (média móvel 7 dias)
   - Revenue mensal (contratos assinados)

2. **Dashboard Técnico**:
   - Request rate, error rate, latency (RED metrics)
   - CPU, memory, disk (USE metrics)
   - Database queries (slow query log)
   - Queue depth (workers IA)

3. **Dashboard de IA**:
   - Análises pré-auditoria/dia
   - Precisão da IA (accuracy score)
   - Tempo médio de análise
   - Custo de API (OpenAI/Anthropic)

### 7.7.3 Alertas (PagerDuty ou similar)
| Severidade | Canais | On-Call |
|------------|--------|---------|
| **P1 (Critical)** | SMS + Call + Slack | Resposta imediata |
| **P2 (High)** | Slack + Email | Resposta em 30min |
| **P3 (Medium)** | Slack | Resposta em 4h (horário comercial) |
| **P4 (Low)** | Email | Triagem diária |

**Exemplos**:
- P1: API down (error rate >50%), database unreachable
- P2: P95 latency >5s, workers IA parados
- P3: Disk >85%, slow queries detectadas
- P4: Certificado SSL expirando em 14 dias

### 7.7.4 Logging
- **Stack**: ELK (Elasticsearch, Logstash, Kibana) ou Loki (Grafana)
- **Structured logs**: JSON com campos padrão (timestamp, level, user_id, request_id, message)
- **Níveis**:
  - ERROR: Exceções, falhas de integração
  - WARN: Retries, degradação de performance
  - INFO: Ações de negócio (processo criado, certificado emitido)
  - DEBUG: Detalhes técnicos (apenas em dev/staging)
- **Sampling**: 100% de errors, 10% de info em produção (reduzir custo)

---

## 7.8 Manutenibilidade e Qualidade de Código

### 7.8.1 Qualidade de Código
| Métrica | Target | Ferramenta |
|---------|--------|------------|
| **Code coverage** | >80% | Jest (frontend), pytest (backend) |
| **Code complexity** | Cyclomatic <10 | SonarQube |
| **Code duplication** | <3% | SonarQube |
| **Tech debt ratio** | <5% | SonarQube |
| **Vulnerabilities** | 0 critical/high | Snyk, npm audit |

### 7.8.2 Testes Automatizados
| Tipo | Cobertura | Execução |
|------|-----------|----------|
| **Unit tests** | >80% das funções | Pre-commit hook |
| **Integration tests** | Endpoints críticos (autenticação, pagamento) | CI/CD pipeline |
| **E2E tests** | Happy paths principais (wizard, kanban) | Nightly (Playwright) |
| **Performance tests** | Endpoints críticos (carga de 1000 req/s) | Weekly (k6) |
| **Security tests** | OWASP Top 10 | Monthly (OWASP ZAP) |

### 7.8.3 Documentação
- **README.md**: Setup de desenvolvimento (< 10min para rodar localmente)
- **API docs**: OpenAPI 3.0 (Swagger UI)
- **Architecture Decision Records (ADRs)**: Decisões técnicas importantes
- **Runbooks**: Procedimentos operacionais (deploy, rollback, incident response)
- **Changelog**: Semver, keep a changelog format

### 7.8.4 Code Review
- **Obrigatório**: 1 aprovação mínima antes de merge
- **Checklist**:
  - ✅ Testes passando
  - ✅ Code coverage não diminuiu
  - ✅ Sem vulnerabilidades novas
  - ✅ Segue style guide (ESLint, Prettier, Ruff)
  - ✅ Atualiza documentação (se necessário)

---

## 7.9 Requisitos Legais e de Compliance

### 7.9.1 ISO 17065 (Organismo de Certificação)
| Requisito | Implementação no HalalSphere |
|-----------|------------------------------|
| **4.2 Estrutura legal** | Rastreabilidade de todas as fases (workflow 12 fases) |
| **7.1 Imparcialidade** | Segregação de papéis (analista ≠ auditor ≠ decisor) |
| **7.4 Confidencialidade** | RBAC, LGPD, audit trail |
| **7.6 Registros** | Histórico completo de processos (min 3 anos) |
| **8.2 Inspeção** | Checklist digital PR 7.1 Rev 21 (US-033) |
| **8.6 Emissão de certificados** | PDF assinado digitalmente, código único, QR code |
| **8.7 Manutenção da certificação** | Renovação trienal, auditorias de vigilância (US-054, US-055) |

### 7.9.2 LGPD (Lei Geral de Proteção de Dados)
- **Base legal**: Consentimento (cadastro) + Execução de contrato
- **Dados coletados**: Nome, email, telefone, CNPJ, endereço, produtos
- **Dados sensíveis**: NÃO coletamos (religião, etnia, saúde, etc)
- **Direitos garantidos**: Acesso (US-058), retificação (US-057), exclusão, portabilidade
- **DPO (Encarregado)**: Contato disponível no rodapé (dpo@halalsphere.com)
- **Incident response**: Notificação à ANPD em até 72h (breach >500 registros)

### 7.9.3 PR 7.1 Rev 21 (Procedimento Operacional)
- **Categorização**: C1-C6 conforme GSO 2055-2 e SMIIC 02 (US-002 etapa 5)
- **Checklist de auditoria**: 56 páginas digitalizadas (US-033)
- **Fluxo de decisão**: Comitê técnico para casos especiais (US-041)
- **Validade de certificado**: 3 anos com vigilância anual
- **Renovação**: Processo simplificado (roadmap Fase 5)

### 7.9.4 Emissão Fiscal (Brasil)
- **NFSe**: Integração com prefeituras via API (roadmap Fase 5)
- **Impostos**: ISS (2-5% conforme município), IRPJ/CSLL (Lucro Presumido)
- **Nota**: Não é e-commerce (não precisa de NFe)

---

## 7.10 Estimativa de Custos de Infraestrutura

### 7.10.1 Ambiente MVP (Fase 1-2)
| Serviço | Especificação | Custo Mensal (USD) |
|---------|---------------|---------------------|
| **Backend** | 2× pods (2 vCPU, 4GB RAM) | $50 |
| **Database** | PostgreSQL managed (2 vCPU, 8GB RAM, 50GB SSD) | $60 |
| **Storage** | S3 (100GB, 10k requests) | $3 |
| **CDN** | Cloudflare Free ou AWS CloudFront (100GB transfer) | $10 |
| **Monitoring** | Grafana Cloud Free ou self-hosted | $0 |
| **Domain + SSL** | cloudflare.com | $0 |
| **Email** | SendGrid (40k emails/mês) | $15 |
| **AI APIs** | OpenAI/Anthropic (50 análises/mês) | $30 |
| **Total MVP** | | **~$170/mês** |

### 7.10.2 Ambiente de Produção (Pós Go-Live)
| Serviço | Especificação | Custo Mensal (USD) |
|---------|---------------|---------------------|
| **Backend** | 5× pods auto-scaling (2 vCPU, 4GB RAM cada) | $125 |
| **Database** | PostgreSQL HA (4 vCPU, 16GB RAM, 200GB SSD) + 2 replicas | $300 |
| **Storage** | S3 (2TB, 1M requests) | $50 |
| **CDN** | CloudFront (500GB transfer) | $40 |
| **Monitoring** | Grafana Cloud Pro ou Datadog | $100 |
| **Logs** | ELK managed ou Loki (100GB/mês) | $150 |
| **Backups** | S3 Glacier (500GB) | $5 |
| **Email** | SendGrid (200k emails/mês) | $80 |
| **AI APIs** | OpenAI/Anthropic (500 análises/mês) | $300 |
| **WAF + DDoS** | Cloudflare Pro | $20 |
| **Secrets** | AWS Secrets Manager (100 secrets) | $40 |
| **CI/CD** | GitHub Actions (3k min/mês) | $0 (free tier) |
| **APM** | Sentry (100k events/mês) | $100 |
| **Alertas** | PagerDuty Starter | $200 |
| **Total Produção** | | **~$1.510/mês** |

**Nota**: Custos em USD, conversão necessária para BRL. Preços aproximados (AWS us-east-1, Nov 2025).

### 7.10.3 Escalabilidade de Custos
- **Storage**: Crescimento linear (~$25/TB/mês)
- **AI APIs**: Maior variabilidade (depende de uso)
- **Database**: Maior custo fixo (considerar sharding/particionamento se >1TB)
- **Otimizações**:
  - Reserved instances (economia 30-40%)
  - Spot instances para workers (economia 60-70%)
  - Caching agressivo (reduz DB queries em 40%)

---

