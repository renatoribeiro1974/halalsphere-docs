# 8. Dependências e Riscos

## 8.1 Dependências Externas

### 8.1.1 Dependências Críticas (Blockers)
| Dependência | Impacto | Mitigação | Owner |
|-------------|---------|-----------|-------|
| **PR 7.1 Rev 21 (procedimento)** | Workflow completo baseado neste documento | ✅ Documento já disponível (56 páginas) | CDIAL HALAL |
| **GSO 2055-2 / SMIIC 02** | Categorização C1-C6 | ✅ Standards já disponíveis | GSO/SMIIC |
| **ISO 17065** | Compliance obrigatório | Consultoria externa se necessário | Time HalalSphere |
| **Gateway de pagamento** | Fase 2: Contratos e pagamentos | Stripe ou PagSeguro (API pública disponível) | Analista Comercial |
| **Fornecedores de IA** | OpenAI/Anthropic para análise docs | Fallback: Azure OpenAI + modelo local (ollama) | Time Técnico |

### 8.1.2 Dependências Importantes (Riscos Médios)
| Dependência | Impacto | Mitigação |
|-------------|---------|-----------|
| **Templates de contratos** | US-011 (geração de minutas) | Advogado especializado em Halal contratado |
| **Templates de certificados** | US-044 (emissão) | Designer + LaTeX templates (pode ser feito internamente) |
| **Base de auditors externos** | Escalar time de auditores | Parceria com certificadoras existentes |
| **Tradutores especializados** | Árabe e Turco (termos Halal) | Contratar freelancers nativos + glossário técnico |
| **Infraestrutura cloud** | AWS ou GCP | Multi-cloud strategy (pode migrar facilmente) |

### 8.1.3 Dependências Desejáveis (Nice-to-Have)
| Dependência | Impacto | Plano B |
|-------------|---------|---------|
| **Integração ERPs** | Fase 6: Automação de dados | Entrada manual funciona |
| **SSO corporativo** | Empresas enterprise | Login/senha + MFA suficiente |
| **Laboratórios de análise** | Upload automático de laudos | Upload manual por empresa |

---

## 8.2 Riscos do Projeto

### 8.2.1 Riscos Técnicos

| Risco | Probabilidade | Impacto | Severidade | Mitigação | Owner |
|-------|---------------|---------|------------|-----------|-------|
| **Precisão da IA <80%** | Média (40%) | Alto | 🟠 MÉDIO | 1) Treinar com dados reais PR 7.1<br>2) Revisão humana obrigatória<br>3) Feedback loop contínuo | Tech Lead IA |
| **Performance com 700 processos** | Baixa (20%) | Alto | 🟢 BAIXO | 1) Arquitetura escalável desde MVP<br>2) Testes de carga no Sprint 8<br>3) Lazy loading + paginação | Backend Lead |
| **Complexidade do workflow 12 fases** | Média (50%) | Médio | 🟠 MÉDIO | 1) Prototipagem iterativa<br>2) Feedback de analistas reais<br>3) Simplificar se necessário (mínimo 8 fases) | Product Manager |
| **Integração com gateway de pagamento** | Baixa (15%) | Alto | 🟢 BAIXO | 1) Usar Stripe (SDK maduro)<br>2) Sandbox em dev<br>3) Plano B: PagSeguro | Backend Lead |
| **Complexidade do editor PDF (certificados)** | Média (30%) | Médio | 🟢 BAIXO | 1) LaTeX bem estabelecido<br>2) Templates prontos online<br>3) Plano B: HTML to PDF (Puppeteer) | Fullstack Dev |
| **Tempo de análise IA >60s** | Média (40%) | Médio | 🟠 MÉDIO | 1) Processar docs em paralelo<br>2) Cache de análises similares<br>3) Workers dedicados | Tech Lead IA |
| **Dependência de APIs IA (vendor lock-in)** | Baixa (20%) | Alto | 🟢 BAIXO | 1) Abstração de providers (OpenAI ↔️ Anthropic)<br>2) Fallback para Azure OpenAI<br>3) Modelo local (ollama) | Arquiteto |

### 8.2.2 Riscos de Negócio

