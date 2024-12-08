#!/usr/bin/env bash
set -e

pattern_found="0"

## Find all with wildcards
ignore_patterns=("pycache" "virt" "venv" "debug" "node_modules")

for i in ${ignore_patterns[@]}; do
    if find $1 -name "*$i*" -exec false {} +; then
        continue
    else
        echo "Some file were found by *$i* pattern, this should not happen"
        echo "Check .dockerignore if this pattern is ignored"
        pattern_found="1"
    fi
done

## Find dirs
ignore_patterns=(".git" "tanka")

for i in ${ignore_patterns[@]}; do
    if find $1 -name "$i" -exec false {} +; then
        continue
    else
        echo "Some file were found by $i pattern, this should not happen"
        echo "Check .dockerignore if this pattern is ignored"
        pattern_found="1"
    fi
done

exit ${pattern_found}
