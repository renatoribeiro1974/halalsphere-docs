# Resolução de Erros de Injeção de Dependência - NestJS

## Erro Atual: ComercialController - PricingTableService

**Data**: 2026-01-19
**Status**: 🔴 Backend não inicializa

### Erro Completo

```
UnknownDependenciesException: Nest can't resolve dependencies of the ComercialController
(ComercialService, ?). Please make sure that the argument PricingTableService at index [1]
is available in the ComercialModule context.
```

### Análise do Problema

O `ComercialController` está injetando dois serviços:
1. ✅ `ComercialService` - OK
2. ❌ `PricingTableService` - NÃO DISPONÍVEL no contexto do ComercialModule

### Soluções Possíveis

#### Solução 1: Adicionar PricingTableService ao ComercialModule

Se `PricingTableService` está no mesmo módulo:

```typescript
// comercial.module.ts
@Module({
  controllers: [ComercialController],
  providers: [
    ComercialService,
    PricingTableService  // ← Adicionar aqui
  ]
})
export class ComercialModule {}
```

#### Solução 2: Importar o Módulo que Contém PricingTableService

Se `PricingTableService` está em outro módulo (ex: PricingModule):

```typescript
// comercial.module.ts
import { PricingModule } from '../pricing/pricing.module';

@Module({
  imports: [PricingModule],  // ← Importar o módulo que contém o serviço
  controllers: [ComercialController],
  providers: [ComercialService]
})
export class ComercialModule {}
```

**IMPORTANTE**: O `PricingModule` precisa exportar o `PricingTableService`:

```typescript
// pricing.module.ts
@Module({
  providers: [PricingTableService],
  exports: [PricingTableService]  // ← Exportar o serviço
})
export class PricingModule {}
```

#### Solução 3: Remover a Dependência (Se não for necessária)

Se o `PricingTableService` não é realmente usado no controller:

```typescript
// comercial.controller.ts
@Controller('comercial')
export class ComercialController {
  constructor(
    private readonly comercialService: ComercialService,
    // private readonly pricingTableService: PricingTableService  // ← Remover
  ) {}
}
```

### Passos para Resolver

1. **Ir para o repositório backend-nest**:
   ```bash
   cd c:\Projetos\halalsphere-backend-nest
   ```

2. **Verificar o ComercialController**:
   ```bash
   # Encontrar o arquivo
   find src -name "comercial.controller.ts"
   ```

3. **Verificar se PricingTableService existe**:
   ```bash
   find src -name "*pricing*.ts" | grep -v node_modules
   ```

4. **Aplicar uma das soluções acima**

5. **Testar**:
   ```bash
   npm run start:dev
   ```

### Checklist de Diagnóstico

- [ ] Verificar se `PricingTableService` existe no projeto
- [ ] Verificar onde `PricingTableService` está definido (qual módulo)
- [ ] Verificar se há um `PricingModule` ou similar
- [ ] Verificar se o serviço está sendo exportado do módulo de origem
- [ ] Verificar se o `ComercialModule` está importando o módulo correto
- [ ] Verificar se o serviço está listado nos `providers` do módulo correto

### Próximos Passos

Para eu poder corrigir diretamente, preciso:

1. Acesso ao código do repositório `halalsphere-backend-nest`
2. Ou você pode navegar até:
   - `src/modules/comercial/comercial.controller.ts`
   - `src/modules/comercial/comercial.module.ts`
   - Procurar por arquivos relacionados a `pricing-table` ou `pricing`

### Links Úteis

- [NestJS Dependency Injection](https://docs.nestjs.com/fundamentals/custom-providers)
- [NestJS Module Reference](https://docs.nestjs.com/modules)
- [Common Errors - NestJS](https://docs.nestjs.com/faq/common-errors)

---

## Pattern: Resolvendo Dependências entre Módulos

### Regra Geral

Para um serviço de um módulo A ser usado em um módulo B:

1. **Módulo A** deve:
   - Ter o serviço nos `providers`
   - **Exportar** o serviço via `exports`

2. **Módulo B** deve:
   - **Importar** o Módulo A via `imports`

### Exemplo Completo

```typescript
// pricing/pricing.module.ts
@Module({
  providers: [PricingTableService],
  exports: [PricingTableService]  // Exporta para outros módulos
})
export class PricingModule {}

// comercial/comercial.module.ts
@Module({
  imports: [PricingModule],  // Importa o módulo que tem o serviço
  controllers: [ComercialController],
  providers: [ComercialService]
})
export class ComercialModule {}

// comercial/comercial.controller.ts
@Controller('comercial')
export class ComercialController {
  constructor(
    private readonly comercialService: ComercialService,
    private readonly pricingTableService: PricingTableService  // Agora disponível!
  ) {}
}
```