# 🌎 Internacionalização do Sistema - HalalSphere

**Data**: 08 de Dezembro de 2025
**Versão**: 5.0
**Status**: 🌍 Sistema Multi-País

---

## 🎯 Visão Geral

O sistema HalalSphere opera em **3 países** com filiais próprias:

- 🇧🇷 **Brasil** - Sede principal
- 🇨🇴 **Colômbia** - Filial
- 🇵🇾 **Paraguai** - Filial

Cada país possui:
- ✅ Documentos fiscais específicos
- ✅ Moeda própria
- ✅ Idioma principal (PT, ES)
- ✅ Regulamentações locais
- ✅ Fuso horário específico

---

## 📋 Documentos Fiscais por País

### **🇧🇷 Brasil:**

| Documento | Sigla | Formato | Validação |
|-----------|-------|---------|-----------|
| CNPJ | CNPJ | 00.000.000/0000-00 | 14 dígitos |
| CPF (pessoa física) | CPF | 000.000.000-00 | 11 dígitos |
| Inscrição Estadual | IE | Varia por estado | Opcional |
| Inscrição Municipal | IM | Varia por município | Opcional |

**Exemplo CNPJ:** `12.345.678/0001-90`

---

### **🇨🇴 Colômbia:**

| Documento | Sigla | Formato | Validação |
|-----------|-------|---------|-----------|
| NIT (Empresa) | NIT | 000.000.000-0 | 9-10 dígitos + dígito verificador |
| RUT (Registro Único Tributário) | RUT | Mesmo que NIT | - |
| Cédula (pessoa física) | CC | 0.000.000.000 | 8-10 dígitos |

**Exemplo NIT:** `900.123.456-7`

**Nota:** Na Colômbia, NIT e RUT são o mesmo número. O NIT é usado para empresas.

---

### **🇵🇾 Paraguai:**

| Documento | Sigla | Formato | Validação |
|-----------|-------|---------|-----------|
| RUC (Empresa) | RUC | 00000000-0 | 8 dígitos + dígito verificador |
| CI/Cédula (pessoa física) | CI | 0.000.000 | 6-8 dígitos |

**Exemplo RUC:** `80012345-6`

---

## 🗄️ Modelagem de Dados Atualizada

### **Company Model (Atualizado):**

```prisma
model Company {
  id                String   @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  userId            String   @unique @map("user_id") @db.Uuid

  // Identificação Fiscal Internacional [ATUALIZADO]
  country           Country  // BR, CO, PY
  taxId             String   @map("tax_id") @db.VarChar(20)      // CNPJ, NIT, RUC (sem formatação)
  taxIdFormatted    String   @map("tax_id_formatted") @db.VarChar(25) // Com formatação
  taxIdType         TaxIdType @map("tax_id_type")     // CNPJ, NIT, RUC, CPF, CC, CI

  // Dados da Empresa
  legalName         String   @map("legal_name") @db.VarChar(255) // Razão Social
  tradeName         String?  @map("trade_name") @db.VarChar(255) // Nome Fantasia

  // Endereço Internacional [ATUALIZADO]
  address           Json     // Estrutura flexível por país

  /* Estrutura do address JSON por país:

  BRASIL:
  {
    "zipCode": "01310-100",
    "street": "Av. Paulista",
    "number": "1578",
    "complement": "Sala 101",
    "neighborhood": "Bela Vista",
    "city": "São Paulo",
    "state": "SP",
    "country": "BR"
  }

  COLÔMBIA:
  {
    "zipCode": "110111",
    "street": "Carrera 7",
    "number": "71-21",
    "complement": "Torre B Piso 5",
    "neighborhood": "Chapinero",
    "city": "Bogotá",
    "department": "Cundinamarca",
    "country": "CO"
  }

  PARAGUAI:
  {
    "zipCode": "1209",
    "street": "Av. Mariscal López",
    "number": "1234",
    "complement": "",
    "neighborhood": "Villa Morra",
    "city": "Asunción",
    "department": "Central",
    "country": "PY"
  }
  */

  // Contato
  contact           Json     // {email, telefone, whatsapp, responsavel}
  website           String?  @db.VarChar(255)

  // Informações Comerciais
  numEmployees      Int?     @map("num_employees")
  annualRevenue     Decimal? @map("annual_revenue") @db.Decimal(15, 2)
  currency          Currency @default(BRL) // BRL, COP, PYG
  mainActivity      String?  @map("main_activity") @db.Text

  // Filial/Matriz
  branchOf          String?  @map("branch_of") @db.Uuid  // Se for filial, aponta para matriz
  branches          Company[] @relation("CompanyBranches")
  parentCompany     Company?  @relation("CompanyBranches", fields: [branchOf], references: [id])

  // Metadata
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  // Relações
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  requests          Request[]
  contracts         Contract[]

  @@unique([country, taxId]) // Garante unicidade por país
  @@index([userId])
  @@index([country])
  @@index([taxId])
  @@map("companies")
}

// ========================================
// ENUMS NOVOS
// ========================================

enum Country {
  BR  // Brasil
  CO  // Colômbia
  PY  // Paraguai
}

enum TaxIdType {
  // Brasil
  CNPJ  // Cadastro Nacional de Pessoa Jurídica
  CPF   // Cadastro de Pessoa Física

  // Colômbia
  NIT   // Número de Identificación Tributaria
  CC    // Cédula de Ciudadanía

  // Paraguai
  RUC   // Registro Único de Contribuyentes
  CI    // Cédula de Identidad
}

enum Currency {
  BRL   // Real (Brasil) - R$
  COP   // Peso Colombiano (Colômbia) - COP$
  PYG   // Guaraní (Paraguai) - ₲
}

enum Language {
  pt_BR  // Português (Brasil)
  es_CO  // Español (Colômbia)
  es_PY  // Español (Paraguai)
  en_US  // English (opcional)
}
```

