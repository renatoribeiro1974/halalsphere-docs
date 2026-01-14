# Jornada do Cliente - Wizard de Solicitação

**9 Etapas | Auto-save | Chat IA Embarcado | 85% Taxa de Conclusão**

---

## 4. Jornada do Cliente - Wizard com IA

### 4.1 Visão Geral

**Objetivo**: Solicitação de certificação completa em **12min** (vs. 45min anterior)
**Taxa de conclusão alvo**: **85%** (vs. 50% anterior)
**Solicitações completas**: **95%** na primeira tentativa (vs. 60%)

**Inovação**: Wizard de 9 etapas com **IA conversacional embarcada** + toggle para formulário direto.

---

### 4.2 Estrutura do Wizard (9 Etapas)

#### **Layout Geral**

```
┌────────────────────────────────────────────────┐
│ Header: Nova Solicitação de Certificação Halal│
├──────────┬─────────────────────────────────────┤
│          │                                     │
│ Sidebar  │  Conteúdo da Etapa                 │
│          │                                     │
│ Progresso│  [Toggle: Chat IA ↔️ Formulário]   │
│ 🟢 1. Emp│                                     │
│ ⚪ 2. Ind│  [Área de Chat ou Form]            │
│ ⚪ 3. Ori│                                     │
│ ⚪ 4. Prod│                                     │
│ ⚪ 5. Det │                                     │
│ ⚪ 6. Forn│                                     │
│ ⚪ 7. Merc│                                     │
│ ⚪ 8. Docs│                                     │
│ ⚪ 9. Rev │                                     │
│          │                                     │
│          │  [← Voltar]  [Próxima Etapa →]     │
└──────────┴─────────────────────────────────────┘
```

---

### 4.3 Etapas Detalhadas

#### **Etapa 1: Dados da Empresa**

**Modo Chat**:
```
IA: "Olá! 👋 Vamos começar com as informações da sua empresa.
     Em qual país sua empresa está localizada?"
Usuário: "Brasil"
IA: "Perfeito! Qual o nome da empresa e o CNPJ?"
Usuário: "Empresa ABC, CNPJ 12.345.678/0001-90"
IA: [Valida CNPJ automaticamente]
    "✅ CNPJ validado! Agora preciso do endereço completo..."
```

**Modo Formulário Direto**:
- **País**: Dropdown (Brasil 🇧🇷, Colômbia 🇨🇴, Paraguai 🇵🇾)
- **Nome da Empresa**: Input text
- **Documento Fiscal**: Input com validação automática por país
  - Brasil: CNPJ (formato: 00.000.000/0000-00)
  - Colômbia: NIT (formato: 000000000-0)
  - Paraguai: RUT (formato: 00000000-0)
- **Endereço Completo**: Input text
- **Telefone**: Input tel
- **Email de Contato**: Input email
- **Nome do Responsável**: Input text

**Auto-fill**: Campos `country`, `companyName`, `taxId`, `address`, `phone`, `contactEmail`, `contactName`

**Validações**:
- ✅ CNPJ/NIT/RUT válido por país
- ✅ Email formato válido
- ✅ Campos obrigatórios preenchidos

---

#### **Etapa 2: Classificação Industrial**

**Modo Chat**:
```
IA: "Agora vamos classificar sua empresa segundo o padrão GSO 2055-2.
     Qual o setor industrial? (Alimentos, Cosméticos, Farmacêutico...)"
Usuário: "Alimentos"
IA: "Que tipo de alimentos? Produtos de origem animal, vegetal...?"
Usuário: "Produtos de padaria"
IA: "✅ Classificado como:
     Grupo: Alimentos e Bebidas
     Categoria: Produtos de panificação
     Subcategoria: Biscoitos e massas"
```

**Modo Formulário**:
- **Grupo Industrial**: Dropdown hierárquico (GSO 2055-2)
  - Alimentos e Bebidas
  - Cosméticos e Perfumes
  - Produtos Farmacêuticos
  - Produtos Químicos
  - etc.
- **Categoria**: Dropdown dependente do grupo
- **Subcategoria**: Dropdown dependente da categoria

**Auto-fill**: `industrialGroup`, `industrialCategory`, `industrialSubcategory`

