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
  connectorData: Connector;
  connectorTypeDetails: ConnectorType;
};
export type connector = {
  data_shape: object;
  error_handler: ErrorHandler;
  processors: object;
};

export const ConfigurationPage: FC<ConfigurationPageProps> = ({
  connectorData,
  connectorTypeDetails,
}) => {
  const { t } = useTranslation();
  const alert = useAlert();

  const [askForLeaveConfirm, setAskForLeaveConfirm] = useState(false);
  const openLeaveConfirm = () => setAskForLeaveConfirm(true);
  const closeLeaveConfirm = () => setAskForLeaveConfirm(false);

  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);
  const [editMode, setEditMode] = useState<boolean>(false);

  const updateEditMode = () => {
    setEditMode(!editMode);
  };

  const onConnectorEdit = useCallback(() => {
    alert?.addAlert({
      id: 'connector-created',
      variant: AlertVariant.success,
      title: t('wizard.edit-success'),
    });
    // handle edit here
    setEditMode(false);
    // goToConnectorsList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alert, t]);

  const onCancelEdit = () => {
    setEditMode(false);
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
                  title={<TabTitleText>Common</TabTitleText>}
                ></Tab>
                <Tab
                  eventKey={1}
                  title={<TabTitleText>Connector specific</TabTitleText>}
                ></Tab>
                <Tab
                  eventKey={2}
                  title={<TabTitleText>Error handling</TabTitleText>}
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
                      editMode={editMode}
                      configuration={connectorData}
                    />
                  </StepErrorBoundary>
                )}

                {activeTabKey === 1 && (
                  <StepErrorBoundary>
                    <ConfigurationStep
                      editMode={editMode}
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
                      editMode={editMode}
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
                <Button
                  variant="primary"
                  onClick={updateEditMode}
                  isDisabled={editMode}
                >
                  Edit Properties
                </Button>
              </GridItem>
            </Grid>
          </GridItem>
        </Grid>
      </PageSection>
      {editMode && (
        <PageSection
          variant={PageSectionVariants.light}
          className="pf-u-p-md pf-u-box-shadow-md-top configuration-page_footer"
        >
          <Button
            variant="primary"
            className="pf-u-mr-md pf-u-mb-sm"
            onClick={onConnectorEdit}
          >
            Save
          </Button>
          <Button variant="secondary" onClick={openLeaveConfirm}>
            Cancel
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
            Confirm
          </Button>,
          <Button key="cancel" variant="link" onClick={closeLeaveConfirm}>
            Cancel
          </Button>,
        ]}
      >
        {t('Changes you have made will be lost.')}
      </Modal>
    </>
  );
};
