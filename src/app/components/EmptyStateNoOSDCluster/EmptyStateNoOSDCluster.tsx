import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Bullseye,
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateSecondaryActions,
  EmptyStateVariant,
  Title,
} from '@patternfly/react-core';
import {
  ExternalLinkSquareAltIcon,
  PlusCircleIcon,
} from '@patternfly/react-icons';

type EmptyStateNoOSDClusterProps = {
  onModalToggle: () => void;
};

export const EmptyStateNoOSDCluster: FunctionComponent<EmptyStateNoOSDClusterProps> =
  ({ onModalToggle }) => {
    const { t } = useTranslation();
    return (
      <Bullseye>
        <EmptyState variant={EmptyStateVariant.large}>
          <EmptyStateIcon icon={PlusCircleIcon} />
          <Title headingLevel="h4" size="lg">
            {t('noNamespaceAvailable')}
          </Title>
          <EmptyStateBody>{t('namespaceEmptyMsg')}</EmptyStateBody>
          <Button variant="primary" onClick={onModalToggle}>
            {t('registerEvalNamespace')}
          </Button>
          <EmptyStateSecondaryActions>
            <Button variant="link" icon={<ExternalLinkSquareAltIcon />}>
              {t('osdInstallationGuide')}
            </Button>
          </EmptyStateSecondaryActions>
        </EmptyState>
      </Bullseye>
    );
  };
