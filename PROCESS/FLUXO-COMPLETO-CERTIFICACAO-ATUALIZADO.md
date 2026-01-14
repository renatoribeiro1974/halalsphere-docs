# 🔄 Fluxo Completo de Certificação Halal - ATUALIZADO

**Data**: 08 de Dezembro de 2025
**Versão**: 3.0
**Status**: 📐 Proposta de Novo Fluxo

---

## 🎯 Visão Geral

Este documento apresenta o **fluxo completo e atualizado** do processo de certificação Halal, integrando todas as etapas desde a solicitação até a emissão do certificado.

**Total de Fases:** 17 (expandido de 12)
**Departamentos Envolvidos:** 7
**Tempo Médio Estimado:** 90-120 dias

---

## 📊 Fluxo Visual Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROCESSO DE CERTIFICAÇÃO HALAL               │
│                                                                 │
│  Empresa → Analista → Comercial → Jurídico → Gestor →          │
│  Auditor → Controlador → Comitê → Sistema                      │
└─────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════╗
║  FASE 1: CADASTRO DA SOLICITAÇÃO                              ║
║  Responsável: EMPRESA                                          ║
║  Tempo estimado: 1-3 horas                                     ║
╚═══════════════════════════════════════════════════════════════╝
│
│  [Wizard de 8 Etapas]
│  ├─ 1. Dados da Empresa
│  ├─ 2. Classificação Industrial (GSO 2055-2)
│  ├─ 3. Produção (capacidade, turnos, distância)
│  ├─ 4. Tipo de Produto (nome, categoria, quantidade)
│  ├─ 5. Ingredientes (fornecedores, origem)
│  ├─ 6. Mercados (países de destino) [NOVO]
│  ├─ 7. Documentação (upload de documentos)
│  └─ 8. Revisão e Submissão
│
│  Status: rascunho → pendente
│  Fase: cadastro_solicitacao
│  Ação: Empresa clica "Finalizar Solicitação"
│
│  ✅ Protocolo gerado: HS-2025-XXX
│  ✅ Notificação enviada aos analistas
│
▼

╔═══════════════════════════════════════════════════════════════╗
║  FASE 2: ANÁLISE INICIAL DE DOCUMENTOS                        ║
║  Responsável: ANALISTA                                         ║
║  Tempo estimado: 2-3 dias úteis                               ║
╚═══════════════════════════════════════════════════════════════╝
│
│  [Análise Superficial para Viabilidade]
│  ├─ Verifica se documentos básicos estão completos
│  ├─ Valida classificação industrial
│  ├─ Verifica se produto é certificável
│  ├─ Identifica necessidade de documentos adicionais
│  └─ Analisa viabilidade técnica inicial
│
│  Status: pendente → em_andamento (auto-atribuição)
│  Fase: analise_documental
│
│  ┌───────────────────────────────────────────┐
│  │  DECISÃO: Documentação Completa?         │
│  └───────────────────────────────────────────┘
│       │                    │
│       │ NÃO                │ SIM
│       │                    │
│       ▼                    ▼
│  [Solicita Docs]    [Aprova para Proposta]
│  aguardando_docs    analise_aprovada
│       │                    │
│       └───► [Empresa       │
│            envia docs]     │
│                │           │
│                └───────────┘
│
▼

╔═══════════════════════════════════════════════════════════════╗
║  FASE 3: ELABORAÇÃO DE PROPOSTA COMERCIAL [NOVO]              ║
║  Responsável: COMERCIAL                                        ║
║  Tempo estimado: 1-2 dias úteis                               ║
╚═══════════════════════════════════════════════════════════════╝
│
│  [Cálculo Automático + Revisão Manual]
│  │
│  ├─ Sistema calcula proposta baseado em:
│  │  ├─ Tipo de certificação (C1, C2, C3, C4, C5, C6)
│  │  ├─ Número de produtos (multiplicador)
│  │  ├─ Número de turnos (multiplicador)
│  │  ├─ Número de fornecedores (multiplicador)
│  │  ├─ Número de funcionários (man-hour)
│  │  ├─ Distância da sede (deslocamento)
│  │  ├─ Necessidade de hospedagem
│  │  ├─ Taxas fixas (análise, comitê, emissão)
│  │  └─ Impostos
│  │
│  ├─ Comercial revisa valores
│  ├─ Pode aplicar ajustes manuais (com justificativa)
│  ├─ Gera PDF da proposta
│  └─ Envia para cliente
│
│  Status: analise_aprovada → proposta_enviada
│  Fase: elaboracao_proposta
│
│  ✅ PDF gerado e armazenado
│  ✅ Email enviado para empresa
│  ✅ Validade: 30 dias
│
▼

