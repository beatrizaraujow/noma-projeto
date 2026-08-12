# Leitura do painel do VPS — o que mudou na proposta do NOMA

> **Briefing complementar.** Documento principal:
> [`INFRA_COEXISTENCIA_SERVIDOR.md`](./INFRA_COEXISTENCIA_SERVIDOR.md)
>
> **Fonte:** painel Hostinger do VPS do SB Clips · **Leitura em:** 2026-08-11
> **Status:** inventário **parcial** — falta a medição durante um render

---

## Resumo em cinco linhas

1. A máquina é **bem mais folgada** do que eu tinha assumido: 4 vCPU, **16 GB** de RAM, 135 GB de disco livre.
2. **Memória e disco deixaram de ser restrição.** A objeção de capacidade caiu.
3. **CPU é a única restrição real** — 4 núcleos que o ffmpeg satura por inteiro durante um render.
4. Os números do painel (1% de CPU, 16% de RAM) são **leitura de repouso** e não decidem nada: o pico continua sendo o dado que falta.
5. Minha recomendação sobre o frontend mudou de *"talvez não caiba"* para **"cabe, mas trazer não resolve problema nenhum"**.

---

## 1. O que o painel respondeu

### Hardware confirmado

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
| Backups | Semanal + **2 snapshots**. Backup diário é upsell (não contratado) |
| Firewall do painel | **4 regras** — conteúdo desconhecido, precisa conferir |
| Detector de malware | Não instalado |

> **O IPv4 e o hostname foram deliberadamente omitidos destes arquivos.** Eles
> vivem num repositório Git; se o repositório for público, um IP de produção
> documentado é convite a varredura automatizada.

### Leitura em repouso

| Métrica | Painel | Tradução |
|---|---|---|
| Uso de CPU | 1% | ≈ 0,04 de 4 vCPU |
| Uso de memória | 16% | ≈ 2,6 GB de 16 GB |
| Tráfego | 1,1 MB entrada / 0,9 MB saída | irrisório |

---

## 2. O que o painel **não** respondeu — e por que isso importa

**Não havia render rodando quando essa leitura foi tirada.** O painel agrega numa
janela larga, que é exatamente onde o pico do ffmpeg desaparece.

Esses números dizem *"a máquina está ociosa a maior parte do tempo"* — o que é uma
boa notícia. Eles **não** dizem *"quanto sobra durante um processamento"* — que é a
única pergunta que decide o dimensionamento.

É o caso-livro do princípio central deste trabalho:

> Uma máquina com CPU média de 20% pode estar 100% saturada durante os 6 minutos em
> que o ffmpeg roda. **A média esconde justamente o instante que importa.**

Continua faltando:

- [ ] Quais serviços e containers rodam, e quanto cada um consome
- [ ] Quais portas estão ocupadas e por qual processo
- [ ] Quais são as 4 regras do firewall do painel e qual a política padrão
- [ ] Se há histórico de OOM kill
- [ ] Qual a sub-rede Docker já alocada
- [ ] **Quanto o ffmpeg pica em CPU, memória e I/O durante um render real**

Tudo isso sai de [`scripts/inventario-servidor.sh`](../scripts/inventario-servidor.sh),
que é somente-leitura.

---

## 3. O que mudou na proposta

### 3.1 Memória — restrição eliminada

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
inteiro precisa de ~3 GB. **Sobra em qualquer cenário plausível.**

### 3.2 Disco — restrição eliminada

135 GB livres para um app que precisa de ~30 GB (imagens ~2 GB + Postgres ~5 GB +
uploads ~20 GB + logs). Alarme obrigatório em 160 GB usados (80% de 200 GB).

### 3.3 CPU — a única restrição real

```
Total ............................. 4,00 vCPU
− em repouso hoje (1%) ............ 0,04 vCPU
− ffmpeg durante um render ........ até 4,00 vCPU  ← satura tudo com -threads 0
                                   ================
  disponível durante o render ..... ~0
```

**Não dá para "usar o que sobra", porque não sobra nada durante o render.** A
estratégia tem que ser **dividir de forma previsível**:

- **Teto duro de 1,5 vCPU** para o NOMA (37,5% da máquina)
- **`cpu_shares 512`** (metade do peso padrão), para o ffmpeg vencer a disputa

