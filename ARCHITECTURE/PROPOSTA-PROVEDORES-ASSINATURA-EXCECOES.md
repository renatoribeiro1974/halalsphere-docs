# Proposta: Sistema de Provedores de Assinatura Eletrônica com Exceções

**Data:** 2025-12-17
**Status:** Proposta Documentada - Aguardando Implementação
**Contexto:** Sistema atual permite apenas um provedor padrão global. Necessidade de suportar exceções por cliente/documento.

---

## Problema

### Situação Atual
- Sistema possui configuração global em `ESignatureConfig` com um provedor padrão ativo
- Todos os contratos usam automaticamente o provedor configurado
- Não há flexibilidade para casos excepcionais

### Cenário de Uso
```
Exemplo:
- Provedor Padrão: D4Sign
- Cliente X: Requer ClickSign para todos os contratos
- Cliente Y: Requer DocuSign apenas para contratos internacionais
```

### Arquivos Envolvidos
- [backend/src/modules/contract/contract.service.ts](../../backend/src/modules/contract/contract.service.ts)
- [backend/src/services/e-signature/e-signature-config.service.ts](../../backend/src/services/e-signature/e-signature-config.service.ts)
- [backend/prisma/schema.prisma](../../backend/prisma/schema.prisma)

---

## Soluções Propostas

### Comparativo Rápido

| Abordagem | Complexidade | Schema Change | Memoriza Preferência | Recomendação |
|-----------|--------------|---------------|---------------------|--------------|
| 1. Override Simples | Baixa | ❌ Não | ❌ Não | ✅ **Implementar Primeiro** |
| 2. Preferências por Empresa | Média | ✅ Sim | ✅ Sim | 🔄 Migrar se houver demanda |
| 3. Múltiplas Configs Ativas | Alta | ✅ Sim | ✅ Sim | ❌ Over-engineering |

---

## Abordagem 1: Override Simples por Contrato ⭐ RECOMENDADO

### Descrição
Permite especificar um provedor diferente no momento de enviar o contrato para assinatura, sem persistir preferências do cliente.

### Vantagens
- ✅ Implementação rápida (1-2 horas)
- ✅ Zero alterações no banco de dados
- ✅ Flexibilidade imediata
- ✅ Controle manual (maior segurança)
- ✅ Permite transição gradual para Abordagem 2

### Desvantagens
- ❌ Não memoriza preferência do cliente
- ❌ Precisa especificar manualmente a cada envio
- ❌ Dependente de processo operacional

### Implementação

#### 1. Atualizar DTO

```typescript
// backend/src/modules/contract/contract.types.ts

export interface SendContractDto {
  /**
   * Provedor específico para este contrato
   * Sobrescreve o provedor padrão do sistema
   */
  overrideProvider?: 'd4sign' | 'clicksign' | 'docusign' | 'none';

  /**
   * Credenciais específicas para este envio (opcional)
   * Se não fornecidas, usa credenciais da config existente
   */
  overrideCredentials?: {
    // D4Sign
    d4signApiKey?: string;
    d4signCryptoKey?: string;
    d4signSafeId?: string;
    d4signEnvironment?: 'sandbox' | 'production';

    // ClickSign
    clicksignApiKey?: string;
    clicksignEnvironment?: 'sandbox' | 'production';

    // DocuSign
    docusignIntegrationKey?: string;
    docusignUserId?: string;
    docusignAccountId?: string;
    docusignPrivateKey?: string;
    docusignEnvironment?: 'sandbox' | 'production';
  };

  /**
   * Motivo do override (para auditoria)
   */
  overrideReason?: string;
}
```

#### 2. Modificar `sendForSignature`

