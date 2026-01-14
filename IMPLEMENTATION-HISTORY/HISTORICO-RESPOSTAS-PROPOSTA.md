# Histórico de Respostas de Propostas

**Data**: 2025-12-10
**Funcionalidade**: Sistema de rastreamento completo de todas as respostas (aceites e recusas) de propostas comerciais

---

## 📋 Resumo

Implementado sistema completo de histórico de respostas para propostas comerciais. Agora cada aceite ou recusa é registrado permanentemente, permitindo rastreabilidade completa do processo de negociação.

### Problema Resolvido

**Antes**: Quando uma proposta era recusada, ajustada e depois aceita, o sistema mostrava as observações da recusa antiga como se fossem do aceite:

```
❌ Problema:
1. Empresa recusa proposta: "não concordo com valores homem hora"
2. Analista ajusta valores
3. Analista reenvia proposta
4. Empresa aceita proposta
5. ❌ Sistema mostra: "Observações do Aceite: não concordo com valores homem hora"
```

**Depois**: Sistema mantém histórico completo de todas as respostas:

```
✅ Solução:
📜 Histórico de Respostas:

┌─────────────────────────────────────────┐
│ ❌ Proposta Recusada                     │
│ 09/12/2024 14:30                         │
│ Valor: R$ 15.000,00                      │
│ Observações: não concordo com valores    │
│ homem hora                               │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ✅ Proposta Aceita [Mais recente]       │
│ 10/12/2024 10:15                         │
│ Valor: R$ 12.500,00                      │
│ Observações: valores ajustados, ok!      │
└─────────────────────────────────────────┘
```

---

## 🗄️ Estrutura do Banco de Dados

### Nova Tabela: `proposal_responses`

```sql
CREATE TABLE proposal_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,

  -- Resposta
  accepted BOOLEAN NOT NULL,  -- true = aceita, false = recusada
  notes TEXT,                 -- Observações da empresa

  -- Contexto
  proposal_value DECIMAL(10, 2) NOT NULL,  -- Valor da proposta no momento

  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW(),

  -- Índices
  INDEX idx_proposal_responses_proposal_id (proposal_id),
  INDEX idx_proposal_responses_created_at (created_at)
);
```

### Modelo Prisma

```prisma
model ProposalResponse {
  id         String   @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  proposalId String   @map("proposal_id") @db.Uuid

  // Resposta
  accepted Boolean // true = aceita, false = recusada
  notes    String? @db.Text

  // Contexto da resposta
  proposalValue Decimal @map("proposal_value") @db.Decimal(10, 2)

  // Timestamps
  createdAt DateTime @default(now()) @map("created_at")

  // Relações
  proposal Proposal @relation(fields: [proposalId], references: [id], onDelete: Cascade)

  @@index([proposalId])
  @@index([createdAt])
  @@map("proposal_responses")
}
```

### Alteração na Tabela `proposals`

```prisma
model Proposal {
  // ... campos existentes ...

  // Nova relação
  responses ProposalResponse[] // Histórico de respostas (aceites/recusas)
}
```

**Nota**: O campo `responseNotes` foi mantido por compatibilidade, mas não é mais usado na interface.

---

## 🔧 Implementação Backend

### 1. Service: Criar Registro de Resposta

**Arquivo**: `backend/src/modules/proposal/proposal.service.ts`

```typescript
async respond(id: string, data: RespondProposalDto): Promise<Proposal> {
  const proposal = await this.findById(id);

  // ... validações ...

  const newStatus: ProposalStatus = data.accepted ? 'aceita' : 'recusada';

  // ✅ NOVO: Cria registro no histórico de respostas
  await prisma.proposalResponse.create({
    data: {
      proposalId: id,
      accepted: data.accepted,
      notes: data.responseNotes || null,
      proposalValue: proposal.finalValue,
    },
  });

  // Atualiza a proposta
  const updatedProposal = await prisma.proposal.update({
    where: { id },
    data: {
      status: newStatus,
      respondedAt: new Date(),
      responseNotes: data.responseNotes, // Mantido por compatibilidade
    },
  });

  // ... lógica de avanço de fase ...

  return updatedProposal;
}
```

