import React, {
  createContext,
  FunctionComponent,
  useCallback,
  useContext,
} from 'react';
import { useInterpret } from '@xstate/react';
import {
  configuratorLoaderMachine,
  ConnectorConfiguratorResponse,
  creationWizardMachine,
} from '@cos-ui/machines';
import { ConnectorType } from '@cos-ui/api';
import { InterpreterFrom } from '@cos-ui/utils';

type InterpretType = InterpreterFrom<typeof creationWizardMachine>;
type CreationWizardMachineServiceType = InterpretType | null;

const CreationWizardMachineService = createContext<
  CreationWizardMachineServiceType
>(null);

export const useCreationWizardMachineService = () => {
  const service = useContext(CreationWizardMachineService);
  if (!service) {
    throw new Error(
      `useCreationWizardMachineService() must be used in a child of <CreationWizardMachineProvider>`
    );
  }
  return service;
};

type CreationWizardMachineProviderPropsType = {
  authToken?: Promise<string>;
  basePath?: string;
  fetchConfigurator: (
    connector: ConnectorType
  ) => Promise<ConnectorConfiguratorResponse>;
};

export const CreationWizardMachineProvider: FunctionComponent<CreationWizardMachineProviderPropsType> = ({
  children,
  authToken,
  basePath,
  fetchConfigurator,
}) => {
  const makeConfiguratorLoaderMachine = useCallback(
    () =>
      configuratorLoaderMachine.withConfig({
        services: {
          fetchConfigurator: context => fetchConfigurator(context.connector),
        },
      }),
    [fetchConfigurator]
  );
  const service = useInterpret(
    creationWizardMachine,
    {
      devTools: true,
      context: {
        authToken,
        basePath,
      },
      services: {
        makeConfiguratorLoaderMachine,
      },
    }
    // state => {
    //   // subscribes to state changes
    //   console.log(state.value);
    // }
  );
  return (
    <CreationWizardMachineService.Provider value={service}>
      {children}
    </CreationWizardMachineService.Provider>
  );
};

// WARNING: from this line below is all placeholder code that will be removed

// const SampleMultiStepConfigurator: FunctionComponent<ConnectorConfiguratorProps> = props => (
//   <div>
//     <p>
//       Active step {props.activeStep} of {props.connector.id}
//     </p>
//     <button
//       onClick={() =>
//         props.onChange(
//           props.activeStep === 2 ? { foo: 'bar' } : undefined,
//           true
//         )
//       }
//     >
//       Set valid
//     </button>
//   </div>
// );
