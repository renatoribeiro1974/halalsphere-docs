# Melhoria de UX - Wizard de Solicitação

## Resumo das Alterações

Implementada uma melhoria significativa na experiência do usuário do wizard de solicitação de certificação Halal, removendo a etapa desnecessária de seleção de país e implementando detecção automática baseada no documento fiscal.

## Alterações Implementadas

### 1. Detecção Automática de País ✅

**Arquivo**: `frontend/src/types/international.ts`

Adicionadas duas novas funções utilitárias:

- `detectCountryFromTaxIdType(taxIdType: TaxIdType): Country`
  - Detecta automaticamente o país baseado no tipo de documento fiscal selecionado
  - Mapeamento:
    - CNPJ/CPF → Brasil (BR)
    - NIT/RUT → Colômbia (CO)
    - RUC/CI → Paraguai (PY)

- `getAllTaxIdTypes(): TaxIdType[]`
  - Retorna todos os tipos de documentos fiscais disponíveis em todos os países
  - Usado para popular o seletor universal de documentos

### 2. Novo Componente UniversalTaxIdInput ✅

**Arquivo**: `frontend/src/components/wizard/UniversalTaxIdInput.tsx`

Componente criado com as seguintes características:

- **Seletor Universal de Documentos**: Permite escolher qualquer tipo de documento fiscal (CNPJ, CPF, NIT, RUT, RUC, CI)
- **Detecção Automática de País**: Mostra visualmente o país detectado com bandeira e nome
- **Validação em Tempo Real**: Valida o formato do documento conforme o tipo selecionado
- **Feedback Visual**: Ícones de status (loading, válido, inválido)
- **Máscaras Específicas**: Aplica máscaras de formatação específicas para cada tipo de documento
- **Interface Intuitiva**: Indicador visual destacado mostrando o país detectado

### 3. Reestruturação do Wizard ✅

**Arquivo**: `frontend/src/pages/company/NewRequestWizard.tsx`

Principais alterações:

#### Etapas Reduzidas
- **Antes**: 10 etapas (0-9)
- **Depois**: 9 etapas (0-8)

#### Nova Ordem das Etapas
0. **Dados da Empresa** (antes era etapa 1)
   - Nome da Empresa
   - Documento Fiscal (com detecção automática de país)
   - Telefone e Email
   - Endereço
   - Nome do Contato

1. **Classificação Industrial** (antes era etapa 2)
2. **Origem do Produto** (antes era etapa 3)
3. **Produção** (antes era etapa 4)
4. **Detalhes do Produto** (antes era etapa 5)
5. **Fornecedores** (antes era etapa 6)
6. **Mercados** (antes era etapa 7)
7. **Documentação** (antes era etapa 8)
8. **Revisão** (antes era etapa 9)

#### Mudanças no Código
- Removida importação do `CountrySelector`
- Removida importação do `TaxIdInput`
- Adicionada importação do `UniversalTaxIdInput`
- Removida variável `taxIdValid` não utilizada
- Atualizado tipo `WizardStep` de `0 | 1 | ... | 9` para `0 | 1 | ... | 8`
- Atualizada lógica de navegação (limite de 8 ao invés de 9)
- Removido case 0 que exibia `CountrySelector`
- Atualizado case 0 (antes case 1) para usar `UniversalTaxIdInput`
- Renumerados todos os cases subsequentes

### 4. Fluxo Melhorado

#### Antes:
1. Usuário seleciona país
2. Usuário preenche dados da empresa
3. Usuário preenche documento fiscal (limitado ao país selecionado)

#### Depois:
1. Usuário preenche nome da empresa
2. Usuário seleciona tipo de documento fiscal (todos os países disponíveis)
3. **Sistema detecta automaticamente o país**
4. Sistema mostra visualmente o país detectado
5. Usuário preenche demais dados

## Benefícios da Melhoria

### 1. Menos Etapas
- Redução de 10 para 9 etapas
- Processo mais rápido e direto

### 2. Melhor UX
- Usuário não precisa pensar em "qual país selecionar primeiro"
- Detecção automática elimina possibilidade de erro (selecionar Brasil mas preencher RUC paraguaio)
- Feedback visual claro do país detectado

### 3. Mais Intuitivo
- Fluxo natural: "Qual seu documento?" → Sistema detecta o país
- Alinhado com expectativa do usuário de começar preenchendo dados da empresa

### 4. Flexibilidade
- Fácil trocar de país apenas mudando o tipo de documento
- Não precisa voltar etapas para mudar país

### 5. Visual Atraente
- Indicador destacado com bandeira do país
- Ícones de validação em tempo real
- Mensagens de status claras

## Compatibilidade

✅ **Mantida compatibilidade com backend**
- Campo `country` continua sendo enviado
- Campo `cnpj` (deprecated) continua sendo enviado para compatibilidade
- Novos campos `taxId` e `taxIdType` adicionados

✅ **Sem breaking changes**
- Toda funcionalidade existente mantida
- Apenas reorganização e melhoria de UX

## Testes Realizados

✅ Compilação sem erros
✅ Servidor frontend iniciado com sucesso
✅ Tipos TypeScript validados
✅ Imports otimizados (removidos não utilizados)

## Como Testar

1. Acesse: http://localhost:5174
2. Navegue para "Nova Solicitação"
3. Observe que a primeira etapa já é "Dados da Empresa"
4. Selecione diferentes tipos de documentos fiscais
5. Observe o país sendo detectado automaticamente
6. Preencha um documento válido e veja a validação em tempo real

## Próximos Passos Sugeridos

1. Implementar validação real no backend (atualmente só valida formato)
2. Adicionar testes unitários para `detectCountryFromTaxIdType`
3. Adicionar testes de integração para o `UniversalTaxIdInput`
4. Considerar adicionar mais países/tipos de documentos no futuro
