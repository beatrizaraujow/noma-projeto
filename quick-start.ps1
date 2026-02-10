# Quick Start - Apenas inicia os servidores (assume que Docker já está rodando)

Write-Host "⚡ Quick Start - NOMA Project" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "🔌 API: http://localhost:3001" -ForegroundColor Green
Write-Host "📊 API Docs: http://localhost:3001/api" -ForegroundColor Green
Write-Host ""
Write-Host "❌ Pressione Ctrl+C para parar" -ForegroundColor Yellow
Write-Host ""

pnpm dev
