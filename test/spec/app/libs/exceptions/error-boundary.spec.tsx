import React from 'react';
import { render } from '@testing-library/react';
import { ErrorBoundary } from '~/app/libs/exceptions/error-boundary';
import { getLogger, getMonitoring } from '~/app/libs/datadog';
import { getErrorMessage } from '~/app/libs/exceptions/error-handler';

jest.mock('~/app/libs/datadog', () => ({
  getLogger: jest.fn().mockReturnValue({
    error: jest.fn(),
  }),
  getMonitoring: jest.fn().mockReturnValue({
    addError: jest.fn(),
  }),
}));
jest.mock('~/app/libs/analytics-datadog-helpers', () => ({
  buildMessageContext: jest.fn().mockReturnValue({
    message: 'Error Message',
  }),
}));
jest.mock('~/app/libs/exceptions/error-handler', () => ({
  getErrorMessage: jest.fn(),
}));

const ProblemChild = () => {
  throw new Error('Error thrown from problem child');
};

describe('ErrorBoundary', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should catch errors with componentDidCatch', () => {
    const error = new Error('Error thrown from problem child');
    getErrorMessage.mockReturnValue('An error has occurred');

    const { getByText } = render(
      <ErrorBoundary fallback={<div>Error caught</div>} scope="error-boundary">
        <ProblemChild />
      </ErrorBoundary>,
    );

    expect(getLogger().error).toHaveBeenCalledWith('[ErrorBoundary Error]: error-boundary', expect.anything());
    expect(getMonitoring().addError).toHaveBeenCalledWith(error, { scope: 'error-boundary' });
    expect(getByText('Error caught')).toBeInTheDocument();
  });

  it('should reset when a new scope is provided', () => {
    const key = 'unique-key';
    const { rerender, queryByText } = render(
      <ErrorBoundary key={key} fallback="New scope" scope="new-scope">
        <h1>Hello World</h1>
      </ErrorBoundary>,
    );

    expect(queryByText('Hello World')).toBeInTheDocument();

    rerender(
      <ErrorBoundary key={key} fallback="New scope" scope="updated-scope">
        <h1>Hello World</h1>
      </ErrorBoundary>,
    );

    expect(queryByText('Hello World')).toBeInTheDocument();
  });

  it('should display fallback when an error is caught', () => {
    const FallbackComponent = () => <div>Fallback component</div>;
    const { getByText } = render(
      <ErrorBoundary fallback={<FallbackComponent />}>
        <ProblemChild />
      </ErrorBoundary>,
    );

    expect(getByText('Fallback component')).toBeInTheDocument();
  });

  it('should call the fallback function if provided', () => {
    const fallback = jest.fn().mockReturnValue(<div>Fallback rendered</div>);
    render(
      <ErrorBoundary fallback={fallback}>
        <ProblemChild />
      </ErrorBoundary>,
    );

    expect(fallback).toHaveBeenCalled();
  });

  it('should render nothing if fallback is not a valid element or function', () => {
    const { container } = render(
      <ErrorBoundary fallback={null}>
        <ProblemChild />
      </ErrorBoundary>,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