No pior caso — render e pico de uso do NOMA ao mesmo tempo — o ffmpeg fica com
~2,5 vCPU e o render demora **35–60% mais**. Fora dessa janela (a esmagadora
maioria do tempo, dado 1% de uso médio), ninguém sente nada.

> **Nuance:** a eficácia do `cpu_shares` depende de onde o ffmpeg roda. Se está num
> container Docker, os dois cgroups são irmãos e o peso funciona como esperado. Se
> roda solto no host, a hierarquia muda. O inventário revela isso.

### 3.4 Banda — o risco continua, mas mudou de natureza

A cota de **16 TB/mês contra 2 GB usados** é irrelevante. O limite nunca foi
volume — é **taxa sustentada**. Cota grande não protege contra estrangulamento.

As mitigações permanecem inalteradas: `limit_rate` no Nginx, **nenhum build na
máquina**, imagem Docker enxuta (multi-stage), transferências grandes com
`--bwlimit` e agendadas.

### 3.5 Ubuntu 22.04 confirma o ferramental

Kernel 5.15 com **PSI habilitado** e **cgroup v2 unificado** por padrão. Todas as
técnicas de limite do documento principal se aplicam **diretamente, sem
adaptação**.

---

## 4. Dimensionamento resultante

| Container | `cpus` | `mem_limit` | Config específica |
|---|---|---|---|
| `noma-api` | 0,70 | 1024m | `NODE_OPTIONS=--max-old-space-size=768` |
| `noma-web` | 0,30 | 768m | `NODE_OPTIONS=--max-old-space-size=576` |
| `noma-postgres` | 0,35 | 1024m | `shared_buffers=256MB` |
| `noma-redis` | 0,15 | 256m | `--maxmemory 200mb --maxmemory-policy allkeys-lru` |
| **Total** | **1,50 vCPU** (37,5%) | **~3,0 GB** (19%) | |

Em todos, sem exceção: `memswap_limit == mem_limit`, `cpu_shares: 512`,
`pids_limit: 200`, `logging max-size 10m/max-file 3`, `restart: on-failure:5`.

**Portas** (inalteradas): NOMA web `127.0.0.1:3100`, NOMA api `127.0.0.1:3101`,
Postgres e Redis **sem publicação** — só na rede Docker interna.

**Teto de disco do NOMA:** 30 GB (22% do livre).

> ⏳ **O único número ainda estimado é o pico do ffmpeg.** Se a medição mostrar
> pico muito acima de 6 GB de RAM, ou se o PSI de I/O indicar saturação de disco
> durante o render, os tetos acima precisam ser revistos para baixo.

---

## 5. Duas coisas novas que o painel revelou

### 5.1 Snapshots existem → ganhamos um nível 0 de reversão

O plano tem **2 slots de snapshot**. Tirar um **imediatamente antes da instalação**
dá um botão de "desfazer" que cobre até os erros que o documento não previu —
incluindo os que não são reversíveis por comando (config do daemon Docker, pacote
instalado, regra de iptables órfã).

Custo: alguns minutos e um slot. **Não é opcional.**

> ⚠️ Restaurar snapshot volta a **máquina inteira** ao estado anterior — inclusive
> os dados do SB Clips gerados depois do snapshot. É o último recurso, não o
> primeiro. Os níveis 1 e 2 (remover symlink do Nginx, `docker compose down`) vêm
> antes.

### 5.2 O firewall do painel muda a severidade do risco nº 1

O risco mais grave levantado era: **portas publicadas pelo Docker furam o UFW**,
porque o DNAT acontece na cadeia `nat/PREROUTING` e o pacote nunca atravessa a
cadeia `INPUT` onde vivem as regras do UFW. E o
[`docker-compose.yml`](../docker-compose.yml) do repositório publica `5432:5432` e
`6379:6379` em `0.0.0.0`.

O painel mostra **4 regras de firewall** — e essas regras ficam **na borda da rede,
antes da máquina**. Isso muda a análise:

| Cenário | Efeito |
|---|---|
| As 4 regras são whitelist 22/80/443 com política padrão *deny* | O furo do Docker fica **contido no perímetro**. Severidade cai de 🔴 para 🟠 |
| As regras são permissivas ou a política padrão é *allow* | Nada muda. Continua 🔴 |

**Precisa conferir quais são.** E mesmo no melhor cenário, a regra de bind em
`127.0.0.1` permanece: quem desligar a regra do painel reabre tudo instantaneamente.
Defesa em profundidade não é redundância desnecessária aqui — é a diferença entre
um erro de configuração e um vazamento de banco.

---

## 6. Minha recomendação mudou de tom

**Antes:** *"Se for na máquina, o orçamento de CPU fica bem mais apertado e talvez o
número não feche."*

**Agora:** **o número fecha.** Os dois produtos cabem tecnicamente.

A escolha sobre o frontend deixou de ser sobre capacidade e virou sobre **custo
operacional**:

| Manter na Vercel | Trazer para a máquina |
|---|---|
| Já funciona, já está em produção | Precisa de um Dockerfile que **não existe** |
| Assets estáticos saem pela CDN — **banda que não passa pela conexão estrangulável** | Mais banda de saída na conexão frágil |
| Nginx do servidor só precisa de um `location /api/` | Nginx precisa de dois blocos + WebSocket + cache de assets |
| Zero CPU consumida na máquina | +0,30 vCPU de teto |
| Custo: plano Vercel | Custo: zero adicional (a máquina já está paga) |

**Recomendo continuar na Vercel** — mas por conveniência, não por falta de espaço.
Se você quiser consolidar os dois na máquina por custo, controle ou simplicidade de
operação, **é uma decisão defensável** e o plano suporta, desde que valham as três
condições inegociáveis: limites em todos os containers, nenhuma porta fora de
`127.0.0.1`, e nenhum build na máquina.

---

## 7. Observações de segurança (fora do escopo pedido)

Registro porque um comprometimento da máquina derruba **os dois produtos**:

| Observação | Recomendação |
|---|---|
| **Acesso root por SSH com senha, em IP público** | Migrar para chave (o painel já tem "Chave SSH → Gerenciar") e `PermitRootLogin prohibit-password` |
| **Detector de malware não instalado** | Avaliar; ao menos `fail2ban` para SSH |
| **Backup só semanal** | Entre dois backups há até 7 dias de dados do NOMA em risco. `pg_dump` diário local é barato e não usa banda |
| **41 dias de uptime** | Kernel provavelmente desatualizado. Checar `/var/run/reboot-required` — um reboot inesperado por *unattended-upgrades* derruba os dois produtos |
| **IP e hostname visíveis no painel** | Omitidos destes documentos por precaução com o repositório Git |

---

## 8. Próximo passo — o único que falta

```bash
# copiar o coletor somente-leitura
scp scripts/inventario-servidor.sh root@<servidor>:~/

# Fase 1 — em repouso
ssh root@<servidor> 'bash ~/inventario-servidor.sh' > inventario-repouso.txt

# Fase 2 — DURANTE um render real de vídeo (10 min, amostra a cada 2 s)
#          repetir 2–3× com vídeos de tamanhos diferentes
ssh root@<servidor> 'bash ~/inventario-servidor.sh --amostrar 600' > inventario-render.csv
```

O que sai da fase 2 e fecha o documento:

| Coluna do CSV | Decide |
|---|---|
| `cpu_idle_pct` **mínimo** | se 1,5 vCPU de teto é seguro ou precisa cair |
| `mem_disp_MB` **mínimo** | confirma os 3 GB do NOMA |
| `ffmpeg_rss_MB` **pico** | substitui a estimativa de 3 GB pelo número real |
| `psi_io_avg10` | se o disco já satura durante o render |
| delta de `tx_MB`/min | quanto do orçamento de banda o SB Clips já usa |

**Nenhum comando altera a máquina.** O script lê `/proc`, `/sys` e executa
comandos de consulta — não instala, não para serviço, não escreve arquivo.

---

## 9. Decisão pendente

> **O frontend do NOMA vai para essa máquina, ou fica na Vercel?**
>
> Recomendação: **Vercel**, pelos motivos da §6. Mas a decisão é sua, e agora ela é
> sobre conveniência — não sobre capacidade.
