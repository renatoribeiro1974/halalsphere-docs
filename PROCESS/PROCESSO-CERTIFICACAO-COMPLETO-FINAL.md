# 📋 Processo de Certificação Halal - Documento Consolidado Final

**Data**: 08 de Dezembro de 2025
**Versão**: 6.0 - FINAL
**Status**: ✅ Documento Consolidado Completo

---

## 📑 Índice

1. [Visão Geral do Sistema](#visão-geral-do-sistema)
2. [Operação Internacional](#operação-internacional)
3. [Tipos de Solicitação](#tipos-de-solicitação)
4. [Wizard de Solicitação](#wizard-de-solicitação)
5. [Fluxo Completo de Certificação](#fluxo-completo-de-certificação)
6. [Departamentos e Responsabilidades](#departamentos-e-responsabilidades)
7. [Modelo de Dados](#modelo-de-dados)
8. [Próximos Passos de Implementação](#próximos-passos-de-implementação)

---

## 🎯 Visão Geral do Sistema

### **HalalSphere - Plataforma de Certificação Halal**

Sistema completo de gestão de certificação Halal com operação internacional, contemplando todo o ciclo desde a solicitação até a emissão e gestão de certificados.

**Escopo:**
- 🌍 Operação em 3 países (Brasil, Colômbia, Paraguai)
- 🔄 3 tipos de solicitação (Nova, Manutenção, Adequação)
- 📊 17 fases completas de processo
- 👥 10 papéis de usuário distintos
- ⏱️ Tempo médio: 90-120 dias (nova certificação)

---

## 🌍 Operação Internacional

### **Países de Operação:**

| País | Documento Empresa | Documento Pessoa Física | Moeda | Idioma |
|------|-------------------|-------------------------|-------|--------|
| 🇧🇷 **Brasil** | CNPJ (14 dígitos) | CPF (11 dígitos) | BRL (R$) | Português |
| 🇨🇴 **Colômbia** | NIT (9-10 dígitos) | CC (8-10 dígitos) | COP (COP$) | Español |
| 🇵🇾 **Paraguai** | RUC (9 dígitos) | CI (6-8 dígitos) | PYG (₲) | Español |

### **Validações por País:**

#### **Brasil:**
```typescript
CNPJ: 00.000.000/0000-00 (14 dígitos)
- Validação: Algoritmo de dígitos verificadores
- Exemplo: 12.345.678/0001-90

CPF: 000.000.000-00 (11 dígitos)
- Validação: Algoritmo de dígitos verificadores
- Exemplo: 123.456.789-09
```

#### **Colômbia:**
```typescript
NIT: 000.000.000-0 (9-10 dígitos + verificador)
- Validação: Módulo 11
- Exemplo: 900.123.456-7

CC (Cédula): 0.000.000.000 (8-10 dígitos)
- Validação: Apenas formato
- Exemplo: 1.234.567.890
```

#### **Paraguai:**
```typescript
RUC: 00000000-0 (8 dígitos + verificador)
- Validação: Módulo 11
- Exemplo: 80012345-6

CI (Cédula): 0.000.000 (6-8 dígitos)
- Validação: Apenas formato
- Exemplo: 1.234.567
```

### **Identificação Única Global:**

**Unicidade:** `(País + Documento Fiscal)`

Uma empresa pode ter:
- ✅ Mesmo CNPJ no Brasil E NIT na Colômbia (filiais diferentes)
- ❌ Mesmo CNPJ duas vezes no Brasil (duplicação bloqueada)

---

## 📋 Tipos de Solicitação

### **1️⃣ NOVA CERTIFICAÇÃO**

**Quando usar:**
- Documento fiscal NÃO cadastrado no sistema
- Empresa solicita certificação pela primeira vez
- Não possui contrato vigente neste país

**Características:**
- ✅ Passa pelo **Comercial** (proposta comercial)
- ✅ Passa pelo **Jurídico** (elaboração de contrato)
- ✅ Passa pelo **Financeiro** (pagamento)
- ✅ Passa pelo **Operacional** (análise + auditoria)
- ⏱️ Tempo: 90-120 dias

**Fluxo:**
```
Cadastro → Análise Inicial → Proposta Comercial →
Aceite → Contrato → Assinatura → Pagamento →
Avaliação Detalhada → Auditoria → Certificação
```

---

### **2️⃣ MANUTENÇÃO (Renovação/Vigilância)**

**Quando usar:**
- Documento fiscal JÁ cadastrado
- Certificado existente (ativo ou próximo ao vencimento)
- Auditoria periódica ou renovação

**Ciclo de 3 Anos:**
```
Ano 1: Certificação Inicial (Nova)
Ano 2: MANUTENÇÃO 1 (Auditoria de Vigilância)
Ano 3: MANUTENÇÃO 2 (Auditoria de Vigilância)
Ano 4: RENOVAÇÃO (Recertificação completa)
```

**Características:**
- ❌ **NÃO** passa pelo Comercial
- ❌ **NÃO** passa pelo Jurídico (usa contrato padrão de renovação)
- ✅ Vai direto para **Operacional**
- ✅ Wizard simplificado (apenas atualizações)
- ⏱️ Tempo: 30-60 dias

**Gatilho Automático:**
- Sistema monitora certificados
- 90 dias antes do vencimento: Email automático
- A cada 15 dias: Lembrete automático
- Empresa inicia solicitação de renovação

---

### **3️⃣ ADEQUAÇÃO (Alteração de Escopo)**

**Quando usar:**
- Documento fiscal JÁ cadastrado
- Certificado ATIVO
- Necessidade de alteração no escopo

**Casos de Uso:**
- Adicionar novos produtos
- Mudar fornecedores/ingredientes
- Alterar processo produtivo
- Mudar instalações
- Adicionar mercados de exportação

**Características:**
- ❌ **NÃO** passa pelo Comercial (pode ter taxa de adequação)
- ❌ **NÃO** passa pelo Jurídico (addendum ao contrato)
- ✅ Vai direto para **Operacional**
- ✅ Análise de impacto determina tipo de auditoria
- ⏱️ Tempo: 15-60 dias (conforme impacto)

**Análise de Impacto:**
```
BAIXO  → Aprovação Documental (sem auditoria)
MÉDIO  → Auditoria Parcial (áreas impactadas)
ALTO   → Auditoria Completa (reavaliação total)
```

---

## 🧙 Wizard de Solicitação (8 Etapas)

### **Ordem Atualizada:**

```
1. Dados da Empresa
   └─ País, documento fiscal, razão social, endereço, contato

2. Classificação Industrial (GSO 2055-2)
   └─ Grupo → Categoria → Subcategoria

3. Produção [MOVIDO PARA CIMA]
   └─ Capacidade, turnos, linhas, funcionários, distância, hospedagem

4. Tipo de Produto
   └─ Nome, categoria, descrição, número de produtos

5. Ingredientes e Fornecedores
   └─ Lista de ingredientes, fornecedores, origem animal/vegetal

6. Mercados (Países de Exportação) [NOVO]
   └─ Países destino, volume estimado, requisitos específicos

7. Documentação
   └─ Upload de documentos obrigatórios

8. Revisão e Submissão
   └─ Preview completo, aceite de termos, submissão
```

### **Detalhamento de Cada Etapa:**

#### **Etapa 1: Dados da Empresa**

**Campos Brasil (BR):**
- CNPJ (formatado automaticamente)
- Razão Social
- Nome Fantasia
- CEP → Busca automática de endereço
- Logradouro, Número, Complemento
- Bairro, Cidade, Estado
- Telefone, Email, Responsável

**Campos Colômbia (CO):**
- NIT (formatado automaticamente)
- Razón Social
- Nombre Comercial
- Código Postal
- Carrera/Calle, Número
- Barrio, Ciudad, Departamento
- Teléfono, Email, Responsable

**Campos Paraguai (PY):**
- RUC (formatado automaticamente)
- Razón Social
- Nombre Comercial
- Código Postal
- Avenida/Calle, Número
- Barrio, Ciudad, Departamento
- Teléfono, Email, Responsable

---

#### **Etapa 2: Classificação Industrial (GSO 2055-2)**

**Estrutura em Cascata:**

```
Grupo → Categoria → Subcategoria

GRUPO A: Alimentos de Origem Animal
├─ AI: Carnes e derivados
│  ├─ AI-01: Carne bovina
│  ├─ AI-02: Carne ovina
│  └─ AI-03: Aves
├─ AII: Laticínios
│  ├─ AII-01: Leite
│  ├─ AII-02: Queijos
│  └─ AII-03: Iogurtes

GRUPO B: Alimentos de Origem Vegetal
├─ BI: Cereais e grãos
├─ BII: Frutas e vegetais

GRUPO C: Produtos Químicos, Cosméticos, Farmacêuticos
├─ CI: Produtos químicos
├─ CII: Cosméticos
├─ CIII: Higiene pessoal
├─ CIV: Farmacêuticos

GRUPO D: Embalagens e Serviços
├─ DI: Embalagens
├─ DII: Serviços de alimentação
```

---

#### **Etapa 3: Produção** ⬆️ **[MOVIDO]**

**Campos para Cálculo de Proposta:**

- **Capacidade de Produção**
  - Quantidade (número)
  - Unidade (kg/mês, litros/mês, unidades/mês)

- **Número de Turnos** (multiplicador proposta)
  - 1 turno → x1.0
  - 2 turnos → x1.4
  - 3 turnos → x1.8

- **Número de Linhas de Produção**

- **Número de Funcionários** (cálculo man-hour)
  - 1-50: 8h auditoria
  - 51-150: 16h auditoria
  - 151-300: 24h auditoria
  - 300+: 32h auditoria

- **Distância da Sede da Certificadora** (cálculo deslocamento)
  - 0-100km: R$ 0
  - 100-300km: R$ 500
  - 300-500km: R$ 1.000
  - 500+km: R$ 2.000

- **Necessita Hospedagem?** (Sim/Não)
  - Se sim: adiciona custo de hospedagem

- **Possui Outras Certificações?**
  - ISO 9001, ISO 22000, HACCP, ANVISA, etc.
  - Facilita análise de conformidade

---

#### **Etapa 4: Tipo de Produto**

- **Nome do Produto Principal**
- **Categoria** (Laticínios, Carnes, Bebidas, etc.)
- **Subcategoria** (Iogurte, Carne bovina, Refrigerante, etc.)
- **Descrição Detalhada**
- **Marca Comercial** (opcional)
- **Número de Produtos no Escopo** (multiplicador proposta)
  - 1-10 produtos → x1.0
  - 11-50 produtos → x1.3
  - 51-100 produtos → x1.6
  - 100+ produtos → x2.0

---

#### **Etapa 5: Ingredientes e Fornecedores**

- **Lista de Ingredientes Principais** (textarea)
- **Lista de Fornecedores** (textarea)
- **Número de Fornecedores** (multiplicador proposta)
  - 1-5 fornecedores → x1.0
  - 6-15 fornecedores → x1.2
  - 16-30 fornecedores → x1.5
  - 30+ fornecedores → x1.8

- **Possui Ingredientes de Origem Animal?** (Sim/Não)
  - Se SIM:
    - Tipo (bovino, frango, peixe, etc.)
    - Origem geográfica
    - **Possui Certificação Halal do Fornecedor?** (Sim/Não/Parcial)
    - Upload de certificados dos fornecedores

**⚠️ Regra Crítica:**
Ingredientes de origem animal **EXIGEM** certificação Halal prévia do fornecedor.

---

#### **Etapa 6: Mercados (Países de Exportação)** 🆕 **[NOVA]**

**Multi-select de Países:**

Mercados Principais:
- [ ] Arábia Saudita
- [ ] Emirados Árabes Unidos
- [ ] Catar
- [ ] Bahrein
- [ ] Kuwait
- [ ] Omã
- [ ] Malásia
- [ ] Indonésia
- [ ] Turquia
- [ ] Egito
- [ ] Outros (especificar)

**Para cada país selecionado:**

```json
{
  "country": "Arábia Saudita",
  "status": "exportando", // ou "planejado" ou "futuro"
  "estimatedVolume": "1000 ton/ano",
  "specificRequirements": "Certificação SASO obrigatória"
}
```

**Campos:**
- Status de Exportação (Já exporta / Planejado / Futuro)
- Volume Estimado de Exportação
- Requisitos Específicos do Mercado

**Objetivo:**
- Adequar certificação às exigências de cada país
- Incluir países autorizados no certificado
- Facilitar análise de conformidade regulatória

---

#### **Etapa 7: Documentação**

**Documentos Obrigatórios:**

**Empresa:**
- [ ] Contrato Social / Estatuto
- [ ] Certidão Negativa de Débitos
- [ ] Alvará de Funcionamento
- [ ] Licença Sanitária

**Técnicos:**
- [ ] Manual de BPF (Boas Práticas de Fabricação)
- [ ] Fluxograma do Processo Produtivo
- [ ] Layout da Fábrica
- [ ] Lista de Fornecedores Certificados
- [ ] Certificados Halal dos Ingredientes
- [ ] Laudos de Análise dos Produtos
- [ ] Rótulo dos Produtos

**Produção:**
- [ ] Fotos das Instalações
- [ ] Vídeos do Processo (opcional)

**Sistema de Upload:**
- Drag & drop
- Preview de arquivos
- Tipos aceitos: PDF, JPG, PNG, DOC, DOCX
- Limite: 10MB por arquivo
- Validação de tipo MIME

---

#### **Etapa 8: Revisão e Submissão**

**Preview Completo (Sidebar):**

```
✅ Dados da Empresa
   BR - CNPJ: 12.345.678/0001-90
   Razão Social: Laticínios ABC Ltda

✅ Classificação Industrial
   Grupo A > Categoria AII > Laticínios

✅ Produção
   Capacidade: 10.000 litros/mês
   Turnos: 2
   Funcionários: 45

✅ Tipo de Produto
   Iogurte Natural Integral
   15 produtos no escopo

✅ Ingredientes
   5 fornecedores
   Possui ingredientes de origem animal

✅ Mercados
   Arábia Saudita, Emirados Árabes

✅ Documentação
   12 documentos enviados
```

**Termos e Condições:**
- [ ] Li e concordo com os termos de solicitação
- [ ] Declaro que todas as informações são verdadeiras
- [ ] Estou ciente dos custos e prazos da certificação
- [ ] Autorizo o processamento dos meus dados

**Ações:**
- **Salvar Rascunho** → Status: rascunho (pode editar depois)
- **Finalizar Solicitação** → Status: pendente (envia para análise)

---

## 🔄 Fluxo Completo de Certificação (17 Fases)

### **Visão Geral:**

```
EMPRESA → ANALISTA → COMERCIAL → JURÍDICO →
FINANCEIRO → ANALISTA → GESTOR AUDITORIA →
AUDITOR → CONTROLADOR → COMITÊ → SISTEMA
```

---

### **FASE 1: Cadastro da Solicitação**
**Responsável:** EMPRESA
**Tempo:** 1-3 horas
**Status:** rascunho → pendente

**Atividades:**
- Seleciona país (BR/CO/PY)
- Valida documento fiscal
- Preenche wizard de 9 etapas
- Submete solicitação

**Saída:**
- Protocolo gerado (HS-2025-XXX)
- Notificação para analistas

---

### **FASE 2: Análise Inicial de Documentos**
**Responsável:** ANALISTA
**Tempo:** 2-3 dias úteis
**Status:** pendente → analise_aprovada

**Atividades:**
- Analista auto-atribuído ao abrir processo
- Validação superficial de documentos
- Verifica se produto é certificável
- Identifica necessidade de documentos complementares
- Aprova viabilidade técnica

**Decisão:**
```
Documentação Completa?
├─ NÃO → Solicita documentos → aguardando_documentos
└─ SIM → Aprova para proposta → analise_aprovada
```

**Saída:**
- Processo aprovado para proposta comercial
- Notificação para Comercial

---

### **FASE 3: Elaboração de Proposta Comercial** 🆕
**Responsável:** COMERCIAL
**Tempo:** 1-2 dias úteis
**Status:** analise_aprovada → proposta_enviada

**Atividades:**
- Comercial recebe notificação
- Sistema calcula proposta automática baseado em:
  - Tipo de certificação (C1-C6)
  - Número de produtos (multiplicador)
  - Número de turnos (multiplicador)
  - Número de fornecedores (multiplicador)
  - Número de funcionários (man-hour)
  - Distância (deslocamento)
  - Hospedagem
  - Taxas fixas
  - Impostos

**Cálculo Automático:**
```typescript
totalValue =
  (basePrice * productMultiplier * shiftMultiplier * supplierMultiplier) +
  manHourCost +
  travelCost +
  accommodationCost +
  documentAnalysisFee +
  committeeFee +
  issuanceFee +
  (subtotal * taxRate)
```

**Atividades do Comercial:**
- Revisa cálculo automático
- Aplica ajustes manuais (se necessário, com justificativa)
- Aprova desconto (até limite definido)
- Gera PDF da proposta
- Envia para cliente

**Saída:**
- PDF da proposta enviado
- Validade: 30 dias
- Notificação para empresa

---

### **FASE 4: Negociação e Aceite da Proposta** 🆕
**Responsável:** COMERCIAL + EMPRESA
**Tempo:** 3-7 dias úteis
**Status:** proposta_enviada → proposta_aprovada

**Atividades da Empresa:**
- Visualiza proposta no portal
- Analisa valores e condições
- Pode solicitar ajustes (comentários)
- Decide: Aceitar ou Recusar

**Atividades do Comercial:**
- Negocia valores (se necessário)
- Aplica ajustes
- Reenvia proposta atualizada

**Decisão:**
```
Empresa aceita proposta?
├─ NÃO → Proposta recusada → Comercial reformula → Volta Fase 3
└─ SIM → Proposta aprovada → Avança Fase 5
```

**Saída:**
- Data de aprovação registrada
- Notificação para Jurídico

---

### **FASE 5: Elaboração de Contrato** 🆕
**Responsável:** JURÍDICO
**Tempo:** 2-3 dias úteis
**Status:** proposta_aprovada → elaborando_contrato

**Atividades:**
- Jurídico recebe notificação
- Sistema gera minuta de contrato baseada na proposta
- Jurídico revisa e ajusta cláusulas:
  - Valores da proposta
  - Número de parcelas
  - Vencimentos
  - Penalidades
  - Condições especiais
- Gera PDF do contrato (minuta)
- Envia para assinatura da empresa

**Saída:**
- Minuta de contrato gerada
- Email para empresa com link de assinatura

---

### **FASE 6: Assinatura de Contrato** 🆕
**Responsável:** JURÍDICO + EMPRESA
**Tempo:** 3-7 dias úteis
**Status:** elaborando_contrato → contrato_assinado

**Processo de Assinatura:**

1. **Empresa assina contrato**
   - Assinatura digital OU
   - Assinatura física + upload de PDF

2. **Certificadora assina contrato**
   - Representante legal assina
   - Pode ser digital ou física

3. **Jurídico arquiva contrato**
   - Upload de contrato com ambas assinaturas
   - Sistema valida assinaturas completas

**Validação:**
```
Ambas assinaturas presentes?
├─ NÃO → aguardando_assinatura (continua aguardando)
└─ SIM → contrato_assinado (avança)
```

**Campos Registrados:**
- `companySignedAt` - Data assinatura empresa
- `companySignedBy` - Nome do signatário
- `certSignedAt` - Data assinatura certificadora
- `certSignedBy` - Nome do signatário
- `signedPdfUrl` - URL do PDF assinado

**Saída:**
- Contrato assinado armazenado
- Notificação para Financeiro (cobrança)
- Notificação para Analista (avaliação detalhada)

---

### **FASE 7: Pagamento de Taxas** 🆕
**Responsável:** FINANCEIRO + EMPRESA
**Tempo:** 5-10 dias úteis
**Status:** contrato_assinado → pagamento_confirmado

**Atividades do Financeiro:**
- Gera cobranças conforme contrato:
  - À vista OU
  - Parcelado (2x, 3x, 4x, etc.)
- Envia boletos/links de pagamento
- Registra pagamentos recebidos
- Controla inadimplência

**Atividades da Empresa:**
- Efetua pagamento (1ª parcela ou integral)
- Sistema registra confirmação

**Validação:**
```
Pagamento inicial confirmado?
├─ NÃO → aguardando_pagamento (bloqueia avanço)
└─ SIM → pagamento_confirmado (libera auditoria)
```

**⚠️ Regra de Negócio:**
Processo **NÃO AVANÇA** sem pagamento confirmado.

**Saída:**
- Pagamento registrado
- Notificação para Analista (avaliação detalhada)

---

### **FASE 8: Avaliação Documental Detalhada** 🆕
**Responsável:** ANALISTA
**Tempo:** 3-5 dias úteis
**Status:** pagamento_confirmado → avaliacao_aprovada

**Diferença da Fase 2:**
- **Fase 2**: Análise superficial para viabilidade e proposta
- **Fase 8**: Análise profunda de matérias-primas e processos

**Atividades:**

1. **Análise de Riscos de Matérias-Primas**
   - Valida origem de cada ingrediente
   - Verifica certificados Halal dos fornecedores
   - Analisa risco de contaminação cruzada
   - Identifica ingredientes críticos

2. **Análise de Processos Produtivos**
   - Fluxograma de produção detalhado
   - Pontos críticos de controle (PCC)
   - Procedimentos de limpeza/sanitização
   - Segregação de produtos Halal/Não-Halal

3. **Checklist de Conformidade Pré-Auditoria**
   - BPF (Boas Práticas de Fabricação)
   - Rastreabilidade
   - Controle de fornecedores
   - Gestão de não conformidades

4. **Documentos Complementares**
   - Solicita se necessário
   - Valida recebimento

**Saída:**
- Relatório de pré-análise gerado
- Checklist para auditoria preparado
- Processo aprovado para auditoria
- Notificação para Gestor de Auditoria

---

### **FASE 9: Agendamento de Auditoria**
**Responsável:** GESTOR DE AUDITORIA
**Tempo:** 3-7 dias úteis
**Status:** avaliacao_aprovada → auditoria_agendada

**Atividades:**
- Aloca equipe de auditoria (auditores qualificados)
- Coordena data/horário com empresa
- Define escopo da auditoria (Estágio 1)
- Envia checklist pré-auditoria para empresa
- Agenda logística:
  - Transporte (passagens, combustível)
  - Hospedagem (se necessário)
  - Equipamentos necessários
- Registra auditoria no sistema

**Saída:**
- Data confirmada
- Equipe alocada
- Notificações enviadas (Empresa + Auditores)

---

### **FASE 10: Auditoria Estágio 1**
**Responsável:** AUDITOR
**Tempo:** 1-2 dias (no cliente)
**Status:** auditoria_agendada → auditoria_estagio1_concluida

**Tipo:** Auditoria Documental e de Sistema

**Atividades:**
- Revisão de documentação in loco
- Verificação de procedimentos e registros
- Entrevistas com responsáveis
- Inspeção preliminar das instalações
- Identificação de não conformidades (NC):
  - **NC Menor**: Desvio leve, não impacta segurança
  - **NC Maior**: Desvio significativo, requer ação
  - **NC Crítica**: Desvio grave, bloqueia certificação

**Relatório de Auditoria:**
- Lista de NC identificadas
- Evidências (fotos, documentos)
- Recomendações
- Prazo para correção de cada NC

**Decisão:**
```
Encontrou não conformidades?
├─ SIM (NC > 0) → nc_estagio1_registradas → Fase 11
└─ NÃO (NC = 0) → Avança direto para Estágio 2
```

**Saída:**
- Relatório enviado para empresa
- NC registradas no sistema
- Prazo de correção definido (30-60 dias)

---

### **FASE 11: Correção de Não Conformidades - Estágio 1** 🆕
**Responsável:** EMPRESA + AUDITOR
**Tempo:** 30-60 dias
**Status:** auditoria_estagio1_concluida → nc_estagio1_validadas

**Atividades da Empresa:**

Para cada NC identificada:
1. Elabora plano de ação corretiva
2. Implementa correções
3. Coleta evidências:
   - Fotos do antes/depois
   - Documentos atualizados
   - Registros de treinamento
   - Novos procedimentos
4. Submete evidências no sistema (dentro do prazo)

**Atividades do Auditor:**
1. Recebe evidências
2. Analisa correção de cada NC:
   - Verifica adequação da ação
   - Valida evidências
   - Aprova OU solicita revisão
3. Registra validação no sistema

**Validação:**
```
Todas NC corrigidas e validadas?
├─ NÃO → Prazo vencido?
│         ├─ SIM → Processo pode ser cancelado
│         └─ NÃO → Empresa continua corrigindo
│
└─ SIM → nc_estagio1_validadas → Avança Fase 12
```

**⚠️ Regras:**
- NC Críticas: **BLOQUEIAM** avanço até correção
- Prazo vencido: Processo pode ser **CANCELADO**
- Correção insuficiente: Auditor **REJEITA** evidência

**Saída:**
- Todas NC validadas
- Sistema libera para Estágio 2
- Notificação para Gestor de Auditoria

---

### **FASE 12: Auditoria Estágio 2**
**Responsável:** AUDITOR
**Tempo:** 1-3 dias (no cliente)
**Status:** nc_estagio1_validadas → auditoria_estagio2_concluida

**Tipo:** Auditoria Completa de Certificação

**Atividades:**

1. **Inspeção Detalhada de Todas Instalações**
   - Recebimento de matérias-primas
   - Armazenamento (temperatura, segregação)
   - Áreas de produção (layout, fluxo)
   - Embalagem (identificação, rastreabilidade)
   - Expedição (controle de embarque)
   - Áreas de apoio (vestiários, refeitório)

2. **Verificação de BPF (Boas Práticas)**
   - Higiene pessoal
   - Limpeza e sanitização
   - Controle de pragas
   - Manutenção preventiva

3. **Rastreabilidade de Ingredientes**
   - Lote de produção → Lote de ingrediente
   - Certificado Halal do fornecedor
   - Nota fiscal de compra

4. **Verificação das Correções de NC do Estágio 1**
   - Confirma in loco que correções foram mantidas

5. **Coleta de Amostras (se aplicável)**
   - Para análise laboratorial
   - Conforme tipo de certificação

6. **Registro Fotográfico**
   - Todas as áreas visitadas
   - Evidências de conformidade

7. **Identificação de Novas NC**
   - Se houver desvios adicionais

**Relatório Final de Auditoria:**
- Resumo executivo
- Detalhamento por área
- NC identificadas (se houver)
- Fotos e evidências
- Recomendação: Aprovar / Aprovar com condições / Reprovar

**Decisão:**
```
Encontrou não conformidades?
├─ SIM (NC > 0) → nc_estagio2_registradas → Fase 13
└─ NÃO (NC = 0) → Avança Fase 14
```

**Saída:**
- Relatório final gerado
- Fotos anexadas
- Amostras coletadas (se aplicável)

---

### **FASE 13: Correção de Não Conformidades - Estágio 2** 🆕
**Responsável:** EMPRESA + AUDITOR
**Tempo:** 15-30 dias
**Status:** auditoria_estagio2_concluida → nc_estagio2_validadas

**Mesmo processo da Fase 11, mas:**
- Prazo menor (15-30 dias)
- NC geralmente são menores (maioria corrigida no Estágio 1)
- NC Críticas no Estágio 2: podem exigir **NOVA AUDITORIA**

**Saída:**
- Todas NC validadas
- Notificação para Controlador

---

### **FASE 14: Validação de Auditoria** 🆕
**Responsável:** CONTROLADOR + SUPERVISOR
**Tempo:** 2-3 dias úteis
**Status:** nc_estagio2_validadas → validacao_aprovada

**Atividades do Supervisor:**
- Acompanha processo in loco (opcional)
- Emite relatório para controlador

**Atividades do Controlador:**
1. Revisa relatório de auditoria completo
2. Valida evidências fotográficas
3. Verifica conformidade com normas:
   - GSO 2055-1 (Requisitos Gerais)
   - GSO 2055-2 (Classificação Industrial)
   - GSO 2055-3 (Auditoria)
4. Analisa correções de NC
5. Verifica rastreabilidade
6. Solicita esclarecimentos (se necessário)
7. Aprova relatório para comitê técnico

**Saída:**
- Relatório validado
- Documentação completa conferida
- Notificação para Comitê Técnico

---

### **FASE 15: Análise Laboratorial (Opcional)** 🆕
**Responsável:** LABORATÓRIO EXTERNO
**Tempo:** 10-15 dias úteis
**Status:** validacao_aprovada → laudo_aprovado

**Quando é Obrigatória:**
- ✅ C1 (Alimentos processados): Geralmente SIM
- ✅ C2 (Químicos): SEMPRE
- ✅ C3 (Cosméticos): Geralmente SIM
- ✅ C4 (Farmacêuticos): SEMPRE
- ❌ C5 (Embalagens): Raramente
- ❌ C6 (Serviços): NÃO

**Atividades:**
1. Amostras coletadas durante Estágio 2
2. Laboratório realiza análises:
   - Detecção de ingredientes proibidos
   - Contaminação cruzada
   - Conformidade de composição
   - Outros testes específicos
3. Laboratório emite laudo técnico
4. Laudo anexado ao processo

**Decisão:**
```
Resultado do laudo?
├─ REPROVADO → Processo BLOQUEADO → Ações corretivas necessárias
└─ APROVADO → laudo_aprovado → Avança Fase 16
```

**Saída:**
- Laudo laboratorial anexado
- Notificação para Comitê

---

### **FASE 16: Comitê Técnico - Decisão de Certificação**
**Responsável:** COMITÊ (Analistas + Gestores)
**Tempo:** 3-5 dias úteis
**Status:** laudo_aprovado → aprovado

**Composição do Comitê:**
- Diretor Técnico (coordenador)
- Analistas seniores
- Gestores
- Especialistas (conforme necessário)

**Documentação Analisada:**
1. Relatório de análise documental (Fase 2 e 8)
2. Relatório de Estágio 1
3. Relatório de Estágio 2
4. Correções de NC
5. Laudo laboratorial (se aplicável)
6. Parecer do controlador

**Processo de Decisão:**
1. Membros do comitê votam individualmente
2. Cada voto registrado com justificativa
3. Decisão final por maioria dos votos

**Opções de Voto:**
- **Aprovar**: Certificar a empresa
- **Reprovar**: Negar certificação
- **Solicitar Informações**: Pedir esclarecimentos/complementos

**Decisão Final:**
```
Decisão do Comitê?
├─ APROVAR → aprovado → Fase 17 (Certificação)
├─ REPROVAR → reprovado → Processo encerrado
└─ SOLICITAR INFO → solicitar_info → Volta para fase anterior
```

**Saída:**
- Decisão registrada com votos individuais
- Justificativa documentada
- Notificações:
  - Empresa
  - Analista
  - Gestor

---

### **FASE 17: Emissão de Certificado**
**Responsável:** SISTEMA (Automático)
**Tempo:** 1-2 dias úteis
**Status:** aprovado → certificado

**Processo Automático:**

1. **Geração de Número Único**
   - Formato: `CERT-{PAÍS}-{ANO}-{SEQUENCIAL}`
   - Exemplo: `CERT-BR-2025-001234`

2. **Criação de Registro**
   - Tabela: `certificates`
   - Campos preenchidos automaticamente

3. **Registro de Produtos no Escopo**
   - Tabela: `certified_products`
   - Lista de produtos aprovados

4. **Cálculo de Validade**
   - Data emissão + meses do contrato
   - Padrão: 24 meses (2 anos)
   - Renovação: 36 meses (3 anos)

5. **Geração de PDF do Certificado**

**Estrutura do PDF:**
```
┌─────────────────────────────────────────┐
│  LOGO HALALSPHERE + LOGO GSO            │
│                                         │
│     CERTIFICADO HALAL                   │
│     HALAL CERTIFICATE                   │
│                                         │
│  Nº: CERT-BR-2025-001234    [QR CODE]  │
│                                         │
│  Certificamos que:                      │
│  We hereby certify that:                │
│                                         │
│  LATICÍNIOS ABC LTDA                    │
│  CNPJ: 12.345.678/0001-90               │
│  Endereço: ...                          │
│                                         │
│  Está certificado para produzir:        │
│  Is certified to produce:               │
│                                         │
│  PRODUTOS CERTIFICADOS (ESCOPO):        │
│  ┌─────────────────────────────────┐  │
│  │ 1. Iogurte Natural Integral     │  │
│  │ 2. Iogurte com Frutas           │  │
│  │ 3. Leite Pasteurizado           │  │
│  │ ... (15 produtos)               │  │
│  └─────────────────────────────────┘  │
│                                         │
│  Tipo de Certificação: C1               │
│  Certification Type: C1                 │
│                                         │
│  Países Autorizados:                    │
│  Authorized Countries:                  │
│  - Arábia Saudita                       │
│  - Emirados Árabes Unidos               │
│                                         │
│  Validade: 15/01/2025 a 15/01/2027      │
│  Validity: Jan 15, 2025 to Jan 15, 2027 │
│                                         │
│  ___________________________________    │
│  Diretor Técnico                        │
│  Technical Director                     │
│  [Assinatura Digital]                   │
│                                         │
│  Este certificado é válido somente para │
│  os produtos listados acima.            │
└─────────────────────────────────────────┘
```

6. **Geração de QR Code**
   - URL: `https://halalsphere.com/verify/{certificateNumber}`
   - Permite validação online

7. **Armazenamento**
   - PDF armazenado no storage
   - QR Code armazenado

8. **Envio para Empresa**
   - Email com certificado anexado
   - Link para download no portal
   - Instruções de uso

9. **Disponibilização no Portal**
   - Empresa pode baixar a qualquer momento
   - Histórico de downloads registrado

**Saída:**
- ✅ Certificado emitido
- ✅ PDF gerado e armazenado
- ✅ Email enviado
- ✅ Processo concluído com sucesso

---

## 👥 Departamentos e Responsabilidades

### **1. EMPRESA** (Cliente)

**Papel:** Solicitante da certificação

**Responsabilidades:**
- Preencher solicitação completa
- Fornecer documentos obrigatórios
- Aceitar/recusar proposta comercial
- Assinar contrato
- Efetuar pagamento
- Corrigir não conformidades (Fases 11, 13)
- Receber auditoria
- Manter certificado ativo

**Permissões no Sistema:**
- ✅ Criar solicitação
- ✅ Visualizar suas próprias solicitações
- ✅ Editar solicitações em rascunho
- ✅ Fazer upload de documentos
- ✅ Submeter evidências de correção de NC
- ✅ Baixar certificado
- ❌ Ver solicitações de outras empresas
- ❌ Alterar status do processo

---

### **2. ANALISTA**

**Papel:** Avaliação técnica de documentos

**Responsabilidades:**
- Análise inicial de documentos (Fase 2)
- Avaliação detalhada de matérias-primas (Fase 8)
- Análise de riscos
- Validação de conformidade pré-auditoria
- Participar do comitê técnico (Fase 16)

**Permissões no Sistema:**
- ✅ Visualizar TODOS os processos
- ✅ Auto-atribuir processos pendentes
- ✅ Atualizar status de processos atribuídos
- ✅ Solicitar documentos complementares
- ✅ Adicionar comentários internos
- ✅ Aprovar para proposta/auditoria
- ❌ Editar processos de outros analistas
- ❌ Elaborar propostas comerciais
- ❌ Aprovar certificação final (apenas comitê)

---

### **3. COMERCIAL** 🆕

**Papel:** Gestão comercial e proposta

**Responsabilidades:**
- Elaborar proposta comercial (Fase 3)
- Negociar valores e condições (Fase 4)
- Aprovar descontos (até limite)
- Ajustar proposta conforme negociação
- Acompanhar aceite do cliente

**Permissões no Sistema:**
- ✅ Visualizar processos em fase de proposta
- ✅ Criar e editar propostas
- ✅ Enviar propostas para clientes
- ✅ Negociar valores
- ✅ Aprovar descontos (limite: 15%)
- ✅ Avançar processo após aceite
- ❌ Alterar dados técnicos da solicitação
- ❌ Aprovar certificação

**Dashboard:**
- Processos aguardando proposta
- Propostas em elaboração
- Propostas enviadas (aguardando resposta)
- Propostas em negociação
- Taxa de conversão
- Valor médio de propostas

---

### **4. JURÍDICO** 🆕

**Papel:** Gestão jurídica e contratos

**Responsabilidades:**
- Elaborar contrato (Fase 5)
- Revisar cláusulas e condições
- Gerenciar processo de assinatura (Fase 6)
- Fazer upload de contrato assinado
- Validar assinaturas completas
- Arquivar documentação legal

**Permissões no Sistema:**
- ✅ Visualizar processos com proposta aprovada
- ✅ Criar e editar contratos
- ✅ Upload de contratos PDF
- ✅ Gerenciar assinaturas
- ✅ Avançar processo após assinatura completa
- ❌ Alterar valores da proposta
- ❌ Aprovar certificação

**Dashboard:**
- Propostas aprovadas aguardando contrato
- Contratos em elaboração
- Contratos aguardando assinatura (empresa)
- Contratos aguardando assinatura (certificadora)
- Contratos assinados recentemente
- Alertas de prazos

---

### **5. FINANCEIRO** 🆕

**Papel:** Gestão financeira e pagamentos

**Responsabilidades:**
- Gerar cobranças (Fase 7)
- Registrar pagamentos recebidos
- Controlar parcelas e vencimentos
- Gerenciar inadimplência
- Emitir relatórios financeiros

**Permissões no Sistema:**
- ✅ Visualizar contratos assinados
- ✅ Gerar boletos/cobranças
- ✅ Registrar pagamentos
- ✅ Controlar inadimplência
- ✅ Emitir relatórios financeiros
- ✅ Bloquear processo por inadimplência
- ❌ Alterar valores do contrato
- ❌ Aprovar certificação

**Dashboard:**
- Contratos aguardando cobrança
- Pagamentos pendentes
- Pagamentos vencidos
- Pagamentos recebidos (mês)
- Receita total
- Taxa de inadimplência

---

### **6. GESTOR DE AUDITORIA** 🆕

**Papel:** Planejamento e gestão de auditorias

**Responsabilidades:**
- Agendar auditorias (Fase 9)
- Alocar equipe de auditores
- Coordenar data/horário com cliente
- Gerenciar logística (transporte, hospedagem)
- Monitorar prazos
- Enviar notificações

**Permissões no Sistema:**
- ✅ Visualizar processos aprovados para auditoria
- ✅ Criar e agendar auditorias
- ✅ Alocar auditores
- ✅ Gerenciar equipes
- ✅ Monitorar status de auditorias
- ✅ Realocar auditores (se necessário)
- ❌ Executar auditoria
- ❌ Aprovar certificação

**Dashboard:**
- Processos aguardando agendamento
- Auditorias agendadas (próximos 30 dias)
- Auditores disponíveis
- Auditorias em andamento
- Auditorias concluídas (mês)
- Taxa de conclusão no prazo

---

### **7. AUDITOR**

**Papel:** Execução de auditorias

**Responsabilidades:**
- Executar Estágio 1 (Fase 10)
- Executar Estágio 2 (Fase 12)
- Identificar não conformidades
- Elaborar relatórios de auditoria
- Validar correções de NC (Fases 11, 13)
- Coletar amostras (se aplicável)
- Registro fotográfico

**Permissões no Sistema:**
- ✅ Visualizar auditorias alocadas
- ✅ Registrar não conformidades
- ✅ Fazer upload de fotos/evidências
- ✅ Elaborar relatórios de auditoria
- ✅ Validar correções de NC
- ✅ Solicitar nova auditoria (se NC grave)
- ❌ Aprovar certificação final

**Dashboard:**
- Auditorias alocadas
- Auditorias próximas (calendário)
- NC aguardando validação
- Evidências recebidas
- Relatórios pendentes

---

### **8. CONTROLADOR + SUPERVISOR** 🆕

**Papel:** Validação técnica de auditorias

**Responsabilidades:**
- Validar relatórios de auditoria (Fase 14)
- Verificar evidências fotográficas
- Analisar conformidade com normas
- Verificar rastreabilidade
- Aprovar para comitê técnico
- Acompanhar in loco (supervisor - opcional)

**Permissões no Sistema:**
- ✅ Visualizar auditorias concluídas
- ✅ Revisar relatórios completos
- ✅ Solicitar esclarecimentos ao auditor
- ✅ Aprovar/reprovar relatório
- ✅ Adicionar pareceres técnicos
- ❌ Aprovar certificação final (apenas comitê)

**Dashboard:**
- Auditorias aguardando validação
- Relatórios em revisão
- Relatórios aprovados
- Relatórios com pendências

---

### **9. COMITÊ TÉCNICO**

**Papel:** Decisão final de certificação

**Composição:**
- Diretor Técnico (coordenador)
- Analistas seniores
- Gestores
- Especialistas

**Responsabilidades:**
- Analisar documentação completa (Fase 16)
- Revisar não conformidades e correções
- Votar pela aprovação/reprovação
- Documentar decisão e justificativa
- Solicitar informações complementares (se necessário)

**Permissões no Sistema:**
- ✅ Visualizar processos em comitê
- ✅ Votar (aprovar/reprovar/solicitar info)
- ✅ Adicionar justificativa de voto
- ✅ Visualizar votos de outros membros
- ✅ Decisão final por maioria
- ✅ Aprovar emissão de certificado

**Dashboard:**
- Processos aguardando comitê
- Reuniões agendadas
- Votos pendentes
- Decisões recentes

---

### **10. GESTOR** (Geral)

**Papel:** Gestão geral e supervisão

**Responsabilidades:**
- Visualizar TODOS os processos
- Atribuir/reatribuir analistas
- Atualizar qualquer status
- Avançar/retroceder fases
- Aprovar propostas e contratos
- Participar do comitê técnico
- Emitir certificados (se necessário)
- Gerar relatórios gerenciais

**Permissões no Sistema:**
- ✅ Acesso total a todos os processos
- ✅ Atribuir/reatribuir qualquer recurso
- ✅ Alterar status e fases
- ✅ Aprovar descontos acima do limite
- ✅ Cancelar/suspender processos
- ✅ Gerar todos os relatórios
- ✅ Configurar sistema

---

### **11. ADMIN** (Administrador do Sistema)

**Papel:** Administração técnica do sistema

**Responsabilidades:**
- Gerenciar usuários e permissões
- Configurar sistema
- Gerenciar dados mestres
- Monitorar logs e auditoria
- Backup e segurança
- Suporte técnico

**Permissões no Sistema:**
- ✅ Acesso total ao sistema
- ✅ Criar/editar/excluir usuários
- ✅ Configurar permissões
- ✅ Acessar logs de auditoria
- ✅ Configurar parâmetros do sistema
- ✅ Executar backups
- ✅ Gerenciar integrações

---

## 🗄️ Modelo de Dados

### **Principais Enums:**

```prisma
enum Country {
  BR  // Brasil
  CO  // Colômbia
  PY  // Paraguai
}

enum TaxIdType {
  CNPJ  CPF   // Brasil
  NIT   CC    // Colômbia
  RUC   CI    // Paraguai
}

enum Currency {
  BRL   // Real (R$)
  COP   // Peso Colombiano (COP$)
  PYG   // Guaraní (₲)
}

enum UserRole {
  admin
  empresa
  analista
  comercial           // [NOVO]
  juridico            // [NOVO]
  financeiro          // [NOVO]
  gestor_auditoria    // [NOVO]
  auditor
  supervisor          // [NOVO]
  controlador         // [NOVO]
  gestor
}

enum RequestType {
  nova          // Nova certificação
  renovacao     // Renovação após 3 anos
  manutencao_1  // Vigilância ano 2
  manutencao_2  // Vigilância ano 3
  adequacao     // Alteração de escopo
  ampliacao     // Ampliação de escopo
}

enum ProcessPhase {
  cadastro_solicitacao        // 1
  analise_documental          // 2
  elaboracao_proposta         // 3 [NOVO]
  negociacao_proposta         // 4 [NOVO]
  proposta_aprovada           // 5 [NOVO]
  elaboracao_contrato         // 6 [NOVO]
  assinatura_contrato         // 7 [NOVO]
  pagamento                   // 8 [NOVO]
  avaliacao_detalhada         // 9 [NOVO]
  auditoria_agendada          // 10
  auditoria_estagio1          // 11 [ATUALIZADO]
  correcao_nc_estagio1        // 12 [NOVO]
  auditoria_estagio2          // 13 [ATUALIZADO]
  correcao_nc_estagio2        // 14 [NOVO]
  validacao_auditoria         // 15 [NOVO]
  analise_laboratorial        // 16 [NOVO]
  comite_tecnico              // 17
  certificado_emitido         // 18
}
```

### **Company (Atualizado com Internacionalização):**

```prisma
model Company {
  id                String   @id @default(uuid())
  userId            String   @unique

  // Internacional [NOVO]
  country           Country
  taxId             String    // Sem formatação
  taxIdFormatted    String    // Com formatação
  taxIdType         TaxIdType

  // Dados
  legalName         String    // Razão Social
  tradeName         String?   // Nome Fantasia
  address           Json      // Flexível por país
  contact           Json
  currency          Currency  @default(BRL)

  // Relações
  user              User
  requests          Request[]
  contracts         Contract[]

  @@unique([country, taxId])  // Unicidade por país
  @@index([country])
  @@index([taxId])
}
```

### **Request (Atualizado):**

```prisma
model Request {
  id                   String            @id @default(uuid())
  companyId            String
  protocol             String            @unique
  companyName          String
  requestType          RequestType
  certificationType    CertificationType

  // Internacional [NOVO]
  country              Country

  // Classificação Industrial
  industrialGroupId      String?
  industrialCategoryId   String?
  industrialSubcategoryId String?

  // Produtos
  productOrigin        ProductOrigin
  productType          String
  productCategory      String
  productDescription   String
  productDetails       Json
  productionDetails    Json

  // Mercados [NOVO]
  exportMarkets        Json?  // Lista de países destino

  // Para adequação [NOVO]
  parentCertificateId  String?
  changeDescription    String?
  changeImpact         ChangeImpact?

  // Status
  status               RequestStatus
  submittedAt          DateTime?
  createdAt            DateTime
  updatedAt            DateTime

  // Relações
  company              Company
  process              Process?
  documents            Document[]
}
```

### **Contract (Atualizado):**

```prisma
model Contract {
  id               String         @id @default(uuid())
  processId        String
  companyId        String

  contractType     ContractType
  status           ContractStatus

  // Proposta [NOVO]
  proposalId       String?

  // Valores
  totalValue       Decimal
  numInstallments  Int
  validityMonths   Int

  // Documentos [ATUALIZADO]
  draftPdfUrl      String?    // [NOVO] Minuta
  signedPdfUrl     String?    // Contrato assinado

  // Assinaturas [NOVO]
  companySignedAt  DateTime?
  companySignedBy  String?
  certSignedAt     DateTime?
  certSignedBy     String?

  // Jurídico [NOVO]
  createdBy        String?    // User ID (jurídico)
  reviewedBy       String?    // User ID (gestor)

  sentAt           DateTime?
  signedAt         DateTime?
  createdAt        DateTime
  updatedAt        DateTime

  // Relações
  process          Process
  company          Company
  proposal         Proposal?
}
```

### **NonConformity (Novo):**

```prisma
model NonConformity {
  id                String   @id @default(uuid())
  auditId           String
  processId         String

  // Classificação
  category          NCCategory  // menor, maior, critica
  description       String
  requirement       String      // Cláusula GSO violada

  // Prazos
  dueDate           DateTime    // Prazo para correção
  status            NCStatus    // aberta, em_correcao, etc.

  // Correção
  correctionPlan    String?
  correctionEvidence Json?     // URLs de documentos/fotos
  correctedAt       DateTime?

  // Validação
  validatedBy       String?
  validatedAt       DateTime?
  validationNotes   String?

  createdAt         DateTime
  updatedAt         DateTime

  // Relações
  audit             Audit
  process           Process
}

enum NCCategory {
  menor      // Não conformidade menor
  maior      // Não conformidade maior
  critica    // NC crítica (bloqueia certificação)
}

enum NCStatus {
  aberta
  em_correcao
  evidencia_enviada
  validada
  rejeitada  // Correção insuficiente
}
```

---

## 🚀 Próximos Passos de Implementação

### **SPRINT 1: Internacionalização (2 semanas)**

**Backend:**
- [ ] Atualizar `schema.prisma` completo
- [ ] Criar migrations para novos campos
- [ ] Implementar `TaxValidationService` (BR, CO, PY)
- [ ] Implementar `CurrencyService`
- [ ] Atualizar seeds com exemplos multi-país

**Frontend:**
- [ ] Adicionar seleção de país no cadastro
- [ ] Criar formulários de documento fiscal por país
- [ ] Implementar máscaras de input
- [ ] Criar sistema de i18n (PT-BR, ES)
- [ ] Adaptar formatação de endereço por país

---

### **SPRINT 2: Departamentos Comercial e Jurídico (3 semanas)**

**Backend:**
- [ ] Criar módulo Comercial (controller + service + routes)
- [ ] Integrar módulo de Proposta ao fluxo principal
- [ ] Implementar aceite de proposta pelo cliente
- [ ] Criar módulo Jurídico (controller + service + routes)
- [ ] Implementar elaboração de contrato
- [ ] Implementar fluxo de assinatura
- [ ] Implementar upload de PDF assinado

**Frontend:**
- [ ] Criar dashboard Comercial
- [ ] Criar interface de elaboração de proposta
- [ ] Criar interface de negociação
- [ ] Criar dashboard Jurídico
- [ ] Criar interface de elaboração de contrato
- [ ] Criar interface de assinatura de contrato

---

### **SPRINT 3: Módulo Financeiro (2 semanas)**

**Backend:**
- [ ] Criar models `Payment` e `Installment`
- [ ] Criar módulo Financeiro (controller + service)
- [ ] Implementar geração de cobranças
- [ ] Integrar gateway de pagamento (Stripe/PagSeguro)
- [ ] Implementar controle de parcelas
- [ ] Criar sistema de notificações de cobrança

**Frontend:**
- [ ] Criar dashboard Financeiro
- [ ] Criar interface de gestão de pagamentos
- [ ] Criar interface de inadimplência
- [ ] Integrar com gateway de pagamento

---

### **SPRINT 4: Gestão de Não Conformidades (3 semanas)**

**Backend:**
- [ ] Criar model `NonConformity`
- [ ] Criar fases `correcao_nc_estagio1` e `correcao_nc_estagio2`
- [ ] Implementar registro de NC
- [ ] Implementar submissão de evidências
- [ ] Implementar validação de correções
- [ ] Implementar controle de prazos

**Frontend:**
- [ ] Criar interface de registro de NC (auditor)
- [ ] Criar interface de correção de NC (empresa)
- [ ] Criar interface de validação de NC (auditor)
- [ ] Criar dashboard de NC
- [ ] Implementar upload de evidências

---

### **SPRINT 5: Wizard Atualizado (2 semanas)**

**Frontend:**
- [ ] Reordenar etapas (3 e 4 trocadas)
- [ ] Criar `ExportMarketsStep` component
- [ ] Atualizar `ProductionStep` com novos campos
- [ ] Atualizar `IngredientsStep` com número de fornecedores
- [ ] Integrar com backend atualizado

---

### **SPRINT 6: Sistema de Notificações Automáticas (1 semana)**

**Backend:**
- [ ] Implementar job de renovação (cron)
- [ ] Implementar job de vencimento (cron)
- [ ] Criar templates de email por idioma
- [ ] Implementar notificações em tempo real (WebSocket)

**Frontend:**
- [ ] Criar componente de notificações
- [ ] Implementar badge de notificações não lidas
- [ ] Criar central de notificações

---

### **SPRINT 7: Testes e Refinamentos (2 semanas)**

**Backend:**
- [ ] Testes unitários (coverage > 80%)
- [ ] Testes de integração
- [ ] Testes de validação de documentos
- [ ] Testes de fluxos completos

**Frontend:**
- [ ] Testes E2E (Cypress/Playwright)
- [ ] Testes de responsividade
- [ ] Testes de acessibilidade
- [ ] Correções e ajustes finais

---

## 📊 Cronograma Total

```
Sprint 1: Internacionalização           - 2 semanas
Sprint 2: Comercial + Jurídico          - 3 semanas
Sprint 3: Financeiro                    - 2 semanas
Sprint 4: Não Conformidades             - 3 semanas
Sprint 5: Wizard Atualizado             - 2 semanas
Sprint 6: Notificações                  - 1 semana
Sprint 7: Testes e Refinamentos         - 2 semanas

TOTAL: 15 semanas (~3,5 meses)
```

---

## 📚 Documentos de Referência

1. [REVISAO-PROCESSO-SOLICITACAO-CERTIFICACAO.md](REVISAO-PROCESSO-SOLICITACAO-CERTIFICACAO.md)
2. [PROPOSTA-AJUSTES-PROCESSO-CERTIFICACAO.md](PROPOSTA-AJUSTES-PROCESSO-CERTIFICACAO.md)
3. [ANALISE-ADERENCIA-FLUXO-ATUAL.md](ANALISE-ADERENCIA-FLUXO-ATUAL.md)
4. [FLUXO-COMPLETO-CERTIFICACAO-ATUALIZADO.md](FLUXO-COMPLETO-CERTIFICACAO-ATUALIZADO.md)
5. [FLUXOS-TIPOS-SOLICITACAO.md](FLUXOS-TIPOS-SOLICITACAO.md)
6. [INTERNACIONALIZACAO-SISTEMA.md](INTERNACIONALIZACAO-SISTEMA.md)
7. [PROPOSTA-MODULO-CERTIFICADOS.md](PROPOSTA-MODULO-CERTIFICADOS.md)

---

**Elaborado por**: Claude Code (Assistente de IA)
**Data**: 08 de Dezembro de 2025
**Versão**: 6.0 - FINAL
**Status**: ✅ Documento Consolidado Completo
