# 🎨 Design System - IA Service Platform

## Visão Geral

Este documento descreve o sistema de design profissional implementado para a plataforma IA Service, garantindo consistência visual e uma experiência de usuário premium.

---

## 🎨 Paleta de Cores

### Cores Principais

```scss
Primary (Roxo):     #667eea  ⬛ Cor principal da plataforma
Primary Light:      #7c8fef  ⬛ Variação clara
Primary Dark:       #5568d3  ⬛ Variação escura
Accent (Roxo):      #764ba2  ⬛ Cor de destaque
```

### Cores de Status

```scss
Success (Verde):    #48bb78  🟢 Ações bem-sucedidas, estados ativos
Warning (Laranja):  #ed8936  🟠 Alertas, avisos
Error (Vermelho):   #f56565  🔴 Erros, estados críticos
Info (Azul):        #4299e1  🔵 Informações, dicas
```

### Cores de Fundo

```scss
Background:         #f5f7fa  ⬜ Fundo principal
Background Gradient: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%)
Surface:            #ffffff  ⬜ Fundo de cards e componentes
Surface Hover:      #f7fafc  ⬜ Hover state
```

### Cores de Texto

```scss
Text Primary:       #2d3748  ⬛ Texto principal
Text Secondary:     #718096  ⬛ Texto secundário
Text Muted:         #a0aec0  ⬛ Texto esmaecido
Text Inverse:       #ffffff  ⬜ Texto sobre fundos escuros
```

### Cores de Borda

```scss
Border:             #e2e8f0  ⬜ Bordas padrão
Border Dark:        #cbd5e0  ⬜ Bordas em hover/destaque
```

---

## 🔲 Sombras

```scss
Shadow XS:     0 1px 2px rgba(0, 0, 0, 0.04)
Shadow SM:     0 2px 4px rgba(0, 0, 0, 0.06)
Shadow Light:  0 4px 12px rgba(0, 0, 0, 0.08)
Shadow Medium: 0 8px 20px rgba(0, 0, 0, 0.12)
Shadow Heavy:  0 12px 28px rgba(0, 0, 0, 0.16)
Shadow XL:     0 20px 40px rgba(0, 0, 0, 0.2)
```

### Aplicação de Sombras

- **XS/SM**: Ícones, pequenos elementos
- **Light**: Cards em estado normal
- **Medium**: Cards em hover, dropdowns
- **Heavy**: Modais, FAB buttons, elementos elevados
- **XL**: Overlays, pop-ups importantes

---

## 📐 Espaçamento

```scss
XS:   0.25rem (4px)   - Espaçamentos mínimos
SM:   0.5rem  (8px)   - Espaçamentos pequenos
MD:   1rem    (16px)  - Espaçamento padrão
LG:   1.5rem  (24px)  - Espaçamentos generosos
XL:   2rem    (32px)  - Espaçamentos grandes
2XL:  3rem    (48px)  - Espaçamentos extra grandes
```

---

## 🔄 Border Radius

```scss
SM:    8px   - Botões, inputs
MD:    12px  - Cards pequenos
LG:    16px  - Cards principais, FAB
XL:    20px  - Elementos especiais
Full:  9999px - Círculos, pills
```

---

## ⏱️ Transições

```scss
Fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1) - Micro interações
Base: 0.3s cubic-bezier(0.4, 0, 0.2, 1)  - Transições padrão
Slow: 0.5s cubic-bezier(0.4, 0, 0.2, 1)  - Animações complexas
```

### Função Cubic-Bezier

A função `cubic-bezier(0.4, 0, 0.2, 1)` proporciona:
- Início suave
- Aceleração no meio
- Desaceleração no final
- Sensação natural e profissional

---

## 📱 Componentes

### Cards de Estatísticas

**Características:**
- Border radius: 16px
- Sombra: Light (normal) → Medium (hover)
- Animação de elevação: translateY(-8px)
- Barra superior colorida em hover
- Ícones em wrappers com gradientes

