# Deployment Guide

This guide covers deploying the HalalSphere Backend to various environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup](#database-setup)
4. [Build Process](#build-process)
5. [AWS Deployment](#aws-deployment)
6. [Docker Deployment](#docker-deployment)
7. [Health Checks](#health-checks)
8. [Monitoring](#monitoring)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- Node.js 18+ or 20+
- npm 9+ or pnpm 8+
- PostgreSQL 14+
- AWS CLI (for AWS deployments)
- Docker & Docker Compose (for containerized deployments)

### AWS Services Required

- **ECS/Fargate** or **EC2**: Application hosting
- **RDS PostgreSQL**: Database
- **ALB**: Load balancer
- **S3**: Document storage
- **Secrets Manager**: Sensitive configuration
- **Parameter Store (SSM)**: Non-sensitive configuration
- **CloudWatch**: Logging and monitoring
- **Route 53**: DNS management (optional)
- **ACM**: SSL certificates (optional)

## Environment Configuration

### Environment Variables

Create `.env` file based on environment:

```bash
# Application
NODE_ENV=production
PORT=3333
FRONTEND_URL=https://app.halalsphere.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/halalsphere
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# JWT Authentication
JWT_SECRET=your-secret-key-min-32-chars
JWT_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----...
JWT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# AWS Configuration
AWS_REGION=us-east-1
AWS_S3_BUCKET=halalsphere-documents
AWS_S3_PRESIGNED_URL_EXPIRATION=3600

# Redis (Optional - for caching/sessions)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Feature Flags
ENABLE_SWAGGER=true
ENABLE_CORS=true
ENABLE_RATE_LIMITING=true
```

### AWS Secrets Manager

Store sensitive values in AWS Secrets Manager:

```json
{
  "DATABASE_URL": "postgresql://...",
  "JWT_SECRET": "your-secret-key",
  "JWT_PRIVATE_KEY": "-----BEGIN PRIVATE KEY-----...",
  "REDIS_PASSWORD": "redis-password"
}
```

### AWS Parameter Store (SSM)

Store non-sensitive configuration:

```bash
# Application parameters
/halalsphere/production/PORT=3333
/halalsphere/production/NODE_ENV=production
/halalsphere/production/FRONTEND_URL=https://app.halalsphere.com

# AWS parameters
/halalsphere/production/AWS_REGION=us-east-1
/halalsphere/production/AWS_S3_BUCKET=halalsphere-documents
```

## Database Setup

### 1. Create Database

```sql
CREATE DATABASE halalsphere;
CREATE USER halalsphere_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE halalsphere TO halalsphere_user;
```

### 2. Run Migrations

```bash
# Install dependencies
npm ci --only=production

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

### 3. Seed Database (Optional)

```bash
npx prisma db seed
```

### 4. Verify Database

```bash
npx prisma db pull
npx prisma validate
```

## Build Process

### 1. Install Dependencies

```bash
# Use npm ci for reproducible builds
npm ci --only=production
```

### 2. Build Application

```bash
npm run build
```

This creates optimized production build in `dist/` directory.

### 3. Verify Build

```bash
# Check output
ls -la dist/

# Test build
node dist/main.js
```

## AWS Deployment

### Option 1: ECS Fargate (Recommended)

#### 1. Create ECR Repository

```bash
aws ecr create-repository \
  --repository-name halalsphere-backend \
  --region us-east-1
```

#### 2. Build and Push Docker Image

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t halalsphere-backend:latest .

# Tag image
docker tag halalsphere-backend:latest \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com/halalsphere-backend:latest

# Push image
docker push \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com/halalsphere-backend:latest
```

#### 3. Create ECS Task Definition

```json
{
  "family": "halalsphere-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::<account>:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::<account>:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "halalsphere-backend",
      "image": "<account>.dkr.ecr.us-east-1.amazonaws.com/halalsphere-backend:latest",
      "portMappings": [
        {
          "containerPort": 3333,
          "protocol": "tcp"
        }
      ],
      "environment": [
        { "name": "NODE_ENV", "value": "production" },
        { "name": "PORT", "value": "3333" }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account>:secret:halalsphere/production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/halalsphere-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3333/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

#### 4. Create ECS Service

```bash
aws ecs create-service \
  --cluster halalsphere-cluster \
  --service-name halalsphere-backend \
  --task-definition halalsphere-backend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=DISABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=halalsphere-backend,containerPort=3333"
```

### Option 2: EC2 Instance

#### 1. Provision EC2 Instance

```bash
# Use Amazon Linux 2 or Ubuntu 22.04
# t3.medium or larger recommended
```

#### 2. Install Node.js

```bash
# Amazon Linux 2
curl -sL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Ubuntu
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 3. Deploy Application

```bash
# Clone repository or upload build
cd /opt
sudo git clone https://github.com/your-org/halalsphere-backend-nest.git
cd halalsphere-backend-nest

# Install dependencies
sudo npm ci --only=production

# Build
sudo npm run build

# Setup systemd service (see below)
```

#### 4. Create Systemd Service

Create `/etc/systemd/system/halalsphere-backend.service`:

```ini
[Unit]
Description=HalalSphere Backend API
After=network.target

[Service]
Type=simple
User=nodejs
WorkingDirectory=/opt/halalsphere-backend-nest
Environment="NODE_ENV=production"
EnvironmentFile=/opt/halalsphere-backend-nest/.env
ExecStart=/usr/bin/node dist/main.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=halalsphere-backend

[Install]
WantedBy=multi-user.target
```

Enable and start service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable halalsphere-backend
sudo systemctl start halalsphere-backend
sudo systemctl status halalsphere-backend
```

## Docker Deployment

### Dockerfile

Create `Dockerfile` in project root:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Generate Prisma Client in production image
RUN npx prisma generate

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3333

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3333/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/main.js"]
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3333:3333"
    environment:
      NODE_ENV: production
      PORT: 3333
      DATABASE_URL: postgresql://postgres:password@db:5432/halalsphere
    depends_on:
      - db
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3333/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 60s

  db:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: halalsphere
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### Build and Run

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

## Health Checks

The application exposes health check endpoints:

### Basic Health Check

```bash
curl http://localhost:3333/health
```

Response:
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "redis": { "status": "up" }
  },
  "error": {},
  "details": {
    "database": { "status": "up" },
    "redis": { "status": "up" }
  }
}
```

### Load Balancer Health Check

Configure ALB target group:
- **Path**: `/health`
- **Interval**: 30 seconds
- **Timeout**: 5 seconds
- **Healthy threshold**: 2
- **Unhealthy threshold**: 3

## Monitoring

### CloudWatch Metrics

#### Application Metrics

```typescript
// Custom metrics sent to CloudWatch
- api.requests.total
- api.requests.errors
- api.response.time
- database.connections.active
- database.query.duration
```

#### Container Metrics (ECS)

- CPU utilization
- Memory utilization
- Network in/out
- Task count

### CloudWatch Logs

#### Log Groups

- `/ecs/halalsphere-backend` - Application logs
- `/aws/rds/instance/halalsphere-db` - Database logs
- `/aws/elasticloadbalancing/halalsphere-alb` - Load balancer logs

#### Log Format

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "info",
  "message": "Request processed",
  "context": "RequestsController",
  "method": "POST",
  "path": "/requests",
  "duration": 125,
  "statusCode": 201
}
```

### Alerting

Create CloudWatch Alarms for:

1. **High Error Rate**: > 5% errors in 5 minutes
2. **High Response Time**: > 1000ms average
3. **Database Connections**: > 80% pool utilization
4. **CPU Usage**: > 80% for 5 minutes
5. **Memory Usage**: > 80% for 5 minutes
6. **Failed Health Checks**: 3 consecutive failures

## Troubleshooting

### Application Won't Start

```bash
# Check logs
docker logs <container-id>
# or
sudo journalctl -u halalsphere-backend -f

# Common issues:
# 1. Database connection failed
# 2. Missing environment variables
# 3. Port already in use
# 4. Insufficient permissions
```

### Database Connection Issues

```bash
# Test database connectivity
psql $DATABASE_URL

# Check connection pool
# Add to monitoring:
SELECT count(*) FROM pg_stat_activity WHERE datname = 'halalsphere';
```

### High Memory Usage

```bash
# Check Node.js memory
node --max-old-space-size=1024 dist/main.js

# Monitor memory in production
PM2_HOME=/opt/.pm2 pm2 start dist/main.js --max-memory-restart 1G
```

### Slow Queries

```sql
# Enable slow query logging in PostgreSQL
ALTER DATABASE halalsphere SET log_min_duration_statement = 1000;

# View slow queries
SELECT * FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Container Health Check Failing

```bash
# Debug health check
docker exec <container> curl -f http://localhost:3333/health

# Check application logs
docker logs <container> --tail 100
```

## Rollback Procedure

### ECS Deployment

```bash
# Rollback to previous task definition
aws ecs update-service \
  --cluster halalsphere-cluster \
  --service halalsphere-backend \
  --task-definition halalsphere-backend:previous-version
```

### Database Rollback

```bash
# Prisma doesn't support automatic rollback
# Manual rollback required:

# 1. Identify migration to rollback to
npx prisma migrate resolve --rolled-back <migration-name>

# 2. Create new migration that reverses changes
# 3. Deploy new migration
```

## Security Checklist

- [ ] Environment variables stored in Secrets Manager
- [ ] Database credentials rotated regularly
- [ ] SSL/TLS enabled for all connections
- [ ] Security groups restrict access to necessary ports
- [ ] Application runs as non-root user
- [ ] Dependencies scanned for vulnerabilities
- [ ] Rate limiting enabled
- [ ] CORS configured properly
- [ ] Helmet.js security headers enabled
- [ ] Input validation on all endpoints

## Performance Optimization

### Production Settings

```typescript
// Increase connection pool
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=20

// Enable Redis caching
REDIS_ENABLED=true
CACHE_TTL=300

// Compression
ENABLE_COMPRESSION=true

// Request timeout
REQUEST_TIMEOUT=30000
```

### CDN for Static Assets

Use CloudFront for:
- API documentation (Swagger UI)
- Static assets
- Presigned S3 URLs

## Backup and Recovery

### Database Backups

```bash
# Automated RDS backups (recommended)
- Retention period: 7-30 days
- Backup window: 03:00-04:00 UTC
- Maintenance window: Sun 04:00-05:00 UTC

# Manual backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### Document Backups

```bash
# Enable S3 versioning
aws s3api put-bucket-versioning \
  --bucket halalsphere-documents \
  --versioning-configuration Status=Enabled

# Enable cross-region replication (optional)
```

## Additional Resources

- [NestJS Production Guide](https://docs.nestjs.com/faq/serverless)
- [AWS ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)
- [Docker Security](https://docs.docker.com/engine/security/)
- [PostgreSQL Performance](https://www.postgresql.org/docs/current/performance-tips.html)
