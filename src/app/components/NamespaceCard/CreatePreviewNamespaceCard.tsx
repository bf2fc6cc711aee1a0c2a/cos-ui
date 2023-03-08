import React from 'react';

import {
  Button,
  EmptyState,
  EmptyStateVariant,
  EmptyStateIcon,
  Title,
  EmptyStateBody,
  CardFooter,
  ButtonVariant,
  Card,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

import { useTranslation } from '@rhoas/app-services-ui-components';

type CreatePreviewNamespaceCardProps = {
  className?: string;
  onModalToggle: () => void;
};

export const CreatePreviewNamespaceCard: React.FunctionComponent<
  CreatePreviewNamespaceCardProps
> = ({ className, onModalToggle }) => {
  const { t } = useTranslation();
  return (
    <Card className={className}>
      <EmptyState variant={EmptyStateVariant.xs} isFullHeight>
        <EmptyStateIcon icon={PlusCircleIcon} />
        <Title headingLevel="h4" size="md">
          {t('createPreviewNamespaceCardTitle')}
        </Title>
        <EmptyStateBody>
          {t('createPreviewNamespaceCardBody')}
          <br />
          <br />
        </EmptyStateBody>
      </EmptyState>
      <CardFooter className="pf-u-text-align-center">
        <Button
          component={'a'}
          variant={ButtonVariant.link}
          isInline
          onClick={onModalToggle}
        >
          {t('createPreviewNamespace')}
        </Button>
      </CardFooter>
    </Card>
  );
};
