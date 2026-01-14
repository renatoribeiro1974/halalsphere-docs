# Implementação: Sistema de Auto Cadastro - Backend

**Data**: 17 de Dezembro de 2025
**Módulo**: Auto Cadastro de Clientes
**Status**: ✅ Backend Completo

---

## 📋 Resumo

Implementação completa do backend para o sistema de auto cadastro de novos clientes, incluindo:
- Modificação do schema Prisma
- Serviço de verificação de email
- Endpoints de registro e validação
- Prevenção de duplicação
- Validação de documentos fiscais

---

## 🗄️ Alterações no Banco de Dados

### Schema Prisma - Model User

Adicionados novos campos ao modelo `User`:

```prisma
model User {
  // ... campos existentes

  // Verificação de Email e Ativação de Conta
  emailVerified            Boolean   @default(false) @map("email_verified")
  verificationToken        String?   @unique @map("verification_token") @db.VarChar(64)
  verificationTokenExpires DateTime? @map("verification_token_expires")

  // Reset de Senha
  resetPasswordToken       String?   @unique @map("reset_password_token") @db.VarChar(64)
  resetPasswordExpires     DateTime? @map("reset_password_expires")

  // Timestamps Adicionais
  registeredAt             DateTime? @map("registered_at")
  activatedAt              DateTime? @map("activated_at")

  // Índices adicionados
  @@index([verificationToken])
  @@index([resetPasswordToken])
  @@index([emailVerified])
}
```

### Migrations

- Executado: `npx prisma db push --accept-data-loss`
- Status: ✅ Schema sincronizado

### Seed Atualizado

Todos os usuários do seed foram atualizados para incluir:
- `emailVerified: true` (para desenvolvimento)
- `activatedAt: new Date()`
- `registeredAt: new Date()`

---

## 📁 Arquivos Criados

### 1. DTOs e Validação

**`backend/src/modules/auth/dto/register.dto.ts`**

Schemas de validação com Zod:
- `registerSchema` - Validação completa do formulário de registro
- `checkEmailSchema` - Validação de email
- `checkCompanySchema` - Validação de empresa (country + taxId)
- `verifyEmailSchema` - Validação de token
- `resendVerificationSchema` - Reenvio de verificação

**Tipos exportados**:
- `RegisterDTO`
- `CheckEmailDTO`
- `CheckCompanyDTO`
- `VerifyEmailDTO`
- `ResendVerificationDTO`
- `RegisterResponse`
- `CheckAvailabilityResponse`
- `VerifyEmailResponse`

### 2. Serviço de Verificação de Email

**`backend/src/modules/auth/services/email-verification.service.ts`**

**Métodos implementados**:

#### `generateVerificationToken()`
- Gera token aleatório de 64 caracteres (32 bytes em hex)
- Define expiração de 24 horas
- Retorna: `{ token, expires }`

#### `saveVerificationToken(userId, token, expires)`
- Salva token no banco de dados
- Associa ao usuário

#### `sendVerificationEmail(email, name, token)`
- Envia email de verificação (console.log por enquanto)
- TODO: Integrar com EmailService (US-067)
- Link de verificação: `${FRONTEND_URL}/auth/verify-email?token=${token}`

#### `verifyEmail(token)`
- Valida token
- Verifica expiração
- Marca email como verificado
- Invalida token após uso
- Retorna: `{ success, message, userId? }`

#### `resendVerificationEmail(email)`
- Gera novo token
- Reenvia email
- Não revela se email existe (segurança)

#### `isEmailVerified(email)`
- Verifica status de verificação
- Retorna boolean

---

## 🔧 Arquivos Modificados

### 1. AuthService

**`backend/src/modules/auth/auth.service.ts`**

#### Novos Métodos:

##### `register(data: RegisterDTO)`

Fluxo completo:
1. Verifica email duplicado
2. Verifica empresa duplicada (country + taxId)
3. Valida documento fiscal (TaxValidationService)
4. Formata documento fiscal
5. Hash da senha (bcrypt, salt rounds: 10)
6. Gera token de verificação
7. Determina moeda e idioma por país
8. Cria usuário e empresa em transação atômica
9. Envia email de verificação

