import React, { FunctionComponent } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

const ErrorFallback: FunctionComponent<{ error: Error }> = ({ error }) => {
  return (
    <div role="alert">
      <p>Something went wrong: </p>
      <pre>{error.message}</pre>
    </div>
  );
};

export const StepErrorBoundary: FunctionComponent = ({ children }) => (
  <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[Date.now()]}>
    {children}
  </ErrorBoundary>
);
