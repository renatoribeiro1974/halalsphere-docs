# Fluxo de Solicitação de Certificação Halal

## Visão Geral

O processo de solicitação de certificação Halal foi estruturado em **9 etapas** para garantir a coleta completa e organizada de informações necessárias para análise.

---

## Etapas do Wizard

### **Etapa 1: Dados da Empresa**

**Objetivo**: Coletar informações básicas da empresa solicitante.

**Campos obrigatórios**:
- Nome da Empresa *
- CNPJ *
- Endereço Completo *
- Telefone *
- Nome do Contato *
- Email do Contato *

**Validações**:
- CNPJ deve ser válido (formato 00.000.000/0000-00)
- Email deve ser válido
- Todos os campos são obrigatórios

---

### **Etapa 2: Classificação Industrial (NOVO)**

**Objetivo**: Classificar a empresa de acordo com o padrão GSO 2055-2.

**Estrutura Hierárquica**:
1. **Grupo** (A, B, C, D)
   - A: Agricultura
   - B: Plantação Agrícola
   - C: Processamento de Alimentos e Rações
   - D: Produção de Ração Animal

2. **Categoria** (AI, AII, BI, BII, CI, CII, CIII, CIV, DI, DII)
   - Cada grupo possui categorias específicas

3. **Subcategoria**
   - Detalhamento específico de cada categoria com exemplos de atividades

**Campos obrigatórios**:
- Grupo Industrial *
- Categoria Industrial *
- Subcategoria Industrial *

**Interface**:
- Seleção em 3 sub-passos sequenciais:
  1. Seleção do Grupo (cards visuais com ícones)
  2. Seleção da Categoria (lista de categorias do grupo)
  3. Seleção da Subcategoria (com exemplos de atividades)
- Breadcrumb mostrando caminho completo: Grupo > Categoria > Subcategoria
- Indicador de progresso visual
- Possibilidade de voltar aos passos anteriores

**Validações**:
- Todos os 3 níveis devem ser selecionados
- Classificação completa exibida ao final da seleção

---

### **Etapa 3: Tipo de Produto**

**Objetivo**: Identificar a categoria e detalhes do produto a ser certificado.

**Campos obrigatórios**:
- Categoria do Produto * (C1-C6)
  - C1: Alimentos Processados
  - C2: Ingredientes e Aditivos
  - C3: Cosméticos e Higiene
  - C4: Farmacêuticos
  - C5: Embalagens
  - C6: Serviços de Alimentação
- Descrição Detalhada do Produto *

**Interface**:
- Cards visuais para seleção de categoria
- Campo de texto expandido para descrição
- Dicas sobre o que incluir na descrição

---

### **Etapa 4: Dados de Produção**

**Objetivo**: Coletar informações sobre capacidade e processos de produção.

**Campos obrigatórios**:
- Capacidade de Produção Mensal *
- Endereço da Produção *

**Campos opcionais**:
- Possui outras certificações? (checkbox)
  - Se sim: Quais certificações? (ISO, HACCP, etc.)

**Validações**:
- Capacidade deve incluir unidade de medida
- Endereço completo da unidade produtiva

---

### **Etapa 5: Ingredientes e Fornecedores**

**Objetivo**: Documentar ingredientes utilizados e cadeia de fornecimento.

**Campos obrigatórios**:
- Lista de Ingredientes *
- Lista de Fornecedores *

**Campos opcionais**:
- Contém ingredientes de origem animal? (checkbox)
  - Se sim: Detalhes dos Ingredientes Animais (origem, tipo, certificação)

**Validações**:
- Ingredientes e fornecedores devem ser listados de forma clara
- Ingredientes de origem animal requerem detalhamento específico

---

### **Etapa 6: Documentação**

**Objetivo**: Upload de documentos necessários para análise.

**Formatos aceitos**:
- PDF, PNG, JPG, JPEG, DOC, DOCX

**Limites**:
- Máximo: 20 arquivos
- Tamanho máximo por arquivo: 15MB

**Documentos recomendados**:
- ✓ Licença de Funcionamento (Alvará ou licença sanitária)
- ✓ Fluxograma de Produção (Diagrama do processo produtivo)
- ✓ Lista de Ingredientes (Com especificações técnicas e fichas de segurança)
- ✓ Certificados de Fornecedores (Certificados Halal dos fornecedores, se aplicável)
- ○ Fotos da Instalação (Imagens da área de produção - opcional)

**Interface**:
- Drag & drop para múltiplos arquivos
- Preview de imagens
- Lista de arquivos anexados com opção de remoção
- Indicador de progresso de upload
- Validação de tipo e tamanho de arquivo

---

### **Etapa 7: Revisão e Submissão**

**Objetivo**: Revisar todas as informações antes do envio.

**Exibição**:
- Resumo organizado por seções:
  1. Dados da Empresa
  2. Classificação Industrial
  3. Produto
  4. Produção
  5. Ingredientes
  6. Documentos anexados

**Campos obrigatórios**:
- Aceite dos Termos de Serviço * (checkbox)

