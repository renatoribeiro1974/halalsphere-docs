# Fluxo de Alocação de Auditores - Diagrama Visual

## 1. Fluxograma Completo

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    INÍCIO: PROCESSO PRECISA DE AUDITOR                  │
│                  (Fase: planejamento_auditoria)                         │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SISTEMA ANALISA PROCESSO                        │
│  • Categoria Industrial (ex: AI - Alimentos)                           │
│  • Tipo de Certificação (ex: C1)                                       │
│  • País/Idioma (ex: Brasil/PT_BR)                                      │
│  • Data da Auditoria                                                    │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    BUSCA AUDITORES QUALIFICADOS                         │
│  • Com competência na categoria                                        │
│  • OU com certificação no tipo                                         │
│  • Auditores ativos                                                     │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    CALCULA SCORE PARA CADA AUDITOR                      │
│                                                                         │
│  Score = (Competência × 35%) + (Experiência × 20%) +                   │
│          (Taxa Sucesso × 20%) + (Nº Auditorias × 10%) +                │
│          (Disponibilidade × 10%) + (Idioma × 5%)                       │
│                                                                         │
│  Filtra: Score mínimo 50/100                                           │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    ORDENA POR SCORE (TOP 5)                             │
│                                                                         │
│  🥇 Auditor A - Score: 94                                              │
│  🥈 Auditor B - Score: 87                                              │
│  🥉 Auditor C - Score: 82                                              │
│  4️⃣  Auditor D - Score: 78                                              │
│  5️⃣  Auditor E - Score: 75                                              │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    CRIA SUGESTÃO DE ALOCAÇÃO                            │
│  • Status: "sugerida"                                                   │
│  • Sugerido: Auditor A (melhor score)                                  │
│  • Match Reasons: JSON com breakdown                                   │
│  • Timestamp: suggested_at                                             │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    NOTIFICA GESTOR DE AUDITORIA                         │
│  📧 "Nova sugestão de alocação disponível"                             │
│  🔔 Notificação no sistema                                             │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    GESTOR ACESSA TELA DE SUGESTÕES                      │
│  • Visualiza processo                                                   │
│  • Vê top 5 auditores com scores                                       │
│  • Analisa competências e disponibilidade                              │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
         ┌──────────────────┐      ┌──────────────────┐
         │ APROVA SUGESTÃO  │      │  TOMA OUTRA      │
         │   (Auditor A)    │      │   DECISÃO        │
         └────────┬─────────┘      └────────┬─────────┘
                  │                         │
                  │            ┌────────────┴────────────┐
                  │            │                         │
                  │            ▼                         ▼
                  │  ┌──────────────────┐    ┌──────────────────┐
                  │  │ ESCOLHE OUTRO    │    │ REJEITA TODAS E  │
                  │  │ DA LISTA         │    │ BUSCA MANUAL     │
                  │  │ (ex: Auditor C)  │    │                  │
                  │  └────────┬─────────┘    └────────┬─────────┘
                  │           │                       │
                  │           │                       │
                  └───────────┴───────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    ATUALIZA ALOCAÇÃO                                    │
│  • Status: "aprovada" ou "modificada"                                  │
│  • Allocated Auditor: auditor escolhido                                │
│  • Allocated By: ID do gestor                                          │
│  • Decided At: timestamp                                               │
│  • Notes: observações do gestor                                        │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    ATUALIZA PROCESSO                                    │
│  • Process.auditorId = auditor alocado                                 │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    NOTIFICA AUDITOR ALOCADO                             │
│  📧 "Você foi alocado para processo HS-2025-042"                       │
│  📋 Detalhes do processo e auditoria                                   │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    AUDITOR ACEITA E INICIA TRABALHO                     │
│  • Acessa detalhes do processo                                         │
│  • Planeja auditoria                                                    │
│  • Executa auditoria conforme agendado                                 │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    SISTEMA ATUALIZA MÉTRICAS                            │
│  • Incrementa: auditsCompleted do auditor                              │
│  • Atualiza: successRate após conclusão                                │
│  • Registra: feedback e performance                                    │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
                             ┌───────┐
                             │  FIM  │
                             └───────┘
