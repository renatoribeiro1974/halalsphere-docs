# Perfil do Administrador - HalalSphere

## Visão Geral

O perfil de Administrador foi criado para gerenciar todos os aspectos do sistema HalalSphere, incluindo:
- Gestão completa de usuários
- Acesso a dashboards de todos os perfis
- Configurações gerais do sistema
- Visualização de dados agregados

## Funcionalidades Implementadas

### 1. Dashboard do Administrador

**Localização:** `/dashboard` (quando logado como admin)

**Características:**
- **Estatísticas de Usuários:**
  - Total de usuários no sistema
  - Usuários ativos (últimos 30 dias)
  - Usuários bloqueados
  - Usuários com MFA ativado

- **Distribuição por Perfil:**
  - Gráfico de barras mostrando quantidade de usuários por perfil
  - Breakdown detalhado: Admin, Empresa, Analista, Auditor, Gestor

- **Usuários Recentes:**
  - Lista dos 5 últimos usuários cadastrados
  - Link para gestão completa de usuários

- **Ações Rápidas:**
  - Gerenciar Usuários
  - Criar Novo Usuário
  - Configurações do Sistema

### 2. Gestão de Usuários

**Localização:** `/admin/usuarios`

**Funcionalidades:**

#### Listagem de Usuários
- Tabela completa com todos os usuários
- Colunas:
  - Nome do usuário (e empresa, se aplicável)
  - Email
  - Perfil (com badge colorido)
  - Status (Ativo/Bloqueado)
  - Último login
  - Ações

#### Filtros e Busca
- **Busca por texto:** Nome, email ou empresa
- **Filtro por perfil:** Admin, Empresa, Analista, Auditor, Gestor
- Contador de resultados filtrados

#### Ações por Usuário
- **Editar:** Modificar dados do usuário
- **Resetar Senha:** Definir nova senha para o usuário
- **Desbloquear:** Desbloquear conta bloqueada por tentativas
- **Deletar:** Remover usuário do sistema (com confirmação)

### 3. Cadastro de Usuários

**Localização:** `/admin/usuarios/novo`

**Formulário Completo:**

#### Informações Básicas (Todos os perfis)
- Nome completo *
- Email *
- Telefone
- Perfil * (Admin, Empresa, Analista, Auditor, Gestor)
- Senha * (mínimo 6 caracteres)
- Confirmar Senha *

#### Dados da Empresa (Apenas para perfil "Empresa")
Quando o perfil "Empresa" é selecionado, campos adicionais aparecem:

**Dados Cadastrais:**
- CNPJ *
- Razão Social *
- Nome Fantasia

**Endereço:**
- CEP *
- Logradouro *
- Número *
- Complemento
- Bairro *
- Cidade *
- UF *
- País (padrão: Brasil)

**Contato:**
- Email de Contato *
- Telefone *
- WhatsApp
- Responsável *

**Informações Adicionais:**
- Website
- Número de Funcionários
- Faturamento Anual
- Atividade Principal

### 4. Edição de Usuários

**Localização:** `/admin/usuarios/:id`

**Funcionalidades:**
- Mesmo formulário do cadastro
- Campos pré-preenchidos com dados atuais
- Senha opcional (apenas se quiser alterar)
- Não permite editar dados da empresa (apenas criar no cadastro)

### 5. Menu Lateral do Administrador

O menu lateral do administrador é organizado por seções, dando acesso a todos os perfis:

#### Seção: Administração
- 🛡️ Dashboard Admin
- 👥 Gestão de Usuários

#### Seção: Empresas
- 🏢 Empresas (Dashboard de empresa)
- 📄 Solicitações (Visualizar solicitações)

#### Seção: Analistas
- ✅ Analistas (Dashboard de analista)
- 📋 Processos (Gerenciar processos)
- 📄 Análise Documental (Validar documentos)

#### Seção: Auditores
- 🏆 Auditores (Dashboard de auditor)
- 📄 Relatórios Auditoria (Ver relatórios)

#### Seção: Gestores
- 📋 Gestores (Dashboard de gestor)
- 📋 Comitê Técnico (Decisões do comitê)

#### Seção: Geral
- 🏆 Certificados
- 📅 Calendário
- 💬 Chat IA

## Backend - API Endpoints

### Base URL: `/api/admin`

Todos os endpoints requerem:
- Autenticação JWT
- Perfil de administrador

#### 1. Listar Usuários
```
GET /api/admin/users
Query Params:
  - role?: string (filtrar por perfil)
  - search?: string (buscar por nome/email)

Response: {
  success: boolean,
  data: User[]
}
```

#### 2. Obter Estatísticas
```
GET /api/admin/users/stats

Response: {
  success: boolean,
  data: {
    totalUsers: number,
    usersByRole: {
      admin: number,
      empresa: number,
      analista: number,
      auditor: number,
      gestor: number
    },
    activeUsers: number,
    lockedUsers: number,
    mfaEnabled: number
  }
}
```

#### 3. Obter Usuário por ID
```
GET /api/admin/users/:id

Response: {
  success: boolean,
  data: User
}
```

