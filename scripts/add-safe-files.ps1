# NOMA - Safe Git Add Script
# Adiciona apenas arquivos seguros para deploy de estudo

Write-Host "Verificando arquivos seguros..." -ForegroundColor Cyan

# Core files
git add .gitignore
git add README.md
git add package.json
git add pnpm-workspace.yaml
git add turbo.json
git add tsconfig.json

# Deploy guides
git add README_DEPLOY.md
git add DEPLOY_STUDY.md
git add SECURITY_DEPLOY.md
git add .env.example

# Source code
git add apps/
git add packages/
git add docs/
git add scripts/

Write-Host "`nArquivos adicionados com sucesso!" -ForegroundColor Green
Write-Host "`nProximos passos:" -ForegroundColor Yellow
Write-Host "  git status"
Write-Host "  git commit -m ""feat: add deployment files"""
Write-Host "  git push"
