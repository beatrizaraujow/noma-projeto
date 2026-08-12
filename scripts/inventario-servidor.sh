#!/usr/bin/env bash
# =============================================================================
# inventario-servidor.sh  --  LEVANTAMENTO SOMENTE-LEITURA
#
# Coleta o inventario da maquina compartilhada (SB Clips) exigido por
# docs/INFRA_COEXISTENCIA_SERVIDOR.md antes de qualquer instalacao do NOMA.
#
# Este script NAO altera nada na maquina: nao instala pacote, nao para
# servico, nao escreve arquivo fora do stdout. So le /proc, /sys e chama
# comandos de consulta.
#
# Uso:
#   sudo bash inventario-servidor.sh > inventario-repouso.txt
#   sudo bash inventario-servidor.sh --amostrar 600 > inventario-render.csv
#
# Sem sudo, `ss` nao mostra o processo dono de cada porta e o dmesg fica
# inacessivel -- o levantamento fica incompleto.
# =============================================================================

set -u
SEP() { printf '\n\n=============== %s ===============\n' "$1"; }
HAS() { command -v "$1" >/dev/null 2>&1; }

DURACAO=0
[ "${1:-}" = "--amostrar" ] && DURACAO="${2:-300}"

# ---------------------------------------------------------------- 1. IDENTIDADE
SEP "1. MAQUINA"
hostname; uname -a
[ -f /etc/os-release ] && grep -E '^(PRETTY_NAME|VERSION)=' /etc/os-release
echo "uptime: $(uptime)"
echo "vCPUs: $(nproc)"
HAS lscpu && lscpu | grep -E 'Model name|^CPU\(s\)|Thread|Socket|MHz'

# ------------------------------------------------------------ 2. CPU / MEM / IO
SEP "2. RECURSOS AGORA (instantaneo)"
free -h
echo "--- swap detalhado ---"; swapon --show 2>/dev/null || echo "(sem swap)"
echo "--- disco (espaco) ---"; df -hT -x tmpfs -x devtmpfs
echo "--- disco (inodes) ---"; df -i -x tmpfs -x devtmpfs
echo "--- dispositivos ---"; lsblk 2>/dev/null
echo "--- onde o Docker guarda dados ---"
HAS docker && docker info --format 'Docker Root Dir: {{.DockerRootDir}} | Storage: {{.Driver}}' 2>/dev/null
HAS du && [ -d /var/lib/docker ] && du -sh /var/lib/docker 2>/dev/null

SEP "3. PRESSAO REAL (PSI) - isto e o 'pico', nao a media"
# avg10/avg60/avg300 = % do tempo em que ALGUEM ficou parado esperando o recurso.
# some>0 ja indica contencao; full>0 em memoria/io e sinal de saturacao seria.
for r in cpu memory io; do
  if [ -r "/proc/pressure/$r" ]; then
    echo "--- /proc/pressure/$r ---"; cat "/proc/pressure/$r"
  else
    echo "--- /proc/pressure/$r indisponivel (kernel sem PSI) ---"
  fi
done

SEP "4. HISTORICO (se o sysstat ja estiver instalado)"
if HAS sar; then
  echo "### CPU (ultimos registros do dia) ###";      sar -u  2>/dev/null | tail -25
  echo "### Memoria ###";                             sar -r  2>/dev/null | tail -25
  echo "### IO ###";                                  sar -b  2>/dev/null | tail -15
  echo "### Rede ###";                                sar -n DEV 2>/dev/null | tail -30
  echo "### Load ###";                                sar -q  2>/dev/null | tail -15
else
  echo "sysstat/sar NAO instalado -> nao ha historico de pico."
  echo "NAO instale agora (isso altera a maquina). Use --amostrar na fase 2."
fi

# ------------------------------------------------------------------ 5. SERVICOS
SEP "5. SERVICOS SYSTEMD ATIVOS"
systemctl list-units --type=service --state=running --no-pager --no-legend 2>/dev/null

SEP "5b. SERVICOS QUE SOBEM NO BOOT"
systemctl list-unit-files --state=enabled --no-pager --no-legend 2>/dev/null

SEP "5c. CONSUMO POR SERVICO (cgroup) - quem realmente gasta"
HAS systemd-cgtop && systemd-cgtop -b -n 1 --depth=3 2>/dev/null | head -40 \
  || echo "systemd-cgtop indisponivel"

# ----------------------------------------------------------------- 6. PROCESSOS
SEP "6. TOP 20 POR CPU"
ps -eo pid,ppid,user,pcpu,pmem,rss,etime,args --sort=-pcpu | head -21
SEP "6b. TOP 20 POR MEMORIA"
ps -eo pid,ppid,user,pcpu,pmem,rss,etime,args --sort=-rss | head -21
SEP "6c. PICO HISTORICO DE MEMORIA DOS 10 MAIORES (VmHWM = maior RSS ja atingido)"
for p in $(ps -eo pid --sort=-rss --no-headers | head -10); do
  [ -r "/proc/$p/status" ] || continue
  printf '%-8s %-28s %s\n' "$p" \
    "$(tr -d '\0' < /proc/$p/cmdline | cut -c1-28)" \
    "$(grep -E 'VmHWM|VmRSS' /proc/$p/status | tr '\n' ' ')"
