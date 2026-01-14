# 📋 17 Fases do Processo de Certificação Halal

**Documento de Referência**: Fluxo Completo do Processo de Certificação
**Versão**: 1.0
**Data**: 13/01/2026
**Baseado em**: PR 7.1 Rev 21 + GSO 2055-2 + Schema Prisma

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Fluxo Comercial (Fases 1-7)](#fluxo-comercial-nova-certificação---fases-1-a-7)
3. [Fluxo Operacional (Fases 8-17)](#fluxo-operacional-todas-certificações---fases-8-a-17)
4. [Resumo por Responsável](#-resumo-por-responsável)
5. [Prazos Médios](#️-prazos-médios-por-fase)
6. [Transições Automáticas](#-transições-automáticas)

---

## Visão Geral

O processo de certificação Halal no HalalSphere é dividido em **17 fases sequenciais**, organizadas em dois fluxos principais:

- **Fluxo Comercial** (Fases 1-7): Aplicável apenas para novas certificações
- **Fluxo Operacional** (Fases 8-17): Aplicável para todas certificações (nova, renovação, expansão)

**Objetivo**: Reduzir tempo de certificação de **7-8 meses** para **2-3 meses** através de automação inteligente e AI.

**Referências Técnicas**:
- `backend/prisma/schema.prisma` → enum `ProcessPhase`
- `backend/src/modules/process/process-transition.service.ts` → Lógica de transições
- PR 7.1 Rev 21 (Procedimento de Certificação)
- GSO 2055-2 (Classificação Industrial)

---

## Fluxo Comercial (Nova Certificação) - Fases 1 a 7

### **Fase 1: Cadastro da Solicitação**
**Código**: `cadastro_solicitacao`
**Responsável**: 👤 **Empresa**
**Status Process**: `rascunho` → `pendente`
**Prazo Médio**: ~20 minutos

#### Ações da Empresa:
1. **Preencher wizard de 9 etapas** ([NewRequestWizard.tsx](../../frontend/src/pages/company/NewRequestWizard.tsx)):
   - **Etapa 1**: Dados Gerais da Empresa
   - **Etapa 2**: Classificação Industrial (GSO 2055-2)
     - Nível 1: Grupo (A, B, C, D)
     - Nível 2: Categoria (AI, AII, BI, BII, CI-CIV, DI, DII)
     - Nível 3: Subcategoria (atividade específica)
   - **Etapa 3**: Escopo da Certificação e Produtos (C1-C6)
   - **Etapa 4**: Produção e Processos
   - **Etapa 5**: Matérias-Primas e Fornecedores
   - **Etapa 6**: Upload de Documentos Obrigatórios
   - **Etapa 7**: Revisão Final e Aceite de Termos

2. **Upload de documentos obrigatórios** (varia por tipo de certificação):
   - Contrato Social / Estatuto
   - Licença de Funcionamento
   - Fluxograma de Produção
   - Fichas Técnicas de Produtos
   - Certificados Halal de Fornecedores (se origem animal)
   - Fotos da Planta Industrial (mínimo 5)
   - Procedimentos de Higienização, Rastreabilidade, Controle de Pragas

3. **Submeter solicitação**:
   - Sistema gera protocolo único: `HS-YYYY-NNNNNN` (ex: HS-2026-000123)
   - Sistema envia email de confirmação
   - Sistema notifica fila de analistas

#### Validações:
- Classificação industrial completa (3 níveis)
- Pelo menos 1 produto cadastrado
- Todos documentos obrigatórios enviados
- Termos aceitos

#### Referência Técnica:
- PR 7.1 Seção 10.1 - Análise Crítica de Solicitação
- Schema: `Request` + `Process` models
- Frontend: [NewRequestWizard.tsx](../../frontend/src/pages/company/NewRequestWizard.tsx)
- Backend: [process.service.ts](../../backend/src/modules/process/process.service.ts)

---

### **Fase 2: Análise Documental Inicial**
**Código**: `analise_documental_inicial`
**Responsável**: 👨‍💼 **Analista**
**Status Process**: `analise_documental`
**Prazo Médio**: 3-5 dias úteis

#### Ações do Analista:
1. **Revisar elegibilidade da empresa** (PR 7.1 10.2):
   - Verificar se empresa atende requisitos básicos
   - Validar CNPJ/NIT/RUT (conforme país)
   - Confirmar licenças de funcionamento válidas

2. **Analisar classificação industrial selecionada**:
   - Validar se Grupo → Categoria → Subcategoria está correto
   - Sugerir reclassificação se necessário

3. **Validar documentação obrigatória**:
   - Revisar cada documento enviado
   - Marcar status: ✅ Aprovado / ❌ Rejeitado / ⚠️ Requer Atenção
   - Adicionar comentários/motivos de rejeição

4. **Solicitar documentos complementares** (se necessário):
   - Criar DocumentRequest via sistema
   - Sistema notifica empresa automaticamente

5. **Atribuir prioridade ao processo**:
   - Baixa / Média / Alta / Urgente

#### Critérios de Aprovação:
- Todos documentos obrigatórios enviados e aprovados
- Classificação industrial validada
- Empresa elegível para certificação

#### Transição Automática:
- Quando todos documentos aprovados → Avança para Fase 3

#### Referência Técnica:
- PR 7.1 Seção 10.2 - Revisão de Solicitação
- Frontend: [DocumentRequestsAnalystView.tsx](../../frontend/src/components/analyst/DocumentRequestsAnalystView.tsx)
- Backend: [document-request.service.ts](../../backend/src/modules/document-request/document-request.service.ts)

---

### **Fase 3: Elaboração da Proposta**
**Código**: `elaboracao_proposta`
**Responsável**: 💼 **Comercial**
**Status Process**: `em_andamento`
**Prazo Médio**: 2-3 dias úteis

#### Ações do Comercial:
1. **Calcular man-hours de auditoria** (PR 7.1 10.7.4):
   - Baseado em:
     - Número de funcionários
     - Número de turnos (1, 2 ou 3)
     - Complexidade da operação
     - Classificação industrial (GSO 2055-2)
     - Número de produtos
     - Tipo de certificação (C1-C6)

2. **Calcular custos por país**:
   - Brasil (BRL): Tabela de preços específica
   - Colômbia (COP): Tabela de preços específica
   - Paraguai (PYG): Tabela de preços específica

3. **Gerar proposta comercial detalhada**:
   - Escopo da certificação
   - Produtos incluídos
   - Man-hours estimados
   - Custos discriminados:
     - Taxa de solicitação
     - Auditoria Estágio 1
     - Auditoria Estágio 2
     - Emissão de certificado
     - Auditorias de vigilância anuais
   - Validade da proposta (30-60 dias)

4. **Revisar e ajustar proposta**:
   - Aplicar descontos (se autorizados)
   - Ajustar condições comerciais

#### Referência Técnica:
- PR 7.1 Seção 10.7.4 - Cálculo de Man-Hours
- Schema: `Proposal` model
- Backend: [proposal.service.ts](../../backend/src/modules/proposal/proposal.service.ts)

---

### **Fase 4: Negociação da Proposta**
**Código**: `negociacao_proposta`
**Responsável**: 💼 **Comercial** + 👤 **Empresa**
**Status Process**: `proposta_enviada`
**Prazo Médio**: 5-7 dias úteis

#### Ações do Comercial:
1. **Enviar proposta para empresa**:
   - Email com PDF da proposta
   - Link para visualizar no portal
   - Prazo para resposta

2. **Negociar valores e condições**:
   - Chat/mensagens com empresa
   - Ajustar proposta conforme negociação
   - Aplicar descontos autorizados

3. **Registrar histórico de negociação**:
   - Todas alterações versionadas
   - Justificativas de ajustes

#### Ações da Empresa:
1. **Revisar proposta comercial**:
   - Analisar escopo e valores
   - Verificar condições de pagamento

2. **Solicitar ajustes ou esclarecimentos**:
   - Via chat no sistema
   - Ou por email

3. **Aceitar ou recusar proposta**:
   - Botão "Aceitar Proposta" no sistema
   - Ou recusar com justificativa

#### Referência Técnica:
- PR 7.1 Seção 10.3 - Proposta Comercial
- Frontend: [ProposalList.tsx](../../frontend/src/pages/comercial/ProposalList.tsx)

---

### **Fase 5: Proposta Aprovada**
**Código**: `proposta_aprovada`
**Responsável**: 👤 **Empresa**
**Status Process**: `proposta_enviada`
**Prazo Médio**: Imediato (ação da empresa)

#### Ações:
1. **Empresa formaliza aceitação**:
   - Clica em "Aceitar Proposta" no sistema
   - Sistema registra aceite com timestamp

2. **Sistema avança automaticamente**:
   - Notifica equipe jurídica
   - Cria tarefa para elaboração de contrato

#### Transição Automática:
- Quando proposta aceita → Avança para Fase 6

---

### **Fase 6: Elaboração do Contrato**
**Código**: `elaboracao_contrato`
**Responsável**: ⚖️ **Jurídico**
**Status Process**: `aguardando_assinatura`
**Prazo Médio**: 2-3 dias úteis

#### Ações do Jurídico:
1. **Gerar minuta de contrato**:
   - Baseada na proposta aprovada
   - Template específico por tipo de certificação
   - Cláusulas padrão + específicas

2. **Incluir dados contratuais**:
   - Dados da empresa (razão social, CNPJ, endereço)
   - Valores acordados
   - Forma de pagamento
   - Prazos e cronograma
   - Escopo da certificação
   - Responsabilidades de ambas partes

3. **Revisar termos legais**:
   - Conformidade com legislação local
   - Cláusulas de confidencialidade
   - Termos de rescisão

4. **Preparar para assinatura digital**:
   - Integração com e-signature provider:
     - D4Sign (preferencial)
     - ClickSign (alternativa)
     - DocuSign (alternativa)
   - Configurar ordem de assinatura:
     1. Certificadora assina primeiro
     2. Empresa assina depois

5. **Enviar para assinatura**:
   - Sistema envia email com link
   - Notifica empresa

#### Referência Técnica:
- Schema: `Contract` model + `Signature` model
- Backend: [contract.service.ts](../../backend/src/services/contract/contract.service.ts)
- Backend: [e-signature/](../../backend/src/services/e-signature/)

---

### **Fase 7: Assinatura do Contrato**
**Código**: `assinatura_contrato`
**Responsável**: ⚖️ **Jurídico** + 👤 **Empresa**
**Status Process**: `aguardando_assinatura`
**Prazo Médio**: 3-5 dias úteis

#### Ações do Jurídico:
1. **Iniciar fluxo de e-signature**:
   - Assinar primeiro pelo lado da certificadora
   - Enviar para empresa

2. **Monitorar status de assinatura**:
   - Pendente / Visualizado / Assinado
   - Enviar lembretes automáticos (3 dias, 7 dias)

#### Ações da Empresa:
1. **Receber email com link para assinatura**:
   - Link válido por 30 dias
   - Acesso via token único

2. **Revisar contrato completo**:
   - Visualizar PDF do contrato
   - Verificar dados e valores
   - Esclarecer dúvidas (se houver)

3. **Assinar digitalmente**:
   - Via plataforma de e-signature
   - Assinatura válida com certificado digital

#### Transição Automática:
- Quando ambas partes assinaram → Avança para Fase 8

#### Validações:
- Contrato deve ter status `assinado`
- Ambas assinaturas registradas (Signature records)

#### Referência Técnica:
- Schema: `ContractStatus.assinado`
- Backend: [e-signature providers](../../backend/src/services/e-signature/)

---

## Fluxo Operacional (Todas Certificações) - Fases 8 a 17

### **Fase 8: Avaliação Documental Detalhada**
**Código**: `avaliacao_documental`
**Responsável**: 👨‍💼 **Analista**
**Status Process**: `analise_documental`
**Prazo Médio**: 7-10 dias úteis

#### Ações do Analista:
1. **Revisar toda documentação em profundidade**:
   - Procedimentos Operacionais Padrão (POPs)
   - Boas Práticas de Fabricação (BPF)
   - Registros de controle de qualidade
   - Fluxogramas de processo completos

2. **Verificar conformidade com requisitos**:
   - GSO 2055-2 / SMIIC 02
   - PR 7.1 requisitos específicos por categoria (C1-C6)
   - Requisitos de rastreabilidade

3. **Validar certificados Halal de fornecedores**:
   - Verificar autenticidade
   - Validar validade
   - Confirmar escopo (ingredientes específicos)

4. **Analisar procedimentos de produção**:
   - Controle de contaminação cruzada
   - Segregação de linhas (se compartilhada)
   - Higienização entre lotes
   - Uso de álcool em processos

5. **Identificar riscos potenciais**:
   - Ingredientes críticos (E-numbers)
   - Processos de risco (fermentação, etc.)
   - Fornecedores sem certificação

6. **Preparar relatório de pré-auditoria**:
   - Resumo de conformidades
   - Pontos de atenção identificados
   - Recomendações para auditoria

7. **Solicitar documentos adicionais** (se necessário):
   - Via DocumentRequest
   - Especificações técnicas de ingredientes
   - Procedimentos faltantes

8. **Aprovar passagem para planejamento**:
   - Quando documentação completa e conforme

#### Critérios de Aprovação:
- Todos documentos críticos validados
- Certificados de fornecedores válidos (origem animal)
- Procedimentos adequados documentados
- Sem gaps documentais críticos

#### Referência Técnica:
- PR 7.1 Seção 10.6 - Avaliação Documental
- Frontend: [DocumentAnalysis.tsx](../../frontend/src/pages/analyst/DocumentAnalysis.tsx)

---

### **Fase 9: Planejamento da Auditoria**
**Código**: `planejamento_auditoria`
**Responsável**: 🎯 **Gestor de Auditoria**
**Status Process**: `aguardando_auditoria`
**Prazo Médio**: 5-7 dias úteis

#### Ações do Gestor de Auditoria:
1. **Definir escopo da auditoria**:
   - Tipo de certificação (C1-C6)
   - Produtos incluídos
   - Áreas a serem inspecionadas
   - Processos críticos

2. **Calcular duração da auditoria**:
   - Man-hours já calculados na proposta
   - Ajustar conforme complexidade real
   - Considerar distância/logística

3. **Selecionar equipe de auditores**:
   - Auditor Líder qualificado
   - Auditores adicionais (se necessário)
   - Especialistas técnicos (se necessário)
   - Verificar qualificações e disponibilidade

4. **Agendar data e horário com empresa**:
   - Propor 3 opções de datas
   - Confirmar disponibilidade de pessoas-chave
   - Considerar sazonalidade de produção

5. **Preparar checklist específico da auditoria**:
   - Baseado em PR 7.1 requisitos
   - Adaptado para categoria GSO 2055-2
   - Incluir pontos de atenção da pré-auditoria

6. **Enviar notificação para empresa**:
   - Email com confirmação de auditoria
   - Data, horário e duração estimada
   - Nome(s) e contato(s) do(s) auditor(es)
   - Endereço confirmado
   - **O que preparar**:
     - Documentos a serem disponibilizados
     - Pessoas-chave que devem estar presentes
     - Áreas que serão inspecionadas
     - Equipamentos de proteção (se necessário)
   - Link para adicionar ao calendário (Google/Outlook)

7. **Criar registro de auditoria no sistema**:
   - Audit record com tipo `estagio1` ou `estagio2`
   - Atribuir auditor(es)
   - Status: `agendado`

#### Transição Automática:
- Quando auditoria agendada (Audit.status = `agendado`) → Avança para Fase 10

#### Referência Técnica:
- PR 7.1 Seção 10.7 - Planejamento de Auditoria
- Schema: `Audit` model + `AuditTeamMember` model
- Backend: [audit-schedule.service.ts](../../backend/src/modules/audit-schedule/audit-schedule.service.ts)

---

### **Fase 10: Auditoria Estágio 1** (Documental)
**Código**: `auditoria_estagio1`
**Responsável**: 🔍 **Auditor**
**Status Process**: `em_auditoria`
**Prazo Médio**: 1-2 dias

#### Ações do Auditor:
1. **Realizar auditoria documental** (pode ser remota):
   - Revisar POPs e BPF em detalhe
   - Verificar registros de controle de qualidade
   - Analisar rastreabilidade de ingredientes
   - Verificar programa de treinamento de funcionários

2. **Revisar licenças e certificados**:
   - Licença de Funcionamento (validade)
   - Certificados Halal de fornecedores
   - Outras certificações (ISO, FSSC, etc.)

3. **Avaliar sistema de gestão Halal**:
   - Política Halal documentada
   - Responsável Halal designado
   - Procedimentos de auditoria interna
   - Tratamento de não-conformidades

4. **Verificar documentação de ingredientes**:
   - Especificações técnicas completas
   - Declarações de origem
   - Certificados Halal (origem animal)
   - Análise de aditivos (E-numbers)

5. **Identificar gaps documentais**:
   - Procedimentos faltantes
   - Registros incompletos
   - Certificações ausentes

6. **Registrar observações no sistema**:
   - Conformidades encontradas
   - Não-conformidades potenciais
   - Pontos de melhoria

7. **Gerar relatório preliminar de Estágio 1**:
   - Resumo executivo
   - Conformidades e não-conformidades
   - Recomendações

8. **Determinar se empresa está pronta para Estágio 2**:
   - Se gaps críticos: solicitar correções antes de Estágio 2
   - Se conforme: aprovar para Estágio 2

9. **Marcar auditoria como concluída**:
   - Audit.status = `concluido`
   - Upload de relatório (PDF)

#### Transição Automática:
- Quando Audit (Estágio 1) concluída → Avança para Fase 11

#### Referência Técnica:
- PR 7.1 Seção 10.7.5 - Auditoria Estágio 1
- Frontend: [AuditExecution.tsx](../../frontend/src/components/audits/AuditExecution.tsx)
- Backend: [audit-execution.service.ts](../../backend/src/modules/audit-execution/audit-execution.service.ts)

---

### **Fase 11: Auditoria Estágio 2** (On-site)
**Código**: `auditoria_estagio2`
**Responsável**: 🔍 **Auditor**
**Status Process**: `em_auditoria`
**Prazo Médio**: 1-3 dias (presencial)

#### Ações do Auditor:
1. **Realizar auditoria presencial na planta**:
   - Chegar no horário agendado
   - Reunião de abertura com gestão
   - Apresentar escopo e cronograma

2. **Inspecionar áreas de produção**:
   - Layout físico vs. fluxograma
   - Segregação de áreas (Halal / Não-Halal, se aplicável)
   - Condições de higiene
   - Controle de contaminação cruzada
   - Equipamentos e utensílios

3. **Verificar áreas de armazenamento**:
   - Matérias-primas (organização, identificação, FIFO)
   - Produtos acabados (segregação, rastreabilidade)
   - Controle de temperatura (refrigerados/congelados)

4. **Entrevistar funcionários**:
   - Conhecimento de requisitos Halal
   - Treinamentos recebidos
   - Procedimentos de higienização
   - Controle de ingredientes

5. **Verificar implementação prática de procedimentos**:
   - Higienização entre lotes
   - Rastreabilidade de ingredientes
   - Controle de pragas
   - Registros de produção

6. **Testar rastreabilidade**:
   - Forward tracing (matéria-prima → produto final)
   - Backward tracing (produto final → matéria-prima)
   - Verificar registros em tempo real

7. **Verificar controle de contaminação cruzada**:
   - Procedimentos de limpeza
   - Validação de limpeza (swab tests, se aplicável)
   - Segregação de utensílios

8. **Fotografar evidências**:
   - Áreas inspecionadas
   - Não-conformidades (se houver)
   - Boas práticas observadas
   - Upload no sistema

9. **Preencher checklist detalhado**:
   - Checklist específico por categoria GSO 2055-2
   - Baseado em PR 7.1 requisitos
   - Marcar: Conforme / Não-Conforme / Não Aplicável

10. **Identificar não-conformidades (NCs)**:
    - Durante toda inspeção
    - Registrar com fotos
    - Classificar severidade (Maior / Menor)

11. **Realizar reunião de encerramento**:
    - Apresentar achados preliminares
    - Listar NCs identificadas
    - Explicar próximos passos
    - Esclarecer dúvidas

12. **Gerar relatório final de auditoria**:
    - Resumo executivo
    - Conformidades e NCs
    - Fotos de evidências
    - Recomendações
    - Upload no sistema

#### Critérios de Avaliação:
- Todas áreas do checklist inspecionadas
- NCs documentadas com evidências
- Relatório completo e assinado

#### Transição Automática:
- Quando Audit (Estágio 2) concluída → Avança para Fase 12

#### Referência Técnica:
- PR 7.1 Seção 10.7.6 - Auditoria Estágio 2
- Schema: `Audit` + `AuditFinding` models

---

### **Fase 12: Análise de Não-Conformidades**
**Código**: `analise_nao_conformidades`
**Responsável**: 🔍 **Auditor**
**Status Process**: `em_auditoria`
**Prazo Médio**: 2-3 dias úteis

#### Ações do Auditor:
1. **Classificar NCs identificadas**:
   - 🔴 **Não-Conformidade Maior** (crítica):
     - Viola requisitos essenciais do PR 7.1
     - Compromete integridade Halal do produto
     - Bloqueia emissão de certificado
     - Exemplos:
       - Contaminação cruzada não controlada
       - Uso de ingredientes proibidos
       - Ausência de certificado Halal de fornecedor crítico
       - Falta de rastreabilidade

   - 🟡 **Não-Conformidade Menor** (não-crítica):
     - Desvio menor de requisitos
     - Não compromete produto final
     - Não bloqueia certificação
     - Deve ser tratada, mas pode ser após emissão
     - Exemplos:
       - Registros incompletos
       - Procedimento não totalmente implementado
       - Treinamento de funcionário faltante

2. **Documentar cada NC** com:
   - **Código único**: NC-YYYY-PROCESS-NNN (ex: NC-2026-000123-001)
   - **Título**: Descrição curta (ex: "Ausência de certificado Halal - Lecitina")
   - **Classificação**: Maior 🔴 ou Menor 🟡
   - **Descrição detalhada**:
     - O que foi observado
     - Por que é não-conforme
     - Impacto potencial
   - **Seção do PR 7.1 violada**: (ex: PR 7.1 10.7.7.2)
   - **Fotos de evidência**: Upload de fotos tiradas durante auditoria
   - **Prazo para tratamento**:
     - NCs Maiores: **30 dias**
     - NCs Menores: **60 dias**
   - **Ações corretivas sugeridas**: Orientações para empresa

3. **Revisar e validar todas NCs**:
   - Garantir classificação correta (Maior vs. Menor)
   - Verificar se descrição está clara
   - Confirmar evidências fotográficas

4. **Enviar NCs para empresa via sistema**:
   - Sistema cria registros de NonConformity
   - Status inicial: `pendente`

5. **Notificar empresa por email**:
   - Email automático com lista de NCs
   - Destaque para NCs Maiores (críticas)
   - Explicação de prazos e próximos passos
   - Link direto para visualizar NCs no sistema

6. **Aguardar submissão de evidências de correção**:
   - Empresa tem prazo para submeter
   - Sistema envia lembretes automáticos

#### Estrutura de NC no Sistema:
```typescript
{
  code: "NC-2026-000123-001",
  title: "Ausência de certificado Halal - Lecitina",
  classification: "maior",
  description: "A empresa utiliza lecitina de soja...",
  prSection: "PR 7.1 10.7.7.2",
  photos: ["nc-001-foto1.jpg", "nc-001-foto2.jpg"],
  deadline: "2026-02-13", // 30 dias
  status: "pendente",
  auditorId: "auditor-uuid"
}
```

#### Referência Técnica:
- PR 7.1 Seção 10.7.7 - Análise de Não-Conformidades
- Schema: `NonConformity` model (se existir) ou `AuditFinding` model

---

### **Fase 13: Correção de Não-Conformidades**
**Código**: `correcao_nao_conformidades`
**Responsável**: 👤 **Empresa**
**Status Process**: `aguardando_documentos`
**Prazo Médio**: 30-60 dias (depende da NC)

#### Ações da Empresa:
1. **Revisar todas NCs identificadas**:
   - Acessar lista no sistema
   - Entender cada NC e sua classificação
   - Verificar fotos de evidências
   - Esclarecer dúvidas com auditor (via chat)

2. **Priorizar tratamento**:
   - NCs Maiores primeiro (críticas, bloqueiam certificação)
   - NCs Menores depois

3. **Implementar ações corretivas** para cada NC:
   - Identificar causa raiz
   - Implementar correção
   - Documentar ação corretiva
   - Exemplos:
     - Obter certificado Halal faltante de fornecedor
     - Implementar procedimento de limpeza
     - Treinar funcionários
     - Corrigir segregação de áreas
     - Atualizar registros

4. **Fazer upload de evidências de correção**:
   - **Fotos antes/depois**:
     - Mostrar situação anterior
     - Mostrar situação corrigida
   - **Documentos atualizados**:
     - Procedimentos revisados
     - Registros de treinamento
     - Certificados obtidos
     - Notas fiscais de melhorias
   - **Descrição textual das ações**:
     - O que foi feito
     - Quando foi implementado
     - Quem executou
     - Como será mantido

5. **Escrever descrição das ações corretivas**:
   - Campo de texto livre
   - Explicar detalhadamente a correção
   - Incluir cronograma (se aplicável)

6. **Marcar cada NC como "Pronto para Revisão"**:
   - Botão no sistema
   - Só habilita se pelo menos 1 evidência foi enviada
   - Sistema muda status: `pendente` → `em_revisao`

7. **Comunicar com auditor via chat** (se necessário):
   - Thread de mensagens por NC
   - Esclarecer dúvidas sobre evidências
   - Solicitar orientação

#### Validações do Sistema:
- Pelo menos 1 evidência por NC Maior (obrigatório)
- Descrição de ação corretiva preenchida
- Status pode ser alterado para "Pronto para Revisão"

#### Notificações:
- Lembrete 7 dias antes do prazo
- Lembrete 3 dias antes (URGENTE)
- Alerta no dia do vencimento (CRÍTICO)

#### Referência Técnica:
- Frontend: [NonConformityTreatment.tsx](../../frontend/src/components/company/NonConformityTreatment.tsx) (hipotético)
- Backend: [non-conformity.service.ts](../../backend/src/modules/non-conformity/non-conformity.service.ts) (hipotético)

---

### **Fase 14: Validação de Correções**
**Código**: `validacao_correcoes`
**Responsável**: 🔍 **Auditor**
**Status Process**: `analise_tecnica`
**Prazo Médio**: 5-7 dias úteis

#### Ações do Auditor:
1. **Receber notificação** quando empresa marca NC como "Pronto para Revisão"

2. **Revisar evidências submetidas**:
   - Analisar fotos antes/depois
   - Verificar documentos atualizados
   - Ler descrição de ações corretivas
   - Avaliar se correção é adequada

3. **Verificar efetividade da correção**:
   - Correção atende requisito do PR 7.1?
   - Correção é sustentável (não temporária)?
   - Evidências são suficientes?

4. **Para cada NC, decidir**:
   - ✅ **Aprovar** (NC resolvida):
     - Correção adequada
     - Evidências suficientes
     - Status: `em_revisao` → `resolvida`

   - ❌ **Rejeitar** (evidência insuficiente):
     - Correção inadequada ou parcial
     - Evidências insuficientes (ex: foto não clara)
     - Falta documentação comprobatória
     - Status: `em_revisao` → `rejeitada`
     - **Obrigatório**: Adicionar comentário explicando motivo
     - Empresa deve resubmeter

5. **Solicitar informações adicionais** (se necessário):
   - Via chat no sistema
   - Exemplos:
     - "Por favor, envie foto mais clara da área Y"
     - "Falta certificado Halal do fornecedor X"
     - "Procedimento ainda não está completo, incluir seção Z"

6. **Decidir se é necessária re-auditoria presencial**:
   - NCs Maiores graves podem exigir re-auditoria
   - Verificar implementação in loco
   - Configurável por certificadora

7. **Agendar re-auditoria** (se necessário):
   - Apenas verificação de NCs tratadas
   - Duração menor (4-8 horas)
   - Foco em áreas específicas

8. **Marcar auditoria como concluída** quando:
   - Todas NCs Maiores resolvidas ✅
   - NCs Menores resolvidas ou aceitas para tratamento posterior
   - Audit.status = `concluido`

9. **Gerar relatório final consolidado**:
   - Resumo de NCs identificadas
   - Status de tratamento de cada NC
   - Fotos de correções
   - Recomendação final:
     - ✅ **Aprovar** para Comitê (se todas NCs Maiores resolvidas)
     - ❌ **Reprovar** (se NCs Maiores não resolvidas e prazo expirou)

10. **Encaminhar para Comitê Técnico**:
    - Upload de relatório final
    - Documentação completa
    - Recomendação do auditor

#### Transição Automática:
- Quando todas NCs Maiores resolvidas E relatório final enviado → Avança para Fase 15

#### Regras de Negócio:
- Apenas auditor que identificou NC pode aprovar tratamento
- NCs Maiores DEVEM estar resolvidas antes de Comitê
- NCs Menores podem ser aceitas para tratamento pós-certificação

#### Referência Técnica:
- PR 7.1 Seção 10.7.7 - Validação de Correções
- Frontend: [NonConformityValidation.tsx](../../frontend/src/components/auditor/NonConformityValidation.tsx) (hipotético)

---

### **Fase 15: Comitê Técnico**
**Código**: `comite_tecnico`
**Responsável**: 👔 **Supervisor** + 🎯 **Gestor** + Membros do Comitê
**Status Process**: `em_andamento`
**Prazo Médio**: 7-10 dias úteis

#### Ações do Comitê Técnico:
1. **Revisar documentação completa**:
   - Solicitação original
   - Relatório de pré-auditoria (Fase 8)
   - Relatório de Auditoria Estágio 1
   - Relatório de Auditoria Estágio 2
   - Relatório consolidado final
   - NCs identificadas e tratamento
   - Evidências de correção

2. **Analisar histórico de NCs**:
   - Quantidade de NCs (Maiores e Menores)
   - Classificação e gravidade
   - Qualidade do tratamento
   - Tempo de resposta da empresa

3. **Avaliar risco global da operação**:
   - Complexidade dos processos
   - Controle de ingredientes críticos
   - Competência da equipe da empresa
   - Sistema de gestão Halal
   - Conformidade com PR 7.1

4. **Revisar recomendação do auditor**:
   - Considerações do auditor líder
   - Pontos de atenção
   - Ressalvas (se houver)

5. **Deliberar sobre certificação**:
   - Reunião do comitê (presencial ou remota)
   - Discussão de casos críticos
   - Votação (se necessário)

6. **Tomar decisão**:
   - ✅ **Aprovar** - Emitir certificado:
     - Todas NCs Maiores resolvidas
     - Empresa demonstra competência
     - Processos adequadamente controlados
     - Decisão: `aprovar`

   - ❌ **Reprovar** - Rejeitar certificação:
     - NCs críticas não resolvidas
     - Empresa não demonstra controle adequado
     - Riscos significativos identificados
     - Decisão: `reprovar`
     - **Obrigatório**: Justificativa detalhada

   - ⚠️ **Solicitar informações adicionais**:
     - Esclarecimentos necessários
     - Documentação complementar
     - Re-auditoria de área específica
     - Decisão: `solicitar_info`
     - Processo volta para fase apropriada

7. **Definir condições** (se aplicável):
   - Auditorias de vigilância mais frequentes
   - Restrições de escopo
   - Requisitos adicionais

8. **Registrar decisão formal**:
   - CommitteeDecision record no sistema
   - Data da reunião
   - Membros presentes
   - Decisão tomada
   - Justificativa
   - Condições (se houver)

9. **Notificar empresa sobre resultado**:
   - Email formal com decisão
   - Se aprovado: Parabéns + próximos passos
   - Se reprovado: Justificativa + opções de recurso
   - Se solicitado mais info: O que é necessário

10. **Encaminhar para próxima fase**:
    - Se aprovado → Fase 16 (Emissão de Certificado)
    - Se reprovado → Processo encerrado (status: `reprovado`)
    - Se mais info → Volta para fase apropriada

#### Composição do Comitê:
- Supervisor Técnico (obrigatório)
- Gestor de Auditoria (obrigatório)
- Representante Jurídico (opcional)
- Especialista técnico externo (opcional, casos complexos)
- Auditor Líder pode participar como observador

#### Critérios de Aprovação:
- Todas NCs Maiores resolvidas
- Empresa demonstra competência
- Sistema de gestão Halal implementado
- Rastreabilidade efetiva
- Controle de ingredientes críticos

#### Transição Automática:
- Quando decisão = `aprovar` → Avança para Fase 16

#### Referência Técnica:
- PR 7.1 Seção 10.9 - Comitê Técnico
- Schema: `CommitteeDecision` model

---

### **Fase 16: Emissão de Certificado**
**Código**: `emissao_certificado`
**Responsável**: 🎫 **Controlador**
**Status Process**: `certificado`
**Prazo Médio**: 2-3 dias úteis

#### Ações do Controlador:
1. **Gerar número único de certificado**:
   - Formato: `HC-[País]-[Ano]-[Sequencial]`
   - Exemplo: `HC-BR-2026-001234`
   - Sequencial incremental por país e ano

2. **Criar PDF do certificado** com design profissional:
   - **Cabeçalho**:
     - Logo da certificadora
     - Título: "Certificado Halal"
     - Número do certificado (destaque)

   - **Dados da Empresa**:
     - Razão Social
     - CNPJ/NIT/RUT
     - Endereço completo da planta certificada

   - **Escopo da Certificação**:
     - Tipo de certificação (C1-C6)
     - Descrição do escopo
     - Categoria GSO 2055-2

   - **Lista de Produtos Certificados**:
     - Nome de cada produto
     - Código/SKU (se aplicável)
     - Categoria

   - **Classificação Industrial**:
     - Grupo → Categoria → Subcategoria (GSO 2055-2)

   - **Validade**:
     - Data de emissão
     - Data de expiração (3 anos)
     - "Válido de DD/MM/AAAA até DD/MM/AAAA"

   - **QR Code**:
     - Link para página pública de validação
     - URL: `https://halalsphere.com/verify/HC-BR-2026-001234`

   - **Observações**:
     - Auditorias de vigilância: Anuais
     - Qualquer alteração deve ser comunicada
     - Condições especiais (se houver)

   - **Assinaturas Digitais**:
     - Supervisor Técnico
     - Diretor Técnico
     - Certificado digital (hash SHA-256)

   - **Rodapé**:
     - "Este certificado é propriedade de [Certificadora]"
     - Contatos da certificadora
     - Número de acreditação (se aplicável)

3. **Registrar certificado no banco de dados**:
   - Certificate record:
     - certificateNumber: "HC-BR-2026-001234"
     - processId: UUID do processo
     - companyId: UUID da empresa
     - issuedAt: Data de emissão
     - expiresAt: Data de expiração (+3 anos)
     - status: `ativo`
     - scope: Escopo detalhado (JSON)
     - products: Lista de produtos (JSON)
     - qrCode: URL do QR Code
     - pdfUrl: URL do PDF no S3

4. **Criar página pública de validação**:
   - URL: `/verify/[certificateNumber]`
   - Exibe:
     - Status: ✅ Ativo / ❌ Expirado / ⚠️ Suspenso
     - Dados da empresa
     - Escopo e produtos
     - Validade
     - Data de última auditoria de vigilância
   - Não exibe informações sensíveis
   - Público e indexável (SEO)

5. **Upload de PDF para S3**:
   - Pasta: `certificates/YYYY/`
   - Nome: `HC-BR-2026-001234.pdf`
   - Permissões: Leitura apenas para empresa e equipe interna

6. **Enviar certificado para empresa**:
   - Email automático com assunto: "🎉 Parabéns! Seu Certificado Halal foi Emitido"
   - Conteúdo:
     - Mensagem de congratulações
     - Número do certificado (destaque)
     - Validade (3 anos)
     - Botão "Baixar Certificado (PDF)" (link direto)
     - Link para validação pública (QR Code)
     - **Próximos passos**:
       - Auditorias de vigilância anuais
       - Comunicar qualquer alteração (produtos, processos, endereço)
       - Renovação antes de expirar (6 meses antes)
     - **Como usar o certificado**:
       - Selo Halal em produtos e embalagens
       - Marketing e comunicação
       - Exportação para mercados muçulmanos
     - Contato de suporte

7. **Enviar SMS** (se configurado):
   - "HalalSphere: Parabéns! Seu certificado Halal foi emitido. Baixe: [link]"

8. **Programar auditorias de vigilância**:
   - Criar lembrete no sistema
   - Primeira auditoria: 12 meses após emissão
   - Auditorias subsequentes: Anuais
   - Sistema notifica gestor de auditoria automaticamente

9. **Notificar equipe interna**:
   - Comercial: Cliente certificado (para upsell, renovação)
   - Gestor de Auditoria: Programar vigilância
   - Supervisor: Para registro e controle

#### Validações:
- Decisão do Comitê = `aprovar`
- Número de certificado único
- PDF gerado sem erros
- QR Code acessível publicamente

#### Transição Automática:
- Quando certificado emitido (Certificate record criado) → Avança para Fase 17

#### Referência Técnica:
- Schema: `Certificate` model
- Backend: [pdf.service.ts](../../backend/src/services/pdf.service.ts)
- Backend: [certificate.service.ts](../../backend/src/modules/certificate/certificate.service.ts) (hipotético)

---

### **Fase 17: Certificado Emitido** ✅
**Código**: `certificado_emitido`
**Responsável**: 🤖 **Sistema** (fase final)
**Status Process**: `certificado`
**Prazo**: Imediato

#### Estado Final do Processo:
1. **Processo marcado como concluído**:
   - Process.status = `certificado`
   - Process.currentPhase = `certificado_emitido`
   - Request.status = `aprovado`
   - Não pode mais retroceder fases

2. **Certificado ativo e disponível**:
   - Certificate.status = `ativo`
   - PDF disponível para download
   - QR Code público ativo para validação
   - Link: `https://halalsphere.com/verify/[certificateNumber]`

3. **Empresa tem acesso completo**:
   - **Baixar certificado em PDF**:
     - Botão no dashboard
     - Quantas vezes quiser
     - Versão para impressão e digital

   - **Compartilhar QR Code**:
     - Em site da empresa
     - Em materiais de marketing
     - Em embalagens de produtos
     - Clientes podem validar autenticidade

   - **Usar selo Halal**:
     - Em produtos certificados
     - Em marketing e comunicação
     - Em feiras e eventos
     - Em exportações

   - **Acessar histórico completo**:
     - Todo processo de certificação
     - Auditorias realizadas
     - NCs e tratamento
     - Documentos enviados
     - Comunicações com equipe

4. **Sistema agenda notificações futuras**:
   - **Auditorias de vigilância**:
     - Primeira: 12 meses após emissão
     - Subsequentes: Anuais
     - Notificações: 60 dias antes, 30 dias antes, 7 dias antes

   - **Renovação de certificado**:
     - Certificado válido por 3 anos
     - Notificações: 6 meses antes, 3 meses antes, 1 mês antes
     - Processo de renovação simplificado (pula fluxo comercial)

   - **Lembretes de comunicação**:
     - "Lembrar de comunicar alterações de produtos/processos"
     - Trimestral

5. **Métricas e análises**:
   - Tempo total do processo (cadastro até certificado)
   - Número de NCs (para benchmarking futuro)
   - Satisfação da empresa (NPS)
   - Eficiência do processo

#### Ações Disponíveis para Empresa:
- ✅ Baixar certificado (PDF)
- ✅ Visualizar QR Code público
- ✅ Acessar histórico completo
- ✅ Solicitar segunda via do certificado
- ✅ Solicitar expansão de escopo (adicionar produtos)
- ✅ Comunicar alterações
- ✅ Agendar auditoria de vigilância

#### Ações Disponíveis para Certificadora:
- Monitorar validade do certificado
- Agendar auditorias de vigilância
- Suspender/Cancelar certificado (se necessário)
- Gerar relatórios de certificados ativos
- Enviar comunicados (recalls, updates de requisitos)

#### Possíveis Status Futuros do Certificado:
- ✅ **Ativo**: Válido e em uso
- ⚠️ **Suspenso**: Temporariamente suspenso (NC grave em vigilância)
- ❌ **Cancelado**: Cancelado pela empresa ou certificadora
- ⏱️ **Expirado**: Validade expirou (3 anos)

#### Referência Técnica:
- Schema: `Certificate.status = ativo`
- Frontend: [CompanyDashboard.tsx](../../frontend/src/pages/company/CompanyDashboard.tsx)
- Certificate validation: `/frontend/src/pages/public/CertificateValidation.tsx` (hipotético)

---

## 📊 Resumo por Responsável

| Responsável | Fases Atribuídas | Total de Fases | Descrição |
|-------------|------------------|----------------|-----------|
| 👤 **Empresa** | 1, 5, 13 | **3 fases** | Cadastro inicial, aceite de proposta, correção de NCs |
| 👨‍💼 **Analista** | 2, 8 | **2 fases** | Análise documental inicial e detalhada |
| 💼 **Comercial** | 3, 4 | **2 fases** | Elaboração e negociação de proposta |
| ⚖️ **Jurídico** | 6, 7 | **2 fases** | Elaboração e assinatura de contrato |
| 🎯 **Gestor de Auditoria** | 9 | **1 fase** | Planejamento e agendamento de auditorias |
| 🔍 **Auditor** | 10, 11, 12, 14 | **4 fases** | Auditorias Estágio 1 e 2, análise de NCs, validação de correções |
| 👔 **Supervisor + Gestor** | 15 | **1 fase** | Deliberação do Comitê Técnico |
| 🎫 **Controlador** | 16 | **1 fase** | Emissão do certificado |
| 🤖 **Sistema** | 17 | **1 fase** | Estado final (certificado emitido) |

### Distribuição de Carga de Trabalho:
- **Auditoria** (Auditor): 4 fases (23.5% do processo)
- **Análise** (Analista): 2 fases (11.8% do processo)
- **Comercial/Jurídico**: 4 fases combinadas (23.5% do processo)
- **Empresa**: 3 fases (17.6% do processo, mas fases mais longas)
- **Gestão**: 3 fases (17.6% do processo)

---

## ⏱️ Prazos Médios por Fase

| Fase | Código | Prazo Estimado | Acumulado | Observações |
|------|--------|----------------|-----------|-------------|
| 1 | `cadastro_solicitacao` | ~20 min | 0 dias | Tempo para preencher wizard (9 etapas) |
| 2 | `analise_documental_inicial` | 3-5 dias | 5 dias | Revisão documental inicial pelo analista |
| 3 | `elaboracao_proposta` | 2-3 dias | 8 dias | Cálculo de custos e man-hours |
| 4 | `negociacao_proposta` | 5-7 dias | 15 dias | Negociação comercial (depende da empresa) |
| 5 | `proposta_aprovada` | Imediato | 15 dias | Aceite da empresa (ação única) |
| 6 | `elaboracao_contrato` | 2-3 dias | 18 dias | Elaboração do contrato pelo jurídico |
| 7 | `assinatura_contrato` | 3-5 dias | 23 dias | Assinatura digital de ambas partes |
| 8 | `avaliacao_documental` | 7-10 dias | 33 dias | Avaliação documental detalhada |
| 9 | `planejamento_auditoria` | 5-7 dias | 40 dias | Planejamento e agendamento de auditoria |
| 10 | `auditoria_estagio1` | 1-2 dias | 42 dias | Auditoria documental (remota possível) |
| 11 | `auditoria_estagio2` | 1-3 dias | 45 dias | Auditoria presencial on-site |
| 12 | `analise_nao_conformidades` | 2-3 dias | 48 dias | Análise e documentação de NCs |
| 13 | `correcao_nao_conformidades` | 30-60 dias | 78-108 dias | **Fase mais longa** - Empresa corrige NCs |
| 14 | `validacao_correcoes` | 5-7 dias | 85-115 dias | Auditor valida correções |
| 15 | `comite_tecnico` | 7-10 dias | 95-125 dias | Deliberação do comitê |
| 16 | `emissao_certificado` | 2-3 dias | 98-128 dias | Emissão do certificado |
| 17 | `certificado_emitido` | Imediato | **~2-3 meses** | ✅ Processo concluído |

### Comparativo de Tempo:
- **Sem automação**: 7-8 meses (210-240 dias)
- **Com HalalSphere**: 2-3 meses (60-90 dias)
- **Redução**: **~60-70%** do tempo total

### Fatores que Influenciam Prazo:
1. **Responsividade da empresa**: Fase 13 (correção de NCs) é gargalo
2. **Complexidade da operação**: Mais produtos = mais tempo de auditoria
3. **Qualidade documental inicial**: Documentação completa acelera Fase 2
4. **Classificação industrial**: Categorias críticas (C3, C6) exigem mais validações
5. **Origem de produtos**: Animal exige certificados Halal de fornecedores

---

## 🔄 Transições Automáticas

Algumas fases avançam automaticamente quando condições são atendidas:

### Transições Implementadas (`process-transition.service.ts`):

| Trigger | Fase Atual | Próxima Fase | Método |
|---------|------------|--------------|--------|
| Documentos aprovados | 2 ou 8 | Próxima | `onDocumentsApproved()` |
| Proposta enviada | 3 ou 4 | 5 | `onProposalSent()` |
| Contrato assinado | 6 ou 7 | 8 | `onContractSigned()` |
| Auditoria agendada | 9 | 10 | `onAuditScheduled()` |
| Auditoria concluída | 10, 11 ou 14 | Próxima | `onAuditCompleted()` |
| Comitê aprovou | 15 | 16 | `onCommitteeApproved()` |

### Validações Automáticas por Fase:

#### Fase 1 → 2 (Cadastro → Análise):
- ✅ Classificação industrial completa (3 níveis)
- ✅ Pelo menos 1 produto cadastrado
- ✅ Todos documentos obrigatórios enviados
- ✅ Termos aceitos
- ✅ Analista atribuído

#### Fase 2 → 3 (Análise → Proposta):
- ✅ Todos documentos obrigatórios aprovados
- ✅ Sem documentos pendentes de validação

#### Fase 3 → 4 (Elaboração → Negociação):
- ✅ Proposta enviada (Contract.status = `enviado`)

#### Fase 4 → 5 (Negociação → Aprovada):
- ✅ Empresa aceitou proposta

#### Fase 6 → 7 (Elaboração → Assinatura):
- ✅ Contrato criado e enviado

#### Fase 7 → 8 (Assinatura → Avaliação):
- ✅ Contrato assinado por ambas partes (Contract.status = `assinado`)

#### Fase 9 → 10 (Planejamento → Estágio 1):
- ✅ Auditoria agendada (Audit.status = `agendado`)

#### Fase 10 → 11 (Estágio 1 → Estágio 2):
- ✅ Auditoria Estágio 1 concluída (Audit.status = `concluido`)

#### Fase 14 → 15 (Validação → Comitê):
- ✅ Todas NCs Maiores resolvidas
- ✅ Relatório final enviado

#### Fase 15 → 16 (Comitê → Emissão):
- ✅ Comitê aprovou (CommitteeDecision.decisionType = `aprovar`)

#### Fase 16 → 17 (Emissão → Emitido):
- ✅ Certificado criado (Certificate record existe)

---

## 🎯 Indicadores de Performance (KPIs)

### Por Fase:
- **Tempo médio** em cada fase
- **Taxa de aprovação** (% que avança sem retrabalho)
- **Gargalos** (fases com maior tempo)

### Geral do Processo:
- **Lead Time Total**: Fase 1 até Fase 17
- **Taxa de Conclusão**: % de processos que chegam ao certificado
- **Taxa de Cancelamento**: % de processos cancelados por fase
- **NPS (Net Promoter Score)**: Satisfação da empresa

### Eficiência Operacional:
- **Man-hours reais vs. estimados** (auditoria)
- **Retrabalho documental**: Documentos rejeitados / total
- **Qualidade de NCs**: NCs Maiores / Total NCs (quanto menor, melhor)

---

## 📚 Referências

### Documentação Técnica:
- [Process Types](../../backend/src/modules/process/process.types.ts)
- [Process Transition Service](../../backend/src/modules/process/process-transition.service.ts)
- [Prisma Schema - ProcessPhase enum](../../backend/prisma/schema.prisma#L102)
- [Frontend - New Request Wizard](../../frontend/src/pages/company/NewRequestWizard.tsx)

### Padrões e Normas:
- **PR 7.1 Rev 21**: Procedimento de Certificação Halal
- **GSO 2055-2**: Classificação Industrial para Alimentos Halal
- **SMIIC 02**: Sistema de Gestão Halal

### Documentação do Projeto:
- [PRD - Épico 1](../../docs/01-prd/05-user-stories/epic-01-requests.md)
- [Fluxos e Tipos de Solicitação](../../docs/PROCESS/FLUXOS-TIPOS-SOLICITACAO.md)
- [Processo de Certificação Completo](../../docs/PROCESS/PROCESSO-CERTIFICACAO-COMPLETO-FINAL.md)

---

**Última Atualização**: 13/01/2026
**Versão do Documento**: 1.0
**Autor**: Claude Code (baseado em análise do codebase)
