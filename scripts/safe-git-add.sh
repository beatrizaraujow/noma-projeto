#!/bin/bash

# ============================================
# NOMA - Safe Git Add for Study Deployment
# ============================================
# Este script adiciona apenas arquivos seguros ao Git
# Exclui automaticamente .env, secrets, e dados sensíveis
# ============================================

echo "🔍 Verificando arquivos seguros para commit..."

# ----------------------------------------
# 1. Verificar se .gitignore está correto
# ----------------------------------------
echo ""
echo "📋 Checando .gitignore..."
if grep -q "^\.env$" .gitignore; then
    echo "✅ .env está no .gitignore"
else
    echo "❌ AVISO: .env não está no .gitignore!"
    echo "   Adicionando agora..."
    echo ".env" >> .gitignore
fi

# ----------------------------------------
# 2. Verificar se existem arquivos .env sem .example
# ----------------------------------------
echo ""
echo "🔒 Verificando arquivos sensíveis..."
if ls .env 2>/dev/null | grep -q "^\.env$"; then
    echo "⚠️  ATENÇÃO: Arquivo .env encontrado!"
    echo "   Este arquivo NÃO será commitado (protegido pelo .gitignore)"
fi

if ls .env.local 2>/dev/null; then
    echo "⚠️  ATENÇÃO: Arquivo .env.local encontrado!"
fi

# ----------------------------------------
# 3. Adicionar apenas arquivos seguros
# ----------------------------------------
echo ""
echo "➕ Adicionando arquivos seguros ao Git..."

# Core files
git add .gitignore
git add README.md
git add package.json
git add pnpm-workspace.yaml
git add turbo.json
git add tsconfig.json

# Deploy guides (seguros - sem secrets)
git add SECURITY_DEPLOY.md
git add .env.example

# Source code
git add apps/
git add packages/
git add docs/

# Scripts (sem dados sensíveis)
git add scripts/

# Configuration (sem secrets)
git add nginx.conf
git add ecosystem.config.js

# ----------------------------------------
# 4. Verificar o que será commitado
# ----------------------------------------
echo ""
echo "📦 Arquivos preparados para commit:"
git status --short

echo ""
echo "🔍 Verificando se há secrets nos arquivos staged..."

# Verificar se algum arquivo .env (sem .example) foi staged
if git diff --cached --name-only | grep -E "^\.env$|^\.env\.local$"; then
    echo "❌ ERRO: Arquivo .env real detectado no stage!"
    echo "   Removendo do stage..."
    git restore --staged .env .env.local 2>/dev/null
    echo "✅ Arquivo removido do stage"
fi

# ----------------------------------------
# 5. Resumo final
# ----------------------------------------
echo ""
echo "✅ Preparação concluída!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Revise os arquivos: git status"
echo "   2. Verifique o diff: git diff --cached"
echo "   3. Commit: git commit -m 'feat: add safe deployment files'"
echo "   4. Push: git push origin main"
echo ""
echo "⚠️  LEMBRE-SE:"
echo "   - Nunca commite arquivos .env reais"
echo "   - Use apenas dados FAKE para demo"
echo "   - Configure secrets no provedor de deploy"
echo ""