**Declaração**:
> "Declaro que todas as informações fornecidas são verdadeiras e estou ciente de que informações falsas podem resultar na recusa ou cancelamento da certificação."

**Ações**:
- Editar qualquer seção (volta ao step correspondente)
- Enviar Solicitação (se termos aceitos)

---

## Funcionalidades Adicionais

### Modo de Entrada Alternativo: Chat IA

**Descrição**: Além do formulário tradicional, o usuário pode optar por preencher a solicitação através de uma conversa com IA.

**Funcionalidades**:
- Interface de chat conversacional
- IA extrai dados estruturados da conversa
- Dados preenchem automaticamente o formulário
- Possibilidade de alternar entre modo chat e formulário

**Toggle**: Botão no topo da página permite alternar entre:
- 📝 Formulário (modo tradicional)
- 💬 Chat IA (modo conversacional)

### Auto-Save (Rascunho)

**Funcionalidades**:
- Salvamento automático no localStorage a cada 1,5 segundos
- Indicador visual de status: "Salvando...", "Salvo há 2 min"
- Recuperação automática ao retornar
- Limpeza após envio bem-sucedido

### Barra Lateral de Pré-visualização

**Exibição** (apenas desktop):
- Progresso geral: X/9 etapas completadas
- Seções expansíveis para cada step
- Indicadores visuais de completude
- Navegação rápida entre steps
- Botão "Pronto para enviar!" quando todas as etapas estão completas

---

## Tela de Sucesso

Após envio bem-sucedido:

**Informações exibidas**:
- ✓ Ícone de sucesso
- Número de protocolo (ex: HS-2025-00123)
- ID do processo
- Próximos passos:
  1. Analista revisará em até 2 dias úteis
  2. Acompanhe o status no dashboard
  3. Notificações por email

**Ações disponíveis**:
- Ver Detalhes do Processo
- Voltar ao Dashboard

---

## Fluxo de Dados

### Frontend → Backend

```typescript
interface CreateProcessData {
  // Step 1
  companyName: string;
  cnpj: string;
  address: string;
  phone: string;
  contactName: string;
  contactEmail: string;

  // Step 2 (NOVO)
  industrialGroup: string;        // A, B, C, D
  industrialCategory: string;     // AI, AII, BI, etc
  industrialSubcategory: string;  // Código da subcategoria

  // Step 3
  productType: string;
  productDescription: string;
  productCategory: string;        // C1-C6

  // Step 4
  productionCapacity: string;
  productionAddress: string;
  hasOtherCertifications: boolean;
  otherCertifications?: string;

  // Step 5
  ingredients: string;
  suppliers: string;
  hasAnimalIngredients: boolean;
  animalIngredientDetails?: string;

  // Step 7
  agreedToTerms: boolean;
}
```

### Database Schema (Prisma)

```prisma
model Request {
  // ... outros campos

  // Classificação Industrial (GSO 2055-2)
  industrialGroup      String?  @map("industrial_group") @db.VarChar(10)
  industrialCategory   String?  @map("industrial_category") @db.VarChar(10)
  industrialSubcategory String? @map("industrial_subcategory") @db.VarChar(50)

  // ... outros campos

  @@index([industrialGroup])
  @@index([industrialCategory])
}
```

---

## Validações e Regras de Negócio

### Validações por Etapa:

1. **Dados da Empresa**: Todos os campos obrigatórios preenchidos
2. **Classificação Industrial**: 3 níveis selecionados (grupo, categoria, subcategoria)
3. **Tipo de Produto**: Categoria e descrição preenchidas
4. **Produção**: Capacidade e endereço preenchidos
5. **Ingredientes**: Ingredientes e fornecedores preenchidos
6. **Documentação**: Pelo menos 1 documento anexado (opcional para mockup)
7. **Revisão**: Termos aceitos

### Navegação:

- Usuário pode avançar e voltar entre steps
- Pode pular para qualquer step através da sidebar
- Dados são preservados ao navegar entre steps
- Auto-save funciona em todos os steps

---

## Melhorias Futuras

1. **Validação Avançada**:
   - Verificação de CNPJ em tempo real via API da Receita
   - Validação de endereço via API de CEP
   - Sugestões de fornecedores já cadastrados

2. **Classificação Inteligente**:
   - IA sugere classificação industrial baseada na descrição do produto
   - Auto-complete para subcategorias

3. **Upload Inteligente**:
   - OCR para extração de dados de documentos
   - Classificação automática de tipos de documento
   - Validação de completude de documentos

4. **Analytics**:
   - Tracking de abandono por step
   - Tempo médio em cada etapa
   - Identificação de campos problemáticos

---

## Referências

- **GSO 2055-2**: Condições de Concessão, Manutenção, Extensão, Redução, Suspensão, Cancelamento - Termo e Renovação da Certificação Halal
- **Categorias Industriais**: Documento "Categorias Industriais.pdf" (Grupos A-D, Categorias AI-DII)

---

**Última atualização**: 16/11/2025
**Versão**: 2.0 (incluindo Classificação Industrial)
