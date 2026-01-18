# Fase 1.4: Process Module - Plano de Implementação

**Status**: 🚧 EM ANDAMENTO (30% concluído)
**Data de Início**: 14 de Janeiro de 2026
**Complexidade**: ⚠️ ALTA (Módulo mais complexo do sistema)

---

## ✅ Progresso Atual

### Concluído
- ✅ Análise completa do módulo Process do Fastify (agente Explore)
- ✅ `process.types.ts` - Enums, types e configuração das 17 fases (321 linhas)
- ✅ `dto/create-process.dto.ts` - DTO complexo com validação (138 linhas)
- ✅ `dto/update-process-status.dto.ts` - DTO de atualização de status (22 linhas)
- ✅ `dto/assign-analyst.dto.ts` - DTO de atribuição de analista (23 linhas)

### Pendente
- 🔜 `process.service.ts` - Lógica de negócio principal (~500 linhas)
- 🔜 `process-transition.service.ts` - Máquina de estados (~300 linhas)
- 🔜 `process.controller.ts` - 7 endpoints REST (~250 linhas)
- 🔜 `process.module.ts` - Módulo NestJS (~20 linhas)
- 🔜 `__tests__/phase1.4/process.spec.ts` - Testes unitários (~600 linhas)
- 🔜 `__tests__/phase1.4/process-transition.spec.ts` - Testes de transições (~400 linhas)

**Total Estimado**: ~2,100 linhas de código + ~1,000 linhas de testes

---

## 📋 Requisitos Funcionais

### 1. ProcessService - Métodos Principais

#### 1.1 Geração de Protocolo
```typescript
async generateProtocol(): Promise<string>
// Formato: HS-YYYY-NNN
// Exemplo: HS-2025-001
// Lógica: Conta Request do ano atual + 1
```

#### 1.2 Criar Processo (Wizard Multi-Etapa)
```typescript
async createProcess(companyId: string, data: CreateProcessDto): Promise<ProcessResponse>
```
**Fluxo Transacional**:
1. Gerar protocolo único
2. Resolver IDs de classificação industrial (Group/Category/Subcategory)
3. Mapear `productType` → `CertificationType` (C1-C6)
4. Criar `Request` com dados JSON estruturados
5. Criar `Process` com status='rascunho', phase='cadastro_solicitacao'
6. Retornar ProcessResponse

**Mapeamento ProductType → CertificationType**:
- `alimentos` → C1
- `cosmeticos` → C3
- `suplementos` → C1
- `farmaceuticos` → C4
- `outros` → C1 (default)

**Mapeamento hasAnimalIngredients → ProductOrigin**:
- `false` → vegetal
- `true` → misto

#### 1.3 Listar Processos (Role-Based)
```typescript
async getProcessesByCompany(companyId: string): Promise<ProcessResponse[]>
async getProcessesByAnalyst(analystId: string): Promise<ProcessResponse[]>
async getAllProcesses(): Promise<ProcessResponse[]>
async getProcessesByPhases(phases: ProcessPhase[]): Promise<ProcessResponse[]>
```

**Regras de Acesso**:
- `empresa`: apenas seus processos (via companyId)
- `analista`: TODOS os processos (pode pegar desassignados)
- `juridico`: apenas fases [elaboracao_contrato, assinatura_contrato]
- `comercial`: apenas fases [elaboracao_proposta, negociacao_proposta, proposta_aprovada]
- `admin/gestor/auditor/financeiro`: todos os processos

#### 1.4 Detalhes do Processo
```typescript
async getProcessById(requestId: string): Promise<ProcessDetailResponse>
```
**Inclui**:
- Relação com analyst, industrialGroup/Category/Subcategory
- Mapeia campos JSON (productDetails, productionDetails)
- Calcula daysInStage

#### 1.5 Submeter Wizard (Empresa)
```typescript
async submitWizard(requestId: string): Promise<ProcessResponse>
```
**Validações**:
- Fase deve ser `cadastro_solicitacao`
- Status deve ser `rascunho`

**Transição**:
- Process: status → `pendente` (mesma fase)
- Request: status → `enviado`, submittedAt = NOW

#### 1.6 Atribuir Analista
```typescript
async assignAnalyst(requestId: string, data: AssignAnalystDto): Promise<ProcessResponse>
```
**Lógica Especial**:
- Se phase=`cadastro_solicitacao` AND status=`pendente`:
  - Avança para phase=`analise_documental_inicial`
  - Muda status=`em_andamento`
- Atualiza analystId e priority

