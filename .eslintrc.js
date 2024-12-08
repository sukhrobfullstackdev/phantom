module.exports = {
  extends: [
    '@ikscodes/eslint-config',
    'plugin:jsx-a11y/recommended',
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],

  plugins: ['auth-relayer', 'jsx-a11y'],

  parserOptions: {
    project: ['./tsconfig.json'],
  },

  rules: {
    // Core rules
    'no-alert': 0,
    'no-empty': 0,
    'default-case': 0,
    'no-cond-assign': 0,
    'no-useless-return': 0,
    'consistent-return': 0,
    'no-underscore-dangle': 0,
    'no-useless-constructor': 0,
    'class-methods-use-this': 0,
    'no-param-reassign': [2, { props: false }],
    'no-unused-vars': 0,
    'no-shadow': 1,
    'no-nested-ternary': 0,

    // TypeScript rules
    '@typescript-eslint/ban-types': 0,
    '@typescript-eslint/ban-ts-comment': 0,
    '@typescript-eslint/await-thenable': 0,
    '@typescript-eslint/no-unsafe-call': 0,
    '@typescript-eslint/no-unsafe-return': 0,
    '@typescript-eslint/no-empty-function': 0,
    '@typescript-eslint/no-unsafe-assignment': 0,
    '@typescript-eslint/no-floating-promises': 0,
    '@typescript-eslint/no-unsafe-member-access': 0,
    '@typescript-eslint/restrict-template-expressions': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/no-non-null-asserted-optional-chain': 0,
    '@typescript-eslint/no-unused-vars': 'warn',
    // TODO remove below and clean up all typescript errors
    '@typescript-eslint/no-unsafe-argument': 1,
    '@typescript-eslint/no-explicit-any': 1,
    '@typescript-eslint/no-unnecessary-type-constraint': 1,
    '@typescript-eslint/no-empty-interface': 1,

    // React rules
    'react/button-has-type': 0,
    'react/require-default-props': 0,
    'react/default-props-match-prop-types': 0,

    // Import rules
    'import/extensions': 0,
    'import/no-extraneous-dependencies': [1, { devDependencies: true }],
    'import/order': 0,

    // Custom rules
    'auth-relayer/ban-page-effects': 2,
  },

  settings: {
    'import/resolver': {
      typescript: {
        project: ['./tsconfig.json'],
      },
    },
  },
};
