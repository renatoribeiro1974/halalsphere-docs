# Problema de Login - Email Não Verificado

## Problema Identificado

Alguns usuários não conseguiam fazer login devido à validação de email não verificado. O sistema retornava erro 401 com a mensagem:

```
Email não verificado. Verifique sua caixa de entrada para ativar sua conta.
```

## Causa Raiz

O sistema possui verificação de email obrigatória para segurança, mas:
1. O SMTP não está configurado no ambiente de desenvolvimento
2. Os emails de verificação não foram enviados
3. Usuários criados manualmente ficam com `emailVerified: false` por padrão

## Solução Implementada

### 1. Scripts de Manutenção

Criados scripts para gerenciar o status de verificação dos usuários:

#### Verificar Status dos Usuários
```bash
cd backend
npx ts-node scripts/verify-users.ts
```

#### Verificar Todos os Usuários Automaticamente
```bash
cd backend
npx ts-node scripts/verify-users.ts --verify-all
```

#### Resetar Tentativas de Login Falhas
```bash
cd backend
npx ts-node scripts/reset-login-attempts.ts
```

### 2. Configuração de Ambiente

Adicionada variável de ambiente para desabilitar verificação de email em desenvolvimento:

```env
# Email Verification
# Set to "false" to skip email verification in development
REQUIRE_EMAIL_VERIFICATION="false"
```

Quando `REQUIRE_EMAIL_VERIFICATION=false`, o sistema permite login mesmo com email não verificado.

### 3. Melhorias de Logging

Adicionado logging detalhado no endpoint de login para facilitar debugging:

- Log de tentativa de login (incluindo email)
- Log de login bem-sucedido (incluindo userId e role)
- Log de falhas de login (incluindo motivo específico)

## Como Usar em Desenvolvimento

### Opção 1: Desabilitar Verificação de Email (Recomendado)

1. Editar `backend/.env`:
```env
REQUIRE_EMAIL_VERIFICATION="false"
```

2. Reiniciar o servidor backend

### Opção 2: Verificar Usuários Manualmente

1. Executar o script de verificação:
```bash
cd backend
npx ts-node scripts/verify-users.ts --verify-all
```

## Como Usar em Produção

### Configurar SMTP

1. Editar `backend/.env`:
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="seu-email@gmail.com"
SMTP_PASSWORD="sua-senha-de-app"
SMTP_FROM_EMAIL="noreply@halalsphere.com"
SMTP_FROM_NAME="HalalSphere"

# IMPORTANTE: Manter verificação habilitada em produção
REQUIRE_EMAIL_VERIFICATION="true"
```

2. Para Gmail, ativar "Senhas de App" nas configurações da conta Google

3. Reiniciar o servidor backend

## Usuários do Sistema

Após a correção, todos os usuários foram verificados:

- ✓ admin@halalsphere.com (admin)
- ✓ comercial@halalsphere.com (comercial)
- ✓ juridico@halalsphere.com (juridico)
- ✓ analista@halalsphere.com (analista)
- ✓ gestor@halalsphere.com (gestor)
- ✓ auditor@halalsphere.com (auditor)
- ✓ nilsa@halalsphere.com (admin)
- ✓ renato@halalsphere.com (admin)
- ✓ empresa@teste.com (empresa)
- ✓ frigo@dasilva.com (empresa)
- ✓ contato@empresa2.com (empresa)

## Segurança

**IMPORTANTE:**
- Em ambiente de **DESENVOLVIMENTO**: Pode desabilitar verificação de email
- Em ambiente de **PRODUÇÃO**: SEMPRE manter verificação de email habilitada
- Configurar SMTP corretamente antes de ir para produção
- Nunca commitar credenciais SMTP no repositório

## Arquivos Modificados

- `backend/src/modules/auth/auth.service.ts` - Verificação condicional de email
- `backend/src/modules/auth/auth.controller.ts` - Logging melhorado
- `backend/.env` - Nova variável REQUIRE_EMAIL_VERIFICATION
- `backend/scripts/verify-users.ts` - Script de verificação de usuários (novo)
- `backend/scripts/reset-login-attempts.ts` - Script de reset de tentativas (novo)

## Troubleshooting

### Erro: "Conta bloqueada por 15 minutos"

Usuário fez 5 tentativas de login falhas. Soluções:
1. Aguardar 15 minutos
2. Executar script de reset: `npx ts-node scripts/reset-login-attempts.ts`

### Erro: "Credenciais inválidas"

Verificar:
1. Email correto
2. Senha correta
3. Usuário existe no banco de dados

### Logs do Backend

Para ver logs detalhados de tentativas de login, verificar saída do servidor:
- Tentativa de login: `Tentativa de login { email: '...' }`
- Sucesso: `Login bem-sucedido { email: '...', userId: '...', role: '...' }`
- Falha: `Falha no login { email: '...', error: '...' }`

## Referências

- [auth.service.ts:212-220](../../backend/src/modules/auth/auth.service.ts#L212-L220) - Lógica de verificação de email
- [auth.controller.ts:23-85](../../backend/src/modules/auth/auth.controller.ts#L23-L85) - Endpoint de login com logging
- [.env:36-38](../../backend/.env#L36-L38) - Configuração REQUIRE_EMAIL_VERIFICATION
