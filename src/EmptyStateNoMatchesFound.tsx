import React, { FunctionComponent } from 'react';
import { Trans, useTranslation } from 'react-i18next';

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
        {t('No results found')}
      </Title>
      <EmptyStateBody>
        <Trans>
          No results match the filter criteria.{' '}
          <Button
            variant={ButtonVariant.link}
            isSmall
            isInline
            onClick={onClear}
          >
            {t('Clear all filters')}
          </Button>{' '}
          to show results.
        </Trans>
      </EmptyStateBody>
    </EmptyState>
  );
};