**Estados:**
```scss
Normal: box-shadow: 0 4px 12px rgba(0,0,0,0.06)
Hover:  box-shadow: 0 12px 24px rgba(0,0,0,0.12)
        transform: translateY(-8px)
```

### Botões

**Icon Buttons:**
- Hover: background-color com alpha 0.1
- Transform: scale(1.05)
- Transition: 0.3s

**Raised Buttons:**
- Hover: translateY(-2px)
- Shadow: Light → Medium
- Gradiente em botões primários

**FAB (Floating Action Button):**
- Border radius: 16px
- Hover: translateY(-3px) + shadow aumentada
- Gradiente rosa-vermelho para accent

### Tabs

**Normal:**
- Font weight: 500
- Min width: 140px

**Hover:**
- Background: rgba(102, 126, 234, 0.05)

**Active:**
- Color: var(--primary-color)
- Font weight: 600
- Indicador com gradiente (3px de altura)

### Forms

**Input Fields:**
- Border radius: 8px
- Focus: border azul, 2px de largura
- Transition suave

**Select/Combobox:**
- Mesmo estilo dos inputs
- Dropdown com shadow-medium

---

## 🎭 Animações

### Entrada de Elementos

```scss
// Cards
@keyframes cardEntrance {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

### Fade In Geral

```scss
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### Slide Up

```scss
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Pulse (Logo)

```scss
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

---

## 📊 Z-Index Hierarchy

```scss
Dropdown:       1000
Sticky:         1020
Fixed:          1030
Modal Backdrop: 1040
Modal:          1050
Popover:        1060
Tooltip:        1070
```

---

## 🎯 Tipografia

### Família de Fontes

```scss
Primary: 'Roboto', 'Helvetica Neue', sans-serif
```

### Pesos de Fonte

```scss
Regular: 400 - Texto normal
Medium:  500 - Labels, tabs
Semibold: 600 - Títulos de cards, tabs ativas
Bold:    700 - Números de estatísticas
```

### Tamanhos de Texto

**Números de Estatísticas:**
- Desktop: 2.5rem (40px) - Bold
- Mobile: 2rem (32px) - Bold

**Títulos de Cards:**
- Desktop: 1.5rem (24px) - Semibold
- Mobile: 1.25rem (20px) - Semibold

**Labels:**
- Padrão: 0.95rem (15.2px) - Medium
- Small: 0.875rem (14px) - Medium

**Corpo de Texto:**
- Normal: 1rem (16px) - Regular
- Small: 0.875rem (14px) - Regular

**Letter Spacing:**
- Títulos: -0.3px a -0.5px (mais apertado)
- Labels: 0.3px (mais espaçado)

---

## 📐 Grid System

### Dashboard Grid

```scss
Grid: auto-fit
Min width: 280px
Max width: 1fr
Gap: 2rem (desktop)
Gap: 1rem (mobile)
```

### Breakpoints

```scss
Desktop:  > 1024px
Tablet:   768px - 1024px
Mobile:   < 768px
Small:    < 480px
```

---

## 🎨 Gradientes

### Gradiente Principal (Header)

```scss
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Gradiente de Fundo

```scss
background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%);
```

### Gradiente de Texto (Números)

```scss
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

### Gradiente FAB Accent

```scss
background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
```

### Gradientes de Snackbar

```scss
Success: linear-gradient(135deg, #48bb78 0%, #38b2ac 100%)
Error:   linear-gradient(135deg, #f56565 0%, #fc8181 100%)
Warning: linear-gradient(135deg, #ed8936 0%, #f6ad55 100%)
```

---

## 🔧 Classes Utilitárias

### Alinhamento de Texto

```scss
.text-center - Centralizado
.text-left   - Esquerda
.text-right  - Direita
```

### Margem

```scss
.mb-1 - margin-bottom: 8px
.mb-2 - margin-bottom: 16px
.mb-3 - margin-bottom: 24px
.mb-4 - margin-bottom: 32px

.mt-1 - margin-top: 8px
.mt-2 - margin-top: 16px
.mt-3 - margin-top: 24px
.mt-4 - margin-top: 32px
```

