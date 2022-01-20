import React, { FunctionComponent } from 'react';
import { Trans, useTranslation } from 'react-i18next';

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
import { SpaceShuttleIcon } from '@patternfly/react-icons';
import { css } from '@patternfly/react-styles';

type EmptyStateNoKafkaInstancesProps = {
  onHelp: () => void;
};

export const EmptyStateNoKafkaInstances: FunctionComponent<EmptyStateNoKafkaInstancesProps> =
  ({ onHelp }) => {
    const { t } = useTranslation();
    return (
      <EmptyState
        variant={EmptyStateVariant.xl}
        className={css('pf-u-pt-2xl pf-u-pt-3xl-on-md')}
      >
        <EmptyStateIcon icon={SpaceShuttleIcon} />
        <Title headingLevel={'h1'} size={TitleSizes['4xl']}>
          {t('No Kafka instance available')}
        </Title>
        <EmptyStateBody>
          <Trans>
            Development preview instances are available for creation. For help
            getting started, access the{' '}
            <Button
              variant={ButtonVariant.link}
              isSmall
              isInline
              onClick={onHelp}
            >
              quick start guide.
            </Button>
          </Trans>
        </EmptyStateBody>
      </EmptyState>
    );
  };
