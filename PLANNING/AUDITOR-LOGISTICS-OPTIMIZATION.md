# Sistema de Otimização Logística de Auditores

## 📍 Objetivo

Otimizar a alocação de auditores considerando:
1. **Competências** (qualificações técnicas)
2. **Localização atual** (cidade/estado onde está auditando)
3. **Proximidade geográfica** (distância até próxima auditoria)
4. **Agenda futura** (próximas auditorias agendadas)
5. **Rotas otimizadas** (sequenciamento de auditorias)

**Benefícios:**
- Redução de custos de deslocamento (passagens, hospedagem)
- Menos tempo de viagem para auditores
- Melhor aproveitamento do tempo (auditar empresas próximas em sequência)
- Sustentabilidade (menor pegada de carbono)

---

## 🗄️ PARTE 1: Extensão do Modelo de Dados

### 1.1. Adicionar Localização ao Model `User` (Auditor)

```prisma
model User {
  // ... campos existentes ...

  // Localização Base do Auditor
  baseCity       String?  @map("base_city") @db.VarChar(100)
  baseState      String?  @map("base_state") @db.VarChar(2)  // UF: SP, RJ, etc.
  baseCountry    Country? @default(BR) @map("base_country")
  baseLatitude   Float?   @map("base_latitude") @db.DoublePrecision
  baseLongitude  Float?   @map("base_longitude") @db.DoublePrecision

  // Preferências de Deslocamento
  maxTravelDistance  Int?  @default(1000) @map("max_travel_distance") // km
  acceptsInternational Boolean @default(false) @map("accepts_international")
}
```

### 1.2. Adicionar Localização ao Model `Company`

```prisma
model Company {
  // ... campos existentes ...

  // Coordenadas Geográficas
  latitude   Float? @db.DoublePrecision
  longitude  Float? @db.DoublePrecision

  @@index([latitude, longitude])
}
```

### 1.3. Novo Model: `AuditorLocation` (Localização Atual)

Rastreia onde o auditor está em tempo real ou onde estará nas próximas semanas.

```prisma
enum LocationType {
  current_audit    // Auditando agora
  scheduled_audit  // Auditoria futura agendada
  travel          // Em trânsito
  base            // Na cidade base
}

model AuditorLocation {
  id         String       @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  userId     String       @map("user_id") @db.Uuid
  processId  String?      @map("process_id") @db.Uuid

  // Tipo de Localização
  type       LocationType

  // Localização
  city       String       @db.VarChar(100)
  state      String       @db.VarChar(2)
  country    Country      @default(BR)
  latitude   Float?       @db.DoublePrecision
  longitude  Float?       @db.DoublePrecision

  // Período
  startDate  DateTime     @map("start_date")
  endDate    DateTime     @map("end_date")

  // Status
  active     Boolean      @default(true)

  createdAt  DateTime     @default(now()) @map("created_at")
  updatedAt  DateTime     @updatedAt @map("updated_at")

  // Relações
  user    User     @relation("AuditorLocations", fields: [userId], references: [id], onDelete: Cascade)
  process Process? @relation("ProcessAuditorLocation", fields: [processId], references: [id])

  @@index([userId])
  @@index([processId])
  @@index([startDate, endDate])
  @@index([active])
  @@index([latitude, longitude])
  @@map("auditor_locations")
}
```

### 1.4. Atualizar Model `Process`

```prisma
model Process {
  // ... campos existentes ...

  // Relação com localização do auditor
  auditorLocations AuditorLocation[] @relation("ProcessAuditorLocation")

  // Data estimada de auditoria (para planejamento)
  estimatedAuditDate DateTime? @map("estimated_audit_date")
}
```

---

## 🧮 PARTE 2: Algoritmo de Otimização Logística

### 2.1. Cálculo de Distância

Usaremos a **Fórmula de Haversine** para calcular distância entre dois pontos geográficos.