╔═══════════════════════════════════════════════════════════════╗
║  FASE 4: NEGOCIAÇÃO E ACEITE DA PROPOSTA [NOVO]               ║
║  Responsável: COMERCIAL + EMPRESA                             ║
║  Tempo estimado: 3-7 dias úteis                               ║
╚═══════════════════════════════════════════════════════════════╝
│
│  [Cliente Avalia e Decide]
│  │
│  ├─ Empresa visualiza proposta no sistema
│  ├─ Pode solicitar ajustes (comentários)
│  ├─ Comercial negocia valores (se necessário)
│  └─ Empresa decide: Aceitar ou Recusar
│
│  Status: proposta_enviada → em_negociacao (opcional)
│  Fase: negociacao_proposta
│
│  ┌───────────────────────────────────────────┐
│  │  DECISÃO: Empresa aceita proposta?       │
│  └───────────────────────────────────────────┘
│       │                    │
│       │ NÃO                │ SIM
│       │                    │
│       ▼                    ▼
│  [Proposta Recusada]  [Proposta Aprovada]
│  proposta_recusada    proposta_aprovada
│       │                    │
│       │ [Comercial         │
│       │  reformula]        │
│       │                    │
│       └─► volta Fase 3     │
│                            │
│  ✅ Data de aprovação registrada
│  ✅ Notificação enviada ao Jurídico
│
▼

╔═══════════════════════════════════════════════════════════════╗
║  FASE 5: ELABORAÇÃO DE CONTRATO [NOVO]                        ║
║  Responsável: JURÍDICO                                         ║
║  Tempo estimado: 2-3 dias úteis                               ║
╚═══════════════════════════════════════════════════════════════╝
│
│  [Confecção do Contrato]
│  │
│  ├─ Sistema gera minuta baseada na proposta aprovada
│  ├─ Jurídico revisa e ajusta cláusulas
│  ├─ Inclui valores e condições da proposta
│  ├─ Define número de parcelas e vencimentos
│  ├─ Gera PDF do contrato (minuta)
│  └─ Envia para assinatura da empresa
│
│  Status: proposta_aprovada → elaborando_contrato
│  Fase: elaboracao_contrato
│
│  ✅ Minuta gerada e armazenada
│  ✅ Email enviado para empresa
│
▼

╔═══════════════════════════════════════════════════════════════╗
║  FASE 6: ASSINATURA DE CONTRATO [NOVO]                        ║
║  Responsável: JURÍDICO + EMPRESA                              ║
║  Tempo estimado: 3-7 dias úteis                               ║
╚═══════════════════════════════════════════════════════════════╝
│
│  [Processo de Assinatura]
│  │
│  ├─ Empresa assina contrato (digital ou física)
│  │  └─ Upload de contrato assinado OU assinatura digital
│  │
│  ├─ Certificadora assina contrato
│  │  └─ Representante legal assina
│  │
│  ├─ Jurídico faz upload do contrato final (ambas assinaturas)
│  └─ Sistema valida assinaturas completas
│
│  Status: elaborando_contrato → aguardando_assinatura → contrato_assinado
│  Fase: assinatura_contrato
│
│  ┌───────────────────────────────────────────┐
│  │  VALIDAÇÃO: Ambas assinaturas OK?        │
│  └───────────────────────────────────────────┘
│       │
│       │ SIM
│       │
│       ▼
│  ✅ Contrato assinado armazenado
│  ✅ Data de assinatura registrada
│  ✅ Notificação enviada: Financeiro (cobrança) e Analista (avaliação)
│
▼

