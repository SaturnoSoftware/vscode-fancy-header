param(
    [string]$ProjectRoot = (Split-Path $PSScriptRoot -Parent),
    [string]$BuildOutputDir = ""
)

$ErrorActionPreference = "Stop"
$ResolvedProjectRoot = (Resolve-Path -LiteralPath $ProjectRoot).ProviderPath

if ([string]::IsNullOrWhiteSpace($BuildOutputDir)) {
    $BuildOutputDir = Join-Path $ResolvedProjectRoot "__BUILD/_staging"
}

if (-not [IO.Path]::IsPathRooted($BuildOutputDir)) {
    $BuildOutputDir = Join-Path $ResolvedProjectRoot $BuildOutputDir
}

Write-Host "==> Building Saturno FancyHeader"
Write-Host "==> Project root: $ResolvedProjectRoot"
Write-Host "==> Output: $BuildOutputDir"

Push-Location $ResolvedProjectRoot
try {
    Remove-Item -LiteralPath $BuildOutputDir -Recurse -Force -ErrorAction SilentlyContinue
    New-Item -ItemType Directory -Force -Path $BuildOutputDir | Out-Null
    Remove-Item -LiteralPath (Join-Path $ResolvedProjectRoot "out") -Recurse -Force -ErrorAction SilentlyContinue

    # Compile TypeScript
    & npx tsc -p ./
    if ($LASTEXITCODE -ne 0) { throw "TypeScript compilation failed." }

    # Copy runtime artifacts to staging
    Copy-Item -Path (Join-Path $ResolvedProjectRoot "out") -Destination $BuildOutputDir -Recurse -Force
    Copy-Item -LiteralPath (Join-Path $ResolvedProjectRoot "package.json") -Destination $BuildOutputDir -Force
    Copy-Item -LiteralPath (Join-Path $ResolvedProjectRoot "LICENSE.txt") -Destination $BuildOutputDir -Force

    if (Test-Path -LiteralPath (Join-Path $ResolvedProjectRoot "res") -PathType Container) {
        Copy-Item -Path (Join-Path $ResolvedProjectRoot "res") -Destination $BuildOutputDir -Recurse -Force
    }

    Write-Host "==> Build staging complete"
}
finally {
    Pop-Location
}