```typescript
// backend/src/modules/contract/contract.service.ts

async sendForSignature(id: string, dto?: SendContractDto): Promise<Contract> {
  const contract = await prisma.contract.findUnique({
    where: { id },
    include: { signatures: true },
  });

  if (!contract) {
    throw new Error('Contrato não encontrado');
  }

  if (contract.status !== 'rascunho') {
    throw new Error('Apenas contratos em rascunho podem ser enviados');
  }

  // Gera PDF se ainda não foi gerado
  let pdfUrl = contract.pdfUrl;
  if (!pdfUrl) {
    pdfUrl = await this.generatePDF(id);
  }

  // ====================================================================
  // LÓGICA DE SELEÇÃO DE PROVEDOR
  // ====================================================================

  let provider: ESignatureProvider | null = null;
  let providerType: ESignatureProviderEnum | null = null;
  let eSignatureConfig: any = null;

  if (dto?.overrideProvider && dto.overrideProvider !== 'none') {
    // ===== CASO 1: OVERRIDE MANUAL (EXCEÇÃO) =====
    console.log(`[E-Signature Override] Usando provedor específico: ${dto.overrideProvider}`);

    if (dto.overrideReason) {
      console.log(`[E-Signature Override] Motivo: ${dto.overrideReason}`);
    }

    // Busca configuração existente do provedor solicitado (mesmo que inativa)
    const providerConfig = await prisma.eSignatureConfig.findFirst({
      where: { provider: dto.overrideProvider },
      orderBy: { createdAt: 'desc' }, // Mais recente
    });

    if (!providerConfig && !dto.overrideCredentials) {
      throw new Error(
        `Provedor ${dto.overrideProvider} não configurado. ` +
        `Forneça credenciais via overrideCredentials ou configure o provedor.`
      );
    }

    // Usa credenciais fornecidas ou da config encontrada
    const credentials = dto.overrideCredentials || providerConfig;

    // Instancia o provedor com as credenciais
    provider = this.eSignatureConfigService.instantiateProvider(
      dto.overrideProvider,
      credentials
    );

    providerType = dto.overrideProvider;
    eSignatureConfig = {
      expirationDays: providerConfig?.expirationDays || 30,
      autoSendOnCreate: providerConfig?.autoSendOnCreate ?? true,
      provider: dto.overrideProvider,
    };

  } else {
    // ===== CASO 2: PROVEDOR PADRÃO DO SISTEMA =====
    console.log('[E-Signature] Usando provedor padrão do sistema');

    eSignatureConfig = await this.eSignatureConfigService.getActiveConfig();
    provider = await this.eSignatureConfigService.getActiveProvider();
    providerType = eSignatureConfig?.provider || null;
  }

  // ====================================================================
  // ENVIO PARA ASSINATURA ELETRÔNICA
  // ====================================================================

  if (provider && providerType && providerType !== 'none') {
    // Prepara lista de signatários
    const signers = contract.signatures.map((sig) => ({
      name: sig.signerName,
      email: sig.signerEmail,
      role: sig.signerRole,
      type: sig.signerType as 'empresa' | 'certificadora',
    }));

    // Cria documento na plataforma de assinatura
    const result = await provider.createDocument({
      contractId: contract.id,
      documentName: `Contrato-${contract.contractNumber}`,
      pdfUrl: `${process.env.APP_URL}${pdfUrl}`,
      signers,
      expirationDays: eSignatureConfig.expirationDays || 30,
      autoSend: eSignatureConfig.autoSendOnCreate ?? true,
    });

    // Atualiza assinaturas com IDs e URLs da plataforma
    for (const signer of result.signers) {
      await prisma.contractSignature.updateMany({
        where: {
          contractId: contract.id,
          signerEmail: signer.signerEmail,
        },
        data: {
          eSignatureSignerId: signer.signerId,
          eSignatureUrl: signer.signatureUrl,
        },
      });
    }

    // Atualiza contrato com dados da assinatura eletrônica
    const updatedContract = await prisma.contract.update({
      where: { id },
      data: {
        status: 'enviado',
        sentAt: new Date(),
        eSignatureProvider: providerType,
        eSignatureDocId: result.documentId,
        eSignatureUrl: result.documentUrl,
      },
    });

    // Log de auditoria para overrides
    if (dto?.overrideProvider) {
      console.log(`[Audit] Contrato ${contract.contractNumber} enviado com override: ${providerType}`);
      // TODO: Registrar em AuditTrail
    }

    return updatedContract;

  } else {
    // ===== SEM ASSINATURA ELETRÔNICA - MANUAL =====
    console.log('[E-Signature] Sem assinatura eletrônica - processo manual');

    // TODO: Enviar email para signatários com PDF anexo

    return prisma.contract.update({
      where: { id },
      data: {
        status: 'enviado',
        sentAt: new Date(),
        eSignatureProvider: 'none',
      },
    });
  }
}
```