---

## 🔍 Validação de Documentos Fiscais

### **Service de Validação:**

```typescript
// backend/src/services/tax-validation.service.ts

export class TaxValidationService {
  /**
   * Valida documento fiscal de acordo com o país
   */
  validateTaxId(taxId: string, country: Country, type: TaxIdType): boolean {
    switch (country) {
      case 'BR':
        return this.validateBrazilianTaxId(taxId, type);
      case 'CO':
        return this.validateColombianTaxId(taxId, type);
      case 'PY':
        return this.validateParaguayanTaxId(taxId, type);
      default:
        throw new Error(`País não suportado: ${country}`);
    }
  }

  /**
   * Brasil: CNPJ ou CPF
   */
  private validateBrazilianTaxId(taxId: string, type: TaxIdType): boolean {
    const cleaned = taxId.replace(/\D/g, ''); // Remove formatação

    if (type === 'CNPJ') {
      return this.validateCNPJ(cleaned);
    } else if (type === 'CPF') {
      return this.validateCPF(cleaned);
    }
    return false;
  }

  /**
   * Validação de CNPJ (14 dígitos)
   */
  private validateCNPJ(cnpj: string): boolean {
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1+$/.test(cnpj)) return false; // Todos dígitos iguais

    let sum = 0;
    let pos = 5;

    // Primeiro dígito verificador
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cnpj.charAt(i)) * pos;
      pos = pos === 2 ? 9 : pos - 1;
    }
    let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (digit1 !== parseInt(cnpj.charAt(12))) return false;

    // Segundo dígito verificador
    sum = 0;
    pos = 6;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cnpj.charAt(i)) * pos;
      pos = pos === 2 ? 9 : pos - 1;
    }
    let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (digit2 !== parseInt(cnpj.charAt(13))) return false;

    return true;
  }

  /**
   * Validação de CPF (11 dígitos)
   */
  private validateCPF(cpf: string): boolean {
    if (cpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (digit1 !== parseInt(cpf.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (digit2 !== parseInt(cpf.charAt(10))) return false;

    return true;
  }

  /**
   * Colômbia: NIT ou CC
   */
  private validateColombianTaxId(taxId: string, type: TaxIdType): boolean {
    const cleaned = taxId.replace(/\D/g, '');

    if (type === 'NIT') {
      return this.validateNIT(cleaned);
    } else if (type === 'CC') {
      return this.validateCC(cleaned);
    }
    return false;
  }

  /**
   * Validação de NIT Colombiano (9-10 dígitos + dígito verificador)
   */
  private validateNIT(nit: string): boolean {
    if (nit.length < 9 || nit.length > 10) return false;

    const digits = nit.slice(0, -1);
    const checkDigit = parseInt(nit.slice(-1));

    const weights = [71, 67, 59, 53, 47, 43, 41, 37, 29, 23, 19, 17, 13, 7, 3];
    let sum = 0;

    for (let i = 0; i < digits.length; i++) {
      sum += parseInt(digits[digits.length - 1 - i]) * weights[i];
    }

    const calculated = sum % 11;
    const expectedCheckDigit = calculated > 1 ? 11 - calculated : calculated;

    return checkDigit === expectedCheckDigit;
  }

  /**
   * Validação de Cédula Colombiana (8-10 dígitos)
   */
  private validateCC(cc: string): boolean {
    // Cédula não tem dígito verificador, apenas valida formato
    return cc.length >= 8 && cc.length <= 10 && /^\d+$/.test(cc);
  }

  /**
   * Paraguai: RUC ou CI
   */
  private validateParaguayanTaxId(taxId: string, type: TaxIdType): boolean {
    const cleaned = taxId.replace(/\D/g, '');

    if (type === 'RUC') {
      return this.validateRUC(cleaned);
    } else if (type === 'CI') {
      return this.validateCI(cleaned);
    }
    return false;
  }

  /**
   * Validação de RUC Paraguaio (8 dígitos + dígito verificador)
   */
  private validateRUC(ruc: string): boolean {
    if (ruc.length !== 9) return false;

    const base = ruc.slice(0, -1);
    const checkDigit = parseInt(ruc.slice(-1));

    // Algoritmo módulo 11
    const weights = [2, 3, 4, 5, 6, 7, 2, 3];
    let sum = 0;

    for (let i = 0; i < 8; i++) {
      sum += parseInt(base[i]) * weights[i];
    }

    const remainder = sum % 11;
    const expectedCheckDigit = remainder === 0 ? 0 : 11 - remainder;

    return checkDigit === expectedCheckDigit;
  }

  /**
   * Validação de CI Paraguaia (6-8 dígitos)
   */
  private validateCI(ci: string): boolean {
    // CI não tem dígito verificador, apenas valida formato
    return ci.length >= 6 && ci.length <= 8 && /^\d+$/.test(ci);
  }

  /**
   * Formata documento conforme padrão do país
   */
  formatTaxId(taxId: string, country: Country, type: TaxIdType): string {
    const cleaned = taxId.replace(/\D/g, '');

    switch (country) {
      case 'BR':
        if (type === 'CNPJ') {
          return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
        } else if (type === 'CPF') {
          return cleaned.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
        }
        break;

      case 'CO':
        if (type === 'NIT') {
          return cleaned.replace(/^(\d{3})(\d{3})(\d{3})(\d{1})$/, '$1.$2.$3-$4');
        } else if (type === 'CC') {
          return cleaned.replace(/^(\d{1,2})(\d{3})(\d{3})$/, '$1.$2.$3');
        }
        break;

      case 'PY':
        if (type === 'RUC') {
          return cleaned.replace(/^(\d{8})(\d{1})$/, '$1-$2');
        } else if (type === 'CI') {
          return cleaned.replace(/^(\d{1,2})(\d{3})(\d{3})$/, '$1.$2.$3');
        }
        break;
    }

    return taxId;
  }
}

export const taxValidationService = new TaxValidationService();
```

