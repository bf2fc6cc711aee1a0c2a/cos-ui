import { PageSection, Text, TextArea } from '@patternfly/react-core';
import { useService } from '@xstate/react';
import React from 'react';
import { useCreationWizardMachineService } from './CreationWizardContext';

export function Review() {
  const service = useCreationWizardMachineService();
  const [state] = useService(service);
  return (
    <PageSection variant="light">
      <Text component="h2">Please review the configuration data.</Text>
      <TextArea>{JSON.stringify(state.context.connectorData)}</TextArea>
    </PageSection>
  );
}
