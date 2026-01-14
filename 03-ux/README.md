# UX Design Guide v1.0

**Design System | Layouts | Componentes | Acessibilidade**

---

## 📋 Índice do UX Guide

### Core Design

#### [1. Design System](./01-design-system.md)
**Paleta de Cores | Tipografia | Espaçamento | Shadows**

- Tema: Autoridade Clássica (Verde Halal + Dourado Premium)
- Paleta completa: Primary (#2D5016), Secondary (#D4AF37), Semantic colors
- Tipografia: Inter (Google Fonts)
- Spacing scale: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
- Shadows: sm, md, lg, xl
- Status badges (pending, warning, success, error)

#### [2. Layouts por Persona](./02-layouts.md)
**4 Personas | 9 Direções de Layout**

- Empresa Solicitante: Dashboard simplificado, wizard intuitivo
- Analista: Kanban, visão de processos, ferramentas de análise
- Auditor: Checklists digitais, upload de evidências
- Gestor: Dashboards executivos, relatórios

**9 Direções de Layout**:
1. Sidebar clássica + Topbar
2. Topbar only (minimalista)
3. Sidebar colapsável
4. Dashboard cards
5. Kanban-first
6. Timeline vertical
7. Split view (master-detail)
8. Wizard-centric
9. Mobile-first responsivo

---

### Solutions & Patterns

#### [3. Soluções para Alto Volume](./03-high-volume.md)
**600-700 Processos Simultâneos**

- Virtualização de listas (React Virtual)
- Infinite scroll otimizado
- Filtros avançados (10+ critérios)
- Busca full-text instantânea
- Paginação server-side
- Cache inteligente (Redis)

#### [4. Jornada do Cliente - Wizard com IA](./04-wizard.md)
**6 Etapas | IA Embarcada | 85% Taxa de Conclusão**

**Wizard de Solicitação de Certificação**:
1. Dados da Empresa
2. Categorização de Produtos (C1-C6)
3. Upload de Documentos (drag-and-drop)
4. Informações de Produção
5. Preferências de Auditoria
6. Resumo e Envio

**Recursos de IA**:
- Sugestões de categorização automática
- Detecção de documentos faltantes
- Estimativa de custos em tempo real
- Preenchimento assistido

**UX Inovador**:
- Barra de progresso visual
- Salvamento automático
- Validação inline
- Ajuda contextual

---

### Components & Standards

#### [5. Componentes e Padrões](./05-components.md)
**shadcn/ui | Componentes Customizados**

**Componentes Base (shadcn/ui)**:
- Button, Input, Select, Checkbox, Radio
- Card, Badge, Avatar, Tooltip
- Dialog, Sheet, Popover
- Table, Tabs, Accordion

**Componentes Customizados**:
- `ProcessStatusBadge` - Status de processos (12 fases)
- `DocumentUploader` - Upload drag-and-drop com preview
- `KanbanBoard` - Kanban para 700 processos
- `CertificateViewer` - Visualizador de certificados PDF
- `ChatInterface` - Interface do chatbot RAG
- `AnalystWorkspace` - Workspace do analista
- `CalendarScheduler` - Agendamento de auditorias

**Padrões de Design**:
- Empty states (ilustrações + CTAs)
- Loading states (skeletons)
- Error states (ilustrações + retry)
- Success states (confetti + next steps)

#### [6. Acessibilidade e i18n](./06-accessibility.md)
**WCAG 2.1 AA | 4 Idiomas**

**Acessibilidade**:
- Contraste mínimo 4.5:1 (texto normal)
- Navegação por teclado completa
- ARIA labels em todos os componentes
- Screen reader friendly
- Focus indicators visíveis

**Internacionalização (i18n)**:
- pt-BR (Português Brasil) - Idioma principal
- en-US (English) - Internacional
- ar-SA (العربية) - Mercado árabe
- tr-TR (Türkçe) - Turquia

**Bibliotecas**:
- react-i18next (traduções)
- date-fns (formatação de datas)
- intl-number-format (moedas)

---

### Assets & Deliverables

#### [7. Wireframes e Protótipos](./07-wireframes.md)
**4 Protótipos HTML Interativos**

- [ux-color-themes.html](../assets/ux-color-themes.html) - 4 temas comparáveis
- [ux-design-directions-v2.html](../assets/ux-design-directions-v2.html) - 9 layouts
- [ux-design-high-volume-solutions.html](../assets/ux-design-high-volume-solutions.html) - Soluções de performance
- [ux-journey-wizard-ai.html](../assets/ux-journey-wizard-ai.html) - Wizard 9 etapas

**Como usar**:
```bash
# Abrir no browser
open docs/assets/ux-color-themes.html

# Ou servir localmente
cd docs/assets
npx http-server . -p 8080
```

#### [8. Métricas de Sucesso](./08-metrics.md)
**KPIs de UX | Benchmarks**

**Métricas-chave**:
- Taxa de conclusão do wizard: 85% (meta)
- Tempo médio de criação de solicitação: <15 min
- Satisfação do usuário (NPS): >50
- Taxa de resolução do chatbot: 70%
- Tempo de carregamento: <2s (p95)

---

## 📊 Estatísticas do Design

### Design System
- **Paleta de cores**: 20+ variações
- **Tipografia**: 7 tamanhos (4xl → sm)
- **Spacing scale**: 8 valores (4px → 64px)
- **Componentes shadcn/ui**: 20+
- **Componentes customizados**: 7

### Layouts
- **Personas**: 4 (Empresa, Analista, Auditor, Gestor)
- **Direções de layout**: 9 opções
- **Telas principais**: 15+ screens
- **Responsividade**: Mobile, Tablet, Desktop

### Acessibilidade
- **Idiomas suportados**: 4 (pt-BR, en-US, ar-SA, tr-TR)
- **Compliance**: WCAG 2.1 AA
- **Contraste mínimo**: 4.5:1
- **Navegação por teclado**: 100% coberta

### Assets
- **Wireframes HTML**: 4 protótipos interativos
- **Logo oficial**: HalalSphere_logo.png
- **Variações necessárias**: 7+ (SVG, favicon, app icons)

---

## 🎨 Decisões de Design Principais

### Por que Autoridade Clássica (Verde Halal)?
- Mantém identidade tradicional Halal (verde islâmico)
- Dourado premium reforça qualidade e seriedade
- Transmite confiança institucional necessária para certificação religiosa

### Por que shadcn/ui?
- Componentes headless + Tailwind CSS
- Altamente customizável
- Acessibilidade built-in (Radix UI)
- Type-safe (TypeScript)
- Sem lock-in (você possui o código)

### Por que Wizard de 6 Etapas?
- Divide processo complexo em partes gerenciáveis
- Reduz carga cognitiva
- Permite salvamento parcial
- Taxa de conclusão esperada: 85% (vs. 50% formulário único)

### Por que Kanban para Analistas?
- Visualização clara de 700 processos simultâneos
- Drag-and-drop intuitivo para mudança de fase
- Filtros avançados para foco
- Alinha com workflow de 12 fases do PR 7.1 Rev 21

---

## 🔗 Navegação

- [← Voltar ao Índice Geral](../README.md)
- [PRD v2.0](../01-prd/README.md) - Product Requirements
- [Technical Architecture](../02-technical/README.md) - Stack & Database
- [Implementation Plan](../04-implementation/README.md) - Setup & Mockup
- [Assets (Logo, Wireframes)](../assets/README.md)

---

## 🚀 Quick Start para Designers

### 1. Revisar Design System
Começe por [01-design-system.md](./01-design-system.md) para entender:
- Paleta de cores (#2D5016 verde, #D4AF37 dourado)
- Tipografia (Inter)
- Espaçamento e shadows

### 2. Explorar Wireframes
Abra os protótipos HTML interativos:
```bash
cd docs/assets
open ux-design-directions-v2.html
```

### 3. Entender Personas
Leia [02-layouts.md](./02-layouts.md) para conhecer:
- 4 personas (Empresa, Analista, Auditor, Gestor)
- Necessidades específicas de cada uma
- Layouts recomendados

### 4. Criar Mockups
Usando Figma/Sketch:
1. Importar paleta de cores
2. Configurar tipografia (Inter)
3. Criar componentes base (buttons, inputs, cards)
4. Montar 7 telas principais (seguir mockup plan)

---

## 📝 Próximos Passos

### Design
- [ ] Criar variações do logo (SVG, favicon, app icons)
- [ ] Mockups high-fidelity no Figma (7 telas)
- [ ] Biblioteca de componentes (Figma/Storybook)
- [ ] Design tokens (JSON)

### Desenvolvimento
- [ ] Configurar Tailwind com design system
- [ ] Instalar shadcn/ui components
- [ ] Implementar tema customizado
- [ ] Criar componentes customizados

### Validação
- [ ] Testes de usabilidade (5 usuários/persona)
- [ ] Revisão de acessibilidade (WCAG AA)
- [ ] Teste de cores (contraste)
- [ ] Teste de i18n (4 idiomas)

---

**Última atualização**: 13 de Janeiro de 2026
**Versão**: 1.0
**Status**: ✅ Completo

