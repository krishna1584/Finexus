@echo off
echo ========================================
echo Banking Application Startup Script
echo ========================================

echo.
echo Starting Service Registry (Eureka Server)...
start "Service Registry" cmd /k "cd Service-Registry && mvn spring-boot:run"

echo Waiting 30 seconds for Service Registry to start...
timeout /t 30 /nobreak

echo.
echo Starting API Gateway...
start "API Gateway" cmd /k "cd API-Gateway && mvn spring-boot:run"

echo Waiting 20 seconds for API Gateway to register...
timeout /t 20 /nobreak

echo.
echo Starting User Service...
start "User Service" cmd /k "cd User-Service && mvn spring-boot:run"

echo.
echo Starting Account Service...
start "Account Service" cmd /k "cd Account-Service && mvn spring-boot:run"

echo.
echo Starting Transaction Service...
start "Transaction Service" cmd /k "cd Transaction-Service && mvn spring-boot:run"

echo.
echo Starting Fund Transfer Service...
start "Fund Transfer Service" cmd /k "cd Fund-Transfer && mvn spring-boot:run"

echo.
echo Starting Sequence Generator Service...
start "Sequence Generator" cmd /k "cd Sequence-Generator && mvn spring-boot:run"

echo.
echo ========================================
echo All services are starting up!
echo ========================================
echo.
echo Please wait for all services to register with Eureka
echo Check the Eureka dashboard at: http://localhost:8761
echo.
echo To start the frontend:
echo   cd banking-frontend
echo   npm install
echo   npm start
echo.
echo Frontend will be available at: http://localhost:3000
echo.
pause