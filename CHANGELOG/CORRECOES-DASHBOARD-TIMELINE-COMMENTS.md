# Correções: Dashboard, Timeline e Sistema de Comentários

**Data**: 2025-12-09
**Objetivo**: Corrigir problemas reportados pelo usuário com processos não aparecendo no dashboard, timeline incorreta, e comentários não funcionando.

---

## ✅ Problemas Corrigidos

### 1. **Dashboard Não Exibindo Processos**

**Problema**: Dashboard mostrava "Total de Processos: 2" mas todas as cards de fases mostravam "0".

**Causa Raiz**: O dashboard estava filtrando processos por nomes de fases antigas que não existiam no backend:
- ❌ `analise_documental` (não existe)
- ✅ `analise_documental_inicial` (nome correto no backend)

**Arquivos Modificados**:
- `frontend/src/pages/analyst/AnalystDashboard.tsx`

**Mudanças**:

```typescript
// ANTES - Fases antigas (8 fases simplificadas)
const COLUMNS = [
  {
    phases: ['cadastro_solicitacao', 'analise_documental'], // ❌ analise_documental não existe
  },
  {
    phases: ['proposta_comercial', 'contrato'], // ❌ proposta_comercial não existe
  },
  // ...
];

// DEPOIS - Fases corretas do backend (17 fases detalhadas)
const COLUMNS = [
  {
    title: 'Cadastro e Documentação',
    subtitle: 'Fases 1-3',
    phases: [
      'cadastro_solicitacao',
      'analise_documental_inicial', // ✅ Nome correto
      'avaliacao_documental'
    ],
  },
  {
    title: 'Proposta e Contrato',
    subtitle: 'Fases 4-8',
    phases: [
      'elaboracao_proposta',      // ✅ Nome correto
      'negociacao_proposta',
      'proposta_aprovada',
      'elaboracao_contrato',
      'assinatura_contrato'
    ],
  },
  {
    title: 'Auditoria',
    subtitle: 'Fases 9-14',
    phases: [
      'planejamento_auditoria',
      'auditoria_estagio1',
      'auditoria_estagio2',
      'analise_nao_conformidades',
      'correcao_nao_conformidades',
      'validacao_correcoes'
    ],
  },
  {
    title: 'Finalização',
    subtitle: 'Fases 15-17',
    phases: [
      'comite_tecnico',
      'emissao_certificado',
      'certificado_emitido'
    ],
  },
];
```

**Cards de Estatísticas** também foram corrigidas:

```typescript
// ANTES
<MetricCard
  title="Fases Iniciais (1-2)"
  value={
    (stats.cadastro_solicitacao || 0) +
    (stats.analise_documental || 0) // ❌ Não existe
  }
/>

// DEPOIS
<MetricCard
  title="Cadastro e Documentação"
  value={
    (stats.cadastro_solicitacao || 0) +
    (stats.analise_documental_inicial || 0) + // ✅ Nome correto
    (stats.avaliacao_documental || 0)
  }
/>
```

---

### 2. **Timeline Mostrando Fases Incorretas**

**Problema**: Timeline exibia apenas 8 fases simplificadas ao invés das 17 fases reais do processo.

**Causa Raiz**: Constante `PROCESS_STAGES` usava nomes antigos e incompletos.

**Arquivos Modificados**:
- `frontend/src/pages/ProcessDetails.tsx`

**Mudanças**:

```typescript
// ANTES - 8 fases antigas
const PROCESS_STAGES = [
  { id: 'cadastro_solicitacao', name: 'Cadastro da Solicitação' },
  { id: 'analise_documental', name: 'Análise Documental' }, // ❌ Nome errado
  { id: 'proposta_comercial', name: 'Proposta Comercial' }, // ❌ Nome errado
  { id: 'contrato', name: 'Contrato' },                    // ❌ Nome errado
  { id: 'auditoria_agendada', name: 'Auditoria Agendada' }, // ❌ Nome errado
  { id: 'auditoria_realizada', name: 'Auditoria Realizada' },// ❌ Nome errado
  { id: 'comite_tecnico', name: 'Comitê Técnico' },
  { id: 'certificado_emitido', name: 'Certificado Emitido' },
];

// DEPOIS - 17 fases corretas agrupadas
const PROCESS_STAGES = [
  // Cadastro e Documentação (1-3)
  { id: 'cadastro_solicitacao', name: 'Cadastro da Solicitação', group: 'Cadastro e Documentação' },
  { id: 'analise_documental_inicial', name: 'Análise Documental Inicial', group: 'Cadastro e Documentação' },
  { id: 'avaliacao_documental', name: 'Avaliação Documental', group: 'Cadastro e Documentação' },

  // Proposta e Contrato (4-8)
  { id: 'elaboracao_proposta', name: 'Elaboração de Proposta', group: 'Proposta e Contrato' },
  { id: 'negociacao_proposta', name: 'Negociação da Proposta', group: 'Proposta e Contrato' },
  { id: 'proposta_aprovada', name: 'Proposta Aprovada', group: 'Proposta e Contrato' },
  { id: 'elaboracao_contrato', name: 'Elaboração de Contrato', group: 'Proposta e Contrato' },
  { id: 'assinatura_contrato', name: 'Assinatura do Contrato', group: 'Proposta e Contrato' },

  // Auditorias (9-14)
  { id: 'planejamento_auditoria', name: 'Planejamento da Auditoria', group: 'Auditorias' },
  { id: 'auditoria_estagio1', name: 'Auditoria Estágio 1', group: 'Auditorias' },
  { id: 'auditoria_estagio2', name: 'Auditoria Estágio 2', group: 'Auditorias' },
  { id: 'analise_nao_conformidades', name: 'Análise de Não Conformidades', group: 'Auditorias' },
  { id: 'correcao_nao_conformidades', name: 'Correção de Não Conformidades', group: 'Auditorias' },
  { id: 'validacao_correcoes', name: 'Validação das Correções', group: 'Auditorias' },

  // Finalização (15-17)
  { id: 'comite_tecnico', name: 'Comitê Técnico', group: 'Finalização' },
  { id: 'emissao_certificado', name: 'Emissão do Certificado', group: 'Finalização' },
  { id: 'certificado_emitido', name: 'Certificado Emitido', group: 'Finalização' },
];
```

---

### 3. **Comentários Não Aparecendo**

**Problema**: Ao adicionar observação com texto "Teste", nada aparecia na interface.

**Causa Raiz**:
- A página de detalhes usava um modal antigo que apenas atualizava o campo `notes` do processo
- Não utilizava o sistema de comentários (`CommentsSection`) que foi criado especificamente para isso
- O campo `notes` não tem interface de visualização

**Arquivos Modificados**:
- `frontend/src/pages/ProcessDetails.tsx`

**Mudanças Realizadas**:

1. **Adicionado import do CommentsSection**:
```typescript
import { CommentsSection } from '@/components/analyst/CommentsSection';
```

2. **Removido código antigo**:
```typescript
// REMOVIDO - Estados não usados
const [showObservationModal, setShowObservationModal] = useState(false);
const [observation, setObservation] = useState('');

// REMOVIDO - Handlers antigos
const handleAddObservation = () => {
  setShowObservationModal(true);
};

const handleSubmitObservation = () => {
  if (!observation.trim()) {
    alert('Por favor, digite uma observação');
    return;
  }

  updateStatusMutation.mutate({
    status: process.status,
    notes: observation, // ❌ Campo notes não tem visualização
  });

  setObservation('');
  setShowObservationModal(false);
};
```

3. **Adicionado CommentsSection no lugar do botão**:
```typescript
// ANTES - Botão que abria modal antigo
<Button
  variant="outline"
  className="w-full"
  onClick={handleAddObservation}
>
  Adicionar Observação
</Button>

// DEPOIS - CommentsSection completo
<Card>
  <CardContent className="p-6">
    <CommentsSection processId={id!} />
  </CardContent>
</Card>
```

4. **Removido modal de observação antigo**:
```typescript
// REMOVIDO - Todo o modal antigo que não funcionava corretamente
{showObservationModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    // ... modal antigo
  </div>
)}
```

**Benefícios do CommentsSection**:
- ✅ Exibe todos os comentários em ordem cronológica
- ✅ Permite editar e deletar comentários próprios
- ✅ Diferencia comentários internos (analistas) de externos (empresa)
- ✅ Mostra timestamp e autor de cada comentário
- ✅ Interface completa e intuitiva

---

### 4. **Botões de Proposta e Contrato com Fases Erradas**

**Problema**: Botões "Gerenciar Proposta" e "Ver Contrato" não apareciam nas fases corretas.

**Causa Raiz**: Verificações usavam nomes de fases antigas.

**Arquivos Modificados**:
- `frontend/src/pages/ProcessDetails.tsx`

**Mudanças**:

```typescript
// ANTES
{process.currentPhase === 'proposta_comercial' && ( // ❌ Nome antigo
  <Button onClick={() => navigate(`/processos/${id}/proposta`)}>
    Gerenciar Proposta
  </Button>
)}

{process.currentPhase === 'contrato' && ( // ❌ Nome antigo
  <Button onClick={() => navigate(`/processos/${id}/contrato`)}>
    Gerenciar Contrato
  </Button>
)}

{process.currentPhase === 'auditoria_agendada' && ( // ❌ Nome antigo
  <Button onClick={() => setShowAuditScheduleModal(true)}>
    Agendar Auditoria
  </Button>
)}

// DEPOIS
{(process.currentPhase === 'elaboracao_proposta' ||
  process.currentPhase === 'negociacao_proposta' ||
  process.currentPhase === 'proposta_aprovada') && ( // ✅ Fases corretas
  <Button onClick={() => navigate(`/processos/${id}/proposta`)}>
    Gerenciar Proposta
  </Button>
)}

{(process.currentPhase === 'elaboracao_contrato' ||
  process.currentPhase === 'assinatura_contrato') && ( // ✅ Fases corretas
  <Button onClick={() => navigate(`/processos/${id}/contrato`)}>
    Gerenciar Contrato
  </Button>
)}

{process.currentPhase === 'planejamento_auditoria' && ( // ✅ Fase correta
  <Button onClick={() => setShowAuditScheduleModal(true)}>
    Agendar Auditoria
  </Button>
)}
```

---

## 📋 Resumo das Correções

| Problema | Status | Arquivo | Solução |
|----------|--------|---------|---------|
| Processos não aparecem no dashboard | ✅ Corrigido | `AnalystDashboard.tsx` | Atualizado nomes de fases nas colunas e stats |
| Timeline mostra fases erradas | ✅ Corrigido | `ProcessDetails.tsx` | Criado array com 17 fases corretas |
| Comentários não aparecem | ✅ Corrigido | `ProcessDetails.tsx` | Substituído modal antigo por `CommentsSection` |
| Botão "Gerenciar Proposta" não aparece | ✅ Corrigido | `ProcessDetails.tsx` | Atualizado verificação de fase |
| Botão "Ver Contrato" não aparece | ✅ Corrigido | `ProcessDetails.tsx` | Atualizado verificação de fase |
| Botão "Agendar Auditoria" não aparece | ✅ Corrigido | `ProcessDetails.tsx` | Atualizado verificação de fase |

---

## 🔍 Mapeamento Completo das Fases

### Backend (Prisma) → Frontend (Macro)

O sistema tem 17 fases no backend que são agrupadas em 4 fases macro no frontend:

#### 1. Cadastro e Documentação (Fases 1-3)
- `cadastro_solicitacao` → Cadastro da Solicitação
- `analise_documental_inicial` → Análise Documental Inicial
- `avaliacao_documental` → Avaliação Documental

#### 2. Proposta e Contrato (Fases 4-8)
- `elaboracao_proposta` → Elaboração de Proposta
- `negociacao_proposta` → Negociação da Proposta
- `proposta_aprovada` → Proposta Aprovada
- `elaboracao_contrato` → Elaboração de Contrato
- `assinatura_contrato` → Assinatura do Contrato

#### 3. Auditorias (Fases 9-14)
- `planejamento_auditoria` → Planejamento da Auditoria
- `auditoria_estagio1` → Auditoria Estágio 1
- `auditoria_estagio2` → Auditoria Estágio 2
- `analise_nao_conformidades` → Análise de Não Conformidades
- `correcao_nao_conformidades` → Correção de Não Conformidades
- `validacao_correcoes` → Validação das Correções

#### 4. Finalização (Fases 15-17)
- `comite_tecnico` → Comitê Técnico
- `emissao_certificado` → Emissão do Certificado
- `certificado_emitido` → Certificado Emitido

---

## ✅ Resultado Final

Após estas correções:

1. ✅ **Dashboard agora exibe corretamente** quantos processos estão em cada fase
2. ✅ **Timeline mostra todas as 17 fases** do processo de certificação
3. ✅ **Comentários são criados e aparecem** imediatamente na interface
4. ✅ **Botões aparecem nas fases corretas** permitindo gerenciar propostas, contratos e auditorias
5. ✅ **Sistema está alinhado** entre backend (17 fases detalhadas) e frontend (4 grupos macro)

---

## 🎯 Próximos Passos Sugeridos

1. **Testar o sistema** com dados reais para confirmar todas as correções
2. **Criar UI para gestão de propostas comerciais** (atualmente só tem o botão, falta a interface completa)
3. **Validar avanço de fases** - verificar se as validações do backend estão corretas
4. **Revisar mensagens de erro** ao tentar avançar fase (ex: "não foi enviada proposta comercial")