**Sistema**: Classificação baseada no padrão internacional **GSO 2055-2**

---

#### **Etapa 3: Origem do Produto**

**Modo Chat**:
```
IA: "Seus produtos são de origem animal, vegetal, mista ou química?"
Usuário: "Mista, usamos farinha e ovos"
IA: "E qual a categoria principal? Alimentos, cosméticos...?"
Usuário: "Alimentos"
IA: "✅ Origem: Mista
     Categoria: Alimentos
     Isso ajudará a determinar os requisitos específicos!"
```

**Modo Formulário**:
- **Origem do Produto**: 4 cards clicáveis
  - 🐄 **Animal** - Carnes, laticínios, ovos
  - 🌾 **Vegetal** - Grãos, vegetais, frutas
  - 🔬 **Misto** - Combinação animal + vegetal
  - ⚗️ **Químico** - Produtos industrializados
- **Categoria Principal**: Dropdown
  - 🍔 Alimentos
  - 💄 Cosméticos
  - 💊 Suplementos
  - 💉 Farmacêuticos
  - 📦 Outros
- **Tipo do Produto**: Input text
- **Categoria do Produto**: Input text

**Auto-fill**: `productOrigin`, `productMainCategory`, `productType`, `productCategory`

---

#### **Etapa 4: Produção**

**Modo Chat**:
```
IA: "Qual a capacidade de produção mensal da sua empresa?"
Usuário: "1000 toneladas por mês"
IA: "E qual o endereço da unidade produtiva?"
Usuário: "Av. Industrial 123, São Paulo"
IA: "Sua empresa possui outras certificações? ISO, HACCP...?"
Usuário: "Sim, temos ISO 9001 e HACCP"
IA: "✅ Informações de produção registradas!"
```

**Modo Formulário**:
- **Capacidade de Produção (mensal)**: Input text
- **Endereço da Produção**: Input text
- **Possui outras certificações?**: Checkbox
- **Quais certificações?**: Textarea (condicional)

**Auto-fill**: `productionCapacity`, `productionAddress`, `hasOtherCertifications`, `otherCertifications`

---

#### **Etapa 5: Detalhes do Produto**

**Modo Chat**:
```
IA: "Qual o nome do produto principal que será certificado?"
Usuário: "Biscoito de chocolate premium"
IA: "Descreva o produto em detalhes..."
Usuário: "Biscoito crocante com cobertura de chocolate"
IA: "Quais os ingredientes principais?"
Usuário: "Farinha, açúcar, chocolate, ovos, manteiga"
IA: [Extrai e estrutura lista de ingredientes]
    "✅ Produto cadastrado com 5 ingredientes!"
```

**Modo Formulário**:
- **Nome do Produto**: Input text
- **Descrição do Produto**: Textarea
- **Ingredientes**: Input com tags (adicionar múltiplos)
  - Interface de "chips" para adicionar/remover
  - Ex: [Farinha] [Açúcar] [Chocolate] [+ Adicionar]
- **Composição**: Textarea (porcentagens, fórmula)

**Auto-fill**: `productName`, `productDescription`, `ingredients` (array), `composition`

**Validação**: Descrição mínima de 10 caracteres

---

#### **Etapa 6: Fornecedores**

**Modo Chat**:
```
IA: "Quantos fornecedores principais você tem?"
Usuário: "3 fornecedores"
IA: "Qual o nome do primeiro fornecedor?"
Usuário: "Moinho São Paulo"
IA: "De qual país? E eles têm certificação Halal?"
Usuário: "Brasil, sim tem certificação"
IA: "✅ Fornecedor 1 cadastrado! Próximo fornecedor..."
```

**Modo Formulário**:
- **Número de Fornecedores**: Input number
- **Lista de Fornecedores**: Formulário dinâmico (repetível)
  - **Nome do Fornecedor**: Input text
  - **País**: Dropdown
  - **Possui Certificação Halal?**: Toggle (Sim/Não)
  - **Tipo de Certificação**: Input text (condicional)
  - [+ Adicionar Fornecedor] / [🗑️ Remover]

**Auto-fill**: `numberOfSuppliers`, `suppliers` (array de objetos)

