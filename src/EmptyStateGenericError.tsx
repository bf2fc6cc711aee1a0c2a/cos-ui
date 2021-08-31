import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import {
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Title,
  TitleSizes,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';

export const EmptyStateGenericError: FunctionComponent = () => {
  const { t } = useTranslation();
  return (
    <EmptyState variant={EmptyStateVariant.full}>
      <EmptyStateIcon icon={ExclamationCircleIcon} />
      <Title headingLevel={'h1'} size={TitleSizes['lg']}>
        {t('Something went wrong')}
      </Title>
      <EmptyStateBody>
        {t('There was a problem processing the request. Please try again.')}
      </EmptyStateBody>
    </EmptyState>
  );
};