```

## 2. Diagrama de Estados da Alocação

```
     ┌──────────┐
     │ SUGERIDA │ ◄── Sistema cria sugestão automaticamente
     └────┬─────┘
          │
          │ Gestor toma decisão
          │
    ┌─────┴─────────────────────────┐
    │                               │
    ▼                               ▼
┌─────────┐                   ┌────────────┐
│APROVADA │                   │ MODIFICADA │
└────┬────┘                   └─────┬──────┘
     │                              │
     │ Auditor = sugerido           │ Auditor ≠ sugerido
     │                              │
     └────────┬─────────────────────┘
              │
              │ Processo em andamento
              │
              ▼
         ┌──────────┐
         │  ATIVA   │ (alocação válida)
         └────┬─────┘
              │
              │ Pode ser cancelada a qualquer momento
              │
              ▼
         ┌──────────┐
         │CANCELADA │
         └──────────┘


Estado alternativo:
     ┌──────────┐
     │ SUGERIDA │
     └────┬─────┘
          │
          │ Gestor rejeita
          │
          ▼
     ┌──────────┐
     │REJEITADA │
     └──────────┘
```

## 3. Matriz de Decisão do Gestor

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                      DECISÃO DO GESTOR                                    ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  📊 DADOS DISPONÍVEIS:                                                    ║
║  • Top 5 auditores com scores                                            ║
║  • Breakdown detalhado de cada score                                     ║
║  • Competências e certificações                                          ║
║  • Carga de trabalho atual                                               ║
║  • Histórico de auditorias                                               ║
║  • Taxa de sucesso                                                        ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────┐    ║
║  │                         OPÇÕES                                  │    ║
║  ├─────────────────────────────────────────────────────────────────┤    ║
║  │                                                                 │    ║
║  │  ✅ APROVAR SUGESTÃO PRINCIPAL                                 │    ║
║  │     → Status: "aprovada"                                        │    ║
║  │     → Auditor: o #1 sugerido                                    │    ║
║  │     → Ação rápida (1 clique)                                    │    ║
║  │                                                                 │    ║
║  │  🔄 ESCOLHER OUTRO DA LISTA                                    │    ║
║  │     → Status: "modificada"                                      │    ║
║  │     → Auditor: escolhido entre #2-#5                           │    ║
║  │     → Pode adicionar nota explicativa                          │    ║
║  │                                                                 │    ║
║  │  🔍 BUSCAR MANUALMENTE                                         │    ║
║  │     → Status: "modificada"                                      │    ║
║  │     → Auditor: qualquer auditor do sistema                     │    ║
║  │     → Ignora sugestões                                         │    ║
║  │                                                                 │    ║
║  │  ❌ REJEITAR TODAS                                             │    ║
║  │     → Status: "rejeitada"                                       │    ║
║  │     → Motivo obrigatório                                       │    ║
║  │     → Processo fica pendente                                    │    ║
║  │                                                                 │    ║
║  └─────────────────────────────────────────────────────────────────┘    ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

## 4. Exemplo de Cálculo de Score

```
PROCESSO: HS-2025-042 - Alimentos Halal Ltda
CATEGORIA: AI - Indústria de Alimentos
TIPO: C1 - Alimentos Processados
PAÍS: Brasil (PT_BR)

AUDITOR: João Silva
─────────────────────────────────────────────────────

📊 CRITÉRIOS DE MATCHING:

1️⃣  COMPETÊNCIA NA CATEGORIA (35%)
   Nível: Certificado
   Score: 100/100
   Contribuição: 100 × 0.35 = 35.0

2️⃣  EXPERIÊNCIA EM ANOS (20%)
   Anos: 12
   Score: 100/100 (10+ anos = 100)
   Contribuição: 100 × 0.20 = 20.0

