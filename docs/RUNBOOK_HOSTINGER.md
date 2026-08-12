# Runbook — deploy do NOMA no VPS Hostinger

> **Alvo:** web + API + Postgres + Redis no VPS Hostinger (KVM 4, Ubuntu 22.04),
> compartilhado com o **SB Clips**. Vercel e Railway saem de cena.
>
> **Data:** 2026-08-11 · Companion de [INFRA_COEXISTENCIA_SERVIDOR.md](INFRA_COEXISTENCIA_SERVIDOR.md)
> (análise, limites e riscos). Este arquivo é a execução.

---

## Estado deste runbook

| Item | Estado |
|---|---|
| Arquivos de deploy no repositório | ✅ escritos |
| Correção do roteamento `/api/*` | ✅ resolvida (dois hostnames — ver §1) |
| Builds Docker validados | ❌ **nunca executados** — ver §3 |
| Inventário da máquina (fase 1 e 2) | ⏳ pendente |
| Domínios / DNS definidos | ⏳ pendente |

> **Nada aqui foi executado contra a máquina.** Os Dockerfiles foram escritos mas
> **não compilados** — não há Docker na estação onde foram criados. A §3 existe
> para provar os builds na CI **antes** de tocar no servidor.

---

## 1. A correção que muda o plano: dois hostnames, não um

A §6.6 do documento de infra propõe um único `server` com `location /` → Next e
`location /api/` → Nest. **Isso quebra o login.** O Next serve rotas sob `/api/`
que colidem com as do Nest:

| Rota | Next (`apps/web/src/app/api`) | Nest (prefixo global `/api`) |
|---|---|---|
| `/api/auth/session` | NextAuth (`[...nextauth]`) | — |
| `/api/auth/callback/*` | NextAuth | — |
| `/api/auth/providers`, `/api/auth/csrf` | NextAuth | — |
| `/api/auth/register` | `route.ts` (proxy) | `auth.controller` ⚠️ **colide** |
| `/api/auth/login`, `/api/auth/refresh` | — | `auth.controller` |
| `/api/saved-filters` | `route.ts` | `saved-filters` ⚠️ **colide** |
| `/api/search` | `route.ts` | `search` ⚠️ **colide** |

Mandar `/api/` inteiro para o Nest mata a sessão do NextAuth — sem
`/api/auth/session` e `/api/auth/callback/credentials` **não existe login**.
Mandar para o Next torna o backend inalcançável. Não há divisão por path que
resolva.

**Decisão:** hostnames separados.

```
noma.<dominio>      -> 127.0.0.1:3100  (Next)
api.<dominio>       -> 127.0.0.1:3101  (Nest)
```

`NEXT_PUBLIC_API_URL=https://api.<dominio>` — **sem** sufixo `/api`, porque o
código monta `${API_URL}/api/...`.

---

## 2. O que eu preciso de você antes de começar

| # | Item | Por quê |
|---|---|---|
| 1 | **Dois domínios/subdomínios** e o DNS `A` apontando para o IP do VPS | O certbot só emite com DNS resolvendo e porta 80 acessível |
| 2 | **Acesso SSH** — host, usuário, chave configurada | Você optou por eu operar a máquina daqui |
| 3 | Confirmar as **4 regras do firewall** do painel Hostinger | Muda a severidade do risco nº 1 (§10 do doc de infra) |
| 4 | Registry para as imagens (**GHCR** já vem de graça com o repo) | §8.4: nenhum build na máquina |

> ⚠️ **Sobre o SSH:** a rede da sessão onde este runbook foi escrito estava
> filtrada — `google.com` e `backboard.railway.com` deram timeout na porta 443,
> enquanto `vercel.com` respondeu. Se o SSH não passar daqui, caímos no modo
> "eu gero os comandos, você executa" sem perda de conteúdo.

---

## 3. Provar os builds ANTES de tocar no servidor

Os dois Dockerfiles são novos e **não foram executados**. Os pontos de falha
prováveis, para você saber o que olhar:

- **API** — `pnpm prune --prod` precisa preservar o client Prisma gerado. Se o
  boot falhar com `@prisma/client did not initialize`, a poda levou o client e a
  correção é rodar `prisma generate` no estágio `runner`.
- **Web** — `output: 'standalone'` em monorepo pnpm. Se subir e quebrar em
  `Cannot find module '@nexora/ui'`, o `outputFileTracingRoot` não pegou os
  pacotes de workspace.

