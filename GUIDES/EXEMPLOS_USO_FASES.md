# Exemplos Práticos - Sistema de Fases do Processo

Este documento contém exemplos práticos de como usar o novo sistema de fases do processo.

## Índice
1. [Backend - TypeScript](#backend-typescript)
2. [Frontend - React](#frontend-react)
3. [Casos de Uso Comuns](#casos-de-uso-comuns)

---

## Backend - TypeScript

### Exemplo 1: Verificar Permissões do Usuário

```typescript
import { canUserActOnPhase, ProcessPhase } from '../modules/process/process.phases';

// No controller ou middleware
async function advancePhase(req, res) {
  const { processId } = req.params;
  const user = req.user; // Do middleware de autenticação

  const process = await prisma.process.findUnique({
    where: { id: processId }
  });

  // Verificar se usuário pode agir na fase atual
  if (!canUserActOnPhase(user.role, process.currentPhase)) {
    return res.status(403).json({
      error: 'Você não tem permissão para agir nesta fase',
      currentPhase: process.currentPhase,
      yourRole: user.role
    });
  }

  // Continuar com a ação...
}
```

### Exemplo 2: Avançar para Próxima Fase

```typescript
import { getNextPhase, getPhaseConfig } from '../modules/process/process.phases';

async function moveToNextPhase(processId: string, userId: string) {
  const process = await prisma.process.findUnique({
    where: { id: processId }
  });

  const nextPhase = getNextPhase(process.currentPhase);

  if (!nextPhase) {
    throw new Error('Processo já está na última fase');
  }

  const nextPhaseConfig = getPhaseConfig(nextPhase);

  // Atualizar processo
  const updatedProcess = await prisma.process.update({
    where: { id: processId },
    data: {
      currentPhase: nextPhase,
      updatedAt: new Date()
    }
  });

  // Registrar no histórico
  await prisma.processPhaseHistory.create({
    data: {
      processId,
      phase: nextPhaseConfig.order,
      enteredAt: new Date()
    }
  });

  // Notificar responsáveis da próxima fase
  await notifyPhaseResponsibles(processId, nextPhase);

  return updatedProcess;
}
```

### Exemplo 3: Obter Informações da Fase

```typescript
import { getPhaseConfig, getAllPhases } from '../modules/process/process.phases';

// Endpoint para obter detalhes da fase
app.get('/api/phases/:phaseId', (req, res) => {
  const phaseConfig = getPhaseConfig(req.params.phaseId);

  if (!phaseConfig) {
    return res.status(404).json({ error: 'Fase não encontrada' });
  }

  res.json({
    phase: phaseConfig.id,
    name: phaseConfig.name,
    order: phaseConfig.order,
    responsibility: phaseConfig.responsibility,
    allowedRoles: phaseConfig.allowedRoles,
    description: phaseConfig.description
  });
});

// Endpoint para listar todas as fases
app.get('/api/phases', (req, res) => {
  const phases = getAllPhases();
  res.json({ phases });
});
```

### Exemplo 4: Atribuir Auditor quando Fase Avança

```typescript
import { ProcessPhase } from '../modules/process/process.phases';

async function advanceToAuditPhase(processId: string, auditorId: string) {
  // Buscar auditor
  const auditor = await prisma.user.findUnique({
    where: { id: auditorId }
  });

  if (auditor.role !== 'auditor') {
    throw new Error('Usuário não é um auditor');
  }

  // Avançar para fase de auditoria e atribuir auditor
  const process = await prisma.process.update({
    where: { id: processId },
    data: {
      currentPhase: ProcessPhase.AUDITORIA_AGENDADA,
      auditorId: auditorId,
      updatedAt: new Date()
    },
    include: {
      auditor: true,
      analyst: true,
      request: true
    }
  });

  // Enviar email para o auditor
  await emailService.sendAuditAssignmentEmail(
    auditor.email,
    auditor.name,
    process
  );

  return process;
}
```

---

## Frontend - React

### Exemplo 1: Exibir Timeline com Progresso

```typescript
import { getAllPhases, getPhaseProgress, getPhaseOrder } from '@/lib/process-phases';

function ProcessTimeline({ currentPhase }: { currentPhase: string }) {
  const phases = getAllPhases();
  const currentOrder = getPhaseOrder(currentPhase);
  const progress = getPhaseProgress(currentPhase);

  return (
    <div className="space-y-4">
      {/* Barra de progresso geral */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Progresso Geral</span>
          <span className="text-sm text-gray-600">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Timeline de fases */}
      <div className="space-y-4">
        {phases.map((phase) => {
          const isCompleted = phase.order < currentOrder;
          const isCurrent = phase.order === currentOrder;

          return (
            <div key={phase.id} className="flex gap-4">
              {/* Ícone */}
              <div className={`text-2xl ${isCurrent ? 'scale-125' : ''}`}>
                {phase.icon}
              </div>

              {/* Conteúdo */}
              <div className="flex-1">
                <h4 className={`font-medium ${
                  isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {phase.name}
                </h4>
                <p className="text-sm text-gray-500">
                  Responsável: {phase.responsibilityLabel}
                </p>
                {isCurrent && (
                  <span className="text-sm text-primary font-medium">
                    Em andamento
                  </span>
                )}
                {isCompleted && (
                  <span className="text-sm text-green-600">✓ Concluída</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### Exemplo 2: Botão de Ação Contextual

```typescript
import { canUserActOnPhase, getNextPhase, getPhaseConfig } from '@/lib/process-phases';

function PhaseActionButton({
  process,
  userRole
}: {
  process: Process;
  userRole: string;
}) {
  const canAct = canUserActOnPhase(userRole, process.currentPhase);
  const nextPhase = getNextPhase(process.currentPhase);
  const nextPhaseConfig = nextPhase ? getPhaseConfig(nextPhase) : null;

  if (!canAct) {
    return (
      <div className="text-sm text-gray-500">
        Você não pode agir nesta fase
      </div>
    );
  }

  const handleAdvance = async () => {
    try {
      await processService.advancePhase(process.id);
      toast.success(`Processo avançado para: ${nextPhaseConfig.name}`);
    } catch (error) {
      toast.error('Erro ao avançar fase');
    }
  };

  return (
    <Button onClick={handleAdvance} disabled={!nextPhase}>
      {nextPhase ? (
        <>
          Avançar para: {nextPhaseConfig.name}
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      ) : (
        'Processo Concluído'
      )}
    </Button>
  );
}
```

### Exemplo 3: Dashboard com Filtros por Fase

```typescript
import { getAllPhases } from '@/lib/process-phases';

function AnalystDashboard() {
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const phases = getAllPhases();

  const { data: processes } = useQuery({
    queryKey: ['processes', selectedPhase],
    queryFn: () => processService.getProcesses({
      phase: selectedPhase || undefined
    })
  });

  return (
    <div>
      {/* Filtros */}
      <div className="mb-6 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setSelectedPhase(null)}
          className={`px-4 py-2 rounded ${
            !selectedPhase ? 'bg-primary text-white' : 'bg-gray-100'
          }`}
        >
          Todas
        </button>
        {phases.map((phase) => (
          <button
            key={phase.id}
            onClick={() => setSelectedPhase(phase.id)}
            className={`px-4 py-2 rounded whitespace-nowrap ${
              selectedPhase === phase.id
                ? 'bg-primary text-white'
                : 'bg-gray-100'
            }`}
          >
            {phase.icon} {phase.name}
          </button>
        ))}
      </div>

      {/* Lista de processos */}
      <div className="grid gap-4">
        {processes?.map((process) => (
          <ProcessCard key={process.id} process={process} />
        ))}
      </div>
    </div>
  );
}
```

---

## Casos de Uso Comuns

### Caso 1: Empresa Cria Nova Solicitação

```typescript
// Backend - process.service.ts
async function createProcess(companyId: string, data: CreateProcessDTO) {
  // ... validações

  const process = await prisma.process.create({
    data: {
      requestId: request.id,
      status: 'aguardando_documentos',
      currentPhase: ProcessPhase.CADASTRO_SOLICITACAO, // ✅ Fase inicial
    }
  });

  // Notificar analistas que há novo processo
  await notifyAnalysts(process);

  return process;
}
```

### Caso 2: Analista Aprova Documentação

```typescript
// Backend - document.controller.ts
async function approveDocuments(processId: string, analystId: string) {
  // Verificar permissão
  const process = await prisma.process.findUnique({
    where: { id: processId }
  });

  if (process.currentPhase !== ProcessPhase.ANALISE_DOCUMENTAL) {
    throw new Error('Processo não está na fase de análise documental');
  }

  // Aprovar documentos
  await prisma.document.updateMany({
    where: { requestId: process.requestId },
    data: { validationStatus: 'aprovado' }
  });

  // Avançar para próxima fase
  await moveToNextPhase(processId, analystId);

  return { success: true };
}
```

### Caso 3: Auditor Completa Auditoria

```typescript
// Backend - audit.service.ts
async function completeAudit(auditId: string, result: AuditResult) {
  const audit = await prisma.audit.update({
    where: { id: auditId },
    data: {
      status: 'concluido',
      result: result,
      completedDate: new Date()
    },
    include: { process: true }
  });

  // Avançar processo para Comitê Técnico
  await prisma.process.update({
    where: { id: audit.processId },
    data: {
      currentPhase: ProcessPhase.COMITE_TECNICO
    }
  });

  // Notificar gestores sobre decisão pendente
  await notifyManagers(audit.processId);

  return audit;
}
```

### Caso 4: Gestor Aprova no Comitê

```typescript
// Backend - committee.controller.ts
async function makeCommitteeDecision(
  processId: string,
  gestorId: string,
  decision: 'aprovar' | 'reprovar'
) {
  const process = await prisma.process.findUnique({
    where: { id: processId }
  });

  if (process.currentPhase !== ProcessPhase.COMITE_TECNICO) {
    throw new Error('Processo não está em comitê técnico');
  }

  // Registrar decisão
  await prisma.committeeDecision.create({
    data: {
      processId,
      decisionType: decision,
      justification: 'Decisão do comitê técnico',
      decidedBy: gestorId
    }
  });

  if (decision === 'aprovar') {
    // Avançar para emissão de certificado
    await prisma.process.update({
      where: { id: processId },
      data: {
        currentPhase: ProcessPhase.CERTIFICADO_EMITIDO,
        status: 'certificado'
      }
    });

    // Gerar certificado
    await generateCertificate(processId);
  }

  return { success: true };
}
```

---

## Dicas e Boas Práticas

1. **Sempre Validar Permissões**
   ```typescript
   if (!canUserActOnPhase(user.role, phase)) {
     throw new UnauthorizedException();
   }
   ```

2. **Registrar Histórico de Mudanças**
   ```typescript
   await prisma.processPhaseHistory.create({
     data: { processId, phase: phaseOrder, enteredAt: new Date() }
   });
   ```

3. **Notificar Responsáveis**
   ```typescript
   const phaseConfig = getPhaseConfig(newPhase);
   await notifyByResponsibility(phaseConfig.responsibility, processId);
   ```

4. **Usar TypeScript para Segurança de Tipos**
   ```typescript
   // ✅ Correto - type-safe
   process.currentPhase = ProcessPhase.ANALISE_DOCUMENTAL;

   // ❌ Evitar - string literal
   process.currentPhase = 'analise_documental';
   ```

5. **Centralizar Lógica de Transição**
   ```typescript
   // Criar um serviço dedicado para transições
   class PhaseTransitionService {
     async advance(processId: string, userId: string) {
       // Validações, histórico, notificações
     }
   }
   ```
