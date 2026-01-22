# HalalSphere API Documentation

This folder contains the OpenAPI/Swagger specification for the HalalSphere Backend API.

## Files

- `swagger.json` - OpenAPI 3.0 specification in JSON format
- `swagger.yaml` - OpenAPI 3.0 specification in YAML format

## API Overview

| Statistic | Value |
|-----------|-------|
| Total Endpoints | 253 |
| Schemas | 94 |
| Tags | 14 |

## API Categories

### Core Certification
- **Authentication** - User login, registration, JWT tokens
- **Requests** - Certification request management
- **Process** - Process lifecycle management
- **Workflow** - Request workflow progression

### Scope Management
- **Certification** - Central certification entity
- **Certification Scope** - Products, facilities, brands, suppliers

### Commercial
- **Proposals** - Pricing calculation and commercial proposals
- **Contracts** - Contract workflow and signing

### Audit & Certification
- **Audits** - Audit execution and management
- **Auditor Allocation** - Auditor assignment and workload
- **Certificates** - Certificate generation and verification

### Company & Organization
- **Companies** - Company registration and verification
- **Company Groups** - Holdings and company groups
- **Plants** - Manufacturing facilities

### Administration
- **Users** - User management
- **AI** - Anthropic-powered conversational assistant
- **E-Signature Config** - E-signature provider configuration
- **Storage Config** - Storage provider configuration

### Support
- **Documents** - Document upload and management
- **Comments** - Internal and external communication
- **Reports** - Audit reports and statistics
- **Health** - System health checks

## Authentication

All endpoints (except `/health` and `/auth/login`) require JWT authentication.

```
Authorization: Bearer <token>
```

## Viewing Documentation

### Option 1: Swagger UI (Recommended)

Start the backend server and access:
```
http://localhost:3333/api/docs
```

### Option 2: Online Swagger Editor

1. Go to https://editor.swagger.io/
2. Import the `swagger.json` or `swagger.yaml` file

### Option 3: Postman

1. Open Postman
2. Import > File > Select `swagger.json`
3. All endpoints will be imported as a collection

## Generated

- **Date**: 2026-01-22
- **Version**: 2.0.0 (NestJS)
- **Framework**: NestJS 11 + Express
