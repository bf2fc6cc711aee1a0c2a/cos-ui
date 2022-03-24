import { getConnector, getConnectorTypeDetail } from '@apis/api';
import { CreateConnectorWizard } from '@app/components/CreateConnectorWizard/CreateConnectorWizard';
import { CreateConnectorWizardProvider } from '@app/components/CreateConnectorWizard/CreateConnectorWizardContext';
import { Loading } from '@app/components/Loading/Loading';
import { useCos } from '@context/CosContext';
import { fetchConfigurator } from '@utils/loadFederatedConfigurator';
import React, {
  FunctionComponent,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Level,
  Modal,
  PageSection,
  Title,
} from '@patternfly/react-core';

import { useBasename, useConfig } from '@rhoas/app-services-ui-shared';
import { Connector, ConnectorType } from '@rhoas/connector-management-sdk';

type DuplicateConnectorPageProps = {
  onSave: () => void;
  onClose: () => void;
};
export const DuplicateConnectorPage: FunctionComponent<DuplicateConnectorPageProps> =
  ({ onSave, onClose }) => {
    const { t } = useTranslation();
    const config = useConfig();
    const basename = useBasename();
    const { connectorsApiBasePath, getToken } = useCos();
    const [askForLeaveConfirm, setAskForLeaveConfirm] = useState(false);
    const openLeaveConfirm = () => setAskForLeaveConfirm(true);
    const closeLeaveConfirm = () => setAskForLeaveConfirm(false);

    const [connectorData, setConnectorData] = useState<Connector>();
    const { hash } = useLocation();
    const connectorId = hash.split('&')[0].substring(1);
    const [duplicateMode, setDuplicateMode] = useState<boolean | undefined>();
    const getConnectorData = useCallback((data) => {
      setConnectorData(data as Connector);
    }, []);

    const [connectorTypeDetails, setConnectorTypeDetails] =
      useState<ConnectorType>();

    const onError = useCallback((error) => {
      console.log(error);
    }, []);

    const getConnectorTypeInfo = useCallback((data) => {
      setConnectorTypeDetails(data as ConnectorType);
    }, []);

    useEffect(() => {
      if (connectorId !== undefined) {
        setDuplicateMode(true);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
          {connectorData && connectorTypeDetails ? (
            <CreateConnectorWizardProvider
              accessToken={getToken}
              connectorsApiBasePath={connectorsApiBasePath}
              fetchConfigurator={(connector) =>
                fetchConfigurator(connector, config?.cos.configurators || {})
              }
              connectorId={connectorId}
              connectorData={connectorData}
              connectorTypeDetails={connectorTypeDetails}
              duplicateMode={duplicateMode}
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
                  <Button
                    key="cancel"
                    variant="link"
                    onClick={closeLeaveConfirm}
                  >
                    Cancel
                  </Button>,
                ]}
              >
                {t(
                  'Changes you have made will be lost and no connector will be created.'
                )}
              </Modal>
            </CreateConnectorWizardProvider>
          ) : (
            <Loading />
          )}
        </PageSection>
      </>
    );
  };