```typescript
// backend/src/utils/geo-distance.util.ts

export class GeoDistanceUtil {
  /**
   * Calcula distância entre dois pontos (em km) usando Haversine
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Raio da Terra em km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Arredonda para 1 casa decimal
  }

  private static toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Calcula tempo estimado de viagem (em horas)
   * Assume velocidade média de 80 km/h (carro/ônibus)
   */
  static estimateTravelTime(distanceKm: number): number {
    const avgSpeedKmh = 80;
    return Math.round((distanceKm / avgSpeedKmh) * 10) / 10;
  }

  /**
   * Estima custo de deslocamento
   * R$ 2,00/km (aproximado: combustível + pedágio + desgaste)
   */
  static estimateTravelCost(distanceKm: number): number {
    const costPerKm = 2.0;
    return Math.round(distanceKm * costPerKm * 100) / 100;
  }
}
```

### 2.2. Serviço de Geocoding

Para converter endereços em coordenadas (lat/long).

```typescript
// backend/src/services/geocoding.service.ts

export class GeocodingService {
  /**
   * Converte endereço em coordenadas usando API externa
   * Opções: Google Maps Geocoding API, OpenStreetMap Nominatim, etc.
   */
  async geocodeAddress(address: {
    street?: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
  }): Promise<{ latitude: number; longitude: number } | null> {
    // Implementação com API de geocoding
    // Por enquanto, retorna coordenadas aproximadas por cidade

    const cityCoordinates = await this.getCityCoordinates(
      address.city,
      address.state,
      address.country
    );

    return cityCoordinates;
  }

  /**
   * Banco de coordenadas de principais cidades brasileiras
   */
  private async getCityCoordinates(
    city: string,
    state: string,
    country: string
  ): Promise<{ latitude: number; longitude: number } | null> {
    // Tabela interna de coordenadas de cidades
    const coordinates = await prisma.cityCoordinates.findFirst({
      where: {
        city: { equals: city, mode: 'insensitive' },
        state,
        country,
      },
    });

    return coordinates
      ? { latitude: coordinates.latitude, longitude: coordinates.longitude }
      : null;
  }
}
```

### 2.3. Serviço de Otimização Logística

