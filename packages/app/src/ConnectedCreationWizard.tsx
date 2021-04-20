import React, { useContext } from 'react';
import {
  CreationWizard,
  CreationWizardMachineProvider,
} from '@kas-connectors/creation-wizard';
import { AuthContext } from './auth/AuthContext';
import { fetchConfigurator } from './FederatedConfigurator';

export const ConnectedCreationWizard = () => {
  const authContext = useContext(AuthContext);

  return (
    <CreationWizardMachineProvider
      authToken={
        authContext?.getToken ? authContext.getToken() : Promise.resolve('')
      }
      basePath={process.env.BASE_PATH}
      fetchConfigurator={connector =>
        fetchConfigurator(
          connector,
          process.env.FEDERATED_CONFIGURATORS_CONFIG_URL ||
            'federated-configurators.json'
        )
      }
    >
      <CreationWizard />
    </CreationWizardMachineProvider>
  );
};