3️⃣  TAXA DE SUCESSO (20%)
   Taxa: 98%
   Score: 98/100
   Contribuição: 98 × 0.20 = 19.6

4️⃣  NÚMERO DE AUDITORIAS (10%)
   Auditorias: 45
   Score: 85/100 (31-50 = 85)
   Contribuição: 85 × 0.10 = 8.5

5️⃣  DISPONIBILIDADE (10%)
   Carga: 1/3 (33%)
   Score: 100/100 (0-39% = disponível)
   Contribuição: 100 × 0.10 = 10.0

6️⃣  IDIOMA (5%)
   Auditor: PT_BR, ES, EN
   Necessário: PT_BR
   Score: 100/100 (match perfeito)
   Contribuição: 100 × 0.05 = 5.0

─────────────────────────────────────────────────────
🏆 SCORE FINAL: 98.1 / 100
─────────────────────────────────────────────────────
✅ RECOMENDAÇÃO: ALTAMENTE QUALIFICADO
```

## 5. Exemplo de Interface - Card de Sugestão

```
┌────────────────────────────────────────────────────────────────────────┐
│ 📋 PROCESSO HS-2025-042                                                │
│ Empresa: Alimentos Halal Ltda                                         │
│ Categoria: AI - Indústria de Alimentos (Carnes e Derivados)          │
│ Tipo: C1 - Alimentos Processados                                     │
│ Data Auditoria: 25/12/2025                                            │
│ Idioma: Português (Brasil)                                            │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│ 🎯 SUGESTÕES DE AUDITORES                                             │
│                                                                        │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ 🥇 #1 - JOÃO SILVA                            Score: 98/100 ⭐⭐⭐│ │
│ │                                                                  │ │
│ │ 📧 joao.silva@halalsphere.com                                   │ │
│ │ 📞 +55 11 98765-4321                                            │ │
│ │                                                                  │ │
│ │ ✅ PONTOS FORTES:                                               │ │
│ │    • Certificado em Indústria de Alimentos                      │ │
│ │    • 12 anos de experiência                                     │ │
│ │    • 98% taxa de sucesso (45 auditorias)                        │ │
│ │    • Disponível - Carga baixa (1/3 processos)                   │ │
│ │    • Fluente em PT, ES, EN                                      │ │
│ │                                                                  │ │
│ │ 🎓 CERTIFICAÇÕES:                                               │ │
│ │    • ISO 22000 Lead Auditor (BSI) - válido até 06/2026         │ │
│ │    • HACCP Certification (IFSQN) - válido até 06/2025          │ │
│ │                                                                  │ │
│ │ 📊 BREAKDOWN DO SCORE:                                          │ │
│ │    Competência:     100  ████████████████████ (35%)            │ │
│ │    Experiência:     100  ████████████████████ (20%)            │ │
│ │    Taxa Sucesso:     98  ███████████████████░ (20%)            │ │
│ │    Nº Auditorias:    85  █████████████████░░░ (10%)            │ │
│ │    Disponibilidade: 100  ████████████████████ (10%)            │ │
│ │    Idioma:          100  ████████████████████ (5%)             │ │
│ │                                                                  │ │
│ │ [✅ APROVAR]  [👤 VER PERFIL COMPLETO]                         │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ 🥈 #2 - MARIA SANTOS                          Score: 87/100 ⭐⭐ │ │
│ │                                                                  │ │
│ │ 📧 maria.santos@halalsphere.com                                 │ │
│ │ 📞 +55 21 99876-5432                                            │ │
│ │                                                                  │ │
│ │ ✅ PONTOS FORTES:                                               │ │
│ │    • Avançado em Indústria de Alimentos                         │ │
│ │    • 8 anos de experiência                                      │ │
│ │    • 95% taxa de sucesso (32 auditorias)                        │ │
│ │    ⚠ Carga moderada (2/3 processos)                            │ │
│ │    • Fluente em PT, ES                                          │ │
│ │                                                                  │ │
│ │ [✅ ESCOLHER]  [👤 VER PERFIL]                                 │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ 🥉 #3 - CARLOS OLIVEIRA                       Score: 82/100 ⭐  │ │
│ │ [Expandir para ver detalhes]                                    │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ [🔍 BUSCAR OUTRO AUDITOR]  [❌ REJEITAR TODAS]  [📊 VER MÉTRICAS] │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