### Padding

```scss
.p-1 - padding: 8px
.p-2 - padding: 16px
.p-3 - padding: 24px
.p-4 - padding: 32px
```

### Responsivo

```scss
.mobile-hidden      - display: none em < 768px
.mobile-full-width  - width: 100% em mobile
.mobile-stack       - flex-direction: column em mobile
.mobile-padding     - padding reduzido em < 480px
.mobile-text-small  - fonte menor em mobile
```

### Animações

```scss
.fade-in  - Animação de fade in
.slide-in - Animação de slide lateral
.scale-in - Animação de escala
```

---

## ♿ Acessibilidade

### Contraste de Cores

- Todos os textos seguem WCAG AA (mínimo 4.5:1)
- Textos grandes seguem WCAG AAA (7:1)

### Estados de Focus

```scss
outline: 2px solid var(--primary-color)
outline-offset: 2px
```

### Estados Visuais

- ✅ Todos os elementos interativos têm estados claros
- ✅ Feedback visual em todas as ações
- ✅ Loading states visíveis
- ✅ Error states destacados

---

## 📱 Responsividade

### Desktop (> 1024px)

- Layout amplo: max-width 1400px
- Grid de 4 colunas para estatísticas
- Espaçamentos generosos (2rem)
- Animações completas

### Tablet (768px - 1024px)

- Layout médio: max-width 100%
- Grid adaptativo (2-3 colunas)
- Espaçamentos médios (1.5rem)
- Animações mantidas

### Mobile (< 768px)

- Layout compacto
- Grid de 2 colunas ou 1 coluna
- Espaçamentos reduzidos (1rem)
- Animações suavizadas
- Texto menor

### Small (< 480px)

- Grid de 1 coluna
- Botões adaptados
- Animações de hover desabilitadas
- Focus em usabilidade

---

## 🎯 Best Practices

### Performance

- ✅ Uso de transform para animações (GPU accelerated)
- ✅ Will-change aplicado onde necessário
- ✅ Transições apenas em propriedades específicas
- ✅ Lazy loading de componentes

### Manutenibilidade

- ✅ Variáveis CSS para fácil customização
- ✅ BEM-like naming conventions
- ✅ Código modular e reutilizável
- ✅ Comentários descritivos

### Compatibilidade

- ✅ Prefixos vendor automáticos
- ✅ Fallbacks para navegadores antigos
- ✅ Progressive enhancement
- ✅ Graceful degradation

---

## 🚀 Uso do Design System

### Implementando um Novo Componente

1. **Escolha as cores apropriadas** da paleta
2. **Use as variáveis CSS** definidas
3. **Aplique os border radius** corretos
4. **Adicione sombras** de acordo com a hierarquia
5. **Implemente transições** suaves
6. **Teste responsividade** em todos os breakpoints
7. **Valide acessibilidade** (contraste, focus)

### Exemplo Prático

```scss
.my-new-component {
  background-color: var(--surface-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-light);
  padding: var(--spacing-lg);
  transition: all var(--transition-base);
  
  &:hover {
    box-shadow: var(--shadow-medium);
    transform: translateY(-2px);
  }
  
  .title {
    color: var(--text-primary);
    font-weight: 600;
    font-size: 1.25rem;
  }
  
  .description {
    color: var(--text-secondary);
    font-size: 0.95rem;
  }
}
```

---

## 📝 Changelog

### Versão 1.0.0 (Atual)

- ✨ Sistema de design completo implementado
- 🎨 Paleta de cores profissional
- 🔲 Sombras e elevações refinadas
- ⏱️ Sistema de transições suaves
- 📐 Grid system responsivo
- 🎭 Biblioteca de animações
- ♿ Melhorias de acessibilidade
- 📱 Design mobile-first

---

**Design System criado com 💜 para IA Service Platform**

