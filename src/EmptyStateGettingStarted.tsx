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
import SpaceShuttleIcon from '@patternfly/react-icons/dist/js/icons/space-shuttle-icon';
import { css } from '@patternfly/react-styles';

type EmptyStateGettingStartedProps = {
  onHelp: () => void;
  onCreate: () => void;
};

export const EmptyStateGettingStarted: FunctionComponent<EmptyStateGettingStartedProps> =
  ({ onHelp, onCreate }) => {
    const { t } = useTranslation();
    return (
      <EmptyState
        variant={EmptyStateVariant.xl}
        className={css('pf-u-pt-2xl pf-u-pt-3xl-on-md')}
      >
        <EmptyStateIcon icon={SpaceShuttleIcon} />
        <Title headingLevel={'h1'} size={TitleSizes['4xl']}>
          {t('Welcome to Managed Connectors')}
        </Title>
        <EmptyStateBody>
          <Trans>
            For help getting started, access the{' '}
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
        <Button variant={'primary'} onClick={onCreate}>
          {t('Create Connector')}
        </Button>
      </EmptyState>
    );
  };
