$ErrorActionPreference = "Stop"

Set-Location -LiteralPath (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location -LiteralPath ".."

if (!(Test-Path -LiteralPath ".venv")) {
  Write-Host "Creating venv..."
  python -m venv .venv
}

Write-Host "Activating venv..."
. ".venv\\Scripts\\Activate.ps1"

Write-Host "Installing server deps..."
pip install -r "server\\requirements.txt"

Write-Host "Starting DisplayKit Pro server on http://127.0.0.1:8000/ ..."
python -m uvicorn server.main:app --reload --host 127.0.0.1 --port 8000

