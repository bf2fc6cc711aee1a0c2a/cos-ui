import React, { FunctionComponent } from 'react';
import { useConfig } from '@bf2/ui-shared';
import { CreationWizard } from '@cos-ui/creation-wizard';
import { CreationWizardMachineProvider } from '@cos-ui/machines';
import { useAppContext } from '../AppContext';
import { fetchConfigurator } from '../FederatedConfigurator';
import { PageSection } from '@patternfly/react-core';

type CreateConnectorPageProps = {
  onSave: () => void;
  onClose: () => void;
};
export const CreateConnectorPage: FunctionComponent<CreateConnectorPageProps> = ({
  onSave,
  onClose,
}) => {
  const { cos } = useConfig();
  const { basePath, getToken } = useAppContext();
  return (
    <PageSection padding={{ default: 'noPadding' }}>
      <CreationWizardMachineProvider
        accessToken={getToken}
        basePath={basePath}
        fetchConfigurator={connector =>
          fetchConfigurator(connector, cos.configurators)
        }
        onSave={onSave}
      >
        <CreationWizard onClose={onClose} />
      </CreationWizardMachineProvider>
    </PageSection>
  );
};