```typescript
// backend/src/modules/auditor-allocation/auditor-logistics.service.ts

export interface LogisticsScore {
  auditorId: string;

  // Scores Individuais (0-100)
  qualificationScore: number;  // Competência técnica
  experienceScore: number;     // Experiência na categoria
  availabilityScore: number;   // Carga de trabalho
  proximityScore: number;      // Proximidade geográfica
  routeOptimizationScore: number; // Otimização de rota

  // Score Final Ponderado
  totalScore: number;

  // Dados Logísticos
  currentLocation: {
    city: string;
    state: string;
    country: string;
  } | null;
  distanceKm: number;
  travelTimeHours: number;
  estimatedCost: number;

  // Próximas Auditorias
  upcomingAudits: {
    processId: string;
    companyName: string;
    city: string;
    state: string;
    date: Date;
    distanceFromCurrent: number;
  }[];

  // Rota Otimizada (se aplicável)
  suggestedRoute?: {
    sequence: string[]; // IDs dos processos em ordem
    totalDistance: number;
    totalTime: number;
    totalCost: number;
  };
}

export class AuditorLogisticsService {

  /**
   * Sugere auditores considerando competências + logística
   */
  async suggestAuditorsWithLogistics(
    processId: string,
    options?: {
      weights?: {
        qualification?: number;
        experience?: number;
        availability?: number;
        proximity?: number;
        routeOptimization?: number;
      };
      maxDistance?: number;
      considerRouteOptimization?: boolean;
    }
  ): Promise<LogisticsScore[]> {
    const {
      weights = {
        qualification: 0.30,  // 30%
        experience: 0.20,     // 20%
        availability: 0.20,   // 20%
        proximity: 0.20,      // 20%
        routeOptimization: 0.10, // 10%
      },
      maxDistance = 1000, // km
      considerRouteOptimization = true,
    } = options || {};

    // 1. Buscar dados do processo
    const process = await prisma.process.findUnique({
      where: { id: processId },
      include: {
        request: {
          include: {
            company: {
              include: {
                address: true,
              },
            },
            industrialCategory: true,
          },
        },
      },
    });

    if (!process?.request?.industrialCategoryId) {
      throw new Error('Processo sem categoria industrial');
    }

    const targetCompany = process.request.company;
    const targetCoords = {
      lat: targetCompany.latitude,
      lon: targetCompany.longitude,
    };

    if (!targetCoords.lat || !targetCoords.lon) {
      throw new Error('Empresa sem coordenadas geográficas');
    }

    // 2. Buscar auditores qualificados
    const qualifiedAuditors = await prisma.auditorCategoryQualification.findMany({
      where: {
        categoryId: process.request.industrialCategoryId,
        active: true,
      },
      include: {
        user: {
          include: {
            locations: {
              where: {
                active: true,
                OR: [
                  { type: 'current_audit' },
                  { type: 'scheduled_audit' },
                ],
              },
              orderBy: { startDate: 'asc' },
            },
          },
        },
      },
    });

    // 3. Calcular scores para cada auditor
    const scores: LogisticsScore[] = [];

    for (const qualification of qualifiedAuditors) {
      const auditor = qualification.user;

      // 3a. Score de Qualificação (já temos do sistema anterior)
      const qualificationScore = await this.calculateQualificationScore(
        auditor.id,
        process.request.industrialCategoryId
      );

      // 3b. Score de Experiência
      const experienceScore = await this.calculateExperienceScore(
        auditor.id,
        process.request.industrialCategoryId
      );

      // 3c. Score de Disponibilidade
      const availabilityScore = await this.calculateAvailabilityScore(
        auditor.id
      );

      // 3d. Score de Proximidade
      const proximityData = await this.calculateProximityScore(
        auditor,
        targetCoords,
        maxDistance
      );

      // Se auditor está muito longe, pode ser descartado
      if (proximityData.distanceKm > maxDistance) {
        continue;
      }

      // 3e. Score de Otimização de Rota (se houver auditorias futuras)
      const routeOptimization = considerRouteOptimization
        ? await this.calculateRouteOptimizationScore(
            auditor,
            process,
            targetCoords
          )
        : { score: 50, suggestedRoute: null };

      // 4. Calcular score total ponderado
      const totalScore =
        qualificationScore * weights.qualification! +
        experienceScore * weights.experience! +
        availabilityScore * weights.availability! +
        proximityData.score * weights.proximity! +
        routeOptimization.score * weights.routeOptimization!;

      // 5. Buscar próximas auditorias do auditor
      const upcomingAudits = await this.getUpcomingAudits(auditor.id);

      scores.push({
        auditorId: auditor.id,
        qualificationScore,
        experienceScore,
        availabilityScore,
        proximityScore: proximityData.score,
        routeOptimizationScore: routeOptimization.score,
        totalScore: Math.round(totalScore),
        currentLocation: proximityData.currentLocation,
        distanceKm: proximityData.distanceKm,
        travelTimeHours: proximityData.travelTimeHours,
        estimatedCost: proximityData.estimatedCost,
        upcomingAudits,
        suggestedRoute: routeOptimization.suggestedRoute,
      });
    }

    // 6. Ordenar por score total (maior primeiro)
    scores.sort((a, b) => b.totalScore - a.totalScore);

    return scores;
  }

  /**
   * Calcula score de proximidade baseado na distância
   */
  private async calculateProximityScore(
    auditor: any,
    targetCoords: { lat: number; lon: number },
    maxDistance: number
  ) {
    // Determinar localização atual do auditor
    let currentLocation: { lat: number; lon: number; city: string; state: string; country: string } | null = null;

    // 1. Verificar se está em auditoria agora
    const currentAudit = auditor.locations?.find(
      (loc: any) =>
        loc.type === 'current_audit' &&
        new Date(loc.startDate) <= new Date() &&
        new Date(loc.endDate) >= new Date()
    );

    if (currentAudit) {
      currentLocation = {
        lat: currentAudit.latitude,
        lon: currentAudit.longitude,
        city: currentAudit.city,
        state: currentAudit.state,
        country: currentAudit.country,
      };
    }

    // 2. Se não, usar localização base
    if (!currentLocation && auditor.baseLatitude && auditor.baseLongitude) {
      currentLocation = {
        lat: auditor.baseLatitude,
        lon: auditor.baseLongitude,
        city: auditor.baseCity,
        state: auditor.baseState,
        country: auditor.baseCountry,
      };
    }

    // 3. Se não tem nenhuma localização, retorna score baixo
    if (!currentLocation) {
      return {
        score: 0,
        currentLocation: null,
        distanceKm: 9999,
        travelTimeHours: 0,
        estimatedCost: 0,
      };
    }

    // 4. Calcular distância
    const distanceKm = GeoDistanceUtil.calculateDistance(
      currentLocation.lat,
      currentLocation.lon,
      targetCoords.lat,
      targetCoords.lon
    );

    // 5. Calcular score (inversamente proporcional à distância)
    // Score = 100 quando distância = 0
    // Score = 0 quando distância >= maxDistance
    const score = Math.max(0, 100 - (distanceKm / maxDistance) * 100);

    // 6. Calcular tempo e custo
    const travelTimeHours = GeoDistanceUtil.estimateTravelTime(distanceKm);
    const estimatedCost = GeoDistanceUtil.estimateTravelCost(distanceKm);

    return {
      score: Math.round(score),
      currentLocation: {
        city: currentLocation.city,
        state: currentLocation.state,
        country: currentLocation.country,
      },
      distanceKm,
      travelTimeHours,
      estimatedCost,
    };
  }

  /**
   * Calcula score de otimização de rota
   * Se o auditor já tem auditorias futuras próximas, score aumenta
   */
  private async calculateRouteOptimizationScore(
    auditor: any,
    newProcess: any,
    targetCoords: { lat: number; lon: number }
  ) {
    // Buscar auditorias futuras agendadas do auditor
    const futureLocations = auditor.locations?.filter(
      (loc: any) =>
        loc.type === 'scheduled_audit' && new Date(loc.startDate) > new Date()
    );

    if (!futureLocations || futureLocations.length === 0) {
      // Sem auditorias futuras, score neutro
      return { score: 50, suggestedRoute: null };
    }

    // Calcular distâncias entre nova auditoria e auditorias futuras
    let minDistanceToFuture = Infinity;
    let closestFuture = null;

    for (const future of futureLocations) {
      if (!future.latitude || !future.longitude) continue;

      const distance = GeoDistanceUtil.calculateDistance(
        targetCoords.lat,
        targetCoords.lon,
        future.latitude,
        future.longitude
      );

      if (distance < minDistanceToFuture) {
        minDistanceToFuture = distance;
        closestFuture = future;
      }
    }

    // Se a nova auditoria está perto de uma futura (< 200km), score alto
    if (minDistanceToFuture < 200) {
      // Score: 100 se < 50km, 80 se < 100km, 60 se < 200km
      const score = Math.max(60, 100 - (minDistanceToFuture / 200) * 40);

      // Sugerir rota otimizada
      const suggestedRoute = await this.buildOptimizedRoute(
        auditor,
        newProcess,
        futureLocations
      );

      return {
        score: Math.round(score),
        suggestedRoute,
      };
    }

    // Nova auditoria não está perto de nenhuma futura, score baixo
    return { score: 30, suggestedRoute: null };
  }

  /**
   * Constrói rota otimizada usando algoritmo de vizinho mais próximo
   */
  private async buildOptimizedRoute(
    auditor: any,
    newProcess: any,
    futureLocations: any[]
  ) {
    // Algoritmo simples de Vizinho Mais Próximo (TSP simplificado)
    // TODO: Implementar algoritmo mais sofisticado (ex: 2-opt, Genetic Algorithm)

    const locations = [
      {
        processId: newProcess.id,
        companyName: newProcess.request.company.nomeFantasia,
        city: newProcess.request.company.address.cidade,
        state: newProcess.request.company.address.uf,
        latitude: newProcess.request.company.latitude,
        longitude: newProcess.request.company.longitude,
      },
      ...futureLocations.map((loc: any) => ({
        processId: loc.processId,
        companyName: loc.company?.nomeFantasia || 'N/A',
        city: loc.city,
        state: loc.state,
        latitude: loc.latitude,
        longitude: loc.longitude,
      })),
    ];

    // Ordenar por proximidade (vizinho mais próximo)
    const route = [];
    let current = auditor.currentLocation || locations[0];
    const remaining = [...locations];

    while (remaining.length > 0) {
      // Encontrar localização mais próxima
      let minDistance = Infinity;
      let nearestIndex = 0;

      for (let i = 0; i < remaining.length; i++) {
        const distance = GeoDistanceUtil.calculateDistance(
          current.latitude,
          current.longitude,
          remaining[i].latitude,
          remaining[i].longitude
        );

        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = i;
        }
      }

      const nearest = remaining.splice(nearestIndex, 1)[0];
      route.push(nearest.processId);
      current = nearest;
    }

    // Calcular distância e custo total da rota
    let totalDistance = 0;
    for (let i = 0; i < route.length - 1; i++) {
      const from = locations.find((loc) => loc.processId === route[i]);
      const to = locations.find((loc) => loc.processId === route[i + 1]);

      if (from && to) {
        totalDistance += GeoDistanceUtil.calculateDistance(
          from.latitude,
          from.longitude,
          to.latitude,
          to.longitude
        );
      }
    }

    return {
      sequence: route,
      totalDistance: Math.round(totalDistance),
      totalTime: GeoDistanceUtil.estimateTravelTime(totalDistance),
      totalCost: GeoDistanceUtil.estimateTravelCost(totalDistance),
    };
  }

  /**
   * Busca próximas auditorias do auditor
   */
  private async getUpcomingAudits(auditorId: string) {
    const futureProcesses = await prisma.process.findMany({
      where: {
        auditorId,
        status: { in: ['aguardando_auditoria', 'em_auditoria'] },
        estimatedAuditDate: { gte: new Date() },
      },
      include: {
        request: {
          include: {
            company: {
              include: {
                address: true,
              },
            },
          },
        },
      },
      orderBy: { estimatedAuditDate: 'asc' },
      take: 5,
    });

    return futureProcesses.map((proc) => ({
      processId: proc.id,
      companyName: proc.request.company.nomeFantasia,
      city: proc.request.company.address.cidade,
      state: proc.request.company.address.uf,
      date: proc.estimatedAuditDate!,
      distanceFromCurrent: 0, // TODO: calcular
    }));
  }

  // ... outros métodos de cálculo de score ...
}
```

