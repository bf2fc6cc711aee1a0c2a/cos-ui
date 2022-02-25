import { StepErrorBoundary } from '@app/components/StepErrorBoundary/StepErrorBoundary';
import React, { FC, useState } from 'react';

import {
  Button,
  Grid,
  GridItem,
  PageSection,
  PageSectionVariants,
  Tab,
  Tabs,
  TabTitleText,
} from '@patternfly/react-core';

import {
  Connector,
  ConnectorType,
  ConnectorTypeAllOf,
} from '@rhoas/connector-management-sdk';

import { CommonStep } from './CommonStep';
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
  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);

  const [editMode, setEditMode] = useState<boolean>(false);

  const updateEditMode = () => {
    setEditMode(!editMode);
  };

  // Toggle currently active tab
  const handleTabClick = (
    _event: React.MouseEvent<HTMLElement, MouseEvent>,
    tabIndex: string | number
  ) => {
    setActiveTabKey(tabIndex);
  };
  return (
    <PageSection variant={PageSectionVariants.light}>
      <Grid>
        <GridItem span={3}>
          <div>
            <Tabs activeKey={activeTabKey} onSelect={handleTabClick} isVertical>
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
                    connectorName={connectorData?.name!}
                    clientID={connectorData.service_account.client_id}
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
                    errorHandlerValue={
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
  );
};
