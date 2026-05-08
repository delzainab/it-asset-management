@echo off
echo ========================================
echo ARRET DES PROCESSUS SUR LE PORT 8085
echo ========================================
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8085 ^| findstr LISTENING') do (
    echo Tue le processus PID: %%a
    taskkill /F /PID %%a 2>nul
)
timeout /t 2 /nobreak >nul
echo.
echo ========================================
echo DEMARRAGE DE L'APPLICATION SPRING BOOT
echo ========================================
mvn spring-boot:run
pause