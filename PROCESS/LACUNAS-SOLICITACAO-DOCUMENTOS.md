# Lacunas Identificadas: Fluxo de Solicitação de Documentos Adicionais

## Análise da Situação Atual

### O que funciona:
1. **Backend**: Sistema completo de solicitação de documentos implementado
   - Serviço: `backend/src/modules/document-request/document-request.service.ts`
   - Rotas e controller configurados
   - CRUD completo de solicitações de documentos
   - Status: `pendente`, `atendido`, `cancelado`

2. **Frontend - Lado do Analista**: Funcional
   - Modal para criar solicitação: `DocumentRequestModal`
   - Botão "Solicitar Documentos" na página de detalhes do processo
   - Analista pode especificar tipo, descrição e prazo

### O que NÃO funciona - LACUNAS CRÍTICAS:

## 1. Empresa NÃO VISUALIZA Solicitações de Documentos

### Problema:
Quando o analista solicita documentos adicionais, a empresa **não vê** essas solicitações em nenhum lugar.

### Impacto:
- Empresa não sabe que precisa enviar documentos
- Processo fica parado indefinidamente
- Não há feedback para a empresa

### Locais onde deveria aparecer:
- ❌ **Dashboard da Empresa** (`CompanyDashboard.tsx`): Não mostra solicitações pendentes
- ❌ **Detalhes do Processo** (`ProcessDetails.tsx`): Não renderiza solicitações para empresas
- ❌ **Notificações**: Não há sistema de notificação implementado

---

## 2. Empresa NÃO PODE Fazer Upload de Documentos Solicitados

### Problema:
Mesmo que a empresa visse a solicitação, não há interface para fazer upload.

### Impacto:
- Não há botão ou área de upload na página do processo
- Empresa não consegue atender à solicitação
- Fluxo de trabalho quebrado

### O que falta:
- ❌ Componente para listar solicitações pendentes
- ❌ Botão de upload por solicitação
- ❌ Integração com serviço de documentos
- ❌ Vinculação do documento enviado com a solicitação

---

## 3. Falta Sistema de Notificações

### Problema:
Não há notificação quando o analista solicita documentos.

### Tipos de notificação faltantes:
- ❌ **Email**: Não envia email para a empresa
- ❌ **In-app**: Não mostra badge/contador no sistema
- ❌ **Dashboard**: Não destaca processos com documentos pendentes

---

## 4. Falta Feedback Visual de Urgência

### Problema:
Não há indicação de:
- Quantas solicitações pendentes existem
- Prazo das solicitações (dueDate)
- Solicitações vencidas

---

## Fluxo Atual vs Fluxo Ideal

### Fluxo ATUAL (Quebrado):
```
1. Analista cria solicitação de documento ✅
2. Solicitação salva no banco ✅
3. [LACUNA] Empresa não vê nada ❌
4. [LACUNA] Empresa não consegue enviar ❌
5. Processo fica travado indefinidamente ❌
```

### Fluxo IDEAL (Como deveria ser):
```
1. Analista cria solicitação de documento ✅
2. Solicitação salva no banco ✅
3. Sistema envia email para empresa 🔧 (PRECISA IMPLEMENTAR)
4. Dashboard mostra badge "Documentos Pendentes (2)" 🔧
5. Empresa acessa processo 🔧
6. Vê lista de documentos solicitados 🔧
7. Cada item tem botão "Fazer Upload" 🔧
8. Empresa faz upload do documento 🔧
9. Sistema vincula documento à solicitação 🔧
10. Solicitação muda para "atendido" 🔧
11. Analista é notificado 🔧
12. Analista valida documento 🔧
13. Processo continua normalmente ✅
```

---

## Arquivos que Precisam ser Modificados

### Backend (Mínimo):
1. **Notificações**:
   - `backend/src/services/email.service.ts` - Adicionar email de solicitação de documentos
   - `backend/src/modules/document-request/document-request.service.ts:75` - Enviar email após criar solicitação

2. **Rotas** (já existem, verificar):
   - `GET /processes/:id/document-requests` - Listar solicitações por processo
   - `POST /document-requests/:id/fulfill` - Marcar como atendido

### Frontend:
1. **Dashboard da Empresa**:
   - `frontend/src/pages/company/CompanyDashboard.tsx`
   - Adicionar seção "Documentos Pendentes"
   - Badge no card de processos com solicitações

2. **Detalhes do Processo**:
   - `frontend/src/pages/ProcessDetails.tsx`
   - Adicionar componente para listar solicitações (visível para empresa)
   - Área de upload por solicitação

3. **Novo Componente**:
   - `frontend/src/components/company/PendingDocumentRequests.tsx` (CRIAR)
   - Lista solicitações pendentes
   - Botão de upload por item
   - Indicador de prazo/urgência

4. **Integração Upload**:
   - Usar serviço existente: `frontend/src/services/document.service.ts`
   - Vincular upload com `documentRequestId`
   - Chamar `fulfillDocumentRequest()` após upload

---

## Prioridade de Implementação

### Prioridade ALTA (Bloqueador):
1. ✅ Listar solicitações na página de detalhes (para empresa)
2. ✅ Botão de upload por solicitação
3. ✅ Integração upload → fulfillDocumentRequest

### Prioridade MÉDIA:
4. ⚠️ Badge/contador no dashboard
5. ⚠️ Notificação por email
6. ⚠️ Indicador de prazo

