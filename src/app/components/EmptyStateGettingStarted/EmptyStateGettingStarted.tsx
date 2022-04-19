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
import { PlusCircleIcon } from '@patternfly/react-icons';
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
        variant={EmptyStateVariant.large}
        className={css('pf-u-pt-2xl pf-u-pt-3xl-on-md')}
      >
        <EmptyStateIcon icon={PlusCircleIcon} />
        <Title headingLevel={'h1'} size={TitleSizes['xl']}>
          {t('noConnectorInstances')}
        </Title>
        <EmptyStateBody>
          <Trans i18nKey={'gettingStartedBody'}>
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
          {t('createAConnectorsInstance')}
        </Button>
      </EmptyState>
    );
  };
