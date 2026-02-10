# 🔧 SOLUÇÃO - Dependências Corrompidas (OneDrive)

## ❌ Problema Identificado

As dependências do node_modules estão corrompidas. Isso acontece frequentemente quando:
- OneDrive está sincronizando arquivos
- Processos Node estão travados em background
- Instalação foi interrompida

## ✅ SOLUÇÃO COMPLETA - Execute Passo a Passo

### 1️⃣ Pare TUDO

```powershell
# No VS Code, vá em:
# View → Terminal → Kill All Terminals
```

### 2️⃣ Feche o VS Code

Feche completamente o VS Code (X na janela)

###⃣ Mate Processos Node

Abra PowerShell como Administrador e execute:

```powershell
taskkill /F /IM node.exe /T
taskkill /F /IM Code.exe /T
```

### 4️⃣ Pause o OneDrive (IMPORTANTE!)

1. Clique no ícone do OneDrive na bandeja
2. Clique em ⚙️ Configurações
3. Clique em "Pausar sincronização" → "2 horas"

### 5️⃣ Delete node_modules

```powershell
cd C:\Users\annyb\OneDrive\Documentos\NOMA

# Deletar completamente
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force apps/api/node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force apps/web/node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force packages/*/node_modules -ErrorAction SilentlyContinue

# Limpar cache do pnpm
pnpm store prune
```

### 6️⃣ Reinstale Dependências

```powershell
# Atualizar pnpm primeiro
pnpm add -g pnpm

# Reinstalar tudo
pnpm install

# Se der erro, tente com --shamefully-hoist
pnpm install --shamefully-hoist
```

### 7️⃣ Inicie o Projeto

```powershell
# Gerar Prisma Client
cd packages/database
npx prisma generate
cd ../..

# Iniciar servidores
pnpm dev
```

---

## 🎯 SOLUÇÃO ALTERNATIVA - Sem OneDrive

Se o problema persistir, mova o projeto para fora do OneDrive:

```powershell
# 1. Copie o projeto
Copy-Item -Recurse "C:\Users\annyb\OneDrive\Documentos\NOMA" "C:\Dev\NOMA"

# 2. Entre no novo diretório
cd C:\Dev\NOMA

# 3. Instale as dependências
pnpm install

# 4. Inicie
pnpm dev
```

---

## 🚀 QUICK FIX - Se tiver pressa

Use npm em vez de pnpm (mais lento, mas pode funcionar):

```powershell
# Delete node_modules
Remove-Item -Recurse -Force node_modules

# Instale com npm
npm install

# Inicie
npm run dev
```

---

## ✅ Checklist de Verificação

Antes de iniciar, confirme:

- [ ] OneDrive pausado
- [ ] VS Code fechado
- [ ] Processos Node mortos
- [ ] node_modules deletado
- [ ] pnpm cache limpo
- [ ] Dependências reinstaladas
- [ ] Prisma Client gerado

---

## 📱 Testar Frontend Isolado (Mock API)

Se a API não subir, teste apenas o frontend com dados mockados:

```powershell
cd apps/web

# Criar .env.local com API mocada (opcional)
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
echo "NEXT_PUBLIC_MOCK_API=true" >> .env.local

# Iniciar
npm run dev  # ou pnpm dev
```

Acesse: http://localhost:3000

---

## 🆘 Se NADA Funcionar

1. **Abra issue no GitHub** do projeto
2. **Clone novamente** do GitHub em local diferente:

```powershell
cd C:\Dev
git clone https://github.com/beatrizaraujow/noma-projeto.git noma-fresh
cd noma-fresh
pnpm install
pnpm dev
```

---

## 💡 Dica Pro

Para evitar esse problema no futuro:

1. **NÃO use OneDrive** para projetos com muitas dependências
2. Use `C:\Dev\` ou `D:\Projetos\`
3. Configure OneDrive para ignorar `node_modules`:
   - Adicione `node_modules` nas exclusões do OneDrive

---

**Execute os passos acima e tente novamente!** 🚀
