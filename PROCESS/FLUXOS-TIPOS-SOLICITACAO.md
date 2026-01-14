# 🔀 Fluxos por Tipo de Solicitação - Sistema de Certificação Halal

**Data**: 08 de Dezembro de 2025
**Versão**: 5.0 - INTERNACIONAL
**Status**: 🌍 Fluxos Diferenciados Multi-País (BR, CO, PY)

---

## 🎯 Visão Geral

O sistema contempla **3 tipos de solicitação** com fluxos diferenciados:

1. **NOVA CERTIFICAÇÃO** - Empresa nova (documento fiscal não cadastrado) → Fluxo Comercial
2. **MANUTENÇÃO** - Certificado existente (auditoria periódica) → Fluxo Operacional
3. **ADEQUAÇÃO** - Alteração em certificado existente → Fluxo Operacional

### 🌍 **Operação Internacional:**

O sistema opera em **3 países** com filiais próprias:
- 🇧🇷 **Brasil** - Documento: CNPJ/CPF - Moeda: BRL (R$)
- 🇨🇴 **Colômbia** - Documento: NIT/CC - Moeda: COP (COP$)
- 🇵🇾 **Paraguai** - Documento: RUC/CI - Moeda: PYG (₲)

**Nota:** Cada país possui suas próprias regulamentações e processos de certificação.

---

## 📊 Matriz de Decisão Inicial (Internacional)

```
┌──────────────────────────────────────────────────────────────┐
│           INÍCIO: Sistema identifica tipo de solicitação     │
│           🌍 Plataforma Multi-País (BR, CO, PY)              │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │ Seleciona País        │
                  │ 🇧🇷 BR  🇨🇴 CO  🇵🇾 PY │
                  └───────────────────────┘
                              │
                              ▼
                  ┌───────────────────────────┐
                  │ Documento Fiscal existe?  │
                  │ BR: CNPJ/CPF             │
                  │ CO: NIT/CC               │
                  │ PY: RUC/CI               │
                  └───────────────────────────┘
                    │              │
              NÃO   │              │ SIM
                    │              │
                    ▼              ▼
            ┌───────────┐   ┌──────────────────┐
            │   NOVA    │   │ Possui certifi-  │
            │CERTIFICAÇÃO│   │ cado ativo/      │
            └───────────┘   │ vencido neste    │
                 │          │ país?            │
                 │          └──────────────────┘
                 │               │          │
                 │         NÃO   │          │ SIM
                 │               │          │
                 │               ▼          ▼
                 │          ┌────────┐  ┌──────────────┐
                 │          │  NOVA  │  │ Tipo de      │
                 │          │CERTIF. │  │ solicitação? │
                 │          └────────┘  └──────────────┘
                 │                           │      │
                 │                           │      │
                 ▼                           ▼      ▼
        ┌────────────────┐        ┌──────────────┐ ┌──────────┐
        │ FLUXO COMERCIAL│        │ MANUTENÇÃO   │ │ADEQUAÇÃO │
        │ (Cliente Novo) │        │(Renovação/   │ │(Alteração│
        │ Qualquer país  │        │ Auditoria)   │ │ Escopo)  │
        └────────────────┘        └──────────────┘ └──────────┘
                                          │              │
                                          ▼              ▼
                                  ┌──────────────────────────┐
                                  │  FLUXO OPERACIONAL       │
                                  │  (Industrial/Frigorífico)│
                                  │  Por País + Filial       │
                                  └──────────────────────────┘
```

---

## 🆕 TIPO 1: NOVA CERTIFICAÇÃO (Cliente Novo)

### **Características:**
- ✅ Documento fiscal **NÃO** cadastrado no sistema (CNPJ/NIT/RUC)
- ✅ Empresa solicita certificação pela primeira vez
- ✅ Não possui contrato vigente neste país
- ✅ Passa obrigatoriamente pelo **Comercial**
- ✅ Processo completo: Comercial → Jurídico → Operacional

