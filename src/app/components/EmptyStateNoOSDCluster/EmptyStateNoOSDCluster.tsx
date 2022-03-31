import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Button,
  ButtonVariant,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Title,
  TitleSizes,
} from '@patternfly/react-core';
import { ClusterIcon } from '@patternfly/react-icons';
import { css } from '@patternfly/react-styles';

type EmptyStateNoOSDClusterProps = {
  onModalToggle: () => void;
};

export const EmptyStateNoOSDCluster: FunctionComponent<EmptyStateNoOSDClusterProps> =
  ({ onModalToggle }) => {
    const { t } = useTranslation();
    return (
      <EmptyState
        variant={EmptyStateVariant.xl}
        className={css('pf-u-pt-2xl pf-u-pt-3xl-on-md')}
      >
        <EmptyStateIcon icon={ClusterIcon} />
        <Title headingLevel={'h1'} size={TitleSizes['4xl']}>
        {t('No deployment namespace available')}
        </Title>
        <EmptyStateBody>
        <Button
            variant={ButtonVariant.primary}
            isInline
            onClick={onModalToggle}
          >
            {t('Create a namespace')}
          </Button>
        </EmptyStateBody>
      </EmptyState>
    );
  };
