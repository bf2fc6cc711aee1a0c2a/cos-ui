import * as React from 'react';
import { useInterpret } from '@xstate/react';
import { Interpreter, StateMachine } from 'xstate';
import { creationWizardMachine } from '@kas-connectors/machines';

export type InterpreterFrom<
  T extends StateMachine<any, any, any, any>
> = T extends StateMachine<
  infer TContext,
  infer TStateSchema,
  infer TEvent,
  infer TTypestate
>
  ? Interpreter<TContext, TStateSchema, TEvent, TTypestate>
  : never;

type InterpretType = InterpreterFrom<typeof creationWizardMachine>;
type MachineServiceType = InterpretType | null;

const MachineService = React.createContext<MachineServiceType>(null);

export const useMachineService = () => {
  const service = React.useContext(MachineService);
  if (!service) {
    throw new Error(
      `useMachineService() must be used in a child of <MachineProvider>`
    );
  }
  return service;
};

type MachineProviderPropsType = {
  authToken: string;
  basePath: string;
};

export const MachineProvider: React.FunctionComponent<MachineProviderPropsType> = ({
  children,
  authToken,
  basePath,
}) => {
  const makeConfiguratorLoaderMachine = React.useCallback(
    () => Promise.resolve({ steps: false, Configurator: false }),
    []
  );
  const service = useInterpret(creationWizardMachine, {
    devTools: true,
    context: {
      authToken: Promise.resolve(authToken),
      basePath,
    },
    services: {
      makeConfiguratorLoaderMachine,
    },
  });
  return (
    <MachineService.Provider value={service}>
      {children}
    </MachineService.Provider>
  );
};