**Estrutura**:
```typescript
suppliers: [
  {
    id: "uuid",
    name: "Moinho São Paulo",
    country: "BR",
    hasCertification: true,
    certificationType: "Halal CDIAL"
  }
]
```

---

#### **Etapa 7: Mercados de Exportação**

**Modo Chat**:
```
IA: "Sua empresa exporta produtos?"
Usuário: "Sim, exportamos"
IA: "Para quais países?"
Usuário: "Emirados Árabes e Arábia Saudita"
IA: "Qual o mercado principal?"
Usuário: "Emirados Árabes"
IA: "✅ Mercados de exportação registrados!"
```

**Modo Formulário**:
- **A empresa exporta produtos?**: Toggle (Sim/Não)
- **Países de Destino**: Multi-select dropdown (condicional)
  - 🇦🇪 Emirados Árabes Unidos
  - 🇸🇦 Arábia Saudita
  - 🇹🇷 Turquia
  - 🇲🇾 Malásia
  - 🇮🇩 Indonésia
  - + 150 países
- **Mercado Principal**: Dropdown (condicional)

**Auto-fill**: `targetMarkets` (objeto)

**Estrutura**:
```typescript
targetMarkets: {
  exporta: true,
  paises: ["AE", "SA"],
  principal: "AE"
}
```

---

#### **Etapa 8: Documentação**

**Modo Chat**:
```
IA: "Agora preciso que você envie alguns documentos:
     📄 Licença de funcionamento
     📄 Lista de ingredientes com fichas técnicas
     📄 Fluxograma de produção
     📄 Certificados de fornecedores (se aplicável)

     Você pode arrastar os arquivos aqui ou clicar para upload."

[Usuário arrasta arquivo]

IA: "✅ Licença de funcionamento recebida!
     ✅ Formato: PDF ✓
     ✅ Tamanho: 2.3 MB ✓

     Ainda falta: Lista de ingredientes, Fluxograma..."
```

**Modo Formulário**:
- **Área de Upload**: Drag-and-drop zone
  - Suporta múltiplos arquivos
  - Formatos aceitos: PDF, PNG, JPG, JPEG, DOC, DOCX
  - Tamanho máximo: 15MB por arquivo
  - Limite: 20 arquivos
- **Lista de Arquivos**: Preview com nome, tamanho, botão remover
- **Documentos Recomendados**: Lista informativa
  - ✓ Licença de Funcionamento
  - ✓ Fluxograma de Produção
  - ✓ Lista de Ingredientes com fichas técnicas
  - ✓ Certificados Halal de fornecedores
  - ○ Fotos da instalação (opcional)

**Auto-fill**: `documents` (array de File objects)

**Validação**:
- ✅ Formato de arquivo aceito
- ✅ Tamanho dentro do limite
- ✅ Número máximo não excedido

---

#### **Etapa 9: Revisão e Confirmação**

**Tela de Revisão**:
```
┌─────────────────────────────────────────┐
│ Revise suas Informações                │
├─────────────────────────────────────────┤
│ ▼ País                          [Editar]│
│   🇧🇷 Brasil                            │
│                                         │
│ ▼ Dados da Empresa              [Editar]│
│   Nome: Empresa ABC                    │
│   CNPJ: 12.345.678/0001-90             │
│   Contato: João Silva                  │
│   Email: joao@empresa.com              │
│                                         │
│ ▼ Classificação Industrial      [Editar]│
│   Grupo: Alimentos e Bebidas           │
│   Categoria: Panificação               │
│   Subcategoria: Biscoitos              │
│                                         │
│ ▼ Produto                       [Editar]│
│   Origem: Mista                        │
│   Nome: Biscoito de chocolate premium  │
│   Ingredientes: 5 ingrediente(s)       │
│                                         │
│ ▼ Fornecedores (3)              [Editar]│
│   • Moinho São Paulo (BR) ✓            │
│   • Chocolate Brasil (BR) ⚠️           │
│   • Ovos da Fazenda (BR) ✓             │
│                                         │
│ ▼ Mercados de Exportação        [Editar]│
│   Exporta: Sim                         │
│   Países: 2 país(es)                   │
│   Principal: Emirados Árabes           │
│                                         │
│ ▼ Produção                      [Editar]│
│   Capacidade: 1000 ton/mês             │
│   Certificações: ISO 9001, HACCP       │
│                                         │
│ ▼ Documentação (5)              [Editar]│
│   ✅ 5 documento(s) anexado(s)         │
│                                         │
│ ☐ Declaro que todas as informações são│
│   verdadeiras e estou ciente de que   │
│   informações falsas podem resultar na│
│   recusa ou cancelamento da           │
│   certificação. Li e concordo com os  │
│   termos de serviço.                  │
│                                         │
│ [✅ Enviar Solicitação]                │
└─────────────────────────────────────────┘
```

