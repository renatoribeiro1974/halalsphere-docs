# Implementação do Perfil Jurídico

**Data:** 19 de dezembro de 2025
**Objetivo:** Implementar perfil completo do departamento jurídico no sistema HalalSphere

## Status: ✅ Implementação Concluída

---

## 📋 Resumo da Implementação

Foi implementado o perfil jurídico completo no sistema, incluindo backend, frontend, rotas protegidas e integração com o fluxo de certificação.

---

## 🔧 Backend

### 1. Service Layer
**Arquivo:** `backend/src/modules/juridico/juridico.service.ts`

Métodos implementados:
- `getPendingContracts()` - Lista contratos pendentes de elaboração
- `getProcessesNeedingContract()` - Processos que precisam de contrato
- `getStats()` - Estatísticas do departamento jurídico
- `searchContracts()` - Busca contratos com filtros
- `getRecentActivity()` - Histórico de atividades recentes
- `getJuridicoUsers()` - Lista usuários do departamento jurídico
- `getPerformanceMetrics()` - Métricas de performance

### 2. Controller
**Arquivo:** `backend/src/modules/juridico/juridico.controller.ts`

Endpoints implementados:
- `GET /api/juridico/dashboard` - Dashboard principal
- `GET /api/juridico/contracts` - Lista contratos com filtros
- `GET /api/juridico/contracts/pending` - Contratos pendentes
- `GET /api/juridico/processes/needing-contract` - Processos sem contrato
- `GET /api/juridico/stats` - Estatísticas
- `GET /api/juridico/activity` - Atividades recentes
- `GET /api/juridico/team` - Equipe jurídica
- `GET /api/juridico/metrics` - Métricas de performance

### 3. Rotas Protegidas
**Arquivo:** `backend/src/modules/juridico/juridico.routes.ts`

- Todas as rotas requerem autenticação (`fastify.authenticate`)
- Todas as rotas requerem role `juridico` ou `admin` (`roleMiddleware`)
- Registradas no server.ts com prefixo `/api/juridico`

### 4. Integrações

#### Contract Service
**Arquivo:** `backend/src/modules/contract/contract.service.ts`

- Adicionado TODO para notificação ao jurídico quando contrato é criado (linha 179)

#### Proposal Service
**Arquivo:** `backend/src/modules/proposal/proposal.service.ts`

- Quando proposta é aceita, processo avança automaticamente para fase `elaboracao_contrato` (linha 316-320)
- Adicionado TODO para notificar equipe jurídica (linha 325)

#### Process Transition Service
**Arquivo:** `backend/src/modules/process/process-transition.service.ts`

- Validação de transição já implementada para fase `elaboracao_contrato` (linha 135-147)
- Requer contrato assinado para avançar

---

## 🎨 Frontend

### 1. Dashboard Jurídico
**Arquivo:** `frontend/src/pages/juridico/JuridicoDashboard.tsx`

Componentes:
- Cards de estatísticas (6 cards):
  - Total de Contratos
  - Aguardando Elaboração
  - Aguardando Assinatura
  - Contratos Assinados
  - Em Negociação
  - Processos Sem Contrato

- Seções principais:
  - **Processos Aguardando Contrato** - Lista processos com proposta aceita
  - **Contratos em Andamento** - Contratos em elaboração ou aguardando assinatura
  - **Atividades Recentes** - Timeline de ações no sistema
  - **Quick Actions** - Links rápidos para funcionalidades

### 2. Rotas
**Arquivo:** `frontend/src/App.tsx`

```tsx
// Juridico Routes
<Route path="/juridico/dashboard" element={<JuridicoDashboard />} />
```

### 3. Menu Lateral
**Arquivo:** `frontend/src/components/layout/Sidebar.tsx`

Menu para role `juridico`:
- Dashboard Jurídico
- Contratos
- Processos
- Calendário
- Chat IA

---

## 🔄 Fluxo de Trabalho

### Fase: Elaboração de Contrato

1. **Trigger:** Empresa aceita proposta comercial
2. **Ação Automática:**
   - Processo avança para fase `elaboracao_contrato`
   - TODO: Sistema notifica equipe jurídica
3. **Ação do Jurídico:**
   - Acessa dashboard jurídico
   - Visualiza processo na lista "Processos Aguardando Contrato"
   - Clica em "Criar Contrato"
   - Elabora contrato baseado na proposta aceita
4. **Próximos Passos:**
   - Envia contrato para assinatura
   - Processo avança para fase `assinatura_contrato`

---

## 📊 Dados do Schema Prisma

### Enums Utilizados

```prisma
enum UserRole {
  juridico // Departamento Jurídico
}

enum ProcessPhase {
  elaboracao_contrato    // Fase 6 - Elaboração do Contrato (jurídico)
  assinatura_contrato    // Fase 7 - Assinatura do Contrato (empresa + jurídico)
}

enum PhaseResponsibility {
  juridico
}

enum ContractStatus {
  rascunho
  enviado
  em_negociacao
  assinado
  cancelado
}
```

---

## 🚀 Próximos Passos (TODOs)

