# Acessibilidade e i18n

**WCAG 2.1 AA | 4 Idiomas**

---

## 6. Acessibilidade e i18n

### 6.1 Acessibilidade (WCAG 2.1 AA)

**Contraste de Cores**:
- Texto principal (#111827) em fundo branco: 16:1 ✅
- Verde primário (#2D5016) em branco: 8.5:1 ✅
- Dourado secundário (#D4AF37) em branco: 3.2:1 ⚠️ (usar apenas para destaques, não texto)

**Navegação por Teclado**:
- ✅ Todos os botões e links navegáveis com Tab
- ✅ Focus ring visível (outline 3px verde)
- ✅ Esc fecha modais
- ✅ Enter/Space ativam botões

**Screen Readers**:
- ✅ `aria-label` em ícones sem texto
- ✅ `role="status"` para notificações
- ✅ `aria-live="polite"` para atualizações dinâmicas
- ✅ Landmarks HTML5: `<nav>`, `<main>`, `<aside>`

**Formulários**:
- ✅ Labels associados com `for="id"`
- ✅ Mensagens de erro com `aria-describedby`
- ✅ Required fields com `required` + `aria-required="true"`

---

### 6.2 Internacionalização (i18n)

**Idiomas Suportados**:
- 🇧🇷 Português (pt-BR) - padrão
- 🇬🇧 Inglês (en-US)
- 🇸🇦 Árabe (ar-SA) - **RTL layout**
- 🇹🇷 Turco (tr-TR)

**RTL (Right-to-Left) para Árabe**:
```html
<html dir="rtl" lang="ar">
```

**Ajustes CSS para RTL**:
```css
[dir="rtl"] .sidebar {
  right: 0;
  left: auto;
}

[dir="rtl"] .text-align-left {
  text-align: right;
}

[dir="rtl"] .margin-left-4 {
  margin-left: 0;
  margin-right: 1rem;
}
```

**Formatação Localizada**:
```javascript
// Datas
pt-BR: "13/11/2025"
en-US: "11/13/2025"
ar-SA: "٢٠٢٥/١١/١٣"

// Números
pt-BR: "1.234,56"
en-US: "1,234.56"
ar-SA: "١٬٢٣٤٫٥٦"

// Moeda
pt-BR: "R$ 2.400,00"
en-US: "$2,400.00"
ar-SA: "٢٬٤٠٠٫٠٠ ر.س"
tr-TR: "₺2.400,00"
```

---


---

## 🔗 Navegação

- [← Componentes e Padrões](./05-components.md)
- [Wireframes →](./07-wireframes.md)
- [← Voltar ao Índice UX](./README.md)

---

**Última atualização**: 13 de Novembro de 2025

