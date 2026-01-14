# 8. APIs e Integrações

## 8.1 Endpoints Principais (Resumo)

### Autenticação
- `POST /api/auth/register` - Cadastro de usuário
- `POST /api/auth/login` - Login (JWT)
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/mfa/enable` - Ativar MFA
- `POST /api/auth/mfa/verify` - Verificar código TOTP

### Solicitações
- `POST /api/requests` - Criar solicitação (wizard)
- `GET /api/requests/:id` - Obter solicitação
- `PATCH /api/requests/:id` - Atualizar (auto-save)
- `POST /api/requests/:id/submit` - Enviar solicitação

### Processos
- `GET /api/processes` - Listar processos (filtros, paginação)
- `GET /api/processes/:id` - Detalhes do processo
- `PATCH /api/processes/:id/phase` - Avançar fase
- `POST /api/processes/:id/assign` - Designar analista/auditor

### Documentos
- `POST /api/processes/:id/documents` - Upload de arquivo
- `GET /api/documents/:id/download` - Download (presigned URL)
- `PATCH /api/documents/:id/validate` - Validar/rejeitar documento

### Contratos
- `POST /api/processes/:id/contracts/proposal` - Gerar proposta
- `POST /api/contracts/:id/sign` - Assinar contrato
- `GET /api/contracts/:id/pdf` - Download PDF

### Auditorias
- `GET /api/audit-schedules` - Calendário de disponibilidade
- `POST /api/audits/:id/schedule` - Agendar auditoria
- `POST /api/audits/:id/checklist` - Preencher checklist
- `PATCH /api/audits/:id/complete` - Finalizar auditoria

### IA
- `POST /api/processes/:id/ai/analyze` - Análise pré-auditoria
- `POST /api/chat` - Enviar mensagem para chatbot RAG

### Certificados
- `POST /api/processes/:id/issue-certificate` - Emitir certificado
- `GET /api/certificates/:number/verify` - Verificação pública (QR code)

### Dashboards
- `GET /api/dashboard/company` - Dashboard da empresa
- `GET /api/dashboard/analyst` - Dashboard do analista
- `GET /api/dashboard/manager` - Dashboard do gestor

---

## 8.2 Integrações Externas

| Serviço | API | Uso no HalalSphere |
|---------|-----|-------------------|
| **OpenAI** | REST API | Análise de documentos (US-047), Chatbot RAG (US-049) |
| **Anthropic** | REST API | Fallback para análise de documentos |
| **Stripe** | REST API + Webhooks | Pagamentos (US-014) |
| **SendGrid** | REST API | Emails transacionais (US-023, US-053) |
| **AWS S3** | SDK (boto3/aws-sdk) | Storage de documentos e certificados |
| **Google Maps** | Geocoding API | Validação de endereços (US-001) |
| **ViaCEP** | REST API | Busca de CEP (Brasil) |

---

## 8.3 WebSockets (Notificações Real-time)

**Biblioteca**: Socket.io

**Eventos**:
```typescript
// Cliente se conecta
socket.on('connect', (userId) => {
  socket.join(`user:${userId}`);
});

// Servidor envia notificação
io.to(`user:${userId}`).emit('notification', {
  type: 'info',
  title: 'Análise IA concluída',
  message: 'Processo #12345: 87% de conformidade',
  action_url: '/processes/12345'
});

// Cliente recebe
socket.on('notification', (data) => {
  showToast(data);
});
```

---