#### 1.7 Auto-atribuir Analista
```typescript
async autoAssignAnalyst(requestId: string, analystId: string): Promise<ProcessResponse>
```
**Uso**: Quando analista visualiza processo pendente não atribuído
**Diferença**: NÃO avança fase automaticamente

#### 1.8 Atualizar Status
```typescript
async updateProcessStatus(
  requestId: string,
  data: UpdateProcessStatusDto,
  userId: string
): Promise<ProcessResponse>
```
**Fluxo Transacional**:
1. Validar status contra enum ProcessStatus
2. Mapear Process.status → Request.status (sincronização)
3. Atualizar ambos em transação
4. Criar ProcessHistory (auditoria)
5. Enviar email à empresa (async, non-blocking)

**Mapeamento Status (Sprint 2 - Sincronização Bidirecional)**:
```
rascunho → rascunho
pendente/em_andamento/aguardando_documentos/analise_documental/
  analise_tecnica/aguardando_auditoria/proposta_enviada/
  aguardando_assinatura/em_auditoria/concluido → em_analise
aprovado/certificado → aprovado
reprovado/cancelado/suspenso → rejeitado
```

#### 1.9 Funções Auxiliares
```typescript
private calculateDaysInStage(updatedAt: Date): number
private mapProcessStatusToRequestStatus(status: ProcessStatus): RequestStatus
```

---

### 2. ProcessTransitionService - Máquina de Estados

#### 2.1 Ordem das 17 Fases
```typescript
PHASE_ORDER: Record<ProcessPhase, number> = {
  cadastro_solicitacao: 1,
  analise_documental_inicial: 2,
  elaboracao_proposta: 3,
  negociacao_proposta: 4,
  proposta_aprovada: 5,
  elaboracao_contrato: 6,
  assinatura_contrato: 7,
  avaliacao_documental: 8,
  planejamento_auditoria: 9,
  auditoria_estagio1: 10,
  auditoria_estagio2: 11,
  analise_nao_conformidades: 12,
  correcao_nao_conformidades: 13,
  validacao_correcoes: 14,
  comite_tecnico: 15,
  emissao_certificado: 16,
  certificado_emitido: 17
}
```

#### 2.2 Validações de Pré-requisitos por Fase
```typescript
async canAdvancePhase(process: Process): Promise<{ can: boolean; reason?: string }>
```

| Fase Atual | Pré-requisito |
|------------|---------------|
| cadastro_solicitacao | Analista atribuído (analystId != null) |
| analise_documental_inicial, avaliacao_documental | Nenhum documento com validationStatus='pendente' |
| elaboracao_proposta, negociacao_proposta | Contract (type='proposta', status='enviado') |
| elaboracao_contrato, assinatura_contrato | Contract (type='contrato', status='assinado') |
| planejamento_auditoria | Audit (status='agendado') |
| auditoria_estagio1/2, validacao_correcoes | Audit (status='concluido') |
| comite_tecnico | CommitteeDecision (type='aprovar') |
| certificado_emitido | Fase final, não avança |

#### 2.3 Mapeamento Fase → Status
```typescript
private getStatusForPhase(phase: ProcessPhase): ProcessStatus
```

Quando avança para fase X, atualiza status:
```
analise_documental_inicial, avaliacao_documental → 'analise_documental'
elaboracao_proposta, negociacao_proposta → 'em_andamento'
proposta_aprovada → 'proposta_enviada'
elaboracao_contrato, assinatura_contrato → 'aguardando_assinatura'
planejamento_auditoria → 'aguardando_auditoria'
auditoria_estagio1/2, analise_nao_conformidades → 'em_auditoria'
correcao_nao_conformidades → 'aguardando_documentos'
validacao_correcoes → 'analise_tecnica'
comite_tecnico → 'em_andamento'
emissao_certificado, certificado_emitido → 'certificado'
```

#### 2.4 Avançar Fase
```typescript
async advancePhase(processId: string, userId: string): Promise<{ success: boolean; message: string }>
```

**Fluxo Transacional**:
1. Obter processo atual
2. Validar canAdvancePhase
3. Calcular nextPhase
4. Determinar nextStatus baseado em nextPhase
5. Transação Atômica:
   - ProcessPhaseHistory: registra saída (exitedAt, daysInPhase)
   - ProcessPhaseHistory: registra entrada
   - Process: atualiza currentPhase, status
   - Request: sincroniza status
   - ProcessHistory: cria entrada
6. Retornar resultado