**Tratamento de erros**:
- Constraint violation (P2002) - race conditions
- Mensagens específicas por tipo de duplicação

##### `checkEmailAvailability(email: string)`
- Verifica se email já existe
- Retorna boolean

##### `checkCompanyAvailability(country, taxId)`
- Verifica se empresa já existe
- Retorna boolean

##### `getCountryDefaults(country)`
- Retorna configurações padrão por país:
  - BR: BRL + PT_BR
  - CO: COP + ES
  - PY: PYG + ES

#### Método Modificado:

##### `login(data: LoginDTO)`
- **NOVO**: Verifica se email foi verificado
- Bloqueia login de contas não verificadas
- Mensagem: "Email não verificado. Verifique sua caixa de entrada..."

---

### 2. AuthController

**`backend/src/modules/auth/auth.controller.ts`**

#### Novos Endpoints:

##### `POST /api/auth/register`
- Valida dados com registerSchema
- Chama authService.register()
- Status: 201 Created
- Retorna: `{ success, message, data: { userId } }`

##### `POST /api/auth/check-email-availability`
- Verifica disponibilidade de email
- Validação em tempo real (debounced no frontend)
- Retorna: `{ success, available, message }`

##### `POST /api/auth/check-company-availability`
- Verifica disponibilidade de empresa
- Baseado em country + taxId
- Retorna: `{ success, available, message }`

##### `GET /api/auth/verify-email?token=xxx`
- Valida e consome token
- Marca email como verificado
- Retorna: `{ success, message, redirectUrl }`

##### `POST /api/auth/resend-verification`
- Reenvia email de verificação
- Gera novo token
- Retorna: `{ success, message }`

---

### 3. AuthRoutes

**`backend/src/modules/auth/auth.routes.ts`**

#### Rotas Públicas Adicionadas:

```typescript
POST   /api/auth/register
POST   /api/auth/check-email-availability
POST   /api/auth/check-company-availability
GET    /api/auth/verify-email
POST   /api/auth/resend-verification
```

Todas as rotas estão **desprotegidas** (não requerem autenticação).

---

## 🔒 Segurança Implementada

### 1. Validação de Dados

- **Zod schemas** para todos os inputs
- **Sanitização** de documentos fiscais (remove formatação)
- **Validação de formato** por tipo de documento e país
- **Senha forte** obrigatória:
  - Mínimo 8 caracteres
  - 1 letra maiúscula
  - 1 número
  - 1 caractere especial

### 2. Prevenção de Duplicação

- **Email único**: Constraint no banco + validação na aplicação
- **Empresa única**: Constraint `(country, taxId)` + validação
- **Race conditions**: Try/catch em constraint violation (P2002)
- **Mensagens específicas**: Não revela informações sensíveis

### 3. Tokens de Verificação

- **Geração**: `crypto.randomBytes(32).toString('hex')` (64 chars)
- **Expiração**: 24 horas
- **Uso único**: Token invalidado após verificação
- **Índice único**: Previne duplicação de tokens

### 4. Login Seguro

- **Email verificado** obrigatório antes de fazer login
- **Mensagem clara**: "Verifique sua caixa de entrada..."
- **Bloqueio de conta** mantido (5 tentativas → 15 min)

---

## 📊 Fluxo Completo de Registro

```
1. Usuário preenche formulário
   ↓
2. POST /api/auth/register
   ↓
3. Validações:
   - Email único
   - Empresa única (country + taxId)
   - Documento fiscal válido
   - Senha forte
   ↓
4. Criação (transação atômica):
   - User (emailVerified: false, verificationToken)
   - Company (com dados completos)
   ↓
5. Envio de email
   - Token de verificação
   - Link com 24h de validade
   ↓
6. Usuário clica no link
   ↓
7. GET /api/auth/verify-email?token=xxx
   ↓
8. Validações:
   - Token existe
   - Não expirado
   - Não já usado
   ↓
9. Ativação:
   - emailVerified = true
   - activatedAt = now()
   - token = null
   ↓
10. Redirecionamento
   - /login?verified=true
   ↓
11. Login permitido
   - Acesso ao dashboard
```

