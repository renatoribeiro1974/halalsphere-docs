## 🌐 API Endpoints

### Contratos

**POST** /api/contracts - Cria novo contrato
**GET** /api/contracts - Lista contratos
**GET** /api/contracts/:id - Busca por ID
**GET** /api/contracts/process/:processId - Busca por processo
**GET** /api/contracts/stats - Estatísticas
**PUT** /api/contracts/:id - Atualiza contrato
**POST** /api/contracts/:id/generate-pdf - Gera PDF
**POST** /api/contracts/:id/send-for-signature - Envia para assinatura
**POST** /api/contracts/:id/sign - Assina contrato
**POST** /api/contracts/:id/cancel - Cancela contrato
**POST** /api/contracts/webhook/signature - Webhook (sem auth)

### Configuração de Assinatura

**GET** /api/e-signature-config - Lista configurações
**GET** /api/e-signature-config/active - Configuração ativa
**POST** /api/e-signature-config - Cria/atualiza
**PATCH** /api/e-signature-config/:id - Atualiza
**POST** /api/e-signature-config/:id/activate - Ativa
**DELETE** /api/e-signature-config/:id - Remove
**POST** /api/e-signature-config/test - Testa credenciais