╔═══════════════════════════════════════════════════════════════╗
║  FASE 7: PAGAMENTO DE TAXAS [NOVO]                            ║
║  Responsável: FINANCEIRO + EMPRESA                            ║
║  Tempo estimado: 5-10 dias úteis                              ║
╚═══════════════════════════════════════════════════════════════╝
│
│  [Cobrança e Pagamento]
│  │
│  ├─ Sistema gera boletos/cobranças (conforme contrato)
│  ├─ Empresa efetua pagamento (1ª parcela ou integral)
│  ├─ Sistema registra pagamento
│  └─ Libera processo para próxima fase
│
│  Status: contrato_assinado → aguardando_pagamento → pagamento_confirmado
│  Fase: pagamento
│
│  ⚠️ Processo não avança sem pagamento confirmado
│  ✅ Notificação enviada ao Analista para avaliação detalhada
│
▼

╔═══════════════════════════════════════════════════════════════╗
║  FASE 8: AVALIAÇÃO DOCUMENTAL DETALHADA [NOVO]                ║
║  Responsável: ANALISTA                                         ║
║  Tempo estimado: 3-5 dias úteis                               ║
╚═══════════════════════════════════════════════════════════════╝
│
│  [Análise Profunda de Matérias-Primas e Processos]
│  │
│  ├─ Análise de riscos de matérias-primas
│  │  ├─ Valida origem de ingredientes
│  │  ├─ Verifica certificados Halal dos fornecedores
│  │  ├─ Analisa contaminação cruzada
│  │  └─ Identifica ingredientes críticos
│  │
│  ├─ Análise de processos produtivos
│  │  ├─ Fluxograma de produção
│  │  ├─ Pontos críticos de controle
│  │  └─ Procedimentos de limpeza/sanitização
│  │
│  ├─ Checklist de conformidade pré-auditoria
│  ├─ Solicita documentos complementares (se necessário)
│  └─ Aprova para agendamento de auditoria
│
│  Status: pagamento_confirmado → avaliacao_detalhada → avaliacao_aprovada
│  Fase: avaliacao_detalhada
│
│  ✅ Relatório de pré-análise gerado
│  ✅ Checklist para auditoria preparado
│  ✅ Notificação enviada ao Gestor de Auditoria
│
▼

╔═══════════════════════════════════════════════════════════════╗
║  FASE 9: AGENDAMENTO DE AUDITORIA                             ║
║  Responsável: GESTOR DE AUDITORIA                             ║
║  Tempo estimado: 3-7 dias úteis                               ║
╚═══════════════════════════════════════════════════════════════╝
│
│  [Planejamento da Auditoria]
│  │
│  ├─ Aloca equipe de auditoria (auditores qualificados)
│  ├─ Coordena data/horário com empresa
│  ├─ Define escopo da auditoria (Estágio 1)
│  ├─ Envia checklist pré-auditoria para empresa
│  ├─ Agenda logística (transporte, hospedagem)
│  └─ Registra auditoria no sistema
│
│  Status: avaliacao_aprovada → auditoria_agendada
│  Fase: auditoria_agendada
│
│  ✅ Data confirmada
│  ✅ Equipe alocada
│  ✅ Notificações enviadas: Empresa, Auditores
│
▼

╔═══════════════════════════════════════════════════════════════╗
║  FASE 10: AUDITORIA ESTÁGIO 1 [ATUALIZADO]                    ║
║  Responsável: AUDITOR                                          ║
║  Tempo estimado: 1-2 dias (no cliente)                        ║
╚═══════════════════════════════════════════════════════════════╝
│
│  [Auditoria Documental e de Sistema]
│  │
│  ├─ Revisão de documentação in loco
│  ├─ Verificação de procedimentos e registros
│  ├─ Entrevistas com responsáveis
│  ├─ Inspeção preliminar das instalações
│  ├─ Identificação de não conformidades (NC)
│  │  ├─ NC Menor
│  │  ├─ NC Maior
│  │  └─ NC Crítica
│  │
│  └─ Elaboração de relatório preliminar
│
│  Status: auditoria_agendada → em_auditoria_estagio1 → auditoria_estagio1_concluida
│  Fase: auditoria_estagio1
│
│  ┌───────────────────────────────────────────┐
│  │  DECISÃO: Encontrou não conformidades?   │
│  └───────────────────────────────────────────┘
│       │                    │
│       │ SIM (NC > 0)       │ NÃO (NC = 0)
│       │                    │
│       ▼                    │
│  [Relatório com NC]        │
│  nc_estagio1_registradas   │
│       │                    │
│       └────────────────────┘
│                │
│  ✅ Relatório enviado para empresa
│  ✅ NC registradas no sistema com prazo de correção
│
▼

