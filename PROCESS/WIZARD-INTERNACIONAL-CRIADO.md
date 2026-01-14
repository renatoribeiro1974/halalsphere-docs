# 🎨 Wizard Internacional - Componentes Criados

## 📋 Status: Em Progresso

### ✅ Componentes Criados

#### 1. **Types Internacionais**
**Arquivo:** `frontend/src/types/international.ts`

**Recursos:**
- ✅ Types: `Country`, `Currency`, `Language`, `TaxIdType`
- ✅ Interface `CountryConfig` completa
- ✅ Configurações de 3 países (BR, CO, PY)
- ✅ Labels de documentos fiscais (PT/ES)
- ✅ Máscaras e placeholders por tipo
- ✅ Helpers:
  - `getTaxIdLabel(type, language)`
  - `getCountryConfig(country)`
  - `formatCurrency(value, currency)`

**Exemplo de uso:**
```typescript
import { getCountryConfig, formatCurrency } from '@/types/international';

const config = getCountryConfig('BR');
// { name: 'Brasil', currency: 'BRL', flag: '🇧🇷', ... }

const formatted = formatCurrency(5000, 'BRL');
// "R$ 5.000,00"
```

---

#### 2. **Country Selector**
**Arquivo:** `frontend/src/components/wizard/CountrySelector.tsx`

**UI:**
```
┌─────────────────────────────────────────────────┐
│          Selecione o País                       │
│    Escolha o país onde sua empresa está         │
│              registrada                          │
└─────────────────────────────────────────────────┘

┌─────────┐  ┌─────────┐  ┌─────────┐
│   🇧🇷    │  │   🇨🇴    │  │   🇵🇾    │
│ Brasil  │  │ Colômbia │  │ Paraguai │
│  R$     │  │  COP$    │  │    ₲     │
│ BRL     │  │  COP     │  │   PYG    │
│CNPJ,CPF │  │ NIT, RUT │  │ RUC, CI  │
│   ✓     │  │          │  │          │
└─────────┘  └─────────┘  └─────────┘
```

**Props:**
```typescript
interface CountrySelectorProps {
  selectedCountry?: Country;
  onSelect: (country: Country) => void;
}
```

**Recursos:**
- ✅ Grid responsivo (1 col mobile, 3 cols desktop)
- ✅ Visual feedback no hover
- ✅ Indicador de seleção com ícone
- ✅ Mostra flag, nome, moeda e documentos aceitos
- ✅ Dica de ajuda no rodapé

---

#### 3. **Tax ID Input (Validação)**
**Arquivo:** `frontend/src/components/wizard/TaxIdInput.tsx`

**UI:**
```
┌──────────────────────────────────────────┐
│ Tipo de Documento Fiscal                 │
│ ┌────────────────────────────┐          │
│ │ CNPJ - Cadastro Nacional ▼│          │
│ └────────────────────────────┘          │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ CNPJ - Cadastro Nacional de PJ           │
│ ┌────────────────────────────┐   ✓      │
│ │ 12.345.678/0001-90         │          │
│ └────────────────────────────┘          │
│                                          │
│ ✓ CNPJ válido                           │
└──────────────────────────────────────────┘
```

**Props:**
```typescript
interface TaxIdInputProps {
  country: Country;
  value: string;
  taxIdType?: TaxIdType;
  onChange: (value: string, taxIdType: TaxIdType) => void;
  onValidation?: (isValid: boolean) => void;
}
```

**Recursos:**
- ✅ Seletor de tipo de documento (se país tiver múltiplos)
- ✅ Máscara automática por tipo
- ✅ Validação em tempo real (debounce 500ms)
- ✅ Ícones de status (loading, válido, inválido)
- ✅ Mensagens de erro/sucesso
- ✅ Suporte a react-input-mask
- ✅ Validação de formato local

**Validações por tipo:**
| Tipo | Dígitos | Exemplo |
|------|---------|---------|
| CNPJ | 14 | 12.345.678/0001-90 |
| CPF  | 11 | 123.456.789-09 |
| NIT  | 9-10 | 900.123.456-8 |
| RUT  | 9-10 | 900.123.456-8 |
| RUC  | 6-9 | 80012345-0 |
| CI   | 6-8 | 1.234.567 |

---

## 🎯 Estrutura do Wizard Atualizado (8 Etapas)

### Etapa 0: Seleção de País (NOVA)
**Componente:** `CountrySelector`
- Escolher entre BR, CO, PY
- Determina: idioma, moeda, documentos aceitos

