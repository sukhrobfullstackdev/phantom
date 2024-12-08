#!/usr/bin/env bash

export NODE_ENV=production
export ANALYZE_BUNDLE=1

# Increase memory limit for Node
export NODE_OPTIONS='--max_old_space_size=4096  --openssl-legacy-provider'

yarn clean --build

ts-node core/server/index.ts analyze prod
