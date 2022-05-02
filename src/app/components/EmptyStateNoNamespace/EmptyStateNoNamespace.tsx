import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Bullseye,
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Title,
  TitleSizes,
  Tooltip,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

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
          <Tooltip content={<div>{t('namespaceEnabledTooltip')}</div>}>
            <Button variant="primary" onClick={onModalToggle}>
              {t('createPreviewNamespace')}
            </Button>
          </Tooltip>
        </EmptyState>
      </Bullseye>
    );
  };