#### 3. Tornar `instantiateProvider` Público

```typescript
// backend/src/services/e-signature/e-signature-config.service.ts

export class ESignatureConfigService {
  // ... métodos existentes

  /**
   * Instancia o provider baseado no tipo
   * PÚBLICO para permitir uso com override
   */
  public instantiateProvider(
    providerType: ESignatureProviderEnum,
    config: any
  ): ESignatureProvider {
    switch (providerType) {
      case 'd4sign':
        if (!config.d4signApiKey || !config.d4signCryptoKey || !config.d4signSafeId) {
          throw new Error('Configuração D4Sign incompleta');
        }
        return new D4SignProvider({
          apiKey: config.d4signApiKey,
          cryptoKey: config.d4signCryptoKey,
          safeId: config.d4signSafeId,
          environment: config.d4signEnvironment || 'production',
        });

      case 'clicksign':
        if (!config.clicksignApiKey) {
          throw new Error('Configuração ClickSign incompleta');
        }
        return new ClickSignProvider({
          apiKey: config.clicksignApiKey,
          environment: config.clicksignEnvironment || 'production',
        });

      case 'docusign':
        throw new Error('Provider DocuSign ainda não implementado');

      default:
        throw new Error(`Provider ${providerType} não suportado`);
    }
  }
}
```

#### 4. Endpoint de Envio

```typescript
// backend/src/modules/contract/contract.controller.ts

/**
 * POST /api/contracts/:id/send
 * Envia contrato para assinatura
 */
async sendForSignature(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const dto: SendContractDto = req.body;

    // Validação de override provider
    if (dto.overrideProvider) {
      const validProviders = ['d4sign', 'clicksign', 'docusign', 'none'];
      if (!validProviders.includes(dto.overrideProvider)) {
        return res.status(400).json({
          error: `Provider inválido. Opções: ${validProviders.join(', ')}`
        });
      }
    }

    const contract = await contractService.sendForSignature(id, dto);

    res.json({
      message: 'Contrato enviado para assinatura',
      contract: {
        id: contract.id,
        status: contract.status,
        eSignatureProvider: contract.eSignatureProvider,
        eSignatureUrl: contract.eSignatureUrl,
      },
    });
  } catch (error: any) {
    console.error('Erro ao enviar contrato:', error);
    res.status(500).json({ error: error.message });
  }
}
```

### Exemplo de Uso

```typescript
// ===== USO NORMAL - PROVEDOR PADRÃO =====
await contractService.sendForSignature(contractId);
// Usa D4Sign (provedor padrão do sistema)

// ===== EXCEÇÃO 1 - CLIENTE REQUER CLICKSIGN =====
await contractService.sendForSignature(contractId, {
  overrideProvider: 'clicksign',
  overrideReason: 'Cliente Empresa X possui contrato com ClickSign'
});
// Usa ClickSign com credenciais já configuradas no sistema

// ===== EXCEÇÃO 2 - CREDENCIAIS ESPECÍFICAS =====
await contractService.sendForSignature(contractId, {
  overrideProvider: 'clicksign',
  overrideCredentials: {
    clicksignApiKey: 'api-key-especifica-cliente-x',
    clicksignEnvironment: 'production'
  },
  overrideReason: 'Contrato internacional - usar conta ClickSign do cliente'
});

// ===== EXCEÇÃO 3 - SEM ASSINATURA ELETRÔNICA =====
await contractService.sendForSignature(contractId, {
  overrideProvider: 'none',
  overrideReason: 'Cliente solicitou assinatura presencial'
});
```

