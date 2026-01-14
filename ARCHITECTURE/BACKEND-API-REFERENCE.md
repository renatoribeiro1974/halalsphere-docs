# 🔧 Backend API Reference - Sistema de Auditorias

## 📋 Visão Geral

Este documento fornece a especificação completa das APIs REST necessárias para o sistema de auditorias.

---

## 🔐 Autenticação

Todas as rotas requerem autenticação via JWT token.

```typescript
// Header obrigatório em todas as requisições
Authorization: Bearer <token>
```

---

## 📡 Endpoints

### 1. Salvar Progresso da Auditoria

**Endpoint**: `PUT /api/audits/:auditId/save`

**Descrição**: Salva o progresso atual da auditoria (rascunho).

**Request Body**:
```json
{
  "auditId": "uuid",
  "sections": [
    {
      "id": "raw-materials",
      "section": "RAW_MATERIALS",
      "title": "Matérias-Primas",
      "completed": 15,
      "total": 28,
      "items": [
        {
          "id": "1",
          "itemNumber": "1.1",
          "requirement": "Certificados Halal de todos os fornecedores",
          "status": "CONFORM",
          "evidence": "Todos os certificados válidos até 2026",
          "evidenceCount": 17
        }
      ]
    }
  ],
  "lastModified": "2025-12-04T10:30:00Z",
  "progress": {
    "total": 64,
    "completed": 45,
    "conform": 40,
    "minorNC": 3,
    "majorNC": 2,
    "na": 0
  }
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "savedAt": "2025-12-04T10:30:00Z",
  "message": "Auditoria salva com sucesso"
}
```

**Implementação Exemplo (Node.js + Express + Prisma)**:
```typescript
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.put('/audits/:auditId/save', authenticate, async (req, res) => {
  try {
    const { auditId } = req.params;
    const { sections, lastModified, progress } = req.body;
    const userId = req.user.id;

    // Verify audit belongs to user
    const audit = await prisma.audit.findUnique({
      where: { id: auditId },
      include: { auditor: true }
    });

    if (!audit || audit.auditorId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Update audit
    const updated = await prisma.audit.update({
      where: { id: auditId },
      data: {
        status: 'IN_PROGRESS',
        lastModified: new Date(lastModified),
        progressData: progress,
        // Store sections as JSON
        checklistData: sections
      }
    });

    res.json({
      success: true,
      savedAt: updated.lastModified.toISOString(),
      message: 'Auditoria salva com sucesso'
    });
  } catch (error) {
    console.error('Error saving audit:', error);
    res.status(500).json({ error: 'Failed to save audit' });
  }
});

export default router;
```

---

### 2. Submeter Relatório Final

**Endpoint**: `POST /api/audits/:auditId/submit`

**Descrição**: Submete o relatório final da auditoria e muda o status do processo.

**Request Body**:
```json
{
  "auditId": "uuid",
  "sections": [...],
  "statistics": {
    "total": 64,
    "completed": 64,
    "conform": 58,
    "minorNC": 4,
    "majorNC": 2,
    "na": 0
  },
  "submittedAt": "2025-12-04T15:00:00Z",
  "status": "NON_COMPLIANT"
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "reportId": "uuid",
  "reportNumber": "REL-2025-000123",
  "status": "NON_COMPLIANT",
  "message": "Relatório submetido com sucesso"
}
```