| Risco | Probabilidade | Impacto | Severidade | Mitigação | Owner |
|-------|---------------|---------|------------|-----------|-------|
| **Resistência de analistas/auditores** | Média (50%) | Alto | 🟠 MÉDIO | 1) Co-criação com usuários reais<br>2) Treinamento dedicado (2 dias)<br>3) Lançamento gradual (piloto 10 usuários) | Product Manager |
| **Concorrência (sistemas similares)** | Média (40%) | Alto | 🟠 MÉDIO | 1) Diferenciais de IA (único no mercado)<br>2) Time-to-market rápido (7.5 meses)<br>3) Parcerias exclusivas | CEO/CPO |
| **Mudança na regulação Halal** | Baixa (10%) | Alto | 🟢 BAIXO | 1) Arquitetura flexível (configurável)<br>2) Monitorar GSO/SMIIC<br>3) Consultoria regulatória | Compliance Officer |
| **Precificação incorreta** | Média (40%) | Médio | 🟠 MÉDIO | 1) Análise de mercado (concorrentes)<br>2) Pilotos com pricing diferentes<br>3) Flexibilidade em contratos iniciais | CFO/CPO |
| **Churn de clientes early adopters** | Baixa (25%) | Médio | 🟢 BAIXO | 1) Onboarding personalizado<br>2) Customer Success dedicado<br>3) Feedback quinzenal | Customer Success |
| **Escassez de auditores certificados** | Média (40%) | Alto | 🟠 MÉDIO | 1) Parcerias com certificadoras<br>2) Programa de formação próprio<br>3) Auditores remotos (internacional) | Operações |

### 8.2.3 Riscos de Pessoas

| Risco | Probabilidade | Impacto | Severidade | Mitigação | Owner |
|-------|---------------|---------|------------|-----------|-------|
| **Turnover de time técnico** | Média (30%) | Alto | 🟠 MÉDIO | 1) Documentação contínua<br>2) Pair programming<br>3) Plano de sucessão | CTO |
| **Conhecimento sobre Halal concentrado** | Alta (60%) | Alto | 🔴 ALTO | 1) Knowledge sharing semanal<br>2) Documentação em Notion<br>3) Contratar especialista Halal full-time | CEO/CTO |
| **Falta de especialista em IA** | Média (40%) | Médio | 🟠 MÉDIO | 1) Upskilling de dev backend<br>2) Consultoria pontual<br>3) Contratar se orçamento permitir | CTO |
| **Time pequeno (sobrecarga)** | Alta (70%) | Médio | 🔴 ALTO | 1) Priorização rigorosa (MVP first)<br>2) Contratar freelancers pontuais<br>3) Reduzir escopo se necessário | Product Manager |

### 8.2.4 Riscos Operacionais

| Risco | Probabilidade | Impacto | Severidade | Mitigação | Owner |
|-------|---------------|---------|------------|-----------|-------|
| **Downtime durante onboarding** | Baixa (15%) | Alto | 🟢 BAIXO | 1) Blue-green deployment<br>2) Staging idêntico a produção<br>3) Rollback automático | DevOps |
| **Perda de dados (LGPD)** | Muito Baixa (5%) | Crítico | 🟢 BAIXO | 1) Backups diários + retenção 3 anos<br>2) Testes de restore mensais<br>3) Multi-region backups | DevOps |
| **Ataque de segurança (OWASP Top 10)** | Baixa (20%) | Alto | 🟢 BAIXO | 1) Pentests anuais<br>2) WAF + DDoS protection<br>3) Monitoramento 24/7 | Security Lead |
| **Custos de infra >previsto** | Média (40%) | Médio | 🟠 MÉDIO | 1) Monitoramento de custos AWS<br>2) Reserved instances<br>3) Otimizações contínuas | DevOps/CFO |
| **Suporte 24/7 necessário** | Baixa (25%) | Médio | 🟢 BAIXO | 1) Fase 1: Horário comercial apenas<br>2) Chatbot para FAQs<br>3) Escalar suporte conforme demanda | Customer Success |

---

## 8.3 Matriz de Riscos (Visualização)