╔═══════════════════════════════════════════════════════════════╗
║  FASE 11: CORREÇÃO DE NÃO CONFORMIDADES - ESTÁGIO 1 [NOVO]    ║
║  Responsável: EMPRESA + AUDITOR                               ║
║  Tempo estimado: 30-60 dias                                   ║
╚═══════════════════════════════════════════════════════════════╝
│
│  [Plano de Ação Corretiva]
│  │
│  ├─ Empresa recebe relatório com NC identificadas
│  ├─ Para cada NC, empresa deve:
│  │  ├─ Elaborar plano de ação corretiva
│  │  ├─ Implementar correções
│  │  ├─ Coletar evidências (fotos, documentos, registros)
│  │  └─ Submeter evidências no sistema (dentro do prazo)
│  │
│  ├─ Auditor valida cada correção:
│  │  ├─ Analisa evidências submetidas
│  │  ├─ Aprova ou solicita revisão
│  │  └─ Registra validação no sistema
│  │
│  └─ Todas NC devem ser validadas para prosseguir
│
│  Status: auditoria_estagio1_concluida → correcao_nc_estagio1 → nc_estagio1_validadas
│  Fase: correcao_nc_estagio1
│
│  ⚠️ Se prazo vencer sem correção: processo pode ser cancelado
│  ⚠️ NC Críticas: bloqueiam avanço até correção
│
│  ┌───────────────────────────────────────────┐
│  │  VALIDAÇÃO: Todas NC corrigidas?         │
│  └───────────────────────────────────────────┘
│       │
│       │ SIM
│       │
│       ▼
│  ✅ NC validadas pelo auditor
│  ✅ Sistema libera para Estágio 2
│  ✅ Notificação enviada ao Gestor de Auditoria
│
▼

╔═══════════════════════════════════════════════════════════════╗
║  FASE 12: AUDITORIA ESTÁGIO 2 [ATUALIZADO]                    ║
║  Responsável: AUDITOR                                          ║
║  Tempo estimado: 1-3 dias (no cliente)                        ║
╚═══════════════════════════════════════════════════════════════╝
│
│  [Auditoria Completa de Certificação]
│  │
│  ├─ Inspeção detalhada de todas as instalações
│  │  ├─ Recebimento de matérias-primas
│  │  ├─ Armazenamento
│  │  ├─ Áreas de produção
│  │  ├─ Embalagem
│  │  ├─ Expedição
│  │  └─ Áreas de apoio
│  │
│  ├─ Verificação de implementação de BPF (Boas Práticas)
│  ├─ Rastreabilidade de ingredientes
│  ├─ Verificação das correções de NC do Estágio 1
│  ├─ Coleta de amostras (se aplicável)
│  ├─ Entrevistas com equipe operacional
│  ├─ Registro fotográfico
│  ├─ Identificação de novas NC (se houver)
│  └─ Elaboração de relatório final de auditoria
│
│  Status: nc_estagio1_validadas → em_auditoria_estagio2 → auditoria_estagio2_concluida
│  Fase: auditoria_estagio2
│
│  ┌───────────────────────────────────────────┐
│  │  DECISÃO: Encontrou não conformidades?   │
│  └───────────────────────────────────────────┘
│       │                    │
│       │ SIM (NC > 0)       │ NÃO (NC = 0)
│       │                    │
│       ▼                    ▼
│  [Relatório com NC]    [Relatório OK]
│  nc_estagio2_registradas   │
│       │                    │
│       └────────────────────┘
│                │
│  ✅ Relatório final gerado
│  ✅ Fotos e evidências anexadas
│
▼