### 2. Service: Limpar Observações ao Reenviar

**Arquivo**: `backend/src/modules/proposal/proposal.service.ts`

```typescript
async send(id: string): Promise<Proposal> {
  // ... validações ...

  // ✅ NOVO: Limpa responseNotes ao reenviar após recusa
  const updatedProposal = await prisma.proposal.update({
    where: { id },
    data: {
      status: 'enviada',
      sentAt: new Date(),
      validUntil,
      responseNotes: null,   // ✅ Limpa observação da recusa anterior
      respondedAt: null,     // ✅ Limpa data da resposta anterior
    },
  });

  return updatedProposal;
}
```

### 3. Service: Buscar Histórico

**Arquivo**: `backend/src/modules/proposal/proposal.service.ts`

```typescript
/**
 * Busca histórico de respostas de uma proposta
 */
async getResponseHistory(proposalId: string) {
  return prisma.proposalResponse.findMany({
    where: { proposalId },
    orderBy: { createdAt: 'asc' }, // Do mais antigo para o mais recente
  });
}
```

### 4. Controller: Endpoint de Histórico

**Arquivo**: `backend/src/modules/proposal/proposal.controller.ts`

```typescript
/**
 * GET /api/proposals/:id/responses
 * Obter histórico de respostas de uma proposta
 */
export async function getProposalResponseHistory(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    const responses = await proposalService.getResponseHistory(id);

    return reply.send({
      success: true,
      data: responses,
    });
  } catch (error: any) {
    return reply.status(500).send({
      success: false,
      error: error.message,
    });
  }
}
```

### 5. Routes: Registrar Endpoint

**Arquivo**: `backend/src/modules/proposal/proposal.routes.ts`

```typescript
fastify.get('/proposals/:id/responses', controller.getProposalResponseHistory);
```

---

## 🎨 Implementação Frontend

### 1. Types: Interface de Resposta

**Arquivo**: `frontend/src/services/proposal.service.ts`

```typescript
export interface ProposalResponse {
  id: string;
  proposalId: string;
  accepted: boolean;
  notes?: string;
  proposalValue: number;
  createdAt: string;
}
```

### 2. Service: Buscar Histórico

**Arquivo**: `frontend/src/services/proposal.service.ts`

```typescript
class ProposalService {
  // ... outros métodos ...

  async getResponseHistory(proposalId: string): Promise<ProposalResponse[]> {
    const response = await axios.get(`${API_URL}/proposals/${proposalId}/responses`);
    return response.data.data;
  }
}
```

### 3. Component: Carregar e Exibir Histórico

**Arquivo**: `frontend/src/pages/analyst/ProcessProposal.tsx`

```typescript
export function ProcessProposal() {
  // ... states existentes ...
  const [responseHistory, setResponseHistory] = useState<ProposalResponse[]>([]);

  // Carregar histórico quando proposta é carregada
  useEffect(() => {
    if (proposal) {
      setShowAdjustment(true);
      setCalculatedInputs(proposal.calculationInputs);
      loadResponseHistory(); // ✅ Carregar histórico
    }
  }, [proposal]);

  const loadResponseHistory = async () => {
    if (!proposal) return;
    try {
      const history = await proposalService.getResponseHistory(proposal.id);
      setResponseHistory(history);
    } catch (err) {
      console.error('Erro ao carregar histórico de respostas:', err);
    }
  };

  // ... resto do componente ...
}
```

### 4. UI: Exibir Histórico

**Arquivo**: `frontend/src/pages/analyst/ProcessProposal.tsx`

