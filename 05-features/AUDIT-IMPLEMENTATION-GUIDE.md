# 🚀 Guia de Implementação - Sistema de Auditorias

## Visão Geral

Este guia fornece instruções detalhadas para implementar o sistema completo de auditorias do HalalSphere, incluindo backend, frontend, integrações com IA e configuração mobile.

---

## 📋 Índice

1. [Arquitetura do Sistema](#arquitetura-do-sistema)
2. [Configuração do Backend](#configuração-do-backend)
3. [Implementação dos Componentes Frontend](#implementação-dos-componentes-frontend)
4. [Integração com IA](#integração-com-ia)
5. [App Mobile](#app-mobile)
6. [Modo Offline](#modo-offline)
7. [Geração de Relatórios](#geração-de-relatórios)
8. [Testes](#testes)
9. [Deploy](#deploy)

---

## 🏗️ Arquitetura do Sistema

### Stack Tecnológica

```
Backend:
├── Node.js + Express (ou Next.js API Routes)
├── Prisma ORM
├── PostgreSQL (database principal)
├── Redis (cache e jobs)
└── AWS S3 / Cloudinary (armazenamento de arquivos)

Frontend Web:
├── React + TypeScript
├── Tailwind CSS
├── React Query (data fetching)
├── Zustand (state management)
└── React Hook Form (formulários)

Mobile:
├── React Native (ou Flutter)
├── SQLite (offline storage)
├── React Native Camera
└── React Native Signature Canvas

IA/ML:
├── OpenAI GPT-4 (análise de documentos)
├── Tesseract.js (OCR)
├── Python FastAPI (processamento assíncrono)
└── Celery + Redis (task queue)
```

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND WEB                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Dashboard  │  │  Execução    │  │  Relatórios  │  │
│  │   Auditor    │  │  Auditoria   │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    API BACKEND                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Auditorias  │  │      NCs     │  │  Evidências  │  │
│  │     API      │  │     API      │  │     API      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│   PostgreSQL   │  │     Redis      │  │   S3/Cloudinary│
│   (Database)   │  │  (Cache/Jobs)  │  │    (Files)     │
└────────────────┘  └────────────────┘  └────────────────┘
                         │
                         ▼
                ┌────────────────┐
                │   IA SERVICE   │
                │  (Python/GPU)  │
                └────────────────┘
```

---

## ⚙️ Configuração do Backend

### 1. Adicionar Schema ao Prisma

```bash
# Copiar o schema de auditorias para o projeto
cat prisma/schema-audits.prisma >> prisma/schema.prisma

# Gerar migration
npx prisma migrate dev --name add-audit-system

# Gerar Prisma Client
npx prisma generate
```

### 2. Implementar Controllers

#### `src/controllers/AuditController.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export class AuditController {
  // Lista auditorias do auditor
  async listAudits(req: Request, res: Response) {
    const { auditorId } = req.user;
    const { filter } = req.query; // 'today', 'week', 'upcoming'

    let dateFilter = {};
    const today = new Date();

    if (filter === 'today') {
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));
      dateFilter = {
        scheduledDate: {
          gte: startOfDay,
          lte: endOfDay
        }
      };
    }

    const audits = await prisma.audit.findMany({
      where: {
        auditorId,
        ...dateFilter
      },
      include: {
        company: true,
        preAuditAnalysis: {
          select: {
            status: true,
            criticalIngredients: {
              where: { riskLevel: 'HIGH' },
              select: { id: true }
            }
          }
        }
      },
      orderBy: {
        scheduledDate: 'asc'
      }
    });

    res.json(audits);
  }

  // Iniciar auditoria
  async startAudit(req: Request, res: Response) {
    const { auditId } = req.params;

    const audit = await prisma.audit.update({
      where: { id: auditId },
      data: {
        status: 'IN_PROGRESS',
        phase: 'IN_EXECUTION',
        actualStartTime: new Date()
      }
    });

    // Atualizar status do processo
    await prisma.process.update({
      where: { id: audit.processId },
      data: {
        phase: 'IN_AUDIT'
      }
    });

    res.json(audit);
  }

  // Obter detalhes da auditoria
  async getAudit(req: Request, res: Response) {
    const { auditId } = req.params;

    const audit = await prisma.audit.findUnique({
      where: { id: auditId },
      include: {
        company: true,
        checklists: {
          include: {
            items: {
              include: {
                evidenceFiles: true,
                nonConformity: true
              }
            }
          }
        },
        preAuditAnalysis: {
          include: {
            criticalIngredients: true
          }
        },
        nonConformities: {
          include: {
            evidenceFiles: true
          }
        },
        evidences: true
      }
    });

    res.json(audit);
  }

  // Atualizar item do checklist
  async updateChecklistItem(req: Request, res: Response) {
    const { itemId } = req.params;
    const { status, evidence, auditorNotes } = req.body;

    const item = await prisma.checklistItem.update({
      where: { id: itemId },
      data: {
        status,
        evidence,
        auditorNotes,
        checkedAt: new Date(),
        checkedBy: req.user.id
      }
    });

    // Atualizar contadores do checklist
    const checklist = await prisma.auditChecklist.findUnique({
      where: { id: item.checklistId },
      include: {
        items: true
      }
    });

    const stats = {
      conformItems: checklist.items.filter(i => i.status === 'CONFORM').length,
      minorNCItems: checklist.items.filter(i => i.status === 'MINOR_NC').length,
      majorNCItems: checklist.items.filter(i => i.status === 'MAJOR_NC').length,
      naItems: checklist.items.filter(i => i.status === 'NA').length
    };

    await prisma.auditChecklist.update({
      where: { id: item.checklistId },
      data: stats
    });

    res.json(item);
  }

  // Submeter relatório
  async submitReport(req: Request, res: Response) {
    const { auditId } = req.params;

    // Validar que todos os itens críticos foram verificados
    const audit = await prisma.audit.findUnique({
      where: { id: auditId },
      include: {
        checklists: {
          include: {
            items: {
              where: {
                isCritical: true,
                status: null
              }
            }
          }
        }
      }
    });

    const pendingCriticalItems = audit.checklists.flatMap(c => c.items);
    if (pendingCriticalItems.length > 0) {
      return res.status(400).json({
        error: 'Existem itens críticos não verificados',
        pendingItems: pendingCriticalItems.length
      });
    }

    // Atualizar status da auditoria
    const updatedAudit = await prisma.audit.update({
      where: { id: auditId },
      data: {
        status: 'COMPLETED',
        phase: 'REPORTING',
        actualEndTime: new Date(),
        submittedAt: new Date()
      }
    });

    // Gerar relatório automático
    await this.generateReport(auditId);

    // Atualizar processo
    const hasMajorNCs = audit.majorNCs > 0;
    await prisma.process.update({
      where: { id: updatedAudit.processId },
      data: {
        phase: hasMajorNCs ? 'AWAITING_NC_CORRECTION' : 'AWAITING_DECISION'
      }
    });

    // Enviar notificações
    await this.sendNotifications(updatedAudit);

    res.json({ success: true, audit: updatedAudit });
  }

  // Método privado para gerar relatório
  private async generateReport(auditId: string) {
    // Implementação da geração de relatório
    // Ver seção "Geração de Relatórios" abaixo
  }

  // Método privado para enviar notificações
  private async sendNotifications(audit: any) {
    // Notificar analista
    // Notificar empresa
    // Ver seção de Notificações
  }
}
```

### 3. Implementar Rotas

#### `src/routes/audits.ts`

```typescript
import { Router } from 'express';
import { AuditController } from '../controllers/AuditController';
import { authMiddleware } from '../middleware/auth';
import { roleMiddleware } from '../middleware/role';

const router = Router();
const controller = new AuditController();

// Todas as rotas requerem autenticação de auditor
router.use(authMiddleware);
router.use(roleMiddleware(['AUDITOR', 'LEAD_AUDITOR']));

// Listar auditorias
router.get('/', controller.listAudits);

// Detalhes da auditoria
router.get('/:auditId', controller.getAudit);

// Iniciar auditoria
router.post('/:auditId/start', controller.startAudit);

// Atualizar checklist
router.put('/checklist/items/:itemId', controller.updateChecklistItem);

// Submeter relatório
router.post('/:auditId/submit', controller.submitReport);

// Análise prévia IA
router.get('/:auditId/pre-analysis', controller.getPreAuditAnalysis);

// Evidências
router.post('/:auditId/evidence', controller.uploadEvidence);
router.get('/:auditId/evidence', controller.listEvidence);

// Não-conformidades
router.post('/:auditId/nc', controller.createNC);
router.get('/:auditId/nc', controller.listNCs);
router.put('/nc/:ncId', controller.updateNC);

export default router;
```

---

## 🎨 Implementação dos Componentes Frontend

### 1. Configurar Rotas

#### `src/App.tsx`

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuditorDashboard from './components/audits/AuditorDashboard';
import AuditExecution from './components/audits/AuditExecution';
import PreAuditAnalysis from './components/audits/PreAuditAnalysis';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/audits" element={<AuditorDashboard />} />
        <Route path="/audits/:auditId/execute" element={<AuditExecution />} />
        <Route path="/audits/:auditId/pre-analysis" element={<PreAuditAnalysis />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### 2. Hooks Customizados

#### `src/hooks/useAudit.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { auditService } from '../services/auditService';

export function useAudit(auditId: string) {
  return useQuery(['audit', auditId], () => auditService.getAudit(auditId));
}

export function useUpdateChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation(
    ({ itemId, data }: any) => auditService.updateChecklistItem(itemId, data),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(['audit']);
      }
    }
  );
}

export function useSubmitReport() {
  const queryClient = useQueryClient();

  return useMutation(
    (auditId: string) => auditService.submitReport(auditId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['audits']);
      }
    }
  );
}
```

### 3. Services

#### `src/services/auditService.ts`

```typescript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const auditService = {
  listAudits: async (filter?: string) => {
    const response = await axios.get(`${API_URL}/audits`, {
      params: { filter }
    });
    return response.data;
  },

  getAudit: async (auditId: string) => {
    const response = await axios.get(`${API_URL}/audits/${auditId}`);
    return response.data;
  },

  startAudit: async (auditId: string) => {
    const response = await axios.post(`${API_URL}/audits/${auditId}/start`);
    return response.data;
  },

  updateChecklistItem: async (itemId: string, data: any) => {
    const response = await axios.put(
      `${API_URL}/audits/checklist/items/${itemId}`,
      data
    );
    return response.data;
  },

  submitReport: async (auditId: string) => {
    const response = await axios.post(`${API_URL}/audits/${auditId}/submit`);
    return response.data;
  },

  uploadEvidence: async (auditId: string, formData: FormData) => {
    const response = await axios.post(
      `${API_URL}/audits/${auditId}/evidence`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  }
};
```

---

## 🤖 Integração com IA

### 1. Serviço de Análise Pré-Auditoria

#### `src/services/aiAnalysisService.py` (Python/FastAPI)

```python
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from typing import List
import openai
import PyPDF2
import openpyxl

app = FastAPI()

class AnalysisRequest(BaseModel):
    audit_id: str
    document_urls: List[str]

@app.post("/analyze")
async def analyze_documents(request: AnalysisRequest, background_tasks: BackgroundTasks):
    # Iniciar análise em background
    background_tasks.add_task(process_analysis, request.audit_id, request.document_urls)
    return {"status": "processing", "audit_id": request.audit_id}

async def process_analysis(audit_id: str, document_urls: List[str]):
    # 1. Download dos documentos
    documents = []
    for url in document_urls:
        doc = download_document(url)
        documents.append(doc)

    # 2. Extração de texto
    extracted_text = []
    for doc in documents:
        if doc.type == 'pdf':
            text = extract_text_from_pdf(doc.path)
        elif doc.type == 'xlsx':
            text = extract_text_from_excel(doc.path)
        extracted_text.append(text)

    # 3. Análise com GPT-4
    prompt = f"""
    Você é um especialista em certificação Halal.
    Analise os seguintes documentos de uma empresa e identifique:

    1. Lista completa de produtos
    2. Ingredientes utilizados com suas origens
    3. Fornecedores e status de certificados Halal
    4. Ingredientes críticos que requerem atenção especial
    5. Pontos de risco para a auditoria

    Documentos:
    {'\n\n'.join(extracted_text)}

    Retorne em formato JSON estruturado.
    """

    response = openai.ChatCompletion.create(
        model="gpt-4-turbo",
        messages=[
            {"role": "system", "content": "Você é um especialista em certificação Halal."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3
    )

    analysis_result = parse_gpt_response(response.choices[0].message.content)

    # 4. Salvar resultado no banco
    await save_analysis_to_database(audit_id, analysis_result)

    return analysis_result

def extract_text_from_pdf(path):
    # Implementação de extração de PDF
    pass

def extract_text_from_excel(path):
    # Implementação de extração de Excel
    pass
```

### 2. Integrar com Backend Principal

#### `src/services/aiService.ts` (Node.js)

```typescript
import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export class AIService {
  async triggerPreAuditAnalysis(auditId: string, documentUrls: string[]) {
    const response = await axios.post(`${AI_SERVICE_URL}/analyze`, {
      audit_id: auditId,
      document_urls: documentUrls
    });

    return response.data;
  }

  async getAnalysisStatus(auditId: string) {
    const response = await axios.get(`${AI_SERVICE_URL}/status/${auditId}`);
    return response.data;
  }
}
```

---

## 📱 App Mobile

### Configuração React Native

```bash
# Criar projeto
npx react-native init HalalSphereAuditor
cd HalalSphereAuditor

# Instalar dependências
npm install @react-navigation/native @react-navigation/stack
npm install react-native-camera react-native-fs
npm install @react-native-async-storage/async-storage
npm install react-native-sqlite-storage
npm install react-native-signature-canvas
```

### Estrutura de Navegação

```typescript
// App.tsx (Mobile)
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="AuditExecution" component={AuditExecutionScreen} />
        <Stack.Screen name="CameraCapture" component={CameraCaptureScreen} />
        <Stack.Screen name="NCForm" component={NCFormScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

---

## 💾 Modo Offline

### Implementação de Sincronização

```typescript
// src/services/offlineService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export class OfflineService {
  private syncQueue: any[] = [];

  async saveOffline(key: string, data: any) {
    await AsyncStorage.setItem(key, JSON.stringify(data));
    this.syncQueue.push({ key, data, timestamp: Date.now() });
  }

  async syncWhenOnline() {
    if (!navigator.onLine) return;

    for (const item of this.syncQueue) {
      try {
        await this.uploadToServer(item);
        this.syncQueue = this.syncQueue.filter(i => i !== item);
      } catch (error) {
        console.error('Sync failed:', error);
      }
    }
  }

  private async uploadToServer(item: any) {
    // Implementação de upload
  }
}
```

---

## 📄 Geração de Relatórios

### Template de Relatório PDF

```typescript
// src/services/reportGenerator.ts
import PDFDocument from 'pdfkit';
import fs from 'fs';

export async function generateAuditReport(auditId: string) {
  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
    include: {
      company: true,
      checklists: { include: { items: true } },
      nonConformities: true,
      evidences: true
    }
  });

  const doc = new PDFDocument();
  const pdfPath = `/tmp/audit-report-${auditId}.pdf`;
  doc.pipe(fs.createWriteStream(pdfPath));

  // Header
  doc.fontSize(20).text('RELATÓRIO DE AUDITORIA HALAL', { align: 'center' });
  doc.fontSize(12).text(`Número: ${audit.reportNumber}`, { align: 'center' });
  doc.moveDown();

  // Resumo Executivo
  doc.fontSize(16).text('1. RESUMO EXECUTIVO');
  doc.fontSize(11).text(generateExecutiveSummary(audit));
  doc.moveDown();

  // Informações da Auditoria
  doc.fontSize(16).text('2. INFORMAÇÕES DA AUDITORIA');
  doc.fontSize(11).text(`Empresa: ${audit.company.name}`);
  doc.text(`Data: ${audit.scheduledDate}`);
  doc.text(`Auditor: ${audit.auditor.name}`);
  doc.moveDown();

  // ... mais seções

  doc.end();

  return pdfPath;
}
```

---

## ✅ Próximos Passos

1. ✅ Implementar backend APIs
2. ✅ Configurar banco de dados
3. ✅ Desenvolver componentes frontend
4. ✅ Integrar serviço de IA
5. ✅ Desenvolver app mobile
6. ✅ Implementar sincronização offline
7. ✅ Configurar geração de relatórios
8. ✅ Testes end-to-end
9. ✅ Deploy em produção

---

**Documentação completa e pronta para desenvolvimento!** 🎉
