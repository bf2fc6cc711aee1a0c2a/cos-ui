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
          {textListItem('Deployment namespace', connectorData?.namespace_id)}
          {textListItem('Owner', connectorData?.owner)}
          {textListItem('Time created', connectorData?.created_at)}
          {textListItem('Time updated', connectorData?.modified_at)}
        </TextList>
      </TextContent>
    </PageSection>
  );
};
