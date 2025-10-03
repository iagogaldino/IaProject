@echo off
REM Script para parar todos os serviços do IaProject no Windows

echo 🛑 Parando IaProject - Sistema de IA Municipal
echo ==============================================

REM Parar e remover containers
echo 🐳 Parando containers...
docker-compose down

echo ✅ Serviços parados com sucesso!
echo.
echo 💡 Dicas:
echo    • Para remover volumes: docker-compose down -v
echo    • Para remover imagens: docker-compose down --rmi all
echo    • Para limpar tudo: docker system prune -a

pause
