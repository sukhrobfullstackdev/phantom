# Auth Relayer (a.k.a. "Phantom")

> Front-end codebase serving Fortmatic Phantom Mode and Magic Auth—an application for creating Decentralized ID Tokens and securely authenticating users in a passwordless way.

## Table of Contents

- [Auth Relayer (a.k.a. "Phantom")](#auth-relayer-aka-phantom)
  - [Table of Contents](#table-of-contents)
  - [Getting Started ⤴](#getting-started-)
    - [Setup node version](#setup-node-version)
    - [Setup NPM Token](#setup-npm-token)
    - [Installation](#installation)
    - [Starting Auth Relayer](#starting-auth-relayer)
      - [Developing with a local backend server](#developing-with-a-local-backend-server)
      - [Developing locally with a staging server](#developing-locally-with-a-staging-server)
      - [Developing with local DKMS v2 backend](#developing-with-local-dkms-v2-backend)
      - [Developing with a local Magic SDK](#developing-with-a-local-magic-sdk)
    - [Building \& Serving for Production](#building--serving-for-production)
  - [Testing ⤴](#testing-)
    - [Unit Tests](#unit-tests)
    - [Integration Tests](#integration-tests)
  - [Troubleshooting ⤴](#troubleshooting-)
    - [Api key errors](#api-key-errors)
    - [Adding new ENV variables](#adding-new-env-variables)
    - [`node-gyp` Errors](#node-gyp-errors)
      - [XCode](#xcode)
- [Infra](#infra)
  - [Update Dependabot terraform config](#update-dependabot-terraform-config)

## Getting Started [⤴](#table-of-contents)

### Setup node version

Current dev node version is 18.20

Please install [node version manager nvm](https://github.com/nvm-sh/nvm#installing-and-updating) and use it to switch the node version

```bash
cd /path/to/phantom
nvm use
```

### Setup NPM Token

Follow [NPM documentation](https://docs.npmjs.com/creating-and-viewing-authentication-tokens) to generate a token with access to private packages.

Next, you'll need to assign your NPM token to an environment variable in your preferred shell.

```zsh
export NPM_TOKEN="00000000-0000-0000-0000-000000000000"
```

Refer to [NPM's CI documentation](https://docs.npmjs.com/using-private-packages-in-a-ci-cd-workflow) for further information and troubleshooting help.

### Installation

Install NPM dependencies using [Yarn](https://yarnpkg.com/lang/en/):

```zsh
yarn install
```

If you encounter `node-gyp` errors, please reference the [Troubleshooting](#troubleshooting) section below.

### Start local cognito-cache

DKMS v2 introduced a caching layer to our DKMS system. This involved calling a cache aware `v3` user info api which encrypts the cognito pool info passing said encrypted data to a new lambda backed by API Gateway as another cache for cognito calls. By default, it is expected that the API Gateway cache is running locally.

To run DKMS v2 locally, you will need to setup a locally running lambda and api gateway. Luckily, this isn't too hard.

- Clone this repo https://github.com/magiclabs/cognito-cache
- Follow the readme for local setup and get it running.
- The ENV variable `GET_CREDENTIALS_PROXY_URL` is set to `http://127.0.0.1:3000/` by default but can be changed if you have the api on a different port.

On production we set `GET_CREDENTIALS_PROXY_URL` to a env specific url.

### Starting Auth Relayer

Start Auth Relayer in a development environment, pointed at `api.dev.magic.link`, with a hot-reloading client server:

```zsh
yarn start -dev     # point to `api.dev.magic.link`
```

Start Auth Relayer in another environment:

```zsh
yarn start -prod    # point to `api.prod.magic.link`
yarn start -stagef  # point to `api.stagef.magic.link`
yarn start -compat  # also build IE11 bundles during development

# Flags can be given in any order.
yarn start
yarn start -local -compat
yarn start -compat -dev
# ...and so forth
```

#### Developing with a local backend server

Start Auth Relayer in a local environment, pointing to a local backend:

```zsh
yarn start -local  # point to `localhost:8080` for end-to-end local development
yarn start -ip     # point your local IP address for mobile access
```

To run Auth Relayer end-to-end with a local instance of the Fortmatic API:

1. Start the Fortmatic API. Follow the instructions found [here](https://github.com/fortmatic/fortmatic) if you've never done this before.

2. Now you have a version of Auth Relayer that will communicate with a backend server.

3. Most likely you will also want a frontend to interact with Auth Relayer methods.

An end-to-end, comprehensive test environment is available at [`https://relayer-test-kitchen.vercel.app`](https://relayer-test-kitchen.vercel.app).

You'll want to specify the port that your local instance of relayer is running in the "Relayer Endpoint" field near the top. ie. "http://localhost:3014". Or prefill the field directly with the url parameters [`https://relayer-test-kitchen.vercel.app?env=phantomLocal`](https://relayer-test-kitchen.vercel.app?env=phantomLocal)

The code base for this test environment can be found at [`https://github.com/magiclabs/relayer-test-kitchen`](https://github.com/magiclabs/relayer-test-kitchen)

#### Developing locally with a staging server

Start Auth Relayer in a local environment, pointing to a stagef endpoint in this context the (https://auth.stagef.magic.link/):

```zsh
yarn start -stagef
```

To run Auth Relayer end-to-end with a stagef instance of the Fortmatic API:

1. Get your `public` API key from [`https://dashboard.stagef.magic.link/`](https://dashboard.stagef.magic.link/), **PS: Make sure you have your VPN set up so you don't run into Access Errors. if you don't, check here [`VPN Setup`](https://www.notion.so/magiclabs/VPN-Setup-f6ebbe8e8126492eab030aea79e4b9d8#617216c515af4e628d4ae7947eac970e)**

2. Now you have a version of Auth Relayer that will communicate with a backend server and your staging environment. Local Development is running on `http://localhost:3014` by default. You can test it with [`https://relayer-test-kitchen.vercel.app?env=phantomLocal`](https://relayer-test-kitchen.vercel.app?env=phantomLocal).

#### Developing with a local Magic SDK

Part 1: Create npm link from the library in magic-js to the npm node_modules

```
1. cd into the magic-js  folder
2. run yarn build
3. cd into types under @magic-sdk folder
4. run npm link
5. yarn build in the magic-js folder whenever you make changes
```

Part 2: Link the npm node_modules to the phantom

```
# cd to phantom
$ npm link magic-sdk

# Start the development server (pointing at localhost or IP):
yarn start -local
yarn start -ip
yarn start -dev
```

### Building & Serving for Production

To build Auth Relayer, optimized for production:

```zsh
yarn build
yarn build -dev     # point to `api.dev.magic.link`
yarn build -stagef  # point to `api.stagef.magic.link`
yarn build ...      # etc. (same flags as `yarn start`)
```

To serve the pre-built Auth Relayer assets:

```zsh
yarn serve
yarn serve -dev     # point to `api.dev.magic.link`
yarn serve -stagef  # point to `api.stagef.magic.link`
yarn serve ...      # etc. (same flags as `yarn start`)
```

To test a production build locally:

- `yarn build --local && yarn serve --local`
- > NOTE: You must provide the same ENV to `yarn build` and `yarn serve` to avoid unexpected behavior

## Testing [⤴](#table-of-contents)

### Unit Tests

The following tools encompass our unit-testing stack:

- [`jest`](https://jestjs.io/): Test runner, assertion, and stubbing library.
- [`@ikscodes/browser-env`](https://github.com/smithki/browser-env): Simulates a browser environment and offers easy mocking and stubbing of browser globals.

Run unit tests:

```zsh
# Run all unit tests:
yarn test:unit

# Run a subset of tests (supports globbing):
yarn test:unit test/**/helloWorld.spec.ts
```

### Integration Tests

We currently do not have integration tests for Auth Relayer. [See #269.](https://github.com/fortmatic/phantom/issues/269)

Run integration tests:

```zsh
yarn test:e2e
```

## Troubleshooting [⤴](#table-of-contents)

### Api key errors

You should not have to worry much about api keys but sometimes you may need to use a specifc test key. Sometimes you can get an error related to bad test keys or similar.

VPN: First thing to check is to make sure you are on the VPN.

ENV: make sure requests are going to the place you expect. Typically this will be `dev.api` but maybe you are trying to hit a local dev api. Just make sure they are going to the right spot.

node_modules: On the VPN? Good. Right endpoints? Nice. Now next thing to try is to nuke `node_modules` and run yarn again.

cache: Still not working? Now try running `yarn clean --cache`.

???:

### Adding new ENV variables

So you want to add some new ENV variables huh? It is simple but several places to update.

They are:

- `webpack.yaml` (required)
- `core/shared/constants/env.ts` (required)
- `deploy/Dockerfile` (required for all env)
- `deploy/Jenkinsfile` (required)
- `config/env` <-- (optional) for local setups

### `node-gyp` Errors

#### XCode

In **Mac OS** environments, you may be greeted with an error like this:

```zsh
xcode-select: error: tool 'xcodebuild' requires Xcode, but active developer
directory '/Library/Developer/CommandLineTools' is a command line tools instance

```

The solution, documented [here](https://github.com/nodejs/node-gyp/issues/569), is to install XCode CLI tools:

```zsh
xcode-select --install # Install Command Line Tools if you haven't already.
sudo xcode-select --switch /Library/Developer/CommandLineTools # Enable command line tools
```

If you use the full GUI XCode application, you may also face an error containing:

```zsh
Xcode is installed, but its license has not been accepted. Run Xcode and
accept its license agreement.
```

The solution is simple, you must agree to the XCode end-user license agreement, like so:

```zsh
sudo xcodebuild -license accept
```

# Infra

## Update Dependabot terraform config

Because of the way that Dependabot works, you need to update the terraform part of the dependabot config listing all directories that have `versions.tf` or modules. It's pretty much each folder that have `*.tf` file. So in order to make this operation easier, simply run:

```sh
  for i in $(find deploy -type f -name '*.tf' -not -path '*/.terraform/*' -not -path '*/.tfsec/*' | xargs dirname  | sort -u); \
    do cat dependabot_terraform.yaml.tpl| sed "s~DIR_NAME~${i}~"; \
  done
```

And replace `updates` in the `.github/dependabot.yml` file after the `# terraform block #` comment with output you've just got.
