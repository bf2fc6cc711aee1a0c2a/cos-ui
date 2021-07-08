import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { useBasename, useConfig } from '@bf2/ui-shared';
import { CreationWizard } from '@cos-ui/creation-wizard';
import { CreationWizardMachineProvider } from '@cos-ui/machines';
import {
  Breadcrumb,
  BreadcrumbItem,
  Level,
  PageSection,
  Title,
} from '@patternfly/react-core';

import { useAppContext } from '../AppContext';
import { fetchConfigurator } from '../FederatedConfigurator';

type CreateConnectorPageProps = {
  onSave: () => void;
  onClose: () => void;
};
export const CreateConnectorPage: FunctionComponent<CreateConnectorPageProps> = ({
  onSave,
  onClose,
}) => {
  const { t } = useTranslation();
  const { cos } = useConfig();
  const { getBasename } = useBasename();
  const { basePath, getToken } = useAppContext();
  const basename = getBasename();
  return (
    <>
      <PageSection variant={'light'} hasShadowBottom>
        <Breadcrumb>
          <BreadcrumbItem to={basename}>{t('Connectors')}</BreadcrumbItem>
          <BreadcrumbItem isActive>{t('Create connector')}</BreadcrumbItem>
        </Breadcrumb>
        <Level className={'pf-u-pt-md pf-u-pb-md'}>
          <Title headingLevel="h1">{t('Create connector')}</Title>
        </Level>
      </PageSection>
      <PageSection padding={{ default: 'noPadding' }} style={{ zIndex: 0 }}>
        <CreationWizardMachineProvider
          accessToken={getToken}
          basePath={basePath}
          fetchConfigurator={connector =>
            fetchConfigurator(connector, cos.configurators)
          }
          onSave={onSave}
        >
          <CreationWizard onClose={onClose} />
        </CreationWizardMachineProvider>
      </PageSection>
    </>
  );
};
