import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Level,
  Modal,
  PageSection,
  Title,
} from '@patternfly/react-core';

import { useBasename, useConfig } from '@bf2/ui-shared';

import { useAppContext } from './AppContext';
import { CreationWizard } from './CreationWizard';
import { CreationWizardMachineProvider } from './CreationWizard.machine-context';
import { fetchConfigurator } from './FederatedConfigurator';

type CreateConnectorPageProps = {
  onSave: () => void;
  onClose: () => void;
};
export const CreateConnectorPage: FunctionComponent<CreateConnectorPageProps> =
  ({ onSave, onClose }) => {
    const { t } = useTranslation();
    const config = useConfig();
    const basename = useBasename();
    const { basePath, getToken } = useAppContext();
    const [askForLeaveConfirm, setAskForLeaveConfirm] = useState(false);
    const openLeaveConfirm = () => setAskForLeaveConfirm(true);
    const closeLeaveConfirm = () => setAskForLeaveConfirm(false);
    return (
      <>
        <PageSection variant={'light'} hasShadowBottom>
          <Breadcrumb>
            <BreadcrumbItem to={basename?.getBasename()}>
              {t('Connectors')}
            </BreadcrumbItem>
            <BreadcrumbItem isActive>{t('Create connector')}</BreadcrumbItem>
          </Breadcrumb>
          <Level className={'pf-u-pt-md pf-u-pb-md'}>
            <Title headingLevel="h1">{t('Create connector')}</Title>
          </Level>
        </PageSection>
        <PageSection
          padding={{ default: 'noPadding' }}
          style={{ zIndex: 0 }}
          type={'wizard'}
        >
          <CreationWizardMachineProvider
            accessToken={getToken}
            basePath={basePath}
            fetchConfigurator={(connector) =>
              fetchConfigurator(connector, config?.cos.configurators || {})
            }
            onSave={onSave}
          >
            <CreationWizard onClose={openLeaveConfirm} />
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
              {t(
                'Changes you have made will be lost and no connector will be created.'
              )}
            </Modal>
          </CreationWizardMachineProvider>
        </PageSection>
      </>
    );
  };
