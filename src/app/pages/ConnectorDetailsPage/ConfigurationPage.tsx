import { StepErrorBoundary } from '@app/components/StepErrorBoundary/StepErrorBoundary';
import React, { FC, useCallback, useState } from 'react';
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
} from '@patternfly/react-core';

import { useAlert } from '@rhoas/app-services-ui-shared';
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

export const ConfigurationPage: FC<ConfigurationPageProps> = ({
  editMode,
  updateEditMode,
  connectorData,
  connectorTypeDetails,
}) => {
  const { t } = useTranslation();
  const alert = useAlert();

  const [askForLeaveConfirm, setAskForLeaveConfirm] = useState(false);
  const openLeaveConfirm = () => setAskForLeaveConfirm(true);
  const closeLeaveConfirm = () => setAskForLeaveConfirm(false);

  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);

  const changeEditMode = () => {
    updateEditMode(!editMode);
  };

  const onConnectorEdit = useCallback(() => {
    alert?.addAlert({
      id: 'connector-created',
      variant: AlertVariant.success,
      title: t('edit.edit-success'),
    });
    updateEditMode(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alert, t]);

  const onCancelEdit = () => {
    updateEditMode(false);
    closeLeaveConfirm();
  };

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
        <Grid>
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
                <Tab
                  eventKey={1}
                  title={<TabTitleText>{t('Connector specific')}</TabTitleText>}
                ></Tab>
                <Tab
                  eventKey={2}
                  title={<TabTitleText>{t('Error handling')}</TabTitleText>}
                ></Tab>
              </Tabs>
            </div>
          </GridItem>
          <GridItem span={9}>
            <Grid>
              <GridItem span={10}>
                {activeTabKey === 0 && (
                  <StepErrorBoundary>
                    <CommonStep
                      // TODO: disabling the edit flow for time being
                      // editMode={editMode}
                      editMode={false}
                      configuration={connectorData}
                    />
                  </StepErrorBoundary>
                )}

                {activeTabKey === 1 && (
                  <StepErrorBoundary>
                    <ConfigurationStep
                      // TODO: disabling the edit flow for time being
                      // editMode={editMode}
                      editMode={false}
                      schema={
                        (connectorTypeDetails as ConnectorTypeAllOf)?.schema!
                      }
                      configuration={connectorData?.connector}
                    />
                  </StepErrorBoundary>
                )}
                {activeTabKey === 2 && (
                  <StepErrorBoundary>
                    <ErrorHandlerStep
                      // TODO: disabling the edit flow for time being
                      // editMode={editMode}
                      editMode={false}
                      schema={
                        (connectorTypeDetails as ConnectorTypeAllOf)?.schema!
                      }
                      configuration={
                        (connectorData?.connector as connector)?.error_handler
                      }
                    />
                  </StepErrorBoundary>
                )}
              </GridItem>
              <GridItem span={2} className="pf-u-pl-md">
                {
                  // TODO: disabling the edit flow for time being
                  // !editMode
                  false && (
                    <Button variant="primary" onClick={changeEditMode}>
                      {t('Edit Properties')}
                    </Button>
                  )
                }
              </GridItem>
            </Grid>
          </GridItem>
        </Grid>
      </PageSection>
      {
        // TODO: disabling the edit flow for time being
        // editMode
        false && (
          <PageSection
            variant={PageSectionVariants.light}
            className="pf-u-p-md pf-u-box-shadow-md-top configuration-page_footer"
          >
            <Button
              variant="primary"
              className="pf-u-mr-md pf-u-mb-sm"
              onClick={onConnectorEdit}
            >
              {t('Save')}
            </Button>
            <Button variant="secondary" onClick={openLeaveConfirm}>
              {t('Cancel')}
            </Button>
          </PageSection>
        )
      }

      <Modal
        title={t('Leave page?')}
        variant={'small'}
        isOpen={askForLeaveConfirm}
        onClose={closeLeaveConfirm}
        actions={[
          <Button key="confirm" variant="primary" onClick={onCancelEdit}>
            {t('Confirm')}
          </Button>,
          <Button key="cancel" variant="link" onClick={closeLeaveConfirm}>
            {t('Cancel')}
          </Button>,
        ]}
      >
        {t('Changes you have made will be lost.')}
      </Modal>
    </>
  );
};
