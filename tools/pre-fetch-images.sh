#!/usr/bin/env bash
set -e

DOCKERFILE="deploy/Dockerfile"
SEARCH_WORD="node"
TMP_FILE="img_hashes"

rm -f ${TMP_FILE}

grep FROM ${DOCKERFILE} | awk '{print $2}' | grep ${SEARCH_WORD} | sort -u | while IFS= read -r img; do
  docker pull "${img}"
  docker inspect "${img}" --format='`{{ .Id }}`' >> ${TMP_FILE}
done
