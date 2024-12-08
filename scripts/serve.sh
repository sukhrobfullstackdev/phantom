#!/usr/bin/env bash

# Increase memory limit for Node
export NODE_OPTIONS='--max_old_space_size=4096  --openssl-legacy-provider'
export NODE_ENV=production

# --- Parse flags

ENV_FILE="skip"
SHOW_HELP=false

set -e
while test $# -gt 0; do
  case "$1" in
    -ip | --ip)
      export LOCAL_IP_ADDRESS=$(ipconfig getifaddr en0)
      ENV_FILE=ip
      shift
      ;;

    -local | --local)
      ENV_FILE=local
      shift
      ;;

    -dev | --dev | -development | --development)
      ENV_FILE=dev
      shift
      ;;

    -stagef | --stagef)
      ENV_FILE=stagef
      shift
      ;;

    -prod | --prod | -production | --production)
      ENV_FILE=prod
      shift
      ;;

    -h | -help | --help)
      SHOW_HELP=true
      shift
      ;;

    *)
      break
      ;;
  esac
done

# --- Show help

if [ $SHOW_HELP = true ]; then
  __usage="
    Usage: yarn serve [OPTIONS]

    NOTE: This script expects \`yarn build\` to have been run prior.
          You must use the same flags for this script as you did for
          \`yarn build\`.

    Options:
      --ip                      Point app URLs at local IP (i.e.: 192.168.*.*).

      --local                   Point app URLs at localhost.

      --dev, --development      Point app URLs at dev deployment.

      --stagef                  Point app URLs at stagef deployment.

      --prod, --production      Point app URLs at prod deployment.

      -h, --help                Show this message.
  "

  echo "$__usage"

  exit 0
fi

# --- Execution

ts-node core/server/index.ts serve $ENV_FILE
