# Fix: Erro 401 no proposal.service.ts

**Data:** 19/12/2024
**Issue:** Erro 401 ao acessar detalhes de proposta após login bem-sucedido

---

## 🐛 Problema

Usuário conseguia fazer login e navegar pelo sistema, mas ao acessar detalhes de uma proposta recebia erro 401:

```
GET http://localhost:3333/api/proposals/process/286516b1-5444-48a5-8b8d-0c4b17d95125 401 (Unauthorized)
```

**Comportamento Observado:**
- Login funcionava ✅
- Dashboard carregava ✅
- Lista de propostas carregava ✅
- Detalhes da proposta falhava ❌ (401)

---

## 🔍 Diagnóstico

### Causa Raiz

O arquivo `proposal.service.ts` estava usando `axios` diretamente em vez da instância `api` configurada.

**Problema:**

```typescript
// ❌ ERRADO - Não tem o interceptor do token
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

class ProposalService {
  async getByProcessId(processId: string) {
    const response = await axios.get(`${API_URL}/proposals/process/${processId}`);
    return response.data.data;
  }
}
```

**Por que isso causava 401?**

1. A instância `api` em `lib/api.ts` tem um **interceptor** que adiciona automaticamente o token:
   ```typescript
   api.interceptors.request.use((config) => {
     const token = localStorage.getItem('token');
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });
   ```

2. O `axios` importado diretamente **NÃO tem esse interceptor**
3. Portanto, requisições feitas com `axios` direto **não enviavam o token**
4. Backend rejeitava com 401 (Unauthorized)

### Por que Outros Endpoints Funcionavam?

Outros services (como `api` usado no Dashboard Comercial) já usavam a instância correta:

```typescript
// ✅ CORRETO
import { api } from '../../lib/api';

const response = await api.get('/comercial/dashboard');
```

---

## ✅ Solução Aplicada

### Mudanças em `proposal.service.ts`

**Antes:**
```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

class ProposalService {
  async calculate(input: CalculationInput) {
    const response = await axios.post(`${API_URL}/proposals/calculate`, input);
    return response.data.data;
  }

  async getByProcessId(processId: string) {
    const response = await axios.get(`${API_URL}/proposals/process/${processId}`);
    return response.data.data;
  }

  // ... todos os outros métodos usando axios
}
```

**Depois:**
```typescript
import { api } from '../lib/api';

class ProposalService {
  async calculate(input: CalculationInput) {
    const response = await api.post('/proposals/calculate', input);
    return response.data.data;
  }

  async getByProcessId(processId: string) {
    const response = await api.get(`/proposals/process/${processId}`);
    return response.data.data;
  }

  // ... todos os outros métodos usando api
}
```

### Alterações Específicas

1. **Import:**
   ```diff
   - import axios from 'axios';
   - const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';
   + import { api } from '../lib/api';
   ```

2. **Todos os métodos:**
   ```diff
   - await axios.get(`${API_URL}/proposals/...`)
   + await api.get('/proposals/...')

   - await axios.post(`${API_URL}/proposals/...`, data)
   + await api.post('/proposals/...', data)

   - await axios.put(`${API_URL}/proposals/...`, data)
   + await api.put('/proposals/...', data)
   ```

---

## 🧪 Validação

### Teste 1: Detalhes de Proposta

1. Fazer login como comercial
2. Acessar lista de propostas
3. Clicar em "Ver Detalhes"
4. ✅ Página carrega sem erro 401

### Teste 2: Criar Proposta

1. Criar nova proposta
2. ✅ Criação funciona

### Teste 3: Ajustar Proposta

1. Ajustar proposta existente
2. ✅ Ajuste funciona

### Teste 4: Enviar Proposta

1. Enviar proposta para empresa
2. ✅ Envio funciona

---

## 📚 Lições Aprendadas

### 1. Sempre Usar a Instância Configurada

**Regra:** Nunca importe `axios` diretamente em services.

```typescript
// ❌ NUNCA FAZER ISSO
import axios from 'axios';
await axios.get('...');

// ✅ SEMPRE FAZER ISSO
import { api } from '../lib/api';
await api.get('...');
```

