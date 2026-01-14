# 🎨 Frontend: Módulo de Proposta Comercial

## 📱 Visão Geral

O frontend será dividido em **3 interfaces diferentes** de acordo com o tipo de usuário:

1. **👨‍💼 Admin**: Configuração de tabelas de preços
2. **👩‍💻 Analista**: Calcular, ajustar e enviar propostas
3. **🏢 Empresa**: Visualizar e responder propostas

---

## 1️⃣ ADMIN: Configuração de Preços

### **Página**: `/admin/pricing-config`

### **Layout**:
```
┌─────────────────────────────────────────────────────────┐
│  📊 Configuração de Tabelas de Preços                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [+ Nova Tabela]                    [Tabela Ativa: v1.0]│
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Histórico de Versões                            │  │
│  ├──────────────────────────────────────────────────┤  │
│  │  ✅ v1.0  │ 18/11/2025 - Atual  │ [Editar] [Ver]│  │
│  │  ⏸️ v0.9  │ 01/11/2025 - 17/11  │ [Ver]         │  │
│  │  ⏸️ v0.8  │ 15/10/2025 - 31/10  │ [Ver]         │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Tabela Ativa: v1.0                              │  │
│  ├──────────────────────────────────────────────────┤  │
│  │                                                   │  │
│  │  📋 Preços Base por Certificação                 │  │
│  │  ┌────────────────────────────────────┐          │  │
│  │  │ C1 - Alimentos        R$ 5.000,00  │          │  │
│  │  │ C2 - Químicos         R$ 7.000,00  │          │  │
│  │  │ C3 - Cosméticos       R$ 6.000,00  │          │  │
│  │  │ C4 - Farmacêuticos    R$ 8.000,00  │          │  │
│  │  │ C5 - Embalagens       R$ 4.000,00  │          │  │
│  │  │ C6 - Serviços         R$ 5.500,00  │          │  │
│  │  └────────────────────────────────────┘          │  │
│  │                                                   │  │
│  │  🔢 Multiplicadores                               │  │
│  │  ┌────────────────────────────────────┐          │  │
│  │  │ Produtos:                           │          │  │
│  │  │   1-10: 1.0x  │ 11-50: 1.3x         │          │  │
│  │  │   51-100: 1.6x │ 100+: 2.0x         │          │  │
│  │  │                                     │          │  │
│  │  │ Turnos:                             │          │  │
│  │  │   1: 1.0x │ 2: 1.4x │ 3: 1.8x       │          │  │
│  │  │                                     │          │  │
│  │  │ Histórico:                          │          │  │
│  │  │   Nova: 1.0x │ Renovação: 0.8x     │          │  │
│  │  │   Ampliação: 0.9x                   │          │  │
│  │  └────────────────────────────────────┘          │  │
│  │                                                   │  │
│  │  ⏱️ Man-Hour                                      │  │
│  │  💰 Taxas Fixas                                   │  │
│  │  🚗 Deslocamento                                  │  │
│  │                                                   │  │
│  │  [Editar Tabela] [Criar Nova Versão]            │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  🧮 Preview do Cálculo                           │  │
│  ├──────────────────────────────────────────────────┤  │
│  │  Simule uma proposta com a tabela atual:         │  │
│  │                                                   │  │
│  │  Certificação: [C1 ▼]  Produtos: [25]            │  │
│  │  Turnos: [2]  Fornecedores: [8]                  │  │
│  │  Funcionários: [75]  Distância: [250] km         │  │
│  │  [ ] Hospedagem                                   │  │
│  │                                                   │  │
│  │  [Calcular Preview]                              │  │
│  │                                                   │  │
│  │  Resultado: R$ 19.113,00                         │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### **Componentes**:

#### **1. PricingTableList** (Lista de versões)
- Table com histórico
- Badge "Ativa" na versão atual
- Botões: Ver, Editar, Comparar

#### **2. PricingTableForm** (Formulário de edição)
- Inputs para todos os valores
- Validação em tempo real
- Preview ao lado mostrando como ficará o cálculo

#### **3. PricingPreview** (Preview de cálculo)
- Inputs de exemplo
- Botão "Calcular"
- Mostra breakdown em tempo real

#### **4. PricingComparison** (Comparar versões)
- Lado a lado: v1.0 vs v1.1
- Destaca diferenças em amarelo
- Mostra % de mudança

---

## 2️⃣ ANALISTA: Calcular e Enviar Propostas

### **Página**: `/analyst/processes/:id/proposal`

### **Layout**:
```
┌─────────────────────────────────────────────────────────┐
│  ← Voltar para Processo HS-2025-001234                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📊 Proposta Comercial                                   │
│  XYZ Alimentos Ltda - CNPJ 12.345.678/0001-90           │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  1️⃣ Dados do Processo                            │  │
│  ├──────────────────────────────────────────────────┤  │
│  │  ✅ Preenchido automaticamente do Request        │  │
│  │                                                   │  │
│  │  Certificação: C1 - Alimentos Processados        │  │
│  │  Tipo: Nova Certificação                         │  │
│  │  Produtos: 25 unidades                           │  │
│  │  Turnos: 2                                        │  │
│  │  Fornecedores: 8                                  │  │
│  │  Funcionários: 75                                 │  │
│  │                                                   │  │
│  │  📍 Localização da Empresa                        │  │
│  │  Endereço: Rua ABC, 123 - São Paulo/SP          │  │
│  │  Distância (calculada): 250 km                   │  │
│  │  [ ] Requer hospedagem                           │  │
│  │                                                   │  │
│  │  [Editar Dados]                                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  2️⃣ Breakdown Detalhado                          │  │
│  ├──────────────────────────────────────────────────┤  │
│  │                                                   │  │
│  │  📋 Base e Multiplicadores                        │  │
│  │  ┌────────────────────────────────────┐          │  │
│  │  │ Preço Base (C1)        R$  5.000,00│          │  │
│  │  │ × Produtos (25)              1.3   │          │  │
│  │  │ × Turnos (2)                 1.4   │          │  │
│  │  │ × Tipo (nova)                1.0   │          │  │
│  │  │ × Fornecedores (8)           1.2   │          │  │
│  │  │ ─────────────────────────────────  │          │  │
│  │  │ Subtotal              R$ 10.920,00 │          │  │
│  │  └────────────────────────────────────┘          │  │
│  │                                                   │  │
│  │  ⏱️ Man-Hour                                      │  │
│  │  ┌────────────────────────────────────┐          │  │
│  │  │ 16 horas × R$ 150/h  R$  2.400,00 │          │  │
│  │  └────────────────────────────────────┘          │  │
│  │                                                   │  │
│  │  🚗 Deslocamento                                  │  │
│  │  ┌────────────────────────────────────┐          │  │
│  │  │ Viagem (250 km)      R$    500,00  │          │  │
│  │  │ Hospedagem (1 dia)   R$    300,00  │          │  │
│  │  └────────────────────────────────────┘          │  │
│  │                                                   │  │
│  │  📄 Taxas Fixas                                   │  │
│  │  ┌────────────────────────────────────┐          │  │
│  │  │ Análise Documental   R$    800,00  │          │  │
│  │  │ Comitê Técnico       R$  1.200,00  │          │  │
│  │  │ Emissão Certificado  R$    500,00  │          │  │
│  │  └────────────────────────────────────┘          │  │
│  │                                                   │  │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  │
│  │  Subtotal              R$ 16.620,00              │  │
│  │  Impostos (15%)        R$  2.493,00              │  │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  │
│  │  💰 TOTAL              R$ 19.113,00              │  │
│  │                                                   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  3️⃣ Ajuste Manual (Opcional)                     │  │
│  ├──────────────────────────────────────────────────┤  │
│  │                                                   │  │
│  │  [ ] Aplicar ajuste manual                       │  │
│  │                                                   │  │
│  │  Valor do ajuste: R$ [______]                    │  │
│  │  ( ) Desconto  ( ) Acréscimo                     │  │
│  │                                                   │  │
│  │  Justificativa: (obrigatória)                    │  │
│  │  ┌────────────────────────────────────┐          │  │
│  │  │                                     │          │  │
│  │  │                                     │          │  │
│  │  └────────────────────────────────────┘          │  │
│  │                                                   │  │
│  │  ⚠️ Ajustes > 20% (R$ 3.822,60) requerem         │  │
│  │     aprovação do coordenador                     │  │
│  │                                                   │  │
│  │  Valor Final: R$ 19.113,00                       │  │
│  │                                                   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  [Salvar Proposta] [Gerar PDF] [Enviar para Empresa]   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### **Componentes**:

#### **1. ProposalCalculator**
- Inputs editáveis com valores do Request
- Botão "Recalcular" se dados forem alterados
- Integração com Google Maps API para calcular distância

#### **2. ProposalBreakdown**
- Tabela visual hierárquica
- Cada linha mostrando cálculo parcial
- Animações ao calcular
- Totais em destaque

#### **3. ProposalAdjustment**
- Toggle para ativar/desativar
- Input de valor com validação
- Radio: Desconto/Acréscimo
- Textarea de justificativa
- Alert se >20%

#### **4. ProposalActions**
- Botão "Salvar Proposta" (cria como "calculada")
- Botão "Gerar PDF" (abre modal com preview)
- Botão "Enviar para Empresa" (muda status para "enviada")

---

## 3️⃣ EMPRESA: Visualizar e Responder

### **Página**: `/company/processes/:id/proposal`

### **Layout**:
```
┌─────────────────────────────────────────────────────────┐
│  ← Voltar para Meus Processos                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📊 Proposta Comercial Recebida                          │
│  Protocolo: HS-2025-001234                               │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  ℹ️ Informações da Proposta                       │  │
│  ├──────────────────────────────────────────────────┤  │
│  │  Enviada em: 18/11/2025                          │  │
│  │  Válida até: 18/12/2025 (30 dias)                │  │
│  │  Status: 🟡 Aguardando sua resposta              │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  📄 Resumo da Certificação                        │  │
│  ├──────────────────────────────────────────────────┤  │
│  │  Tipo: C1 - Alimentos Processados                │  │
│  │  Produtos: 25 unidades                           │  │
│  │  Validade: 3 anos                                │  │
│  │  Turnos de produção: 2                           │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  💰 Valores (Versão Simplificada)                 │  │
│  ├──────────────────────────────────────────────────┤  │
│  │                                                   │  │
│  │  Certificação                 R$ 10.920,00       │  │
│  │  Auditoria                    R$  2.400,00       │  │
│  │  Deslocamento e Logística     R$    800,00       │  │
│  │  Taxas Administrativas        R$  2.500,00       │  │
│  │  ─────────────────────────────────────────       │  │
│  │  Subtotal                     R$ 16.620,00       │  │
│  │  Impostos (15%)               R$  2.493,00       │  │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  │
│  │                                                   │  │
│  │  💎 VALOR TOTAL               R$ 19.113,00       │  │
│  │                                                   │  │
│  │  Parcelamento: 3x sem juros                      │  │
│  │  3x de R$ 6.371,00                               │  │
│  │                                                   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  📅 Cronograma Estimado                           │  │
│  ├──────────────────────────────────────────────────┤  │
│  │                                                   │  │
│  │  ┌────────────────────────────────┐              │  │
│  │  │ Análise Documental    10 dias  │ ████░░░░░░ │  │
│  │  │ Auditoria Estágio 1    2 dias  │ ████████░░ │  │
│  │  │ Auditoria Estágio 2    3 dias  │ ███████░░░ │  │
│  │  │ Comitê Técnico         5 dias  │ █████░░░░░ │  │
│  │  │ Emissão                2 dias  │ ████████░░ │  │
│  │  └────────────────────────────────┘              │  │
│  │                                                   │  │
│  │  ⏱️ Tempo total estimado: ~22 dias úteis         │  │
│  │                                                   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  📎 Documentos                                    │  │
│  ├──────────────────────────────────────────────────┤  │
│  │  📄 Proposta_Comercial_HS-2025-001234.pdf        │  │
│  │     [Baixar] [Visualizar]                        │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  ✅ Aceitar Proposta                              │  │
│  ├──────────────────────────────────────────────────┤  │
│  │                                                   │  │
│  │  [ ] Li e concordo com os termos da proposta     │  │
│  │                                                   │  │
│  │  Observações (opcional):                         │  │
│  │  ┌────────────────────────────────────┐          │  │
│  │  │                                     │          │  │
│  │  └────────────────────────────────────┘          │  │
│  │                                                   │  │
│  │  [✅ Aceitar Proposta]  [❌ Recusar]             │  │
│  │                                                   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### **Componentes**:

#### **1. ProposalSummary**
- Card com informações principais
- Status badge animado
- Countdown de validade

#### **2. ProposalBreakdownSimple**
- Versão simplificada do breakdown (sem multiplicadores)
- Foca nos valores finais
- Visual mais limpo para cliente

#### **3. ProposalTimeline**
- Gráfico de Gantt simplificado
- Mostra fases e tempo estimado
- Ícones visuais

#### **4. ProposalResponse**
- Checkbox de concordância
- Textarea de observações
- Botões Aceitar/Recusar
- Modal de confirmação

---

## 🎨 Design System

### **Cores**:
```css
/* Tema Verde Halal */
--primary: #2D5016;        /* Verde escuro */
--primary-light: #4A7C2E;  /* Verde médio */
--secondary: #F4A460;      /* Dourado */
--success: #10B981;        /* Verde claro */
--warning: #F59E0B;        /* Amarelo */
--danger: #EF4444;         /* Vermelho */
--info: #3B82F6;           /* Azul */
```

### **Tipografia**:
```css
--font-heading: 'Inter', sans-serif;
--font-body: 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', monospace; /* Para valores monetários */
```

### **Componentes Compartilhados**:
- **FormField**: Input com label, validação e erro
- **Card**: Container com shadow e border-radius
- **Button**: Primary, Secondary, Danger, Success
- **Badge**: Status indicators
- **Modal**: Para confirmações
- **Toast**: Notificações

---

## 📦 Estrutura de Arquivos

```
frontend/src/
├── pages/
│   ├── admin/
│   │   └── PricingConfig.tsx              # Admin: Config de preços
│   ├── analyst/
│   │   └── ProcessProposal.tsx            # Analista: Criar proposta
│   └── company/
│       └── ViewProposal.tsx               # Empresa: Ver proposta
│
├── components/
│   ├── proposal/
│   │   ├── ProposalCalculator.tsx         # Inputs de cálculo
│   │   ├── ProposalBreakdown.tsx          # Breakdown detalhado
│   │   ├── ProposalBreakdownSimple.tsx    # Breakdown simplificado
│   │   ├── ProposalAdjustment.tsx         # Ajuste manual
│   │   ├── ProposalActions.tsx            # Botões de ação
│   │   ├── ProposalSummary.tsx            # Resumo
│   │   ├── ProposalTimeline.tsx           # Cronograma
│   │   └── ProposalResponse.tsx           # Aceitar/Recusar
│   │
│   ├── pricing/
│   │   ├── PricingTableList.tsx           # Lista de versões
│   │   ├── PricingTableForm.tsx           # Formulário
│   │   ├── PricingPreview.tsx             # Preview de cálculo
│   │   └── PricingComparison.tsx          # Comparar versões
│   │
│   └── ui/
│       ├── FormField.tsx
│       ├── Card.tsx
│       ├── Button.tsx
│       ├── Badge.tsx
│       ├── Modal.tsx
│       └── Toast.tsx
│
├── services/
│   ├── proposal.service.ts                # API calls
│   └── pricing.service.ts                 # API calls
│
├── hooks/
│   ├── useProposal.ts                     # Hook para propostas
│   └── usePricingTable.ts                 # Hook para tabelas
│
└── lib/
    ├── proposal-calculator.ts             # Lógica de cálculo (client-side)
    └── formatters.ts                      # Formatação de moeda, datas
