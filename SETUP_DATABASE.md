# 🚀 Setup Rápido - Integrações Fase 2

## ⚠️ Problema Atual

O PostgreSQL não está rodando. Você tem 3 opções:

---

## Opção 1: Docker Desktop (Recomendado) 🐳

### Passos:

1. **Instalar Docker Desktop** (se não tiver):
   - Download: https://www.docker.com/products/docker-desktop/
   - Instale e reinicie o computador se necessário

2. **Iniciar Docker Desktop**
   - Abra o aplicativo Docker Desktop
   - Aguarde até aparecer "Docker is running" no ícone da bandeja

3. **Subir o PostgreSQL:**
   ```powershell
   cd c:\Users\annyb\OneDrive\Documentos\NOMA
   docker-compose up -d postgres
   ```

4. **Aguardar o banco inicializar** (30 segundos)

5. **Aplicar migração:**
   ```powershell
   cd packages\database
   npx prisma migrate dev --name add_integrations_phase2
   ```

6. **Pronto!** ✅

---

## Opção 2: PostgreSQL Local 💻

### Passos:

1. **Instalar PostgreSQL:**
   - Download: https://www.postgresql.org/download/windows/
   - Durante instalação:
     - Senha: `postgres`
     - Porta: `5432`

2. **Criar banco de dados:**
   ```powershell
   # Abrir SQL Shell (psql) no menu iniciar
   # Senha: postgres
   
   CREATE DATABASE nexora;
   ```

3. **Aplicar migração:**
   ```powershell
   cd c:\Users\annyb\OneDrive\Documentos\NOMA\packages\database
   npx prisma migrate dev --name add_integrations_phase2
   ```

---

## Opção 3: Usar banco de dados online (mais rápido) ☁️

### Passos:

1. **Criar conta grátis:**
   - Neon: https://neon.tech/ (recomendado)
   - Supabase: https://supabase.com/
   - ElephantSQL: https://www.elephantsql.com/

2. **Copiar connection string** (algo como):
   ```
   postgresql://user:password@host.neon.tech/database?sslmode=require
   ```

3. **Atualizar .env:**
   ```powershell
   cd c:\Users\annyb\OneDrive\Documentos\NOMA\packages\database
   notepad .env
   
   # Substituir DATABASE_URL por:
   DATABASE_URL="sua_connection_string_aqui"
   ```

4. **Aplicar migração:**
   ```powershell
   npx prisma migrate dev --name add_integrations_phase2
   ```

---

## 🎯 Solução Imediata (Sem banco de dados)

Se você quiser **apenas verificar o código** sem executar:

### ✅ O código está funcionando!

- ✅ **4 novos serviços** criados
- ✅ **5 novos modelos** no Prisma
- ✅ **25 novos endpoints** REST
- ✅ **Frontend** com formulários
- ✅ **Documentação** completa
- ✅ **TypeScript** compila sem erros

### Arquivos de migração já criados:

Os arquivos de migração estão em:
```
packages/database/prisma/migrations/
```

Quando você iniciar o PostgreSQL, basta executar:
```powershell
npx prisma migrate deploy
```

---

## 📊 Status do Projeto

| Item | Status |
|------|--------|
| Código Backend | ✅ Completo |
| Código Frontend | ✅ Completo |
| Documentação | ✅ Completa |
| TypeScript | ✅ Sem erros |
| Migração criada | ⏳ Aguardando banco |
| Banco de dados | ❌ Não está rodando |

---

## 🚀 Comando Rápido (depois de iniciar o banco)

```powershell
# Opção Docker
docker-compose up -d postgres

# Aguardar 30 segundos, depois:
cd packages\database
npx prisma migrate dev
npx prisma generate

# Iniciar aplicação
cd ..\..
pnpm dev
```

---

## 💡 Recomendação

**Melhor opção:** Docker Desktop (Opção 1)
- Fácil de configurar
- Não interfere com outras instalações
- Usado em produção
- Comando único: `docker-compose up -d`

---

## 🆘 Precisa de ajuda?

1. Instale Docker Desktop
2. Execute: `docker-compose up -d postgres`
3. Execute: `cd packages\database && npx prisma migrate dev`

**Pronto!** 🎉