```
IMPACTO
  ↑
ALTO     │   🔴 Conhecimento Halal    │   🟠 Resistência usuários
         │      concentrado           │   🟠 Precisão IA <80%
         │   🔴 Sobrecarga de time    │   🟠 Concorrência
         │                            │   🟠 Escassez auditores
─────────┼────────────────────────────┼──────────────────────────────
MÉDIO    │   🟢 Churn early adopters  │   🟠 Workflow complexo
         │   🟢 Falta especialista IA │   🟠 Precificação errada
         │   🟢 Suporte 24/7          │   🟠 Tempo análise IA
         │                            │   🟠 Custos infra
─────────┼────────────────────────────┼──────────────────────────────
BAIXO    │   🟢 Perda de dados        │   🟢 Performance 700 proc
         │   🟢 Mudança regulação     │   🟢 Vendor lock-in IA
         │   🟢 Downtime              │   🟢 Integração pagamento
         │   🟢 Ataque segurança      │   🟢 Editor PDF
         │                            │
         └────────────────────────────┴──────────────────────────────→
              BAIXA (0-30%)      MÉDIA (30-60%)      ALTA (60-100%)
                                  PROBABILIDADE
```

**Legenda**:
- 🔴 **ALTO**: Ação imediata necessária
- 🟠 **MÉDIO**: Monitorar de perto e mitigar proativamente
- 🟢 **BAIXO**: Aceitar ou mitigar com baixa prioridade

---

## 8.4 Plano de Contingência

### 8.4.1 Cenário 1: Precisão da IA insuficiente (<70%)
**Trigger**: Após 50 análises reais, accuracy <70%

**Ações**:
1. **Curto prazo (1 semana)**:
   - Tornar revisão humana **obrigatória** (não apenas sugerida)
   - Adicionar flag "confiança baixa" em análises <80%
2. **Médio prazo (1 mês)**:
   - Fine-tuning do modelo com dados reais PR 7.1
   - Trocar de provider (OpenAI → Anthropic ou vice-versa)
3. **Longo prazo (3 meses)**:
   - Se nada funcionar: Remover IA pré-auditoria do MVP
   - Manter apenas chatbot RAG (mais simples e confiável)

**Impacto no roadmap**: Atraso de 1-2 sprints na Fase 3

---

### 8.4.2 Cenário 2: Time pequeno + sobrecarga crítica
**Trigger**: Velocidade <60% do planejado por 2 sprints consecutivos

**Ações**:
1. **Imediato**:
   - Pausar features não-MVP (todas as user stories com prioridade "Should" e "Could")
   - Contratar 1-2 freelancers para tarefas específicas (frontend, testes)
2. **2 semanas**:
   - Re-priorizar roadmap: Focar apenas em MVP (442 SP)
   - Estender prazo de Go-Live de 30 para 40 semanas (+10 semanas)
3. **1 mês**:
   - Contratar 1 desenvolvedor full-time (se orçamento permitir)
   - Considerar MVP ainda menor (remover Épico 3: Análise de Risco, fazer manual)

**Impacto financeiro**: +$10k/mês (2 freelancers part-time)

---

### 8.4.3 Cenário 3: Resistência massiva de usuários (NPS <0)
**Trigger**: Após piloto com 10 usuários, NPS <0 ou SUS <60

**Ações**:
1. **Imediato (1 semana)**:
   - Workshops de feedback intensivo (2 dias presenciais)
   - Identificar 3 pain points principais
2. **Curto prazo (2 semanas)**:
   - Redesign de features mais problemáticas
   - Adicionar "modo simplificado" (menos features, mais intuitivo)
3. **Médio prazo (1 mês)**:
   - Se nada funcionar: Pivotar para ferramenta de apoio (não substituição completa)
   - Manter processos manuais existentes + HalalSphere como complemento

**Impacto no roadmap**: Atraso de 4-6 semanas, possível mudança de escopo

---

### 8.4.4 Cenário 4: Perda de especialista Halal
**Trigger**: Pessoa-chave com conhecimento PR 7.1 sai da empresa

**Ações**:
1. **Prevenção (sempre ativo)**:
   - Documentação contínua em Notion (toda reunião → ADR)
   - Knowledge sharing semanal (30min, rodiziando apresentadores)
   - Gravação de sessões de treinamento