---

## 🌍 Wizard de Cadastro Internacionalizado

### **Etapa 1: Seleção de País**

```typescript
export function CompanyRegistrationWizard() {
  const [step, setStep] = useState(1);
  const [country, setCountry] = useState<Country | null>(null);
  const [formData, setFormData] = useState<CompanyFormData>({});

  // STEP 1: Seleção de País
  if (step === 1) {
    return (
      <CountrySelector
        onSelect={(selectedCountry) => {
          setCountry(selectedCountry);
          setStep(2);
        }}
      />
    );
  }

  // STEP 2: Dados Fiscais (específico do país)
  if (step === 2) {
    return (
      <TaxIdForm
        country={country!}
        onSubmit={(taxData) => {
          setFormData({ ...formData, ...taxData });
          setStep(3);
        }}
      />
    );
  }

  // STEP 3: Dados da Empresa
  // STEP 4: Endereço (layout específico do país)
  // ...
}
```

### **Formulário de Documento Fiscal:**

```typescript
export function TaxIdForm({ country, onSubmit }: TaxIdFormProps) {
  const [taxIdType, setTaxIdType] = useState<TaxIdType | null>(null);
  const [taxId, setTaxId] = useState('');
  const [error, setError] = useState('');

  const getTaxIdOptions = (country: Country): TaxIdType[] => {
    switch (country) {
      case 'BR':
        return ['CNPJ', 'CPF'];
      case 'CO':
        return ['NIT', 'CC'];
      case 'PY':
        return ['RUC', 'CI'];
    }
  };

  const getTaxIdLabel = (type: TaxIdType): string => {
    const labels = {
      CNPJ: 'CNPJ (Cadastro Nacional de Pessoa Jurídica)',
      CPF: 'CPF (Cadastro de Pessoa Física)',
      NIT: 'NIT (Número de Identificación Tributaria)',
      CC: 'Cédula de Ciudadanía',
      RUC: 'RUC (Registro Único de Contribuyentes)',
      CI: 'Cédula de Identidad',
    };
    return labels[type];
  };

  const getTaxIdPlaceholder = (type: TaxIdType): string => {
    const placeholders = {
      CNPJ: '00.000.000/0000-00',
      CPF: '000.000.000-00',
      NIT: '000.000.000-0',
      CC: '0.000.000.000',
      RUC: '00000000-0',
      CI: '0.000.000',
    };
    return placeholders[type];
  };

  const handleValidate = async () => {
    if (!taxIdType || !taxId) {
      setError('Preencha todos os campos');
      return;
    }

    const isValid = await taxValidationService.validateTaxId(
      taxId,
      country,
      taxIdType
    );

    if (!isValid) {
      setError('Documento inválido. Verifique e tente novamente.');
      return;
    }

    // Verifica se já existe no sistema
    const exists = await checkTaxIdExists(country, taxId);
    if (exists) {
      setError('Este documento já está cadastrado no sistema.');
      return;
    }

    // Formata e submete
    const formatted = taxValidationService.formatTaxId(taxId, country, taxIdType);
    onSubmit({
      country,
      taxId: taxId.replace(/\D/g, ''),
      taxIdFormatted: formatted,
      taxIdType,
    });
  };

  return (
    <Card>
      <h2>Identificação Fiscal</h2>

      {/* Seleção de Tipo de Documento */}
      <Select
        label="Tipo de Documento"
        value={taxIdType}
        onChange={setTaxIdType}
      >
        {getTaxIdOptions(country).map((type) => (
          <option key={type} value={type}>
            {getTaxIdLabel(type)}
          </option>
        ))}
      </Select>

      {/* Input do Documento */}
      {taxIdType && (
        <Input
          label={getTaxIdLabel(taxIdType)}
          placeholder={getTaxIdPlaceholder(taxIdType)}
          value={taxId}
          onChange={(value) => {
            setTaxId(value);
            setError('');
          }}
          mask={getTaxIdMask(taxIdType)}
          error={error}
        />
      )}

      <Button onClick={handleValidate}>Validar e Continuar</Button>
    </Card>
  );
}
```

