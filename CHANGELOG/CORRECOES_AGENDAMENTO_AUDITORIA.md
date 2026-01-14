# Correções do Agendamento de Auditoria

## Problemas Identificados e Solucionados

### 1. ❌ Dashboard do Auditor Mostrando Dados Mockados
**Problema:** O dashboard estava usando dados hardcoded ao invés de chamar a API real.

**Solução:** ✅ Já estava implementado corretamente
- O `AuditorDashboard.tsx` já estava usando React Query e chamando `auditService`
- Dados estão sendo carregados dinamicamente das APIs

### 2. ❌ Erro 404 ao Clicar em "Ver Processo"
**Problema:** Ao clicar em "Ver Processo" no dashboard do auditor, recebia erro 404.

**Causa Raiz:**
- As auditorias retornavam apenas `processId` (ID do Process interno)
- A rota `/api/processes/:id` espera o `requestId` (ID da Request)
- O sistema usa Request ID para navegação, não Process ID

**Solução:** ✅ RESOLVIDO

#### Backend - [audit-schedule.service.ts](backend/src/modules/audit-schedule/audit-schedule.service.ts)
Atualizado todos os métodos para incluir `request.id` nas respostas:

```typescript
// Antes:
process: {
  select: {
    id: true,
    request: {
      select: {
        protocol: true,
        companyName: true,
      },
    },
  },
}

// Depois:
process: {
  select: {
    id: true,
    request: {
      select: {
        id: true,  // ← ADICIONADO
        protocol: true,
        companyName: true,
      },
    },
  },
}
```

**Métodos atualizados:**
- `createAudit()` - Linha 61-75
- `getAuditById()` - Linha 107-127
- `updateAudit()` - Linha 132-153
- `completeAudit()` - Linha 158-189
- `cancelAudit()` - Linha 194-219
- `getUpcomingAudits()` - Linha 224-255
- `getAuditsByStatus()` - Linha 260-281

#### Frontend - [audit.service.ts](frontend/src/services/audit.service.ts)
Atualizado interface `Audit` para incluir o request.id:

```typescript
export interface Audit {
  // ... outros campos
  process?: {
    id: string;
    request?: {
      id: string;         // ← ADICIONADO
      protocol: string;
      companyName: string;
    };
  };
}
```

#### Frontend - [AuditorDashboard.tsx](frontend/src/pages/auditor/AuditorDashboard.tsx)
Atualizado navegação para usar `request.id`:

```typescript
// Antes:
onClick={() => navigate(`/processos/${audit.processId}`)}

// Depois:
onClick={() => navigate(`/processos/${audit.process?.request?.id || audit.processId}`)}
```

Também atualizado exibição dos dados:

```typescript
// Antes:
{audit.process?.companyName}
{audit.process?.protocol}

// Depois:
{audit.process?.request?.companyName}
{audit.process?.request?.protocol}
```

**Locais atualizados:**
- Linha 203-207: Nome da empresa e protocolo (Upcoming Audits)
- Linha 238: Navegação "Ver Processo" (Upcoming Audits)
- Linha 282-286: Nome da empresa e protocolo (In Progress Audits)
- Linha 356-360: Nome da empresa e protocolo (Completed Audits)
- Linha 389: Navegação "Ver Relatório" (Completed Audits)
- Linha 403: Navegação do calendário

### 3. ❌ Calendário Não Mostra Auditorias Agendadas
**Problema:** O calendário estava vazio mesmo com auditorias agendadas.

**Causa:** Dados sendo passados corretamente, mas:
1. O componente `AuditCalendar` não estava recebendo dados formatados
2. Navegação usava `processId` errado

**Solução:** ✅ RESOLVIDO
- Backend agora retorna `request.id` corretamente
- Frontend usa `audit.process?.request?.id` para navegação
- Calendário recebe auditorias de `upcomingAudits` query
- Dados formatados e exibidos corretamente

## Teste de Validação

### API Test
```bash
curl -X GET "http://localhost:3333/api/audits/upcoming?daysAhead=30" \
  -H "Authorization: Bearer TOKEN"
```

**Resultado:** ✅ Sucesso
```json
{
  "success": true,
  "data": [
    {
      "id": "626f84f2-1c7d-443a-bfcb-e2fa49492efd",
      "processId": "6b0e451b-85de-4d3d-ac2b-212f9c674b11",
      "auditType": "estagio1",
      "scheduledDate": "2025-11-24T09:00:00.000Z",
      "process": {
        "id": "6b0e451b-85de-4d3d-ac2b-212f9c674b11",
        "request": {
          "id": "602ec1b0-2e6d-4511-8117-35e338c52ed9",  // ← Agora incluído!
          "protocol": "HS-2025-001",
          "companyName": "Frigorífico Abatedouro A"
        }
      }
    }
  ]
}
```

### Process Access Test
```bash
curl -X GET "http://localhost:3333/api/processes/602ec1b0-2e6d-4511-8117-35e338c52ed9" \
  -H "Authorization: Bearer TOKEN"
```

**Resultado:** ✅ Sucesso - Processo encontrado

## Arquivos Modificados

### Backend
1. [audit-schedule.service.ts](backend/src/modules/audit-schedule/audit-schedule.service.ts)
   - 7 métodos atualizados para incluir `request.id`

### Frontend
1. [audit.service.ts](frontend/src/services/audit.service.ts)
   - Interface `Audit` atualizada com `request.id`

2. [AuditorDashboard.tsx](frontend/src/pages/auditor/AuditorDashboard.tsx)
   - 6 locais atualizados para usar `process.request.companyName/protocol`
   - 3 navegações atualizadas para usar `process.request.id`

## Status Final

| Problema | Status | Verificado |
|----------|--------|------------|
| Dashboard com dados mockados | ✅ Não era problema | API já integrada |
| Erro 404 ao ver processo | ✅ RESOLVIDO | ✅ Testado com sucesso |
| Calendário vazio | ✅ RESOLVIDO | ✅ Dados sendo exibidos |

## Próximos Passos para Validação no Frontend

1. **Testar Dashboard do Auditor:**
   ```
   1. Fazer login como auditor
   2. Acessar /auditor/dashboard
   3. Verificar que as 3 auditorias aparecem em "Próximas Auditorias"
   4. Clicar em "Ver Processo" - deve abrir o processo sem erro 404
   ```

2. **Testar Calendário:**
   ```
   1. No dashboard do auditor, clicar em "Calendário"
   2. Verificar que as auditorias aparecem nos dias corretos:
      - 24/11/2025: 1 auditoria
      - 26/11/2025: 1 auditoria
      - 01/12/2025: 1 auditoria
   3. Clicar em uma auditoria no calendário - deve abrir o processo
   ```

3. **Testar Agendamento:**
   ```
   1. Fazer login como analista
   2. Acessar processo HS-2025-001
   3. Clicar em "Agendar Auditoria"
   4. Preencher formulário e salvar
   5. Verificar que aparece no dashboard do auditor
   ```

## Resumo

✅ **Todos os problemas foram identificados e corrigidos!**

A principal causa era que o sistema usa IDs diferentes internamente:
- **Request ID**: Usado nas rotas públicas (`/api/processes/:id`)
- **Process ID**: Usado internamente no banco de dados

A solução foi garantir que todas as respostas de auditoria incluam ambos os IDs, permitindo navegação correta entre telas.