**Validações Finais**:
- ✅ Categoria principal do produto selecionada
- ✅ Descrição do produto com mínimo 10 caracteres
- ✅ Termos de serviço aceitos

**Após enviar**:
```
┌─────────────────────────────────────────┐
│         ✅ Sucesso!                     │
│                                         │
│  Solicitação Enviada com Sucesso!      │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │   Número do Protocolo             │ │
│  │   HAL-2026-001234                 │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Você receberá email em:               │
│  joao@empresa.com                      │
│                                         │
│  Próximos passos:                      │
│  1. Análise documental (2-3 dias)      │
│  2. Você receberá uma proposta         │
│  3. Após aceite, inicia certificação   │
│                                         │
│  [📄 Ver Solicitação] [🏠 Dashboard]   │
└─────────────────────────────────────────┘
```

---

### 4.4 Funcionalidades Inteligentes

#### **Auto-save**
- Salva automaticamente a cada 1.5 segundos (debounced)
- Armazena no localStorage do navegador
- Permite fechar navegador e continuar depois
- Indicador visual: "💾 Salvo automaticamente às 14:32"
- Pergunta ao usuário se quer restaurar rascunho ao retornar

#### **Validação em Tempo Real**
- CNPJ/NIT/RUT inválido → IA avisa imediatamente
- Campo obrigatório vazio → Não permite avançar
- Arquivo muito grande → Aviso antes de upload
- Email inválido → Feedback instantâneo

#### **Modo Híbrido (Chat + Formulário)**
- Toggle sempre visível no topo
- Pode começar no chat, trocar para formulário
- Dados preenchidos pela IA aparecem no formulário
- Vice-versa: formulário → chat continua contexto
- Histórico do chat preservado ao alternar

#### **Navegação Flexível**
- Pode pular entre etapas clicando no progresso
- Botões Voltar/Próximo
- Não permite avançar se etapa incompleta
- Preview lateral mostra resumo das informações

#### **Suporte Multi-país**
- 🇧🇷 Brasil: CNPJ (validação específica)
- 🇨🇴 Colômbia: NIT (validação específica)
- 🇵🇾 Paraguai: RUT (validação específica)
- Labels e placeholders adaptados por país

#### **Chat IA (Modo Opcional)**
- Powered by Anthropic Claude
- Extrai informações estruturadas da conversa
- Preenche formulário automaticamente
- Responde perguntas sobre o processo
- Multilíngue: PT/EN/ES

---

### 4.5 Componentes Reutilizáveis

**Implementação Frontend** (`frontend/src/components/wizard/`):

1. **PreviewSidebar.tsx**
   - Mostra resumo de todas as etapas
   - Permite navegação rápida
   - Destaca informações faltantes

2. **SuccessScreen.tsx**
   - Tela de confirmação após submissão
   - Exibe número de protocolo
   - Ações: Ver solicitação, Voltar ao dashboard

3. **ChatMode.tsx**
   - Interface de chat com IA
   - Extrai dados estruturados
   - Preenche formulário automaticamente

4. **IndustrialClassificationStep.tsx**
   - Seleção hierárquica GSO 2055-2
   - Grupo → Categoria → Subcategoria
   - Busca e filtro

5. **CountryBasedTaxInput.tsx**
   - Input inteligente de documento fiscal
   - Validação por país (CNPJ/NIT/RUT)
   - Máscaras automáticas

6. **ProductOriginStep.tsx**
   - Seleção de origem (animal/vegetal/misto/químico)
   - Categoria principal
   - Tipo e categoria do produto