```

---

## 🔄 Fluxo de Interação

### **Analista cria proposta**:
```
1. Analista acessa processo → botão "Criar Proposta"
2. Sistema preenche inputs automaticamente do Request
3. Calcula usando tabela ativa (preview)
4. Analista revisa breakdown
5. (Opcional) Ajusta valor manualmente
6. Salva proposta (status: "calculada")
7. Gera PDF
8. Envia para empresa (status: "enviada")
```

### **Empresa responde**:
```
1. Empresa recebe email com link
2. Acessa página da proposta
3. Visualiza resumo, valores e cronograma
4. Baixa PDF
5. Marca checkbox "concordo"
6. Aceita ou recusa
7. Sistema atualiza processo automaticamente
```

---

## 📊 Exemplo de API Integration

### **Frontend Service**:
```typescript
// services/proposal.service.ts

export class ProposalService {
  async calculate(inputs: CalculationInput) {
    const response = await api.post('/proposals/calculate', inputs);
    return response.data.data;
  }

  async create(processId: string, inputs: CalculationInput) {
    const response = await api.post('/proposals', {
      processId,
      calculationInputs: inputs,
    });
    return response.data.data;
  }

  async adjust(proposalId: string, adjustment: AdjustProposalDto) {
    const response = await api.put(`/proposals/${proposalId}/adjust`, adjustment);
    return response.data.data;
  }