### Backend
1. Implementar sistema de notificações para o jurídico
2. Criar método `notifyJuridico()` no contract.service
3. Adicionar notificação quando proposta é aceita
4. Implementar atribuição automática ou manual de contratos para membros do jurídico

### Frontend
1. Criar componente `ContractList.tsx` - Lista completa de contratos
2. Criar componente `ContractEditor.tsx` - Interface para criar/editar contratos
3. Criar página de métricas e relatórios (`/juridico/metrics`)
4. Criar página de gestão da equipe (`/juridico/team`)
5. Implementar filtros avançados na lista de contratos
6. Adicionar página de detalhes do contrato

### Integrações
1. Integrar com serviço de e-mail para notificações
2. Conectar com plataformas de assinatura eletrônica (D4Sign, ClickSign, DocuSign)
3. Implementar geração automática de PDF de contratos
4. Criar templates de contratos personalizáveis

---

## 🔐 Permissões e Acesso

### Roles com Acesso
- `juridico` - Acesso completo ao módulo jurídico
- `admin` - Acesso completo (supervisão)

### Endpoints Protegidos
Todos os endpoints `/api/juridico/*` requerem:
- Token JWT válido
- Role `juridico` ou `admin`

---

## 📁 Estrutura de Arquivos

```
backend/
├── src/
│   ├── modules/
│   │   ├── juridico/
│   │   │   ├── juridico.service.ts       ✅ Implementado
│   │   │   ├── juridico.controller.ts    ✅ Implementado
│   │   │   └── juridico.routes.ts        ✅ Implementado
│   │   ├── contract/
│   │   │   ├── contract.service.ts       ✅ Atualizado (TODO adicionado)
│   │   │   └── ...
│   │   └── proposal/
│   │       ├── proposal.service.ts       ✅ Atualizado (transição + TODO)
│   │       └── ...
│   └── server.ts                         ✅ Rotas registradas

frontend/
├── src/
│   ├── pages/
│   │   └── juridico/
│   │       └── JuridicoDashboard.tsx     ✅ Implementado
│   ├── components/
│   │   └── layout/
│   │       └── Sidebar.tsx               ✅ Atualizado (menu jurídico)
│   └── App.tsx                           ✅ Rota adicionada
```

---

## ✅ Checklist de Implementação

- [x] Criar service layer para o jurídico
- [x] Criar controller para endpoints
- [x] Criar rotas protegidas com roleMiddleware
- [x] Atualizar contract.service.ts com TODO de notificação
- [x] Verificar transição automática para elaboracao_contrato
- [x] Criar componente JuridicoDashboard.tsx
- [x] Adicionar rota no App.tsx
- [x] Adicionar menu na Sidebar.tsx
- [x] Registrar rotas no server.ts
- [x] Documentar implementação
- [ ] Criar ContractList.tsx
- [ ] Criar ContractEditor.tsx
- [ ] Implementar sistema de notificações
- [ ] Integrar com e-signature providers

---

## 🧪 Como Testar

### 1. Criar Usuário Jurídico

```bash
# Executar no backend
npx ts-node scripts/create-juridico-user.ts
```

### 2. Login como Jurídico

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juridico@halalsphere.com",
    "password": "senha123"
  }'
```

### 3. Acessar Dashboard

```bash
# Com o token obtido no login
curl -X GET http://localhost:3000/api/juridico/dashboard \
  -H "Authorization: Bearer {TOKEN}"
```

### 4. Testar Fluxo Completo

1. Criar solicitação como empresa
2. Analista atribui processo
3. Analista cria e envia proposta
4. Empresa aceita proposta
5. **Sistema avança automaticamente para fase `elaboracao_contrato`**
6. Login como jurídico
7. Verificar processo aparece na lista "Aguardando Contrato"
8. Criar contrato para o processo

---

## 📝 Notas Técnicas

### Statísticas Calculadas

O dashboard calcula:
- **Total de Contratos**: Count de todos os contratos tipo 'contrato'
- **Aguardando Elaboração**: Contratos em 'rascunho' na fase 'elaboracao_contrato'
- **Aguardando Assinatura**: Contratos 'enviado' na fase 'assinatura_contrato'
- **Assinados**: Contratos com status 'assinado'
- **Em Negociação**: Contratos com status 'em_negociacao'
- **Processos Sem Contrato**: Processos na fase 'elaboracao_contrato' sem contratos

### Performance

- Queries otimizadas com `include` para reduzir N+1
- Índices no schema para busca rápida por status e fase
- Dashboard usa Promise.all para queries paralelas

### Segurança

- Middleware de autenticação em todas as rotas
- Middleware de role para verificar permissões
- Validação de tokens JWT
- CORS configurado

---

## 📞 Contato

Para dúvidas sobre esta implementação, consulte:
- Documentação técnica em `/docs`
- Schema do banco em `backend/prisma/schema.prisma`
- User stories em `docs/01-prd/05-user-stories/`

---

**Implementado por:** Claude Code
**Versão do Sistema:** 1.0.0
**Status:** Produção-Ready (aguardando testes)
