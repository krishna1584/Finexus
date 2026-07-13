@echo off
echo ========================================
echo Stopping Finexus Backend Services...
echo ========================================

:: Port list:
:: 8761 - Service Registry
:: 8088 - API Gateway
:: 8082 - User Service
:: 8081 - Account Service
:: 8084 - Transaction Service
:: 8085 - Fund Transfer
:: 8083 - Sequence Generator

set ports=8761 8088 8082 8081 8084 8085 8083

for %%p in (%ports%) do (
    echo Checking port %%p...
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%p ^| findstr LISTENING') do (
        echo Killing process ID %%a on port %%p...
        taskkill /f /pid %%a
    )
)

echo.
echo Safe stop completed. All project services have been stopped.
echo ========================================
pause
