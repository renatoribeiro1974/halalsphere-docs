# 10. Infraestrutura e DevOps

## 10.1 Arquitetura AWS (Recomendada)

```
┌─────────────────────────────────────────────────────────────┐
│                         Route 53 (DNS)                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    CloudFront (CDN + WAF)                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌───────────────────────────────────────────────────────────┐
│              ALB (Application Load Balancer)               │
└───────────────────────────────────────────────────────────┘
                            ↓
┌───────────────────────────────────────────────────────────┐
│                    EKS (Kubernetes)                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│  │  API Pod 1 │  │  API Pod 2 │  │  API Pod N │         │
│  └────────────┘  └────────────┘  └────────────┘         │
│  ┌────────────┐  ┌────────────┐  ┌��───────────┐         │
│  │ Worker 1   │  │ Worker 2   │  │ Worker N   │         │
│  │ (IA)       │  │ (PDF)      │  │ (Email)    │         │
│  └────────────┘  └────────────┘  └────────────┘         │
└───────────────────────────────────────────────────────────┘
             ↓                       ↓
┌──────────────────────┐  ┌────────────────────────┐
│   RDS PostgreSQL     │  │   ElastiCache Redis    │
│   (Primary + 2       │  │   (Cache + Queue)      │
│    Read Replicas)    │  │                        │
└──────────────────────┘  └────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────┐
│                    S3 (Object Storage)                   │
│  - /uploads (documentos privados)                       │
│  - /certificates (PDFs públicos)                        │
│  - /backups (dumps diários)                             │
└─────────────────────────────────────────────────────────┘
```

---

## 10.2 Docker Compose (Desenvolvimento Local)

```yaml
# docker-compose.yml
version: '3.9'

services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: halalsphere
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"  # API
      - "9001:9001"  # Console
    volumes:
      - minio_data:/data

  api:
    build: ./backend
    depends_on:
      - postgres
      - redis
      - minio
    environment:
      DATABASE_URL: postgresql://admin:secret@postgres:5432/halalsphere
      REDIS_URL: redis://redis:6379
      S3_ENDPOINT: http://minio:9000
    ports:
      - "3000:3000"
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build: ./frontend
    depends_on:
      - api
    ports:
      - "5173:5173"  # Vite dev server
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  postgres_data:
  minio_data:
```

---

## 10.3 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test

      - name: Run security scan
        run: npx snyk test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Login to ECR
        run: aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_REGISTRY

      - name: Build Docker image
        run: docker build -t halalsphere-api:${{ github.sha }} .

      - name: Push to ECR
        run: docker push halalsphere-api:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to EKS
        run: |
          kubectl set image deployment/api api=halalsphere-api:${{ github.sha }}
          kubectl rollout status deployment/api
```

---

## 10.4 Kubernetes Manifests (Exemplo)

```yaml
# k8s/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: halalsphere-api:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

---

## 10.5 Monitoramento (Grafana + Prometheus)

```yaml
# k8s/monitoring/prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
      - job_name: 'api'
        kubernetes_sd_configs:
          - role: pod
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_label_app]
            action: keep
            regex: api
```

**Dashboards Grafana**:
1. **System Metrics**: CPU, Memory, Disk, Network
2. **Application Metrics**: Request rate, Error rate, Latency (RED)
3. **Database Metrics**: Query time, Connections, Slow queries
4. **Business Metrics**: Processos/dia, Taxa de conclusão, Revenue

---

## 📊 Status do Technical Architecture Document

**✅ Documento 100% completo!**

Este documento técnico cobre:
- ✅ Stack tecnológica completa (Frontend, Backend, IA, Infra)
- ✅ Arquitetura de sistema (diagramas, fluxos)
- ✅ Database Schema (ERD completo, 19 tabelas)
- ✅ Dicionário de dados (todas as colunas documentadas)
- ✅ DDL SQL (create tables, índices, constraints)
- ✅ Índices e otimizações de performance
- ✅ Migrations strategy (Prisma)
- ✅ APIs e integrações externas
- ✅ Segurança técnica (OWASP, LGPD, RBAC)
- ✅ Infraestrutura e DevOps (AWS, K8s, CI/CD)

**Próximos passos**:
1. Setup do ambiente de desenvolvimento (Docker Compose)
2. Implementação do schema Prisma
3. Primeira migration (init_schema)
4. Testes de integração com PostgreSQL

---

**Documentos relacionados**:
- [PRD v2.0](./prd-v2.md) - Product Requirements Document
- [UX Design Guide](./ux-design-guide.md) - Especificações de UX/UI
