# Componentes e Padrões

**shadcn/ui | Componentes Customizados | Design Patterns**

---

## 5. Componentes e Padrões

### 5.1 Botões

**Tamanhos**:
```css
/* Small */
.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

/* Medium (padrão) */
.btn {
  padding: 10px 20px;
  font-size: 14px;
}

/* Large */
.btn-lg {
  padding: 12px 24px;
  font-size: 16px;
}
```

**Variantes**:
```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-outline">Outline</button>
<button class="btn btn-ghost">Ghost</button>
<button class="btn btn-danger">Danger</button>
```

**Estados**:
- `:hover` - Escurece 10%
- `:active` - Escurece 20% + scale(0.98)
- `:disabled` - Opacity 50% + cursor not-allowed
- `:loading` - Spinner + texto "Carregando..."

---

### 5.2 Form Inputs

**Text Input**:
```html
<div class="form-group">
  <label class="form-label required">CNPJ da Empresa</label>
  <input type="text" class="form-input" placeholder="00.000.000/0000-00">
  <span class="form-hint">Apenas números</span>
</div>
```

**Select**:
```html
<select class="form-select">
  <option>Selecione...</option>
  <option>Opção 1</option>
</select>
```

**Textarea**:
```html
<textarea class="form-textarea" rows="4"></textarea>
```

**Validação**:
```html
<!-- Sucesso -->
<input class="form-input is-valid">
<span class="form-success">✓ CNPJ válido</span>

<!-- Erro -->
<input class="form-input is-invalid">
<span class="form-error">⚠️ CNPJ inválido</span>
```

---

### 5.3 Cards

**Card Padrão**:
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Título do Card</h3>
  </div>
  <div class="card-body">
    Conteúdo...
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">Ação</button>
  </div>
</div>
```

**Card Clicável** (para seleção):
```html
<div class="card card-selectable">
  <!-- Adiciona border highlight no hover -->
</div>

<div class="card card-selectable is-selected">
  <!-- Adiciona background verde claro -->
</div>
```

---

### 5.4 Status Badges

```html
<span class="badge badge-pending">Pendente</span>
<span class="badge badge-warning">Revisão</span>
<span class="badge badge-success">Aprovado</span>
<span class="badge badge-error">Rejeitado</span>
<span class="badge badge-info">Em Auditoria</span>
```

---

### 5.5 Tabelas

**Tabela Compacta** (para alto volume):
```html
<table class="table table-compact">
  <thead>
    <tr>
      <th>Protocolo</th>
      <th>Empresa</th>
      <th>Status</th>
      <th>Data</th>
      <th>Ações</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="font-mono">HAL-2025-001234</td>
      <td>XYZ Alimentos</td>
      <td><span class="badge badge-warning">Revisão</span></td>
      <td>10/11/2025</td>
      <td><a href="#">Revisar →</a></td>
    </tr>
  </tbody>
</table>
```

**Comportamento**:
- Hover em linha: Background cinza claro
- Linha clicável: Cursor pointer + transição suave
- Zebra striping: Opcional, ativar com `.table-striped`

---

### 5.6 Kanban Cards

```html
<div class="kanban-card">
  <div class="kanban-card-protocol">HAL-2025-001234</div>
  <div class="kanban-card-company">XYZ Alimentos Ltda</div>
  <div class="kanban-card-type">C1 - Alimentos</div>
  <div class="kanban-card-footer">
    <div class="avatar">JS</div>
    <span class="kanban-card-date">Há 3 dias</span>
  </div>
</div>
```

**Priorização Visual**:
```html
<div class="kanban-card priority-high">
  <!-- Border-left vermelho -->
</div>

<div class="kanban-card priority-medium">
  <!-- Border-left amarelo -->
</div>
```

---

### 5.7 Chat Messages

**Mensagem da IA**:
```html
<div class="chat-message ai">
  <div class="message-avatar">AI</div>
  <div class="message-content">
    <div class="message-bubble">
      Olá! Como posso ajudar?
    </div>
    <div class="message-timestamp">10:23</div>
  </div>
</div>
```

**Mensagem do Usuário**:
```html
<div class="chat-message user">
  <div class="message-avatar">EU</div>
  <div class="message-content">
    <div class="message-bubble">
      Preciso de certificação
    </div>
    <div class="message-timestamp">10:24</div>
  </div>
</div>
```

**Auto-filled Badge**:
```html
<div class="auto-filled-badge">
  ✓ Categoria identificada
</div>
```

---


---

## 🔗 Navegação

- [← Wizard com IA](./04-wizard.md)
- [Acessibilidade e i18n →](./06-accessibility.md)
- [← Voltar ao Índice UX](./README.md)

---

**Última atualização**: 13 de Novembro de 2025