done

# -------------------------------------------------------------------- 7. PORTAS
SEP "7. PORTAS EM USO (TCP+UDP, com dono)"
if HAS ss; then ss -tulpnH 2>/dev/null | sort -k5; else netstat -tulpn 2>/dev/null; fi
SEP "7b. SOCKETS ABERTOS POR PROCESSO (detalhe)"
HAS lsof && lsof -nP -iTCP -sTCP:LISTEN 2>/dev/null || echo "lsof indisponivel"
SEP "7c. FAIXA DE PORTAS EFEMERAS (nao escolha portas dentro dela)"
cat /proc/sys/net/ipv4/ip_local_port_range

# -------------------------------------------------------------------- 8. DOCKER
SEP "8. DOCKER - CONTAINERS"
if HAS docker; then
  docker ps -a --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}' 2>/dev/null
  SEP "8b. DOCKER - CONSUMO AGORA"
  docker stats --no-stream --format \
    'table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}' 2>/dev/null
  SEP "8c. DOCKER - LIMITES JA APLICADOS E POLITICA DE RESTART"
  for c in $(docker ps -aq 2>/dev/null); do
    docker inspect "$c" --format \
'{{.Name}}
  restart   : {{.HostConfig.RestartPolicy.Name}}
  cpus      : {{.HostConfig.NanoCpus}} (nano) / shares {{.HostConfig.CpuShares}}
  memoria   : {{.HostConfig.Memory}} / swap {{.HostConfig.MemorySwap}}
  log driver: {{.HostConfig.LogConfig.Type}} {{.HostConfig.LogConfig.Config}}
  redes     : {{range $k,$v := .NetworkSettings.Networks}}{{$k}}({{$v.IPAddress}}) {{end}}
  binds     : {{range .HostConfig.Binds}}{{.}} {{end}}' 2>/dev/null
  done
  SEP "8d. DOCKER - REDES E SUBNETS OCUPADAS (evite colidir)"
  docker network ls 2>/dev/null
  for n in $(docker network ls --format '{{.Name}}' 2>/dev/null); do
    echo "--- $n ---"
    docker network inspect "$n" --format \
      'driver={{.Driver}} subnet={{range .IPAM.Config}}{{.Subnet}} gw={{.Gateway}}{{end}} containers={{range $k,$v := .Containers}}{{$v.Name}} {{end}}' 2>/dev/null
  done
  SEP "8e. DOCKER - DISCO OCUPADO POR IMAGENS/VOLUMES/LOGS"
  docker system df -v 2>/dev/null | head -60
  echo "--- tamanho dos arquivos de log dos containers ---"
  HAS find && find /var/lib/docker/containers -name '*-json.log' -printf '%10s  %p\n' 2>/dev/null | sort -rn | head
  SEP "8f. DOCKER - CONFIG DO DAEMON (mudar isso EXIGE restart do daemon)"
  [ -f /etc/docker/daemon.json ] && cat /etc/docker/daemon.json || echo "(sem /etc/docker/daemon.json - defaults)"
  docker info --format 'live-restore: {{.LiveRestoreEnabled}} | cgroup driver: {{.CgroupDriver}} | cgroup version: {{.CgroupVersion}}' 2>/dev/null
else
  echo "docker nao encontrado no PATH deste usuario"
fi

# --------------------------------------------------------------------- 9. NGINX
SEP "9. NGINX - VERSAO E MODULOS"
HAS nginx && nginx -v 2>&1
HAS nginx && nginx -V 2>&1 | tr ' ' '\n' | grep -E 'conf-path|prefix|http_v2|http_ssl'
SEP "9b. NGINX - SITES HABILITADOS"
ls -la /etc/nginx/sites-enabled/ 2>/dev/null
ls -la /etc/nginx/conf.d/ 2>/dev/null
SEP "9c. NGINX - server_name / listen / default_server DE CADA SITE"
grep -RnE 'server_name|listen|proxy_pass|client_max_body_size|root ' \
  /etc/nginx/sites-enabled/ /etc/nginx/conf.d/ /etc/nginx/nginx.conf 2>/dev/null
SEP "9d. NGINX - LIMITES GLOBAIS COMPARTILHADOS (worker_connections e o gargalo dos websockets)"
grep -nE 'worker_processes|worker_connections|worker_rlimit_nofile|keepalive' /etc/nginx/nginx.conf 2>/dev/null
SEP "9e. NGINX - VALIDACAO DA CONFIG ATUAL (somente teste, nao aplica nada)"
HAS nginx && nginx -t 2>&1
SEP "9f. CERTIFICADOS TLS EXISTENTES"
ls -la /etc/letsencrypt/live/ 2>/dev/null || echo "(sem /etc/letsencrypt)"
HAS certbot && certbot certificates 2>/dev/null | grep -E 'Certificate Name|Domains|Expiry'

