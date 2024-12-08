import { createFramerTransition } from '@magiclabs/ui';

const bouncyTransition = createFramerTransition()
  .withVariants({
    initial: { opacity: 0.8, scale: 0.8 },
    animate: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', bounce: 0.5 } },
    exit: { opacity: 0.8, scale: 0.8, transition: { ease: 'easeOut', duration: 0.05 } },
  })
  .withReducedMotion({
    initial: { opacity: 1, x: 0, scale: 1 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 1, x: 0, scale: 1 },
  });

export function useBouncyTransition() {
  return bouncyTransition.use({
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
  });
}
