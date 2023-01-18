import { getConnector, getConnectorTypeDetail } from '@apis/api';
import { CreateConnectorWizard } from '@app/components/CreateConnectorWizard/CreateConnectorWizard';
import { CreateConnectorWizardProvider } from '@app/components/CreateConnectorWizard/CreateConnectorWizardContext';
import { Loading } from '@app/components/Loading/Loading';
import { useCos } from '@hooks/useCos';
import { fetchConfigurator } from '@utils/loadFederatedConfigurator';
import _ from 'lodash';
import React, {
  FunctionComponent,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { Link, useLocation } from 'react-router-dom';

import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Modal,
  PageSection,
} from '@patternfly/react-core';

import { useTranslation } from '@rhoas/app-services-ui-components';
import {
  AlertVariant,
  useAlert,
  useConfig,
} from '@rhoas/app-services-ui-shared';
import { Connector, ConnectorTypeAllOf } from '@rhoas/connector-management-sdk';

import { ConnectorWizardHeader } from './components/ConnectorWizardHeader';

type DuplicateConnectorPageProps = {
  onSave: (name: string) => void;
  onClose: () => void;
};
export const DuplicateConnectorPage: FunctionComponent<
  DuplicateConnectorPageProps
> = ({ onSave, onClose }) => {
  const { t } = useTranslation();
  const alert = useAlert();
  const config = useConfig();
  const { connectorsApiBasePath, kafkaManagementApiBasePath, getToken } =
    useCos();
  const [askForLeaveConfirm, setAskForLeaveConfirm] = useState(false);
  const openLeaveConfirm = () => setAskForLeaveConfirm(true);
  const closeLeaveConfirm = () => setAskForLeaveConfirm(false);

  const [connectorData, setConnectorData] = useState<Connector>();
  const { hash } = useLocation();
  const connectorId = hash.split('&')[0].substring(1);
  const getConnectorData = useCallback((data) => {
    setConnectorData(data as Connector);
  }, []);

  const [connectorTypeDetails, setConnectorTypeDetails] =
    useState<ConnectorTypeAllOf>();

  const onError = useCallback(
    (description: string) => {
      alert?.addAlert({
        id: 'connector-duplicate-error',
        variant: AlertVariant.danger,
        title: t('somethingWentWrong'),
        description,
      });
    },
    [alert, t]
  );

  const getConnectorTypeInfo = useCallback((data) => {
    setConnectorTypeDetails(data as ConnectorTypeAllOf);
  }, []);

  useEffect(() => {
    getConnector({
      accessToken: getToken,
      connectorsApiBasePath: connectorsApiBasePath,
      connectorId: connectorId,
    })(getConnectorData, onError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectorId]);

  useEffect(() => {
    if (connectorData?.connector_type_id) {
      getConnectorTypeDetail({
        accessToken: getToken,
        connectorsApiBasePath: connectorsApiBasePath,
        connectorTypeId: connectorData?.connector_type_id,
      })(getConnectorTypeInfo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectorData]);

  return (
    <>
      <PageSection variant={'light'}>
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to={'/'}>{t('connectorsInstances')}</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>
            {t('duplicateConnectorsInstance')}
          </BreadcrumbItem>
        </Breadcrumb>
      </PageSection>
      <PageSection
        padding={{ default: 'noPadding' }}
        style={{ zIndex: 0 }}
        type={'default'}
        variant={'light'}
      >
        {connectorData && connectorTypeDetails ? (
          <CreateConnectorWizardProvider
            accessToken={getToken}
            connectorsApiBasePath={connectorsApiBasePath}
            kafkaManagementApiBasePath={kafkaManagementApiBasePath}
            fetchConfigurator={(connector) =>
              fetchConfigurator(connector, config?.cos.configurators || {})
            }
            connectorId={connectorId}
            connectorData={connectorData}
            connectorTypeDetails={connectorTypeDetails}
            duplicateMode={true}
            onSave={onSave}
          >
            <CreateConnectorWizard
              header={<ConnectorWizardHeader />}
              onClose={openLeaveConfirm}
            />
            <Modal
              title={t('leaveDuplicateConnectorConfirmModalTitle')}
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
              {t('leaveDuplicateConnectorConfirmModalDescription')}
            </Modal>
          </CreateConnectorWizardProvider>
        ) : (
          <Loading />
        )}
      </PageSection>
    </>
  );
};
