param(
    [string]$ProjectRoot = (Split-Path $PSScriptRoot -Parent),
    [string]$PackageOutputDir = ""
)

$ErrorActionPreference = "Stop"
$ResolvedProjectRoot = (Resolve-Path -LiteralPath $ProjectRoot).ProviderPath

if ([string]::IsNullOrWhiteSpace($PackageOutputDir)) {
    $PackageOutputDir = Join-Path $ResolvedProjectRoot "__DIST"
}

if (-not [IO.Path]::IsPathRooted($PackageOutputDir)) {
    $PackageOutputDir = Join-Path $ResolvedProjectRoot $PackageOutputDir
}

if (-not (Test-Path -LiteralPath $PackageOutputDir -PathType Container)) {
    New-Item -ItemType Directory -Force -Path $PackageOutputDir | Out-Null
}

Write-Host "==> Packaging VSIX"
Write-Host "==> Project root: $ResolvedProjectRoot"
Write-Host "==> Output dir: $PackageOutputDir"

Push-Location $ResolvedProjectRoot
try {
    & npx vsce package --out "$PackageOutputDir/"
    if ($LASTEXITCODE -ne 0) { throw "vsce package failed." }

    $VsixFile = Get-ChildItem -Path $PackageOutputDir -Filter "*.vsix" | Select-Object -First 1
    if ($null -eq $VsixFile) {
        throw "No .vsix file found after packaging."
    }

    Write-Host "==> Packaged: $($VsixFile.Name)"
}
finally {
    Pop-Location
}