### **Fluxo Completo:**

```
╔═══════════════════════════════════════════════════════════════╗
║  TIPO: NOVA CERTIFICAÇÃO                                      ║
║  Empresa: NOVA (documento fiscal não cadastrado)              ║
║  País: BR 🇧🇷 / CO 🇨🇴 / PY 🇵🇾                                 ║
║  Responsável Inicial: COMERCIAL                               ║
╚═══════════════════════════════════════════════════════════════╝

1️⃣  CADASTRO DA EMPRESA + SOLICITAÇÃO
    │
    ├─ Empresa acessa portal (sem login)
    ├─ Seleciona país: Brasil, Colômbia ou Paraguai
    ├─ Informa documento fiscal:
    │  ├─ 🇧🇷 Brasil: CNPJ ou CPF
    │  ├─ 🇨🇴 Colômbia: NIT ou CC
    │  └─ 🇵🇾 Paraguai: RUC ou CI
    │
    ├─ Sistema valida documento:
    │  ├─ Verifica se já existe no país
    │  ├─ Valida dígitos verificadores
    │  └─ Formata automaticamente
    │
    ├─ Cria conta + cadastro da empresa
    ├─ Preenche wizard de 9 etapas:
    │  ├─ Dados da Empresa (documento, razão social, etc.)
    │  ├─ Classificação Industrial (GSO 2055-2)
    │  ├─ Produção (capacidade, turnos, distância)
    │  ├─ Tipo de Produto
    │  ├─ Ingredientes e Fornecedores
    │  ├─ Mercados de Exportação (países destino)
    │  ├─ Documentação (upload)
    │  └─ Revisão
    │
    └─ Submete solicitação
        │
        ▼ Status: rascunho → pendente
        ▼ RequestType: nova
        ▼ Country: BR/CO/PY
        ▼ Fase: cadastro_solicitacao

2️⃣  ANÁLISE INICIAL (ANALISTA)
    │
    ├─ Analista auto-atribuído
    ├─ Validação superficial de documentos
    ├─ Verifica viabilidade técnica
    └─ Aprova para proposta
        │
        ▼ Status: pendente → analise_aprovada
        ▼ Fase: analise_documental

3️⃣  ELABORAÇÃO DE PROPOSTA (COMERCIAL) ⭐
    │
    ├─ Comercial recebe notificação
    ├─ Sistema calcula proposta automática
    ├─ Comercial revisa e ajusta valores
    ├─ Gera PDF da proposta
    └─ Envia para cliente
        │
        ▼ Status: analise_aprovada → proposta_enviada
        ▼ Fase: elaboracao_proposta

4️⃣  NEGOCIAÇÃO E ACEITE (COMERCIAL + EMPRESA)
    │
    ├─ Empresa avalia proposta
    ├─ Comercial negocia (se necessário)
    └─ Empresa aceita proposta
        │
        ▼ Status: proposta_enviada → proposta_aprovada
        ▼ Fase: proposta_aprovada

5️⃣  ELABORAÇÃO DE CONTRATO (JURÍDICO)
    │
    ├─ Jurídico recebe notificação
    ├─ Sistema gera minuta de contrato
    ├─ Jurídico revisa cláusulas
    └─ Envia para assinatura
        │
        ▼ Status: proposta_aprovada → aguardando_assinatura
        ▼ Fase: elaboracao_contrato

6️⃣  ASSINATURA DE CONTRATO (JURÍDICO + EMPRESA)
    │
    ├─ Empresa assina contrato
    ├─ Certificadora assina contrato
    └─ Contrato arquivado
        │
        ▼ Status: aguardando_assinatura → contrato_assinado
        ▼ Fase: assinatura_contrato

7️⃣  PAGAMENTO DE TAXAS (FINANCEIRO + EMPRESA)
    │
    ├─ Sistema gera cobrança
    ├─ Empresa efetua pagamento
    └─ Pagamento confirmado
        │
        ▼ Status: contrato_assinado → pagamento_confirmado
        ▼ Fase: pagamento

8️⃣  [CONTINUA FLUXO PADRÃO...]
    │
    └─ Segue para Avaliação Detalhada → Auditoria → Certificação
```

