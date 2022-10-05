import React, { FunctionComponent } from 'react';

import {
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Title,
  TitleSizes,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';

import { useTranslation } from '@rhoas/app-services-ui-components';

export const EmptyStateGenericError: FunctionComponent = () => {
  const { t } = useTranslation();
  return (
    <EmptyState variant={EmptyStateVariant.full}>
      <EmptyStateIcon icon={ExclamationCircleIcon} />
      <Title headingLevel={'h1'} size={TitleSizes['lg']}>
        {t('somethingWentWrong')}
      </Title>
      <EmptyStateBody>{t('genericErrorBody')}</EmptyStateBody>
    </EmptyState>
  );
};
