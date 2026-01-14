# Design System

**Paleta de Cores | Tipografia | Espaçamento | Shadows**

---

## 1. Design System

### 1.1 Paleta de Cores - Tema Autoridade Clássica ⭐

**Tema escolhido**: Autoridade Clássica
**Justificativa**: Mantém identidade Halal original, transmite seriedade institucional necessária para certificação religiosa, e o dourado premium reforça qualidade.

```css
:root {
  /* Primary Colors */
  --primary: #2D5016;           /* Verde Halal tradicional */
  --primary-dark: #1E4620;      /* Hover/Active states */
  --primary-light: #3D6A1E;     /* Backgrounds sutis */

  /* Secondary Colors */
  --secondary: #D4AF37;         /* Dourado premium */
  --secondary-dark: #B8933D;    /* Hover states */
  --secondary-light: #E8C468;   /* Highlights */

  /* Semantic Colors */
  --success: #10B981;           /* Verde sucesso (Tailwind) */
  --warning: #F59E0B;           /* Laranja alerta */
  --error: #EF4444;             /* Vermelho erro */
  --info: #3B82F6;              /* Azul informação */

  /* Neutrals */
  --bg-white: #FFFFFF;
  --bg-gray: #F8F9FA;
  --bg-gray-dark: #F3F4F6;
  --border: #E5E7EB;
  --border-dark: #D1D5DB;

  /* Text */
  --text-primary: #111827;
  --text-secondary: #6B7280;
  --text-muted: #9CA3AF;
  --text-disabled: #D1D5DB;
}
```

**Status Badges**:
```css
.status-pending {
  background: #E0E7FF;
  color: #3730A3;
}

.status-warning {
  background: #FEF3C7;
  color: #92400E;
}

.status-success {
  background: #D1FAE5;
  color: #065F46;
}

.status-error {
  background: #FEE2E2;
  color: #991B1B;
}
```

---

### 1.2 Tipografia

**Fonte Principal**: Inter (Google Fonts)
**Fallbacks**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

**Scale**:
```css
/* Headings */
--text-4xl: 36px;   /* Page titles */
--text-3xl: 28px;   /* Section headers */
--text-2xl: 24px;   /* Card headers */
--text-xl: 20px;    /* Sub-headers */
--text-lg: 18px;    /* Large body */

/* Body */
--text-base: 16px;  /* Base body text */
--text-sm: 14px;    /* Secondary text */
--text-xs: 12px;    /* Captions, labels */
--text-2xs: 11px;   /* Tiny text (table headers) */

/* Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

**Monospace** (para protocolos, códigos):
```css
--font-mono: 'JetBrains Mono', 'Courier New', monospace;
```

---

### 1.3 Spacing System

Baseado em múltiplos de 4px (Tailwind-like):

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

---

### 1.4 Border Radius

```css
--radius-sm: 4px;    /* Small elements */
--radius-md: 6px;    /* Buttons, inputs */
--radius-lg: 8px;    /* Cards */
--radius-xl: 12px;   /* Large cards */
--radius-full: 9999px; /* Pills, avatars */
```

---

### 1.5 Shadows

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 1px 3px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 10px 15px rgba(0, 0, 0, 0.15);
```

---


---

## 🔗 Navegação

- [← Voltar ao Índice UX](./README.md)
- [Layouts por Persona →](./02-layouts.md)
- [Índice Geral da Documentação](../README.md)

---

**Última atualização**: 13 de Novembro de 2025