╔═══════════════════════════════════════════════════════════════╗
║  FASE 13: CORREÇÃO DE NÃO CONFORMIDADES - ESTÁGIO 2 [NOVO]    ║
║  Responsável: EMPRESA + AUDITOR                               ║
║  Tempo estimado: 15-30 dias                                   ║
╚═══════════════════════════════════════════════════════════════╝
│
│  [Mesmo processo da Fase 11, mas para NC do Estágio 2]
│  │
│  ├─ Empresa corrige NC identificadas no Estágio 2
│  ├─ Submete evidências
│  └─ Auditor valida correções
│
│  Status: auditoria_estagio2_concluida → correcao_nc_estagio2 → nc_estagio2_validadas
│  Fase: correcao_nc_estagio2
│
│  ⚠️ NC Críticas no Estágio 2: podem exigir nova auditoria
│
│  ┌───────────────────────────────────────────┐
│  │  DECISÃO: Todas NC corrigidas?           │
│  └───────────────────────────────────────────┘
│       │
│       │ SIM
│       │
│       ▼
│  ✅ NC validadas
│  ✅ Notificação enviada ao Controlador
│
▼

╔═══════════════════════════════════════════════════════════════╗
║  FASE 14: VALIDAÇÃO DE AUDITORIA [NOVO]                       ║
║  Responsável: CONTROLADOR + SUPERVISOR                        ║
║  Tempo estimado: 2-3 dias úteis                               ║
╚═══════════════════════════════════════════════════════════════╝
│
│  [Revisão Técnica do Relatório]
│  │
│  ├─ Supervisor acompanha processo in loco (opcional)
│  ├─ Controlador revisa relatório de auditoria
│  │  ├─ Valida evidências fotográficas
│  │  ├─ Verifica conformidade com normas
│  │  ├─ Analisa correções de NC
│  │  └─ Verifica rastreabilidade
│  │
│  ├─ Solicita esclarecimentos (se necessário)
│  └─ Aprova relatório para comitê técnico
│
│  Status: nc_estagio2_validadas (ou auditoria_estagio2_concluida) → em_validacao → validacao_aprovada
│  Fase: validacao_auditoria
│
│  ✅ Relatório validado
│  ✅ Documentação completa conferida
│  ✅ Notificação enviada ao Comitê Técnico
│
▼

╔═══════════════════════════════════════════════════════════════╗
║  FASE 15: ANÁLISE LABORATORIAL (Opcional) [NOVO]              ║
║  Responsável: LABORATÓRIO EXTERNO                             ║
║  Tempo estimado: 10-15 dias úteis                             ║
╚═══════════════════════════════════════════════════════════════╝
│
│  [Análise de Amostras]
│  │
│  ├─ Aplicável para:
│  │  ├─ C1 (Alimentos processados): Geralmente requer
│  │  ├─ C2 (Químicos): Sempre requer
│  │  ├─ C3 (Cosméticos): Geralmente requer
│  │  ├─ C4 (Farmacêuticos): Sempre requer
│  │  └─ C5, C6: Raramente requer
│  │
│  ├─ Amostras coletadas durante Estágio 2
│  ├─ Laboratório realiza análises:
│  │  ├─ Detecção de ingredientes proibidos
│  │  ├─ Contaminação cruzada
│  │  ├─ Conformidade de composição
│  │  └─ Outros testes específicos
│  │
│  ├─ Laboratório emite laudo técnico
│  └─ Laudo anexado ao processo
│
│  Status: validacao_aprovada → analise_laboratorial → laudo_recebido
│  Fase: analise_laboratorial
│
│  ┌───────────────────────────────────────────┐
│  │  DECISÃO: Resultado do laudo?            │
│  └───────────────────────────────────────────┘
│       │                    │
│       │ REPROVADO          │ APROVADO
│       │                    │
│       ▼                    ▼
│  [Processo Bloqueado]  [Prossegue]
│  laudo_reprovado       laudo_aprovado
│       │                    │
│       └─► [Ações           │
│            corretivas]     │
│                            │
│  ✅ Laudo anexado ao processo
│  ✅ Notificação enviada ao Comitê
│
▼

