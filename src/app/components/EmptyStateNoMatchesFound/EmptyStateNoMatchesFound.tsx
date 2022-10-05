import React, { FunctionComponent } from 'react';

import {
  EmptyState,
  EmptyStateVariant,
  EmptyStateIcon,
  Title,
  TitleSizes,
  EmptyStateBody,
  Button,
  ButtonVariant,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { css } from '@patternfly/react-styles';

import { Trans, useTranslation } from '@rhoas/app-services-ui-components';

type NoMatchFoundProps = {
  onClear: () => void;
};
export const EmptyStateNoMatchesFound: FunctionComponent<NoMatchFoundProps> = ({
  onClear,
}) => {
  const { t } = useTranslation();
  return (
    <EmptyState
      variant={EmptyStateVariant.large}
      className={css('pf-u-pt-2xl pf-u-pt-3xl-on-md')}
    >
      <EmptyStateIcon icon={SearchIcon} />
      <Title headingLevel={'h2'} size={TitleSizes['xl']}>
        {t('noResultsFound')}
      </Title>
      <EmptyStateBody>
        <Trans i18nKey={'noFilterResultsFound'}>
          No results match the filter criteria.{' '}
          <Button
            variant={ButtonVariant.link}
            isSmall
            isInline
            onClick={onClear}
          >
            Clear all filters
          </Button>{' '}
          to show results.
        </Trans>
      </EmptyStateBody>
    </EmptyState>
  );
};
