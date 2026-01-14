# Guia Rápido de Testes - Sprint 1

## 🚀 Como Executar os Testes

### Pré-requisitos:

1. **Backend rodando:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Banco de dados configurado** com dados de teste

3. **Node.js instalado** (para script de testes)

---

## 📝 Passo 1: Obter Tokens de Autenticação

### Opção A: Via Frontend

1. Abra o frontend: http://localhost:5173
2. Faça login como:
   - **Analista:** analista@halalsphere.com
   - **Empresa:** empresa@halalsphere.com
3. Abra DevTools (F12) → Console
4. Execute: `localStorage.getItem('token')`
5. Copie o token

### Opção B: Via API (curl)

```bash
# Login como Analista
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "analista@halalsphere.com",
    "password": "senha123"
  }'

# Login como Empresa
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "empresa@halalsphere.com",
    "password": "senha123"
  }'
```

**Copie o `token` do response.**

---

## 📝 Passo 2: Obter ID de Processo

### Via Frontend:
1. Login como analista
2. Vá para Dashboard
3. Clique em um processo
4. URL será: `/process/{PROCESS_ID}`
5. Copie o ID

### Via API:
```bash
curl -X GET http://localhost:3000/api/processes \
  -H "Authorization: Bearer {ANALYST_TOKEN}"
```

**Copie o `id` de algum processo.**

---

## 🧪 Passo 3: Executar Testes Automatizados

### Instalar dependências (se necessário):
```bash
npm install axios
```

### Executar script de testes:

```bash
# Windows (PowerShell)
$env:PROCESS_ID="seu-process-id-aqui"
$env:ANALYST_TOKEN="seu-token-analista-aqui"
$env:EMPRESA_TOKEN="seu-token-empresa-aqui"
node test-sprint1.js

# Linux/Mac
export PROCESS_ID="seu-process-id-aqui"
export ANALYST_TOKEN="seu-token-analista-aqui"
export EMPRESA_TOKEN="seu-token-empresa-aqui"
node test-sprint1.js
```

### Exemplo com valores reais:

```bash
# Windows
$env:PROCESS_ID="459e5975-31c5-42cf-9c08-bb2ccec52461"
$env:ANALYST_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
$env:EMPRESA_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
node test-sprint1.js
```

---

## 🎯 Passo 4: Testes Manuais no Frontend

### Teste 1: Todos os Status Mapeados

1. Login como analista
2. Abrir qualquer processo
3. Verificar que badge de status está visível
4. Alterar status manualmente no banco:
   ```sql
   UPDATE processes SET status = 'analise_documental' WHERE id = 'xxx';
   ```
5. Recarregar página
6. Verificar que status aparece como "Análise Documental"

**Repetir para todos os 16 status.**

---

### Teste 2: Botão Avançar Fase

1. Login como analista
2. Abrir processo na Fase 1 (cadastro_solicitacao)
3. Garantir que analista está atribuído:
   ```sql
   UPDATE processes
   SET analyst_id = (SELECT id FROM users WHERE role = 'analista' LIMIT 1)
   WHERE id = 'xxx';
   ```
4. Na página de detalhes, clicar em "Avançar Fase"
5. **Verificar:**
   - ✅ Botão fica desabilitado
   - ✅ Texto muda para "Avançando..."
   - ✅ Após sucesso, página atualiza
   - ✅ Timeline mostra progresso
   - ✅ Fase mudou de 1 para 2

---

### Teste 3: Validação de Pré-condições

1. Configurar processo na Fase 2 (analise_documental)
2. Adicionar documento pendente:
   ```sql
   INSERT INTO documents (request_id, document_type, file_name, file_url, file_size, mime_type, validation_status)
   VALUES ('xxx', 'contrato_social', 'test.pdf', '/test.pdf', 1000, 'application/pdf', 'pendente');
   ```
3. Tentar avançar fase
4. **Verificar:**
   - ❌ Erro aparece: "Existem documentos pendentes de validação"
   - ✅ Fase não avança

---

## 📊 Passo 5: Verificar Histórico

### Via SQL:

```sql
-- Verificar histórico de fases
SELECT
  p.phase,
  p.entered_at,
  p.exited_at,
  p.days_in_phase
FROM process_phase_history p
INNER JOIN processes pr ON p.process_id = pr.id
WHERE pr.request_id = 'seu-process-id'
ORDER BY p.entered_at;

-- Verificar histórico geral
SELECT
  ph.status,
  ph.notes,
  ph.created_at,
  u.name as changed_by
FROM process_history ph
INNER JOIN processes pr ON ph.process_id = pr.id
INNER JOIN users u ON ph.changed_by = u.id
WHERE pr.request_id = 'seu-process-id'
ORDER BY ph.created_at DESC;

-- Verificar audit log
SELECT *
FROM audit_trail
WHERE entity = 'process'
  AND entity_id = 'seu-process-id'
ORDER BY created_at DESC
LIMIT 10;
```

---

## ✅ Checklist Rápido

Marque conforme completa os testes:

### Testes Automatizados (via script):
- [ ] Teste 1: Status inválido rejeitado
- [ ] Teste 2: Status válido aceito
- [ ] Teste 3: Permissões validadas
- [ ] Teste 4: Pré-condições bloqueiam
- [ ] Teste 5: Campos do processo corretos
- [ ] Teste 6: Endpoint existe

### Testes Manuais:
- [ ] Todos 16 status aparecem corretamente
- [ ] Botão "Avançar Fase" funciona
- [ ] Pré-condições bloqueiam corretamente
- [ ] Timeline atualiza
- [ ] Histórico registrado

### Verificações no Banco:
- [ ] process_phase_history registra transições
- [ ] process_history registra mudanças
- [ ] audit_trail registra ações

---

## 🐛 Problemas Comuns

### Erro: "Processo não encontrado"
**Solução:** Verifique se o PROCESS_ID está correto e corresponde a um Request ID (não Process ID do banco).

### Erro: "Unauthorized"
**Solução:** Token expirado. Faça login novamente e obtenha novo token.

### Erro: "Endpoint não encontrado (404)"
**Solução:** Backend não está rodando ou rota não foi registrada. Verifique:
```bash
cd backend
npm run dev
```

### Teste bloqueado por pré-condições
**Solução:** Normal! Ajuste os dados no banco para atender pré-condições ou use processo diferente.

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique logs do backend: `backend/logs/`
2. Verifique console do navegador (DevTools)
3. Consulte documentação: [TESTES_SPRINT1.md](TESTES_SPRINT1.md)
4. Revise implementação: [IMPLEMENTACOES_SPRINT1.md](IMPLEMENTACOES_SPRINT1.md)

---

## 🎉 Resultado Esperado

Se todos os testes passarem:

```
╔════════════════════════════════════════════════════════════╗
║                     📊 RESUMO DOS TESTES                   ║
╚════════════════════════════════════════════════════════════╝

   ✅ Passou: 6/6
   ❌ Falhou: 0/6

   📈 Taxa de Sucesso: 100%

   🎉 TODOS OS TESTES PASSARAM!
   ✅ Sprint 1 validada com sucesso
```

**Sprint 1 está pronta para produção!** 🚀