**Implementação Exemplo**:
```typescript
router.post('/audits/:auditId/submit', authenticate, async (req, res) => {
  try {
    const { auditId } = req.params;
    const { sections, statistics, submittedAt, status } = req.body;
    const userId = req.user.id;

    // Verify audit belongs to user
    const audit = await prisma.audit.findUnique({
      where: { id: auditId },
      include: { process: true }
    });

    if (!audit || audit.auditorId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Create report
    const report = await prisma.auditReport.create({
      data: {
        auditId,
        reportNumber: await generateReportNumber(),
        status,
        statistics,
        checklistData: sections,
        submittedAt: new Date(submittedAt),
        submittedBy: userId
      }
    });

    // Update audit status
    await prisma.audit.update({
      where: { id: auditId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });

    // Update process status based on audit result
    let newProcessPhase;
    if (status === 'COMPLIANT') {
      newProcessPhase = audit.stage === 'STAGE_1'
        ? 'STAGE_2_SCHEDULED'
        : 'CERTIFICATION_APPROVED';
    } else {
      newProcessPhase = 'PENDING_CORRECTIONS';
    }

    await prisma.process.update({
      where: { id: audit.processId },
      data: { phase: newProcessPhase }
    });

    // Send notification to company
    await sendAuditCompletedNotification(audit.processId, report.id);

    res.json({
      success: true,
      reportId: report.id,
      reportNumber: report.reportNumber,
      status: report.status,
      message: 'Relatório submetido com sucesso'
    });
  } catch (error) {
    console.error('Error submitting audit:', error);
    res.status(500).json({ error: 'Failed to submit audit' });
  }
});

async function generateReportNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.auditReport.count({
    where: {
      createdAt: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`)
      }
    }
  });
  return `REL-${year}-${String(count + 1).padStart(6, '0')}`;
}
```

---

### 3. Upload de Evidência

**Endpoint**: `POST /api/audits/:auditId/evidence`

**Descrição**: Faz upload de arquivo de evidência (foto, documento, etc).

**Request**: `multipart/form-data`
```
file: <binary>
checkpointId: "1"
type: "PHOTO"
category: "NON_CONFORMITY"
title: "NC - Glicerina sem certificado"
description: "Foto do produto"
location: "Sala de matérias-primas"
tags: ["glicerina", "nc-maior"]
```

**Response**: `200 OK`
```json
{
  "success": true,
  "evidence": {
    "id": "uuid",
    "fileName": "evidence-20251204-123456.jpg",
    "fileUrl": "https://storage.halalsphere.com/evidence/...",
    "thumbnailUrl": "https://storage.halalsphere.com/thumbnails/...",
    "fileSize": 245678,
    "type": "PHOTO",
    "category": "NON_CONFORMITY",
    "title": "NC - Glicerina sem certificado",
    "capturedAt": "2025-12-04T15:00:00Z"
  }
}
```

**Implementação Exemplo (com AWS S3)**:
```typescript
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

const upload = multer({ storage: multer.memoryStorage() });
const s3 = new S3Client({ region: process.env.AWS_REGION });

router.post('/audits/:auditId/evidence',
  authenticate,
  upload.single('file'),
  async (req, res) => {
    try {
      const { auditId } = req.params;
      const { checkpointId, type, category, title, description, location, tags } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const ext = file.originalname.split('.').pop();
      const fileName = `evidence-${timestamp}.${ext}`;
      const s3Key = `audits/${auditId}/evidence/${fileName}`;

      // Upload to S3
      await s3.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'private'
      }));

      const fileUrl = `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${s3Key}`;

      // Generate thumbnail for images
      let thumbnailUrl;
      if (type === 'PHOTO') {
        const thumbnail = await sharp(file.buffer)
          .resize(300, 300, { fit: 'cover' })
          .jpeg({ quality: 80 })
          .toBuffer();

        const thumbKey = `audits/${auditId}/thumbnails/thumb-${fileName}`;
        await s3.send(new PutObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: thumbKey,
          Body: thumbnail,
          ContentType: 'image/jpeg',
          ACL: 'private'
        }));
        thumbnailUrl = `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${thumbKey}`;
      }

      // Save to database
      const evidence = await prisma.auditEvidence.create({
        data: {
          auditId,
          checkpointId,
          type,
          category,
          fileName: file.originalname,
          fileUrl,
          thumbnailUrl,
          fileSize: file.size,
          title,
          description,
          location,
          tags: tags ? JSON.parse(tags) : [],
          capturedAt: new Date(),
          uploadedBy: req.user.id
        }
      });

      res.json({
        success: true,
        evidence
      });
    } catch (error) {
      console.error('Error uploading evidence:', error);
      res.status(500).json({ error: 'Failed to upload evidence' });
    }
  }
);
```

---

### 4. Criar/Atualizar Não Conformidade

**Endpoint**: `POST /api/audits/:auditId/non-conformities`

**Descrição**: Cria ou atualiza uma não conformidade.

**Request Body**:
```json
{
  "checkpointId": "2",
  "severity": "MAJOR",
  "category": "MATÉRIAS-PRIMAS",
  "title": "Glicerina sem certificado Halal",
  "description": "Certificado Halal da glicerina não foi apresentado",
  "location": "Sala de matérias-primas",
  "dtSection": "DT 7.1 - 6.2.3",
  "gsoClause": "GSO 2055-2 - Clause 4.2",
  "requirementText": "Todos os ingredientes de origem animal devem ter certificado Halal",
  "evidenceFiles": ["uuid1", "uuid2"],
  "correctiveAction": "Solicitar certificado ao fornecedor",
  "preventiveAction": "Implementar verificação de certificados antes da compra",
  "responsiblePerson": "Gerente de Compras",
  "targetDate": "2025-12-15"
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "nonConformity": {
    "id": "uuid",
    "ncNumber": "NC-2025-000123",
    "severity": "MAJOR",
    "status": "OPEN",
    "createdAt": "2025-12-04T15:00:00Z"
  }
}
```

**Implementação Exemplo**:
```typescript
router.post('/audits/:auditId/non-conformities', authenticate, async (req, res) => {
  try {
    const { auditId } = req.params;
    const ncData = req.body;

    // Generate NC number
    const ncNumber = await generateNCNumber();

    // Create NC
    const nc = await prisma.nonConformity.create({
      data: {
        auditId,
        checkpointId: ncData.checkpointId,
        ncNumber,
        severity: ncData.severity,
        category: ncData.category,
        title: ncData.title,
        description: ncData.description,
        location: ncData.location,
        dtSection: ncData.dtSection,
        gsoClause: ncData.gsoClause,
        requirementText: ncData.requirementText,
        correctiveAction: ncData.correctiveAction,
        preventiveAction: ncData.preventiveAction,
        responsiblePerson: ncData.responsiblePerson,
        targetDate: ncData.targetDate ? new Date(ncData.targetDate) : null,
        status: 'OPEN',
        createdBy: req.user.id
      }
    });

    // Link evidence files
    if (ncData.evidenceFiles && ncData.evidenceFiles.length > 0) {
      await prisma.auditEvidence.updateMany({
        where: { id: { in: ncData.evidenceFiles } },
        data: { ncId: nc.id }
      });
    }

    res.json({
      success: true,
      nonConformity: nc
    });
  } catch (error) {
    console.error('Error creating NC:', error);
    res.status(500).json({ error: 'Failed to create NC' });
  }
});

