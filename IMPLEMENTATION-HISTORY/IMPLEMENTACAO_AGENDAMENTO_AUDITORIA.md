# Implementação do Agendamento de Auditoria

## Resumo

Implementação completa do módulo de agendamento de auditoria, incluindo:
- Botão de agendamento na interface do analista
- Modal de agendamento com seleção de data, hora, tipo e local
- Dashboard do auditor com visualização de lista e calendário
- Integração completa com backend
- Testes funcionais

## Arquivos Modificados

### Frontend

#### 1. [ProcessDetails.tsx](frontend/src/pages/ProcessDetails.tsx)
**Modificações:**
- Adicionado import do ícone `Calendar` do lucide-react
- Adicionado import do componente `AuditScheduleModal`
- Adicionado estado `showAuditScheduleModal` para controlar a exibição do modal
- Adicionado botão "Agendar Auditoria" que aparece quando o processo está na fase `auditoria_agendada`
- Adicionado renderização do modal de agendamento

**Localização do botão:** Linha 538-547

```tsx
{/* Botão Agendar Auditoria */}
{process.currentPhase === 'auditoria_agendada' && (
  <Button
    className="w-full flex items-center justify-center gap-2"
    onClick={() => setShowAuditScheduleModal(true)}
  >
    <Calendar className="w-4 h-4" />
    Agendar Auditoria
  </Button>
)}
```

#### 2. [AuditorDashboard.tsx](frontend/src/pages/auditor/AuditorDashboard.tsx)
**Modificações:**
- Substituído dados mockados por chamadas reais à API usando React Query
- Adicionado integração com `auditService`
- Implementado carregamento de estatísticas, auditorias agendadas, em andamento e concluídas
- Adicionado navegação para processos ao clicar em "Ver Processo" ou "Ver Relatório"
- Implementado alternância entre visualização de lista e calendário
- Integrado componente `AuditCalendar` na visualização de calendário

**Queries implementadas:**
- `audit-statistics`: Estatísticas gerais de auditorias
- `audits-upcoming`: Auditorias próximas (30 dias)
- `audits-in-progress`: Auditorias em andamento
- `audits-completed`: Auditorias concluídas

#### 3. [AuditCalendar.tsx](frontend/src/components/auditor/AuditCalendar.tsx) - **NOVO**
**Funcionalidades:**
- Visualização mensal de auditorias agendadas
- Navegação entre meses (anterior/próximo)
- Botão "Hoje" para voltar ao mês atual
- Indicação visual do dia atual
- Exibição de até 2 auditorias por dia, com indicação de "+N mais" se houver mais
- Cores diferentes por tipo de auditoria:
  - 🔵 Estágio 1 (azul)
  - 🟢 Estágio 2 (verde)
  - 🟡 Vigilância (amarelo)
  - 🟣 Especial (roxo)
- Click em auditoria para navegar ao processo
- Legenda explicativa dos tipos

### Backend

#### 4. [audit-schedule.controller.ts](backend/src/modules/audit-schedule/audit-schedule.controller.ts)
**Modificações:**
- Atualizado permissões para permitir que auditores também acessem as APIs:
  - `getUpcomingAudits`: Agora permite analistas **e auditores**
  - `getAuditsByStatus`: Agora permite analistas **e auditores**
  - `getAuditStatistics`: Agora permite analistas **e auditores**

**Justificativa:** Auditores precisam visualizar suas próprias auditorias agendadas no dashboard.

## Arquivos Já Existentes (Não Modificados)

### Frontend
- [AuditScheduleModal.tsx](frontend/src/components/analyst/AuditScheduleModal.tsx) - Modal completo de agendamento
- [audit.service.ts](frontend/src/services/audit.service.ts) - Service com todas as funções de API

### Backend
- [audit-schedule.service.ts](backend/src/modules/audit-schedule/audit-schedule.service.ts) - Lógica de negócio
- [audit-schedule.routes.ts](backend/src/modules/audit-schedule/audit-schedule.routes.ts) - Rotas registradas
- [server.ts](backend/src/server.ts) - Rotas já registradas no servidor

## Teste Implementado

### [test-audit-schedule.js](test-audit-schedule.js) - **NOVO**

Script de teste completo que valida:

1. ✅ Busca de processos
2. ✅ Criação de agendamento de auditoria
3. ✅ Busca de auditorias por processo
4. ✅ Estatísticas de auditorias
5. ✅ Lista de auditorias próximas
6. ✅ Atualização de auditoria

**Como executar:**
```bash
node test-audit-schedule.js
```

**Resultado do teste:**
```
✨ All tests completed successfully!

📋 Summary:
   ✓ Process selected: HS-2025-001
   ✓ Audit scheduled: b277feab-c976-41c3-8351-b06dcb176d14
   ✓ Statistics retrieved
   ✓ Upcoming audits listed
   ✓ Audit updated
```

