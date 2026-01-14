# Guia de Teste - Sistema de Armazenamento

## ✅ Servidor Inicializado com Sucesso!

O backend está rodando em: **http://localhost:3333**

## 🧪 Como Testar o Sistema

### 1. Acessar a Interface de Configuração

1. Inicie o frontend:
   ```bash
   cd frontend
   npm run dev
   ```

2. Acesse: **http://localhost:5173**

3. Faça login como **Admin**

4. Navegue para: **`/admin/armazenamento`**

### 2. Criar Configuração de Armazenamento Local

1. Clique em **"Nova Configuração"**
2. Selecione **"Local"**
3. Digite o caminho:
   ```
   C:\Projetos\HalalSphere\backend\uploads
   ```
4. Clique em **"Criar Configuração"**
5. A configuração será criada
6. Clique em **"Ativar"** para ativá-la

### 3. Testar Upload de Documento

1. Navegue para uma solicitação existente
2. Faça upload de um documento
3. O arquivo será salvo em:
   ```
   C:\Projetos\HalalSphere\backend\uploads\companies\{company-id}\documents\
   ```

### 4. Verificar Bucket da Empresa

1. Volte para `/admin/armazenamento`
2. Clique na aba **"Buckets por Empresa"**
3. Você verá:
   - Nome da empresa
   - Nome do bucket
   - Quantidade de arquivos
   - Tamanho total

---

## 🧪 Testar via API (Postman/cURL)

### 1. Fazer Login e Obter Token

```bash
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@halalsphere.com",
    "password": "sua-senha"
  }'
```

Copie o `token` retornado.

### 2. Listar Configurações

```bash
curl -X GET http://localhost:3333/api/storage-configs \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 3. Obter Configuração Ativa

```bash
curl -X GET http://localhost:3333/api/storage-configs/active \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 4. Criar Configuração Local

```bash
curl -X POST http://localhost:3333/api/storage-configs \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "local",
    "localPath": "C:\\Projetos\\HalalSphere\\backend\\uploads"
  }'
```

### 5. Ativar Configuração

Substitua `{CONFIG_ID}` pelo ID retornado:

```bash
curl -X POST http://localhost:3333/api/storage-configs/{CONFIG_ID}/activate \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 6. Listar Buckets de Empresas

```bash
curl -X GET http://localhost:3333/api/storage-configs/buckets \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 🔍 Verificar no Banco de Dados

### Configurações de Storage

```sql
SELECT
  id,
  provider,
  local_path,
  s3_region,
  is_active,
  created_at
FROM storage_configs
ORDER BY created_at DESC;
```

### Buckets de Empresas

```sql
SELECT
  cb.id,
  cb.bucket_name,
  cb.file_count,
  cb.total_size,
  c.razao_social,
  sc.provider
FROM company_buckets cb
JOIN companies c ON cb.company_id = c.id
JOIN storage_configs sc ON cb.storage_config_id = sc.id
ORDER BY cb.created_at DESC;
```

---

## 📂 Verificar Arquivos no Sistema de Arquivos

### Windows (PowerShell)

```powershell
# Ver estrutura de pastas
Get-ChildItem C:\Projetos\HalalSphere\backend\uploads -Recurse

# Ver pastas de empresas
Get-ChildItem C:\Projetos\HalalSphere\backend\uploads\companies
```

### Linux/Mac

```bash
# Ver estrutura
tree backend/uploads/

# Ver pastas de empresas
ls -la backend/uploads/companies/
```

---

## 🎯 Cenários de Teste

### ✅ Teste 1: Configuração Local Básica
- [ ] Criar configuração local
- [ ] Ativar configuração
- [ ] Fazer upload de documento
- [ ] Verificar arquivo no disco
- [ ] Verificar registro no banco

### ✅ Teste 2: Múltiplas Empresas
- [ ] Empresa A faz upload
- [ ] Empresa B faz upload
- [ ] Verificar pastas separadas no disco
- [ ] Verificar buckets diferentes no banco

### ✅ Teste 3: Download de Documento
- [ ] Fazer upload de arquivo
- [ ] Fazer download via API
- [ ] Verificar integridade do arquivo

### ✅ Teste 4: Deletar Documento
- [ ] Fazer upload de arquivo
- [ ] Deletar via API
- [ ] Verificar arquivo removido do disco
- [ ] Verificar registro removido do banco

### ✅ Teste 5: Estatísticas de Bucket
- [ ] Fazer upload de vários arquivos
- [ ] Consultar estatísticas via API
- [ ] Verificar contagem correta
- [ ] Verificar tamanho total

---

## 🐛 Troubleshooting

### Erro: "No active storage configuration found"

**Solução:**
1. Acesse `/admin/armazenamento`
2. Crie uma configuração
3. Clique em "Ativar"

### Erro: "Permission denied" ao fazer upload

**Solução (Windows):**
1. Verifique se a pasta existe:
   ```powershell
   New-Item -Path "C:\Projetos\HalalSphere\backend\uploads" -ItemType Directory -Force
   ```

**Solução (Linux/Mac):**
```bash
mkdir -p backend/uploads
chmod 755 backend/uploads
```

### Arquivos não aparecem no disco

**Verificar:**
1. Configuração está ativa?
2. Caminho está correto?
3. Permissões de escrita?
4. Logs do backend para ver erros

### Bucket não aparece na lista

**Verificar:**
1. Empresa já fez upload?
2. Bucket é criado no primeiro upload
3. Verificar tabela `company_buckets` no banco

---

## 📊 Monitoramento em Produção

### Métricas Importantes

1. **Espaço em Disco**
   - Monitorar pasta `uploads/`
   - Alertar quando > 80% cheio

2. **Tamanho de Buckets**
   - Query para ver maiores buckets:
   ```sql
   SELECT
     c.razao_social,
     cb.bucket_name,
     cb.file_count,
     ROUND(cb.total_size / 1024.0 / 1024.0, 2) as size_mb
   FROM company_buckets cb
   JOIN companies c ON cb.company_id = c.id
   ORDER BY cb.total_size DESC
   LIMIT 10;
   ```

3. **Uploads Recentes**
   ```sql
   SELECT
     d.file_name,
     d.file_size,
     d.uploaded_at,
     c.razao_social
   FROM documents d
   JOIN requests r ON d.request_id = r.id
   JOIN companies c ON r.company_id = c.id
   ORDER BY d.uploaded_at DESC
   LIMIT 20;
   ```

---

## 🚀 Próximo Passo: Configurar S3

Para testar com AWS S3:

1. Criar conta AWS
2. Criar bucket S3
3. Criar IAM user com permissões S3
4. Obter Access Key e Secret Key
5. Criar configuração S3 no sistema
6. Ativar e testar

Veja mais detalhes em: [CONFIGURACAO-ARMAZENAMENTO.md](CONFIGURACAO-ARMAZENAMENTO.md)

---

## ✅ Checklist Final

- [x] Backend rodando sem erros
- [x] Middleware de role criado
- [x] Tabelas criadas no banco
- [x] Dependências AWS SDK instaladas
- [ ] Configuração criada e ativada
- [ ] Upload testado com sucesso
- [ ] Buckets visíveis na interface
- [ ] Arquivos salvos no disco

**Status**: ✅ Sistema pronto para testes!