#### 2.5 Event Listeners (Transições Automáticas)
```typescript
async onDocumentsApproved(processId: string): Promise<void>
async onProposalSent(processId: string): Promise<void>
async onContractSigned(processId: string): Promise<void>
async onAuditScheduled(processId: string): Promise<void>
async onAuditCompleted(processId: string): Promise<void>
async onCommitteeApproved(processId: string): Promise<void>
```

---

### 3. ProcessController - 7 Endpoints REST

#### 3.1 POST /processes - Criar Processo
```typescript
@Post()
@Roles('empresa')
create(@Body() createProcessDto: CreateProcessDto, @Req() req)
```
- Auth: empresa
- Valida CreateProcessDto
- Extrai companyId do user
- Chama processService.createProcess()
- Retorna 201 Created

#### 3.2 GET /processes - Listar Processos (Role-Based)
```typescript
@Get()
@Roles('admin', 'gestor', 'analista', 'auditor', 'juridico', 'comercial', 'financeiro', 'empresa')
findAll(@Req() req)
```
**Roteamento por Role**:
```typescript
switch (user.role) {
  case 'empresa':
    return processService.getProcessesByCompany(user.companyId);
  case 'analista':
    return processService.getProcessesByAnalyst(user.id);
  case 'juridico':
    return processService.getProcessesByPhases([
      ProcessPhase.elaboracao_contrato,
      ProcessPhase.assinatura_contrato
    ]);
  case 'comercial':
    return processService.getProcessesByPhases([
      ProcessPhase.elaboracao_proposta,
      ProcessPhase.negociacao_proposta,
      ProcessPhase.proposta_aprovada
    ]);
  default: // admin, gestor, auditor, financeiro
    return processService.getAllProcesses();
}
```

#### 3.3 GET /processes/:id - Detalhes do Processo
```typescript
@Get(':id')
findOne(@Param('id') id: string, @Req() req)
```
**Validação de Acesso**:
- admin/gestor/auditor/analista/juridico/comercial/financeiro: veem tudo
- empresa: apenas seus próprios processos

**Auto-Assign Logic** (para analistas):
- Se processo pendente E não atribuído E role=analista
- Auto-atribui via autoAssignAnalyst
- Reload processo

#### 3.4 POST /processes/:id/submit - Submeter Wizard
```typescript
@Post(':id/submit')
@Roles('empresa')
submitWizard(@Param('id') id: string, @Req() req)
```
- Validação: user.companyId === process.companyId
- Chama processService.submitWizard()

#### 3.5 PATCH /processes/:id/status - Atualizar Status
```typescript
@Patch(':id/status')
@Roles('analista', 'gestor')
updateStatus(
  @Param('id') id: string,
  @Body() updateStatusDto: UpdateProcessStatusDto,
  @Req() req
)
```
**Lógica Especial**:
- Se analista:
  - Auto-atribui se processo pendente e desatribuído
  - Bloqueia se atribuído a outro analista
- Chama processService.updateProcessStatus()

#### 3.6 POST /processes/:id/assign - Atribuir Analista
```typescript
@Post(':id/assign')
@Roles('gestor', 'analista')
assignAnalyst(
  @Param('id') id: string,
  @Body() assignAnalystDto: AssignAnalystDto
)
```
- Valida se analista existe e tem role='analista'
- Chama processService.assignAnalyst()

#### 3.7 POST /processes/:id/advance-phase - Avançar Fase
```typescript
@Post(':id/advance-phase')
@Roles('analista', 'gestor')
advancePhase(@Param('id') id: string, @Req() req)
```
- Chama processTransitionService.advancePhase()
- Retorna { success, message }

---

## 🧪 Estratégia de Testes

### Testes Unitários - ProcessService
**Arquivo**: `src/__tests__/phase1.4/process.spec.ts`

Casos de teste essenciais:
1. ✅ generateProtocol - formato correto HS-YYYY-NNN
2. ✅ createProcess - criação com Request + Process
3. ✅ createProcess - validação de classificação industrial inválida
4. ✅ createProcess - mapeamento productType → CertificationType
5. ✅ getProcessesByCompany - filtra por companyId
6. ✅ getProcessById - retorna ProcessDetailResponse
7. ✅ getProcessById - NotFoundException se não encontrado
8. ✅ submitWizard - transição rascunho → pendente
9. ✅ submitWizard - erro se não em fase cadastro_solicitacao
10. ✅ assignAnalyst - atribuição com transição de fase automática
11. ✅ assignAnalyst - validação de analista inválido
12. ✅ autoAssignAnalyst - sem transição de fase
13. ✅ updateProcessStatus - sincronização Process ↔ Request
14. ✅ updateProcessStatus - criação de ProcessHistory
15. ✅ calculateDaysInStage - cálculo correto
16. ✅ mapProcessStatusToRequestStatus - todos os mapeamentos

