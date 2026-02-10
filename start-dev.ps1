# Script de Inicialização do Projeto NOMA
# Execute este script após o Docker Desktop estar rodando

Write-Host "🚀 Iniciando NOMA Project..." -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Docker
Write-Host "1️⃣  Verificando Docker..." -ForegroundColor Yellow
$dockerRunning = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker não está rodando!" -ForegroundColor Red
    Write-Host "⚠️  Por favor, inicie o Docker Desktop e execute este script novamente." -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Docker está rodando!" -ForegroundColor Green
Write-Host ""

# 2. Iniciar containers
Write-Host "2️⃣  Iniciando containers do banco de dados..." -ForegroundColor Yellow
docker-compose up -d postgres redis
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao iniciar containers!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Containers iniciados!" -ForegroundColor Green
Write-Host ""

# 3. Aguardar PostgreSQL ficar pronto
Write-Host "3️⃣  Aguardando PostgreSQL ficar pronto..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Write-Host "✅ PostgreSQL pronto!" -ForegroundColor Green
Write-Host ""

# 4. Aplicar migrations
Write-Host "4️⃣  Aplicando migrations do Prisma..." -ForegroundColor Yellow
Set-Location packages/database
npx prisma migrate dev --name init
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Migrations já aplicadas ou erro encontrado." -ForegroundColor Yellow
}
npx prisma generate
Set-Location ../..
Write-Host "✅ Migrations aplicadas!" -ForegroundColor Green
Write-Host ""

# 5. Iniciar servidores
Write-Host "5️⃣  Iniciando servidores..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔌 API: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 Executando 'pnpm dev'..." -ForegroundColor Green
Write-Host ""

pnpm dev
