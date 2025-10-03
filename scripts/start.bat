@echo off
REM Script para iniciar todos os serviços do IaProject no Windows

echo 🚀 Iniciando IaProject - Sistema de IA Municipal
echo ==================================================

REM Verificar se Docker está rodando
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker não está rodando. Por favor, inicie o Docker Desktop.
    pause
    exit /b 1
)

REM Verificar se docker-compose está disponível
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ docker-compose não está instalado.
    pause
    exit /b 1
)

REM Criar rede se não existir
echo 📡 Configurando rede...
docker network create iaproject-network 2>nul || echo Rede já existe

REM Iniciar serviços
echo 🐳 Iniciando containers...
docker-compose up -d --build

REM Aguardar serviços ficarem prontos
echo ⏳ Aguardando serviços ficarem prontos...
timeout /t 10 /nobreak >nul

REM Verificar status dos serviços
echo 📊 Status dos serviços:
docker-compose ps

echo.
echo ✅ Serviços iniciados com sucesso!
echo.
echo 🌐 Acesse os serviços:
echo    • App Frontend (Ionic): http://localhost:4200
echo    • App Backend API: http://localhost:3000
echo    • IA Frontend (Admin): http://localhost:4201
echo    • IA Backend API: http://localhost:3001
echo    • Database: localhost:5432
echo.
echo 📝 Para parar os serviços: docker-compose down
echo 📝 Para ver logs: docker-compose logs -f [serviço]

pause