### Frontend - Interface de Envio

```tsx
// frontend/src/components/analyst/SendContractModal.tsx

interface SendContractModalProps {
  contractId: string;
  onSuccess: () => void;
}

function SendContractModal({ contractId, onSuccess }: SendContractModalProps) {
  const [useOverride, setUseOverride] = useState(false);
  const [overrideProvider, setOverrideProvider] = useState<string>('');
  const [overrideReason, setOverrideReason] = useState('');

  const handleSend = async () => {
    const dto: SendContractDto = {};

    if (useOverride) {
      dto.overrideProvider = overrideProvider as any;
      dto.overrideReason = overrideReason;
    }

    await contractService.sendForSignature(contractId, dto);
    onSuccess();
  };

  return (
    <Dialog>
      <DialogContent>
        <h2>Enviar Contrato para Assinatura</h2>

        <div>
          <label>
            <input
              type="checkbox"
              checked={useOverride}
              onChange={(e) => setUseOverride(e.target.checked)}
            />
            Usar provedor diferente do padrão
          </label>
        </div>

        {useOverride && (
          <>
            <Select value={overrideProvider} onChange={setOverrideProvider}>
              <option value="">Selecione o provedor</option>
              <option value="d4sign">D4Sign</option>
              <option value="clicksign">ClickSign</option>
              <option value="docusign">DocuSign</option>
              <option value="none">Sem assinatura eletrônica</option>
            </Select>

            <Textarea
              placeholder="Motivo da exceção (obrigatório)"
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              required
            />
          </>
        )}

        <Button onClick={handleSend}>
          Enviar para Assinatura
        </Button>
      </DialogContent>
    </Dialog>
  );
}
```

### Pontos de Atenção

1. **Auditoria**: Todo override deve ser registrado em `AuditTrail`
2. **Validação**: Garantir que credenciais override sejam validadas antes de usar
3. **Segurança**: Não expor credenciais no frontend
4. **Documentação**: Processos operacionais devem documentar quando usar overrides

---

## Abordagem 2: Preferências por Empresa

### Descrição
Permite cadastrar uma preferência de provedor para cada empresa, que será usada automaticamente quando houver contratos dessa empresa.

### Vantagens
- ✅ Memoriza preferência do cliente (automação)
- ✅ Reduz erros operacionais
- ✅ Escalável para muitos clientes
- ✅ Permite regras por empresa

### Desvantagens
- ❌ Requer alteração no schema (migration)
- ❌ Mais complexo para implementar
- ❌ Requer UI para gerenciar preferências

### Quando Migrar
Implementar quando:
- 10+ empresas tiverem preferências específicas
- Equipe reportar erros frequentes de envio
- Necessidade de automação total

### Implementação

#### 1. Migration - Adicionar Preferências à Empresa

```prisma
// backend/prisma/schema.prisma

model Company {
  id     String @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  userId String @unique @map("user_id") @db.Uuid

  // ... campos existentes

  // ========================================
  // PREFERÊNCIAS DE ASSINATURA ELETRÔNICA
  // ========================================

  /**
   * Provedor preferido para esta empresa
   * Se definido, sobrescreve o provedor padrão do sistema
   */
  preferredESignatureProvider ESignatureProvider? @map("preferred_e_signature_provider")

  /**
   * Observações sobre a preferência
   * Ex: "Cliente possui contrato com ClickSign até 2026"
   */
  eSignatureNotes String? @map("e_signature_notes") @db.Text

  /**
   * Data de cadastro da preferência
   */
  eSignaturePreferenceSetAt DateTime? @map("e_signature_preference_set_at")

  // ... relações existentes

  @@map("companies")
}
```