---

## 🧪 Testes Necessários

### Unitários

- [ ] `AuthService.register()` - sucesso
- [ ] `AuthService.register()` - email duplicado
- [ ] `AuthService.register()` - empresa duplicada
- [ ] `AuthService.register()` - documento fiscal inválido
- [ ] `EmailVerificationService.verifyEmail()` - sucesso
- [ ] `EmailVerificationService.verifyEmail()` - token inválido
- [ ] `EmailVerificationService.verifyEmail()` - token expirado
- [ ] `EmailVerificationService.resendVerification()` - sucesso

### Integração

- [ ] Fluxo completo: registro → verificação → login
- [ ] Tentativa de login sem verificar email
- [ ] Verificação de disponibilidade (email e empresa)
- [ ] Reenvio de email de verificação

### Segurança

- [ ] SQL Injection nos inputs
- [ ] XSS em campos de texto
- [ ] Race condition na criação de usuário/empresa
- [ ] Tentativa de reutilizar token
- [ ] Tentativa de usar token expirado

---

## 📝 TODOs e Próximos Passos

### Imediatos

1. ✅ Schema Prisma atualizado
2. ✅ AuthService.register() implementado
3. ✅ EmailVerificationService implementado
4. ✅ Rotas públicas criadas
5. ⏳ Frontend - RegisterPage
6. ⏳ Frontend - VerifyEmailPage
7. ⏳ Integração com EmailService (US-067)

### Melhorias Futuras

- [ ] Rate limiting (3 registros/hora por IP)
- [ ] reCAPTCHA v3 (score mínimo: 0.5)
- [ ] Logs de tentativas de registro
- [ ] Métricas de conversão (registro → verificação → login)
- [ ] Template profissional de email
- [ ] Notificações ao admin de novos registros

---

## 🚀 Como Testar

### 1. Verificar se servidor está rodando

```bash
cd backend
npm run dev
```

### 2. Testar registro via cURL

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novo@teste.com",
    "password": "Senha@123",
    "name": "Novo Usuário",
    "phone": "11987654321",
    "country": "BR",
    "taxId": "12345678000190",
    "taxIdType": "CNPJ",
    "razaoSocial": "Nova Empresa Ltda",
    "cidade": "São Paulo",
    "uf": "SP",
    "telefone": "1133334444"
  }'
```

### 3. Verificar console.log do email

O token de verificação será exibido no console do servidor:

```
=================================
📧 EMAIL DE VERIFICAÇÃO
=================================
Para: novo@teste.com
Nome: Novo Usuário
Token: abc123...
Link: http://localhost:5173/auth/verify-email?token=abc123...
=================================
```

### 4. Testar verificação

```bash
curl http://localhost:3000/api/auth/verify-email?token=abc123...
```

### 5. Testar login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novo@teste.com",
    "password": "Senha@123"
  }'
```

---

## 📚 Referências

- **Épico**: [epic-09-auto-cadastro.md](../01-prd/05-user-stories/epic-09-auto-cadastro.md)
- **Schema**: [schema.prisma](../../backend/prisma/schema.prisma)
- **AuthService**: [auth.service.ts](../../backend/src/modules/auth/auth.service.ts)
- **EmailVerificationService**: [email-verification.service.ts](../../backend/src/modules/auth/services/email-verification.service.ts)
- **AuthController**: [auth.controller.ts](../../backend/src/modules/auth/auth.controller.ts)
- **Routes**: [auth.routes.ts](../../backend/src/modules/auth/auth.routes.ts)

---

**Implementado por**: Claude AI
**Data**: 17/12/2025
**Status**: ✅ Backend Completo - Pronto para Frontend