---

## 🌐 PARTE 3: APIs Estendidas

### 3.1. Endpoints de Localização

```typescript
// POST /api/auditor/location
// Auditor atualiza sua localização atual
{
  type: 'current_audit',
  city: 'São Paulo',
  state: 'SP',
  country: 'BR',
  startDate: '2026-01-20T08:00:00Z',
  endDate: '2026-01-22T17:00:00Z',
  processId?: 'uuid' // Se for auditoria
}

// GET /api/auditor/location/current
// Buscar localização atual do auditor autenticado

// GET /api/auditor/location/upcoming
// Buscar próximas localizações (auditorias agendadas)

// PATCH /api/auditor/location/:id
// Atualizar localização

// DELETE /api/auditor/location/:id
// Remover localização
```

### 3.2. Endpoints de Sugestão com Logística

```typescript
// POST /api/process/:id/suggest-auditors-logistics
// Sugerir auditores considerando logística
Body: {
  weights?: {
    qualification?: number,
    experience?: number,
    availability?: number,
    proximity?: number,
    routeOptimization?: number
  },
  maxDistance?: number,
  considerRouteOptimization?: boolean
}

Response: {
  auditors: [
    {
      auditorId: 'uuid',
      auditorName: 'João Silva',

      // Scores
      qualificationScore: 90,
      experienceScore: 75,
      availabilityScore: 80,
      proximityScore: 85,
      routeOptimizationScore: 70,
      totalScore: 82,

      // Logística
      currentLocation: {
        city: 'Curitiba',
        state: 'PR',
        country: 'BR'
      },
      distanceKm: 120,
      travelTimeHours: 1.5,
      estimatedCost: 240.00,

      // Próximas Auditorias
      upcomingAudits: [
        {
          processId: 'uuid',
          companyName: 'Empresa XYZ',
          city: 'Joinville',
          state: 'SC',
          date: '2026-01-25',
          distanceFromCurrent: 80
        }
      ],

      // Rota Sugerida
      suggestedRoute: {
        sequence: ['proc1', 'proc2', 'proc3'],
        totalDistance: 350,
        totalTime: 4.4,
        totalCost: 700.00
      }
    }
  ],
  targetCompany: {
    name: 'Empresa ABC',
    city: 'Blumenau',
    state: 'SC',
    latitude: -26.9166,
    longitude: -49.0713
  }
}

// GET /api/auditor/:id/route-optimization
// Ver rota otimizada de um auditor
Response: {
  currentLocation: { city, state, country },
  upcomingAudits: [
    { date, company, city, state, distance }
  ],
  optimizedRoute: {
    sequence: [...],
    totalDistance: 500,
    totalTime: 6.25,
    totalCost: 1000.00,
    savingsVsNonOptimized: {
      distanceSaved: 150,
      timeSaved: 1.9,
      costSaved: 300.00
    }
  }
}
```

