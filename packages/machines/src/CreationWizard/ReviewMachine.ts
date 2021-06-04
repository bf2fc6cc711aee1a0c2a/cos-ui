import { useSelector } from '@xstate/react';
import { useCallback } from 'react';
import {
  ActorRefFrom,
  assign,
  createMachine,
  createSchema,
  sendParent,
} from 'xstate';
import { createModel } from 'xstate/lib/model';
import { ConnectorType } from '@cos-ui/api';
import {
  createValidator,
  CreateValidatorType,
} from '@cos-ui/json-schema-configurator';

type Context = {
  connector: ConnectorType;
  initialData: unknown;
  dataString: string;
  error?: string;
  warnings?: string[];
  validator: CreateValidatorType;
};

const reviewMachineSchema = {
  context: createSchema<Context>(),
};

const reviewMachineModel = createModel(
  {
    connector: {
      id: 'something',
      name: 'something',
      version: '0.1',
      json_schema: {},
    },
    initialData: undefined,
    dataString: '',
    validator: createValidator({}),
  } as Context,
  {
    events: {
      change: ({ data }: { data: string }) => ({ data }),
      confirm: () => ({}),
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
        entry: 'verifyDataString',
        always: [
          { target: 'valid', cond: 'dataStringIsValid' },
          { target: 'reviewing' },
        ],
      },
      reviewing: {
        entry: sendParent('isInvalid'),
        on: {
          change: {
            target: 'verify',
            actions: 'change',
          },
        },
      },
      valid: {
        id: 'valid',
        entry: sendParent('isValid'),
        on: {
          change: {
            target: 'verify',
            actions: 'change',
          },
          confirm: 'configured',
        },
      },
      configured: {
        type: 'final',
        data: ({ dataString }) => ({ data: JSON.parse(dataString) }),
      },
    },
  },
  {
    actions: {
      initialize: assign(context => ({
        dataString: dataToPrettyString(context.initialData),
        validator: createValidator(context.connector.json_schema),
      })),
      change: assign((_, event) =>
        event.type === 'change'
          ? {
              dataString: event.data,
            }
          : {}
      ),
      verifyDataString: assign(context => {
        const { warnings, error } = verifyData(
          context.dataString,
          context.validator!
        );
        return { warnings, error };
      }),
    },
    guards: {
      dataStringIsValid: context =>
        context.dataString !== undefined && context.error === undefined,
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
  const { data, error, warnings } = useSelector(
    actor,
    useCallback(
      (state: typeof actor.state) => ({
        data: state.context.dataString,
        error: state.context.error,
        warnings: state.context.warnings,
      }),
      [actor]
    )
  );
  const onChange = useCallback(
    (data?: string) => {
      actor.send({ type: 'change', data: data || '' });
    },
    [actor]
  );
  return {
    data,
    error,
    warnings,
    onChange,
  };
};
