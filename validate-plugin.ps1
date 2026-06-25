param(
    [string]$PluginPath = (Join-Path $PSScriptRoot "plugins\build-harmonyos-apps")
)

$ErrorActionPreference = "Stop"

$Python = Join-Path $PSScriptRoot ".venv-plugin-validate\Scripts\python.exe"
$Validator = Join-Path $env:USERPROFILE ".codex\skills\.system\plugin-creator\scripts\validate_plugin.py"

if (-not (Test-Path -LiteralPath $Python)) {
    throw "Missing validation venv Python: $Python"
}

if (-not (Test-Path -LiteralPath $Validator)) {
    throw "Missing plugin validator: $Validator"
}

$ResolvedPluginPath = Resolve-Path -LiteralPath $PluginPath
& $Python $Validator $ResolvedPluginPath.Path
exit $LASTEXITCODE