@echo off
echo Starting OSRM services and React app...

REM Start OSRM Docker containers in the background
start cmd /c "docker-compose up"

REM Wait for containers to be ready (adjust sleep time if needed)
timeout /t 10 /nobreak

REM Start React app
start cmd /c "npm start"

echo All services started!