async function generateNCNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.nonConformity.count({
    where: {
      createdAt: {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`)
      }
    }
  });
  return `NC-${year}-${String(count + 1).padStart(6, '0')}`;
}
```

---

### 5. Listar Relatórios

**Endpoint**: `GET /api/reports?status=&stage=&search=`

**Descrição**: Lista todos os relatórios de auditorias concluídas.

**Query Params**:
- `status` (opcional): `COMPLIANT`, `PENDING_CORRECTIONS`, `NON_COMPLIANT`
- `stage` (opcional): `STAGE_1`, `STAGE_2`
- `search` (opcional): busca por nome da empresa ou número da auditoria

**Response**: `200 OK`
```json
[
  {
    "id": "uuid",
    "auditNumber": "AUD-2025-001",
    "companyName": "Frigorífico Abatedouro A",
    "companyAddress": "Rua dos Bois, 12 - São Paulo/SP",
    "auditDate": "2025-12-10",
    "stage": "STAGE_2",
    "status": "COMPLIANT",
    "auditor": "João Silva",
    "totalItems": 150,
    "conformItems": 145,
    "minorNCs": 4,
    "majorNCs": 1,
    "score": 96.7,
    "reportPdfUrl": "https://...",
    "createdAt": "2025-12-10T16:30:00Z"
  }
]
```

**Implementação Exemplo**:
```typescript
router.get('/reports', authenticate, async (req, res) => {
  try {
    const { status, stage, search } = req.query;
    const userId = req.user.id;

    const where: any = {
      audit: {
        auditorId: userId,
        status: 'COMPLETED'
      }
    };

    if (status) {
      where.status = status;
    }

    if (stage) {
      where.audit = { ...where.audit, stage };
    }

    if (search) {
      where.OR = [
        { audit: { auditNumber: { contains: search, mode: 'insensitive' } } },
        { audit: { process: { company: { name: { contains: search, mode: 'insensitive' } } } } }
      ];
    }

    const reports = await prisma.auditReport.findMany({
      where,
      include: {
        audit: {
          include: {
            process: {
              include: { company: true }
            },
            auditor: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = reports.map(report => ({
      id: report.id,
      auditNumber: report.audit.auditNumber,
      companyName: report.audit.process.company.name,
      companyAddress: report.audit.process.company.address,
      auditDate: report.audit.scheduledDate,
      stage: report.audit.stage,
      status: report.status,
      auditor: report.audit.auditor.name,
      totalItems: report.statistics.total,
      conformItems: report.statistics.conform,
      minorNCs: report.statistics.minorNC,
      majorNCs: report.statistics.majorNC,
      score: ((report.statistics.conform / report.statistics.total) * 100).toFixed(1),
      reportPdfUrl: report.pdfUrl,
      createdAt: report.createdAt
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});
```

---

### 6. Gerar PDF do Relatório

**Endpoint**: `GET /api/reports/:reportId/pdf`

**Descrição**: Gera e retorna o PDF do relatório de auditoria.

**Response**: `application/pdf`

**Implementação Exemplo (com Puppeteer)**:
```typescript
import puppeteer from 'puppeteer';
import { renderReportTemplate } from '../templates/audit-report';

router.get('/reports/:reportId/pdf', authenticate, async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await prisma.auditReport.findUnique({
      where: { id: reportId },
      include: {
        audit: {
          include: {
            process: { include: { company: true } },
            auditor: true,
            evidences: true,
            nonConformities: true
          }
        }
      }
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Render HTML template
    const html = renderReportTemplate(report);

    // Generate PDF
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
    });
    await browser.close();

    // Save PDF URL (optional)
    const pdfKey = `reports/${reportId}.pdf`;
    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: pdfKey,
      Body: pdf,
      ContentType: 'application/pdf'
    }));

    const pdfUrl = `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${pdfKey}`;
    await prisma.auditReport.update({
      where: { id: reportId },
      data: { pdfUrl }
    });

    // Return PDF
    res.contentType('application/pdf');
    res.send(pdf);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});
```

---

## 📬 Notificações

### Email quando Relatório Submetido

```typescript
import nodemailer from 'nodemailer';

async function sendAuditCompletedNotification(processId: string, reportId: string) {
  const process = await prisma.process.findUnique({
    where: { id: processId },
    include: { company: { include: { user: true } } }
  });

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: 'noreply@halalsphere.com',
    to: process.company.user.email,
    subject: 'Auditoria Concluída - HalalSphere',
    html: `
      <h2>Auditoria Concluída</h2>
      <p>Prezado ${process.company.name},</p>
      <p>A auditoria foi concluída. Acesse a plataforma para visualizar o relatório.</p>
      <p><a href="${process.env.FRONTEND_URL}/processos/${processId}">Ver Relatório</a></p>
    `
  });
}
```

---

## 🔒 Middleware de Autenticação

```typescript
import jwt from 'jsonwebtoken';

export function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

---

## 📊 Estrutura Completa do Backend

```
backend/
├── src/
│   ├── routes/
│   │   ├── audits.ts          # Endpoints de auditorias
│   │   ├── reports.ts         # Endpoints de relatórios
│   │   ├── evidence.ts        # Upload de evidências
│   │   └── nonconformities.ts # NCs
│   ├── middleware/
│   │   ├── auth.ts            # Autenticação JWT
│   │   └── upload.ts          # Multer config
│   ├── services/
│   │   ├── s3.ts              # AWS S3
│   │   ├── pdf.ts             # Geração de PDF
│   │   └── email.ts           # Envio de emails
│   ├── templates/
│   │   └── audit-report.ts    # Template HTML do relatório
│   └── index.ts               # Server setup
├── prisma/
│   └── schema.prisma          # Database schema
└── package.json
```

---

## ✅ Checklist de Implementação Backend

- [ ] Setup Express + TypeScript
- [ ] Configurar Prisma
- [ ] Implementar autenticação JWT
- [ ] Endpoint: Salvar auditoria
- [ ] Endpoint: Submeter relatório
- [ ] Endpoint: Upload de evidências
- [ ] Endpoint: Criar NC
- [ ] Endpoint: Listar relatórios
- [ ] Endpoint: Gerar PDF
- [ ] Integração AWS S3
- [ ] Serviço de email
- [ ] Template de PDF
- [ ] Testes unitários
- [ ] Documentação Swagger

---

**Próximo passo**: Implementar estas APIs no backend! 🚀
