$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
npm.cmd run dev *> dev-server.log
