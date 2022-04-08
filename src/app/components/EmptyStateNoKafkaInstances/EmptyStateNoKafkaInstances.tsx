import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Title,
  TitleSizes,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { css } from '@patternfly/react-styles';

type EmptyStateNoKafkaInstancesProps = {
  onCreate: () => void;
};

export const EmptyStateNoKafkaInstances: FunctionComponent<EmptyStateNoKafkaInstancesProps> =
  ({ onCreate }) => {
    const { t } = useTranslation();
    return (
      <EmptyState
        variant={EmptyStateVariant.xl}
        className={css('pf-u-pt-2xl pf-u-pt-3xl-on-md')}
      >
        <EmptyStateIcon icon={PlusCircleIcon} />
        <Title headingLevel={'h1'} size={TitleSizes['4xl']}>
          {t('noKafkaInstanceAvailable')}
        </Title>
        <EmptyStateBody>{t('noKafkaInstanceAvailableBody')}</EmptyStateBody>
        <Button variant={'primary'} onClick={onCreate}>
          {t('createKafkaInstance')}
        </Button>
      </EmptyState>
    );
  };
