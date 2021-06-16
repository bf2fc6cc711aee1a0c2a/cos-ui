import {
  Configuration,
  Connector,
  ConnectorCluster,
  ConnectorsApi,
  ConnectorType,
  KafkaRequest,
} from '@cos-ui/api';
import {
  createValidator,
  CreateValidatorType,
} from '@cos-ui/json-schema-configurator';
import { useSelector } from '@xstate/react';
import axios from 'axios';
import { useCallback } from 'react';
import {
  ActorRefFrom,
  assign,
  createMachine,
  createSchema,
  Sender,
  sendParent,
} from 'xstate';
import { createModel } from 'xstate/lib/model';

type SaveConnectorProps = {
  accessToken?: Promise<string>;
  basePath?: string;

  kafka: KafkaRequest;
  cluster: ConnectorCluster;
  connectorType: ConnectorType;

  configuration: object;

  name: string;
  userServiceAccount?: ServiceAccount;
};
const saveConnector = ({
  accessToken,
  basePath,
  kafka,
  cluster,
  connectorType,
  configuration,
  name,
  userServiceAccount,
}: SaveConnectorProps) => {
  const apisService = new ConnectorsApi(
    new Configuration({
      accessToken,
      basePath,
    })
  );
  return (callback: Sender<any>) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const async = true;
    const connector: Connector = {
      kind: 'Connector',
      metadata: {
        name,
        kafka_id: kafka.id,
      },
      deployment_location: {
        kind: 'addon',
        cluster_id: cluster.id,
      },
      connector_type_id: connectorType.id,
      kafka: {
        bootstrap_server: kafka.bootstrap_server_host || 'demo',
        client_id: userServiceAccount?.clientId,
        client_secret: userServiceAccount?.clientSecret,
      },
      connector_spec: configuration,
    };
    apisService
      .createConnector(async, connector, {
        cancelToken: source.token,
      })
      .then(() => {
        callback({ type: 'success' });
      })
      .catch(error => {
        if (!axios.isCancel(error)) {
          callback({ type: 'failure', message: error.response.data.reason });
        }
      });
    return () => {
      source.cancel('Operation canceled by the user.');
    };
  };
};

type ServiceAccount = {
  clientId: string;
  clientSecret: string;
};

type Context = {
  accessToken?: Promise<string>;
  basePath?: string;

  kafka: KafkaRequest;
  cluster: ConnectorCluster;
  connectorType: ConnectorType;

  initialConfiguration: unknown;

  name: string;
  userServiceAccount?: ServiceAccount;
  configString: string;
  configStringError?: string;
  configStringWarnings?: string[];
  savingError?: string;
  validator: CreateValidatorType;
};

const reviewMachineSchema = {
  context: createSchema<Context>(),
};

const reviewMachineModel = createModel(
  {
    initialConfiguration: undefined,
    configString: '',
    name: '',
    validator: createValidator({}),
  } as Context,
  {
    events: {
      setName: (payload: { name: string }) => payload,
      setServiceAccount: (payload: {
        serviceAccount: ServiceAccount | undefined;
      }) => payload,
      updateConfiguration: (payload: { data: string }) => payload,
      save: () => ({}),
      success: () => ({}),
      failure: (payload: { message: string }) => payload,
    },
  }
);

