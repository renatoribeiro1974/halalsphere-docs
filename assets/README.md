# Assets do HalalSphere

**Logos | Wireframes | Imagens de Referência**

---

## 🎨 Logo

### Arquivo Principal
- **[HalalSphere_logo.png](./HalalSphere_logo.png)** (852 KB, alta resolução)

### Descrição do Logo

**Símbolo**: Globo com crescente lunar integrado
- 🌍 **Globo com grid** - Representa alcance global e conexões digitais
- 🌙 **Crescente** - Símbolo islâmico, referência à certificação Halal
- **Verde** (#00843D aprox.) - Cor tradicional do Islã

**Tipografia**:
- **HalalSphere** - Fonte moderna, clean, profissional
- **Tagline**: "O ecossistema digital da certificação Halal"

---

## 📐 Guia de Uso do Logo

### Versões Necessárias (a criar)

Para uso no projeto, recomendo criar as seguintes variações:

#### 1. Logo Completo (atual)
```
[Símbolo]
HalalSphere
O ecossistema digital da certificação Halal
```
**Uso**: Landing page, apresentações, materiais de marketing

#### 2. Logo Horizontal
```
[Símbolo] HalalSphere
```
**Uso**: Header do sistema, emails, documentos

#### 3. Logo Vertical
```
    [Símbolo]
  HalalSphere
```
**Uso**: Sidebar, mobile app

#### 4. Símbolo Isolado
```
[Símbolo apenas]
```
**Uso**: Favicon, app icon, watermark

#### 5. Versões de Cor
- **Verde sobre branco** (atual) - Uso principal
- **Branco sobre verde** - Para fundos escuros
- **Cinza escuro** - Para documentos monocromáticos
- **Outline** - Para casos especiais

---

## 🎨 Paleta de Cores do Logo

Com base no logo, sugerimos ajustar a paleta do Design System:

```css
/* Logo */
--logo-green: #00843D;        /* Verde do símbolo */
--logo-text: #1E293B;         /* Azul escuro do texto */

/* Design System atual (ajustado) */
--primary: #00843D;           /* Verde do logo */
--primary-dark: #006B32;      /* Hover/active */
--primary-light: #4CAF50;     /* Background leve */

--secondary: #D4AF37;         /* Dourado premium (mantido) */
--accent: #8B4513;            /* Marrom terracota (mantido) */
--neutral: #F5F5DC;           /* Bege claro (mantido) */
--text: #1E293B;              /* Azul escuro do logo */
```

---

## 📏 Especificações Técnicas

### Tamanhos Recomendados

| Uso | Tamanho | Formato |
|-----|---------|---------|
| **Landing page** | 300-400px largura | PNG/SVG |
| **Header desktop** | 180-220px largura | SVG |
| **Header mobile** | 120-150px largura | SVG |
| **Favicon** | 32×32, 48×48 | PNG/ICO |
| **App icon (PWA)** | 192×192, 512×512 | PNG |
| **Email** | 200px largura | PNG (fallback) |
| **Documentos PDF** | 150-200px largura | PNG alta resolução |

### Espaçamento

- **Área de proteção**: Mínimo 1x altura do símbolo em todos os lados
- **Tamanho mínimo**: 80px de largura (logo horizontal)

---

## 🖼️ Wireframes Interativos

Arquivos HTML com protótipos visuais:

- **[ux-color-themes.html](./ux-color-themes.html)** - 4 temas de cor comparáveis
- **[ux-design-directions-v2.html](./ux-design-directions-v2.html)** - 9 direções de layout
- **[ux-design-high-volume-solutions.html](./ux-design-high-volume-solutions.html)** - Soluções para 600-700 processos
- **[ux-journey-wizard-ai.html](./ux-journey-wizard-ai.html)** - Wizard de 9 etapas com IA

**Como usar**:
```bash
# Abrir no browser
open ux-color-themes.html

# Ou servir localmente
npx http-server . -p 8080
```

---

## 📦 Assets a Criar

### Logo (prioridade alta)
- [ ] Logo horizontal (SVG)
- [ ] Logo vertical (SVG)
- [ ] Símbolo isolado (SVG)
- [ ] Favicon (32×32, 48×48 PNG + ICO)
- [ ] App icons PWA (192×192, 512×512 PNG)
- [ ] Logo branco (para fundos escuros)
- [ ] Logo monocromático (cinza)

### Imagens do Sistema
- [ ] Ilustrações para wizard (9 etapas)
- [ ] Empty states (listas vazias)
- [ ] Error states (404, 500)
- [ ] Ícones customizados (se necessário)

### Marketing
- [ ] Banner para landing page
- [ ] Screenshots do sistema (7 telas)
- [ ] Social media cards (OG image)

---

## 🎨 Ferramentas Recomendadas

### Para criar variações do logo:
- **Figma** (recomendado) - Design colaborativo
- **Adobe Illustrator** - Se tiver acesso
- **Inkscape** (gratuito) - Alternativa open-source

### Para converter PNG → SVG:
- **Vectorizer.ai** - AI-powered, boa qualidade
- **Adobe Illustrator** - Image Trace
- **Inkscape** - Trace Bitmap

### Para gerar favicons:
- **RealFaviconGenerator** (realfavicongenerator.net)
- Gera todos os tamanhos automaticamente

---

## 🔗 Navegação

- [← Voltar à Documentação](../README.md)
- [UX Design Guide](../ux-design-guide.md)
- [Implementation Plan](../04-implementation/README.md)

---

**Última atualização**: 13 de Novembro de 2025
