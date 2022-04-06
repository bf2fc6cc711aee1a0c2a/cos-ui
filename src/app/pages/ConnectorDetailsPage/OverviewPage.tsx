import { ConnectorInfoTextList } from '@app/components/ConnectorInfoTextList/ConnectorInfoTextList';
import React, { FC } from 'react';

import { PageSection, PageSectionVariants } from '@patternfly/react-core';

import { Connector } from '@rhoas/connector-management-sdk';

export interface OverviewPageProps {
  connectorData: Connector;
}

export const OverviewPage: FC<OverviewPageProps> = ({ connectorData }) => {
  return (
    <PageSection variant={PageSectionVariants.light}>
      <ConnectorInfoTextList
        name={connectorData?.name}
        id={connectorData?.id!}
        type={connectorData?.connector_type_id}
        bootstrapServer={connectorData?.kafka?.url}
        kafkaId={connectorData?.kafka?.id}
        namespaceId={connectorData?.namespace_id!}
        owner={connectorData?.owner!}
        createdAt={new Date(connectorData?.created_at!)}
        modifiedAt={new Date(connectorData?.modified_at!)}
        error={connectorData?.status?.error}
      />
    </PageSection>
  );
};