O workflow [`build-images.yml`](../.github/workflows/build-images.yml) faz isso,
e tem **smoke test** para exatamente esses dois casos: sobe cada container e
verifica que a API serve `/api/docs` (prova que o client Prisma sobreviveu ao
prune) e que o Next renderiza `/login` **com os assets estáticos** (prova o
tracing do workspace e o `COPY` do `.next/static`).

```bash
gh workflow run build-images.yml
gh run watch
```

**Modo validação** (o atual): sem a variável `NOMA_API_ORIGIN` definida no
repositório, ele builda, testa e **não publica** — é o que você quer agora, antes
de existir DNS. O resumo do run mostra o tamanho de cada imagem; a referência é
ter saído de ~1–2 GB para 200–400 MB.

**Modo publicação:** defina `NOMA_API_ORIGIN` em *Settings > Secrets and variables
> Actions > Variables* (ex. `https://api.SEUDOMINIO.com`). O workflow valida o
formato — recusa origem sem `https://` e recusa terminar em `/` ou `/api`, porque
o código concatena `/api` e viraria `/api/api`. A partir daí ele publica no GHCR e
imprime as duas linhas prontas para o `/opt/noma/.env`.

> **`NEXT_PUBLIC_API_URL` é inlinada no bundle em tempo de build.** A imagem do
> web fica atrelada ao domínio: trocar de domínio exige **rebuild**, mudar env do
> container não tem efeito no código do cliente. O Dockerfile falha de propósito
> se o build-arg faltar — sem isso o bundle sairia com o fallback
> `http://localhost:3001` embutido e o sintoma no navegador seria exatamente
> *"Não foi possível conectar ao servidor"*.

---

## 4. Fase 0 — rede de segurança e inventário (não altera nada)

```bash
# 1. SNAPSHOT pelo painel Hostinger. Nao e opcional (§11, nivel 0).
#    Cobre inclusive os erros que o documento nao previu.

# 2. Inventario em repouso
scp scripts/inventario-servidor.sh usuario@servidor:~/
ssh usuario@servidor 'sudo bash ~/inventario-servidor.sh' > inventario-repouso.txt

# 3. Inventario DURANTE um render real (o dado decisivo — media esconde o pico)
ssh usuario@servidor 'sudo bash ~/inventario-servidor.sh --amostrar 600' > inventario-render.csv
```

Três coisas precisam sair daí antes de subir qualquer container:

1. **`3100`, `3101` estão livres?** (`ss -tulpn`, e fora da faixa efêmera do kernel)
2. **`172.28.0.0/24` está livre?** Sub-rede colidindo quebra o roteamento da
   **máquina inteira**, não só do container:
   ```bash
   ip route
   docker network inspect $(docker network ls -q) | grep -i subnet
   ```
   Se estiver em uso, troque em [`docker-compose.prod.yml`](../docker-compose.prod.yml).
   **Não mexa em `/etc/docker/daemon.json`** — reiniciar o daemon reinicia os
   containers do SB Clips.
3. **Pico de RAM/CPU do ffmpeg** (`VmHWM`), para confirmar ou baixar os tetos.

---

## 5. Fase 1 — layout e segredos na máquina

```bash
sudo mkdir -p /opt/noma/dados/postgres /opt/noma/dados/uploads
sudo chown -R "$USER":"$USER" /opt/noma
cd /opt/noma
```

Copie `docker-compose.prod.yml` para `/opt/noma/` e crie o `.env`:

```bash
cat > /opt/noma/.env <<'EOF'
# --- imagens (do registry; nunca buildadas aqui) ---
NOMA_API_IMAGE=ghcr.io/beatrizaraujow/noma-api:SUBSTITUA_PELO_SHA
NOMA_WEB_IMAGE=ghcr.io/beatrizaraujow/noma-web:SUBSTITUA_PELO_SHA

# --- banco ---
POSTGRES_USER=noma
POSTGRES_PASSWORD=SUBSTITUA
POSTGRES_DB=noma

# --- auth ---
JWT_SECRET=SUBSTITUA
JWT_EXPIRATION=7d
NEXTAUTH_SECRET=SUBSTITUA

# --- dominios ---
FRONTEND_URL=https://noma.SEUDOMINIO.com
NEXT_PUBLIC_API_URL=https://api.SEUDOMINIO.com
CORS_ORIGINS=

# --- schema: opt-in, ver fase 5 ---
RUN_DB_PUSH=false
DB_PUSH_ACCEPT_DATA_LOSS=false
EOF

chmod 600 /opt/noma/.env
```

