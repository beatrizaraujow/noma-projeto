# Setup script para o módulo de integrações (Windows PowerShell)

Write-Host "🔧 Configurando módulo de integrações..." -ForegroundColor Cyan

# 1. Instalar dependências
Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
pnpm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências" -ForegroundColor Red
    exit 1
}

# 2. Gerar cliente Prisma
Write-Host "🗄️  Gerando cliente Prisma..." -ForegroundColor Yellow
Set-Location packages\database
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao gerar cliente Prisma" -ForegroundColor Red
    exit 1
}

# 3. Executar migração (opcional - comentado por padrão)
# Write-Host "🔄 Executando migração do banco de dados..." -ForegroundColor Yellow
# npx prisma migrate dev --name add_integrations

# 4. Voltar ao diretório raiz
Set-Location ..\..

# 5. Build do projeto
Write-Host "🏗️  Compilando projeto..." -ForegroundColor Yellow
Set-Location apps\api
pnpm build

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Aviso: Compilação teve erros, mas continuando..." -ForegroundColor Yellow
}

Set-Location ..\..

Write-Host ""
Write-Host "✅ Setup concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Configure as variáveis de ambiente (.env)"
Write-Host "2. Execute a migração: cd packages\database; npx prisma migrate dev"
Write-Host "3. Inicie o servidor: cd apps\api; pnpm dev"
Write-Host "4. Acesse o IntegrationManager no frontend"
