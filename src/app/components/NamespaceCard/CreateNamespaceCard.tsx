import React from 'react';

import {
  Button,
  ButtonVariant,
  EmptyState,
  EmptyStateIcon,
  Title,
  EmptyStateBody,
  EmptyStateVariant,
  CardFooter,
  Card,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, PlusCircleIcon } from '@patternfly/react-icons';

import { Trans, useTranslation } from '@rhoas/app-services-ui-components';

type CreateNamespaceCardProps = {
  className?: string;
};

export const CreateNamespaceCard: React.FunctionComponent<
  CreateNamespaceCardProps
> = ({ className }) => {
  const { t } = useTranslation();
  return (
    <Card className={className}>
      <EmptyState variant={EmptyStateVariant.xs} isFullHeight>
        <EmptyStateIcon icon={PlusCircleIcon} />
        <Title headingLevel="h4" size="md">
          {t('createNamespaceCardTitle')}
        </Title>
        <EmptyStateBody>
          <Trans i18nKey={'createNamespaceCardBody'}>
            Install the Connectors{' '}
            <span className="pf-u-text-nowrap">add-on</span> on an OpenShift
            cluster to create a namespace.
          </Trans>
        </EmptyStateBody>
      </EmptyState>
      <CardFooter className="pf-u-text-align-center">
        <Button
          component={'a'}
          variant={ButtonVariant.link}
          isInline
          target={'_blank'}
          href={t('addonInstallationGuideURL')}
          icon={<ExternalLinkAltIcon />}
          iconPosition="right"
        >
          {t('addOnLink')}
        </Button>
      </CardFooter>
    </Card>
  );
};