## Fluxo Completo de Uso

### Para o Analista:

1. **Acessar processo:** Navegar para um processo específico
2. **Verificar fase:** Certifique-se de que o processo está na fase `auditoria_agendada`
3. **Agendar auditoria:**
   - Clicar no botão "Agendar Auditoria" na sidebar de ações
   - Preencher o formulário no modal:
     - Tipo de auditoria (Estágio 1, 2, Vigilância, Especial)
     - Data da auditoria
     - Hora da auditoria
     - Tipo (Presencial ou Remota)
     - Endereço (se presencial)
     - Observações do auditor (opcional)
   - Clicar em "Agendar Auditoria"
4. **Confirmação:** Toast de sucesso aparece e o modal fecha

### Para o Auditor:

1. **Acessar dashboard:** Navegar para `/auditor/dashboard`
2. **Visualizar estatísticas:** Cards no topo mostram:
   - Auditorias agendadas
   - Em andamento
   - Concluídas
   - Total de auditorias
3. **Visualização em lista (padrão):**
   - **Próximas Auditorias:** Lista das auditorias dos próximos 30 dias
   - **Em Andamento:** Auditorias sendo realizadas
   - **Concluídas Recentemente:** Últimas 10 auditorias finalizadas
4. **Visualização em calendário:**
   - Clicar no botão "Calendário"
   - Navegar entre meses
   - Ver auditorias em cada dia
   - Clicar em uma auditoria para ir ao processo

## APIs Disponíveis

### Auditorias

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| POST | `/api/audits` | Criar agendamento | Analista |
| GET | `/api/audits/:id` | Buscar auditoria | Todos autenticados |
| PATCH | `/api/audits/:id` | Atualizar auditoria | Analista |
| DELETE | `/api/audits/:id` | Deletar auditoria | Analista |
| POST | `/api/audits/:id/complete` | Concluir auditoria | Analista |
| POST | `/api/audits/:id/cancel` | Cancelar auditoria | Analista |
| GET | `/api/audits/upcoming` | Próximas auditorias | Analista, Auditor |
| GET | `/api/audits/status/:status` | Por status | Analista, Auditor |
| GET | `/api/audits/statistics` | Estatísticas | Analista, Auditor |
| GET | `/api/processes/:processId/audits` | Auditorias do processo | Todos autenticados |

### Tipos de Auditoria (AuditType)
- `estagio1`: Auditoria Estágio 1 - Documental
- `estagio2`: Auditoria Estágio 2 - Implementação
- `vigilancia`: Auditoria de Vigilância
- `especial`: Auditoria Especial

### Status de Auditoria (AuditStatus)
- `agendado`: Auditoria agendada
- `em_andamento`: Auditoria em andamento
- `concluido`: Auditoria concluída
- `cancelado`: Auditoria cancelada

### Resultado de Auditoria (AuditResult)
- `aprovado`: Aprovado
- `aprovado_condicional`: Aprovado com ressalvas
- `reprovado`: Reprovado

## Próximas Melhorias Sugeridas

1. **Notificações:**
   - Notificar auditor quando uma auditoria for agendada
   - Lembrete 24h antes da auditoria
   - Notificação quando auditoria for cancelada

2. **Atribuição de Auditor:**
   - Permitir que analista selecione um auditor específico
   - Mostrar disponibilidade de auditores

3. **Checklist de Auditoria:**
   - Implementar checklist específico por tipo de auditoria
   - Progresso visual da auditoria

4. **Relatórios:**
   - Geração automática de relatório de auditoria
   - Template PDF para impressão

5. **Calendário Avançado:**
   - Visualização semanal/diária
   - Drag-and-drop para reagendar
   - Sincronização com calendário externo (Google, Outlook)

6. **Videoconferência:**
   - Integração com Zoom/Meet para auditorias remotas
   - Link gerado automaticamente

## Notas Técnicas

- **Estado do Modal:** Controlado por estado local no componente `ProcessDetails`
- **React Query:** Usado para cache e sincronização de dados
- **Validação:** Zod usado no backend para validação de schema
- **Datas:** Todas as datas são armazenadas em UTC no banco de dados
- **Permissões:** Verificadas no controller antes de executar ações
- **Relacionamentos:** Auditoria está relacionada a `Process` via `processId`

## Conclusão

O módulo de agendamento de auditoria está completamente funcional e integrado ao sistema. O fluxo permite que analistas agendem auditorias e auditores visualizem suas agendas tanto em formato de lista quanto em calendário visual.

Todos os testes foram executados com sucesso e o sistema está pronto para uso em produção.
