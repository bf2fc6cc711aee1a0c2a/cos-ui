import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { useBasename, useConfig } from '@bf2/ui-shared';
import { CreationWizard } from '@cos-ui/creation-wizard';
import { CreationWizardMachineProvider } from '@cos-ui/machines';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Level,
  Modal,
  PageSection,
  Title,
} from '@patternfly/react-core';

import { useAppContext } from '../AppContext';
import { fetchConfigurator } from '../FederatedConfigurator';
import { useState } from 'react';

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
  const [askForLeaveConfirm, setAskForLeaveConfirm] = useState(false);
  const openLeaveConfirm = () => setAskForLeaveConfirm(true);
  const closeLeaveConfirm = () => setAskForLeaveConfirm(false);
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
