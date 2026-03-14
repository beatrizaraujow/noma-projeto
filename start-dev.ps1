# Script de Inicialização do Projeto NOMA (banco local)

Write-Host "🚀 Iniciando NOMA Project..." -ForegroundColor Cyan
Write-Host ""

# 1. Aplicar schema do banco local
Write-Host "1️⃣  Aplicando schema do banco local..." -ForegroundColor Yellow
Set-Location packages/database
npx prisma db push
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao aplicar schema do banco local." -ForegroundColor Red
    exit 1
}
npx prisma generate
Set-Location ../..
Write-Host "✅ Banco local pronto!" -ForegroundColor Green
Write-Host ""

# 2. Iniciar servidores
Write-Host "2️⃣  Iniciando servidores..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔌 API: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 Executando 'pnpm dev'..." -ForegroundColor Green
Write-Host ""

pnpm dev