### Prioridade BAIXA:
7. 💡 Notificações in-app
8. 💡 Histórico de solicitações atendidas

---

## Estrutura de Dados Existente

### DocumentRequest (Prisma):
```typescript
{
  id: string
  processId: string
  requestedBy: string          // ID do analista
  documentType: DocumentType   // Tipo do documento
  description: string          // Descrição/instruções
  dueDate?: Date              // Prazo (opcional)
  status: 'pendente' | 'atendido' | 'cancelado'
  respondedAt?: Date
  uploadedDocId?: string      // ID do documento enviado
  createdAt: Date
  updatedAt: Date
}
```

### Relacionamentos:
- `DocumentRequest.processId` → `Process.id`
- `DocumentRequest.uploadedDocId` → `Document.id`
- `DocumentRequest.requestedBy` → `User.id` (analista)

---

## Exemplo de Implementação (Pseudo-código)

### 1. Componente de Lista de Solicitações (Frontend):
```tsx
// frontend/src/components/company/PendingDocumentRequests.tsx

export function PendingDocumentRequests({ processId }) {
  const { data: requests } = useQuery({
    queryKey: ['document-requests', processId],
    queryFn: () => documentRequestService.getProcessDocumentRequests(processId)
  });

  const pendingRequests = requests?.filter(r => r.status === 'pendente');

  if (!pendingRequests?.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="text-warning" />
          Documentos Solicitados ({pendingRequests.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendingRequests.map(request => (
          <DocumentRequestItem
            key={request.id}
            request={request}
            onUploadComplete={() => refetch()}
          />
        ))}
      </CardContent>
    </Card>
  );
}
```

### 2. Item de Solicitação com Upload:
```tsx
function DocumentRequestItem({ request, onUploadComplete }) {
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // 1. Upload do arquivo
      const doc = await documentService.uploadDocument(file, {
        processId: request.processId,
        documentType: request.documentType
      });

      // 2. Marcar solicitação como atendida
      await documentRequestService.fulfillDocumentRequest(
        request.id,
        doc.id
      );
    },
    onSuccess: onUploadComplete
  });

  return (
    <div className="border p-4 rounded">
      <h4>{DOCUMENT_TYPE_LABELS[request.documentType]}</h4>
      <p className="text-sm">{request.description}</p>
      {request.dueDate && (
        <p className="text-warning">
          Prazo: {formatDate(request.dueDate)}
        </p>
      )}

      <FileUploadButton
        onUpload={(file) => uploadMutation.mutate(file)}
        loading={uploadMutation.isPending}
      />
    </div>
  );
}
```

### 3. Integração no ProcessDetails:
```tsx
// frontend/src/pages/ProcessDetails.tsx

export default function ProcessDetails() {
  // ... código existente ...

  return (
    <div>
      {/* Conteúdo existente */}

      {/* ADICIONAR: Solicitações pendentes (visível para empresa) */}
      {currentUser?.role === 'empresa' && (
        <PendingDocumentRequests processId={id!} />
      )}

      {/* Timeline existente */}
      {/* Cards existentes */}
    </div>
  );
}
```

### 4. Email de Notificação (Backend):
```typescript
// backend/src/services/email.service.ts

async sendDocumentRequestEmail(
  companyEmail: string,
  companyName: string,
  processProtocol: string,
  documentType: string,
  description: string,
  dueDate?: Date
) {
  const subject = `Documentos Solicitados - Processo ${processProtocol}`;
  const body = `
    Olá ${companyName},

    Foram solicitados documentos adicionais para o processo ${processProtocol}.

    Documento: ${documentType}
    Descrição: ${description}
    ${dueDate ? `Prazo: ${formatDate(dueDate)}` : ''}

    Acesse o sistema para fazer o upload:
    ${process.env.FRONTEND_URL}/processos/${processId}
  `;

  await this.sendEmail(companyEmail, subject, body);
}
```

```typescript
// backend/src/modules/document-request/document-request.service.ts:75

async createDocumentRequest(requestedBy: string, data: CreateDocumentRequestData) {
  // ... código existente de criação ...

  // ADICIONAR: Enviar email para empresa
  const process = await prisma.process.findUnique({
    where: { id: data.processId },
    include: {
      request: {
        include: {
          company: {
            include: { user: true }
          }
        }
      }
    }
  });

  if (process?.request?.company?.user?.email) {
    await emailService.sendDocumentRequestEmail(
      process.request.company.user.email,
      process.request.companyName,
      process.request.protocol,
      data.documentType,
      data.description,
      data.dueDate
    );
  }

  return documentRequest;
}
```

---

## Resumo das Lacunas

| # | Lacuna | Severidade | Bloqueador? | Esforço |
|---|--------|-----------|-------------|---------|
| 1 | Empresa não vê solicitações | 🔴 Crítica | Sim | Médio |
| 2 | Empresa não pode fazer upload | 🔴 Crítica | Sim | Médio |
| 3 | Sem notificação por email | 🟡 Alta | Não | Baixo |
| 4 | Sem badge no dashboard | 🟡 Média | Não | Baixo |
| 5 | Sem indicador de prazo | 🟢 Baixa | Não | Baixo |

---

## Próximos Passos

1. Implementar `PendingDocumentRequests` component
2. Adicionar seção na página `ProcessDetails` (role=empresa)
3. Implementar upload com vinculação à solicitação
4. Adicionar email de notificação
5. Adicionar badge/contador no dashboard
6. Testes de integração completos