**Estimativa**: ~40 testes

### Testes de Transições - ProcessTransitionService
**Arquivo**: `src/__tests__/phase1.4/process-transition.spec.ts`

Casos de teste essenciais:
1. ✅ canAdvancePhase - validação para cada fase
2. ✅ canAdvancePhase - bloqueia se pré-requisito não atendido
3. ✅ getStatusForPhase - mapeamento correto para todas as 17 fases
4. ✅ advancePhase - transação completa (ProcessPhaseHistory + Process + Request + ProcessHistory)
5. ✅ advancePhase - erro se fase final (certificado_emitido)
6. ✅ advancePhase - cálculo correto de daysInPhase
7. ✅ onDocumentsApproved - avança se em fase documental
8. ✅ onProposalSent - avança se em elaboracao_proposta
9. ✅ onContractSigned - avança se em assinatura_contrato
10. ✅ onAuditScheduled - avança se em planejamento_auditoria
11. ✅ onAuditCompleted - avança se em auditoria
12. ✅ onCommitteeApproved - avança se em comite_tecnico

**Estimativa**: ~30 testes

### Testes de Controller
**Arquivo**: `src/__tests__/phase1.4/process-controller.spec.ts`

Casos essenciais:
1. ✅ POST /processes - criação por empresa
2. ✅ POST /processes - 403 se não for empresa
3. ✅ GET /processes - roteamento correto por role
4. ✅ GET /processes/:id - auto-assign para analista
5. ✅ GET /processes/:id - 403 para empresa ver processo de outra
6. ✅ POST /:id/submit - sucesso para empresa
7. ✅ POST /:id/submit - 403 se processo de outra empresa
8. ✅ PATCH /:id/status - sucesso para analista
9. ✅ PATCH /:id/status - 403 para empresa
10. ✅ POST /:id/assign - sucesso para gestor
11. ✅ POST /:id/advance-phase - validação de pré-requisitos

**Estimativa**: ~25 testes

**Total Estimado de Testes**: ~95 testes

---

## 📦 Dependências e Integrações

### Módulos NestJS Necessários
```typescript
// process.module.ts
@Module({
  imports: [PrismaModule], // Para acesso ao banco
  controllers: [ProcessController],
  providers: [ProcessService, ProcessTransitionService],
  exports: [ProcessService, ProcessTransitionService],
})
export class ProcessModule {}
```

### Integrações com Outros Módulos
1. **Request** - Relação 1:1 (via requestId)
2. **Company** - Relação N:1 (via companyId)
3. **User** (Analyst) - Relação N:1 (via analystId)
4. **IndustrialGroup/Category/Subcategory** - Relações para classificação GSO 2055-2
5. **Contract** - Validação de pré-requisitos de fase
6. **Audit** - Validação de pré-requisitos de fase
7. **Document** - Validação de pré-requisitos de fase
8. **CommitteeDecision** - Validação de pré-requisitos de fase
9. **ProcessHistory** - Auditoria de mudanças
10. **ProcessPhaseHistory** - Tracking de transições de fase

### Services Externos
- **EmailService** - Notificações (async, non-blocking)
- **AuditLogger** - Logging de ações (se disponível no NestJS)

---

## ⚠️ Pontos Críticos de Atenção

### 1. Transações Atômicas
**Crítico**: Sempre usar `prisma.$transaction()` para:
- createProcess (Request + Process)
- updateProcessStatus (Process + Request + ProcessHistory)
- advancePhase (ProcessPhaseHistory + Process + Request + ProcessHistory)

### 2. Sincronização Bidirecional Process ↔ Request
**Decisão da Sprint 2**: Unificar status entre 2 tabelas
**Implementação**: Sempre mapear Process.status → Request.status usando `mapProcessStatusToRequestStatus()`

### 3. Auto-Assignment vs Assignment
- `assignAnalyst()`: COM transição de fase automática (cadastro → analise_documental_inicial)
- `autoAssignAnalyst()`: SEM transição de fase (apenas atribui analystId)

### 4. Protocolo Único
**Race Condition Potencial**: Geração de protocolo deve ser thread-safe
**Solução**: Usar transação e lock na contagem de Request

### 5. Email Non-Blocking
Falha de email NÃO deve bloquear updateProcessStatus
**Implementação**: Try-catch com log de erro, mas continua

### 6. Validação de Pré-requisitos de Fase
Cada fase tem pré-requisitos específicos (contracts, audits, documents, committee)
**Implementação**: Queries Prisma para validar existência e status

