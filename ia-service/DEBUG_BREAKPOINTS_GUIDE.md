# 🐛 Guia de Solução - Breakpoints Não Vinculados

## ❌ Problema: "Unbound breakpoint"

Quando você vê a mensagem **"Unbound breakpoint"**, significa que o debugger não consegue mapear os breakpoints para o código TypeScript.

## ✅ Soluções

### 1. **Solução Rápida - Use a Configuração Corrigida**

```bash
# 1. Pare qualquer servidor rodando
# 2. No VS Code, vá para Run and Debug (Ctrl+Shift+D)
# 3. Selecione "Debug Backend (Node.js)" 
# 4. Pressione F5
```

### 2. **Solução Alternativa - Script de Debug**

```bash
cd ia-backend

# Usar o script de debug otimizado
npm run debug
```

### 3. **Solução Manual - Terminal**

```bash
cd ia-backend

# Iniciar com debug e source maps
node --inspect=9229 -r ts-node/register src/index.ts
```

## 🔧 Configurações Implementadas

### **Arquivos Criados/Modificados:**

1. **`.vscode/launch.json`** - Configurações de debug corrigidas
2. **`ia-backend/tsconfig.debug.json`** - Configuração TypeScript otimizada para debug
3. **`ia-backend/debug-server.js`** - Script de debug personalizado
4. **`ia-backend/package.json`** - Novos scripts de debug

### **Configurações Chave:**

```json
{
  "sourceMaps": true,
  "TS_NODE_SOURCE_MAPS": "true",
  "TS_NODE_TRANSPILE_ONLY": "false",
  "resolveSourceMapLocations": [
    "${workspaceFolder}/ia-backend/src/**",
    "!**/node_modules/**"
  ]
}
```

## 🎯 Como Testar se Funcionou

### **1. Teste Básico:**
```typescript
// No arquivo chatController.ts, adicione um breakpoint na linha 10
export class ChatController {
  async createChat(req: Request, res: Response) {
    debugger; // ⭐ Breakpoint aqui
    console.log('Creating chat...');
    // ... resto do código
  }
}
```

### **2. Inicie o Debug:**
- Pressione `F5` no VS Code
- Ou use `npm run debug` no terminal

### **3. Verifique:**
- O breakpoint deve aparecer como **vermelho sólido** (não tracejado)
- Quando o código for executado, deve parar no breakpoint

## 🔍 Troubleshooting

### **Se ainda não funcionar:**

#### **Opção 1: Rebuild e Debug**
```bash
cd ia-backend
npm run build
npm run debug:attach
```

#### **Opção 2: Debug com Código Compilado**
1. Selecione "Debug Backend (Compiled)" no VS Code
2. Pressione F5

#### **Opção 3: Chrome DevTools**
```bash
# 1. Inicie o servidor com debug
npm run debug

# 2. Abra Chrome e vá para: chrome://inspect
# 3. Clique em "Open dedicated DevTools for Node"
```

### **Verificações Importantes:**

1. **Source Maps Habilitados:**
   ```bash
   # Verificar se tsconfig.debug.json existe
   ls ia-backend/tsconfig.debug.json
   ```

2. **Dependências Instaladas:**
   ```bash
   npm install ts-node typescript
   ```

3. **Arquivos TypeScript:**
   ```bash
   # Verificar se os arquivos .ts estão na pasta src
   ls ia-backend/src/
   ```

## 📋 Checklist de Debug

- [ ] VS Code está usando a configuração "Debug Backend (Node.js)"
- [ ] Breakpoint está em código TypeScript (não em node_modules)
- [ ] Servidor está rodando em modo debug
- [ ] Source maps estão habilitados
- [ ] tsconfig.debug.json existe
- [ ] Dependências estão instaladas

## 🚀 Configurações Recomendadas

### **Para Desenvolvimento Diário:**
```bash
# Use esta configuração para debug contínuo
npm run debug
```

### **Para Debug Específico:**
```bash
# Use VS Code com "Debug Backend with Nodemon"
# Para auto-reload + breakpoints
```

### **Para Produção:**
```bash
# Compile primeiro
npm run build

# Depois debug do código compilado
npm run debug:attach
```

## 🆘 Se Nada Funcionar

### **Reset Completo:**
```bash
# 1. Pare todos os processos
# 2. Limpe cache
rm -rf node_modules
npm install

# 3. Recompile
npm run build

# 4. Teste debug básico
npm run debug
```

### **Debug Manual:**
```bash
# Use este comando para debug manual
node --inspect-brk=9229 -r ts-node/register src/index.ts
```

---

## ✅ Resumo da Solução

**O problema foi resolvido com:**

1. ✅ **Source maps habilitados** corretamente
2. ✅ **Configuração TypeScript** otimizada para debug
3. ✅ **Script de debug** personalizado
4. ✅ **Configurações VS Code** corrigidas
5. ✅ **Múltiplas opções** de debug disponíveis

**Agora os breakpoints devem funcionar perfeitamente!** 🎉