╔═══════════════════════════════════════════════════════════════╗
║  FASE 16: COMITÊ TÉCNICO - DECISÃO DE CERTIFICAÇÃO            ║
║  Responsável: COMITÊ (Analistas + Gestores)                   ║
║  Tempo estimado: 3-5 dias úteis                               ║
╚═══════════════════════════════════════════════════════════════╝
│
│  [Análise Final e Decisão]
│  │
│  ├─ Comitê analisa documentação completa:
│  │  ├─ Relatório de análise documental
│  │  ├─ Relatório de Estágio 1
│  │  ├─ Relatório de Estágio 2
│  │  ├─ Correções de NC
│  │  ├─ Laudo laboratorial (se aplicável)
│  │  └─ Parecer do controlador
│  │
│  ├─ Membros do comitê votam individualmente
│  ├─ Decisão final (maioria dos votos)
│  └─ Justificativa documentada
│
│  Status: (laudo_aprovado ou validacao_aprovada) → comite_tecnico → decisao_final
│  Fase: comite_tecnico
│
│  ┌───────────────────────────────────────────┐
│  │  DECISÃO FINAL DO COMITÊ                 │
│  └───────────────────────────────────────────┘
│       │              │              │
│       │ APROVAR      │ REPROVAR     │ SOLICITAR INFO
│       │              │              │
│       ▼              ▼              ▼
│  [Aprovado]    [Reprovado]    [Mais Info]
│  aprovado      reprovado      solicitar_info
│       │              │              │
│       │              │              └─► [Volta para
│       │              │                   fase anterior]
│       │              │
│       │              └─► [Processo
│       │                   encerrado]
│       │                   certificacao_negada
│       │
│  ✅ Decisão registrada com votos individuais
│  ✅ Justificativa documentada
│  ✅ Notificação enviada: Empresa, Analista
│
▼

╔═══════════════════════════════════════════════════════════════╗
║  FASE 17: EMISSÃO DE CERTIFICADO                              ║
║  Responsável: SISTEMA (Automático)                            ║
║  Tempo estimado: 1-2 dias úteis                               ║
╚═══════════════════════════════════════════════════════════════╝
│
│  [Geração Automática do Certificado]
│  │
│  ├─ Sistema gera número único: CERT-2025-XXXXXX
│  ├─ Cria registro na tabela certificates
│  ├─ Registra produtos no escopo (certified_products)
│  ├─ Calcula validade: data_emissão + meses_contrato
│  ├─ Gera PDF do certificado Halal:
│  │  ├─ Logo HalalSphere + Logo GSO
│  │  ├─ Número do certificado
│  │  ├─ QR Code (validação online)
│  │  ├─ Dados da empresa certificada
│  │  ├─ Escopo de produtos (tabela)
│  │  ├─ Tipo de certificação (C1, C2, etc.)
│  │  ├─ Validade: De XX/XX/XXXX até XX/XX/XXXX
│  │  ├─ Países autorizados
│  │  ├─ Assinatura digital do diretor técnico
│  │  └─ Observações e condições
│  │
│  ├─ Armazena PDF no storage
│  ├─ Envia certificado para empresa (email)
│  └─ Disponibiliza para download no portal
│
│  Status: aprovado → certificado
│  Fase: certificado_emitido
│
│  ✅ Certificado emitido
│  ✅ PDF gerado e armazenado
│  ✅ Email enviado para empresa
│  ✅ Processo concluído com sucesso
│
│  ┌───────────────────────────────────────────┐
│  │  CERTIFICADO HALAL EMITIDO                │
│  │  Válido por: 24 meses                     │
│  │  Renovação: 90 dias antes do vencimento   │
│  └───────────────────────────────────────────┘

▼

[FIM DO PROCESSO DE CERTIFICAÇÃO]

════════════════════════════════════════════════════════════════

PROCESSOS CONTÍNUOS PÓS-CERTIFICAÇÃO:

├─ Auditorias de Vigilância (a cada 6-12 meses)
├─ Renovação de Certificado (antes do vencimento)
├─ Ampliação de Escopo (novos produtos)
└─ Gestão de Validade (alertas 90/60/30 dias)

