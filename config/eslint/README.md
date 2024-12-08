# Custom ESLint Rules

This directory contains an implementation for custom [ESLint](https://eslint.org) rules we depend on throughout the Auth Relayer code base.

## How it works

In the [`package.json`](../../package.json) file at the root of this repository, we register this directory as a [linked dependency using Yarn](https://classic.yarnpkg.com/en/docs/cli/add/#toc-adding-dependencies), like so: `"eslint-plugin-auth-relayer": "link:./config/eslint"`. Whenever Node dependencies are installed with `yarn install`, this directory is then symlinked to `node_modules`, exposing it to ESLint.

The purpose of [`./index.js`](./index.js) in this directory is to transpile TypeScript files within [`./rules`](./rules) on-the-fly so that we can implement our custom rules using the full suite of syntax features we expect everywhere else in the codebase.

## Creating a new custom ESLint rule

1. Create a TypeScript module in [`./rules`](./rules) which exposes an [ESLint rule definition](https://eslint.org/docs/developer-guide/working-with-rules) as its default export.

2. Register your new rule with a short, semantic, dash-cased name in [`./rules/index.ts`](./rules/index.ts). For example:

```ts
...
import myNewCustomRule from './my-new-custom-rule';

const rules = {
  ...
  'my-new-custom-rule': myNewCustomRule,
};
```

3. Register your new rule with ESLint itself in [`../../.eslintrc.js`](../../.eslintrc.js). For example:

```ts
module.exports = {
  ...
  rules: {
    // Custom rules
    ...
    "auth-relayer/my-new-custom-rule": // Note the "auth-relayer/" prefix...
      | 0 | 1 | 2 | "off" | "warn" | "error"
      | [0 | 1 | 2 | "off" | "warn" | "error", ...config],
  },
  ...
}
```

4. Document your new rule in **this README file** (see the next section).

## Our custom rules

### [`ban-page-effects`](./rules/ban-page-effects.ts)

Page modules in Auth Relayer's feature framework (those files nested within `_pages` folders) can not guarantee their loading order before or after Auth Relayer's core code. As such, we ban side-effects at the top-level of page modules. This, of course, excludes the required call to `createFeatureModule.Page`.
