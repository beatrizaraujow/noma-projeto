# Coexistência do NOMA com o SB Clips na mesma máquina

> **Status: RASCUNHO PARA APROVAÇÃO — aguardando dados do inventário.**
> Nenhum comando que altere a máquina foi executado. Este documento contém o
> método de levantamento, as decisões que não dependem de medição, e as fórmulas
> que serão preenchidas com os números reais assim que o inventário for colhido.
>
> **Data:** 2026-08-11 · **Autor:** Claude (Opus 5) · **Aprovação pendente:** Anny Beatriz

---

## Sumário

- [0. Aviso: o que este documento ainda não tem](#0-aviso-o-que-este-documento-ainda-não-tem)
- [1. Achados reais do repositório NOMA](#1-achados-reais-do-repositório-noma)
- [1.1 Inventário parcial: o que o painel Hostinger já responde](#11-inventário-parcial-o-que-o-painel-hostinger-já-responde)
- [2. O modelo mental: o que "competir" significa](#2-o-modelo-mental-o-que-competir-significa)
- [3. Inventário: como medir, e por que média mente](#3-inventário-como-medir-e-por-que-média-mente)
- [4. Direto na máquina vs. container](#4-direto-na-máquina-vs-container)
- [5. Como limitar de verdade (requisito, não opção)](#5-como-limitar-de-verdade-requisito-não-opção)
- [6. Nginx compartilhado](#6-nginx-compartilhado)
- [7. Redes Docker e o furo do firewall](#7-redes-docker-e-o-furo-do-firewall)
- [8. A rede do provedor: o risco que derruba a máquina inteira](#8-a-rede-do-provedor-o-risco-que-derruba-a-máquina-inteira)
- [9. Proposta: portas, limites, layout](#9-proposta-portas-limites-layout)
- [10. Análise de risco](#10-análise-de-risco)
- [11. Plano de reversão](#11-plano-de-reversão)
- [12. Recomendação final](#12-recomendação-final)
- [13. Próximos passos e checklist de aprovação](#13-próximos-passos-e-checklist-de-aprovação)

---

## 0. Aviso: o que este documento ainda não tem

Não há acesso SSH à máquina do SB Clips a partir da estação onde este documento
foi escrito. Portanto **não há inventário com dados reais aqui** — e não vou
inventar números.

O que existe:

| Item | Estado |
|---|---|
| Método de levantamento + script pronto | ✅ [`scripts/inventario-servidor.sh`](../scripts/inventario-servidor.sh) |
| Achados reais do repositório NOMA | ✅ medidos no código |
| Decisões de porta, rede, Nginx, reversão | ✅ prontas |
| Fórmula de dimensionamento | ✅ pronta |
| Hardware e envelope de capacidade | ✅ painel Hostinger — ver §1.1 |
| **Pico do SB Clips durante um render** | ⏳ **depende de rodar o script** |
| Processos, portas, containers, firewall real | ⏳ **depende de rodar o script** |

**Nada foi alterado na máquina.** O script anexo é somente-leitura: lê `/proc`,
`/sys` e executa comandos de consulta. Não instala pacote, não para serviço, não
escreve arquivo.

---

## 1. Achados reais do repositório NOMA

Estes sete pontos foram verificados no código e **mudam a proposta**. Três deles
são bugs latentes que quebrariam a máquina se o material do repositório fosse
usado como está.

| # | Achado | Onde | Consequência |
|---|---|---|---|
| 1 | `docker-compose.yml` publica **`5432:5432`** e **`6379:6379`** em `0.0.0.0` | [`docker-compose.yml:8-9,15-16`](../docker-compose.yml) | 🔴 **Postgres e Redis expostos na internet**, mesmo com o firewall fechado. Ver §7.3 |
| 2 | `nginx.conf` tem `limit_req_zone` **dentro de um bloco `server`** | [`nginx.conf:49`](../nginx.conf) | 🔴 Diretiva só é válida no contexto `http`. `nginx -t` **falha**. Se alguém der `restart` em vez de `reload`, **os dois sites caem** |
| 3 | `ecosystem.config.js` (PM2) fixa **web na porta 3000** | [`ecosystem.config.js:31`](../ecosystem.config.js) | 🔴 Colisão direta com o frontend do SB Clips. Além disso, PM2 roda **sem cgroups** — `max_memory_restart` reage *depois* do estouro, não protege o vizinho |
| 4 | Dockerfile da API é **single-stage**, com `COPY . .` após `pnpm install` completo | [`apps/api/Dockerfile:16-20`](../apps/api/Dockerfile) | 🟠 Imagem carrega `node_modules` de dev + fonte inteira → ~1–2 GB por deploy → risco de estrangulamento da rede (§8) |
| 5 | **Não existe Dockerfile para `apps/web`** | `apps/web/` só tem `vercel.json` | 🟡 O frontend hoje sai pela Vercel. Trazê-lo é criar infra nova, não mover |
| 6 | `next.config.js` **não tem `output: 'standalone'`** | [`apps/web/next.config.js`](../apps/web/next.config.js) | 🟡 Imagem do Next ficaria centenas de MB maior do que precisa |
| 7 | API escuta em `0.0.0.0` na porta de `process.env.PORT` | [`apps/api/src/main.ts:64-65`](../apps/api/src/main.ts) | ✅ Bom: porta configurável. O bind `0.0.0.0` **dentro** do container está correto; quem restringe é a publicação no host |

Complementos do [`CLAUDE.md`](../CLAUDE.md) com efeito direto na infra: a API usa
**Socket.io** (impacta `worker_connections` do Nginx, §6.3), tem módulo de
**attachments** (impacta `client_max_body_size` e banda), e roda
`prisma db push --accept-data-loss` no boot do container (risco de dados, §10).

---

## 1.1 Inventário parcial: o que o painel Hostinger já responde

Fonte: painel do VPS, leitura em **2026-08-11**. Isto cobre o *envelope de
capacidade*. **Não cobre** o pico, que continua sendo o dado decisivo.

### Hardware — confirmado

| Item | Valor |
|---|---|
| Plano | Hostinger **KVM 4** (renova 2026-09-01, renovação automática ativa) |
| CPU | **4 vCPU** |
| Memória | **16 GB** |
| Disco | **200 GB** — 65 GB usados, **135 GB livres** |
| Banda | **16 TB/mês** — 0,002 TB usados (≈ 2 GB) |
| SO | **Ubuntu 22.04 LTS** |
| Localização | Brasil — Campinas |
| Uptime | 41 dias |
| Backups | Semanal + 2 snapshots. Backup diário é upsell (não contratado) |
| Firewall do painel | **4 regras** (conteúdo desconhecido — precisa conferir) |
| Detector de malware | Não instalado |

> O IPv4 e o hostname aparecem no painel e foram deliberadamente **omitidos deste
> arquivo**, porque ele vive num repositório Git. Se o repositório for público, um
> IP de produção documentado é um convite a varredura.

### Leitura em repouso — e por que ela não decide nada

| Métrica | Painel | Tradução |
|---|---|---|
| Uso de CPU | **1%** | ≈ 0,04 de 4 vCPU |
| Uso de memória | **16%** | ≈ 2,6 GB de 16 GB |
| Tráfego | 1,1 MB entrada / 0,9 MB saída | irrisório |

**Não havia render rodando quando essa leitura foi tirada.** O painel agrega numa
janela larga, que é exatamente onde o pico do ffmpeg desaparece (§3.1). Estes
números dizem *"a máquina está ociosa a maior parte do tempo"* — o que é uma boa
notícia — mas **não** dizem quanto sobra durante um processamento. Essa continua
sendo a medição obrigatória.

### O que o painel não responde (e o script responde)

- Quais serviços e containers rodam, e quanto cada um consome
- Quais portas estão ocupadas e por qual processo
- Quais são as 4 regras do firewall do painel e qual a política padrão
- Se há histórico de OOM kill
- Se `sar` existe, se há cron/timers competindo
- Qual a sub-rede Docker já alocada
- Quanto o ffmpeg pica em CPU, memória e I/O

### O que já muda na proposta

1. **Memória deixou de ser restrição.** 16 GB, com 2,6 GB em uso. Mesmo num cenário
   pessimista de ffmpeg picando em 6 GB, sobram ~6 GB para o NOMA — que precisa de
   ~3 GB. Folga confortável.
2. **CPU é a única restrição real.** São 4 vCPU, e o ffmpeg com `-threads 0` satura
   todos. Durante um render, o "disponível" tende a zero. A estratégia não pode ser
   *"usar o que sobra"* — tem que ser *"dividir de forma previsível"* (§9.2).
3. **Disco é folgado.** 135 GB livres para um app que precisa de ~30 GB.
4. **A cota de banda é irrelevante.** 16 TB contra 2 GB usados. O risco continua
   sendo a **taxa sustentada**, não o volume (§8) — quota grande não protege contra
   estrangulamento.
5. **Ubuntu 22.04 confirma o ferramental.** Kernel 5.15 com **PSI habilitado** e
   **cgroup v2 unificado** por padrão. Todas as técnicas de limite deste documento
   se aplicam diretamente, sem adaptação.
6. **Snapshots existem → ganhamos um nível 0 de reversão** (§11): tirar um snapshot
   antes da instalação permite reverter a **máquina inteira**.

### Observações de segurança levantadas de passagem

Fora do escopo pedido, mas registro porque um comprometimento da máquina derruba
os dois produtos:

- **Acesso root por SSH com senha, em IP público.** Recomendado migrar para chave
  (o painel já tem "Chave SSH → Gerenciar") e `PermitRootLogin prohibit-password`.
- **As 4 regras do firewall do painel precisam ser conferidas.** Se forem uma
  whitelist de 22/80/443 com política padrão *deny*, elas ficam **na borda da rede,
  antes da máquina** — e isso mitiga o furo do Docker/UFW (§7.3) no perímetro. Se
  forem permissivas, não mitigam nada. Muda a severidade do risco nº 1.
- **Backup semanal apenas.** Entre dois backups há até 7 dias de dados do NOMA em
  risco. Considerar `pg_dump` diário local (barato, não usa banda).
- **41 dias de uptime** sugerem kernel desatualizado. Vale checar
  `/var/run/reboot-required`: um reboot inesperado por *unattended-upgrades*
  derruba os dois produtos.

---

## 2. O modelo mental: o que "competir" significa

Uma máquina compartilhada não tem "espaço sobrando". Tem **cinco recursos
disputados**, e cada um falha de um jeito diferente.

### 2.1 CPU — degrada, não quebra

É fatiada no tempo. Se o ffmpeg quer 4 núcleos e o NOMA quer 2, ninguém trava —
os dois ficam **mais lentos**. O sintoma é um render que demorava 3 min passar a
demorar 7. Difícil de perceber, fácil de culpar a coisa errada.

### 2.2 Memória — finita e brutal

Não é fatiada. Quando acaba, o kernel escolhe uma vítima e a **mata**. O critério
(*badness score*) é essencialmente *quem está usando mais memória*.

> **Ponto central de todo este trabalho:** um vazamento no NOMA pode fazer o
> kernel matar o **ffmpeg ou o Postgres do SB Clips**. A falha é sua, a morte é do
> vizinho. Isolamento existe exatamente para impedir isso.

### 2.3 Disco — dois recursos que as pessoas confundem

- **Espaço**: disco cheio = ffmpeg não escreve o vídeo, Postgres para de aceitar
  escrita. É a falha mais silenciosa e a mais fácil de causar (log de container
  sem rotação enche `/` sozinho).
- **IOPS/throughput**: ffmpeg lê e escreve arquivos grandes em sequência; banco
  faz acessos pequenos e aleatórios. Os dois na mesma fila se atrapalham muito.
- **O efeito escondido — page cache**: quando o ffmpeg passa um vídeo de 2 GB pela
  máquina, o kernel enche a cache com esses bytes e **despeja a cache do
  Postgres**. O banco não quebra, só fica lento sem explicação aparente. Quase
  ninguém mede isso.

### 2.4 Rede — não degrada, pune

No nosso caso não é largura de banda, é uma **penalidade**: passar do ritmo por
mais de um minuto derruba a saída da máquina inteira por 8 a 20 minutos. Isso não
é lentidão, é **indisponibilidade**, e atinge os dois produtos. Seção própria: §8.

### 2.5 O que não é hardware: nomes e portas

Porta 3000 é um recurso de exatamente uma unidade. Nome de domínio no Nginx idem.
Sub-rede Docker idem. Colisão aqui não degrada — **quebra na hora**.

> A pergunta certa nunca é "cabe?". É: **"quando o SB Clips estiver no pior momento
> dele, quanto sobra?"** — porque é exatamente aí que o NOMA vai estar competindo.

---

## 3. Inventário: como medir, e por que média mente

### 3.1 Por que média mente

Uma máquina com CPU média de 20% pode estar 100% saturada durante os 6 minutos em
que o ffmpeg roda. A média de 24 h esconde justamente o instante que importa.

Três formas de ver o pico, da melhor para a pior:

#### (a) PSI — Pressure Stall Information (`/proc/pressure/*`)

A melhor ferramenta e a menos conhecida. Não mede "quanto de CPU foi usado", mede
**quanto tempo alguém ficou parado esperando** por CPU, memória ou I/O. É a
diferença entre "o carro está a 100 km/h" e "o carro está preso no trânsito".

```
some avg10=0.00 avg60=0.00 avg300=0.00 total=0
full avg10=0.00 avg60=0.00 avg300=0.00 total=0
```

- `some` = pelo menos uma tarefa travada esperando → já indica disputa
- `full` = **todas** travadas → saturação séria
- `avg10` = média dos últimos 10 s → é onde o pico aparece

**Régua prática:** `some avg10` de CPU acima de ~10% já significa fila; acima de
30% significa que adicionar carga vai doer. Em `io`, qualquer `full` > 0 sustentado
é sinal vermelho.

#### (b) `sar` (pacote sysstat)

Se já estiver instalado, guarda histórico de 10 em 10 minutos dos últimos dias — o
único jeito de ver o pico de *ontem*. **Não instalar agora**: instalar altera a
máquina, e a regra desta fase é não alterar nada.

#### (c) Amostragem ativa

Se não houver `sar`, mede-se rodando um loop durante um processamento real. É o
modo `--amostrar` do script.

### 3.2 Pico de memória de um processo — o dado mais útil e mais esquecido

`ps` mostra a memória **agora**. Se o ffmpeg picou em 3 GB há 20 segundos e caiu
para 400 MB, o `ps` engana completamente. O kernel guarda o pico histórico:

```bash
grep -E 'VmHWM|VmRSS' /proc/<pid>/status
# VmHWM = High Water Mark = maior RSS que esse processo JÁ atingiu na vida
```

O `VmHWM` do ffmpeg é literalmente o número que define quanta memória o NOMA
**não** pode ter.

### 3.3 Detalhe que quase todo mundo erra: portas do Docker

`ss -tulpn` mostra `docker-proxy` como dono das portas publicadas — o que não diz
*qual container*. Por isso o script cruza com `docker ps --format '{{.Ports}}'`.
Sem esse cruzamento, o inventário de portas fica inútil.

### 3.4 O script de coleta

**Arquivo:** [`scripts/inventario-servidor.sh`](../scripts/inventario-servidor.sh)

Cobre em 13 seções: identidade → recursos → PSI → histórico `sar` → serviços
systemd (com consumo **por cgroup** via `systemd-cgtop`, que mostra qual *serviço*
gasta, não qual processo) → top 20 CPU/memória + `VmHWM` → portas com dono →
Docker (containers, limites já aplicados, redes e **sub-redes ocupadas**, disco por
imagem/volume, tamanho dos logs, config do daemon) → Nginx (sites, `server_name`,
`default_server`, `worker_connections`, `nginx -t`, certificados) → firewall
(**inclusive a cadeia `nat/DOCKER`**) → tráfego acumulado → **OOM kills passados**
e erros do journal → cron/timers.

```bash
# copiar
scp scripts/inventario-servidor.sh usuario@servidor:~/

# Fase 1 — em repouso
ssh usuario@servidor 'sudo bash ~/inventario-servidor.sh' > inventario-repouso.txt

# Fase 2 — DURANTE um render real de vídeo (10 min, amostra a cada 2 s)
ssh usuario@servidor 'sudo bash ~/inventario-servidor.sh --amostrar 600' > inventario-render.csv
```

> Sem `sudo`, o `ss` não mostra o dono de cada porta e o `dmesg` fica inacessível —
> o levantamento fica incompleto.

### 3.5 O que extrair do CSV da fase 2

| Coluna | O que representa | Como usa |
|---|---|---|
| `cpu_idle_pct` **mínimo** | CPU que sobra no pior instante | define o teto de CPU do NOMA |
| `mem_disp_MB` **mínimo** | RAM que sobra no pior instante | define o teto de memória do NOMA |
| `swap_usada_MB` subindo | a máquina já está apertada hoje | se subir, **não adicione carga** |
| `psi_cpu_avg10` / `psi_io_avg10` | se já existe fila | > 10% = qualquer container novo piora |
| delta de `tx_MB` por minuto | banda que o SB Clips já usa | quanto sobra do orçamento de banda |
| `ffmpeg_rss_MB` pico | memória que o ffmpeg reserva | subtrair do total, sempre |

Rodar a fase 2 **duas ou três vezes**, em vídeos de tamanhos diferentes. Um render
de 30 s e um de 20 min têm perfis distintos.

---

## 4. Direto na máquina vs. container

### 4.1 O que é um container, de verdade

Um container **não é uma máquina virtual**. Não há kernel próprio nem emulação. É
um processo Linux comum com dois mecanismos aplicados:

- **Namespaces** = *o que o processo enxerga*. PID (acha que é o processo 1),
  network (interface e rotas próprias), mount (sistema de arquivos próprio). Isso
  é **visibilidade**.
- **cgroups** (control groups) = *quanto o processo pode consumir*. CPU, memória,
  I/O, número de processos. Isso é **limite**.

Para o nosso problema, **namespaces são conveniência; cgroups são a proteção**.
Container sem limite de recursos protege o vizinho quase nada.

### 4.2 O argumento decisivo: o domínio do OOM

Sem cgroup existe **um** domínio de memória: a máquina inteira. Acabou a RAM → o
kernel escolhe a maior vítima do sistema → pode ser o ffmpeg, pode ser o Postgres
do SB Clips.

Com `--memory` num cgroup, cria-se um **domínio de OOM local**. O NOMA estourou o
próprio limite? O kernel mata algo **dentro do cgroup do NOMA**. O resto da máquina
nem percebe.

> **Sem limite, a sua falha vira a falha do vizinho. Com limite, a sua falha fica
> sua.**

### 4.3 Comparação honesta

| Critério | Direto na máquina (systemd/PM2) | Container com limites |
|---|---|---|
| Limite de CPU/memória | Possível com `CPUQuota=`/`MemoryMax=` no unit systemd. **PM2 não tem** | Nativo e explícito |
| Domínio de OOM isolado | Sim, se configurar `MemoryMax` | Sim, por desenho |
| Conflito de dependências (Node, glibc, Prisma) | Alto | Zero |
| Reverter | Desinstalar, caçar arquivo por arquivo | `docker compose down` — some tudo |
| Custo de RAM | Menor | +30–80 MB por container |
| Custo de disco | Menor | Imagens somam GBs |
| Complexidade de rede | Simples | Exige entender bridge/publicação (§7) |

**Nuance importante:** systemd com `MemoryMax=` e `CPUQuota=` usa **exatamente os
mesmos cgroups** que o Docker. Tecnicamente, "direto na máquina + unit systemd bem
escrito" isola tão bem quanto container. O que o container ganha de fato é
**isolamento de dependências** e **reversão limpa**.

**PM2 é o pior dos mundos aqui**: o `max_memory_restart: '1G'` do
[`ecosystem.config.js`](../ecosystem.config.js) reage *depois* que o processo já
consumiu a memória — não impede o pico, só reinicia depois do estrago. Não é
proteção para o vizinho.

**Decisão: Docker com limites explícitos.** Já existe Docker na máquina, o NOMA
precisa de Postgres e Redis próprios, e a reversão limpa é requisito.

---

## 5. Como limitar de verdade (requisito, não opção)

### 5.1 CPU — dois mecanismos, escolha consciente

**Teto duro — `--cpus=1.5`.** Vira `cpu.max = "150000 100000"` no cgroup v2: *"em
cada janela de 100 ms, esse grupo usa no máximo 150 ms de CPU somando todos os
núcleos"*. É absoluto: mesmo com a máquina ociosa, o NOMA não passa disso.

**Peso relativo — `--cpu-shares=512`** (vira `cpu.weight`). Só age **sob disputa**.
Padrão 1024; com 512 o NOMA recebe metade do que o vizinho recebe quando ambos
querem CPU. Se ninguém mais quer, usa tudo.

| | Teto duro | Peso |
|---|---|---|
| Previsível | Sim | Não |
| Aproveita ociosidade | Não (desperdiça) | Sim |
| Protege o vizinho no pico | Sim | Sim |
| Risco | Latência artificial (*throttling*) | Comportamento varia com a carga |

**Decisão: usar os dois.** Teto duro dimensionado pelo `cpu_idle` mínimo medido,
**mais** peso reduzido — assim, no instante em que o ffmpeg mais precisa, o
escalonador dá preferência a ele.

**Armadilha do teto duro — CFS throttling.** Se o Node atinge a cota no meio da
janela de 100 ms, ele fica **congelado até a janela virar**. Em app Node com picos
curtos (GC, um request pesado), isso vira latência de dezenas de ms do nada — é o
problema clássico do Kubernetes. Mitigação: **não apertar até o osso; dar ~30% de
folga sobre o consumo medido.**

### 5.2 Memória — onde mora o erro caro

```yaml
mem_limit: 768m
memswap_limit: 768m     # <<< IGUAL a mem_limit
mem_swappiness: 0
```

**Por que `memswap_limit` precisa estar lá:** `--memory-swap` é o total de
*memória + swap*. Se você define `--memory=768m` e **não** define `--memory-swap`,
o Docker permite o dobro no total — ou seja, mais 768 MB **em swap**. O container
"respeita" o limite de RAM e ao mesmo tempo martela o disco com paginação,
**atacando o vizinho pelo I/O em vez da RAM**. Você acha que isolou e apenas trocou
o canal do dano. Igualar os dois valores desliga o swap para aquele container.

**Nunca usar `--oom-kill-disable`.** Ele não salva o container — congela ele
esperando memória que não vem.

**Node precisa saber do limite.** O V8 dimensiona o heap por conta própria e pode
crescer além do cgroup — aí o container morre com **exit 137** (128+9 = SIGKILL) e
você caça fantasma. Alinhar explicitamente em ~70–75% do limite:

```
NODE_OPTIONS=--max-old-space-size=560     # para um container de 768m
```

**Redis sem `maxmemory` é uma bomba.** Cresce até o limite do container e morre:

```
redis-server --maxmemory 200mb --maxmemory-policy allkeys-lru
```

**Postgres:** `shared_buffers` ≈ 25% da memória do container. Ele *espera* usar o
page cache do sistema — que, como visto em §2.3, o ffmpeg vai despejar. Assuma que
o Postgres do NOMA vai ler mais do disco do que leria numa máquina dedicada.

### 5.3 Disco — o limite mais fraco dos três (seja honesta sobre isso)

Não existe flag simples e universal para "esse container não passa de 10 GB".
`--storage-opt size=10G` só funciona em overlay2 sobre XFS com `prjquota`
habilitado. As defesas que **realmente** funcionam:

```yaml
logging:
  driver: json-file
  options: { max-size: "10m", max-file: "3" }   # sem isso, o log cresce sem fim
pids_limit: 200                                  # trava fork bomb
```

Log de container sem rotação é uma das causas mais comuns de disco cheio em
servidor compartilhado — e disco cheio = ffmpeg não escreve = **SB Clips para**.
Além disso: volume dedicado para os dados do NOMA e **alarme em 80% de uso de `/`**.

### 5.4 Política de restart

`restart: unless-stopped` parece bom, mas em *crash loop* vira um container
reiniciando 20×/min queimando CPU. Preferir `on-failure:5` — falhou cinco vezes,
para e avisa, em vez de brigar por CPU eternamente.

---

## 6. Nginx compartilhado

### 6.1 Como um Nginx serve vários sites

O navegador manda `Host: noma.dominio.com` no cabeçalho HTTP. O Nginx compara com
o `server_name` de cada bloco `server {}` e escolhe. Em HTTPS há um passo antes: o
**SNI**, no handshake TLS, informa o domínio *antes* de a conexão criptografada
existir — é isso que permite certificados diferentes na mesma porta 443.

Convenção Debian/Ubuntu: arquivo real em `sites-available/`, symlink em
`sites-enabled/`. **Habilitar = criar symlink. Desabilitar = apagar symlink.** É
por isso que a reversão é trivial.

> **Regra nº 1: nunca editar o arquivo do SB Clips.** Criar
> `sites-available/noma` novo, separado. Arquivo não tocado não quebra por edição.

### 6.2 As duas maneiras de derrubar o SB Clips com o Nginx

**(a) `default_server` duplicado.** Se o bloco do NOMA declarar
`listen 443 ssl default_server` e o do SB Clips também, o Nginx **recusa a
configuração inteira**. E se só o NOMA declarar, todo request que não casa com
nenhum `server_name` — inclusive acesso por IP — vai para o NOMA.
**Solução: no bloco do NOMA, nunca escrever `default_server`.**

**(b) `restart` em vez de `reload`.** Esta é a diferença entre uma mudança segura e
um incidente:

| | `nginx -t` | `systemctl reload` (SIGHUP) | `systemctl restart` |
|---|---|---|---|
| O que faz | Valida sintaxe e abre os arquivos referenciados | Master lê a nova config; **se inválida, mantém os workers antigos** e loga o erro | Mata tudo e sobe de novo |
| Downtime | Nenhum | Nenhum | **Sim — derruba o SB Clips** |
| Se a config estiver quebrada | Avisa | Nada acontece, continua servindo o antigo | **Não sobe. Os dois sites caem.** |

**Regra absoluta, sempre nessa ordem:**

```bash
sudo nginx -t && sudo systemctl reload nginx
```

O `&&` é o que importa: se o teste falhar, o reload nem roda.

> ⚠️ **Isto não é hipotético neste repositório.** O [`nginx.conf:49`](../nginx.conf)
> tem `limit_req_zone` dentro de um bloco `server` — diretiva válida apenas no
> contexto `http`. Copiar esse arquivo para `sites-enabled/` faz o `nginx -t`
> falhar. Se alguém der `restart` para "resolver", **os dois sites caem**. Esse
> arquivo precisa ser corrigido antes de ser usado como base.

**Limite do `nginx -t`:** valida sintaxe e existência de arquivos (inclusive
certificados). **Não** valida se o `proxy_pass` aponta para algo vivo, nem se o
roteamento faz sentido. Config sintaticamente perfeita apontando para o lugar
errado passa no teste e quebra na prática. O teste de verdade é com `curl` (§6.4).

### 6.3 O acoplamento invisível: `worker_connections`

O risco mais sutil de todos, e específico do NOMA por causa do Socket.io.

O Nginx tem um teto global de conexões simultâneas:
`worker_processes × worker_connections` (padrão Debian: 768–1024 por worker).
**Cada conexão WebSocket ocupa dois slots** — navegador→Nginx e Nginx→backend — e
fica aberta *por horas*.

Ou seja: **200 usuários do NOMA com o app aberto consomem ~400 slots permanentes de
um pool que o SB Clips compartilha.** Estourou o pool → o Nginx recusa conexões
**de ambos os sites**. Não há mensagem óbvia; só aparece
`worker_connections are not enough` no error log.

Mitigação, dimensionada pelo número esperado de usuários simultâneos:

```nginx
worker_rlimit_nofile 8192;
events { worker_connections 4096; }
```

E monitorar via `stub_status`.

### 6.4 Como testar antes de expor

Cinco passos, nessa ordem exata:

```bash
# 1. Backup ANTES de qualquer coisa
sudo cp -a /etc/nginx /root/backup-nginx-$(date +%F-%H%M)

# 2. Validar os containers SEM Nginx
curl -I http://127.0.0.1:3100
curl -I http://127.0.0.1:3101/api/docs

# 3. Criar sites-available/noma (SEM symlink ainda) e testar sanidade
sudo nginx -t

# 4. Criar o symlink e aplicar
sudo ln -s /etc/nginx/sites-available/noma /etc/nginx/sites-enabled/noma
sudo nginx -t && sudo systemctl reload nginx

# 5. Testar SEM depender de DNS, forçando o cabeçalho Host
curl -I -H 'Host: noma.dominio.com'    http://127.0.0.1/   # NOMA responde?
curl -I -H 'Host: sbclips.dominio.com' http://127.0.0.1/   # SB Clips continua igual?
curl -I                                 http://127.0.0.1/   # IP puro ainda vai pro SB Clips?
```

O terceiro teste do passo 5 é o que pega o `default_server` roubado.

**Reversão, em ~1 segundo:**

```bash
sudo rm /etc/nginx/sites-enabled/noma && sudo nginx -t && sudo systemctl reload nginx
```

### 6.5 Certificado TLS — cuidado com o certbot

`sudo certbot --nginx` **edita os arquivos de configuração existentes** para
inserir as diretivas de SSL. Num servidor compartilhado, isso é encostar num
arquivo que prometemos não tocar. Mais seguro:

```bash
sudo certbot certonly --webroot -w /var/www/html -d noma.dominio.com
```

Ele só emite o certificado; **nós** escrevemos o bloco `server` à mão. O DNS
precisa já apontar para o IP e a porta 80 precisa estar acessível (está — o
firewall abre 80).

> **Risco cruzado que quase ninguém antecipa:** a renovação automática do certbot
> roda um hook que faz `nginx reload`. Se, semanas depois, a config do NOMA estiver
> quebrada, esse reload agendado falha e o certificado do **SB Clips** não renova.
> Manter a config do NOMA sempre válida é obrigação contínua, não só do dia da
> instalação.

### 6.6 O bloco do NOMA

```nginx
server {
    listen 443 ssl http2;              # SEM default_server
    server_name noma.dominio.com;      # SÓ o domínio do NOMA

    ssl_certificate     /etc/letsencrypt/live/noma.dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/noma.dominio.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    client_max_body_size 25m;          # padrão é 1m -> anexos dariam 413
    limit_rate_after 5m;               # ver §8.3: teto de banda de saída
    limit_rate 2m;

    location / {                        # frontend Next
        proxy_pass http://127.0.0.1:3100;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {                    # backend Nest
        proxy_pass http://127.0.0.1:3101;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /socket.io/ {              # WebSocket exige upgrade explícito
        proxy_pass http://127.0.0.1:3101;
        proxy_http_version 1.1;
        proxy_set_header Upgrade    $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host       $host;
        proxy_read_timeout 300s;        # padrão 60s derruba a conexão
    }
}

# O limit_req_zone, se usado, vai no contexto http (ex.: /etc/nginx/conf.d/noma-limits.conf),
# NUNCA dentro do bloco server -- ver o bug em nginx.conf:49.
```

Detalhes que importam:

- `X-Forwarded-For` é **obrigatório** — a API resolve o IP real dele para o rate
  limit ([`main.ts:16-20`](../apps/api/src/main.ts)).
- `client_max_body_size` padrão de 1 MB quebraria o módulo de anexos com **413**.
- Sem o bloco de `upgrade`, o Socket.io cai para long-polling e multiplica requests.

---

## 7. Redes Docker e o furo do firewall

### 7.1 Como funciona

Cada rede Docker do tipo *bridge* é um switch virtual com sub-rede privada própria.
A `bridge` padrão (`docker0`, geralmente `172.17.0.0/16`) é legada — **não tem DNS
entre containers**. Uma rede criada por você ("user-defined bridge") ganha:

- **DNS embutido**: um container alcança o outro pelo *nome* (`postgres:5432`), sem
  IP fixo.
- **Isolamento entre redes**: o Docker instala regras `DOCKER-ISOLATION-STAGE-*` no
  iptables que **bloqueiam tráfego entre bridges diferentes**. Na prática: os
  containers do NOMA não conseguem falar com os do SB Clips, e vice-versa. É uma
  vantagem de segurança de graça.

### 7.2 Colisão de sub-rede

O Docker aloca sub-redes de um pool padrão (a partir de `172.17.0.0/16`). Se ele
escolher uma faixa que a máquina já usa — VPN, rede privada do provedor, rota
interna — **o roteamento da máquina inteira quebra**, não só o do container. Por
isso o script coleta `ip route` + `docker network inspect` de todas as redes. Com
isso em mãos, fixamos a nossa explicitamente:

```yaml
networks:
  noma_net:
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/24    # escolhida DEPOIS de ver o que já existe
```

> **Alerta operacional:** mudar o pool global em `/etc/docker/daemon.json` **exige
> reiniciar o daemon Docker** — o que **reinicia os containers do SB Clips**.
> Existe `"live-restore": true` para containers sobreviverem ao restart do daemon,
> mas *habilitar* essa opção também exige um restart. Ovo e galinha.
> **Conclusão: não mexer no daemon.** Fixar a sub-rede no compose não exige restart
> de nada.

### 7.3 🔴 O furo: Docker fura o UFW

**Este é o ponto mais importante desta seção.**

Ao publicar uma porta (`-p 5432:5432`), o Docker insere uma regra de **DNAT na
tabela `nat`, cadeia `PREROUTING`/`DOCKER`**. O pacote é redirecionado ali e depois
segue pela cadeia **`FORWARD`**. As regras do UFW vivem na cadeia **`INPUT`** — que
**esse pacote nunca atravessa**.

Resultado: **`ufw status` diz "só 22, 80 e 443", e mesmo assim a porta publicada
está aberta na internet.** É um dos furos mais explorados em VPS — scanners varrem
a internet atrás de Postgres e Redis expostos em questão de minutos.

E o [`docker-compose.yml`](../docker-compose.yml) deste repositório publica
exatamente `5432:5432` e `6379:6379`. Subir esse arquivo nessa máquina, sem
alterar, **expõe o banco do NOMA** — e um Redis sem senha exposto é
comprometimento da máquina, o que atinge o SB Clips também.

**As três formas corretas, da melhor para a pior:**

1. **Não publicar.** Postgres e Redis só precisam ser alcançados pela API, que está
   na mesma rede Docker. Comunicação por nome (`postgres:5432`), zero exposição no
   host. **É a recomendada.**
2. **Publicar só no loopback**: `127.0.0.1:5433:5432`. Alcançável de dentro da
   máquina (para `psql`, backup), invisível de fora. É o necessário para web e API,
   para o Nginx fazer `proxy_pass`.
3. Regras manuais na cadeia `DOCKER-USER`. Funciona, mas é fácil errar e exige
   manutenção. Evitar se 1 e 2 resolvem.

> **Regra do plano: nenhuma porta do NOMA é publicada em `0.0.0.0`. Nunca. Só em
> `127.0.0.1` — e só as duas de HTTP.**

Isso satisfaz a restrição de firewall por construção: todo serviço do NOMA só é
alcançável de fora **através do Nginx**.

---

## 8. A rede do provedor: o risco que derruba a máquina inteira

Essa restrição é diferente de todas as outras. CPU e memória degradam; **a banda
pune**. Passar do ritmo por mais de um minuto = 8 a 20 minutos sem saída, para os
dois produtos. Não é performance, é **um incidente de disponibilidade
autoprovocado**.

### 8.1 Onde o NOMA move bytes grandes

| Fonte | Volume | Risco | Mitigação |
|---|---|---|---|
| **`docker build` na máquina** | `pnpm install` do monorepo, centenas de MB sustentados | 🔴 **Máximo** — baixar dependências é exatamente o padrão que dispara o estrangulamento | **Nunca buildar na máquina.** Build na GitHub Actions ou local → push para registry |
| **`docker pull` da imagem** | Hoje ~1–2 GB (Dockerfile single-stage) | 🟠 Alto | Reduzir a imagem (§8.2) + janela de baixo tráfego |
| **Download de anexos por usuários** | Contínuo, imprevisível | 🟡 Médio, mas soma com o SB Clips | `limit_rate` no Nginx (§8.3) |
| **Backup do Postgres saindo da máquina** | Cresce com o tempo | 🟠 Alto e recorrente | `rsync --bwlimit` + agendamento noturno |
| **Uploads para cloud storage** (módulo `integrations`) | Variável | 🟡 Médio | Fila com throttle |

### 8.2 Encolher a imagem é mitigação de rede, não estética

O [Dockerfile atual](../apps/api/Dockerfile) instala tudo (dev incluso), copia o
repositório inteiro e mantém tudo na imagem final. Um build **multi-stage** —
compila num estágio, copia só `dist/` + dependências de produção para o estágio
final — reduz tipicamente de **1–2 GB para 200–400 MB**. Menos bytes por deploy =
menos chance de gatilhar o estrangulamento.

No frontend, `output: 'standalone'` no
[`next.config.js`](../apps/web/next.config.js) faz o Next gerar uma pasta
autocontida com só o necessário, cortando a mesma ordem de grandeza.

> **Duas mudanças no repositório reduzem materialmente o risco de rede em
> produção.** Vale fazer antes de instalar qualquer coisa no servidor.

### 8.3 Limitar a banda de saída

O único ponto onde controlamos a saída do NOMA com precisão é o Nginx:

```nginx
limit_rate_after 5m;    # os primeiros 5 MB saem cheios (páginas carregam rápido)
limit_rate 2m;          # depois disso, 2 MB/s por conexão
limit_conn_zone $binary_remote_addr zone=noma_conn:10m;   # contexto http!
limit_conn noma_conn 5; # no máx. 5 conexões simultâneas por IP
```

O `limit_rate_after` é elegante: navegação normal (HTML, JS, CSS — arquivos
pequenos) não sente nada; só o download longo é freado. É exatamente o perfil que
dispara o estrangulamento.

Fora do Nginx: `rsync --bwlimit=2m`, `scp -l 16000` (em **Kbit/s**, atenção à
unidade). `docker pull` **não tem limite nativo** — daí a estratégia ser reduzir a
imagem e agendar.

### 8.4 Regras operacionais permanentes

- Deploy do NOMA **só em janela de baixo uso do SB Clips**, e **nunca** em paralelo
  com um render.
- **Nenhum build na máquina. Nunca.**
- Todo backup ou transferência grande com limite de banda explícito e agendado.

---

## 9. Proposta: portas, limites, layout

### 9.1 Portas

Convenção por faixa, para nunca mais haver dúvida sobre quem é dono do quê:

| Serviço | Bind | Porta | Publicada? | Observação |
|---|---|---|---|---|
| SB Clips frontend | — | **3000** | (existente) | Faixa reservada: **3000–3099 = SB Clips** |
| **NOMA web** (Next) | `127.0.0.1` | **3100** | Sim, só loopback | Nginx faz proxy |
| **NOMA api** (Nest) | `127.0.0.1` | **3101** | Sim, só loopback | `PORT=3101`; Nginx faz proxy |
| **NOMA postgres** | rede interna | 5432 (interna) | **Não** | Se precisar de `psql` do host: `127.0.0.1:5433` |
| **NOMA redis** | rede interna | 6379 (interna) | **Não** | Se necessário: `127.0.0.1:6380` |

Faixa reservada: **3100–3199 = NOMA**. Registrar em `/etc/noma/PORTAS.md` na
máquina, para a próxima pessoa não precisar descobrir por tentativa e erro.

> ⏳ As portas 3100/3101/5433/6380 são **candidatas**. Só viram definitivas após o
> `ss -tulpn` do inventário confirmar que estão livres — inclusive fora da faixa
> efêmera do kernel (`/proc/sys/net/ipv4/ip_local_port_range`, normalmente a partir
> de 32768).

> ⚠️ O [`ecosystem.config.js`](../ecosystem.config.js) fixa a web em 3000 e a API em
> 3001. **Ele não pode ser usado nesta máquina** sem alteração — colide com o SB
> Clips.

### 9.2 A fórmula dos limites

Os números dependem da medição. A regra aplicada sobre os dados colhidos:

```
DISPONÍVEL_PARA_NOMA  =  TOTAL
                       − PICO_MEDIDO_DO_SB_CLIPS   (durante o render, não em repouso)
                       − RESERVA_DO_SISTEMA        (SO, Nginx, Docker: ~512 MB e ~0,5 vCPU)
                       − FOLGA_DE_20%              (margem para o pico que não foi medido)
```

**O teto somado de todos os containers do NOMA nunca pode exceder esse valor.** É
por isso que a medição durante o processamento é obrigatória: `PICO_MEDIDO` em
repouso é um número falso.

Distribuição do orçamento, uma vez calculado:

| Container | % do orçamento de CPU | % do de memória | Config específica |
|---|---|---|---|
| `noma-api` | ~45% | ~40% | `NODE_OPTIONS=--max-old-space-size=<70% do limite>` |
| `noma-web` | ~20% | ~20% | idem |
| `noma-postgres` | ~25% | ~30% | `shared_buffers` = 25% do limite do container |
| `noma-redis` | ~10% | ~10% | `--maxmemory <80% do limite> --maxmemory-policy allkeys-lru` |

Em **todos**, sem exceção: `cpu_shares: 512`, `memswap_limit == mem_limit`,
`pids_limit`, rotação de log, `restart: on-failure:5`.

### 9.2.1 Aplicando a fórmula ao hardware real (KVM 4: 4 vCPU / 16 GB / 200 GB)

#### Memória — não é restrição

```
Total ............................. 16,0 GB
− em repouso hoje (16%) ...........  2,6 GB   [medido no painel]
− pico do ffmpeg .................. ~3,0 GB   [A MEDIR — estimativa conservadora]
                                   ---------
  disponível bruto ................ 10,4 GB
− folga de 20% ....................  2,1 GB
                                   =========
  DISPONÍVEL PARA O NOMA .......... ~8,3 GB
```

Mesmo num cenário pessimista de ffmpeg em **6 GB**, sobrariam ~5,9 GB. O NOMA
inteiro precisa de ~3 GB. **Memória sobra em qualquer cenário plausível.**

#### CPU — é a única restrição real

```
Total ............................. 4,00 vCPU
− em repouso hoje (1%) ............ 0,04 vCPU
− ffmpeg durante um render ........ até 4,00 vCPU  ← satura tudo com -threads 0
                                   ================
  disponível durante o render ..... ~0
```

Não dá para "usar o que sobra", porque **não sobra nada durante o render**. A
estratégia tem que ser **dividir de forma previsível**: teto duro no NOMA +
peso reduzido, de modo que o ffmpeg vença a disputa e o NOMA apenas fique lento.

**Teto proposto para o NOMA: 1,5 vCPU (37,5% da máquina), `cpu_shares 512`.**
No pior caso — render e pico de uso do NOMA ao mesmo tempo — o ffmpeg fica com
~2,5 vCPU e o render demora ~35–60% mais. Fora dessa janela (a esmagadora maioria
do tempo, dado 1% de uso médio), ninguém sente nada.

> **Nuance:** a eficácia do `cpu_shares` depende de onde o ffmpeg do SB Clips roda.
> Se ele está num container Docker, os dois cgroups são irmãos e o peso funciona
> como esperado. Se roda solto no host, a hierarquia muda. O inventário revela isso
> (seções 5c e 8c do script).

#### Dimensionamento por container

| Container | `cpus` | `mem_limit` | Config específica |
|---|---|---|---|
| `noma-api` | 0,70 | 1024m | `NODE_OPTIONS=--max-old-space-size=768` |
| `noma-web` | 0,30 | 768m | `NODE_OPTIONS=--max-old-space-size=576` |
| `noma-postgres` | 0,35 | 1024m | `shared_buffers=256MB` |
| `noma-redis` | 0,15 | 256m | `--maxmemory 200mb --maxmemory-policy allkeys-lru` |
| **Total** | **1,50 vCPU** (37,5%) | **~3,0 GB** (19%) | |

Em todos: `memswap_limit == mem_limit`, `cpu_shares: 512`, `pids_limit: 200`,
`logging max-size 10m/max-file 3`, `restart: on-failure:5`.

#### Disco

```
Total 200 GB − 65 GB usados = 135 GB livres

NOMA:  imagens Docker ......... ~2 GB   (multi-stage; ~4 GB sem)
       Postgres ............... ~5 GB   (inicial, cresce)
       uploads/anexos ......... ~20 GB  (teto operacional)
       logs rotacionados ...... ~0,1 GB
                                -------
       TETO DO NOMA ........... 30 GB   (22% do livre)
```

**Alarme obrigatório em 160 GB usados (80% de 200 GB).**

#### Banda

A cota de 16 TB/mês é irrelevante (2 GB usados). O limite é a **taxa sustentada**
(§8): `limit_rate 2m` após `limit_rate_after 5m` no Nginx, e nenhum build na
máquina.

> ⏳ **O único número ainda estimado é o pico do ffmpeg.** Se a medição mostrar
> pico muito acima de 6 GB de RAM, ou se o PSI de I/O indicar saturação de disco
> durante o render, os tetos acima precisam ser revistos para baixo.

### 9.3 Layout em disco

```
/opt/noma/
├── docker-compose.yml     # limites, rede fixa, binds em 127.0.0.1
├── .env                   # JWT_SECRET, DATABASE_URL, PORT=3101 (chmod 600)
└── dados/
    ├── postgres/          # volume do banco
    └── uploads/           # anexos

/etc/nginx/sites-available/noma   → symlink em sites-enabled/ (o "liga/desliga")
/etc/noma/PORTAS.md               # registro de portas
```

Tudo do NOMA sob `/opt/noma`. Remover o produto inteiro = `docker compose down -v`
+ `rm -rf /opt/noma` + apagar o symlink. **Zero rastro no que é do SB Clips.**

---

## 10. Análise de risco

| # | Risco | Impacto no SB Clips | Como detectar | Como reverter |
|---|---|---|---|---|
| 1 | Porta Docker publicada em `0.0.0.0` fura o UFW | 🔴 Redis/Postgres expostos → comprometimento da **máquina inteira**. **Severidade depende do firewall do painel Hostinger** (§1.1): se ele for whitelist 22/80/443 na borda, o furo fica contido ali | `ss -tulpn \| grep -v 127.0.0.1`; `nmap` **de fora da máquina**; conferir as 4 regras do painel | Recriar container com bind `127.0.0.1`. Mesmo com o painel protegendo, manter loopback — defesa em profundidade: quem desligar a regra do painel reabre tudo na hora |
| 2 | `nginx restart` com config inválida | 🔴 **Os dois sites caem** | `systemctl status nginx` | Restaurar `/root/backup-nginx-*`, `nginx -t`, `start`. **Prevenir usando só `reload`** |
| 3 | `default_server` roubado pelo NOMA | 🔴 Tráfego do SB Clips vai para o NOMA | `curl -I http://127.0.0.1/` (IP puro) | Remover a diretiva → `nginx -t && reload` |
| 4 | `worker_connections` esgotado por WebSockets | 🟠 502/timeouts **no SB Clips** | `grep 'worker_connections are not enough' /var/log/nginx/error.log` | Subir `worker_connections` + `worker_rlimit_nofile` (reload basta) |
| 5 | OOM global mata ffmpeg ou Postgres do vizinho | 🔴 Render falha, dados em risco | `dmesg -T \| grep -i oom` | `mem_limit` + `memswap_limit` iguais em todos. Se ocorrer: `docker compose stop` |
| 6 | Disco cheio (logs/volumes/imagens) | 🔴 ffmpeg não escreve; banco para | Alarme em 80% de `/`; `docker system df` | `docker system prune`; rotação de log obrigatória desde o dia 1 |
| 7 | Colisão de sub-rede Docker | 🔴 Roteamento da máquina quebra | `ip route` antes; `docker network inspect` | `docker network rm noma_net`; sub-rede fixa no compose |
| 8 | Build ou pull grande dispara estrangulamento | 🔴 **Máquina inteira sem saída 8–20 min** | Monitor externo de HTTP; `tx` em `/proc/net/dev` | Abortar transferência. Prevenir: build fora, imagem enxuta, janela agendada |
| 9 | Restart do daemon Docker | 🔴 **Todos os containers do SB Clips reiniciam** | `journalctl -u docker` | Não mexer em `daemon.json`. Se inevitável, agendar com o dono do SB Clips |
| 10 | Renovação do certbot falha por config do NOMA quebrada | 🟠 Certificado do SB Clips expira semanas depois | `certbot renew --dry-run` mensal | Corrigir ou desabilitar o site do NOMA |
| 11 | Contenção de CPU degrada renders | 🟡 Render mais lento, sem erro | PSI `cpu avg10`; tempo de render antes/depois | Reduzir `--cpus`; em último caso `docker compose stop` |
| 12 | `prisma db push --accept-data-loss` no boot | 🟡 Nenhum no vizinho — mas **perda de dados do NOMA** | Log de boot do container | Backup antes de todo deploy; considerar migrations versionadas |

### 10.1 Detecção contínua

Montar **antes** de subir, não depois:

```bash
# a cada minuto, os DOIS sites
curl -sfo /dev/null -w '%{http_code} %{time_total}\n' https://sbclips.dominio.com/
curl -sfo /dev/null -w '%{http_code} %{time_total}\n' https://noma.dominio.com/
```

Mais: **monitor externo** (o interno não detecta estrangulamento de rede, porque a
máquina se enxerga bem enquanto está isolada do mundo) e o **PSI antes/depois** como
linha de base.

---

## 11. Plano de reversão

Cinco níveis independentes, do mais leve ao mais completo.

### Nível 0 — snapshot do painel (rede de segurança da máquina inteira)

O plano KVM 4 já tem **2 slots de snapshot** (§1.1). **Tirar um snapshot pelo
painel Hostinger imediatamente antes de começar a instalação** dá um botão de
"desfazer" que cobre até os erros que este documento não previu — incluindo os que
não são reversíveis por comando (config do daemon Docker, pacote instalado, regra
de iptables órfã).

Custo: alguns minutos e um slot. **Não é opcional.**

> ⚠️ Restaurar snapshot volta a **máquina inteira** ao estado anterior — inclusive
> os dados do SB Clips gerados depois do snapshot. É o último recurso, não o
> primeiro. Use os níveis 1 e 2 antes.

### Níveis 1 a 4 — por comando

```bash
# Nível 1 — KILL SWITCH: tirar o NOMA do ar, deixar tudo instalado (~2 s)
sudo rm /etc/nginx/sites-enabled/noma && sudo nginx -t && sudo systemctl reload nginx

# Nível 2 — parar os containers, liberar CPU e RAM (~10 s)
cd /opt/noma && sudo docker compose down

# Nível 3 — remover a rede e as imagens (~1 min)
sudo docker network rm noma_net
sudo docker image prune -a --filter label=projeto=noma

# Nível 4 — apagar tudo, inclusive dados (IRREVERSÍVEL — só com backup)
cd /opt/noma && sudo docker compose down -v && sudo rm -rf /opt/noma
```

> **O nível 1 é o kill switch.** Precisa estar escrito e **testado** antes do
> go-live. Se não for possível reverter em menos de 5 segundos às 3 da manhã, o
> plano não está pronto.

---

## 12. Recomendação final

> **Revisado em 2026-08-11 com os dados do painel (§1.1).** A objeção de
> *capacidade* que sustentava a versão anterior desta seção **caiu**: com 16 GB de
> RAM e 135 GB livres, memória e disco deixaram de ser restrição, e a máquina está
> a 1% de CPU na média. Tecnicamente, **os dois produtos cabem**.
>
> O que restou é uma escolha de **custo operacional e risco de banda**, não de
> espaço. A recomendação abaixo mudou de tom por causa disso.

**Recomendo: backend + banco na máquina com tetos duros, e frontend permanecendo na
Vercel — agora por conveniência operacional, não por falta de espaço.**

A diferença importa para a decisão: antes eu diria "não cabe"; agora digo "cabe,
mas trazer não resolve problema nenhum que exista hoje e cria trabalho novo".
Se você quiser os dois na máquina por custo, controle ou consolidação, **é uma
decisão defensável** e o plano suporta isso — ver a subseção final.

### Etapa 1 — só backend + banco na máquina; frontend continua na Vercel

Justificativa, em ordem de peso:

1. **A CPU é o recurso escasso, e o ffmpeg é insaciável.** Ele usa todos os núcleos
   disponíveis por padrão. O Next em SSR também consome CPU a cada request. Colocar
   os dois na mesma máquina é pôr os dois maiores consumidores de CPU para brigar.
   Backend + Postgres é uma carga bem mais previsível.
2. **O frontend já funciona na Vercel.** Está configurado e em produção
   ([`vercel.json`](../vercel.json)). Movê-lo não resolve nenhum problema existente
   e cria três novos: um Dockerfile que não existe, um build pesado, e o maior
   consumidor de banda de saída (assets estáticos) migrando para a conexão
   estrangulável.
3. **O jeito mais barato de não competir por um recurso é não estar lá.** A Vercel
   serve os estáticos pela CDN dela — banda que **não** passa pela nossa conexão,
   exatamente o recurso mais frágil do setup.
4. **Menos superfície de risco no Nginx.** Um `location /api/` é bem mais simples de
   acertar do que dois blocos com WebSocket, cache de assets e roteamento de Next.

Com isso, o Nginx da máquina só precisa expor `api.dominio.com` → `127.0.0.1:3101`,
e a Vercel aponta `NEXT_PUBLIC_API_URL` para lá. O CORS já está preparado via
`FRONTEND_URL` ([`main.ts:27-35`](../apps/api/src/main.ts)).

### Etapa 2 — trazer o frontend, se e somente se:

- (a) a medição mostrar CPU sobrando com folga **durante os renders**; **e**
- (b) a Etapa 1 tiver rodado 2–4 semanas sem degradação mensurável no SB Clips,
  comparando PSI e tempo de render antes/depois.

### Se a decisão for trazer os dois de uma vez

É uma escolha legítima (custo, controle, dado no mesmo lugar). Tudo desta análise
vale, com **três condições inegociáveis**:

1. Limites de CPU e memória em **todos** os containers, com
   `memswap_limit == mem_limit`.
2. **Nenhuma** porta publicada fora de `127.0.0.1`.
3. **Nenhum** build na máquina — imagem pronta, multi-stage, `output: 'standalone'`.

### Mudanças no repositório recomendadas antes de qualquer instalação

Reduzem risco e não custam nada operacionalmente:

- [ ] Dockerfile da API **multi-stage** ([`apps/api/Dockerfile`](../apps/api/Dockerfile))
- [ ] `output: 'standalone'` no [`next.config.js`](../apps/web/next.config.js)
- [ ] `127.0.0.1:` nos binds do [`docker-compose.yml`](../docker-compose.yml)
- [ ] Corrigir `limit_req_zone` fora do bloco `server` em [`nginx.conf`](../nginx.conf)
- [ ] Ajustar ou remover [`ecosystem.config.js`](../ecosystem.config.js) (porta 3000 colide)

---

## 13. Próximos passos e checklist de aprovação

### 13.1 O que falta para fechar o documento

| Seção | Estado | O que falta |
|---|---|---|
| 1. Inventário — hardware | ✅ §1.1 (painel) | — |
| 1. Inventário — processos, portas, containers, firewall | ⏳ | Rodar o script — fase 1 |
| 1. Inventário — **pico durante o render** | ⏳ | Rodar o script — fase 2 |
| 2. Proposta de isolamento | ✅ §9.2.1 dimensionada | Confirmar com o pico medido do ffmpeg |
| 3. Portas | ✅ decidido | Confirmar que 3100/3101/5433/6380 estão livres |
| 4. Convivência com Nginx | ✅ pronto | Definir o domínio do NOMA |
| 5. Análise de risco | ✅ pronto | Conferir as 4 regras do firewall do painel (afeta o risco nº 1) |
| 6. Reversão | ✅ pronto | Tirar o snapshot (nível 0) antes de instalar |
| 7. Recomendação | ✅ revisada com os dados do painel | Decisão: Etapa 1 só, ou tudo de uma vez |

### 13.2 Comandos do levantamento (somente-leitura)

```bash
scp scripts/inventario-servidor.sh usuario@servidor:~/

# Fase 1 — em repouso
ssh usuario@servidor 'sudo bash ~/inventario-servidor.sh' > inventario-repouso.txt

# Fase 2 — DURANTE um render real (repetir 2–3× com vídeos de tamanhos diferentes)
ssh usuario@servidor 'sudo bash ~/inventario-servidor.sh --amostrar 600' > inventario-render.csv
```

### 13.3 Decisão pendente

> **O frontend do NOMA vai para essa máquina, ou fica na Vercel?**
>
> Recomendação: **Vercel** — mas por conveniência, não por capacidade. Com 4 vCPU e
> 16 GB, os dois cabem (§9.2.1). Levar o frontend para a máquina custa trabalho novo
> (Dockerfile que não existe, build, assets no Nginx, mais banda de saída) sem
> resolver nenhum problema que exista hoje.

### 13.4 Checklist de aprovação

- [ ] Li e entendi o que vai acontecer com a máquina
- [ ] Concordo com as portas propostas (3100/3101, sem publicação de banco/cache)
- [ ] Concordo com a estratégia de limites (teto duro + peso reduzido)
- [ ] Entendi e aceito os riscos da §10
- [ ] Testei mentalmente o kill switch da §11 e ele me tranquiliza
- [ ] Decidi: frontend na ( ) Vercel  ( ) máquina
- [ ] Autorizo rodar o levantamento somente-leitura
- [ ] Autorizo a instalação **após** revisar o documento com os números reais

---

## Anexo A — Glossário

| Termo | O que é |
|---|---|
| **cgroup** | Mecanismo do kernel Linux que limita quanto CPU/memória/IO um grupo de processos consome. É o que faz o isolamento de verdade |
| **namespace** | Mecanismo do kernel que controla o que um processo *enxerga* (PIDs, rede, sistema de arquivos) |
| **PSI** | *Pressure Stall Information* — mede quanto tempo tarefas ficaram **paradas esperando** um recurso. Melhor que "% de uso" para detectar saturação |
| **VmHWM** | *High Water Mark* — maior memória residente que um processo já atingiu na vida. Está em `/proc/<pid>/status` |
| **OOM killer** | Rotina do kernel que mata processos quando a RAM acaba. Escolhe pela maior pegada de memória |
| **exit 137** | 128 + 9 (SIGKILL). Em container, quase sempre significa OOM kill |
| **DNAT** | Tradução de endereço de destino. É como o Docker redireciona portas publicadas — e é por isso que fura o UFW |
| **SNI** | *Server Name Indication* — extensão do TLS que informa o domínio antes da criptografia, permitindo vários certificados na mesma porta 443 |
| **CFS throttling** | Congelamento de um processo que atingiu sua cota de CPU antes do fim da janela de 100 ms. Causa latência artificial |
| **vhost** | *Virtual host* — um bloco `server {}` no Nginx, selecionado pelo `server_name` |

## Anexo B — Referências de arquivos deste repositório

| Arquivo | Relevância |
|---|---|
| [`docker-compose.yml`](../docker-compose.yml) | Publica portas em `0.0.0.0` — precisa de bind loopback |
| [`nginx.conf`](../nginx.conf) | Template com `limit_req_zone` em contexto inválido |
| [`ecosystem.config.js`](../ecosystem.config.js) | PM2 na porta 3000 — colide com SB Clips |
| [`apps/api/Dockerfile`](../apps/api/Dockerfile) | Single-stage, imagem grande |
| [`apps/api/src/main.ts`](../apps/api/src/main.ts) | Porta via env, CORS, trust proxy |
| [`apps/web/next.config.js`](../apps/web/next.config.js) | Falta `output: 'standalone'` |
| [`scripts/inventario-servidor.sh`](../scripts/inventario-servidor.sh) | Coletor somente-leitura |
| [`CLAUDE.md`](../CLAUDE.md) | Contexto da arquitetura (Socket.io, attachments, `db push`) |