════════════════════════════════════════════════════════════════
```

---

## 📊 Tabela Resumida de Fases

| # | Fase | Responsável | Tempo | Status Inicial → Final |
|---|------|-------------|-------|------------------------|
| 1 | Cadastro da Solicitação | Empresa | 1-3h | rascunho → pendente |
| 2 | Análise Inicial | Analista | 2-3d | pendente → analise_aprovada |
| 3 | Elaboração de Proposta | Comercial | 1-2d | analise_aprovada → proposta_enviada |
| 4 | Aceite da Proposta | Empresa + Comercial | 3-7d | proposta_enviada → proposta_aprovada |
| 5 | Elaboração de Contrato | Jurídico | 2-3d | proposta_aprovada → elaborando_contrato |
| 6 | Assinatura de Contrato | Jurídico + Empresa | 3-7d | elaborando_contrato → contrato_assinado |
| 7 | Pagamento de Taxas | Financeiro + Empresa | 5-10d | contrato_assinado → pagamento_confirmado |
| 8 | Avaliação Detalhada | Analista | 3-5d | pagamento_confirmado → avaliacao_aprovada |
| 9 | Agendamento de Auditoria | Gestor Auditoria | 3-7d | avaliacao_aprovada → auditoria_agendada |
| 10 | Auditoria Estágio 1 | Auditor | 1-2d | auditoria_agendada → auditoria_estagio1_concluida |
| 11 | Correção NC Estágio 1 | Empresa + Auditor | 30-60d | auditoria_estagio1_concluida → nc_estagio1_validadas |
| 12 | Auditoria Estágio 2 | Auditor | 1-3d | nc_estagio1_validadas → auditoria_estagio2_concluida |
| 13 | Correção NC Estágio 2 | Empresa + Auditor | 15-30d | auditoria_estagio2_concluida → nc_estagio2_validadas |
| 14 | Validação de Auditoria | Controlador + Supervisor | 2-3d | nc_estagio2_validadas → validacao_aprovada |
| 15 | Análise Laboratorial | Laboratório | 10-15d | validacao_aprovada → laudo_aprovado |
| 16 | Comitê Técnico | Comitê | 3-5d | laudo_aprovado → aprovado |
| 17 | Emissão de Certificado | Sistema | 1-2d | aprovado → certificado |

**Tempo Total Estimado:** 90-120 dias úteis (3-4 meses)

---

## 🎭 Papéis e Responsabilidades

### **1. EMPRESA** (Cliente)
- ✅ Preencher solicitação (Fase 1)
- ✅ Fornecer documentos
- ✅ Aceitar proposta (Fase 4)
- ✅ Assinar contrato (Fase 6)
- ✅ Efetuar pagamento (Fase 7)
- ✅ Corrigir não conformidades (Fases 11, 13)
- ✅ Receber auditoria

### **2. ANALISTA**
- ✅ Análise inicial de documentos (Fase 2)
- ✅ Avaliação detalhada de matérias-primas (Fase 8)
- ✅ Participar do comitê técnico (Fase 16)

### **3. COMERCIAL** [NOVO]
- ✅ Elaborar proposta comercial (Fase 3)
- ✅ Negociar valores (Fase 4)
- ✅ Aprovar descontos

### **4. JURÍDICO** [NOVO]
- ✅ Elaborar contrato (Fase 5)
- ✅ Gerenciar assinaturas (Fase 6)
- ✅ Arquivar documentos legais

### **5. FINANCEIRO** [NOVO]
- ✅ Gerar cobranças (Fase 7)
- ✅ Registrar pagamentos
- ✅ Controlar inadimplência

### **6. GESTOR DE AUDITORIA** [NOVO]
- ✅ Agendar auditorias (Fase 9)
- ✅ Alocar equipe de auditores
- ✅ Coordenar logística

### **7. AUDITOR**
- ✅ Executar Estágio 1 (Fase 10)
- ✅ Executar Estágio 2 (Fase 12)
- ✅ Registrar não conformidades
- ✅ Validar correções (Fases 11, 13)

### **8. CONTROLADOR + SUPERVISOR** [NOVO]
- ✅ Validar relatórios de auditoria (Fase 14)
- ✅ Verificar evidências
- ✅ Acompanhar in loco (opcional)

### **9. COMITÊ TÉCNICO**
- ✅ Analisar processo completo (Fase 16)
- ✅ Votar pela aprovação/reprovação
- ✅ Documentar decisão

### **10. SISTEMA** (Automático)
- ✅ Gerar protocolo
- ✅ Calcular proposta
- ✅ Enviar notificações
- ✅ Emitir certificado (Fase 17)

---

## 📝 Status do Processo

### **Status Principais:**

```typescript
enum ProcessStatus {
  // Inicial
  rascunho
  pendente

  // Análise
  em_andamento
  aguardando_documentos
  analise_aprovada

  // Comercial [NOVOS]
  proposta_enviada
  em_negociacao
  proposta_aprovada
  proposta_recusada