# ------------------------------------------------------------------ 10. FIREWALL
SEP "10. FIREWALL / REGRAS DE REDE"
HAS ufw && ufw status verbose 2>/dev/null
HAS iptables && { echo "--- filter/INPUT ---"; iptables -S INPUT 2>/dev/null; \
                  echo "--- nat/DOCKER (portas publicadas furam o UFW) ---"; iptables -t nat -S DOCKER 2>/dev/null; }
SEP "10b. ROTAS E INTERFACES (para escolher subnet Docker sem colidir)"
ip -brief address 2>/dev/null
ip route 2>/dev/null

# ---------------------------------------------------------------------- 11. REDE
SEP "11. TRAFEGO ACUMULADO POR INTERFACE"
cat /proc/net/dev

# ------------------------------------------------------------------- 12. SAUDE
SEP "12. OOM KILLS E ERROS RECENTES (o vizinho ja morreu antes?)"
dmesg -T 2>/dev/null | grep -iE 'oom|killed process|out of memory' | tail -20 \
  || journalctl -k --no-pager 2>/dev/null | grep -iE 'oom|killed process' | tail -20 \
  || echo "(sem permissao para ler dmesg - rode com sudo)"
echo "--- erros do systemd nos ultimos 7 dias ---"
journalctl --since '7 days ago' -p err --no-pager 2>/dev/null | tail -40
echo "--- servicos que falharam ---"
systemctl list-units --state=failed --no-pager 2>/dev/null

SEP "13. TAREFAS AGENDADAS (cron/timers competem por recurso em horario fixo)"
crontab -l 2>/dev/null; ls -la /etc/cron.d/ 2>/dev/null
systemctl list-timers --all --no-pager 2>/dev/null

# ============================================================================
# FASE 2 - AMOSTRAGEM: rode DURANTE um processamento real de video
# ============================================================================
if [ "$DURACAO" -gt 0 ]; then
  SEP "14. AMOSTRAGEM DE ${DURACAO}s (rode isto DURANTE um render do SB Clips)"
  echo "ts,cpu_idle_pct,load1,mem_disp_MB,swap_usada_MB,psi_cpu_avg10,psi_io_avg10,rx_MB_total,tx_MB_total,ffmpeg_cpu,ffmpeg_rss_MB"
  IFACE=$(ip route 2>/dev/null | awk '/^default/{print $5; exit}')
  FIM=$(( $(date +%s) + DURACAO ))
  PREV_IDLE=0; PREV_TOTAL=0
  while [ "$(date +%s)" -lt "$FIM" ]; do
    read -r _ u n s i rest < /proc/stat
    IDLE=$i; TOTAL=$((u+n+s+i))
    D_IDLE=$((IDLE-PREV_IDLE)); D_TOTAL=$((TOTAL-PREV_TOTAL))
    CPU_IDLE=$([ "$D_TOTAL" -gt 0 ] && echo $((100*D_IDLE/D_TOTAL)) || echo 100)
    PREV_IDLE=$IDLE; PREV_TOTAL=$TOTAL

    LOAD=$(cut -d' ' -f1 /proc/loadavg)
    MEMD=$(awk '/MemAvailable/{print int($2/1024)}' /proc/meminfo)
    SWU=$(awk '/SwapTotal/{t=$2}/SwapFree/{f=$2}END{print int((t-f)/1024)}' /proc/meminfo)
    PCPU=$(awk '/^some/{split($2,a,"=");print a[2];exit}' /proc/pressure/cpu 2>/dev/null || echo NA)
    PIO=$(awk '/^some/{split($2,a,"=");print a[2];exit}'  /proc/pressure/io  2>/dev/null || echo NA)
    RX=$(awk -v ifc="$IFACE:" '$1==ifc{print int($2/1048576)}' /proc/net/dev)
    TX=$(awk -v ifc="$IFACE:" '$1==ifc{print int($10/1048576)}' /proc/net/dev)
    FPID=$(pgrep -o ffmpeg 2>/dev/null)
    if [ -n "${FPID:-}" ] && [ -r "/proc/$FPID/status" ]; then
      FCPU=$(ps -o pcpu= -p "$FPID" 2>/dev/null | tr -d ' ')
      FRSS=$(awk '/VmRSS/{print int($2/1024)}' "/proc/$FPID/status")
    else FCPU=0; FRSS=0; fi

    echo "$(date +%H:%M:%S),$CPU_IDLE,$LOAD,$MEMD,$SWU,$PCPU,$PIO,$RX,$TX,$FCPU,$FRSS"
    sleep 2
  done
  echo
  echo "### Analise: o que importa nesse CSV ###"
  echo "- cpu_idle_pct MINIMO  -> quanto de CPU realmente sobra no pior instante"
  echo "- mem_disp_MB MINIMO   -> teto seguro de memoria para o NOMA"
  echo "- swap_usada crescendo -> ja esta apertado; NAO adicione carga"
  echo "- psi_cpu/psi_io > 10  -> ja ha fila; qualquer container novo piora"
  echo "- delta de tx_MB por minuto -> quanto de banda o SB Clips ja consome"
fi

SEP "FIM"
echo "Nada foi alterado nesta maquina por este script."