#### 4. Criar Usuário
```
POST /api/admin/users
Body: {
  email: string,
  password: string,
  name: string,
  phone?: string,
  role: 'admin' | 'empresa' | 'analista' | 'auditor' | 'gestor',
  companyData?: CompanyData (obrigatório se role = 'empresa')
}

Response: {
  success: boolean,
  data: User
}
```

#### 5. Atualizar Usuário
```
PUT /api/admin/users/:id
Body: {
  email?: string,
  password?: string,
  name?: string,
  phone?: string,
  role?: string,
  mfaEnabled?: boolean,
  loginAttempts?: number,
  lockedUntil?: string
}

Response: {
  success: boolean,
  data: User
}
```

#### 6. Deletar Usuário
```
DELETE /api/admin/users/:id

Response: {
  success: boolean,
  message: string
}
```

#### 7. Resetar Senha
```
POST /api/admin/users/:id/reset-password
Body: {
  newPassword: string
}

Response: {
  success: boolean,
  message: string
}
```

#### 8. Desbloquear Usuário
```
POST /api/admin/users/:id/unlock

Response: {
  success: boolean,
  message: string
}
```

## Estrutura de Arquivos

### Backend
```
backend/src/modules/admin/
├── admin.types.ts          # TypeScript interfaces
├── admin.service.ts        # Lógica de negócio
├── admin.controller.ts     # Controladores HTTP
└── admin.routes.ts         # Definição de rotas
```

### Frontend
```
frontend/src/
├── pages/admin/
│   ├── AdminDashboard.tsx  # Dashboard principal
│   ├── UserList.tsx        # Listagem de usuários
│   └── UserForm.tsx        # Cadastro/edição
├── services/
│   └── admin.service.ts    # Client API
└── components/layout/
    └── Sidebar.tsx         # Menu lateral (atualizado)
```

## Banco de Dados

### Alterações no Schema Prisma

```prisma
enum UserRole {
  admin      // ← NOVO
  empresa
  analista
  auditor
  gestor
}
```

## Como Testar

### 1. Migrar o Banco de Dados
```bash
cd backend
npx prisma migrate dev --name add_admin_role
```

### 2. Criar Usuário Administrador
```bash
cd backend
npx ts-node create-admin.ts
```

Credenciais criadas:
- **Email:** admin@halalsphere.com
- **Senha:** admin123

### 3. Fazer Login
1. Acesse o frontend: `http://localhost:5173`
2. Faça login com as credenciais acima
3. Você será redirecionado para o Dashboard do Administrador

### 4. Testar Funcionalidades

#### Gestão de Usuários
1. Clique em "Gestão de Usuários" no menu lateral
2. Teste os filtros e busca
3. Clique em "Novo Usuário"
4. Crie um usuário de cada tipo (empresa, analista, auditor, gestor)
5. Teste edição, resetar senha e exclusão

#### Navegação entre Dashboards
1. No menu lateral, clique em diferentes seções
2. Verifique que o admin pode acessar todos os dashboards
3. URLs como `/dashboard/empresa`, `/dashboard/analista`, etc. funcionam

## Segurança

### Proteção de Rotas
- Todos os endpoints admin requerem autenticação JWT
- Middleware `checkAdmin` valida se o usuário é administrador
- Frontend valida token antes de renderizar páginas protegidas

### Validações
- Validação de email único no cadastro
- Senha mínima de 6 caracteres
- CNPJ único para empresas
- Campos obrigatórios validados no backend (Zod)

### Boas Práticas
- Senhas hashadas com bcrypt (10 rounds)
- Token JWT com expiração de 7 dias
- Modal de confirmação para exclusões
- Feedback visual para todas as ações

## Melhorias Futuras

### Funcionalidades Sugeridas
1. **Logs de Auditoria:** Registrar todas as ações do administrador
2. **Gerenciamento de Permissões:** Sistema granular de permissões
3. **Backup e Restore:** Interface para backup do banco
4. **Relatórios Avançados:** Dashboards com gráficos e métricas
5. **Notificações:** Sistema de notificações para admins
6. **Configurações do Sistema:** Painel para alterar variáveis de ambiente
7. **Import/Export de Usuários:** Upload em massa via CSV
8. **Histórico de Alterações:** Ver mudanças feitas em cada usuário
9. **2FA Obrigatório:** Forçar MFA para administradores
10. **Suspensão Temporária:** Suspender usuário sem deletar

## Troubleshooting

### Erro: "Acesso negado"
- Verifique se o token JWT é válido
- Confirme que o usuário tem role 'admin'
- Verifique se o header Authorization está presente

### Erro ao criar empresa
- Confirme que todos os campos obrigatórios estão preenchidos
- Verifique se o CNPJ já não está cadastrado
- Valide formato do CNPJ (14 dígitos)

### Migration falhou
- Execute `npx prisma generate` primeiro
- Verifique conexão com o banco de dados
- Tente `npx prisma migrate reset` (⚠️ apaga dados!)

## Contato e Suporte

Para dúvidas ou problemas:
1. Verifique a documentação no diretório `/docs`
2. Consulte os logs do backend
3. Verifique o console do navegador para erros do frontend

---

**Documentação criada em:** Dezembro 2025
**Versão do Sistema:** 1.0.0
**Última atualização:** 04/12/2025