### 7. Cálculo de daysInStage
Baseado em `updatedAt` (não `createdAt`)
**Fórmula**: `Math.floor((NOW - updatedAt) / (1000 * 60 * 60 * 24))`

---

## 📊 Métricas Estimadas

| Métrica | Valor Estimado |
|---------|----------------|
| Linhas de Código (Produção) | ~2,100 |
| Linhas de Testes | ~1,000 |
| Número de Testes | ~95 |
| Endpoints | 7 |
| Métodos de Service | ~15 |
| Fases de Processo | 17 |
| Status de Processo | 16 |
| Complexidade Ciclomática | Alta |
| Tempo de Implementação | 3-4 horas |
| Tokens Estimados | ~80,000-100,000 |

---

## 🔜 Próximos Passos (Sessão Seguinte)

### Ordem Recomendada de Implementação

1. **ProcessService** (~2-3 horas)
   - Implementar métodos core (create, getById, list)
   - Implementar submitWizard, assignAnalyst, autoAssignAnalyst
   - Implementar updateProcessStatus com sincronização
   - Funções auxiliares (generateProtocol, calculateDaysInStage, mapStatus)

2. **ProcessTransitionService** (~1 hora)
   - Implementar canAdvancePhase com todas as validações
   - Implementar getStatusForPhase
   - Implementar advancePhase com transação
   - Implementar event listeners

3. **ProcessController** (~30 min)
   - Implementar 7 endpoints
   - Guards e validações de role
   - Auto-assign logic

4. **ProcessModule** (~10 min)
   - Configurar módulo NestJS
   - Exportar services

5. **Testes Unitários** (~2 horas)
   - 40 testes ProcessService
   - 30 testes ProcessTransitionService
   - 25 testes Controller

6. **Build & Validação** (~30 min)
   - Rodar build
   - Executar todos os testes
   - Fix de erros

7. **Documentação** (~30 min)
   - Atualizar RESUMO-EXECUTIVO-JANEIRO-2026.md
   - Commit de código e documentação

**Total Estimado**: 6-8 horas de trabalho ou ~80-100k tokens

---

## 📝 Notas de Implementação

### Snippet: generateProtocol
```typescript
private async generateProtocol(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await this.prisma.request.count({
    where: {
      createdAt: {
        gte: new Date(`${year}-01-01`),
      },
    },
  });
  const number = (count + 1).toString().padStart(3, '0');
  return `HS-${year}-${number}`;
}
```

### Snippet: Sincronização de Status
```typescript
private mapProcessStatusToRequestStatus(
  processStatus: ProcessStatus,
): RequestStatus {
  switch (processStatus) {
    case ProcessStatus.rascunho:
      return RequestStatus.rascunho;

    case ProcessStatus.pendente:
    case ProcessStatus.em_andamento:
    case ProcessStatus.aguardando_documentos:
    case ProcessStatus.analise_documental:
    case ProcessStatus.analise_tecnica:
    case ProcessStatus.aguardando_auditoria:
    case ProcessStatus.proposta_enviada:
    case ProcessStatus.aguardando_assinatura:
    case ProcessStatus.em_auditoria:
    case ProcessStatus.concluido:
      return RequestStatus.em_analise;

    case ProcessStatus.aprovado:
    case ProcessStatus.certificado:
      return RequestStatus.aprovado;

    case ProcessStatus.reprovado:
    case ProcessStatus.cancelado:
    case ProcessStatus.suspenso:
      return RequestStatus.rejeitado;

    default:
      return RequestStatus.em_analise;
  }
}
```

### Snippet: Validação de Fase
```typescript
async canAdvancePhase(
  process: Process,
): Promise<{ can: boolean; reason?: string }> {
  const phase = process.currentPhase;

  switch (phase) {
    case ProcessPhase.cadastro_solicitacao:
      if (!process.analystId) {
        return {
          can: false,
          reason: 'Processo deve ter analista atribuído',
        };
      }
      break;

    case ProcessPhase.analise_documental_inicial:
    case ProcessPhase.avaliacao_documental:
      const pendingDocs = await this.prisma.document.count({
        where: {
          requestId: process.requestId,
          validationStatus: 'pendente',
        },
      });
      if (pendingDocs > 0) {
        return {
          can: false,
          reason: `Existem ${pendingDocs} documentos pendentes de validação`,
        };
      }
      break;

    // ... mais casos
  }

  return { can: true };
}
```

---

**Documento criado**: 14 de Janeiro de 2026
**Última atualização**: 14 de Janeiro de 2026 - 23:55
**Próxima sessão**: Implementação completa do Process Module