  // Jurídico [NOVOS]
  elaborando_contrato
  aguardando_assinatura
  contrato_assinado

  // Financeiro [NOVO]
  aguardando_pagamento
  pagamento_confirmado

  // Avaliação [NOVO]
  avaliacao_detalhada
  avaliacao_aprovada

  // Auditoria [ATUALIZADOS]
  auditoria_agendada
  em_auditoria_estagio1
  auditoria_estagio1_concluida
  correcao_nc_estagio1
  nc_estagio1_validadas
  em_auditoria_estagio2
  auditoria_estagio2_concluida
  correcao_nc_estagio2
  nc_estagio2_validadas

  // Validação [NOVOS]
  em_validacao
  validacao_aprovada

  // Laboratorial [NOVO]
  analise_laboratorial
  laudo_aprovado
  laudo_reprovado

  // Comitê
  comite_tecnico
  aprovado
  reprovado

  // Final
  certificado
  cancelado
  suspenso
}
```

---

## 🔔 Notificações Automáticas

### **Para EMPRESA:**
1. Solicitação recebida (protocolo gerado)
2. Analista atribuído
3. Documentos solicitados
4. Proposta comercial enviada
5. Proposta aprovada (confirmação)
6. Contrato enviado para assinatura
7. Contrato assinado (confirmação)
8. Cobrança gerada
9. Pagamento confirmado
10. Auditoria agendada (data/hora)
11. Relatório de auditoria recebido
12. NC registradas (prazo para correção)
13. NC validadas
14. Decisão do comitê técnico
15. Certificado emitido

### **Para ANALISTA:**
1. Nova solicitação pendente
2. Documentos complementares recebidos
3. Proposta aprovada (pode iniciar avaliação detalhada)
4. Pagamento confirmado (iniciar avaliação)
5. Reunião do comitê agendada

### **Para COMERCIAL:**
1. Análise aprovada (elaborar proposta)
2. Proposta recusada (renegociar)
3. Proposta aprovada (sucesso!)

### **Para JURÍDICO:**
1. Proposta aprovada (elaborar contrato)
2. Empresa assinou contrato (aguardando certificadora)
3. Contrato totalmente assinado

### **Para AUDITOR:**
1. Auditoria agendada (detalhes)
2. NC aguardando validação
3. Evidências de correção recebidas

### **Para CONTROLADOR:**
1. Auditoria concluída (revisar relatório)
2. Relatório validado

### **Para COMITÊ:**
1. Processo pronto para análise
2. Reunião do comitê agendada

---

## ⏱️ Prazos Críticos

| Atividade | Prazo | Consequência se Vencido |
|-----------|-------|-------------------------|
| Empresa enviar documentos complementares | 15 dias | Processo pode ser cancelado |
| Empresa responder proposta | 30 dias | Proposta expira, precisa reenviar |
| Empresa assinar contrato | 30 dias | Contrato pode ser cancelado |
| Empresa efetuar pagamento | Vencimento da parcela | Multa + juros ou cancelamento |
| Empresa corrigir NC Estágio 1 | 30-60 dias | Processo pode ser cancelado |
| Empresa corrigir NC Estágio 2 | 15-30 dias | Pode exigir nova auditoria |
| Auditor validar correções | 7 dias | Atraso no processo |
| Comitê técnico decidir | 10 dias após solicitação | Atraso na certificação |

---

## 📈 Métricas de Desempenho

### **KPIs Operacionais:**
- Tempo médio por fase
- Taxa de conversão (solicitação → certificado)
- Taxa de aprovação no comitê
- Tempo médio de correção de NC
- Taxa de NC por tipo de certificação
- Taxa de retrabalho (documentos solicitados)

### **KPIs Comerciais:**
- Taxa de aceitação de proposta
- Valor médio de proposta
- Tempo médio de negociação
- Taxa de desconto aplicado

### **KPIs de Qualidade:**
- Número médio de NC por auditoria
- Taxa de NC críticas
- Taxa de reprovação laboratorial
- Taxa de aprovação no comitê

---

**Elaborado por**: Claude Code (Assistente de IA)
**Data**: 08 de Dezembro de 2025
**Versão**: 3.0
**Status**: 📐 Fluxo Completo Atualizado