---

## 🔄 Atualização do Fluxo de Identificação

### **Matriz de Decisão Atualizada:**

```
EMPRESA ACESSA PORTAL
         │
         ▼
   ┌──────────┐
   │Seleciona │
   │País      │
   └──────────┘
     │   │   │
    BR  CO  PY
     │   │   │
     ▼   ▼   ▼
   ┌────────────────────────┐
   │Documento Fiscal existe?│
   │(CNPJ/NIT/RUC + País)   │
   └────────────────────────┘
     │              │
   NÃO             SIM
     │              │
     ▼              ▼
  ┌────┐      ┌─────────────┐
  │NOVA│      │Certificado  │
  │CERT│      │existe?      │
  └────┘      └─────────────┘
                 │      │
               NÃO     SIM
                 │      │
                 ▼      ▼
              ┌────┐  ┌──────────┐
              │NOVA│  │MANUTENÇÃO│
              │CERT│  │ADEQUAÇÃO │
              └────┘  └──────────┘
```

---

## 💰 Moedas e Valores

### **Conversão Automática:**

```typescript
export class CurrencyService {
  private exchangeRates = {
    BRL: 1.0,
    COP: 0.0012, // 1 COP = 0.0012 BRL
    PYG: 0.00067, // 1 PYG = 0.00067 BRL
  };

  /**
   * Converte valor de uma moeda para outra
   */
  convert(amount: number, from: Currency, to: Currency): number {
    // Converte para BRL primeiro (moeda base)
    const inBRL = amount * this.exchangeRates[from];

    // Depois converte para moeda de destino
    return inBRL / this.exchangeRates[to];
  }

  /**
   * Formata valor conforme moeda
   */
  format(amount: number, currency: Currency, locale?: string): string {
    const locales = {
      BRL: 'pt-BR',
      COP: 'es-CO',
      PYG: 'es-PY',
    };

    const currencies = {
      BRL: 'BRL',
      COP: 'COP',
      PYG: 'PYG',
    };

    return new Intl.NumberFormat(locale || locales[currency], {
      style: 'currency',
      currency: currencies[currency],
    }).format(amount);
  }
}

// Exemplos:
// R$ 5.000,00 (BRL)
// COP$ 18.750.000 (COP)
// ₲ 32.500.000 (PYG)
```

