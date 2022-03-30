import { updateConnector } from '@apis/api';
import { Loading } from '@app/components/Loading/Loading';
import { StepErrorBoundary } from '@app/components/StepErrorBoundary/StepErrorBoundary';
import { ConnectorConfiguratorComponent } from '@app/machines/StepConfiguratorLoader.machine';
import { useCos } from '@context/CosContext';
import { fetchConfigurator } from '@utils/loadFederatedConfigurator';
import { clearSecretEmptyValue, mapToObject } from '@utils/shared';
import _ from 'lodash';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  AlertVariant,
  Button,
  Grid,
  GridItem,
  Modal,
  PageSection,
  PageSectionVariants,
  Tab,
  Tabs,
  TabTitleText,
  Title,
  TitleSizes,
} from '@patternfly/react-core';

import { useAlert, useConfig } from '@rhoas/app-services-ui-shared';
import {
  Connector,
  ConnectorType,
  ConnectorTypeAllOf,
} from '@rhoas/connector-management-sdk';

import { CommonStep } from './CommonStep';
import './ConfigurationPage.css';
import { ConfigurationStep } from './ConfigurationStep';
import { ErrorHandler, ErrorHandlerStep } from './ErrorHandlerStep';

export type ConfigurationPageProps = {
  onSave: () => void;
  editMode: boolean;
  updateEditMode: (editEnable: boolean) => void;
  connectorData: Connector;
  connectorTypeDetails: ConnectorType;
};
export type connector = {
  data_shape: object;
  error_handler: ErrorHandler;
  processors: object;
};

const diff = (newConfig: any, oldConfig: any) => {
  let r: string[] = [];
  _.each(newConfig, (val, key) => {
    if (oldConfig === undefined || oldConfig[key] === val) return;
    if (oldConfig[key] === {} || val === '') return;
    r.push(key);
  });
  return r;
};

const getEditPayload = (newConfiguration: any, oldConfiguration: any) => {
  const diffKeys = diff(newConfiguration, oldConfiguration);
  return diffKeys.reduce((acc, key) => {
    return { ...acc, [key]: newConfiguration[key] };
  }, {});
};

