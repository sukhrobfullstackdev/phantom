import React, { Suspense } from 'react';

interface LazyComponentConfiguration<Props> {
  loader: () => Promise<React.ComponentType<Props>>;
  loading?: React.ComponentType<any>;
  render?: (Component: React.ComponentType<Props>) => React.ComponentType<Props>;
  delay?: number;
}

/**
 * Wraps `React.lazy` and `React.Suspense` with a default loading state and a
 * friendly API.
 */
export function createLazyComponent<Props>(configuration: LazyComponentConfiguration<Props>) {
  const { loader, render, delay, loading: Loading = null } = configuration;

  const Loadable = React.lazy(() => {
    return new Promise<{ default: React.ComponentType<any> }>((resolve, reject) => {
      setTimeout(() => {
        loader()
          .then(Component => resolve({ default: render ? render(Component) : Component }))
          .catch(reject);
      }, delay ?? 800);
    });
  });

  const LazyComponent: React.FC<Props> = props => {
    return (
      <Suspense fallback={Loading ? <Loading /> : null}>
        <Loadable {...props} />
      </Suspense>
    );
  };

  LazyComponent.displayName = 'LazyComponent';
  return LazyComponent;
}
