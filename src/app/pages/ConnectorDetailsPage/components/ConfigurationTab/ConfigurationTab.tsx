import {
  ConnectorWithErrorHandler,
  ErrorHandler,
  updateConnector,
} from '@apis/api';
import { Loading } from '@app/components/Loading/Loading';
import { StepBodyLayout } from '@app/components/StepBodyLayout/StepBodyLayout';
import { StepErrorBoundary } from '@app/components/StepErrorBoundary/StepErrorBoundary';
import {
  ConfigurationMode,
  ConnectorConfiguratorComponent,
} from '@app/machines/StepConfiguratorLoader.machine';
import { useCos } from '@hooks/useCos';
import { fetchConfigurator } from '@utils/loadFederatedConfigurator';
import {
  clearEmptyObjectValues,
  getFilterList,
  mapToObject,
  toHtmlSafeId,
} from '@utils/shared';
import _ from 'lodash';
import React, { FC, useCallback, useEffect, useState } from 'react';

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
} from '@patternfly/react-core';

import { useTranslation } from '@rhoas/app-services-ui-components';
import {
  KafkaInstance,
  useAlert,
  useConfig,
} from '@rhoas/app-services-ui-shared';
import {
  Connector,
  ConnectorType,
  ConnectorTypeAllOf,
} from '@rhoas/connector-management-sdk';

import { CommonStep } from './CommonStep';
import { ConfigurationStep } from './ConfigurationStep';
import './ConfigurationTab.css';
import { ErrorHandlerStep } from './ErrorHandlerStep';

export type ConfigurationTabProps = {
  onSave: () => void;
  editMode: boolean;
  updateEditMode: (editEnable: boolean) => void;
  connectorData: Connector;
  kafkaInstanceDetails: KafkaInstance | string;
  connectorTypeDetails: ConnectorType;
};
export type connector = {
  data_shape: object;
  error_handler: ErrorHandler;
  processors: object;
};

const diff = (
  newConfig: ConnectorWithErrorHandler,
  oldConfig: ConnectorWithErrorHandler
) => {
  return Object.keys(newConfig).filter((key) => {
    if (oldConfig === undefined || oldConfig[key] === newConfig[key])
      return false;
    if (JSON.stringify(oldConfig[key]) === '{}' || newConfig[key] === '')
      return false;
    return true;
  });
};

const getEditPayload = (
  newConfiguration: ConnectorWithErrorHandler,
  oldConfiguration: ConnectorWithErrorHandler
) => {
  const diffKeys = diff(newConfiguration, oldConfiguration);
  return diffKeys.reduce((acc, key) => {
    switch (key) {
      // error handler is a union type and since a merge patch is sent
      // the old key must be explicitly set to null so the new value
      // validates properly server-side
      case 'error_handler':
        const { error_handler: errorHandler } = newConfiguration;
        const { error_handler: oldErrorHandler } = oldConfiguration;
        return {
          ...acc,
          error_handler: {
            ...Object.keys(oldErrorHandler).reduce(
              (a: ErrorHandler, key: string) => ({ ...a, [key]: null }),
              {} as ErrorHandler
            ),
            ...errorHandler,
          },
        };
      default:
        return { ...acc, [key]: newConfiguration[key] };
    }
  }, {} as ConnectorWithErrorHandler);
};

export const ConfigurationTab: FC<ConfigurationTabProps> = ({
  onSave,
  editMode,
  updateEditMode,
  connectorData,
  kafkaInstanceDetails,
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
  const [errHandlerConfiguration, setErrHandlerConfiguration] =
    useState<ErrorHandler>({} as ErrorHandler);

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
        id: 'connector-update-error',
        variant: AlertVariant.danger,
        title: t('somethingWentWrong'),
        description,
      });
    },
    [alert, t]
  );

  const onSuccess = useCallback(() => {
    updateEditMode(false);
    alert?.addAlert({
      id: 'connector-update-success',
      variant: AlertVariant.success,
      title: t('editAlertSuccessTitle'),
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
              ? (mapToObject(
                  connectorConfiguration
                ) as ConnectorWithErrorHandler)
              : (connectorConfiguration as ConnectorWithErrorHandler)),
            error_handler: errHandlerConfiguration,
          },
          connectorData.connector as ConnectorWithErrorHandler
        ),
      },
      connectorId: connectorData.id!,
      ...(commonConfiguration.name !== connectorData.name && {
        updatedName: commonConfiguration.name,
      }),
      ...(commonConfiguration.service_account !==
        connectorData.service_account && {
        updatedServiceAccount: commonConfiguration.service_account,
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
                  title={<TabTitleText>{t('core')}</TabTitleText>}
                  data-testid={'tab-core'}
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
                        data-testid={toHtmlSafeId(step, 'tab-')}
                      ></Tab>
                    );
                  })}
                {!connectorData.connector_type_id.includes('debezium') && (
                  <>
                    <Tab
                      eventKey={1}
                      title={
                        <TabTitleText>{t('connectorSpecific')}</TabTitleText>
                      }
                      data-testid={'tab-connector-specific'}
                    ></Tab>
                    <Tab
                      eventKey={2}
                      title={<TabTitleText>{t('errorHandling')}</TabTitleText>}
                      data-testid={'tab-error-handling'}
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
                  configurator?.Configurator &&
                  activeTabKey !== 0 && (
                    <StepErrorBoundary>
                      <StepBodyLayout
                        title={
                          configurator?.steps[(activeTabKey as number) - 1]
                        }
                        description={
                          (activeTabKey as number) === 2
                            ? t('debeziumFilterStepDescription', {
                                fields: getFilterList(
                                  connectorTypeDetails.name!
                                ),
                              })
                            : t('configurationStepDescription')
                        }
                      >
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
                      </StepBodyLayout>
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
                        kafkaId={
                          (kafkaInstanceDetails as KafkaInstance)?.id || ''
                        }
                        changeIsValid={setIsEditValid}
                        onUpdateConfiguration={onUpdateConfiguration}
                      />
                    </StepErrorBoundary>
                  )}
              </GridItem>
              <GridItem span={2} className="pf-u-pl-md">
                {!editMode && (
                  <Button variant="primary" onClick={changeEditMode}>
                    {t('editProperties')}
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
            {t('cancel')}
          </Button>
        </PageSection>
      )}

      <Modal
        title={t('leaveEditConnectorConfirmModalTitle')}
        variant={'small'}
        isOpen={askForLeaveConfirm}
        onClose={closeLeaveConfirm}
        actions={[
          <Button key="confirm" variant="primary" onClick={onCancelEdit}>
            {t('leave')}
          </Button>,
          <Button key="cancel" variant="link" onClick={closeLeaveConfirm}>
            {t('cancel')}
          </Button>,
        ]}
      >
        {t('leaveEditConnectorConfirmModalDescription')}
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
    formConfiguration = clearEmptyObjectValues(
      JSON.parse(JSON.stringify(configuration))
    );
  }
  return (
    <Configurator
      activeStep={step - 1}
      connector={connector}
      uiPath={isEditMode ? ConfigurationMode.EDIT : ConfigurationMode.VIEW}
      configuration={
        formConfiguration instanceof Map
          ? formConfiguration
          : new Map(Object.entries(formConfiguration as object))
      }
      onChange={updateFedConfiguration}
    />
  );
};