## 6. Dashboard do Gestor - Métricas

```
┌────────────────────────────────────────────────────────────────────────┐
│ 📊 DASHBOARD DE ALOCAÇÕES                                              │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│ VISÃO GERAL                                                            │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│ │ PENDENTES    │ │ APROVADAS    │ │ ATIVAS       │ │ CONCLUÍDAS   │ │
│ │      7       │ │     124      │ │      18      │ │     312      │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ │
│                                                                        │
│ TAXA DE APROVAÇÃO DE SUGESTÕES                                         │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ Aprovadas sem modificação: 87%  ████████████████████░░           │ │
│ │ Modificadas pelo gestor:   11%  ██░░░░░░░░░░░░░░░░░░             │ │
│ │ Rejeitadas:                 2%  ░░░░░░░░░░░░░░░░░░░░             │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ DISPONIBILIDADE DO TIME                                                │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ Total de Auditores: 12                                           │ │
│ │ Disponíveis:        8  (66%)  ████████████████░░░░░░             │ │
│ │ Moderado:           3  (25%)  ██████░░░░░░░░░░░░░░░              │ │
│ │ Ocupados:           1  (8%)   ██░░░░░░░░░░░░░░░░░░               │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ COMPETÊNCIAS POR CATEGORIA                                             │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ AI - Alimentos:    8 auditores  (4 certificados, 3 avançados)   │ │
│ │ BI - Cosméticos:   5 auditores  (2 certificados, 3 avançados)   │ │
│ │ CI - Farmácia:     3 auditores  (1 certificado, 2 avançados)    │ │
│ │ DI - Embalagens:   6 auditores  (3 certificados, 2 avançados)   │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ TEMPO MÉDIO DE DECISÃO                                                 │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ Última semana:     2.3 horas                                     │ │
│ │ Último mês:        3.7 horas                                     │ │
│ │ Meta:              4.0 horas   ✅ Dentro da meta                │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

## 7. Notificações

### Para o Gestor

```
┌────────────────────────────────────────────────────┐
│ 🔔 NOVA SUGESTÃO DE ALOCAÇÃO                       │
├────────────────────────────────────────────────────┤
│                                                    │
│ Processo: HS-2025-042                              │
│ Empresa: Alimentos Halal Ltda                      │
│                                                    │
│ 👤 Auditor sugerido: João Silva (Score: 98/100)   │
│                                                    │
│ [VER SUGESTÃO]  [APROVAR AGORA]                   │
│                                                    │
│ Há 5 minutos                                       │
└────────────────────────────────────────────────────┘
```

### Para o Auditor

```
┌────────────────────────────────────────────────────┐
│ ✅ VOCÊ FOI ALOCADO PARA NOVA AUDITORIA            │
├────────────────────────────────────────────────────┤
│                                                    │
│ Processo: HS-2025-042                              │
│ Empresa: Alimentos Halal Ltda                      │
│ Categoria: AI - Indústria de Alimentos            │
│                                                    │
│ 📅 Data da Auditoria: 25/12/2025                  │
│ 📍 Local: São Paulo - SP                          │
│                                                    │
│ Alocado por: Ricardo Costa (Gestor)               │
│                                                    │
│ [VER DETALHES]  [ACEITAR]                         │
│                                                    │
│ Há 30 segundos                                     │
└────────────────────────────────────────────────────┘
```

---

**Este documento complementa a proposta principal de Gestão de Alocação de Auditores.**
**Consulte também:** `GESTAO-ALOCACAO-AUDITORES.md`