---

## 🔄 TIPO 2: MANUTENÇÃO (Renovação/Auditoria Periódica)

### **Características:**
- ✅ CNPJ **JÁ** cadastrado
- ✅ Certificado existente (ativo ou próximo ao vencimento)
- ✅ Auditoria de vigilância/renovação (ciclo de 3 anos)
- ✅ **NÃO** passa pelo Comercial
- ✅ Vai direto para **Operacional** (Industrial ou Frigorífico)

### **Ciclo de Manutenção (3 anos):**

```
Ano 1: Certificação Inicial (Nova)
  └─ Auditoria de Certificação (Estágio 1 + 2)

Ano 2: MANUTENÇÃO 1 (Auditoria de Vigilância)
  └─ Auditoria anunciada ou não anunciada
  └─ Verifica se processos continuam conformes

Ano 3: MANUTENÇÃO 2 (Auditoria de Vigilância)
  └─ Auditoria anunciada ou não anunciada
  └─ Verifica conformidade antes da renovação

Ano 4: RENOVAÇÃO (Recertificação)
  └─ Auditoria completa de renovação
  └─ Novo certificado por mais 3 anos
```

### **Fluxo de Manutenção:**

```
╔═══════════════════════════════════════════════════════════════╗
║  TIPO: MANUTENÇÃO                                             ║
║  Empresa: EXISTENTE (com certificado ativo/vencido)           ║
║  Responsável Inicial: OPERACIONAL (Industrial/Frigorífico)    ║
╚═══════════════════════════════════════════════════════════════╝

0️⃣  GATILHO AUTOMÁTICO DO SISTEMA
    │
    ├─ Sistema monitora certificados ativos
    ├─ 90 dias antes do vencimento:
    │  └─ Envia email para empresa
    │  └─ Envia notificação para equipe interna
    │
    ├─ A cada 15 dias (sem resposta):
    │  └─ Sistema reenvia cobrança automática
    │  └─ Notifica equipe comercial (acompanhamento)
    │
    └─ Empresa inicia solicitação de manutenção/renovação
        │
        ▼ RequestType: renovacao (ou manutenção)
        ▼ Fase: cadastro_solicitacao

1️⃣  SOLICITAÇÃO DE MANUTENÇÃO
    │
    ├─ Empresa loga no portal
    ├─ Sistema identifica: CNPJ existe + Certificado ativo
    ├─ Apresenta wizard SIMPLIFICADO:
    │  ├─ Confirma dados da empresa (pré-preenchidos)
    │  ├─ Atualiza informações de produção (se houver mudanças)
    │  ├─ Atualiza ingredientes/fornecedores (se houver mudanças)
    │  ├─ Atualiza documentação (documentos novos/vencidos)
    │  └─ Declara mudanças desde última auditoria
    │
    └─ Submete solicitação
        │
        ▼ Status: rascunho → pendente
        ▼ Fase: cadastro_solicitacao

2️⃣  ROTEAMENTO AUTOMÁTICO (SISTEMA)
    │
    ├─ Sistema identifica tipo de certificado:
    │  │
    │  ├─ Certificação Industrial (C1, C2, C3, C4, C5)?
    │  │  └─ Roteia para: DEPARTAMENTO INDUSTRIAL
    │  │
    │  └─ Certificação Frigorífica (Carnes, Aves)?
    │     └─ Roteia para: DEPARTAMENTO FRIGORÍFICO
    │
    └─ Processo atribuído ao departamento correto
        │
        ▼ Status: pendente → em_analise_operacional
        ▼ Fase: analise_operacional

3️⃣  ANÁLISE OPERACIONAL (ANALISTA OPERACIONAL)
    │
    ├─ Analista do departamento específico analisa:
    │  ├─ Histórico do certificado anterior
    │  ├─ Não conformidades anteriores (se houver)
    │  ├─ Mudanças declaradas
    │  ├─ Documentos atualizados
    │  └─ Riscos identificados
    │
    ├─ Solicita documentos complementares (se necessário)
    └─ Aprova para agendamento de auditoria
        │
        ▼ Status: em_analise_operacional → aprovado_para_auditoria
        ▼ Fase: analise_operacional

4️⃣  AGENDAMENTO DE AUDITORIA (GESTOR DE AUDITORIA)
    │
    ├─ NÃO há proposta comercial (cliente já tem contrato)
    ├─ NÃO há novo contrato (usa contrato de renovação padrão)
    ├─ Pagamento: taxa de manutenção (menor que certificação inicial)
    │
    └─ Agenda auditoria de vigilância/renovação
        │
        ▼ Status: aprovado_para_auditoria → auditoria_agendada
        ▼ Fase: auditoria_agendada

5️⃣  AUDITORIA DE MANUTENÇÃO (AUDITOR)
    │
    ├─ Tipo de auditoria:
    │  ├─ Manutenção 1 (Ano 2): Vigilância
    │  ├─ Manutenção 2 (Ano 3): Vigilância
    │  └─ Renovação (Ano 4): Recertificação completa
    │
    ├─ Auditoria pode ser:
    │  ├─ Anunciada (data agendada com antecedência)
    │  └─ Não anunciada (surpresa - maior rigor)
    │
    ├─ Foco em:
    │  ├─ Verificar se processos continuam conformes
    │  ├─ Validar mudanças declaradas
    │  ├─ Identificar novas NC (se houver)
    │  └─ Atualizar documentação
    │
    └─ Elabora relatório de auditoria
        │
        ▼ Status: em_auditoria → auditoria_concluida
        ▼ Fase: auditoria_realizada

6️⃣  CORREÇÃO DE NC (se houver)
    │
    └─ Mesmo fluxo de correção de NC do processo padrão

7️⃣  VALIDAÇÃO E COMITÊ TÉCNICO
    │
    └─ Segue fluxo padrão de validação e decisão

8️⃣  RESULTADO:
    │
    ├─ Aprovado → Certificado mantido/renovado
    ├─ Reprovado → Certificado suspenso/cancelado
    └─ Solicitar informações → Empresa complementa
```

