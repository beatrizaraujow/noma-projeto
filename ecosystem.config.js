// =============================================================================
// ⚠️  NAO USE ESTE ARQUIVO NO VPS HOSTINGER. Candidato a remocao.
//
// Tres motivos:
//
//  1. COLISAO DE PORTA. Fixa a web em 3000 — porta ja ocupada pelo frontend do
//     SB Clips na maquina compartilhada. A faixa do NOMA e 3100-3199
//     (docs/INFRA_COEXISTENCIA_SERVIDOR.md secao 9.1).
//
//  2. NAO PROTEGE O VIZINHO. O PM2 roda sem cgroups: `max_memory_restart` reage
//     DEPOIS que o processo ja consumiu a memoria — reinicia depois do estrago,
//     nao impede o pico. Sem dominio de OOM isolado, um vazamento aqui pode
//     fazer o kernel matar o ffmpeg ou o Postgres do SB Clips (secao 4.2).
//
//  3. O deploy agora e por container. Ver docker-compose.prod.yml, que aplica
//     teto duro de CPU, mem_limit == memswap_limit e pids_limit por servico.
//
// Mantido apenas como referencia historica.
// =============================================================================
module.exports = {
  apps: [
    {
      name: 'numa-api',
      cwd: './apps/api',
      script: 'pnpm',
      args: 'start:prod',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
    {
      name: 'numa-web',
      cwd: './apps/web',
      script: 'pnpm',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/web-error.log',
      out_file: './logs/web-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