### Etapa 1: Dados da Empresa (ATUALIZADA)
**Componente:** `CompanyInfoStep`
- ~~CNPJ~~ → **TaxIdInput** (multi-país)
- Razão Social / Nome Fantasia
- Endereço (formato por país)
- Contato

### Etapa 2: Classificação Industrial
**Componente:** `IndustrialClassificationStep` (existente)
- Grupo (A, B, C, D)
- Categoria (AI, AII, BI, etc.)
- Subcategoria

### Etapa 3: Origem e Tipo de Produto (NOVA)
**Componente:** `ProductOriginStep`
- Origem: Animal, Vegetal, Misto, Químico
- Tipo de produto
- Categoria

### Etapa 4: Produção
**Componente:** `ProductionStep`
- Capacidade produtiva
- Número de turnos
- Número de funcionários
- Distância da certificadora

### Etapa 5: Detalhes do Produto (NOVA)
**Componente:** `ProductDetailsStep`
- Nome do produto
- Descrição detalhada
- Ingredientes
- Composição

### Etapa 6: Fornecedores (NOVA)
**Componente:** `SuppliersStep`
- Número de fornecedores
- Principais fornecedores
- País de origem
- Certificações

### Etapa 7: Mercados (NOVA)
**Componente:** `TargetMarketsStep`
- Exporta?
- Países de destino
- Mercado principal

### Etapa 8: Documentação
**Componente:** `DocumentationStep` (existente)
- Upload de documentos
- Tipos específicos por país

### Etapa 9: Revisão e Submissão
**Componente:** `ReviewStep`
- Resumo de todas as etapas
- Termos e condições
- Submeter

---

## 📦 Dependências Necessárias

### Pacotes a Instalar:

```bash
cd frontend
npm install react-input-mask
npm install @types/react-input-mask --save-dev
```

---

## 🔄 Próximos Passos

### Para Completar o Wizard:

1. **Criar Steps Faltando:**
   - [ ] `CompanyInfoStep.tsx` (atualizado com TaxIdInput)
   - [ ] `ProductOriginStep.tsx`
   - [ ] `ProductDetailsStep.tsx`
   - [ ] `SuppliersStep.tsx`
   - [ ] `TargetMarketsStep.tsx`

2. **Atualizar NewRequestWizard.tsx:**
   - [ ] Adicionar Etapa 0 (seleção de país)
   - [ ] Atualizar FormData com novos campos
   - [ ] Integrar novos steps
   - [ ] Atualizar lógica de navegação

3. **Integração com API:**
   - [ ] Endpoint de validação de documento fiscal
   - [ ] Atualizar CREATE process para aceitar novos campos
   - [ ] Validação server-side

4. **i18n:**
   - [ ] Criar traduções PT-BR
   - [ ] Criar traduções ES
   - [ ] Context provider de idioma

---

## 🎨 Design System

### Cores por Status:
- ✅ Válido: `text-green-600`
- ❌ Inválido: `text-destructive`
- ⏳ Validando: `text-muted-foreground`
- 📌 Selecionado: `border-primary`

### Ícones Usados:
- País selecionado: `Check`
- Documento válido: `CheckCircle2`
- Documento inválido: `XCircle`
- Validando: `Loader2` (animado)

---

## 🧪 Como Testar

### 1. CountrySelector
```tsx
import { CountrySelector } from '@/components/wizard/CountrySelector';

function Test() {
  const [country, setCountry] = useState<Country>();

  return <CountrySelector selectedCountry={country} onSelect={setCountry} />;
}
```

### 2. TaxIdInput
```tsx
import { TaxIdInput } from '@/components/wizard/TaxIdInput';

function Test() {
  const [taxId, setTaxId] = useState('');
  const [type, setType] = useState<TaxIdType>('CNPJ');

  return (
    <TaxIdInput
      country="BR"
      value={taxId}
      taxIdType={type}
      onChange={(value, newType) => {
        setTaxId(value);
        setType(newType);
      }}
      onValidation={(isValid) => console.log('Valid:', isValid)}
    />
  );
}
```

---

## 📊 Progresso

**Concluído:**
- ✅ Types internacionais
- ✅ CountrySelector
- ✅ TaxIdInput

**Em Progresso:**
- 🔄 Steps do wizard (5 faltando)
- 🔄 NewRequestWizard principal

**Pendente:**
- ⏳ Integração com API
- ⏳ i18n completo
- ⏳ Validação server-side

---

**Criado por:** Claude Code
**Data:** 08 de Dezembro de 2025
**Status:** 🟡 Em Progresso (3/10 componentes)
