# API Documentation Guide

## Overview

The HalalSphere API is fully documented using OpenAPI 3.0 (Swagger) specification. This guide explains how to access, use, and generate the API documentation.

## Accessing Documentation

### Interactive Documentation (Swagger UI)

1. Start the development server:
   ```bash
   npm run start:dev
   ```

2. Open your browser to:
   ```
   http://localhost:3333/api/docs
   ```

3. You'll see the interactive Swagger UI with:
   - Complete endpoint list organized by tags
   - Request/response schemas
   - Try-it-out functionality
   - Authentication support

### Environment URLs

- **Local Development**: http://localhost:3333/api/docs
- **Staging**: https://api-staging.halalsphere.com/api/docs
- **Production**: https://api.halalsphere.com/api/docs

## Generating Documentation Files

### Generate OpenAPI JSON/YAML

```bash
npm run generate:swagger
```

This generates:
- `swagger.json` - OpenAPI 3.0 specification in JSON format
- `swagger.yaml` - OpenAPI 3.0 specification in YAML format (requires js-yaml)

### Use Cases for Generated Files

1. **API Client Generation**: Use with tools like `openapi-generator` to generate client SDKs
2. **CI/CD Integration**: Validate API changes, detect breaking changes
3. **External Documentation**: Import into tools like Postman, Insomnia
4. **Contract Testing**: Validate responses match the spec

## Using the Interactive Documentation

### Authentication

1. Click the **"Authorize"** button (lock icon) at the top right
2. Enter your JWT token in the format: `Bearer <your-token>`
3. Click **"Authorize"** to save
4. The token will be automatically included in all subsequent requests

### Testing Endpoints

1. Navigate to the endpoint you want to test
2. Click **"Try it out"**
3. Fill in the required parameters
4. Click **"Execute"**
5. View the response, including:
   - Status code
   - Response headers
   - Response body
   - Request duration

### Filtering Endpoints

Use the search bar at the top to filter endpoints by:
- Endpoint path (e.g., `/requests`)
- HTTP method (e.g., `POST`)
- Tag (e.g., `Requests`)
- Description text

## API Organization

### Tags (Modules)

The API is organized into logical groups:

1. **Authentication** - Login, logout, token refresh
2. **Requests** - Certification request management
3. **Process** - Process lifecycle management
4. **Contracts** - Contract workflow
5. **Auditor Allocation** - Auditor assignment
6. **Audits** - Audit execution
7. **Documents** - Document management
8. **Document Requests** - Request documents from companies
9. **Proposals** - Commercial proposals
10. **Certificates** - Certificate generation
11. **Comments** - Communication
12. **Companies** - Company management
13. **Users** - User management
14. **Health** - System health checks

### Endpoint Naming Convention

```
[METHOD] /[resource]/[action]
```

Examples:
- `GET /requests` - List all requests
- `POST /requests` - Create new request
- `GET /requests/:id` - Get request by ID
- `PATCH /requests/:id/approve` - Approve request
- `GET /requests/stats/summary` - Get request statistics

## Response Formats

### Success Response

```json
{
  "id": "uuid",
  "field1": "value",
  "field2": 123,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Paginated List Response

```json
{
  "data": [
    { "id": "1", "name": "Item 1" },
    { "id": "2", "name": "Item 2" }
  ],
  "total": 100,
  "skip": 0,
  "take": 10
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

## Common Query Parameters

### Pagination

- `skip` (number): Number of records to skip (default: 0)
- `take` (number): Number of records to return (default: 50, max: 100)

Example:
```
GET /requests?skip=20&take=10
```

### Filtering

- `status`: Filter by status enum
- `phase`: Filter by phase enum
- `companyId`: Filter by company ID
- `userId`: Filter by user ID

Example:
```
GET /process?status=em_analise&currentPhase=analise_documentacao
```

### Sorting

- `orderBy`: Field to sort by
- `order`: Sort direction (asc/desc)

Example:
```
GET /requests?orderBy=createdAt&order=desc
```

## Authentication & Authorization

### JWT Token Structure

```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "role": "analista",
  "companyId": "company-id",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### User Roles & Permissions

| Role | Access Level |
|------|-------------|
| admin | Full system access |
| gestor | Manager access - allocate auditors, approve |
| analista | Analyst access - manage requests, processes |
| auditor | Auditor access - conduct audits |
| empresa | Company access - view own processes only |

### Protected Endpoints

All endpoints (except `/health` and `/auth/login`) require:
- Valid JWT token in Authorization header
- User must have required role for the endpoint
- User must have access to the requested resource

## Error Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 400 | Bad Request | Invalid input, validation failed |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | User lacks required role/permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Business logic validation failed |
| 500 | Internal Server Error | Unexpected server error |

## Rate Limiting

The API implements rate limiting:

- **Per IP**: 100 requests/minute
- **Per User**: 1000 requests/hour
- **Burst**: Up to 20 requests simultaneously

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

## Best Practices

### 1. Always Use Pagination

```typescript
// Good
GET /requests?skip=0&take=50

// Avoid
GET /requests  // Could return thousands of records
```

### 2. Filter at API Level

```typescript
// Good - Filter on backend
GET /requests?status=pendente

// Avoid - Fetch all and filter on frontend
GET /requests  // Then filter in JS
```

### 3. Include Only Needed Fields

Use query parameters to select specific fields (if supported):
```
GET /requests/:id?fields=id,companyName,status
```

### 4. Handle Errors Gracefully

```typescript
try {
  const response = await fetch('/api/requests');
  if (!response.ok) {
    const error = await response.json();
    console.error(error.message);
  }
} catch (err) {
  console.error('Network error:', err);
}
```

### 5. Cache Static Data

Cache reference data like:
- User roles
- Status enums
- Product types
- Countries/states

### 6. Use Conditional Requests

Use ETags for caching:
```
If-None-Match: "etag-value"
```

## Versioning

Current API version: **2.0.0**

Version is included in:
- Swagger documentation title
- API responses (custom header: `X-API-Version`)

### Breaking Changes Policy

Major version changes (e.g., 2.0 → 3.0) may include:
- Endpoint removals
- Request/response format changes
- Authentication changes

Minor version changes (e.g., 2.0 → 2.1) include:
- New endpoints
- New optional fields
- Bug fixes

## Support & Contact

- **Documentation Issues**: Open issue on GitHub
- **API Questions**: support@halalsphere.com
- **Bug Reports**: bugs@halalsphere.com

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [Postman Documentation](https://www.postman.com/api-documentation-tool/)
