import React, { FunctionComponent } from 'react';

import {
  Button,
  ButtonVariant,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Title,
  TitleSizes,
  Text,
  TextVariants,
} from '@patternfly/react-core';
import {
  PlusCircleIcon,
  ExternalLinkAltIcon,
  OpenDrawerRightIcon,
} from '@patternfly/react-icons';
import { css } from '@patternfly/react-styles';

import { Trans, useTranslation } from '@rhoas/app-services-ui-components';

type EmptyStateGettingStartedProps = {
  onHelp: () => void;
  onCreate: () => void;
};

export const EmptyStateGettingStarted: FunctionComponent<
  EmptyStateGettingStartedProps
> = ({ onHelp, onCreate }) => {
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
        <Text component={TextVariants.p} className="pf-u-pb-md">
          <Trans i18nKey={'gettingStartedBodyPrerequisites'}>
            The creation{' '}
            <Button
              variant={ButtonVariant.link}
              isSmall
              isInline
              onClick={() => {
                window.open(
                  'https://access.redhat.com/documentation/en-us/openshift_connectors/1/guide/21f5b059-044f-49d4-afca-1051e6e09c37#_b7b12de2-f59e-4d2e-b33b-afab7a7159e1',
                  '_blank'
                );
              }}
              ouiaId={'link-Prerequisites'}
              icon={<ExternalLinkAltIcon />}
              iconPosition="right"
            >
              prerequisites
            </Button>
          </Trans>
        </Text>
        <Text component={TextVariants.p}>
          <Trans i18nKey={'gettingStartedBodyQuickStartGuide'}>
            For help getting started, access the{' '}
            <Button
              variant={ButtonVariant.link}
              isSmall
              isInline
              onClick={onHelp}
              ouiaId={'link-QuickStart'}
              icon={<OpenDrawerRightIcon />}
              iconPosition="right"
            >
              quick start guide.
            </Button>
          </Trans>
        </Text>
      </EmptyStateBody>
      <Button variant={'primary'} onClick={onCreate} ouiaId={'button-create'}>
        {t('createConnectorsInstance')}
      </Button>
    </EmptyState>
  );
};