### **Diferenças Importantes:**

| Aspecto | Nova Certificação | Manutenção |
|---------|-------------------|------------|
| Wizard | 9 etapas completas | Simplificado (atualização) |
| Comercial | ✅ SIM - Elabora proposta | ❌ NÃO - Pula etapa |
| Jurídico | ✅ SIM - Novo contrato | ❌ NÃO - Usa renovação padrão |
| Proposta | Cálculo completo | Taxa fixa de manutenção |
| Departamento | Analista Geral | Operacional (Industrial/Frigorífico) |
| Auditoria | Estágio 1 + Estágio 2 completo | Vigilância (simplificada) ou Renovação |
| Prazo | 90-120 dias | 30-60 dias |

---

## 🔧 TIPO 3: ADEQUAÇÃO (Alteração de Certificado)

### **Características:**
- ✅ CNPJ **JÁ** cadastrado
- ✅ Certificado ativo
- ✅ Alteração no escopo ou processo
- ✅ **NÃO** passa pelo Comercial
- ✅ Vai direto para **Operacional** (Industrial ou Frigorífico)

### **Casos de Adequação:**

1. **Adição de Produtos ao Escopo**
   - Empresa quer certificar novos produtos
   - Usa mesma certificação existente

2. **Mudança de Ingredientes**
   - Troca de fornecedores
   - Alteração de matérias-primas