---

## 📧 Templates de Email Internacionalizados

```typescript
export class InternationalEmailService {
  async sendWelcomeEmail(company: Company, user: User) {
    const template = this.getTemplate(company.country);
    const language = this.getLanguage(company.country);

    await emailService.send({
      to: user.email,
      subject: this.translate('welcome.subject', language),
      template: `welcome-${language}`,
      data: {
        companyName: company.legalName,
        taxId: company.taxIdFormatted,
        country: this.getCountryName(company.country, language),
        ...
      },
    });
  }

  private getLanguage(country: Country): Language {
    switch (country) {
      case 'BR':
        return 'pt_BR';
      case 'CO':
      case 'PY':
        return 'es_CO'; // Espanhol
      default:
        return 'en_US';
    }
  }

  private translate(key: string, language: Language): string {
    const translations = {
      'welcome.subject': {
        pt_BR: 'Bem-vindo ao HalalSphere',
        es_CO: 'Bienvenido a HalalSphere',
        en_US: 'Welcome to HalalSphere',
      },
      // ...
    };

    return translations[key][language];
  }
}
```

---

## 🌐 Interface Multi-idioma

```typescript
// Detecção automática de idioma baseado no país
export function useLocale() {
  const { company } = useAuth();

  const locale = useMemo(() => {
    if (!company) return 'pt_BR';

    switch (company.country) {
      case 'BR':
        return 'pt_BR';
      case 'CO':
      case 'PY':
        return 'es_CO';
      default:
        return 'en_US';
    }
  }, [company]);

  return { locale, t: (key: string) => translate(key, locale) };
}

// Uso em componentes
export function WelcomePage() {
  const { t } = useLocale();

  return (
    <div>
      <h1>{t('welcome.title')}</h1>
      <p>{t('welcome.description')}</p>
    </div>
  );
}
```

---

## 📋 Resumo das Alterações Necessárias

### **Backend:**

1. ✅ Atualizar `Company` model com campos internacionais
2. ✅ Criar enums: `Country`, `TaxIdType`, `Currency`, `Language`
3. ✅ Implementar `TaxValidationService` para cada país
4. ✅ Atualizar validação de unicidade: `(country, taxId)`
5. ✅ Implementar `CurrencyService` para conversões
6. ✅ Criar templates de email por idioma
7. ✅ Atualizar seeds com exemplos de cada país

### **Frontend:**

1. ✅ Adicionar seleção de país no cadastro
2. ✅ Criar formulários específicos por país (documento fiscal)
3. ✅ Implementar máscaras de input por tipo de documento
4. ✅ Implementar sistema de i18n (internacionalização)
5. ✅ Criar traduções PT-BR e ES
6. ✅ Adaptar formatação de endereço por país
7. ✅ Adaptar formatação de moeda e números

---

## 🎯 Próximos Passos

Agora que temos a internacionalização mapeada, você gostaria que eu:

1. **🗄️ Atualize o schema.prisma** completo com os novos campos?
2. **📝 Atualize o documento de fluxos** considerando multi-país?
3. **🔧 Implemente os serviços de validação** de documentos fiscais?
4. **🎨 Crie as interfaces** de cadastro internacionalizado?

Qual direção prefere seguir? 🚀

---

**Elaborado por**: Claude Code (Assistente de IA)
**Data**: 08 de Dezembro de 2025
**Versão**: 5.0
**Status**: 🌍 Sistema Internacionalizado (BR, CO, PY)