export const reviewMachine = createMachine<typeof reviewMachineModel>(
  {
    schema: reviewMachineSchema,
    id: 'review',
    initial: 'verify',
    context: reviewMachineModel.initialContext,
    entry: 'initialize',
    states: {
      verify: {
        entry: 'verifyConfigString',
        always: [
          { target: 'valid', cond: 'isAllConfigured' },
          { target: 'reviewing' },
        ],
      },
      reviewing: {
        entry: sendParent('isInvalid'),
        on: {
          setName: {
            target: 'verify',
            actions: 'setName',
          },
          setServiceAccount: {
            target: 'verify',
            actions: 'setServiceAccount',
          },
          updateConfiguration: {
            target: 'verify',
            actions: 'updateConfiguration',
          },
        },
      },
      valid: {
        id: 'valid',
        entry: sendParent('isValid'),
        on: {
          setName: {
            target: 'verify',
            actions: 'setName',
          },
          setServiceAccount: {
            target: 'verify',
            actions: 'setServiceAccount',
          },
          updateConfiguration: {
            target: 'verify',
            actions: 'updateConfiguration',
          },
          save: 'saving',
        },
      },
      saving: {
        invoke: {
          src: context =>
            saveConnector({
              accessToken: context.accessToken,
              basePath: context.basePath,
              kafka: context.kafka,
              cluster: context.cluster,
              connectorType: context.connectorType,
              configuration: JSON.parse(context.configString),
              name: context.name,
              userServiceAccount: context.userServiceAccount,
            }),
        },
        on: {
          success: 'saved',
          failure: {
            target: 'valid',
            actions: 'setSavingError',
          },
        },
        tags: ['saving'],
      },
      saved: {
        type: 'final',
      },
    },
  },
  {
    actions: {
      initialize: assign(context => ({
        configString: dataToPrettyString(context.initialConfiguration),
        validator: createValidator(context.connectorType.json_schema),
      })),
      setName: assign((_, event) =>
        event.type === 'setName'
          ? {
              name: event.name,
            }
          : {}
      ),
      setServiceAccount: assign((_, event) =>
        event.type === 'setServiceAccount'
          ? {
              userServiceAccount: event.serviceAccount,
            }
          : {}
      ),
      updateConfiguration: assign((_, event) =>
        event.type === 'updateConfiguration'
          ? {
              configString: event.data,
            }
          : {}
      ),
      verifyConfigString: assign(context => {
        const { warnings, error } = verifyData(
          context.configString,
          context.validator!
        );
        return { configStringWarnings: warnings, configStringError: error };
      }),
      setSavingError: assign((_, event) => {
        if (event.type !== 'failure') return {};
        return {
          savingError: event.message,
        };
      }),
    },
    guards: {
      isAllConfigured: context =>
        context.configString !== undefined &&
        context.configStringError === undefined &&
        context.name.length > 0,
    },
  }
);

function dataToPrettyString(data: unknown) {
  try {
    return JSON.stringify(data, null, 2);
  } catch (e) {
    return '';
  }
}

function verifyData(
  data: string,
  validator: ReturnType<typeof createValidator>
) {
  try {
    const parsedData = JSON.parse(data);
    const validationResult = validator(parsedData);
    return {
      warnings: validationResult
        ? validationResult.details.map(d => `${d.instancePath} ${d.message}`)
        : undefined,
      error: undefined,
    };
  } catch (e) {
    return { warnings: undefined, error: `Invalid JSON: ${e.message}` };
  }
}

export type ReviewMachineActorRef = ActorRefFrom<typeof reviewMachine>;

export const useReviewMachine = (actor: ReviewMachineActorRef) => {
  const {
    name,
    serviceAccount,
    configString,
    configStringError,
    configStringWarnings,
    isSaving,
    savingError,
  } = useSelector(
    actor,
    useCallback(
      (state: typeof actor.state) => ({
        name: state.context.name,
        serviceAccount: state.context.userServiceAccount,
        configString: state.context.configString,
        configStringError: state.context.configStringError,
        configStringWarnings: state.context.configStringWarnings,
        isSaving: state.hasTag('saving'),
        savingError: state.context.savingError,
      }),
      [actor]
    )
  );
  const onSetName = useCallback(
    (name: string) => {
      actor.send({ type: 'setName', name });
    },
    [actor]
  );
  const onSetServiceAccount = useCallback(
    (serviceAccount: ServiceAccount | undefined) => {
      actor.send({ type: 'setServiceAccount', serviceAccount });
    },
    [actor]
  );
  const onUpdateConfiguration = useCallback(
    (data?: string) => {
      actor.send({ type: 'updateConfiguration', data: data || '' });
    },
    [actor]
  );
  return {
    name,
    serviceAccount,
    configString,
    configStringError,
    configStringWarnings,
    isSaving,
    savingError,
    onSetName,
    onSetServiceAccount,
    onUpdateConfiguration,
  };
};