3. **Mudança de Processo Produtivo**
   - Nova linha de produção
   - Alteração de fluxo de fabricação

4. **Mudança de Instalações**
   - Nova unidade fabril
   - Ampliação de instalações

5. **Mudança de Mercados**
   - Adicionar novos países de exportação

### **Fluxo de Adequação:**

```
╔═══════════════════════════════════════════════════════════════╗
║  TIPO: ADEQUAÇÃO                                              ║
║  Empresa: EXISTENTE (com certificado ativo)                   ║
║  Responsável Inicial: OPERACIONAL (Industrial/Frigorífico)    ║
╚═══════════════════════════════════════════════════════════════╝

1️⃣  SOLICITAÇÃO DE ADEQUAÇÃO
    │
    ├─ Empresa loga no portal
    ├─ Acessa certificado ativo
    ├─ Clica "Solicitar Adequação"
    ├─ Preenche wizard ESPECÍFICO:
    │  ├─ Tipo de adequação
    │  ├─ Descrição das mudanças
    │  ├─ Novos documentos (se aplicável)
    │  ├─ Justificativa
    │  └─ Impacto na produção
    │
    └─ Submete solicitação
        │
        ▼ RequestType: adequacao (ou ampliacao)
        ▼ Fase: cadastro_solicitacao

2️⃣  ROTEAMENTO AUTOMÁTICO (SISTEMA)
    │
    ├─ Sistema roteia para departamento do certificado original:
    │  ├─ Industrial → DEPARTAMENTO INDUSTRIAL
    │  └─ Frigorífico → DEPARTAMENTO FRIGORÍFICO
    │
    └─ Processo atribuído
        │
        ▼ Status: pendente → em_analise_operacional
        ▼ Fase: analise_operacional

3️⃣  ANÁLISE DE IMPACTO (ANALISTA OPERACIONAL)
    │
    ├─ Analista avalia impacto das mudanças:
    │  ├─ Impacto BAIXO → Aprovação documental
    │  ├─ Impacto MÉDIO → Auditoria parcial
    │  └─ Impacto ALTO → Auditoria completa
    │
    ├─ Define escopo da adequação
    └─ Aprova ou solicita mais informações
        │
        ▼ Status: em_analise_operacional → analise_aprovada
        ▼ Fase: analise_operacional

4️⃣  DECISÃO DE FLUXO (ANALISTA)
    │
    ┌──────────────────────────────────────┐
    │ Qual o nível de impacto?             │
    └──────────────────────────────────────┘
         │            │            │
         │ BAIXO      │ MÉDIO      │ ALTO
         │            │            │
         ▼            ▼            ▼
    ┌────────┐  ┌──────────┐  ┌────────────┐
    │Aprovação│  │Auditoria │  │ Auditoria  │
    │Documental│  │ Parcial  │  │  Completa  │
    └────────┘  └──────────┘  └────────────┘
         │            │            │
         ▼            ▼            ▼

5️⃣  APROVAÇÃO DOCUMENTAL (Impacto Baixo)
    │
    ├─ Analista valida documentos
    ├─ Aprova adequação sem auditoria
    └─ Atualiza certificado
        │
        ▼ Status: analise_aprovada → adequacao_aprovada
        ▼ Fase: adequacao_documental
        ▼ Certificado: Atualizado com novo escopo

6️⃣  AUDITORIA PARCIAL (Impacto Médio)
    │
    ├─ Auditor visita APENAS áreas impactadas
    ├─ Valida mudanças específicas
    ├─ Não revisa todo o processo
    └─ Elabora relatório focado
        │
        ▼ Status: analise_aprovada → em_auditoria_parcial → adequacao_aprovada
        ▼ Fase: auditoria_parcial

7️⃣  AUDITORIA COMPLETA (Impacto Alto)
    │
    ├─ Segue fluxo padrão de auditoria
    └─ Reavalia todo o processo de certificação
        │
        ▼ Segue fluxo completo de auditoria → Certificado atualizado

8️⃣  ATUALIZAÇÃO DE CERTIFICADO
    │
    ├─ Sistema atualiza certificado existente:
    │  ├─ Adiciona novos produtos ao escopo
    │  ├─ Atualiza lista de ingredientes
    │  ├─ Atualiza documentação
    │  └─ Mantém validade original
    │
    ├─ Gera addendum ao certificado (anexo)
    └─ Notifica empresa
        │
        ▼ Status: adequacao_aprovada → certificado_atualizado
        ▼ Certificado: Versão atualizada emitida
```

