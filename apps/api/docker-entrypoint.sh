#!/bin/sh
# =============================================================================
# NOMA - API: entrypoint do container
#
# Existe para manter a sincronizacao de schema FORA do caminho de boot padrao.
#
# O Dockerfile anterior rodava `prisma db push --accept-data-loss` no CMD, ou
# seja: a cada restart do container, sem confirmacao, com autorizacao para
# operacao destrutiva. Basta um restart automatico depois de uma mudanca de
# schema para dropar coluna ou tabela — risco 12 da secao 10 do
# docs/INFRA_COEXISTENCIA_SERVIDOR.md.
#
# Agora e opt-in:
#   RUN_DB_PUSH=true               sincroniza o schema neste boot
#   DB_PUSH_ACCEPT_DATA_LOSS=true  autoriza operacao destrutiva (raro, deliberado)
#
# Sem RUN_DB_PUSH, o container so sobe a API.
# =============================================================================

set -e

SCHEMA=/app/packages/database/prisma/schema.prisma

if [ "$RUN_DB_PUSH" = "true" ]; then
  echo '=== prisma db push ==='

  if [ ! -f "$SCHEMA" ]; then
    echo "FATAL: schema nao encontrado em $SCHEMA" >&2
    exit 1
  fi

  if [ "$DB_PUSH_ACCEPT_DATA_LOSS" = "true" ]; then
    echo 'AVISO: --accept-data-loss ativo. Operacoes destrutivas serao aplicadas.'
    prisma db push --schema="$SCHEMA" --accept-data-loss
  else
    # Sem o flag, o push ABORTA quando detecta perda de dados em vez de aplicar.
    prisma db push --schema="$SCHEMA"
  fi

  echo '=== schema sincronizado ==='
else
  echo '=== db push desativado (RUN_DB_PUSH != true) ==='
fi

echo '=== starting API ==='
# exec: o node passa a ser o PID 1 e recebe SIGTERM do `docker stop` direto,
# permitindo shutdown gracioso. Sem exec, o shell segura o sinal e o container
# leva os 10s de timeout ate o SIGKILL.
exec "$@"
