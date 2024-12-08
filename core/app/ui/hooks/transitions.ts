import { createFramerTransition } from '@magiclabs/ui';

const fadeTransition = createFramerTransition().withVariants({
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
});

export function useFade() {
  return fadeTransition.use({
    initial: 'hidden',
    animate: 'visible',
    exit: 'hidden',
  });
}

const scaleTransition = createFramerTransition<number>()
  .withVariants({
    hiddenWithScale: scale => ({ opacity: 0, scale }),
    hiddenWithoutScale: { opacity: 0, scale: 1 },
    visible: { opacity: 1, scale: 1 },
  })
  .withReducedMotion({ hiddenWithScale: { opacity: 0, scale: 1 } });

export function useScale() {
  return scaleTransition.use({
    initial: 'hiddenWithScale',
    animate: 'visible',
    exit: 'hiddenWithScale',
  });
}

export function useScaleIn() {
  return scaleTransition.use({
    initial: 'hiddenWithScale',
    animate: 'visible',
    exit: 'hiddenWithoutScale',
  });
}

export function useScaleOut() {
  return scaleTransition.use({
    initial: 'hiddenWithoutScale',
    animate: 'visible',
    exit: 'hiddenWithScale',
  });
}
