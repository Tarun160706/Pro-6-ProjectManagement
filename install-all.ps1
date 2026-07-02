Write-Host "===================================" -ForegroundColor Cyan
Write-Host " Installing dependencies for all Projects" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "NOTE: Frontend projects with Material UI (@mui) may take" -ForegroundColor Yellow
Write-Host "      3-5 minutes each to download and build." -ForegroundColor Yellow
Write-Host "      Total install time: ~15-20 minutes." -ForegroundColor Yellow
Write-Host ""
Write-Host "Starting installation..." -ForegroundColor Green
Write-Host ""

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$totalSteps = 22
$step = 0

function Install-Step {
    param($name, $dir)
    $script:step++
    Write-Host "[$($script:step)/$totalSteps] Installing $name..." -ForegroundColor Yellow
    Write-Host "  Directory: $dir"
    Set-Location $dir
    $timer = [System.Diagnostics.Stopwatch]::StartNew()
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERROR] npm install failed for $name!" -ForegroundColor Red
        pause
        exit 1
    }
    $timer.Stop()
    Write-Host "  Finished in $($timer.Elapsed.TotalSeconds.ToString('F1'))s" -ForegroundColor Green
    Write-Host ""
}

# Resources Grid Projects
Install-Step "projectGrid backend" "$rootDir\Resources\projectGrid\backend"
Install-Step "projectGrid frontend" "$rootDir\Resources\projectGrid\frontend"
Install-Step "technicalStack backend" "$rootDir\Resources\technicalStack\backend"
Install-Step "technicalStack frontend" "$rootDir\Resources\technicalStack\frontend"
Install-Step "QueriesResponsesGrid backend" "$rootDir\Resources\QueriesResponsesGrid\backend"
Install-Step "QueriesResponsesGrid frontend" "$rootDir\Resources\QueriesResponsesGrid\frontend"
Install-Step "resourceGrid backend" "$rootDir\Resources\resourceGrid\backend"
Install-Step "resourceGrid frontend" "$rootDir\Resources\resourceGrid\frontend"
Install-Step "assumption-grid backend" "$rootDir\Resources\assumption-grid"
Install-Step "assumption-grid frontend" "$rootDir\Resources\assumption-grid\frontend"
Install-Step "dependency-grid backend" "$rootDir\Resources\dependency-grid"
Install-Step "dependency-grid frontend" "$rootDir\Resources\dependency-grid\frontend"
Install-Step "features-grid backend" "$rootDir\Resources\features-grid"
Install-Step "features-grid frontend" "$rootDir\Resources\features-grid\frontend"
Install-Step "streams-grid backend" "$rootDir\Resources\streams-grid"
Install-Step "streams-grid frontend" "$rootDir\Resources\streams-grid\frontend"
Install-Step "out-of-scope-grid backend" "$rootDir\Resources\out-of-scope-grid"
Install-Step "out-of-scope-grid frontend" "$rootDir\Resources\out-of-scope-grid\frontend"
Install-Step "milestone-grid backend" "$rootDir\Resources\milestone-grid"
Install-Step "milestone-grid frontend" "$rootDir\Resources\milestone-grid\frontend"

# Dynamic Questionnaire
Install-Step "dynamicQuestionnaire backend (Express)" "$rootDir\dynamicQuestionnaire\backend-express"
Install-Step "dynamicQuestionnaire frontend" "$rootDir\dynamicQuestionnaire\backend\frontend"

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host " npm installs complete!" -ForegroundColor Green
Write-Host ""
Write-Host " Note: dynamicQuestionnaire Python backend requires:" -ForegroundColor Yellow
Write-Host "   pip install -r $rootDir\dynamicQuestionnaire\backend\requirement.txt" -ForegroundColor Yellow
Write-Host ""
Write-Host " Then run start-all.bat to start the servers." -ForegroundColor Yellow
Write-Host "===================================" -ForegroundColor Cyan
pause
