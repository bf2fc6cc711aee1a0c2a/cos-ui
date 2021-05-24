import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStatePrimary,
  Title,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import React, { FunctionComponent } from 'react';

type NoMatchFoundProps = {
  onClear?: () => void;
};
export const NoMatchFound: FunctionComponent<NoMatchFoundProps> = ({
  onClear,
}) => (
  <EmptyState>
    <EmptyStateIcon icon={SearchIcon} />
    <Title size="lg" headingLevel="h4">
      No results found
    </Title>
    <EmptyStateBody>
      No results match the filter criteria. Clear all filters to show results.
    </EmptyStateBody>
    {onClear && (
      <EmptyStatePrimary>
        <Button variant="link" onClick={onClear}>
          Clear all filters
        </Button>
      </EmptyStatePrimary>
    )}
  </EmptyState>
);
