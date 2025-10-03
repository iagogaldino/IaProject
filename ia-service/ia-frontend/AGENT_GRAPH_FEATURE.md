# Rede de Agentes - Visualização em Grafo

## 📊 Visão Geral

A funcionalidade de **Rede de Agentes** permite visualizar as conexões e comunicação entre agentes de IA em um diagrama interativo, similar ao design mostrado na imagem de referência.

## 🎯 Funcionalidades

### Visualização de Conexões
- **Nós dos Agentes**: Cada agente é representado por um nó circular com ícone de robô
- **Conexões de Comunicação**: Linhas verdes tracejadas mostram quais agentes podem se comunicar
- **Acesso ao Banco de Dados**: Linhas laranja sólidas indicam agentes com acesso ao banco
- **Nó do Banco**: Nó especial laranja representando o banco de dados compartilhado

### Interatividade
- **Arrastar e Soltar**: Nós podem ser movidos livremente pelo usuário
- **Simulação de Força**: Layout automático com física de partículas
- **Tooltips**: Informações detalhadas ao passar o mouse sobre os nós
- **Reset de Layout**: Botão para reorganizar automaticamente o grafo

### Design Responsivo
- **Tema Escuro**: Fundo escuro com grade pontilhada similar ao design de referência
- **Cores Intuitivas**: 
  - Azul para agentes ativos
  - Cinza para agentes inativos
  - Verde para conexões de comunicação
  - Laranja para acesso ao banco de dados

## 🛠️ Implementação Técnica

### Componentes Criados

1. **`AgentGraphComponent`**: Componente principal do grafo
   - Usa D3.js para renderização SVG
   - Simulação de força para layout automático
   - Interações drag & drop

2. **`AgentGraphPageComponent`**: Página completa do grafo
   - Carrega dados dos agentes
   - Gerencia estado de loading/erro
   - Header com navegação

### Tecnologias Utilizadas

- **D3.js**: Biblioteca para visualização de dados
- **Angular Material**: Componentes de UI
- **TypeScript**: Tipagem estática
- **SCSS**: Estilização avançada

### Estrutura de Dados

```typescript
interface GraphNode {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  canCommunicateWith: string[];
}

interface GraphLink {
  source: string;
  target: string;
  type: 'communication' | 'database';
}
```

## 🚀 Como Usar

### Acesso
1. No dashboard principal, clique no ícone de árvore (🌳) no header
2. Ou navegue diretamente para `/graph`

### Controles
- **Arrastar**: Clique e arraste os nós para reposicioná-los
- **Atualizar**: Botão de refresh para recarregar dados
- **Reset Layout**: Botão para reorganizar automaticamente

### Legenda
- **Linha Verde Tracejada**: Comunicação entre agentes
- **Linha Laranja Sólida**: Acesso ao banco de dados
- **Nó Azul**: Agente ativo
- **Nó Cinza**: Agente inativo
- **Nó Laranja**: Banco de dados

## 📱 Responsividade

- **Desktop**: Layout completo com todas as funcionalidades
- **Tablet**: Layout adaptado com controles otimizados
- **Mobile**: Interface simplificada mantendo funcionalidade

## 🎨 Personalização

### Cores
As cores podem ser personalizadas através das variáveis CSS:
```scss
--primary-color: #2196F3;      // Azul para agentes ativos
--success-color: #4CAF50;      // Verde para conexões
--warning-color: #FF9800;      // Laranja para banco de dados
```

### Tamanhos
```scss
--node-radius: 30px;           // Tamanho dos nós
--link-distance: 150px;        // Distância entre nós
--force-strength: -300;         // Força de repulsão
```

## 🔧 Configuração

### Dependências
```json
{
  "d3": "^7.8.5",
  "@types/d3": "^3.5.0"
}
```

### Rotas
```typescript
{ path: 'graph', component: AgentGraphPageComponent }
```

## 🐛 Solução de Problemas

### Grafo não aparece
1. Verifique se há agentes cadastrados
2. Confirme se o backend está funcionando
3. Verifique o console para erros

### Performance lenta
1. Reduza o número de agentes simultâneos
2. Ajuste as forças da simulação
3. Use `requestAnimationFrame` para animações

### Layout quebrado
1. Use o botão "Reset Layout"
2. Recarregue a página
3. Verifique se o container tem dimensões definidas

## 🚀 Próximas Melhorias

- [ ] Filtros por status de agente
- [ ] Zoom e pan no grafo
- [ ] Animações de conexão em tempo real
- [ ] Exportação do grafo como imagem
- [ ] Métricas de comunicação em tempo real
- [ ] Agrupamento de agentes por categoria

## 📝 Notas de Desenvolvimento

- O grafo é renderizado usando SVG para melhor performance
- A simulação de força é otimizada para até 50 agentes
- O layout é responsivo e funciona em todos os dispositivos
- As interações são suaves e intuitivas