### **Diferenças Importantes:**

| Aspecto | Nova Certificação | Adequação |
|---------|-------------------|-----------|
| Wizard | 9 etapas completas | Focado nas mudanças |
| Comercial | ✅ SIM | ❌ NÃO (pode ter taxa de adequação) |
| Jurídico | ✅ SIM | ❌ NÃO (addendum ao contrato) |
| Auditoria | Completa (Estágio 1+2) | Variável (nenhuma, parcial ou completa) |
| Certificado | Novo certificado | Atualização do certificado existente |
| Prazo | 90-120 dias | 15-60 dias (depende do impacto) |

---

## 🤖 Sistema de Notificações Automáticas

### **Para Renovação de Certificados:**

```typescript
// Job automático executado diariamente
cron.schedule('0 8 * * *', async () => {
  // Buscar certificados próximos ao vencimento
  const certificatesExpiringSoon = await prisma.certificate.findMany({
    where: {
      status: 'ativo',
      expiresAt: {
        lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 dias
        gte: new Date(), // Ainda não vencido
      },
    },
    include: {
      process: {
        include: {
          request: {
            include: { company: { include: { user: true } } },
          },
        },
      },
    },
  });

  for (const cert of certificatesExpiringSoon) {
    const daysToExpire = Math.ceil(
      (cert.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    // Primeiro contato: 90 dias
    if (daysToExpire === 90) {
      await sendRenewalNotification(cert, 'primeiro_contato');
    }

    // Lembretes a cada 15 dias
    if ([75, 60, 45, 30, 15].includes(daysToExpire)) {
      await sendRenewalReminder(cert, daysToExpire);
    }

    // Alerta crítico: 7 dias
    if (daysToExpire === 7) {
      await sendRenewalUrgentAlert(cert);
    }
  }
});

async function sendRenewalNotification(certificate, type) {
  const company = certificate.process.request.company;

  // Email para empresa
  await emailService.send({
    to: company.user.email,
    subject: 'Renovação de Certificado Halal - Ação Necessária',
    template: 'renewal-notification',
    data: {
      companyName: company.razaoSocial,
      certificateNumber: certificate.certificateNumber,
      expiresAt: certificate.expiresAt,
      daysRemaining: Math.ceil(
        (certificate.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ),
      renewalLink: `${process.env.FRONTEND_URL}/certificados/${certificate.id}/renovar`,
    },
  });

  // Notificação interna para equipe operacional
  await notificationService.notify({
    users: await getOperationalTeam(certificate.certificationType),
    type: 'certificado_vencendo',
    title: 'Certificado próximo ao vencimento',
    message: `Certificado ${certificate.certificateNumber} vence em ${daysRemaining} dias`,
    link: `/admin/certificados/${certificate.id}`,
  });
}
```

---

## 📋 Atualização do Modelo de Dados

### **RequestType (Atualizado):**

```prisma
enum RequestType {
  nova                // Nova certificação (cliente novo)
  renovacao           // Renovação de certificado (após 3 anos)
  manutencao_1        // Manutenção ano 2 (vigilância)
  manutencao_2        // Manutenção ano 3 (vigilância)
  adequacao           // Alteração em certificado ativo
  ampliacao           // Ampliação de escopo (novos produtos)
}
```

