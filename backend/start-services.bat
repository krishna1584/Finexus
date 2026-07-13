@echo off
echo ========================================
echo Banking Application Startup Script
echo ========================================

echo.
if exist .env (
    echo Loading variables from .env...
    for /f "usebackq tokens=1,2 delims==" %%i in (".env") do (
        set "var=%%i"
        set "val=%%j"
        if not "%%i"=="" (
            if not "%%j"=="" (
                set "%%i=%%j"
            )
        )
    )
) else (
    echo No .env file found. Using default application configuration.
)

echo.
echo Starting Service Registry (Eureka Server)...
start /B cmd /c "cd Service-Registry && mvn spring-boot:run"

echo Waiting 30 seconds for Service Registry to start...
timeout /t 30 /nobreak

echo.
echo Starting API Gateway...
start /B cmd /c "cd API-Gateway && mvn spring-boot:run"

echo Waiting 20 seconds for API Gateway to register...
timeout /t 20 /nobreak

echo.
echo Starting User Service...
start /B cmd /c "cd User-Service && mvn spring-boot:run"

echo.
echo Starting Account Service...
start /B cmd /c "cd Account-Service && mvn spring-boot:run"

echo.
echo Starting Transaction Service...
start /B cmd /c "cd Transaction-Service && mvn spring-boot:run"

echo.
echo Starting Fund Transfer Service...
start /B cmd /c "cd Fund-Transfer && mvn spring-boot:run"

echo.
echo Starting Sequence Generator Service...
start /B cmd /c "cd Sequence-Generator && mvn spring-boot:run"

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
echo Frontend will be available at: http://localhost:5173
echo.
echo NOTE: Since services are running in the background of this terminal,
echo you can stop them by closing this terminal window or pressing Ctrl+C.
echo.
pause