Gere os segredos (não reutilize os valores de desenvolvimento — eles estão
versionados no repositório):

```bash
openssl rand -base64 48   # JWT_SECRET
openssl rand -base64 48   # NEXTAUTH_SECRET
openssl rand -base64 32   # POSTGRES_PASSWORD
```

> A API **aborta o boot** sem `JWT_SECRET` ([`main.ts:9-12`](../apps/api/src/main.ts#L9-L12)).
> Isso é proteção, não bug: falha alto em vez de subir insegura.

---

## 6. Fase 2 — subir os containers e validar SEM Nginx

Isolar as camadas: se der erro aqui, o problema é container; se der erro depois,
é Nginx.

```bash
cd /opt/noma
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f api
```

Os limites foram realmente aplicados?

```bash
docker stats --no-stream
# CPU% do noma-api nao deve passar de 70% de um nucleo; MEM LIMIT deve ler 1GiB
```

Alcançáveis apenas em loopback?

```bash
curl -I http://127.0.0.1:3100          # web -> 200
curl -I http://127.0.0.1:3101/api/docs # api -> 200 (Swagger)

# Postgres e Redis NAO devem aparecer nesta lista:
ss -tulpn | grep -v 127.0.0.1
```

---

## 7. Fase 3 — schema do banco (primeiro deploy)

O push de schema **não roda mais no boot**. O comportamento anterior
(`prisma db push --accept-data-loss` no `CMD`) executava a cada restart e podia
dropar coluna ou tabela sem aviso — risco nº 12 da §10. Agora é deliberado:

```bash
cd /opt/noma
# Liga o push so para este boot
sed -i 's/^RUN_DB_PUSH=false/RUN_DB_PUSH=true/' .env
docker compose -f docker-compose.prod.yml up -d --force-recreate api
docker compose -f docker-compose.prod.yml logs api | grep -A5 'prisma db push'

# DESLIGA de novo. Deixar ligado traz o risco de volta a cada restart.
sed -i 's/^RUN_DB_PUSH=true/RUN_DB_PUSH=false/' .env
docker compose -f docker-compose.prod.yml up -d --force-recreate api
```

**Sobre o seed:** `pnpm --filter @nexora/database db:seed` usa `ts-node`, que é
devDependency e **não existe na imagem de produção** (foi podado). Não tente
rodar o seed no container. Crie o primeiro usuário pela própria API:

```bash
curl -X POST http://127.0.0.1:3101/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"voce@dominio.com","password":"SENHA_FORTE","name":"Seu Nome"}'
```

> O `ValidationPipe` global usa `forbidNonWhitelisted: true` — campo extra no
> body é **rejeitado**. Mande só o que o DTO aceita.

---

## 8. Fase 4 — TLS

Não use `certbot --nginx`: ele **edita os arquivos de configuração existentes**,
e prometemos não tocar no do SB Clips.

```bash
sudo cp -a /etc/nginx /root/backup-nginx-$(date +%F-%H%M)   # ANTES de tudo

sudo certbot certonly --webroot -w /var/www/html \
  -d noma.SEUDOMINIO.com \
  -d api.SEUDOMINIO.com
```

Ele só emite; **nós** escrevemos o bloco `server`.

---

## 9. Fase 5 — Nginx

```bash
# 1. Zonas e o map de upgrade vao no contexto http (NAO dentro do server).
sudo cp deploy/nginx/conf.d/noma-limits.conf /etc/nginx/conf.d/

# 2. O vhost, ainda SEM habilitar
sudo cp deploy/nginx/sites-available/noma /etc/nginx/sites-available/noma
sudo sed -i 's/noma\.seudominio\.com/noma.SEUDOMINIO.com/g; s/api\.seudominio\.com/api.SEUDOMINIO.com/g' \
  /etc/nginx/sites-available/noma

# 3. WebSocket: cada conexao ocupa DOIS slots de um pool compartilhado com o
#    SB Clips. Estourar recusa conexoes dos DOIS sites (§6.3).
#    Em /etc/nginx/nginx.conf:
#      worker_rlimit_nofile 8192;
#      events { worker_connections 4096; }

# 4. Validar ANTES de habilitar
sudo nginx -t

# 5. Habilitar e aplicar. O && e o que importa: teste falhou, reload nao roda.
sudo ln -s /etc/nginx/sites-available/noma /etc/nginx/sites-enabled/noma
sudo nginx -t && sudo systemctl reload nginx
```

> 🔴 **Nunca `systemctl restart nginx`.** Com config inválida, `reload` mantém os
> workers antigos servindo; `restart` **não sobe e derruba os dois sites**.

### Testes que importam

```bash
curl -I -H 'Host: noma.SEUDOMINIO.com'    https://127.0.0.1/ -k   # NOMA responde?
curl -I -H 'Host: api.SEUDOMINIO.com'     https://127.0.0.1/api/docs -k
curl -I -H 'Host: sbclips.SEUDOMINIO.com' https://127.0.0.1/ -k   # vizinho intacto?
curl -I https://127.0.0.1/ -k                                      # IP puro AINDA vai pro SB Clips?
```

O último é o que pega `default_server` roubado — o vhost do NOMA não declara
`default_server` justamente por isso.

### O teste de verdade: o login

`nginx -t` valida sintaxe; **não** valida se o `proxy_pass` aponta para algo vivo.

```bash
# A rota do NextAuth tem que ser servida pelo NEXT, nao pelo Nest:
curl -s https://noma.SEUDOMINIO.com/api/auth/providers | head
# Esperado: JSON de providers do NextAuth.
# Se vier 404 do Nest, o roteamento esta errado -> reveja a secao 1.

# A rota de login tem que ser servida pelo NEST:
curl -i -X POST https://api.SEUDOMINIO.com/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"invalido@x.com","password":"errada"}'
# Esperado: 401. Um 401 aqui e SUCESSO — prova que a API respondeu.
```

Depois, no navegador: um login com senha errada deve dizer **"Email ou senha
incorretos"**. Se ainda disser **"Não foi possível conectar ao servidor"**, o
frontend não está alcançando a API — confira `NEXT_PUBLIC_API_URL` **no build da
imagem**, não no `.env`.

---

## 10. Kill switch e reversão

O nível 1 precisa estar testado **antes** do go-live. Se não der para reverter em
menos de 5 segundos às 3 da manhã, o plano não está pronto.

```bash
# Nivel 1 — KILL SWITCH: tira o NOMA do ar, deixa tudo instalado (~2 s)
sudo rm /etc/nginx/sites-enabled/noma && sudo nginx -t && sudo systemctl reload nginx

# Nivel 2 — para os containers, libera CPU e RAM (~10 s)
cd /opt/noma && sudo docker compose -f docker-compose.prod.yml down

# Nivel 3 — remove rede e imagens (~1 min)
sudo docker network rm noma_noma_net
sudo docker image prune -a --filter label=projeto=noma

# Nivel 4 — apaga tudo, INCLUSIVE DADOS (irreversivel; so com backup)
cd /opt/noma && sudo docker compose -f docker-compose.prod.yml down -v
sudo rm -rf /opt/noma

# Nivel 0 — restaurar snapshot do painel: volta a MAQUINA INTEIRA, inclusive os
# dados do SB Clips gerados depois do snapshot. Ultimo recurso.
```

---

## 11. Regras operacionais permanentes

- **Nenhum build na máquina. Nunca.** `pnpm install` do monorepo são centenas de
  MB sustentados — exatamente o padrão que dispara o estrangulamento do provedor,
  que derruba a saída da **máquina inteira** por 8–20 min.
- Deploy só em janela de baixo uso do SB Clips, **nunca** durante um render.
- `nginx -t && systemctl reload nginx`. Sempre nessa ordem, sempre `reload`.
- `RUN_DB_PUSH=false` no dia a dia. `pg_dump` antes de qualquer mudança de schema
  (backup do painel é **semanal** — até 7 dias de dados em risco).
- Alarme em **80% de `/`** (160 GB de 200 GB). Disco cheio = ffmpeg não escreve =
  SB Clips para.
- `certbot renew --dry-run` mensal: a renovação roda `nginx reload`, e uma config
  do NOMA quebrada faz o certificado do **SB Clips** não renovar.

---

## 12. Monitoração — montar antes de subir, não depois

```bash
# A cada minuto, os DOIS sites
curl -sfo /dev/null -w '%{http_code} %{time_total}\n' https://sbclips.SEUDOMINIO.com/
curl -sfo /dev/null -w '%{http_code} %{time_total}\n' https://noma.SEUDOMINIO.com/
```

Precisa ser **monitor externo**: o interno não detecta estrangulamento de rede,
porque a máquina se enxerga bem enquanto está isolada do mundo. Guarde o PSI
antes/depois como linha de base:

```bash
cat /proc/pressure/cpu /proc/pressure/io /proc/pressure/memory
```