```typescript
{/* Histórico de Respostas */}
{responseHistory.length > 0 && (
  <div className="mt-4 space-y-3">
    <h3 className="font-semibold text-gray-900 mb-2">📜 Histórico de Respostas</h3>
    {responseHistory.map((response, index) => (
      <div
        key={response.id}
        className={`border rounded-lg p-4 ${
          response.accepted
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${
              response.accepted ? 'text-green-800' : 'text-red-800'
            }`}>
              {response.accepted ? '✅ Proposta Aceita' : '❌ Proposta Recusada'}
            </span>
            {index === responseHistory.length - 1 && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Mais recente
              </span>
            )}
          </div>
          <span className="text-xs text-gray-600">
            {new Date(response.createdAt).toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        <div className="text-sm text-gray-600 mb-2">
          Valor da proposta: {formatCurrency(Number(response.proposalValue))}
        </div>

        {response.notes && (
          <div className="mt-2">
            <p className="text-sm font-medium text-gray-700 mb-1">Observações:</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap bg-white bg-opacity-50 p-2 rounded">
              {response.notes}
            </p>
          </div>
        )}
      </div>
    ))}
  </div>
)}
```

### 5. Atualizar Histórico Após Resposta

```typescript
// Botão de Aceitar
onClick={async () => {
  if (confirm('Tem certeza que deseja aceitar esta proposta?')) {
    try {
      await respond(true);
      await loadResponseHistory(); // ✅ Recarregar histórico
      alert('✅ Proposta aceita! O processo avançará para a fase de contrato.');
      navigate(`/processos/${processId}`);
    } catch (err: any) {
      alert(`Erro ao aceitar proposta: ${err.message}`);
    }
  }
}}

// Botão de Recusar
onClick={async () => {
  const reason = prompt('Por favor, informe o motivo da recusa:');
  if (reason && reason.trim()) {
    try {
      await respond(false, reason);
      await loadResponseHistory(); // ✅ Recarregar histórico
      alert(`❌ Proposta recusada.`);
      navigate(`/processos/${processId}`);
    } catch (err: any) {
      alert(`Erro ao recusar proposta: ${err.message}`);
    }
  }
}}
```

---

## 🔄 Fluxo Completo de Negociação

### Cenário 1: Aceite na Primeira Tentativa

```
1. Analista cria proposta → status: 'rascunho'
2. Analista calcula proposta (R$ 15.000,00) → status: 'calculada'
3. Analista envia proposta → status: 'enviada', responseNotes: null
4. Empresa aceita: "Valores ok!"
   ├─ Cria registro: ProposalResponse
   │  ├─ accepted: true
   │  ├─ notes: "Valores ok!"
   │  ├─ proposalValue: 15000
   │  └─ createdAt: 2024-12-10 10:00
   ├─ Proposta: status: 'aceita', responseNotes: "Valores ok!"
   └─ Processo: currentPhase: 'elaboracao_contrato'

✅ Histórico Final:
   [✅ Proposta Aceita - 10/12/2024 10:00 - R$ 15.000,00 - "Valores ok!"]
```

### Cenário 2: Recusa → Ajuste → Aceite

```
1. Analista cria e envia proposta (R$ 15.000,00) → status: 'enviada'

2. Empresa recusa: "não concordo com valores homem hora"
   ├─ Cria registro: ProposalResponse #1
   │  ├─ accepted: false
   │  ├─ notes: "não concordo com valores homem hora"
   │  ├─ proposalValue: 15000
   │  └─ createdAt: 2024-12-09 14:30
   └─ Proposta: status: 'recusada', responseNotes: "não concordo..."

3. Analista ajusta valor (desconto R$ 2.500,00)
   └─ Proposta: finalValue: 12500, status: 'recusada'

4. Analista reenvia proposta
   └─ Proposta: status: 'enviada', responseNotes: null ✅ (limpo!)

5. Empresa aceita: "valores ajustados, ok!"
   ├─ Cria registro: ProposalResponse #2
   │  ├─ accepted: true
   │  ├─ notes: "valores ajustados, ok!"
   │  ├─ proposalValue: 12500
   │  └─ createdAt: 2024-12-10 10:15
   └─ Proposta: status: 'aceita', responseNotes: "valores ajustados, ok!"

✅ Histórico Final (em ordem cronológica):
   [❌ Proposta Recusada - 09/12/2024 14:30 - R$ 15.000,00 - "não concordo..."]
   [✅ Proposta Aceita - 10/12/2024 10:15 - R$ 12.500,00 - "valores ajustados, ok!"]
```

### Cenário 3: Múltiplas Recusas e Ajustes

```
1. Envio inicial (R$ 20.000,00)
2. Recusa #1: "muito caro"
   └─ ProposalResponse #1: accepted=false, value=20000
3. Ajuste para R$ 17.000,00 e reenvio
4. Recusa #2: "ainda caro"
   └─ ProposalResponse #2: accepted=false, value=17000
5. Ajuste para R$ 15.000,00 e reenvio
6. Aceite: "ok agora"
   └─ ProposalResponse #3: accepted=true, value=15000

✅ Histórico Final (rastreabilidade completa):
   [❌ Proposta Recusada - 08/12/2024 - R$ 20.000,00 - "muito caro"]
   [❌ Proposta Recusada - 09/12/2024 - R$ 17.000,00 - "ainda caro"]
   [✅ Proposta Aceita - 10/12/2024 - R$ 15.000,00 - "ok agora"]
```

---

## 📊 Informações Rastreadas

Para cada resposta (aceite ou recusa), o sistema registra:

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| `id` | Identificador único da resposta | "a1b2c3d4-..." |
| `proposalId` | ID da proposta | "e5f6g7h8-..." |
| `accepted` | Se foi aceita ou recusada | `true` / `false` |
| `notes` | Observações da empresa | "não concordo com valores..." |
| `proposalValue` | Valor da proposta naquele momento | 15000.00 |
| `createdAt` | Data e hora da resposta | "2024-12-10T10:15:00Z" |

---

## 🎯 Benefícios

### 1. Rastreabilidade Completa
- ✅ Histórico permanente de todas as negociações
- ✅ Auditoria completa do processo
- ✅ Transparência para ambas as partes

### 2. Correção de Bug Crítico
- ✅ Não mostra mais observação de recusa antiga como aceite
- ✅ Cada resposta tem seu contexto preservado
- ✅ Valor da proposta no momento da resposta é registrado

### 3. Análise de Negociação
- ✅ Ver quantas rodadas de negociação foram necessárias
- ✅ Acompanhar evolução dos valores
- ✅ Identificar padrões de recusa

### 4. Experiência do Usuário
- ✅ Interface clara mostrando cronologia
- ✅ Marcador "Mais recente" para última resposta
- ✅ Cores diferentes para aceite (verde) e recusa (vermelho)
- ✅ Timestamp legível em português

---

## 🧪 Como Testar

### Teste 1: Aceite Direto

1. Como analista, crie e envie uma proposta
2. Como empresa, aceite com observação: "Valores ok!"
3. ✅ Verifique que aparece no histórico:
   ```
   ✅ Proposta Aceita [Mais recente]
   10/12/2024 10:15
   Valor: R$ 15.000,00
   Observações: Valores ok!
   ```

### Teste 2: Recusa → Ajuste → Aceite

1. Como analista, envie proposta de R$ 15.000,00
2. Como empresa, recuse: "muito caro"
3. ✅ Verifique que aparece:
   ```
   ❌ Proposta Recusada [Mais recente]
   Observações: muito caro
   ```
4. Como analista, ajuste para R$ 12.500,00
5. Como analista, reenvie proposta
6. ✅ Verifique que a observação antiga NÃO aparece mais na proposta enviada
7. Como empresa, aceite: "valores ajustados ok"
8. ✅ Verifique que aparecem DUAS entradas no histórico:
   ```
   ❌ Proposta Recusada
   09/12/2024 14:30
   Valor: R$ 15.000,00
   Observações: muito caro

   ✅ Proposta Aceita [Mais recente]
   10/12/2024 10:15
   Valor: R$ 12.500,00
   Observações: valores ajustados ok
   ```

### Teste 3: Múltiplas Recusas

1. Envie proposta
2. Empresa recusa #1: "motivo 1"
3. Ajuste e reenvie
4. Empresa recusa #2: "motivo 2"
5. Ajuste e reenvie
6. Empresa aceita: "ok"
7. ✅ Verifique que aparecem 3 entradas no histórico em ordem cronológica

---

## 📝 Arquivos Modificados

### Backend (4 arquivos)

1. **`backend/prisma/schema.prisma`**
   - Adicionado modelo `ProposalResponse`
   - Adicionado relação `responses` em `Proposal`

2. **`backend/src/modules/proposal/proposal.service.ts`**
   - Método `respond()`: Criar registro de resposta
   - Método `send()`: Limpar `responseNotes` ao reenviar
   - Método `getResponseHistory()`: Buscar histórico

3. **`backend/src/modules/proposal/proposal.controller.ts`**
   - Função `getProposalResponseHistory()`: Endpoint de histórico

4. **`backend/src/modules/proposal/proposal.routes.ts`**
   - Rota `GET /proposals/:id/responses`

### Frontend (2 arquivos)

1. **`frontend/src/services/proposal.service.ts`**
   - Interface `ProposalResponse`
   - Método `getResponseHistory()`

2. **`frontend/src/pages/analyst/ProcessProposal.tsx`**
   - State `responseHistory`
   - Função `loadResponseHistory()`
   - Componente de exibição de histórico
   - Atualização após aceitar/recusar

---

## 🔒 Segurança e Integridade

### Validações Backend

- ✅ Apenas propostas `enviada` podem receber resposta
- ✅ Resposta cria registro permanente (não pode ser deletado manualmente)
- ✅ Cascade delete: se proposta é deletada, histórico também é

### Validações Frontend

- ✅ Apenas empresa pode aceitar/recusar quando status = `enviada`
- ✅ Histórico ordenado cronologicamente (do mais antigo ao mais recente)
- ✅ Marcador visual para resposta mais recente

---

## 📈 Estatísticas Possíveis

Com o histórico completo, é possível criar dashboards com:

- 📊 Taxa de aceite na primeira tentativa
- 📊 Número médio de rodadas de negociação
- 📊 Variação média de valores entre recusa e aceite
- 📊 Tempo médio entre envio e aceite final
- 📊 Principais motivos de recusa

---

## ✅ Checklist de Implementação

- [x] Criar modelo `ProposalResponse` no Prisma
- [x] Adicionar relação em `Proposal`
- [x] Migrar banco de dados (`db push`)
- [x] Implementar `respond()` para criar registro
- [x] Implementar `send()` para limpar `responseNotes`
- [x] Implementar `getResponseHistory()`
- [x] Criar controller `getProposalResponseHistory()`
- [x] Registrar rota `GET /proposals/:id/responses`
- [x] Criar interface `ProposalResponse` no frontend
- [x] Implementar service `getResponseHistory()`
- [x] Adicionar state para histórico
- [x] Criar componente de exibição
- [x] Recarregar histórico após aceitar/recusar
- [x] Testar fluxo completo

---

## 🎉 Resultado Final

Sistema agora possui rastreabilidade completa de negociações:

✅ **Problema original resolvido**: Não mostra mais observação de recusa quando proposta é aceita
✅ **Histórico permanente**: Todas as respostas são registradas
✅ **Interface clara**: Cronologia visual com cores e marcadores
✅ **Auditoria completa**: Timestamp, valor e observações de cada resposta
✅ **Escalável**: Suporta quantas rodadas de negociação forem necessárias

**Status da Implementação**: ✅ **COMPLETO E TESTADO**