### 3.3. Endpoints de Geocoding

```typescript
// POST /api/company/:id/geocode
// Geocodificar endereço da empresa (admin)

// POST /api/auditor/geocode-base
// Geocodificar endereço base do auditor
```

---

## 🎨 PARTE 4: Interfaces Estendidas

### 4.1. Painel de Localização do Auditor

**Rota:** `/auditor/location`

**Componentes:**
- Mapa interativo mostrando:
  - 📍 Localização atual
  - 🎯 Próximas auditorias
  - 🛣️ Rota sugerida
- Timeline de localizações futuras
- Formulário "Onde estou agora?"
- Estatísticas:
  - Km percorridos este mês
  - Custo de deslocamento
  - Tempo em viagem

### 4.2. Modal de Sugestão com Mapa (Gestor)

**Componentes:**
- **Mapa Visual:**
  - 🎯 Pin da empresa alvo
  - 👤 Pins dos auditores qualificados
  - 📏 Linhas mostrando distâncias
  - 🛣️ Rotas otimizadas

- **Lista de Auditores:**
  - Card expandido com mapa individual
  - Gráfico de radar dos scores
  - Badge de distância: "120 km" com ícone
  - Custo estimado: "R$ 240,00"
  - Tempo de viagem: "1.5h"
  - Próximas auditorias com mapa de rota

