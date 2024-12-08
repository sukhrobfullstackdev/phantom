import React from 'react';
import { render } from '@testing-library/react';
import { AppName } from './app-name';
import { testModeStore } from '~/features/test-mode/store';

describe('App Name Tests', () => {
  it('should render a Verified App with Verified Badge', () => {
    const { container } = render(
      <testModeStore.Provider>
        <AppName />
      </testModeStore.Provider>,
    );
    // TODO: mock out useTheme
    // expect(container.getElementsByTagName('span').item(0)?.textContent).toBe('app name');
  });
});
