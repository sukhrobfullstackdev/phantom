#!/usr/bin/env bash

# Increase memory limit for Node
export NODE_OPTIONS='--max_old_space_size=4096  --openssl-legacy-provider'

echo
boxen --border-color cyan --dim-border --padding 1 "Linting TypeScripts..."
echo

eslint --fix --ext .ts,.tsx $@
