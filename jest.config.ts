import type { Config } from '@jest/types';

import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

const config: Config.InitialOptions = {
  maxWorkers: 2,
  preset: 'ts-jest',
  coverageReporters: ['text-summary', 'html'],
  collectCoverageFrom: ['core/**/*.{ts,tsx,}', 'features/**/*.{ts,tsx,}'],
  collectCoverage: true,
  moduleNameMapper: {
    ...pathsToModuleNameMapper(
      {
        ...compilerOptions.paths,
      },
      { prefix: '<rootDir>/' },
    ),
    '\\.(css|less)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/test/jest/__mocks__/fileMock.js',
  },
  setupFilesAfterEnv: ['./test/setup.ts'],
  globals: {
    'ts-jest': {
      tsconfig: { ...compilerOptions, jsx: 'react' },
      isolatedModules: true,
    },
  },
  transform: {
    '\\.(less|css)$': 'jest-less-loader',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/fileTransformer.js',
  },
};

export default config;