```sql
-- Migration SQL
ALTER TABLE companies
  ADD COLUMN preferred_e_signature_provider TEXT,
  ADD COLUMN e_signature_notes TEXT,
  ADD COLUMN e_signature_preference_set_at TIMESTAMP;

COMMENT ON COLUMN companies.preferred_e_signature_provider IS
  'Provedor de assinatura eletrônica preferido por esta empresa';
```

#### 2. Lógica de Seleção (Prioridades)

```typescript
// backend/src/modules/contract/contract.service.ts

async sendForSignature(id: string, dto?: SendContractDto): Promise<Contract> {
  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      signatures: true,
      company: true, // INCLUIR COMPANY
    },
  });

  // ====================================================================
  // PRIORIDADE DE SELEÇÃO:
  // 1. Override manual (dto.overrideProvider)
  // 2. Preferência da empresa (company.preferredESignatureProvider)
  // 3. Provedor padrão do sistema
  // ====================================================================

  let providerType: ESignatureProviderEnum | null = null;

  if (dto?.overrideProvider) {
    // PRIORIDADE 1: Override Manual
    providerType = dto.overrideProvider;
    console.log(`[E-Signature] Override manual: ${providerType}`);

  } else if (contract.company.preferredESignatureProvider) {
    // PRIORIDADE 2: Preferência da Empresa
    providerType = contract.company.preferredESignatureProvider;
    console.log(`[E-Signature] Usando preferência da empresa: ${providerType}`);

    if (contract.company.eSignatureNotes) {
      console.log(`[E-Signature] Nota: ${contract.company.eSignatureNotes}`);
    }

  } else {
    // PRIORIDADE 3: Provedor Padrão
    const config = await this.eSignatureConfigService.getActiveConfig();
    providerType = config?.provider || null;
    console.log(`[E-Signature] Usando provedor padrão: ${providerType}`);
  }

  // ... resto da lógica de envio
}
```

#### 3. API para Gerenciar Preferências

```typescript
// backend/src/modules/company/company.controller.ts

/**
 * PUT /api/companies/:id/e-signature-preference
 * Define preferência de provedor de assinatura eletrônica
 */
async setESignaturePreference(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { provider, notes } = req.body;

    // Validação
    const validProviders = ['none', 'd4sign', 'clicksign', 'docusign'];
    if (provider && !validProviders.includes(provider)) {
      return res.status(400).json({
        error: `Provider inválido. Opções: ${validProviders.join(', ')}`
      });
    }

    const company = await prisma.company.update({
      where: { id },
      data: {
        preferredESignatureProvider: provider || null,
        eSignatureNotes: notes || null,
        eSignaturePreferenceSetAt: provider ? new Date() : null,
      },
    });

    // Registra em auditoria
    await prisma.auditTrail.create({
      data: {
        entity: 'company',
        entityId: id,
        action: 'update',
        userId: req.user!.id,
        changes: {
          field: 'preferredESignatureProvider',
          before: null,
          after: provider,
        },
      },
    });

    res.json({
      message: 'Preferência de assinatura atualizada com sucesso',
      company: {
        id: company.id,
        razaoSocial: company.razaoSocial,
        preferredESignatureProvider: company.preferredESignatureProvider,
        eSignatureNotes: company.eSignatureNotes,
      },
    });
  } catch (error: any) {
    console.error('Erro ao atualizar preferência:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * GET /api/companies/:id/e-signature-preference
 * Consulta preferência de assinatura eletrônica
 */
async getESignaturePreference(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const company = await prisma.company.findUnique({
      where: { id },
      select: {
        id: true,
        razaoSocial: true,
        preferredESignatureProvider: true,
        eSignatureNotes: true,
        eSignaturePreferenceSetAt: true,
      },
    });

    if (!company) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    // Busca provedor padrão do sistema para comparação
    const defaultConfig = await eSignatureConfigService.getActiveConfig();

    res.json({
      company: {
        id: company.id,
        name: company.razaoSocial,
        preferredProvider: company.preferredESignatureProvider,
        notes: company.eSignatureNotes,
        setAt: company.eSignaturePreferenceSetAt,
      },
      systemDefault: defaultConfig?.provider || 'none',
      effectiveProvider: company.preferredESignatureProvider || defaultConfig?.provider || 'none',
    });
  } catch (error: any) {
    console.error('Erro ao buscar preferência:', error);
    res.status(500).json({ error: error.message });
  }
}
```

