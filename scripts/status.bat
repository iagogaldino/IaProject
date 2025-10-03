@echo off
REM Script para verificar status dos serviços do IaProject no Windows

echo 📊 Status dos Serviços - IaProject
echo ==================================

REM Verificar se containers estão rodando
echo 🐳 Containers:
docker-compose ps

echo.
echo 🌐 Portas disponíveis:
echo    • App Frontend (Ionic): http://localhost:4200
echo    • App Backend API: http://localhost:3000
echo    • IA Frontend (Admin): http://localhost:4201
echo    • IA Backend API: http://localhost:3001
echo    • Database: localhost:5432

echo.
echo 📝 Comandos úteis:
echo    • Ver logs: docker-compose logs -f [serviço]
echo    • Reiniciar serviço: docker-compose restart [serviço]
echo    • Parar tudo: docker-compose down

pause