### **Novos Campos no Request:**

```prisma
model Request {
  // ... campos existentes ...

  requestType          RequestType       @map("request_type")

  // [NOVO] Para adequação/manutenção
  parentCertificateId  String?           @map("parent_certificate_id") @db.Uuid
  parentCertificate    Certificate?      @relation("CertificateUpdates", fields: [parentCertificateId], references: [id])

  // [NOVO] Para adequação
  changeDescription    String?           @map("change_description") @db.Text
  changeImpact         ChangeImpact?     @map("change_impact")

  // [NOVO] Roteamento
  assignedDepartment   OperationalDept?  @map("assigned_department")
}

enum ChangeImpact {
  baixo   // Aprovação documental
  medio   // Auditoria parcial
  alto    // Auditoria completa
}

enum OperationalDept {
  industrial    // C1, C2, C3, C4, C5
  frigorifico   // Carnes, aves, pescados
  comercial     // Nova certificação apenas
}
```

### **Relação com Certificate:**

```prisma
model Certificate {
  // ... campos existentes ...

  // [NOVO] Histórico de adequações
  updates              Request[]  @relation("CertificateUpdates")

  // [NOVO] Tipo de certificado (para roteamento)
  departmentType       OperationalDept @map("department_type")
}
```

---

## 🎯 Resumo dos Fluxos

| Tipo | Cliente | Departamento Inicial | Comercial | Jurídico | Auditoria | Prazo |
|------|---------|---------------------|-----------|----------|-----------|-------|
| **Nova** | Novo (CNPJ novo) | Comercial | ✅ SIM | ✅ SIM | Completa (E1+E2) | 90-120d |
| **Manutenção** | Existente (certificado ativo) | Operacional | ❌ NÃO | ❌ NÃO | Vigilância | 30-60d |
| **Adequação** | Existente (certificado ativo) | Operacional | ❌ NÃO | ❌ NÃO | Variável | 15-60d |

---

## 🔄 Interface do Sistema

### **Tela de Solicitação (Empresa):**

```typescript
// Quando empresa acessa portal
export function NewRequestPage() {
  const { user, company } = useAuth();
  const [requestType, setRequestType] = useState<RequestType | null>(null);

  useEffect(() => {
    // Sistema identifica automaticamente
    if (!company) {
      // Empresa nova - cadastro obrigatório
      setRequestType('nova');
    } else {
      // Empresa existente - apresenta opções
      showRequestTypeSelector();
    }
  }, [company]);

  function showRequestTypeSelector() {
    return (
      <div>
        <h2>Qual tipo de solicitação você deseja fazer?</h2>

        <Card onClick={() => setRequestType('nova')}>
          <h3>Nova Certificação</h3>
          <p>Solicitar certificação de um novo produto/processo</p>
        </Card>

        <Card onClick={() => setRequestType('renovacao')}>
          <h3>Renovação de Certificado</h3>
          <p>Renovar certificado que está vencendo</p>
          {/* Mostra certificados próximos ao vencimento */}
        </Card>

        <Card onClick={() => setRequestType('adequacao')}>
          <h3>Adequação de Certificado</h3>
          <p>Alterar escopo ou processo de certificado ativo</p>
          {/* Mostra certificados ativos */}
        </Card>
      </div>
    );
  }

  // Wizard diferente conforme o tipo
  return (
    <>
      {requestType === 'nova' && <NovaManagementRequest />}
      {requestType === 'renovacao' && <RenovacaoWizard />}
      {requestType === 'adequacao' && <AdequacaoWizard />}
    </>
  );
}
```

---

**Elaborado por**: Claude Code (Assistente de IA)
**Data**: 08 de Dezembro de 2025
**Versão**: 4.0
**Status**: 📐 Fluxos Diferenciados por Tipo de Solicitação