#### 4. Frontend - UI de Preferências

```tsx
// frontend/src/pages/admin/CompanyESignatureSettings.tsx

interface CompanyESignatureSettingsProps {
  companyId: string;
}

function CompanyESignatureSettings({ companyId }: CompanyESignatureSettingsProps) {
  const [preference, setPreference] = useState<any>(null);
  const [provider, setProvider] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPreference();
  }, [companyId]);

  const loadPreference = async () => {
    const data = await companyService.getESignaturePreference(companyId);
    setPreference(data);
    setProvider(data.company.preferredProvider || '');
    setNotes(data.company.notes || '');
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await companyService.setESignaturePreference(companyId, {
        provider: provider || null,
        notes,
      });
      toast.success('Preferência salva com sucesso');
      loadPreference();
    } catch (error) {
      toast.error('Erro ao salvar preferência');
    } finally {
      setLoading(false);
    }
  };

  if (!preference) return <div>Carregando...</div>;

  return (
    <Card>
      <CardHeader>
        <h2>Preferências de Assinatura Eletrônica</h2>
        <p className="text-sm text-gray-500">
          {preference.company.name}
        </p>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Provedor Padrão do Sistema: <strong>{preference.systemDefault}</strong>
              <br />
              Provedor Efetivo para esta Empresa: <strong>{preference.effectiveProvider}</strong>
            </AlertDescription>
          </Alert>

          <div>
            <Label>Provedor Preferido</Label>
            <Select value={provider} onValueChange={setProvider}>
              <option value="">Usar padrão do sistema</option>
              <option value="d4sign">D4Sign</option>
              <option value="clicksign">ClickSign</option>
              <option value="docusign">DocuSign</option>
              <option value="none">Sem assinatura eletrônica</option>
            </Select>
            <p className="text-sm text-gray-500 mt-1">
              Se não definido, usa o provedor padrão do sistema
            </p>
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Cliente possui contrato com ClickSign até 2026"
              rows={3}
            />
          </div>

          {preference.company.setAt && (
            <p className="text-sm text-gray-500">
              Última atualização: {new Date(preference.company.setAt).toLocaleString()}
            </p>
          )}

          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Preferência'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## Abordagem 3: Múltiplas Configurações Ativas

### Descrição
Sistema avançado com múltiplos provedores ativos simultaneamente, regras de priorização e fallback automático.

### Quando Usar
- Múltiplas filiais com provedores diferentes
- Sistema de fallback (se D4Sign falhar, usar ClickSign)
- Roteamento geográfico (Brasil → D4Sign, Internacional → DocuSign)

### Por Que NÃO Recomendamos Agora
- ❌ Over-engineering para necessidade atual
- ❌ Dificulta troubleshooting
- ❌ Aumenta complexidade de auditoria
- ❌ Requer lógica de retry e fallback complexa

### Se Implementar no Futuro

```prisma
model ESignatureConfig {
  // ... campos existentes

  priority  Int     @default(0) // Maior = maior prioridade
  isDefault Boolean @default(false) @map("is_default")
  scope     String? // "global", "BR", "international", etc
}
```

---

## Recomendação de Implementação

### Fase 1 (Imediato) - Abordagem 1
**Tempo estimado:** 2-3 horas

1. ✅ Implementar `SendContractDto` com overrides
2. ✅ Modificar `sendForSignature` para aceitar overrides
3. ✅ Tornar `instantiateProvider` público
4. ✅ Criar UI simples para seleção de provedor
5. ✅ Documentar processo operacional

**Resultado:** Sistema funcional para casos excepcionais

### Fase 2 (Se necessário) - Abordagem 2
**Gatilho:** 10+ empresas com preferências específicas
**Tempo estimado:** 1 dia

1. ✅ Migration de schema
2. ✅ API de preferências
3. ✅ UI de gerenciamento
4. ✅ Lógica de priorização
5. ✅ Testes de integração

**Resultado:** Sistema automatizado e escalável

### Fase 3 (Futuro distante) - Abordagem 3
**Gatilho:** Operação multi-regional com 100+ empresas
**Tempo estimado:** 1 semana

**Resultado:** Sistema enterprise com alta disponibilidade

---

## Checklist de Implementação (Abordagem 1)

### Backend
- [ ] Criar/atualizar `SendContractDto` em `contract.types.ts`
- [ ] Modificar `sendForSignature` em `contract.service.ts`
- [ ] Tornar `instantiateProvider` público em `e-signature-config.service.ts`
- [ ] Adicionar validações de provider no controller
- [ ] Adicionar logs de auditoria para overrides
- [ ] Criar testes unitários

### Frontend
- [ ] Atualizar `contract.service.ts` com novo DTO
- [ ] Criar componente `SendContractModal` com opção de override
- [ ] Adicionar validações no formulário
- [ ] Exibir warning ao usar override
- [ ] Mostrar histórico de provider usado em cada contrato

### Documentação
- [ ] Atualizar README com exemplos de uso
- [ ] Criar processo operacional para overrides
- [ ] Documentar cenários de uso comuns
- [ ] Adicionar troubleshooting guide

### Testes
- [ ] Teste: envio normal (provedor padrão)
- [ ] Teste: override com credenciais existentes
- [ ] Teste: override com credenciais novas
- [ ] Teste: override para 'none' (sem assinatura)
- [ ] Teste: validação de provider inválido
- [ ] Teste: auditoria de overrides

---

## Perguntas Frequentes

### 1. Posso usar credenciais diferentes para o mesmo provedor?
**Sim.** Via `overrideCredentials` você pode fornecer credenciais específicas para aquele envio.

### 2. O override é permanente?
**Não.** Abordagem 1 é por envio. Abordagem 2 persiste a preferência da empresa.

### 3. Como auditar quem usou overrides?
Registrar em `AuditTrail` toda vez que `overrideProvider` for usado.

### 4. E se o provedor override falhar?
Retorna erro. Não há fallback automático na Abordagem 1 (simplicidade).

### 5. Posso ter múltiplos provedores ao mesmo tempo?
Não na Abordagem 1. Use Abordagem 3 para isso (não recomendado agora).

---

## Referências

### Arquivos Relacionados
- [contract.service.ts:524-605](../../backend/src/modules/contract/contract.service.ts#L524-L605) - Método `sendForSignature`
- [e-signature-config.service.ts:136-144](../../backend/src/services/e-signature/e-signature-config.service.ts#L136-L144) - Método `getActiveProvider`
- [schema.prisma:522-570](../../backend/prisma/schema.prisma#L522-L570) - Model Contract
- [schema.prisma:1130-1163](../../backend/prisma/schema.prisma#L1130-L1163) - Model ESignatureConfig

### Documentação Externa
- [D4Sign API](https://docapi.d4sign.com.br/)
- [ClickSign API](https://developers.clicksign.com/)
- [DocuSign API](https://developers.docusign.com/)

---

**Última Atualização:** 2025-12-17
**Autor:** Claude Code
**Status:** Aguardando Aprovação para Implementação