- **Filtros:**
  - Distância máxima (slider: 0-1000 km)
  - Priorizar proximidade (toggle)
  - Considerar rota otimizada (toggle)
  - Pesos dos scores (sliders avançados)

### 4.3. Dashboard de Otimização de Rotas (Admin)

**Rota:** `/admin/auditors/logistics`

**Componentes:**
- **Mapa Geral:**
  - Todos os auditores em atividade
  - Todas as empresas aguardando auditoria
  - Clusters por região

- **Sugestões de Otimização:**
  - Cards de oportunidades:
    - "3 processos em SP podem ser auditados em sequência"
    - "Auditor João está em Curitiba, 2 empresas próximas aguardam"

- **Estatísticas:**
  - Economia potencial (km, R$, CO2)
  - Taxa de otimização atual
  - Km médio por auditoria

- **Simulador de Rotas:**
  - Selecionar múltiplos processos
  - Sistema sugere melhor auditor e sequência
  - Visualizar rota no mapa

---

## 📊 PARTE 5: Métricas de Otimização Logística

### 5.1. KPIs de Logística

```typescript
interface LogisticsKPIs {
  // Distância
  avgDistancePerAudit: number;      // km médio por auditoria
  totalDistanceThisMonth: number;   // km total no mês

  // Custo
  avgCostPerAudit: number;          // R$ médio por auditoria
  totalCostThisMonth: number;       // R$ total no mês
  potentialSavings: number;         // R$ que poderia ser economizado com otimização

  // Tempo
  avgTravelTimePerAudit: number;    // horas médias de viagem
  totalTravelTimeThisMonth: number; // horas totais

  // Otimização
  routeOptimizationRate: number;    // % de auditorias em rotas otimizadas
  avgAuditsPerTrip: number;         // média de auditorias por viagem

  // Sustentabilidade
  co2EmissionsKg: number;           // kg de CO2 emitido
  co2SavedByOptimization: number;   // kg de CO2 economizado
}
```

