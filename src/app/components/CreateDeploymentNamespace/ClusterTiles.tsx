// import {
//   // useNamespaceMachineIsReady, // useNamespaceMachine,
//   useCreateConnectorWizardService,
// } from '@app/components/CreateConnectorWizard/CreateConnectorWizardContext';
import { creationWizardMachine } from '@app/machines/CreateConnectorWizard.machine';
// import { clustersMachine } from '@app/machines/StepClusters.machine';
// import { ClustersMachineActorRef } from '@app/machines/StepClusters.machine';
// import { SelectCluster } from '@app/pages/CreateConnectorPage/StepClusters';
import React from 'react';

// import { useService, useActor } from '@xstate/react';
import { useMachine } from '@xstate/react';

// import { sendParent } from 'xstate';
import { Tile, Flex } from '@patternfly/react-core';

// import { useMachineService } from './Context';
// import { useClustersMachine } from '../CreateConnectorWizard/CreateConnectorWizardContext';

// export function ClusterTiles() {
//   const isReady = useNamespaceMachineIsReady();

//   return isReady ? <Tiles /> : null;
// }

export const ClusterTiles = () => {
  // const {
  //   response,
  //   // selectedId,
  //   // loading,
  //   // error,
  //   // noResults,
  //   // // results,
  //   // queryEmpty,
  //   // // queryResults,
  //   // firstRequest,
  //   // onSelect,
  //   // onQuery,
  // } = useNamespaceMachine();
  // const [state, send] = useActor(ClustersMachineActorRef);
  // const { response } = useClustersMachine();
  // const service = useCreateConnectorWizardService();
  const [current] = useMachine(creationWizardMachine);
  // React.useEffect(() => {
  //   send('api.ready');
  // }, [send]);

  console.log(current);
  // console.log(service);

  return (
    <div role="listbox" aria-label="Tiles with extra content">
      <Flex>
        <Flex flex={{ default: 'flex_1' }}>
          <Tile title="Default" isStacked isSelected={false}>
            This is really really long subtext that goes on for so long that it
            has to wrap to the next line. This is really really long subtext
            that goes on for so long that it has to wrap to the next line.
          </Tile>
        </Flex>
        <Flex flex={{ default: 'flex_1' }}>
          <Tile title="Selected" isStacked isSelected>
            This is really really long subtext that goes on for so long that it
            has to wrap to the next line. This is really really long subtext
            that goes on for so long that it has to wrap to the next line.
          </Tile>
        </Flex>
      </Flex>
    </div>
  );
};
