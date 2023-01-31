import { ConnectorSelectionListCacheStorageProvider } from '@app/components/ConnectorSelectionList/ConnectorSelectionListCacheStorage';
import { CreateConnectorWizard } from '@app/components/CreateConnectorWizard/CreateConnectorWizard';
import { CreateConnectorWizardProvider } from '@app/components/CreateConnectorWizard/CreateConnectorWizardContext';
import { useCos } from '@hooks/useCos';
import { fetchConfigurator } from '@utils/loadFederatedConfigurator';
import React, { FunctionComponent, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Modal,
  PageSection,
} from '@patternfly/react-core';

import { useTranslation } from '@rhoas/app-services-ui-components';
import { useConfig } from '@rhoas/app-services-ui-shared';

import { ConnectorWizardHeader } from './components/ConnectorWizardHeader';

export type CreateConnectorPageProps = {
  onSave: (name: string) => void;
  onClose: () => void;
};
export const CreateConnectorPage: FunctionComponent<
  CreateConnectorPageProps
> = ({ onSave, onClose }) => {
  const config = useConfig();
  const { connectorsApiBasePath, getToken, kafkaManagementApiBasePath } =
    useCos();
  const { t } = useTranslation();
  const [askForLeaveConfirm, setAskForLeaveConfirm] = useState(false);
  const openLeaveConfirm = () => setAskForLeaveConfirm(true);
  const closeLeaveConfirm = () => setAskForLeaveConfirm(false);
  return (
    <>
      <CreateConnectorWizardProvider
        accessToken={getToken}
        connectorsApiBasePath={connectorsApiBasePath}
        kafkaManagementApiBasePath={kafkaManagementApiBasePath}
        fetchConfigurator={(connector) =>
          fetchConfigurator(connector, config?.cos.configurators || {})
        }
        onSave={onSave}
      >
        <PageSection variant={'light'}>
          <Breadcrumb>
            <BreadcrumbItem>
              <Link to={'/'}>{t('connectorsInstances')}</Link>
            </BreadcrumbItem>
            <BreadcrumbItem isActive>
              {t('createAConnectorsInstance')}
            </BreadcrumbItem>
          </Breadcrumb>
        </PageSection>
        <PageSection
          padding={{ default: 'noPadding' }}
          style={{ zIndex: 0 }}
          type={'default'}
          variant={'light'}
        >
          <ConnectorSelectionListCacheStorageProvider>
            <CreateConnectorWizard
              header={<ConnectorWizardHeader />}
              onClose={openLeaveConfirm}
            />
            <Modal
              title={t('leaveCreateConnectorConfirmModalTitle')}
              variant={'small'}
              isOpen={askForLeaveConfirm}
              onClose={closeLeaveConfirm}
              actions={[
                <Button key="confirm" variant="primary" onClick={onClose}>
                  {t('Confirm')}
                </Button>,
                <Button key="cancel" variant="link" onClick={closeLeaveConfirm}>
                  {t('Cancel')}
                </Button>,
              ]}
            >
              {t('leaveCreateConnectorConfirmModalDescription')}
            </Modal>
          </ConnectorSelectionListCacheStorageProvider>
        </PageSection>
      </CreateConnectorWizardProvider>
    </>
  );
};
