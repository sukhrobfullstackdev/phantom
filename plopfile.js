const cFonts = require('cfonts');
const { readdirSync } = require('fs');
const actionUpdateManifest = require('./scripts/plops/actionUpdateManifest');

const existingFeatures = readdirSync('features', { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

const validateNotEmpty = str => (str && str.trim().length > 0 ? true : 'input cannot be empty');

const validateRpc = str =>
  validateNotEmpty(str) && !str.match(/\-|\//g)
    ? true
    : 'rpc routes cannot have sub folders and must use snake casing.';

const featurePrompt = {
  type: 'list',
  name: 'featureName',
  message: `Which feature is this for?`,
  choices: [...existingFeatures, '[new feature]'],
};

const newFeaturePrompt = {
  type: 'input',
  name: 'featureName',
  askAnswered: true,
  message: 'What is the name of the feature?',
  when: ({ featureName }) => featureName === '[new feature]' || !featureName,
  validate: featureName => {
    const isEmpty = validateNotEmpty(featureName);
    if (typeof isEmpty === 'string') {
      return isEmpty;
    }
    const hasPathInName = featureName.match(/\/| /g);
    if (hasPathInName) {
      return 'Feature name cannot be a path and cannot have spaces';
    }
    const isDuplicateFeature = featurePrompt.choices.includes(featureName);
    if (isDuplicateFeature) {
      return 'That feature name already exists.';
    }
    return true;
  },
};

const updateFeatureManifestPrompt = {
  type: 'confirm',
  name: 'shouldUpdateManifest',
  message: 'Add entry for feature to manifest?',
  when: ({ featureName }) => !featurePrompt.choices.includes(featureName),
};

const routeNamePrompt = {
  type: 'input',
  name: 'routeName',
  message: 'What is the route name?',
  validate: validateNotEmpty,
};

const routeTypePrompt = {
  type: 'list',
  name: 'routeType',
  message: 'What kind of route?',
  choices: ['rpc', 'api', 'page'],
};

const recursiveRoutesPrompt = {
  type: 'recursive',
  message: 'Add api, page, or rpc routes?',
  name: 'routes',
  prompts: [
    routeTypePrompt,
    {
      ...routeNamePrompt,
      validate: (routeName, { routeType }) => {
        console.log(routeName);
        if (routeType === 'rpc') {
          return validateRpc(routeName);
        }
        return validateNotEmpty(routeName);
      },
    },
  ],
};

module.exports = function (plop) {
  const welcomeMsg = cFonts.render('Plooper', {
    font: 'tiny',
    lineHeight: 0.2,
    align: 'left',
    colors: ['system'],
    gradient: ['#6851ff', '#a796ff'],
    transitionGradient: true,
  });
  plop.setWelcomeMessage(`${welcomeMsg.string} Hello and welcome to the plop tool for phantom. Pick an option and go!`);
  plop.setPrompt('recursive', require('inquirer-recursive'));
  plop.setActionType('updateManifest', actionUpdateManifest);

  plop.setGenerator('rpc route', {
    description: 'add an rpc route to a new or existing feature',
    prompts: [
      featurePrompt,
      newFeaturePrompt,
      updateFeatureManifestPrompt,
      {
        ...routeNamePrompt,
        validate: validateRpc,
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'features/{{featureName}}/_rpc/{{routeName}}.ts',
        templateFile: 'scripts/plops/rpc-template.ts',
      },
      {
        type: 'updateManifest',
      },
    ],
  });

  plop.setGenerator('api route', {
    description: 'add an api route to a new or existing feature',
    prompts: [featurePrompt, newFeaturePrompt, updateFeatureManifestPrompt, routeNamePrompt],
    actions: [
      {
        type: 'add',
        path: 'features/{{featureName}}/_rpc/{{routeName}}.ts',
        templateFile: 'scripts/plops/api-template.ts',
      },
      {
        type: 'updateManifest',
      },
    ],
  });

  plop.setGenerator('page route', {
    description: 'add a page to a new or existing feature',
    prompts: [featurePrompt, newFeaturePrompt, updateFeatureManifestPrompt, routeNamePrompt],
    actions: [
      {
        type: 'add',
        path: 'features/{{featureName}}/_pages/{{routeName}}.tsx',
        templateFile: 'scripts/plops/page-template.ts',
      },
      {
        type: 'updateManifest',
      },
    ],
  });

  plop.setGenerator('new feature', {
    description: 'add a new feature along with any number of api, page, or rpc routes',
    prompts: [newFeaturePrompt, updateFeatureManifestPrompt, recursiveRoutesPrompt],
    actions: ({ featureName, routes }) => {
      const routeTypeToFileTypes = {
        rpc: 'ts',
        api: 'ts',
        page: 'tsx',
      };
      const actions = routes.map(({ routeType, routeName }) => ({
        type: 'add',
        path: `features/${featureName}/_${routeType}/${routeName}.${routeTypeToFileTypes[routeType]}`,
        templateFile: `scripts/plops/${routeType}-template.ts`,
      }));

      if (actions.length > 0) {
        actions.push({ type: 'updateManifest' });
      }

      return actions;
    },
  });
};
