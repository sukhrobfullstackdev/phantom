#!/bin/sh

[[ -z "$NPM_TOKEN" ]] && { echo "NPM_TOKEN needs value"; exit 1; }

[[ -z "$API_KEY" ]] && { echo "API_KEY needs value"; exit 1; }

env_file=$(grep "[[:graph:]]=" config/env/local.env) # looks at where you call the file from

BUILD_ARGS=""
for i in $env_file
do
    eval $i
    BUILD_ARGS+="--build-arg $i "
done

BUILD_ARGS=$(echo $(eval echo $BUILD_ARGS))

[[ -z "$BUILD_ARGS" ]] && { echo "BUILD_ARGS needs value"; exit 1; }

docker build -t auth:latest --build-arg NPM_TOKEN=$NPM_TOKEN $BUILD_ARGS -f deploy/Dockerfile --target runner .

docker run -d -e GET_CREDENTIALS_PROXY_URL=http://localhost:3000/ -e BACKEND_URL_API_KEY=$API_KEY -p 3014:3014 -ti auth:latest sh -c "yarn build -local & yarn start -local"