export const ConfigurationPage: FC<ConfigurationPageProps> = ({
  onSave,
  editMode,
  updateEditMode,
  connectorData,
  connectorTypeDetails,
}) => {
  const { t } = useTranslation();
  const alert = useAlert();
  const config = useConfig();

  const { connectorsApiBasePath, getToken } = useCos();

  const [askForLeaveConfirm, setAskForLeaveConfirm] = useState(false);
  const [userTouched, setUserTouched] = useState(false);

  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);

  const [commonConfiguration, setCommonConfiguration] = useState<{
    [key: string]: any;
  }>({});
  const [connectorConfiguration, setConnectorConfiguration] =
    useState<unknown>();
  const [errHandlerConfiguration, setErrHandlerConfiguration] = useState<{
    [key: string]: any;
  }>({});

  const [configurator, setConfigurator] = useState<any>();
  const [isEditValid, setIsEditValid] = useState<boolean>(true);

  const openLeaveConfirm = () => setAskForLeaveConfirm(true);
  const closeLeaveConfirm = () => setAskForLeaveConfirm(false);

  const changeEditMode = () => {
    updateEditMode(!editMode);
  };

  const onUpdateConfiguration = useCallback(
    (type, update) => {
      setUserTouched(true);
      switch (type) {
        case 'common':
          setCommonConfiguration(update);
          break;
        case 'connector':
          setConnectorConfiguration(update);
          break;
        case 'error':
          setErrHandlerConfiguration(update);
      }
    },
    [
      setCommonConfiguration,
      setConnectorConfiguration,
      setErrHandlerConfiguration,
    ]
  );

  const onError = useCallback(
    (description: string) => {
      alert?.addAlert({
        id: 'connectors-table-error',
        variant: AlertVariant.danger,
        title: t('something_went_wrong'),
        description,
      });
    },
    [alert, t]
  );

  const onSuccess = useCallback(() => {
    updateEditMode(false);
    alert?.addAlert({
      id: 'connector-created',
      variant: AlertVariant.success,
      title: t('edit.edit-success'),
    });
    onSave();
  }, [alert, t, updateEditMode, onSave]);

  const onConnectorEditSave = () => {
    updateConnector({
      accessToken: getToken,
      connectorsApiBasePath: connectorsApiBasePath,
      connectorUpdate: {
        ...getEditPayload(
          {
            ...(connectorConfiguration instanceof Map
              ? mapToObject(connectorConfiguration)
              : (connectorConfiguration as object)),
            error_handler: errHandlerConfiguration,
          },
          connectorData.connector
        ),
      },
      connectorId: connectorData.id!,
      ...(commonConfiguration.name !== connectorData.name && {
        updatedName: commonConfiguration.name,
      }),
    })(onSuccess, onError);
  };

  const initialize = () => {
    const { name, service_account } = connectorData;
    setCommonConfiguration({ name: name, service_account: service_account });
    setConnectorConfiguration(connectorData?.connector);
    setErrHandlerConfiguration(
      (connectorData?.connector as connector)?.error_handler
    );
  };

  const onCancelEdit = () => {
    initialize();
    updateEditMode(false);
    closeLeaveConfirm();
  };

  const updateFedConfiguration = useCallback(
    (config, isValid) => {
      setConnectorConfiguration(config);
      setIsEditValid(isValid);
    },
    [setConnectorConfiguration, setIsEditValid]
  );

  let response: any;
  const getConfigurator = async () => {
    try {
      response = await fetchConfigurator(
        connectorTypeDetails,
        config?.cos.configurators || {}
      );
      setConfigurator(response);
    } catch (err) {
      console.log('No configurator provided.', err);
    }
  };

  useEffect(() => {
    initialize();
    getConfigurator();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toggle currently active tab
  const handleTabClick = (
    _event: React.MouseEvent<HTMLElement, MouseEvent>,
    tabIndex: string | number
  ) => {
    setActiveTabKey(tabIndex);
  };
  return (
    <>
      <PageSection variant={PageSectionVariants.light}>
        <Grid style={{ paddingBottom: '50px' }}>
          <GridItem span={3}>
            <div>
              <Tabs
                activeKey={activeTabKey}
                onSelect={handleTabClick}
                isVertical
              >
                <Tab
                  eventKey={0}
                  title={<TabTitleText>{t('Common')}</TabTitleText>}
                ></Tab>
                {connectorData.connector_type_id.includes('debezium') &&
                  configurator &&
                  configurator.steps &&
                  configurator.steps.map((step: string, index: number) => {
                    return (
                      <Tab
                        key={step}
                        eventKey={index + 1}
                        title={<TabTitleText>{step}</TabTitleText>}
                      ></Tab>
                    );
                  })}
                {!connectorData.connector_type_id.includes('debezium') && (
                  <>
                    <Tab
                      eventKey={1}
                      title={
                        <TabTitleText>{t('Connector specific')}</TabTitleText>
                      }
                    ></Tab>
                    <Tab
                      eventKey={2}
                      title={<TabTitleText>{t('Error handling')}</TabTitleText>}
                    ></Tab>
                  </>
                )}
              </Tabs>
            </div>
          </GridItem>
          <GridItem span={9}>
            <Grid>
              <GridItem span={10}>
                {activeTabKey === 0 && (
                  <StepErrorBoundary>
                    {!_.isEmpty(commonConfiguration) && (
                      <CommonStep
                        editMode={editMode}
                        configuration={commonConfiguration}
                        changeIsValid={setIsEditValid}
                        onUpdateConfiguration={onUpdateConfiguration}
                      />
                    )}
                  </StepErrorBoundary>
                )}
                {connectorData.connector_type_id.includes('debezium') &&
                  configurator?.Configurator && (
                    <StepErrorBoundary>
                      <>
                        <Title
                          headingLevel="h3"
                          size={TitleSizes['2xl']}
                          className={'pf-u-pr-md pf-u-pb-md'}
                        >
                          {configurator?.steps[(activeTabKey as number) - 1]}
                        </Title>
                        <React.Suspense fallback={Loading}>
                          <ConnectedCustomConfigurator
                            Configurator={
                              configurator?.Configurator as ConnectorConfiguratorComponent
                            }
                            isEditMode={editMode}
                            configuration={connectorConfiguration}
                            updateFedConfiguration={updateFedConfiguration}
                            connector={connectorTypeDetails}
                            step={activeTabKey as number}
                          />
                        </React.Suspense>
                      </>
                    </StepErrorBoundary>
                  )}
                {!connectorData.connector_type_id.includes('debezium') &&
                  activeTabKey === 1 && (
                    <StepErrorBoundary>
                      <ConfigurationStep
                        editMode={editMode}
                        schema={
                          (connectorTypeDetails as ConnectorTypeAllOf)?.schema!
                        }
                        configuration={connectorConfiguration}
                        changeIsValid={setIsEditValid}
                        onUpdateConfiguration={onUpdateConfiguration}
                      />
                    </StepErrorBoundary>
                  )}
                {!connectorData.connector_type_id.includes('debezium') &&
                  activeTabKey === 2 && (
                    <StepErrorBoundary>
                      <ErrorHandlerStep
                        editMode={editMode}
                        schema={
                          (connectorTypeDetails as ConnectorTypeAllOf)?.schema!
                        }
                        configuration={errHandlerConfiguration}
                        changeIsValid={setIsEditValid}
                        onUpdateConfiguration={onUpdateConfiguration}
                      />
                    </StepErrorBoundary>
                  )}
              </GridItem>
              <GridItem span={2} className="pf-u-pl-md">
                {!editMode && (
                  <Button variant="primary" onClick={changeEditMode}>
                    {t('Edit Properties')}
                  </Button>
                )}
              </GridItem>
            </Grid>
          </GridItem>
        </Grid>
      </PageSection>
      {editMode && (
        <PageSection
          className="pf-u-p-md pf-u-box-shadow-md-top configuration-page_footer"
          hasShadowTop
          variant="light"
        >
          <Button
            variant="primary"
            className="pf-u-mr-md pf-u-mb-sm"
            onClick={onConnectorEditSave}
            isDisabled={!isEditValid}
          >
            {t('Save')}
          </Button>
          <Button
            variant="secondary"
            onClick={userTouched ? openLeaveConfirm : onCancelEdit}
          >
            {t('Cancel')}
          </Button>
        </PageSection>
      )}

      <Modal
        title={t('Leave page?')}
        variant={'small'}
        isOpen={askForLeaveConfirm}
        onClose={closeLeaveConfirm}
        actions={[
          <Button key="confirm" variant="primary" onClick={onCancelEdit}>
            {t('Leave')}
          </Button>,
          <Button key="cancel" variant="link" onClick={closeLeaveConfirm}>
            {t('Cancel')}
          </Button>,
        ]}
      >
        {t('Changes you made to the connector properties will not be saved.')}
      </Modal>
    </>
  );
};

const ConnectedCustomConfigurator: FC<{
  Configurator: ConnectorConfiguratorComponent;
  configuration: unknown;
  connector: ConnectorType;
  updateFedConfiguration: (
    configuration: Map<string, unknown>,
    isValid: boolean
  ) => void;
  isEditMode: boolean;
  step: number;
}> = ({
  Configurator,
  connector,
  configuration,
  updateFedConfiguration,
  isEditMode,
  step,
}) => {
  let formConfiguration: unknown;

  if (configuration instanceof Map) {
    formConfiguration = new Map(configuration);
  } else {
    formConfiguration = JSON.parse(JSON.stringify(configuration));
    clearSecretEmptyValue(formConfiguration);
  }

  return (
    <Configurator
      activeStep={step - 1}
      connector={connector}
      isViewMode={!isEditMode}
      configuration={
        formConfiguration instanceof Map
          ? formConfiguration
          : new Map(Object.entries(formConfiguration as object))
      }
      onChange={updateFedConfiguration}
    />
  );
};