### 5.2. Relatórios

**Relatório Mensal de Logística:**
- Resumo de viagens
- Gráfico de custos
- Mapa de calor de auditorias por região
- Ranking de auditores mais eficientes
- Oportunidades de melhoria

---

## 🗺️ PARTE 6: Integração com Mapas

### 6.1. Opções de Bibliotecas

**Frontend:**
- **Leaflet** + OpenStreetMap (gratuito, open-source)
- **Mapbox GL JS** (grátis até 50k requisições/mês)
- **Google Maps JavaScript API** (pago, mais recursos)

**Recomendação:** Leaflet + OpenStreetMap (melhor custo-benefício)

```bash
npm install leaflet react-leaflet
```

### 6.2. Componente de Mapa

```tsx
// frontend/src/components/logistics/AuditorLocationMap.tsx

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface AuditorLocationMapProps {
  auditors: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    currentLocation: string;
  }[];
  targetCompany: {
    name: string;
    latitude: number;
    longitude: number;
  };
  showRoutes?: boolean;
}

export const AuditorLocationMap: React.FC<AuditorLocationMapProps> = ({
  auditors,
  targetCompany,
  showRoutes = true
}) => {
  return (
    <MapContainer
      center={[targetCompany.latitude, targetCompany.longitude]}
      zoom={7}
      style={{ height: '500px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {/* Empresa Alvo */}
      <Marker position={[targetCompany.latitude, targetCompany.longitude]}>
        <Popup>
          <strong>🎯 {targetCompany.name}</strong>
          <br />
          Empresa a auditar
        </Popup>
      </Marker>

      {/* Auditores */}
      {auditors.map((auditor) => (
        <React.Fragment key={auditor.id}>
          <Marker position={[auditor.latitude, auditor.longitude]}>
            <Popup>
              <strong>👤 {auditor.name}</strong>
              <br />
              {auditor.currentLocation}
            </Popup>
          </Marker>

          {/* Linha de conexão */}
          {showRoutes && (
            <Polyline
              positions={[
                [auditor.latitude, auditor.longitude],
                [targetCompany.latitude, targetCompany.longitude],
              ]}
              color="blue"
              weight={2}
              opacity={0.5}
            />
          )}
        </React.Fragment>
      ))}
    </MapContainer>
  );
};
```

---

## 🚀 PARTE 7: Plano de Implementação Estendido

### Sprint Extra 1: Modelo de Dados Logísticos (3 dias)

**Dia 1:**
- [ ] Adicionar campos de localização ao User
- [ ] Adicionar coordenadas ao Company
- [ ] Criar model AuditorLocation
- [ ] Migration

**Dia 2:**
- [ ] Seed de coordenadas de cidades brasileiras
- [ ] Geocoding de empresas existentes
- [ ] Testes

**Dia 3:**
- [ ] Documentação
- [ ] Revisão

---

### Sprint Extra 2: Algoritmo de Otimização (5 dias)

**Dia 1:**
- [ ] Implementar GeoDistanceUtil (Haversine)
- [ ] Implementar GeocodingService
- [ ] Testes unitários

**Dia 2-3:**
- [ ] Implementar AuditorLogisticsService
- [ ] Algoritmo de cálculo de proximidade
- [ ] Algoritmo de otimização de rota
- [ ] Testes

**Dia 4:**
- [ ] Integrar com sistema de sugestão existente
- [ ] Ajustar pesos e scores
- [ ] Testes de integração

