#!/usr/bin/env bash

# --- Parse flags

CLEAN_GENERATED_FILES=false
CLEAN_CACHE=false
CLEAN_TEST_ARTIFACTS=false
CLEAN_NODE_MODULES=false
SHOW_HELP=true

set -e
while test $# -gt 0; do
  case "$1" in
    -build | --build)
      CLEAN_GENERATED_FILES=true
      SHOW_HELP=false
      shift
      ;;

    -cache | --cache)
      CLEAN_CACHE=true
      SHOW_HELP=false
      shift
      ;;

    -test-artifacts | --test-artifacts)
      CLEAN_TEST_ARTIFACTS=true
      SHOW_HELP=false
      shift
      ;;

    -deps | --deps)
      CLEAN_NODE_MODULES=true
      SHOW_HELP=false
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
    Usage: yarn clean [OPTIONS]

    Options:
      --build                   Remove files generated during the build process.

      --cache                   Remove cache files.

      --test-artifacts          Remove coverage reports.

      --deps                    Remove node_modules.
  "

  echo "$__usage"

  exit 0
fi

# --- Execution

msg() {
  echo
  boxen --border-color cyan --dim-border --padding 1 "Cleaning $1..."
  echo
}



if [ $CLEAN_GENERATED_FILES = true ]; then
  msg "generated files"
  yarn rimraf build
  yarn rimraf .build-artifacts
  yarn rimraf features/.manifest # Deprecated location of `.build-artifacts`
  yarn rimraf yarn-debug.log
  yarn rimraf package-lock.json
fi

if [ $CLEAN_CACHE = true ]; then
  msg "caches"
  yarn rimraf node_modules/.cache
fi

if [ $CLEAN_TEST_ARTIFACTS = true ]; then
  msg "test artifacts"
  yarn rimraf coverage
fi

if [ $CLEAN_NODE_MODULES = true ]; then
  msg "node_modules"
  yarn rimraf node_modules
fi