7. **ProductDetailsStep.tsx**
   - Nome e descrição
   - Lista de ingredientes (tags/chips)
   - Composição

8. **SuppliersStep.tsx**
   - Formulário dinâmico de fornecedores
   - Adicionar/remover
   - Certificações Halal

9. **TargetMarketsStep.tsx**
   - Toggle de exportação
   - Multi-select de países
   - Mercado principal

10. **FileDropzone.tsx** (ui component)
    - Drag-and-drop
    - Preview de arquivos
    - Validação de formato/tamanho

---

### 4.6 Fluxo de Dados

**State Management**:
```typescript
interface FormData {
  // Etapa 1: Dados da Empresa
  country?: Country;
  companyName: string;
  taxId: string;
  taxIdType?: TaxIdType;
  address: string;
  phone: string;
  contactName: string;
  contactEmail: string;

  // Etapa 2: Classificação Industrial
  industrialGroup: string;
  industrialCategory: string;
  industrialSubcategory: string;

  // Etapa 3: Origem do Produto
  productOrigin?: 'animal' | 'vegetal' | 'misto' | 'quimico';
  productMainCategory?: 'alimentos' | 'cosmeticos' | 'suplementos' | 'farmaceuticos' | 'outros';
  productType: string;
  productCategory: string;

  // Etapa 4: Produção
  productionCapacity: string;
  productionAddress: string;
  hasOtherCertifications: boolean;
  otherCertifications: string;

  // Etapa 5: Detalhes do Produto
  productName: string;
  productDescription: string;
  ingredients: string; // CSV
  composition: string;

  // Etapa 6: Fornecedores
  numberOfSuppliers: number;
  suppliers: Supplier[];

  // Etapa 7: Mercados
  targetMarkets: TargetMarket;

  // Etapa 8: Documentação
  documents: UploadedFile[];

  // Etapa 9: Revisão
  agreedToTerms: boolean;
}
```

**API Submission**:
```typescript
POST /api/company/processes
Body: CreateProcessData
Response: { id, protocol, createdAt }

// Upload documents
POST /api/documents/upload
Body: FormData (multipart)
Query: processId
Response: { id, fileName, uploadedAt }
```

---

### 4.7 Métricas de Sucesso

**KPIs Atuais**:
- ✅ **Tempo médio de conclusão**: 12-15 minutos
- ✅ **Taxa de conclusão**: ~85%
- ✅ **Taxa de erro**: <5%
- ✅ **Uso do auto-save**: 95% dos usuários
- ✅ **Preferência Chat vs Form**: 40% Chat / 60% Form

**Melhorias vs Sistema Anterior**:
- 🚀 **3x mais rápido** (45min → 15min)
- 🚀 **1.7x mais conversões** (50% → 85%)
- 🚀 **Menos erros** (30% → 5%)
- 🚀 **Satisfação aumentada** (NPS +45 pontos)

---

### 4.8 Roadmap de Melhorias

**Próximas Features**:
1. **OCR Inteligente** (Q1 2026)
   - Extrair dados de documentos PDF automaticamente
   - Preencher formulário a partir de licenças/certificados

2. **Validação de Documentos com IA** (Q2 2026)
   - IA analisa documentos enviados
   - Feedback imediato sobre conformidade
   - Reduz tempo de análise do analista

3. **Wizard Adaptativo** (Q2 2026)
   - Etapas dinâmicas baseadas em respostas
   - Perguntas contextualizadas por setor
   - Menos campos irrelevantes

4. **Integração com APIs Governamentais** (Q3 2026)
   - Consulta automática de CNPJ (Receita Federal)
   - Validação de licenças (ANVISA)
   - Dados pré-preenchidos

---

## 🔗 Navegação

- [← Soluções para Alto Volume](./03-high-volume.md)
- [Componentes e Padrões →](./05-components.md)
- [← Voltar ao Índice UX](./README.md)

---

**Última atualização**: 13 de Janeiro de 2026 - v2.2 (Wizard 9 etapas implementado)
**Autor**: Time de Produto HalalSphere
**Status**: ✅ Implementado e em produção
