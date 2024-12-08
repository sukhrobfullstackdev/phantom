import { motion as origMotion, createDomMotionComponent } from '~/node_modules/framer-motion';
import { htmlElements, svgElements } from './supported-elements';

/**
 * `framer-motion@2.x` requires ES6 Proxy, thus breaking ES5-only browsers like
 * IE11. Proxy cannot be polyfilled in its entirety, so we introduce this
 * workaround where we replace the `framer-motion` object with compatible,
 * non-Proxy elements.
 *
 * NOTE: Even with this workaround, `framer-motion` calls to ES6 Proxy as a
 * side-effect, meaning that we still need to include the `proxy-polyfill` to
 * avoid undefined behavior.
 *
 * Adapted from:
 *
 *   - https://github.com/framer/motion/issues/364#issuecomment-723137822
 *   - https://github.com/framer/motion/commit/b4319c78fb4bde28ce0d2a8008df48d7e3fd1c8b
 */
function createNonProxyMotion(): typeof origMotion {
  const motionProxy: any = {
    custom: (component: any) => {
      createDomMotionComponent(component);
    },
  };

  [...htmlElements, ...svgElements].forEach(key => {
    motionProxy[key] = createDomMotionComponent(key);
  });

  return motionProxy;
}

export const motion = createNonProxyMotion();

// Re-export the entire `framer-motion` entry-point so that
// we can perform a direct module replacement in Webpack.
export * from '~/node_modules/framer-motion';
