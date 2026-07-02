Write-Host "===================================" -ForegroundColor Cyan
Write-Host " Starting all Projects" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Make sure MongoDB is running first!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Opening each project in separate windows..." -ForegroundColor Green
Write-Host ""

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Function Start-Project {
    param($title, $command, $workingDir)
    Write-Host "Starting $title..." -ForegroundColor Yellow
    Start-Process cmd -ArgumentList "/c cd /d `"$workingDir`" && $command"
    Start-Sleep -Seconds 2
}

# Resources Grid Projects
Start-Project "ProjectGrid Backend" "npm run dev" "$rootDir\Resources\projectGrid\backend"
Start-Project "ProjectGrid Frontend" "npm start" "$rootDir\Resources\projectGrid\frontend"

Start-Project "TechStack Backend" "node server.js" "$rootDir\Resources\technicalStack\backend"
Start-Project "TechStack Frontend" "npm run dev" "$rootDir\Resources\technicalStack\frontend"

Start-Project "Queries Backend" "npm run dev" "$rootDir\Resources\QueriesResponsesGrid\backend"
Start-Project "Queries Frontend" "npm run dev" "$rootDir\Resources\QueriesResponsesGrid\frontend"

Start-Project "ResourceGrid Backend" "npm start" "$rootDir\Resources\resourceGrid\backend"
Start-Project "ResourceGrid Frontend" "set PORT=3001 && npm start" "$rootDir\Resources\resourceGrid\frontend"

Start-Sleep -Seconds 3
try { Start-Process "chrome" "http://localhost:3000" } catch {}

Start-Project "Assumption Backend" "node server.js" "$rootDir\Resources\assumption-grid\backend"
Start-Project "Assumption Frontend" "npm run dev" "$rootDir\Resources\assumption-grid\frontend"

Start-Project "Dependency Backend" "node server.js" "$rootDir\Resources\dependency-grid\backend"
Start-Project "Dependency Frontend" "npm run dev" "$rootDir\Resources\dependency-grid\frontend"

Start-Project "Features Backend" "node server.js" "$rootDir\Resources\features-grid\backend"
Start-Project "Features Frontend" "npm run dev" "$rootDir\Resources\features-grid\frontend"

Start-Project "Streams Backend" "node server.js" "$rootDir\Resources\streams-grid\backend"
Start-Project "Streams Frontend" "npm run dev" "$rootDir\Resources\streams-grid\frontend"

Start-Project "OutOfScope Backend" "node server.js" "$rootDir\Resources\out-of-scope-grid\backend"
Start-Project "OutOfScope Frontend" "npm run dev" "$rootDir\Resources\out-of-scope-grid\frontend"

Start-Project "Milestone Backend" "node server.js" "$rootDir\Resources\milestone-grid\backend"
Start-Project "Milestone Frontend" "npm run dev" "$rootDir\Resources\milestone-grid\frontend"

# Dynamic Questionnaire
Start-Project "DynamicQ Python Backend" "uvicorn app.main:app --reload --port 8000" "$rootDir\dynamicQuestionnaire\backend"
Start-Project "DynamicQ Express Backend" "node server.js" "$rootDir\dynamicQuestionnaire\backend-express"
Start-Project "DynamicQ Frontend" "npm run dev" "$rootDir\dynamicQuestionnaire\backend\frontend"

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "  All servers starting up!" -ForegroundColor Green
Write-Host "  Project Grid:          http://localhost:3000"
Write-Host "  Resource Grid:         http://localhost:3001"
Write-Host "  Technical Stack:       http://localhost:5173"
Write-Host "  Queries:               http://localhost:5174"
Write-Host "  Assumptions:           http://localhost:5175"
Write-Host "  Dynamic Questionnaire: http://localhost:5177"
Write-Host "    Python Backend:      http://localhost:8000"
Write-Host "    Express Backend:     http://localhost:5010"
Write-Host "  Dependencies:          http://localhost:3002"
Write-Host "  Features Grid:         http://localhost:3003"
Write-Host "  Streams Grid:          http://localhost:3004"
Write-Host "  Out of Scope:          http://localhost:3005"
Write-Host "  Milestones:            http://localhost:3006"
Write-Host "===================================" -ForegroundColor Cyan
pause
