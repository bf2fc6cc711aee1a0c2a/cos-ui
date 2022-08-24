import { CreateConnectorWizard } from '@app/components/CreateConnectorWizard/CreateConnectorWizard';
import { CreateConnectorWizardProvider } from '@app/components/CreateConnectorWizard/CreateConnectorWizardContext';
import { useCos } from '@context/CosContext';
import { fetchConfigurator } from '@utils/loadFederatedConfigurator';
import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Level,
  Modal,
  PageSection,
  Title,
} from '@patternfly/react-core';

import { useConfig } from '@rhoas/app-services-ui-shared';

type CreateConnectorPageProps = {
  onSave: (name: string) => void;
  onClose: () => void;
};
export const CreateConnectorPage: FunctionComponent<CreateConnectorPageProps> =
  ({ onSave, onClose }) => {
    const { t } = useTranslation();
    const config = useConfig();
    const { connectorsApiBasePath, getToken, kafkaManagementApiBasePath } =
      useCos();
    const [askForLeaveConfirm, setAskForLeaveConfirm] = useState(false);
    const openLeaveConfirm = () => setAskForLeaveConfirm(true);
    const closeLeaveConfirm = () => setAskForLeaveConfirm(false);
    return (
      <>
        <PageSection variant={'light'} hasShadowBottom>
          <Breadcrumb>
            <BreadcrumbItem>
              <Link to={'/'}>{t('connectorsInstances')}</Link>
            </BreadcrumbItem>
            <BreadcrumbItem isActive>
              {t('createAConnectorsInstance')}
            </BreadcrumbItem>
          </Breadcrumb>
          <Level className={'pf-u-pt-md pf-u-pb-md'}>
            <Title headingLevel="h1">{t('createAConnectorsInstance')}</Title>
          </Level>
        </PageSection>
        <PageSection
          padding={{ default: 'noPadding' }}
          style={{ zIndex: 0 }}
          type={'wizard'}
        >
          <CreateConnectorWizardProvider
            accessToken={getToken}
            connectorsApiBasePath={connectorsApiBasePath}
            kafkaManagementApiBasePath={kafkaManagementApiBasePath}
            fetchConfigurator={(connector) =>
              fetchConfigurator(connector, config?.cos.configurators || {})
            }
            onSave={onSave}
          >
            <CreateConnectorWizard onClose={openLeaveConfirm} />
            <Modal
              title={t('Leave page?')}
              variant={'small'}
              isOpen={askForLeaveConfirm}
              onClose={closeLeaveConfirm}
              actions={[
                <Button key="confirm" variant="primary" onClick={onClose}>
                  Confirm
                </Button>,
                <Button key="cancel" variant="link" onClick={closeLeaveConfirm}>
                  Cancel
                </Button>,
              ]}
            >
              {t('leaveCreateConnectorConfirmModalDescription')}
            </Modal>
          </CreateConnectorWizardProvider>
        </PageSection>
      </>
    );
  };
