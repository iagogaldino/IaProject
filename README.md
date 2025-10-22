# 🚀 IaProject

Sistema híbrido de IA com backend e frontend integrados, incluindo processamento de documentos e agentes conversacionais.

## 🏗️ Arquitetura

O projeto é composto por múltiplos serviços:

- **App User**: Aplicação principal com backend (Node.js/TypeScript) e frontend (Ionic/Angular)
- **IA Service**: Serviço de IA com backend e frontend administrativo
- **Extractor Service**: Serviço para extração e processamento de documentos
- **Database**: PostgreSQL e MongoDB para persistência de dados

## 🚀 Quick Start para Novos Desenvolvedores

### Pré-requisitos
- ✅ Docker Desktop
- ✅ Git
- ✅ Chave da OpenAI

### Setup Automático

#### Windows
```powershell
# Clone o repositório
git clone https://github.com/iagogaldino/IaProject.git
cd IaProject

# Execute o setup automático
.\scripts\setup-windows.ps1
```

#### Linux/Mac
```bash
# Clone o repositório
git clone https://github.com/iagogaldino/IaProject.git
cd IaProject

# Execute o setup automático
chmod +x scripts/*.sh
./scripts/setup-dev-data.sh
```

### Setup Manual
```bash
# 1. Configure as variáveis de ambiente (se necessário)
# As configurações padrão já estão no docker-compose.yml
# Para personalizar, edite as variáveis diretamente no docker-compose.yml

# 2. Inicie os serviços
docker-compose up -d

# 3. Verifique se está funcionando
docker-compose ps
```

## 📊 Acessos

Após o setup, você terá acesso a:

- 🌐 **App Frontend**: http://localhost:4200
- 🌐 **IA Frontend (Admin)**: http://localhost:4201
- 🔧 **App Backend**: http://localhost:3000
- 🔧 **IA Backend**: http://localhost:3001
- 🗄️ **PostgreSQL Admin**: http://localhost:8080
- 🗄️ **MongoDB Admin**: http://localhost:8081

## 📚 Documentação

- 📖 **[Guia para Novos Desenvolvedores](SETUP-NOVO-DESENVOLVEDOR.md)** - Setup completo passo a passo
- 🔧 **[Guia de Desenvolvimento](README-DEVELOPMENT.md)** - Configuração avançada e troubleshooting
- 🐳 **[Comandos Docker](DOCKER_COMMANDS.md)** - Comandos úteis para desenvolvimento

## 🔧 Comandos Úteis

### Gerenciamento de Serviços
```bash
# Iniciar todos os serviços
docker-compose up -d

# Parar todos os serviços
docker-compose down

# Ver logs
docker-compose logs -f

# Reiniciar um serviço específico
docker-compose restart ia-backend
```

### Backup e Restore de Dados
```bash
# Exportar dados do MongoDB
./scripts/mongodb-export.sh

# Importar dados
./scripts/mongodb-import.sh ./database/mongodb-exports/[pasta-com-dados]
```

## 🏗️ Estrutura do Projeto

```
IaProject/
├── app-user/                    # Aplicação principal
│   ├── app-backend/            # Backend Node.js/TypeScript
│   └── app-frontend/           # Frontend Ionic/Angular
├── ia-service/                 # Serviço de IA
│   ├── ia-backend/            # Backend de IA
│   └── ia-frontend/           # Frontend administrativo
├── extractor-service/          # Serviço de extração
├── database/                   # Scripts de banco de dados
├── scripts/                    # Scripts de automação
└── docker-compose.yml          # Configuração Docker
```

## 🔐 Credenciais

### PostgreSQL
- **Usuário**: dev
- **Senha**: devpass
- **Database**: app_db

### MongoDB
- **Usuário Admin**: admin
- **Senha Admin**: adminpass
- **Database**: db-ia

## 🚨 Troubleshooting

### Problemas Comuns
1. **Porta em uso**: Verifique se as portas 3000, 3001, 4200, 4201, 5432, 27018 estão livres
2. **Docker não inicia**: Verifique se o Docker Desktop está rodando
3. **Chave OpenAI inválida**: Configure uma chave válida no `docker-compose.yml` na seção `ia-backend`
4. **MongoDB não conecta**: Execute `docker-compose restart mongodb`

### Logs e Debug
```bash
# Ver logs de todos os serviços
docker-compose logs

# Ver logs de um serviço específico
docker-compose logs ia-backend

# Verificar status dos containers
docker-compose ps
```

## 🤝 Contribuindo

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença ISC. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Se você encontrar problemas:

1. Verifique a [documentação](SETUP-NOVO-DESENVOLVEDOR.md)
2. Consulte as [issues](https://github.com/iagogaldino/IaProject/issues) existentes
3. Abra uma nova issue com detalhes do problema

---

**Desenvolvido com ❤️ pela equipe IaProject**
