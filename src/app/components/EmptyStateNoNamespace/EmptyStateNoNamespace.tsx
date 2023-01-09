import React, { FunctionComponent } from 'react';

import {
  Bullseye,
  Button,
  ButtonVariant,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateSecondaryActions,
  EmptyStateVariant,
  Title,
  TitleSizes,
  Tooltip,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, PlusCircleIcon } from '@patternfly/react-icons';

import { useTranslation } from '@rhoas/app-services-ui-components';

type EmptyStateNoNamespaceProps = {
  onModalToggle: () => void;
};

export const EmptyStateNoNamespace: FunctionComponent<
  EmptyStateNoNamespaceProps
> = ({ onModalToggle }) => {
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
        <EmptyStateSecondaryActions>
          <Button
            variant={ButtonVariant.link}
            component={'a'}
            target={'_blank'}
            href={t('osdInstallationGuideLink')}
            ouiaId={'empty-state-osd-guide-link'}
          >
            <ExternalLinkAltIcon /> {t('osdInstallationGuide')}
          </Button>
        </EmptyStateSecondaryActions>
      </EmptyState>
    </Bullseye>
  );
};