2. **Se acontecer**:
   - Contratar consultoria externa (CDIAL HALAL ou similar) - $5k/mês
   - Pausar desenvolvimento de features complexas por 4 semanas (upskilling time)
   - Contratar novo especialista (processo de recrutamento 8-12 semanas)

**Impacto financeiro**: +$20k (4 meses de consultoria)

---

### 8.4.5 Cenário 5: Custos de IA explodem (>$1k/mês no MVP)
**Trigger**: Custo de APIs OpenAI/Anthropic >$1.000/mês com poucos usuários

**Ações**:
1. **Imediato**:
   - Implementar cache agressivo (análises similares → reutilizar)
   - Limitar análises gratuitas (ex: 3 por mês por empresa)
2. **Curto prazo (2 semanas)**:
   - Migrar para Azure OpenAI (preços corporativos negociados)
   - Otimizar prompts (reduzir tokens de input/output em 30-40%)
3. **Médio prazo (1 mês)**:
   - Testar modelos locais (ollama + llama-3.1-70b-instruct)
   - Cobrar adicional por análise IA (ex: +R$50 por análise)

**Impacto no pricing**: Possível aumento de 10-15% no plano premium

---

## 8.5 Critérios de Go/No-Go

### 8.5.1 Go-Live do MVP (Final da Fase 2, Semana 22)
**Critérios obrigatórios (todos devem ser ✅)**:

| Critério | Métrica | Status |
|----------|---------|--------|
| **Funcionalidades MVP completas** | 37 user stories implementadas (442 SP) | 🔲 Pendente |
| **Testes E2E passando** | Happy paths principais (wizard, kanban, auditoria, emissão) | 🔲 Pendente |
| **Performance aceitável** | P95 <2s em todas as páginas | 🔲 Pendente |
| **Segurança validada** | 0 vulnerabilidades high/critical (Snyk) | 🔲 Pendente |
| **Piloto bem-sucedido** | 10 usuários reais, SUS >70, NPS >30 | 🔲 Pendente |
| **Documentação completa** | Manuais de usuário (4 personas) + runbooks técnicos | 🔲 Pendente |
| **Infraestrutura estável** | 99.9% uptime nas últimas 4 semanas (staging) | 🔲 Pendente |
| **Backups funcionando** | 2 testes de restore bem-sucedidos | 🔲 Pendente |

**Se algum critério não for atingido**:
- **Atrasar Go-Live** em 2-4 semanas (não fazer deploy em produção com MVP incompleto)
- **Comunicar stakeholders** com transparência (data revisada + justificativa)

---

### 8.5.2 Go-Live da Fase 3 (IA Completa, Semana 30)
**Critérios obrigatórios**:

| Critério | Métrica | Status |
|----------|---------|--------|
| **Precisão da IA** | >80% em análise de documentos (validado com 100 casos reais) | 🔲 Pendente |
| **Chatbot funcional** | >70% taxa de resolução sem humano | 🔲 Pendente |
| **Custos de IA sustentáveis** | <$500/mês com 50 empresas ativas | 🔲 Pendente |
| **Tempo de análise IA** | P95 <60s | 🔲 Pendente |

**Se precisão <80%**: Manter revisão humana obrigatória (não bloqueia Go-Live)

---

## 8.6 Lições Aprendidas (Template para Retrospectivas)

**A ser preenchido ao longo do projeto**:

### Sprint 1-4 (Fase 1: MVP Core)
- **O que funcionou bem**: _[A completar]_
- **O que não funcionou**: _[A completar]_
- **Ações de melhoria**: _[A completar]_

### Sprint 5-7 (Fase 2: Auditoria e Decisão)
- **O que funcionou bem**: _[A completar]_
- **O que não funcionou**: _[A completar]_
- **Ações de melhoria**: _[A completar]_

### Sprint 8-11 (Fase 3: IA)
- **O que funcionou bem**: _[A completar]_
- **O que não funcionou**: _[A completar]_
- **Ações de melhoria**: _[A completar]_

### Sprint 12-14 (Fase 4: Escalabilidade)
- **O que funcionou bem**: _[A completar]_
- **O que não funcionou**: _[A completar]_
- **Ações de melhoria**: _[A completar]_

---

