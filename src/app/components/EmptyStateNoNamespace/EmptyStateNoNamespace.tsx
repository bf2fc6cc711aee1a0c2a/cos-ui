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
  TitleSizes,
} from '@patternfly/react-core';
import {
  ExternalLinkSquareAltIcon,
  PlusCircleIcon,
} from '@patternfly/react-icons';

type EmptyStateNoNamespaceProps = {
  onModalToggle: () => void;
};

export const EmptyStateNoNamespace: FunctionComponent<EmptyStateNoNamespaceProps> =
  ({ onModalToggle }) => {
    const { t } = useTranslation();
    return (
      <Bullseye>
        <EmptyState variant={EmptyStateVariant.large}>
          <EmptyStateIcon icon={PlusCircleIcon} />
          <Title headingLevel={'h1'} size={TitleSizes['xl']}>
            {t('noNamespaceAvailable')}
          </Title>
          <EmptyStateBody>{t('namespaceEmptyMsg')}</EmptyStateBody>
          <Button variant="primary" onClick={onModalToggle}>
            {t('createPreviewNamespace')}
          </Button>
          <EmptyStateSecondaryActions>
            <a
              href="https://access.redhat.com/documentation/en-us/red_hat_openshift_connectors"
              target="_blank"
            >
              <ExternalLinkSquareAltIcon />
              {t('osdInstallationGuide')}
            </a>
          </EmptyStateSecondaryActions>
        </EmptyState>
      </Bullseye>
    );
  };
