#!/bin/bash

# Setup script para o módulo de integrações

echo "🔧 Configurando módulo de integrações..."

# 1. Instalar dependências
echo "📦 Instalando dependências..."
pnpm install

# 2. Gerar cliente Prisma
echo "🗄️  Gerando cliente Prisma..."
cd packages/database
npx prisma generate

# 3. Executar migração
echo "🔄 Executando migração do banco de dados..."
npx prisma migrate dev --name add_integrations

# 4. Voltar ao diretório raiz
cd ../..

# 5. Build do projeto
echo "🏗️  Compilando projeto..."
cd apps/api
pnpm build

echo "✅ Setup concluído!"
echo ""
echo "📝 Próximos passos:"
echo "1. Configure as variáveis de ambiente (.env)"
echo "2. Inicie o servidor: pnpm dev"
echo "3. Acesse o IntegrationManager no frontend"