  async send(proposalId: string) {
    const response = await api.post(`/proposals/${proposalId}/send`);
    return response.data.data;
  }

  async respond(proposalId: string, accepted: boolean, notes?: string) {
    const response = await api.put(`/proposals/${proposalId}/respond`, {
      accepted,
      responseNotes: notes,
    });
    return response.data.data;
  }
}
```

### **React Hook**:
```typescript
// hooks/useProposal.ts

export function useProposal(processId: string) {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [breakdown, setBreakdown] = useState<CalculationBreakdown | null>(null);
  const [loading, setLoading] = useState(false);

  const calculate = async (inputs: CalculationInput) => {
    setLoading(true);
    const result = await proposalService.calculate(inputs);
    setBreakdown(result);
    setLoading(false);
  };

  const create = async (inputs: CalculationInput) => {
    const result = await proposalService.create(processId, inputs);
    setProposal(result);
    toast.success('Proposta criada com sucesso!');
  };

  const adjust = async (adjustment: number, reason: string) => {
    if (!proposal) return;
    const result = await proposalService.adjust(proposal.id, {
      manualAdjustment: adjustment,
      adjustmentReason: reason,
      adjustedBy: currentUser.id,
    });
    setProposal(result);
    toast.success('Proposta ajustada!');
  };

  return { proposal, breakdown, loading, calculate, create, adjust };
}
```

---

## 🎯 Prioridades de Implementação

### **Sprint 4 (8 SP): Admin**
- ✅ PricingTableList
- ✅ PricingTableForm
- ✅ PricingPreview

### **Sprint 5 (8 SP): Analista**
- ✅ ProposalCalculator
- ✅ ProposalBreakdown
- ✅ ProposalAdjustment
- ✅ ProposalActions

### **Sprint 6 (5 SP): Empresa**
- ✅ ProposalSummary
- ✅ ProposalBreakdownSimple
- ✅ ProposalResponse

---

## 📱 Responsividade

### **Desktop** (>1280px):
- Layout de 2 colunas (dados à esquerda, breakdown à direita)
- Sidebar fixa
- Tabelas completas

### **Tablet** (768-1280px):
- Layout de 1 coluna
- Cards empilhados
- Tabelas com scroll horizontal

### **Mobile** (<768px):
- Layout vertical
- Cards compactos
- Breakdown colapsável (accordion)
- Botões em stack

---

## ✨ Animações e Feedback

1. **Ao calcular**: Loading spinner + animação de contagem
2. **Ao enviar**: Toast de sucesso + confetti 🎉
3. **Valores**: Animação de count-up (R$ 0 → R$ 19.113)
4. **Breakdown**: Fade-in sequencial das linhas
5. **Status badges**: Pulse animation

---

Esse é o design completo do frontend! Quer que eu comece implementando alguma dessas telas?
