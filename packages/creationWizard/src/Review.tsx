import { PageSection, Text, TextArea } from '@patternfly/react-core';
import { useService } from '@xstate/react';
import React from 'react';
import { useCreationWizardMachineService } from '@cos-ui/machines';

export function Review() {
  const service = useCreationWizardMachineService();
  const [state] = useService(service);
  return (
    <PageSection variant="light">
      <Text component="h2">Please review the configuration data.</Text>
      <TextArea
        id="connector-configuration-review"
        value={JSON.stringify(state.context.connectorData)}
      />
    </PageSection>
  );
}