### 2. Centralizar Configuração HTTP

A instância `api` em `lib/api.ts` centraliza:
- Base URL
- Interceptor de autenticação (token)
- Interceptor de erros (401 → logout)
- Headers padrão

### 3. Checklist para Novos Services

Ao criar um novo service:

- [ ] Importar `api` de `lib/api.ts`
- [ ] **NÃO** importar `axios` diretamente
- [ ] Usar URLs relativas (sem `API_URL`)
- [ ] Testar com autenticação

---

## 🔍 Como Identificar Esse Problema

### Sintomas

1. Login funciona
2. Alguns endpoints funcionam
3. Outros endpoints retornam 401
4. Token existe no localStorage
5. Erro ocorre em services específicos

### Debug

1. **Verificar import no service:**
   ```bash
   grep "import axios" frontend/src/services/*.ts
   ```

2. **Verificar se usa API_URL:**
   ```bash
   grep "API_URL" frontend/src/services/*.ts
   ```

3. **Verificar Network tab:**
   - Requisição tem header `Authorization: Bearer ...`?
   - Se NÃO → Service não está usando `api` configurada

---

## 🛠️ Arquivos Afetados

### Modificados

```
frontend/src/services/proposal.service.ts
- Removido: import axios, const API_URL
- Adicionado: import { api } from '../lib/api'
- Alterado: Todos os métodos para usar api em vez de axios
```

### Referência

```
frontend/src/lib/api.ts
- Instância axios configurada com interceptors
- Adiciona token automaticamente
- Trata erro 401 com redirect
```

---

## 📖 Padrão Correto para Services

### Template para Novos Services

```typescript
import { api } from '../lib/api';

interface MyEntity {
  id: string;
  name: string;
}

class MyService {
  async getAll(): Promise<MyEntity[]> {
    const response = await api.get('/my-entities');
    return response.data.data;
  }

  async getById(id: string): Promise<MyEntity> {
    const response = await api.get(`/my-entities/${id}`);
    return response.data.data;
  }

  async create(data: Partial<MyEntity>): Promise<MyEntity> {
    const response = await api.post('/my-entities', data);
    return response.data.data;
  }

  async update(id: string, data: Partial<MyEntity>): Promise<MyEntity> {
    const response = await api.put(`/my-entities/${id}`, data);
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/my-entities/${id}`);
  }
}

export const myService = new MyService();
```

**Pontos-chave:**
- ✅ Import `api` de `lib/api.ts`
- ✅ URLs relativas (começam com `/`)
- ✅ Não precisa adicionar token manualmente
- ✅ Erro 401 será tratado automaticamente pelo interceptor

---

## 🚨 Outros Services para Verificar

Execute este comando para encontrar outros services que podem ter o mesmo problema:

```bash
cd frontend/src
grep -r "import axios from" services/
```

Se encontrar algum, aplicar a mesma correção:
1. Trocar `import axios` por `import { api }`
2. Remover `const API_URL`
3. Trocar `axios.get(...)` por `api.get(...)`
4. Usar URLs relativas

---

## ✅ Checklist de Correção

Ao encontrar um service usando `axios` direto:

- [ ] Trocar import de `axios` para `api`
- [ ] Remover definição de `API_URL`
- [ ] Atualizar todos os métodos para usar `api`
- [ ] Converter URLs absolutas para relativas
- [ ] Testar todos os métodos do service
- [ ] Verificar Network tab para confirmar token está sendo enviado

---

## 🎯 Conclusão

**Problema:** `proposal.service.ts` usava `axios` direto, sem interceptor de token

**Solução:** Migrar para instância `api` configurada

**Resultado:** ✅ Todos os endpoints de proposta agora funcionam com autenticação

**Prevenção:** Sempre usar `api` de `lib/api.ts` em todos os services

---

## 📎 Links Relacionados

- Instância API: [frontend/src/lib/api.ts](../../frontend/src/lib/api.ts)
- Service corrigido: [frontend/src/services/proposal.service.ts](../../frontend/src/services/proposal.service.ts)
- Issue anterior: [LOGIN-COMERCIAL-401.md](./LOGIN-COMERCIAL-401.md)
