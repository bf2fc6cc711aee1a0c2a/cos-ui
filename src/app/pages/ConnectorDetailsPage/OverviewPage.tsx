import React, { FC, ReactNode } from 'react';

import {
  PageSection,
  PageSectionVariants,
  TextContent,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
} from '@patternfly/react-core';

import { Connector } from '@rhoas/connector-management-sdk';

export interface OverviewPageProps {
  connectorData: Connector;
}

const textListItem = (title: string, value?: ReactNode) => (
  <>
    {value && (
      <>
        <TextListItem component={TextListItemVariants.dt}>{title}</TextListItem>
        <TextListItem component={TextListItemVariants.dd}>{value}</TextListItem>
      </>
    )}
  </>
);

export const OverviewPage: FC<OverviewPageProps> = ({ connectorData }) => {
  return (
    <PageSection variant={PageSectionVariants.light}>
      <TextContent>
        <TextList component={TextListVariants.dl}>
          {textListItem('Connector id', connectorData?.id!)}
          {textListItem('Connector type', connectorData?.connector_type_id)}
          {textListItem('Kafka_instance', connectorData?.kafka?.id)}
          {textListItem('Bootstrap server', connectorData?.kafka?.url)}
          {textListItem(
            'Targeted OSD Cluster',
            connectorData?.deployment_location?.cluster_id
          )}
          {textListItem('Owner', connectorData?.owner)}
          {textListItem('Time created', connectorData?.created_at)}
          {textListItem('Time updated', connectorData?.modified_at)}
        </TextList>
        {/* <TextListItem component={TextListItemVariants.dt}>Kafka:</TextListItem>
        <TextList component={TextListVariants.dl} className="pf-u-pl-lg">
          {textListItem('Id', (connectorData as ConnectorTypePatch)?.kafka?.id)}
          {textListItem(
            'URL',
            (connectorData as ConnectorTypePatch)?.kafka?.url
          )}
        </TextList> */}
        {/* <TextListItem component={TextListItemVariants.dt}>OSD Cluster:</TextListItem>
        <TextList component={TextListVariants.dl} className="pf-u-pl-lg">
          {textListItem(
            'Id',
            (connectorData as ConnectorTypePatch)?.deployment_location
              ?.cluster_id
          )}
          {textListItem(
            'Kind',
            (connectorData as ConnectorTypePatch)?.deployment_location?.kind
          )}
        </TextList> */}
      </TextContent>
    </PageSection>
  );
};