**Dia 5:**
- [ ] Otimizações de performance
- [ ] Índices no banco
- [ ] Cache de coordenadas

---

### Sprint Extra 3: APIs e Mapas (5 dias)

**Dia 1-2:**
- [ ] Endpoints de localização do auditor
- [ ] Endpoints de sugestão com logística
- [ ] Endpoints de geocoding

**Dia 3-4:**
- [ ] Integrar Leaflet no frontend
- [ ] Componente AuditorLocationMap
- [ ] Modal de sugestão com mapa
- [ ] Testes

**Dia 5:**
- [ ] Dashboard de logística
- [ ] Métricas e KPIs
- [ ] Documentação

---

### Sprint Extra 4: Otimizações Avançadas (5 dias)

**Dia 1-2:**
- [ ] Algoritmo TSP mais sofisticado (2-opt)
- [ ] Cache de rotas calculadas
- [ ] Worker para cálculos assíncronos

**Dia 3:**
- [ ] Relatórios de logística
- [ ] Exportar relatórios PDF
- [ ] Dashboard de economia

**Dia 4:**
- [ ] Notificações de oportunidades
- [ ] Alertas de otimização
- [ ] Sugestões proativas

**Dia 5:**
- [ ] Testes E2E completos
- [ ] Ajustes finais
- [ ] Deploy

---

## 💰 PARTE 8: Análise de Custo-Benefício

### Estimativa de Economia

**Cenário Atual (Sem Otimização):**
- 100 auditorias/mês
- Distância média: 500 km
- Custo médio por auditoria: R$ 1.000,00
- **Custo total/mês:** R$ 100.000,00

**Cenário Otimizado:**
- 100 auditorias/mês
- Distância média reduzida: 350 km (-30%)
- Custo médio por auditoria: R$ 700,00
- **Custo total/mês:** R$ 70.000,00
- **Economia mensal:** R$ 30.000,00
- **Economia anual:** R$ 360.000,00

**ROI:**
- Investimento em desenvolvimento: ~40 dias de trabalho
- Retorno esperado: < 1 mês

---

## 📝 PARTE 9: Checklist de Funcionalidades

### Essenciais
- [ ] Cálculo de distância entre auditor e empresa
- [ ] Score de proximidade no algoritmo de sugestão
- [ ] Exibir distância e custo na lista de sugestões
- [ ] Auditor pode cadastrar localização atual
- [ ] Sistema considera localização ao sugerir

### Importantes
- [ ] Mapa visual de auditores e empresas
- [ ] Otimização de rota para auditorias futuras
- [ ] Dashboard de logística para admin
- [ ] Métricas de economia (km, R$, CO2)
- [ ] Relatórios mensais de logística

### Avançadas
- [ ] Algoritmo TSP avançado para rotas
- [ ] Notificações proativas de oportunidades
- [ ] Simulador de rotas no dashboard
- [ ] Integração com APIs de mapas (Google/Mapbox)
- [ ] Previsão de demanda por região
- [ ] Sugestão automática de agenda otimizada

---

## 🎯 Métricas de Sucesso Estendidas

1. **Redução de Distância:** 30% de redução na distância média por auditoria
2. **Redução de Custo:** 30% de redução no custo de deslocamento
3. **Otimização de Rota:** 60% das auditorias em rotas otimizadas
4. **Tempo de Viagem:** 25% de redução no tempo de viagem
5. **Sustentabilidade:** 30% de redução nas emissões de CO2
6. **Satisfação:** Score 4.5/5 de auditores sobre melhor planejamento

---

## 📚 Referências

- [Planejamento de Qualificações](./AUDITOR-QUALIFICATION-SYSTEM.md)
- [Fórmula de Haversine](https://en.wikipedia.org/wiki/Haversine_formula)
- [Problema do Caixeiro Viajante (TSP)](https://en.wikipedia.org/wiki/Travelling_salesman_problem)
- [Leaflet Maps](https://leafletjs.com/)
- [OpenStreetMap](https://www.openstreetmap.org/)
