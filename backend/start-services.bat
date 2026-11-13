@echo off
echo ========================================
echo Finexus backend startup
echo ========================================

echo.
if exist .env (
    echo Loading variables from .env...
    rem eol=# skips comment lines. tokens=1,* keeps everything after the first "="
    rem so values that contain "=" (e.g. a base64 JWT_SECRET) are not cut short.
    for /f "usebackq eol=# tokens=1,* delims==" %%i in (".env") do (
        if not "%%i"=="" if not "%%j"=="" set "%%i=%%j"
    )
) else (
    echo No .env file found. Copy .env.example to .env and fill it in first.
    pause
    exit /b 1
)

echo.
echo Starting Service Registry (Eureka)...
start /B cmd /c "cd Service-Registry && mvn spring-boot:run"

echo Waiting 30 seconds for the Service Registry to start...
timeout /t 30 /nobreak

echo.
echo Starting API Gateway...
start /B cmd /c "cd API-Gateway && mvn spring-boot:run"

echo Waiting 20 seconds for the API Gateway to register...
timeout /t 20 /nobreak

echo.
echo Starting Sequence Generator...
start /B cmd /c "cd Sequence-Generator && mvn spring-boot:run"

echo Starting User Service...
start /B cmd /c "cd User-Service && mvn spring-boot:run"

echo Starting Account Service...
start /B cmd /c "cd Account-Service && mvn spring-boot:run"

echo Starting Transaction Service...
start /B cmd /c "cd Transaction-Service && mvn spring-boot:run"

echo Starting Fund Transfer Service...
start /B cmd /c "cd Fund-Transfer && mvn spring-boot:run"

echo.
echo ========================================
echo All services are starting.
echo ========================================
echo.
echo Wait until every service shows up on the Eureka dashboard:
echo   http://localhost:8761
echo.
echo Then start the frontend in another terminal:
echo   cd frontend
echo   npm install
echo   npm run dev
echo.
echo The app will be at http://localhost:5173
echo.
echo To stop everything, run stop-services.bat (or close this window).
echo.
pause
