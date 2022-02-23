import React, { FC, useState } from 'react';

import {
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

export type ConfigurationPageProps = {
  connectorData: Connector;
  connectorTypeDetails: ConnectorType;
};
export const ConfigurationPage: FC<ConfigurationPageProps> = ({
  connectorData,
  connectorTypeDetails,
}) => {
  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);
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
        <GridItem span={8}>
          {activeTabKey === 0 && (
            <CommonStep connectorName={connectorData?.name!} />
          )}

          {activeTabKey === 1 && (
            <ConfigurationStep
              schema={(connectorTypeDetails as ConnectorTypeAllOf)?.schema!}
              configuration={connectorData?.connector}
            />
          )}
        </GridItem>
      </Grid>
    </PageSection>
  );
};
