#!/usr/bin/env bash

# Increase memory limit for Node
export NODE_OPTIONS='--max_old_space_size=4096  --openssl-legacy-provider'
export NODE_ENV=development

# --- Parse flags

ENV_FILE="dev"
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

    -compat | --compat)
      export SHOULD_CREATE_LEGACY_BUNDLE_FOR_DEVELOPMENT=1
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
    Usage: yarn start [OPTIONS]

    Options:
      --ip                      Point app URLs at local IP (i.e.: 192.168.*.*).

      --local                   Point app URLs at localhost.

      --dev, --development      Point app URLs at dev deployment.

      --stagef                  Point app URLs at stagef deployment.

      --prod, --production      Point app URLs at prod deployment.

      --compat                  Build compatibility bundles for legacy browsers
                                (IE11).

      -h, --help                Show this message.
  "

  echo "$__usage"

  exit 0
fi

# --- Execution

yarn clean --build

export NODE_OPTIONS='--max-old-space-size=8192 --openssl-legacy-provider'

ts-node-dev \
  --files \
  --transpile-only \
  --ignore-watch 'features[\/\\].+[\/\\].+' \
  -r tsconfig-paths/register core/server/index.ts start $ENV_FILE
