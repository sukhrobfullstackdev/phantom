/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-param-reassign */

import { Rule } from 'eslint';

const rule: Rule.RuleModule = {
  meta: {
    docs: {
      description: 'This rule catches function calls at the top-level of `_pages` files.',
      category: 'Possible Errors',
      recommended: false,
    },

    type: 'suggestion',
  },

  create(context): Rule.RuleListener {
    if (!/_pages/.test(context.getFilename())) {
      // Skip non-page files
      return {};
    }

    return {
      CallExpression: (node: any) => {
        if (node?.callee?.object?.name === 'createFeatureModule' && node?.callee?.property?.name === 'Page') {
          // Skip `createFeatureModule.Page(...)` calls
          return;
        }

        if (!isInScope(node)) {
          context.report({
            node,
            message: 'Call expressions at the top-level of `_pages` files should be avoided.',
          });
        }
      },
    };
  },
};

function isInScope(n: any): boolean {
  const { type } = n;
  if (['ArrowFunctionExpression', 'FunctionDeclaration', 'ClassDeclaration', 'ExportNamedDeclaration'].includes(type)) {
    return true;
  }

  n = n.parent;
  if (n) {
    return isInScope(n);
  }

  return false;
}

export default rule;
