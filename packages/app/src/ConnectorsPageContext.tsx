import React, { createContext, FunctionComponent, useContext } from 'react';
import { useInterpret } from '@xstate/react';
import {
  ConnectorsMachineInterpretType,
  makeConnectorsMachine,
} from '@cos-ui/machines';

const ConnectorsMachineServiceContext = createContext<ConnectorsMachineInterpretType | null>(
  null
);

export const useConnectorsMachineService = () => {
  const service = useContext(ConnectorsMachineServiceContext);
  if (!service) {
    throw new Error(
      `useConnectorsMachineService() must be used in a child of <ConnectorsMachineProvider>`
    );
  }
  return service;
};

type ConnectorsMachineProviderPropsType = {
  authToken?: Promise<string>;
  basePath?: string;
};

export const ConnectorsMachineProvider: FunctionComponent<ConnectorsMachineProviderPropsType> = ({
  children,
  authToken,
  basePath,
}) => {
  const service = useInterpret(makeConnectorsMachine({ authToken, basePath }), {
    devTools: true,
  });
  return (
    <ConnectorsMachineServiceContext.Provider value={service}>
      {children}
    </ConnectorsMachineServiceContext.Provider>
  );
};
