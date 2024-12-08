import browserEnv from '@ikscodes/browser-env';
import '@testing-library/jest-dom';

browserEnv();

jest.useFakeTimers();

jest.mock('~/app/libs/datadog.ts', () => {
  return {
    getLogger: () => ({
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      log: jest.fn(),
    }),
  };
});
